import 'dotenv/config'
import pg from 'pg'
import { readdir } from 'fs/promises'
import { pathToFileURL } from 'url'
import path from 'path'

const { Pool } = pg

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host:     process.env.DB_HOST || 'localhost',
      port:     Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'arcade_repair',
      user:     process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'changeme',
    })

async function run() {
  const client = await pool.connect()
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id       SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      ran_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  const { rows } = await client.query('SELECT filename FROM _migrations')
  const done = new Set(rows.map(r => r.filename))
  const dir = path.dirname(new URL(import.meta.url).pathname)
  const files = (await readdir(dir))
    .filter(f => f.match(/^\d+_.+\.js$/) && f !== 'run.js')
    .sort()

  let ran = 0
  for (const file of files) {
    if (done.has(file)) { console.log(`  skip  ${file}`); continue }
    const mod = await import(pathToFileURL(path.join(dir, file)).href)
    console.log(`  run   ${file}`)
    await client.query('BEGIN')
    try {
      await client.query(mod.up)
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
      await client.query('COMMIT')
      ran++
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`  FAIL  ${file}:`, err.message)
      process.exit(1)
    }
  }
  console.log(`\nDone — ${ran} migration(s) ran`)
  client.release()
  await pool.end()
}
run()
