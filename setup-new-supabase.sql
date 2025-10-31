-- Create the representatives table with all necessary columns
CREATE TABLE IF NOT EXISTS representatives (
  id BIGSERIAL PRIMARY KEY,
  rep_name TEXT NOT NULL,
  states TEXT[] NOT NULL DEFAULT '{}',
  profile_image TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for anon and authenticated users
-- This is a permissive policy - adjust based on your security needs
CREATE POLICY "Allow all operations for anon and authenticated users" 
ON representatives
FOR ALL
USING (true)
WITH CHECK (true);

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE representatives;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON representatives TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON representatives TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE representatives_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE representatives_id_seq TO authenticated;

-- Create an index on states for faster queries
CREATE INDEX IF NOT EXISTS idx_representatives_states ON representatives USING GIN(states);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_representatives_updated_at 
  BEFORE UPDATE ON representatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

