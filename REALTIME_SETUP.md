# Real-time Setup Guide

## ✅ What's Already Working

Your app now has a **hybrid storage system** that combines:
- **localStorage** for offline functionality
- **Supabase** for global real-time updates
- **Automatic sync** when coming back online

## 🔧 Environment Variables Needed

### For Real-time Updates (Frontend)
Create a `.env.local` file in your project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### For API Endpoints (Already Set in Vercel)
These are already configured in your Vercel deployment:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 How It Works

### 1. **Offline Mode**
- App works completely offline using localStorage
- Changes are saved locally and queued for sync
- Visual indicator shows sync status

### 2. **Online Mode**
- Real-time updates from Supabase
- Changes sync instantly across all devices
- Automatic conflict resolution

### 3. **Hybrid Mode**
- Best of both worlds
- Works offline, syncs when online
- No data loss

## 📱 Features Added

### Real-time Updates
- Changes made on one device appear instantly on all other devices
- No need to refresh the page
- Works across different browsers and locations

### Offline Support
- App works without internet connection
- Changes are saved locally
- Syncs automatically when connection is restored

### Sync Status Indicator
- Green dot: Synced and online
- Orange dot: Has pending changes to sync
- Red dot: Offline
- Shows last sync time

### Conflict Resolution
- Server data takes precedence for new records
- Local changes are preserved and synced when possible
- No data loss during conflicts

## 🧪 Testing

### Test Offline Mode
1. Open browser dev tools
2. Go to Network tab
3. Check "Offline" checkbox
4. Make changes in admin panel
5. See orange sync indicator
6. Go back online
7. See changes sync automatically

### Test Real-time Updates
1. Open app in two different browser windows
2. Make changes in one window
3. See changes appear instantly in the other window

## 🔍 Debugging

### Check Sync Status
```javascript
// In browser console
import { getSyncStatus } from './src/services/hybridStorageService.js';
console.log(getSyncStatus());
```

### View Offline Changes
```javascript
// In browser console
import { getOfflineChanges } from './src/services/hybridStorageService.js';
console.log(getOfflineChanges());
```

### Clear Offline Data
```javascript
// In browser console
localStorage.clear();
```

## 🎯 Next Steps

1. **Add your Supabase credentials** to `.env.local`
2. **Test offline functionality** by disconnecting internet
3. **Test real-time updates** with multiple browser windows
4. **Deploy to Vercel** to test global sync

Your app now works both locally and globally! 🌍
