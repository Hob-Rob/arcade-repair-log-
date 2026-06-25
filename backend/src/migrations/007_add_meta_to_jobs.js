export const up = `
  ALTER TABLE jobs ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}';
`
export const down = `ALTER TABLE jobs DROP COLUMN IF EXISTS meta;`
