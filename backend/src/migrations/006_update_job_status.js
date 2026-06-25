export const up = `
  ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'parts_delayed';
  ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'parts_arrived';
  ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'installing';
`
export const down = ``
