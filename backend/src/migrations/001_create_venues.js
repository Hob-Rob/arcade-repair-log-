export const up = `
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  CREATE TABLE venues (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT NOT NULL,
    location   TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`
export const down = `DROP TABLE IF EXISTS venues;`
