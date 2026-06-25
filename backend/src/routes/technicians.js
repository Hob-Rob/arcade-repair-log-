import { Router } from 'express'
import { query } from '../config/database.js'

export const techRoutes = Router()

techRoutes.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM technicians ORDER BY name')
    res.json(rows)
  } catch (err) { next(err) }
})
