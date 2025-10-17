// API service - using Vercel Postgres database
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hydro-map-xi.vercel.app/api' 
  : 'https://hydro-map-xi.vercel.app/api'; // Use production API for development too

// Get all representatives
export const getReps = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reps`);
    if (!response.ok) {
      throw new Error('Failed to fetch representatives');
    }
    return await response.json();
  } catch (error) {
    console.error('API error, falling back to localStorage:', error);
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
    const response = await fetch(`${API_BASE_URL}/reps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(repData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create representative');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error, falling back to localStorage:', error);
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
    const response = await fetch(`${API_BASE_URL}/update-rep`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...repData }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update representative');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error, falling back to localStorage:', error);
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
    const response = await fetch(`${API_BASE_URL}/delete-rep`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete representative');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error, falling back to localStorage:', error);
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
    const response = await fetch(`${API_BASE_URL}/reps/reset`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset representatives');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error, falling back to localStorage:', error);
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