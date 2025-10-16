// Service to manage representative data
// Uses API backend with fallback to localStorage

import { getReps as getRepsFromAPI, createRep, updateRep, deleteRep, resetReps as resetRepsFromAPI } from './apiService.js';
import { reps as originalReps } from '../data/reps.js';

// Get representatives from API
export const getReps = getRepsFromAPI;

// Save representatives (for backward compatibility)
export const saveReps = async (reps) => {
  // This function is kept for backward compatibility
  // In the new system, we use createRep, updateRep, deleteRep individually
  console.warn('saveReps is deprecated. Use createRep, updateRep, deleteRep instead.');
  return true;
};

// Reset representatives to original data
export const resetReps = resetRepsFromAPI;

// Export individual CRUD operations
export { createRep, updateRep, deleteRep };
