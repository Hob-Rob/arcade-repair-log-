import { Router } from 'express'
import multer from 'multer'
import { query } from '../config/database.js'

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

export const jobRoutes = Router()

jobRoutes.get('/', async (req, res, next) => {
  try {
    const { venue_id, status, machine_id } = req.query
    const conditions = ['1=1']
    const params = []
    let i = 1
    if (venue_id)   { conditions.push(`j.venue_id = $${i++}`); params.push(venue_id) }
    if (status)     { conditions.push(`j.status = $${i++}::job_status`); params.push(status) }
    if (machine_id) { conditions.push(`j.machine_id = $${i++}`); params.push(machine_id) }

    const { rows } = await query(
      `SELECT j.*,
              m.name AS machine_name, m.manufacturer,
              v.name AS venue_name,
              t.name AS technician_name,
              EXTRACT(EPOCH FROM (COALESCE(j.resolved_at, NOW()) - j.created_at))/3600 AS hours_open
       FROM jobs j
       JOIN machines m ON m.id = j.machine_id
       JOIN venues v   ON v.id = j.venue_id
       LEFT JOIN technicians t ON t.id = j.technician_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY
         CASE j.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
         j.created_at DESC`,
      params
    )
    res.json(rows)
  } catch (err) { next(err) }
})

jobRoutes.get('/stats', async (req, res, next) => {
  try {
    const { venue_id } = req.query
    const params = venue_id ? [venue_id] : []
    const venueFilter = venue_id ? 'WHERE venue_id = $1' : ''
    const { rows } = await query(
      `SELECT
        COUNT(*) FILTER (WHERE status != 'resolved'::job_status) AS open_jobs,
        COUNT(*) FILTER (WHERE status = 'resolved'::job_status)  AS resolved_jobs,
        COUNT(*) FILTER (WHERE priority = 'critical'::job_priority AND status != 'resolved'::job_status) AS critical_open,
        COUNT(*) FILTER (WHERE is_self_fix = true) AS self_fixes,
        COUNT(*) FILTER (WHERE status = 'parts_delayed'::job_status) AS parts_delayed,
        ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL), 1) AS avg_resolution_hours
       FROM jobs ${venueFilter}`,
      params
    )
    res.json(rows[0])
  } catch (err) { next(err) }
})

jobRoutes.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT j.*,
              m.name AS machine_name, m.manufacturer, m.model, m.serial_number, m.location_in_venue,
              v.name AS venue_name,
              t.name AS technician_name, t.phone AS technician_phone, t.company AS technician_company,
              EXTRACT(EPOCH FROM (COALESCE(j.resolved_at, NOW()) - j.created_at))/3600 AS hours_open
       FROM jobs j
       JOIN machines m ON m.id = j.machine_id
       JOIN venues v   ON v.id = j.venue_id
       LEFT JOIN technicians t ON t.id = j.technician_id
       WHERE j.id = $1`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Job not found' })
    const notes = await query(
      'SELECT * FROM job_notes WHERE job_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    )
    res.json({ ...rows[0], notes: notes.rows })
  } catch (err) { next(err) }
})

jobRoutes.post('/', upload.array('photos', 5), async (req, res, next) => {
  try {
    const { venue_id, machine_id, reported_by, title, description, priority, is_self_fix, technician_id } = req.body
    const photo_urls = req.files?.map(f => `/uploads/${f.filename}`) || []
    const status = is_self_fix === 'true' ? 'self_fix' : 'reported'
    const { rows } = await query(
      `INSERT INTO jobs (venue_id, machine_id, reported_by, title, description, priority, is_self_fix, technician_id, status, photo_urls)
       VALUES ($1,$2,$3,$4,$5,$6::job_priority,$7,$8,$9::job_status,$10) RETURNING *`,
      [venue_id, machine_id, reported_by, title, description, priority || 'medium',
       is_self_fix === 'true', technician_id || null, status, photo_urls]
    )
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
})

jobRoutes.patch('/:id/status', async (req, res, next) => {
  try {
    const {
      status,
      // Parts ordered fields
      parts_name, parts_eta, parts_reference,
      // Parts delayed fields
      parts_delayed, delay_reason, new_eta,
      // Installing fields
      estimated_fix_hours,
      // Resolved fields
      actual_fix_hours, parts_used,
    } = req.body

    // Build metadata JSON to store stage-specific info
    const { rows: current } = await query('SELECT meta FROM jobs WHERE id = $1', [req.params.id])
    const existingMeta = current[0]?.meta || {}

    let meta = { ...existingMeta }

    if (status === 'parts_ordered') {
      meta.parts_ordered_at = new Date().toISOString()
      if (parts_name)      meta.parts_name = parts_name
      if (parts_eta)       meta.parts_eta = parts_eta
      if (parts_reference) meta.parts_reference = parts_reference
    }

    if (status === 'parts_delayed') {
      meta.delayed_at = new Date().toISOString()
      if (delay_reason) meta.delay_reason = delay_reason
      if (new_eta)      meta.new_eta = new_eta
    }

    if (status === 'parts_arrived') {
      meta.parts_arrived_at = new Date().toISOString()
    }

    if (status === 'installing') {
      meta.install_started_at = new Date().toISOString()
      if (estimated_fix_hours) meta.estimated_fix_hours = estimated_fix_hours
    }

    if (status === 'resolved') {
      if (actual_fix_hours) meta.actual_fix_hours = actual_fix_hours
      if (parts_used)       meta.parts_used = parts_used
    }

    const { rows } = await query(
      `UPDATE jobs SET
        status = $1::job_status,
        parts_used = CASE WHEN $2::text IS NOT NULL THEN $2 ELSE parts_used END,
        meta = $3,
        resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, parts_used || null, JSON.stringify(meta), req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Job not found' })
    res.json(rows[0])
  } catch (err) { next(err) }
})

jobRoutes.post('/:id/notes', async (req, res, next) => {
  try {
    const { author, body } = req.body
    const { rows } = await query(
      'INSERT INTO job_notes (job_id, author, body) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, author, body]
    )
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
})
