import { Router } from 'express'
import { query } from '../config/database.js'

export const venueRoutes = Router()

venueRoutes.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM venues ORDER BY name')
    res.json(rows)
  } catch (err) { next(err) }
})
