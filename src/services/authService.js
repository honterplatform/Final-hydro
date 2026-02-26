import { supabase } from './supabaseService';

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const checkAdminAccess = async (email) => {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data !== null;
};

export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => callback(event, session)
  );
  return subscription;
};
