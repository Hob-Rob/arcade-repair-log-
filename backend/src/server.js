import 'dotenv/config'
import app from './app.js'
import { connectDB } from './config/database.js'
import { mkdirSync } from 'fs'

mkdirSync('uploads', { recursive: true })

const PORT = process.env.PORT || 3002

async function start() {
  try {
    await connectDB()
    console.log('PostgreSQL connected')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  } catch (err) {
    console.error('Failed to start:', err)
    process.exit(1)
  }
}
start()
