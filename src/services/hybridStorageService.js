// Hybrid storage service - combines localStorage with real-time Supabase updates
import { createClient } from '@supabase/supabase-js';

// Supabase configuration (these should be set in your environment)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client for real-time updates
const supabase = createClient(supabaseUrl, supabaseKey);

// Storage keys
const STORAGE_KEYS = {
  REPS: 'representatives',
  LAST_SYNC: 'last_sync_timestamp',
  OFFLINE_CHANGES: 'offline_changes'
};

// Event listeners for real-time updates
let realtimeSubscription = null;
let updateCallbacks = [];

// Initialize hybrid storage
export const initializeHybridStorage = () => {
  // Set up real-time subscription for global updates
  setupRealtimeSubscription();
  
  // Sync data on initialization
  syncWithServer();
  
  // Set up periodic sync (every 30 seconds)
  setInterval(syncWithServer, 30000);
  
  // Sync when coming back online
  window.addEventListener('online', syncWithServer);
};

// Set up real-time subscription to Supabase
const setupRealtimeSubscription = () => {
  if (realtimeSubscription) {
    realtimeSubscription.unsubscribe();
  }

  realtimeSubscription = supabase
    .channel('representatives_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'representatives' 
      }, 
      (payload) => {
        console.log('Real-time update received:', payload);
        handleRealtimeUpdate(payload);
      }
    )
    .subscribe();
};

// Handle real-time updates from Supabase
const handleRealtimeUpdate = (payload) => {
  const currentData = getLocalData();
  
  switch (payload.eventType) {
    case 'INSERT':
      // Add new representative
      currentData.push(payload.new);
      break;
    case 'UPDATE':
      // Update existing representative
      const updateIndex = currentData.findIndex(rep => rep.id === payload.new.id);
      if (updateIndex !== -1) {
        currentData[updateIndex] = payload.new;
      }
      break;
    case 'DELETE':
      // Remove representative
      const deleteIndex = currentData.findIndex(rep => rep.id === payload.old.id);
      if (deleteIndex !== -1) {
        currentData.splice(deleteIndex, 1);
      }
      break;
  }
  
  // Update localStorage
  setLocalData(currentData);
  
  // Notify all subscribers
  notifyUpdateCallbacks(currentData);
};

// Get data from localStorage
const getLocalData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REPS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

// Set data to localStorage
const setLocalData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REPS, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

// Sync with server (fetch latest data)
export const syncWithServer = async () => {
  try {
    console.log('Syncing with server...');
    const response = await fetch('https://final-hydro.vercel.app/api/reps');
    
    if (response.ok) {
      const serverData = await response.json();
      const localData = getLocalData();
      
      // Check if server data is newer
      const serverTimestamp = new Date().toISOString();
      const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      
      // If we have local changes, we might want to merge them
      const hasLocalChanges = localStorage.getItem(STORAGE_KEYS.OFFLINE_CHANGES);
      
      if (!hasLocalChanges || serverData.length > localData.length) {
        // Server has more recent data, update local storage
        setLocalData(serverData);
        notifyUpdateCallbacks(serverData);
        console.log('✅ Synced with server data');
      }
    }
  } catch (error) {
    console.log('⚠️ Sync failed, using local data:', error.message);
  }
};

// Get representatives (with fallback chain)
export const getReps = async () => {
  // First try to get from localStorage
  let data = getLocalData();
  
  // If no local data, try to fetch from server
  if (data.length === 0) {
    try {
      const response = await fetch('https://final-hydro.vercel.app/api/reps');
      if (response.ok) {
        data = await response.json();
        setLocalData(data);
      }
    } catch (error) {
      console.log('Server fetch failed, trying original data');
      // Fallback to original data
      const { reps } = await import('../data/reps.js');
      data = reps;
      setLocalData(data);
    }
  }
  
  return data;
};

