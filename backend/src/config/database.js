import pg from 'pg'
const { Pool } = pg

let pool

export async function connectDB() {
  pool = new Pool({
    host:     process.env.DB_HOST || 'localhost',
    port:     Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'arcade_repair',
    user:     process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'changeme',
  })
  const client = await pool.connect()
  client.release()
  return pool
}

export function query(text, params) {
  if (!pool) throw new Error('DB not initialised')
  return pool.query(text, params)
}
