// Service to share data via URL parameters
// This is a temporary solution for cross-browser data sharing

import { reps as originalReps } from '../data/reps.js';

// Get representatives from URL or localStorage
export const getReps = () => {
  try {
    // Check if there's data in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlData = urlParams.get('data');
    
    if (urlData) {
      const decodedData = decodeURIComponent(urlData);
      const parsedData = JSON.parse(decodedData);
      // Save to localStorage for this session
      localStorage.setItem('representatives', JSON.stringify(parsedData));
      return parsedData;
    }
    
    // Fallback to localStorage
    const localData = localStorage.getItem('representatives');
    if (localData) {
      return JSON.parse(localData);
    }
    
    // Fallback to original data
    return originalReps;
  } catch (error) {
    console.error('Error loading representatives:', error);
    return originalReps;
  }
};

// Save representatives to localStorage and update URL
export const saveReps = (reps) => {
  try {
    // Save to localStorage
    localStorage.setItem('representatives', JSON.stringify(reps));
    
    // Update URL with data (for sharing)
    const encodedData = encodeURIComponent(JSON.stringify(reps));
    const newUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
    
    // Update URL without page reload
    window.history.replaceState({}, '', newUrl);
    
    return true;
  } catch (error) {
    console.error('Error saving representatives:', error);
    return false;
  }
};

// Reset to original data
export const resetReps = () => {
  try {
    localStorage.removeItem('representatives');
    
    // Update URL to remove data parameter
    const newUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, '', newUrl);
    
    return true;
  } catch (error) {
    console.error('Error resetting representatives:', error);
    return false;
  }
};

// Generate shareable URL with current data
export const getShareableUrl = () => {
  try {
    const reps = getReps();
    const encodedData = encodeURIComponent(JSON.stringify(reps));
    return `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
  } catch (error) {
    console.error('Error generating shareable URL:', error);
    return window.location.href;
  }
};
