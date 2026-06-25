import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { jobRoutes } from './routes/jobs.js'
import { machineRoutes } from './routes/machines.js'
import { venueRoutes } from './routes/venues.js'
import { techRoutes } from './routes/technicians.js'

const app = express()

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/jobs',         jobRoutes)
app.use('/api/machines',     machineRoutes)
app.use('/api/venues',       venueRoutes)
app.use('/api/technicians',  techRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Server error' })
})

export default app
