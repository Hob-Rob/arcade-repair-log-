import { Router } from 'express'
import { query } from '../config/database.js'

export const techRoutes = Router()

techRoutes.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM technicians ORDER BY name')
    res.json(rows)
  } catch (err) { next(err) }
})

techRoutes.post('/', async (req, res, next) => {
  try {
    const { name, company, phone, email, region } = req.body
    const { rows } = await query(
      'INSERT INTO technicians (name, company, phone, email, region) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, company, phone, email, region]
    )
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
})