// Create new representative
export const createRep = async (repData) => {
  try {
    // Try to save to server first
    const response = await fetch('https://final-hydro.vercel.app/api/reps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(repData),
    });
    
    if (response.ok) {
      const newRep = await response.json();
      // Real-time subscription will handle updating localStorage
      return newRep;
    } else {
      throw new Error('Server save failed');
    }
  } catch (error) {
    console.log('Server save failed, saving locally:', error.message);
    // Save locally and mark for sync later
    const localData = getLocalData();
    const newRep = { ...repData, id: Date.now(), created_at: new Date().toISOString() };
    localData.push(newRep);
    setLocalData(localData);
    
    // Mark as offline change
    const offlineChanges = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_CHANGES) || '[]');
    offlineChanges.push({ type: 'CREATE', data: newRep, timestamp: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.OFFLINE_CHANGES, JSON.stringify(offlineChanges));
    
    notifyUpdateCallbacks(localData);
    return newRep;
  }
};

// Update representative
export const updateRep = async (id, repData) => {
  try {
    // Try to update on server first
    const response = await fetch(`https://final-hydro.vercel.app/api/reps/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(repData),
    });
    
    if (response.ok) {
      const updatedRep = await response.json();
      // Real-time subscription will handle updating localStorage
      return updatedRep;
    } else {
      throw new Error('Server update failed');
    }
  } catch (error) {
    console.log('Server update failed, updating locally:', error.message);
    // Update locally
    const localData = getLocalData();
    const index = localData.findIndex(rep => rep.id === id);
    
    if (index !== -1) {
      localData[index] = { ...localData[index], ...repData, updated_at: new Date().toISOString() };
      setLocalData(localData);
      
      // Mark as offline change
      const offlineChanges = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_CHANGES) || '[]');
      offlineChanges.push({ type: 'UPDATE', id, data: repData, timestamp: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEYS.OFFLINE_CHANGES, JSON.stringify(offlineChanges));
      
      notifyUpdateCallbacks(localData);
      return localData[index];
    }
    
    throw new Error('Representative not found');
  }
};

// Delete representative
export const deleteRep = async (id) => {
  try {
    // Try to delete on server first
    const response = await fetch(`https://final-hydro.vercel.app/api/reps/${id}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      // Real-time subscription will handle updating localStorage
      return true;
    } else {
      throw new Error('Server delete failed');
    }
  } catch (error) {
    console.log('Server delete failed, deleting locally:', error.message);
    // Delete locally
    const localData = getLocalData();
    const index = localData.findIndex(rep => rep.id === id);
    
    if (index !== -1) {
      const deletedRep = localData[index];
      localData.splice(index, 1);
      setLocalData(localData);
      
      // Mark as offline change
      const offlineChanges = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_CHANGES) || '[]');
      offlineChanges.push({ type: 'DELETE', id, data: deletedRep, timestamp: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEYS.OFFLINE_CHANGES, JSON.stringify(offlineChanges));
      
      notifyUpdateCallbacks(localData);
      return true;
    }
    
    throw new Error('Representative not found');
  }
};

// Subscribe to data updates
export const subscribeToUpdates = (callback) => {
  updateCallbacks.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = updateCallbacks.indexOf(callback);
    if (index > -1) {
      updateCallbacks.splice(index, 1);
    }
  };
};

// Notify all subscribers of data changes
const notifyUpdateCallbacks = (data) => {
  updateCallbacks.forEach(callback => {
    try {
      callback(data);
    } catch (error) {
      console.error('Error in update callback:', error);
    }
  });
};

// Get offline changes (for debugging)
export const getOfflineChanges = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_CHANGES) || '[]');
};

// Clear offline changes
export const clearOfflineChanges = () => {
  localStorage.removeItem(STORAGE_KEYS.OFFLINE_CHANGES);
};

// Check if we're online
export const isOnline = () => {
  return navigator.onLine;
};

// Get sync status
export const getSyncStatus = () => {
  const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  const offlineChanges = getOfflineChanges();
  
  return {
    lastSync: lastSync ? new Date(lastSync) : null,
    hasOfflineChanges: offlineChanges.length > 0,
    offlineChangesCount: offlineChanges.length,
    isOnline: isOnline()
  };
};
