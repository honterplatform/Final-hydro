import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
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
    const { id } = req.query;

    if (req.method === 'GET') {
      // Get a specific representative
      const { data, error } = await supabase
        .from('representatives')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return res.status(404).json({ error: 'Representative not found' });
      }

      res.status(200).json(data);
    } else if (req.method === 'PUT') {
      // Update representative
      const { rep, states, ctaUrl, profileImage } = req.body;
      
      if (!rep || !states || !Array.isArray(states)) {
        return res.status(400).json({ error: 'Representative name and states are required' });
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
    } else if (req.method === 'DELETE') {
      // Delete representative
      const { data, error } = await supabase
        .from('representatives')
        .delete()
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
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}