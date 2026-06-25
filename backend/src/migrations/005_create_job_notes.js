export const up = `
  CREATE TABLE job_notes (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    author     TEXT NOT NULL,
    body       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX job_notes_job_id_idx ON job_notes(job_id);
`
export const down = `DROP TABLE IF EXISTS job_notes;`
