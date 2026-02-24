import { supabase } from './supabaseService.js';

// DB (snake_case) -> JS (camelCase)
const transformEventFromDB = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  coverImage: row.cover_image,
  eventDate: row.event_date,
  eventTime: row.event_time,
  location: row.location,
  category: row.category,
  capacity: row.capacity,
  signupEnabled: row.signup_enabled,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// JS (camelCase) -> DB (snake_case)
const transformEventToDB = (data) => ({
  title: data.title,
  description: data.description || null,
  cover_image: data.coverImage || null,
  event_date: data.eventDate,
  event_time: data.eventTime || null,
  location: data.location || null,
  category: data.category || 'general',
  capacity: data.capacity || null,
  signup_enabled: data.signupEnabled !== undefined ? data.signupEnabled : true,
  status: data.status || 'draft',
});

const transformSignupFromDB = (row) => ({
  id: row.id,
  eventId: row.event_id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  phone: row.phone,
  signedUpAt: row.signed_up_at,
});

const transformSignupToDB = (data) => ({
  event_id: data.eventId,
  first_name: data.firstName,
  last_name: data.lastName,
  email: data.email,
  phone: data.phone || null,
});

// ============================================================
// EVENTS CRUD
// ============================================================

export const getEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    if (error) throw error;
    return (data || []).map(transformEventFromDB);
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const getPublishedEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true });
    if (error) throw error;
    return (data || []).map(transformEventFromDB);
  } catch (error) {
    console.error('Error fetching published events:', error);
    throw error;
  }
};

export const getEventById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return transformEventFromDB(data);
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

export const searchEvents = async (query, publishedOnly = true) => {
  try {
    let q = supabase
      .from('events')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('event_date', { ascending: true });
    if (publishedOnly) {
      q = q.eq('status', 'published');
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(transformEventFromDB);
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([transformEventToDB(eventData)])
      .select()
      .single();
    if (error) throw error;
    return transformEventFromDB(data);
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(transformEventToDB(eventData))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return transformEventFromDB(data);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return transformEventFromDB(data);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// ============================================================
// EVENT SIGNUPS
// ============================================================

export const getSignupsForEvent = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('event_signups')
      .select('*')
      .eq('event_id', eventId)
      .order('signed_up_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(transformSignupFromDB);
  } catch (error) {
    console.error('Error fetching signups:', error);
    throw error;
  }
};

export const getAllSignups = async () => {
  try {
    const { data, error } = await supabase
      .from('event_signups')
      .select('*')
      .order('signed_up_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(transformSignupFromDB);
  } catch (error) {
    console.error('Error fetching all signups:', error);
    throw error;
  }
};

export const getSignupCount = async (eventId) => {
  try {
    const { count, error } = await supabase
      .from('event_signups')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting signup count:', error);
    throw error;
  }
};

export const createSignup = async (signupData) => {
  try {
    const { data, error } = await supabase
      .from('event_signups')
      .insert([transformSignupToDB(signupData)])
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        throw new Error('You have already signed up for this event.');
      }
      throw error;
    }
    return transformSignupFromDB(data);
  } catch (error) {
    console.error('Error creating signup:', error);
    throw error;
  }
};

export const deleteSignup = async (id) => {
  try {
    const { data, error } = await supabase
      .from('event_signups')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return transformSignupFromDB(data);
  } catch (error) {
    console.error('Error deleting signup:', error);
    throw error;
  }
};

// ============================================================
// EVENT CATEGORIES
// ============================================================

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      value: row.value,
      label: row.label,
      sortOrder: row.sort_order,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const { data, error } = await supabase
      .from('event_categories')
      .insert([{
        value: categoryData.value,
        label: categoryData.label,
        sort_order: categoryData.sortOrder || 0,
      }])
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, value: data.value, label: data.label, sortOrder: data.sort_order };
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const { data, error } = await supabase
      .from('event_categories')
      .update({
        value: categoryData.value,
        label: categoryData.label,
        sort_order: categoryData.sortOrder || 0,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, value: data.value, label: data.label, sortOrder: data.sort_order };
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const { error } = await supabase
      .from('event_categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// ============================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================

export const subscribeToEvents = (callback) => {
  const subscription = supabase
    .channel('events-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events' },
      (payload) => {
        console.log('Events real-time update:', payload);
        callback(payload);
      }
    )
    .subscribe();
  return subscription;
};

export const subscribeToEventSignups = (callback) => {
  const subscription = supabase
    .channel('event-signups-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'event_signups' },
      (payload) => {
        console.log('Event signups real-time update:', payload);
        callback(payload);
      }
    )
    .subscribe();
  return subscription;
};
