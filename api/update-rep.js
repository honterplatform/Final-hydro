import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { id, rep, states, ctaUrl, profileImage } = req.body;
    
    if (!id || !rep || !states || !Array.isArray(states)) {
      return res.status(400).json({ error: 'ID, representative name and states are required' });
    }

    const { data, error } = await supabase
      .from('representatives')
      .update({
        rep,
        states,
        cta_url: ctaUrl || '#',
        profile_image: profileImage || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      return res.status(404).json({ error: 'Representative not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Update failed', details: error.message });
  }
}
