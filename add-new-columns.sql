-- Add new columns to the representatives table

-- Add webhook column (for Zapier integration)
ALTER TABLE representatives 
ADD COLUMN IF NOT EXISTS webhook TEXT;

-- Add color column (for territory color coding on map)
ALTER TABLE representatives 
ADD COLUMN IF NOT EXISTS color TEXT;

-- Add territory column (human-readable territory description)
ALTER TABLE representatives 
ADD COLUMN IF NOT EXISTS territory TEXT;

-- Add region column (for states that are split into regions, e.g., "Northern" for CA)
ALTER TABLE representatives 
ADD COLUMN IF NOT EXISTS region TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'representatives'
ORDER BY ordinal_position;

