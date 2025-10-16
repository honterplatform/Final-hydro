// API service - temporarily using localStorage only
// Get all representatives
export const getReps = async () => {
  // Use localStorage for now
  const localData = localStorage.getItem('representatives');
  if (localData) {
    return JSON.parse(localData);
  }
  // If no localStorage data, return original data
  const { reps } = await import('../data/reps.js');
  return reps;
};

// Create new representative
export const createRep = async (repData) => {
  // Use localStorage for now
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
};

// Update representative
export const updateRep = async (id, repData) => {
  // Use localStorage for now
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
};

// Delete representative
export const deleteRep = async (id) => {
  // Use localStorage for now
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
};

// Reset to default data
export const resetReps = async () => {
  // Use localStorage for now
  const { reps } = await import('../data/reps.js');
  localStorage.setItem('representatives', JSON.stringify(reps));
  return reps;
};

// Restore original data (useful for debugging)
export const restoreOriginalData = async () => {
  const { reps } = await import('../data/reps.js');
  localStorage.setItem('representatives', JSON.stringify(reps));
  return reps;
};