import { Router } from 'express'
import { query } from '../config/database.js'

export const venueRoutes = Router()

venueRoutes.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM venues ORDER BY name')
    res.json(rows)
  } catch (err) { next(err) }
})

venueRoutes.post('/', async (req, res, next) => {
  try {
    const { name, location } = req.body
    const { rows } = await query(
      'INSERT INTO venues (name, location) VALUES ($1, $2) RETURNING *',
      [name, location]
    )
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
})
