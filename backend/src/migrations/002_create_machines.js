export const up = `
  CREATE TABLE machines (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id          UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    manufacturer      TEXT,
    model             TEXT,
    serial_number     TEXT,
    location_in_venue TEXT,
    active            BOOLEAN NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX machines_venue_id_idx ON machines(venue_id);
`
export const down = `DROP TABLE IF EXISTS machines;`
