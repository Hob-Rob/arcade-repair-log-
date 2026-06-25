export const up = `
  CREATE TABLE technicians (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT NOT NULL,
    company    TEXT NOT NULL,
    phone      TEXT,
    email      TEXT,
    region     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`
export const down = `DROP TABLE IF EXISTS technicians;`
