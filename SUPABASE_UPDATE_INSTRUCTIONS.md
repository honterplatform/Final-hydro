# Supabase Database Update Instructions

Follow these steps to update your Supabase database with the new fields and data.

## Step 1: Add New Columns to Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `iwduqebhrphrzuzrqnyv`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `add-new-columns.sql` and paste into the query editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see a success message and a list of all columns including the new ones:
   - `webhook`
   - `color`
   - `territory`
   - `region`

## Step 2: Populate Database with Current Data

Run the population script from your terminal:

```bash
node populate-database.js
```

This script will:
- ✅ Clear existing representatives
- ✅ Insert all current reps with the new fields
- ✅ Display a summary of inserted data

## Step 3: Verify Everything Works

1. **Refresh your browser** (the app should now load from Supabase)
2. **Check the console** - you should see: `✅ Loading from Supabase: X representatives`
3. **Test the map** - verify colors are showing correctly
4. **Test the admin panel**:
   - Try adding a new rep
   - Try editing an existing rep
   - Try deleting a rep
5. **Open another browser/device** - changes should sync in real-time!

## What's New

The database now includes:

- **webhook**: Zapier webhook URL for lead form submissions
- **color**: Territory color (hex code) for map visualization
- **territory**: Human-readable territory description
- **region**: For split states (e.g., "Northern" for California)

## Troubleshooting

### If you see errors:
1. Check that all columns were added in Step 1
2. Make sure your Supabase credentials are correct in the `.env` file
3. Verify Row Level Security policies allow insert/update/delete operations

### If changes don't sync:
1. Check the browser console for errors
2. Verify real-time is enabled in Supabase (Table Editor → Replication)
3. The app has a polling fallback that updates every 5 seconds

## Need Help?

Check the Supabase dashboard for any error messages or contact support.

