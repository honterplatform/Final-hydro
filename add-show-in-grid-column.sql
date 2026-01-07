-- Add show_in_grid column to control visibility in the rep grid
-- Reps will still appear on the map regardless of this setting

ALTER TABLE representatives 
ADD COLUMN IF NOT EXISTS show_in_grid BOOLEAN DEFAULT true;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'representatives' AND column_name = 'show_in_grid';

