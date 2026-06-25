import pg from 'pg'
const { Pool } = pg

let pool

export async function connectDB() {
  // Railway provides DATABASE_URL as a single connection string
  // Fall back to individual vars for local development
  const connectionConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host:     process.env.DB_HOST || 'localhost',
        port:     Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'arcade_repair',
        user:     process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'changeme',
      }

  pool = new Pool(connectionConfig)
  const client = await pool.connect()
  client.release()
  return pool
}

export function query(text, params) {
  if (!pool) throw new Error('DB not initialised')
  return pool.query(text, params)
}
