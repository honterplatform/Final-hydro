-- ============================================================
-- EVENT CATEGORIES TABLE
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS event_categories (
  id BIGSERIAL PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on event_categories"
  ON event_categories FOR ALL USING (true) WITH CHECK (true);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON event_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_categories TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE event_categories_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE event_categories_id_seq TO authenticated;

-- Seed default categories
INSERT INTO event_categories (value, label, sort_order) VALUES
  ('training', 'Training', 1),
  ('trade-show', 'Trade Show', 2),
  ('webinar', 'Webinar', 3),
  ('lunch-and-learn', 'Lunch & Learn', 4),
  ('conference', 'Conference', 5),
  ('general', 'General', 6)
ON CONFLICT (value) DO NOTHING;
