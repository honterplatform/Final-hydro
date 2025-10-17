// API service - using Supabase with real-time updates
import { 
  getRepresentatives, 
  createRepresentative, 
  updateRepresentative, 
  deleteRepresentative, 
  resetRepresentatives,
  subscribeToRepresentatives 
} from './supabaseService.js';

// Get all representatives
export const getReps = async () => {
  try {
    return await getRepresentatives();
  } catch (error) {
    console.error('Supabase error, falling back to localStorage:', error);
    // Fallback to localStorage
    const localData = localStorage.getItem('representatives');
    if (localData) {
      return JSON.parse(localData);
    }
    // If no localStorage data, return original data
    const { reps } = await import('../data/reps.js');
    return reps;
  }
};

// Create new representative
export const createRep = async (repData) => {
  try {
    return await createRepresentative(repData);
  } catch (error) {
    console.error('Supabase error, falling back to localStorage:', error);
    // Fallback to localStorage
    const localData = localStorage.getItem('representatives');
    let reps = localData ? JSON.parse(localData) : [];
    
    // If no localStorage data, get original data first
    if (reps.length === 0) {
      const { reps: originalReps } = await import('../data/reps.js');
      reps = [...originalReps];
    }
    
    const newRep = { ...repData, id: Date.now() };
    reps.push(newRep);
    localStorage.setItem('representatives', JSON.stringify(reps));
    return newRep;
  }
};

// Update representative
export const updateRep = async (id, repData) => {
  try {
    return await updateRepresentative(id, repData);
  } catch (error) {
    console.error('Supabase error, falling back to localStorage:', error);
    // Fallback to localStorage
    const localData = localStorage.getItem('representatives');
    let reps = localData ? JSON.parse(localData) : [];
    
    // If no localStorage data, get original data first
    if (reps.length === 0) {
      const { reps: originalReps } = await import('../data/reps.js');
      reps = [...originalReps];
    }
    
    const index = reps.findIndex(rep => rep.id === id);
    if (index !== -1) {
      reps[index] = { ...reps[index], ...repData };
      localStorage.setItem('representatives', JSON.stringify(reps));
      return reps[index];
    }
    throw new Error('Representative not found');
  }
};

// Delete representative
export const deleteRep = async (id) => {
  try {
    return await deleteRepresentative(id);
  } catch (error) {
    console.error('Supabase error, falling back to localStorage:', error);
    // Fallback to localStorage
    const localData = localStorage.getItem('representatives');
    let reps = localData ? JSON.parse(localData) : [];
    
    // If no localStorage data, get original data first
    if (reps.length === 0) {
      const { reps: originalReps } = await import('../data/reps.js');
      reps = [...originalReps];
    }
    
    const index = reps.findIndex(rep => rep.id === id);
    if (index !== -1) {
      const deletedRep = reps[index];
      reps.splice(index, 1);
      localStorage.setItem('representatives', JSON.stringify(reps));
      return deletedRep;
    }
    throw new Error('Representative not found');
  }
};

// Reset to default data
export const resetReps = async () => {
  try {
    return await resetRepresentatives();
  } catch (error) {
    console.error('Supabase error, falling back to localStorage:', error);
    // Fallback to localStorage
    const { reps } = await import('../data/reps.js');
    localStorage.setItem('representatives', JSON.stringify(reps));
    return reps;
  }
};

// Restore original data (useful for debugging)
export const restoreOriginalData = async () => {
  const { reps } = await import('../data/reps.js');
  localStorage.setItem('representatives', JSON.stringify(reps));
  return reps;
};

// Real-time subscription for live updates (with polling fallback)
export const subscribeToRepsUpdates = async (callback) => {
  try {
    // Try real-time first
    const realtimeSubscription = subscribeToRepresentatives(callback);
    
    // Check if real-time subscription is working
    if (realtimeSubscription && realtimeSubscription.status !== 'TIMED_OUT') {
      return realtimeSubscription;
    }
  } catch (error) {
    console.log('🔄 Real-time failed, falling back to polling...', error);
  }
  
  // Fall back to polling
  const { default: pollingService } = await import('./pollingService.js');
  return pollingService.subscribe(callback);
};