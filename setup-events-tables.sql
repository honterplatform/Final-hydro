-- ============================================================
-- EVENTS MODULE - Database Setup
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLE: events
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  capacity INTEGER,
  signup_enabled BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: event_signups
-- ============================================================
CREATE TABLE IF NOT EXISTS event_signups (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  signed_up_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_search ON events
  USING GIN(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));
CREATE INDEX IF NOT EXISTS idx_event_signups_event_id ON event_signups(event_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_signups_unique_email
  ON event_signups(event_id, email);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on events"
  ON events FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on event_signups"
  ON event_signups FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- PERMISSIONS
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON events TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE events_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE events_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON event_signups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_signups TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE event_signups_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE event_signups_id_seq TO authenticated;

-- ============================================================
-- TRIGGER: auto-update updated_at on events
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_signups;
