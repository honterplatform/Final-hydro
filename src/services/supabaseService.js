import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qaxjziqgzckyidmvobev.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFheGp6aXFnemNreWlkbXZvYmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzI2MjIsImV4cCI6MjA3NjIwODYyMn0.87VwhwJLFuZPwaRP2O-4XA4xozlX1FErTg08aP7SsJE';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Real-time subscription for representatives table
export const subscribeToRepresentatives = (callback) => {
  const subscription = supabase
    .channel('representatives-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'representatives'
      },
      (payload) => {
        console.log('Real-time update received:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

// Get all representatives
export const getRepresentatives = async () => {
  try {
    const { data, error } = await supabase
      .from('representatives')
      .select('*')
      .order('id');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching representatives:', error);
    throw error;
  }
};

// Create new representative
export const createRepresentative = async (repData) => {
  try {
    // Transform camelCase to snake_case for Supabase
    const transformedData = {
      rep_name: repData.rep || repData.rep_name || repData.representative || '',
      states: repData.states || [],
      cta_url: repData.ctaUrl || repData.cta_url || '',
      profile_image: repData.profileImage || repData.profile_image || '',
      email: repData.email || '',
      phone: repData.phone || ''
    };

    const { data, error } = await supabase
      .from('representatives')
      .insert([transformedData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating representative:', error);
    throw error;
  }
};

// Update representative
export const updateRepresentative = async (id, repData) => {
  try {
    // Transform camelCase to snake_case for Supabase
    const transformedData = {
      rep_name: repData.rep || repData.rep_name || repData.representative || '',
      states: repData.states || [],
      cta_url: repData.ctaUrl || repData.cta_url || '',
      profile_image: repData.profileImage || repData.profile_image || '',
      email: repData.email || '',
      phone: repData.phone || ''
    };

    const { data, error } = await supabase
      .from('representatives')
      .update(transformedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating representative:', error);
    throw error;
  }
};

// Delete representative
export const deleteRepresentative = async (id) => {
  try {
    const { data, error } = await supabase
      .from('representatives')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error deleting representative:', error);
    throw error;
  }
};

// Reset representatives to default data
export const resetRepresentatives = async () => {
  try {
    // First, delete all existing representatives
    await supabase
      .from('representatives')
      .delete()
      .neq('id', 0); // Delete all records

    // Import and insert default data
    const { reps } = await import('../data/reps.js');
    
    const defaultData = reps.map((rep, index) => ({
      rep: rep.rep,
      states: rep.states,
      cta_url: rep.ctaUrl || '#',
      profile_image: null
    }));

    const { data, error } = await supabase
      .from('representatives')
      .insert(defaultData)
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error resetting representatives:', error);
    throw error;
  }
};
