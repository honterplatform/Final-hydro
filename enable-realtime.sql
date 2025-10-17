-- Enable real-time for the representatives table
-- Run this in your Supabase SQL Editor

-- First, let's check if the table exists and its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'representatives' 
AND table_schema = 'public';

-- Enable real-time for the representatives table
ALTER PUBLICATION supabase_realtime ADD TABLE representatives;

-- If the above doesn't work, try this alternative approach:
-- Create a publication if it doesn't exist
CREATE PUBLICATION supabase_realtime FOR TABLE representatives;

-- Grant necessary permissions
GRANT SELECT ON representatives TO anon;
GRANT SELECT ON representatives TO authenticated;

-- Enable row level security (RLS) if needed
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
CREATE POLICY "Enable all operations for representatives" ON representatives
FOR ALL USING (true);

-- Check if real-time is enabled
SELECT schemaname, tablename, hasindexes, hasrules, hastriggers 
FROM pg_tables 
WHERE tablename = 'representatives';

-- Verify the publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
