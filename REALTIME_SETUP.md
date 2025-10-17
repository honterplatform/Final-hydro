# Real-time Updates Setup

This application now supports real-time updates across all users using Supabase real-time subscriptions.

## How It Works

When any user adds, updates, or deletes a representative:
1. The change is saved to the Supabase database
2. Supabase sends a real-time event to all connected clients
3. All users' browsers automatically refresh to show the latest data
4. No page refresh needed - updates appear instantly!

## Setup Requirements

1. **Supabase Project**: You need a Supabase project with the `representatives` table
2. **Environment Variables**: Set up the required environment variables (see SUPABASE_SETUP.md)
3. **Real-time Enabled**: Enable real-time for the `representatives` table in Supabase

## Testing Real-time Updates

1. Open the application in two different browser windows/tabs
2. In one window, go to the admin panel and add/edit a representative
3. Watch the other window automatically update without refreshing!

## Files Modified

- `src/services/supabaseService.js` - New Supabase client and real-time subscriptions
- `src/services/apiService.js` - Updated to use Supabase instead of local server
- `src/components/InteractiveUSMap.jsx` - Added real-time subscription listener
- `src/components/AdminPanel.jsx` - Added real-time subscription listener

## Fallback Behavior

If Supabase is not available or configured, the application will fall back to:
1. localStorage for data persistence
2. Original static data from `src/data/reps.js`

This ensures the application works even without Supabase setup.
