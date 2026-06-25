export const up = `
  CREATE TYPE job_status AS ENUM (
    'reported',
    'self_fix',
    'sega_job',
    'in_progress',
    'parts_ordered',
    'resolved'
  );

  CREATE TYPE job_priority AS ENUM ('low', 'medium', 'high', 'critical');

  CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id        UUID NOT NULL REFERENCES venues(id),
    machine_id      UUID NOT NULL REFERENCES machines(id),
    technician_id   UUID REFERENCES technicians(id),
    reported_by     TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    status          job_status NOT NULL DEFAULT 'reported',
    priority        job_priority NOT NULL DEFAULT 'medium',
    is_self_fix     BOOLEAN NOT NULL DEFAULT false,
    parts_used      TEXT,
    time_spent_mins INTEGER,
    photo_urls      TEXT[],
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX jobs_venue_id_idx     ON jobs(venue_id);
  CREATE INDEX jobs_machine_id_idx   ON jobs(machine_id);
  CREATE INDEX jobs_status_idx       ON jobs(status);
  CREATE INDEX jobs_created_at_idx   ON jobs(created_at DESC);
`
export const down = `
  DROP TABLE IF EXISTS jobs;
  DROP TYPE IF EXISTS job_status;
  DROP TYPE IF EXISTS job_priority;
`
