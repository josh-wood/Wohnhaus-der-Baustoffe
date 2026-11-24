-- Bookings and settings for the "Probewohnen" campaign (see TECH_STACK.md §5)
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE bookings (
  id          bigserial PRIMARY KEY,
  window_id   smallint    NOT NULL CHECK (window_id BETWEEN 1 AND 6),
  start_date  date        NOT NULL,
  end_date    date        NOT NULL,
  email       text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookings_range_order  CHECK (end_date >= start_date),
  CONSTRAINT bookings_in_campaign  CHECK (start_date >= DATE '2026-12-01' AND end_date <= DATE '2027-07-31'),
  -- Prevents overlapping (inclusive) date ranges for the same window; violation = SQLSTATE 23P01
  CONSTRAINT bookings_no_overlap
    EXCLUDE USING gist (window_id WITH =, daterange(start_date, end_date, '[]') WITH &&)
);

CREATE INDEX bookings_created_at_idx ON bookings (created_at DESC);

CREATE TABLE settings (
  key   text PRIMARY KEY,
  value text NOT NULL
);

INSERT INTO settings (key, value) VALUES
  ('campaign_closed', 'false'),
  ('end_text', '')
ON CONFLICT DO NOTHING;
