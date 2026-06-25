import { Router } from 'express'
import { query } from '../config/database.js'

export const machineRoutes = Router()

machineRoutes.get('/', async (req, res, next) => {
  try {
    const { venue_id } = req.query
    const { rows } = await query(
      `SELECT m.*, v.name AS venue_name
       FROM machines m
       JOIN venues v ON v.id = m.venue_id
       WHERE m.active = true ${venue_id ? 'AND m.venue_id = $1' : ''}
       ORDER BY m.name`,
      venue_id ? [venue_id] : []
    )
    res.json(rows)
  } catch (err) { next(err) }
})

machineRoutes.post('/', async (req, res, next) => {
  try {
    const { venue_id, name, manufacturer, model, serial_number, location_in_venue } = req.body
    const { rows } = await query(
      `INSERT INTO machines (venue_id, name, manufacturer, model, serial_number, location_in_venue)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [venue_id, name, manufacturer, model, serial_number, location_in_venue]
    )
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
})
