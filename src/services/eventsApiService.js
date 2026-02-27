import {
  getEvents,
  getPublishedEvents,
  getEventById,
  searchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getSignupsForEvent,
  getAllSignups,
  getSignupCount,
  getAllSignupCounts,
  createSignup,
  deleteSignup,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  subscribeToEvents,
  subscribeToEventSignups,
} from './eventsSupabaseService.js';
import DEFAULT_CATEGORIES from '../data/eventCategories.js';

// ============================================================
// EVENTS API
// ============================================================

export const fetchEvents = async () => {
  try {
    return await getEvents();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const fetchPublishedEvents = async () => {
  try {
    return await getPublishedEvents();
  } catch (error) {
    console.error('Error fetching published events:', error);
    return [];
  }
};

export const fetchEventById = async (id) => {
  try {
    return await getEventById(id);
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

export const fetchSearchEvents = async (query, publishedOnly = true) => {
  try {
    return await searchEvents(query, publishedOnly);
  } catch (error) {
    console.error('Error searching events:', error);
    return [];
  }
};

export const addEvent = async (eventData) => {
  try {
    return await createEvent(eventData);
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const editEvent = async (id, eventData) => {
  try {
    return await updateEvent(id, eventData);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const removeEvent = async (id) => {
  try {
    return await deleteEvent(id);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// ============================================================
// SIGNUPS API
// ============================================================

export const fetchSignupsForEvent = async (eventId) => {
  try {
    return await getSignupsForEvent(eventId);
  } catch (error) {
    console.error('Error fetching signups:', error);
    return [];
  }
};

export const fetchAllSignups = async () => {
  try {
    return await getAllSignups();
  } catch (error) {
    console.error('Error fetching all signups:', error);
    return [];
  }
};

export const fetchSignupCount = async (eventId) => {
  try {
    return await getSignupCount(eventId);
  } catch (error) {
    console.error('Error fetching signup count:', error);
    return 0;
  }
};

export const fetchAllSignupCounts = async () => {
  try {
    return await getAllSignupCounts();
  } catch (error) {
    console.error('Error fetching all signup counts:', error);
    return {};
  }
};

export const addSignup = async (signupData) => {
  try {
    return await createSignup(signupData);
  } catch (error) {
    throw error;
  }
};

export const removeSignup = async (id) => {
  try {
    return await deleteSignup(id);
  } catch (error) {
    throw error;
  }
};

// ============================================================
// CATEGORIES API
// ============================================================

export const fetchCategories = async () => {
  try {
    const data = await getCategories();
    if (data.length > 0) return data;
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Error fetching categories, using defaults:', error);
    return DEFAULT_CATEGORIES;
  }
};

export const addCategory = async (categoryData) => {
  try {
    return await createCategory(categoryData);
  } catch (error) {
    throw error;
  }
};

export const editCategory = async (id, categoryData) => {
  try {
    return await updateCategory(id, categoryData);
  } catch (error) {
    throw error;
  }
};

export const removeCategory = async (id) => {
  try {
    return await deleteCategory(id);
  } catch (error) {
    throw error;
  }
};

// ============================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================

export const subscribeToEventsUpdates = async (callback) => {
  try {
    const subscription = subscribeToEvents(callback);
    if (subscription && subscription.status !== 'TIMED_OUT') {
      return subscription;
    }
  } catch (error) {
    console.log('Events real-time failed, falling back to polling...', error);
  }
  const { default: eventsPollingService } = await import('./eventsPollingService.js');
  return eventsPollingService.subscribeEvents(callback);
};

export const subscribeToSignupsUpdates = async (callback) => {
  try {
    const subscription = subscribeToEventSignups(callback);
    if (subscription && subscription.status !== 'TIMED_OUT') {
      return subscription;
    }
  } catch (error) {
    console.log('Signups real-time failed, falling back to polling...', error);
  }
  const { default: eventsPollingService } = await import('./eventsPollingService.js');
  return eventsPollingService.subscribeSignups(callback);
};
