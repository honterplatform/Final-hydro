import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
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

    // Try to create the representatives table
    // Note: In Supabase, you typically create tables through the dashboard
    // This is just a fallback attempt
    try {
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS representatives (
            id SERIAL PRIMARY KEY,
            rep VARCHAR(255) NOT NULL,
            states JSONB NOT NULL,
            cta_url VARCHAR(500) DEFAULT '#',
            profile_image TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      });

      if (createError) {
        console.log('Table creation via RPC failed (this is normal):', createError.message);
      }
    } catch (error) {
      console.log('Table creation not available via RPC (this is normal):', error.message);
    }

    // Check if table is empty and insert original data if needed
    const { data: countData, error: countError } = await supabase
      .from('representatives')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Count error: ${countError.message}`);
    }

    const count = countData?.length || 0;

    if (count === 0) {
      const originalReps = [
        { rep: "Randy Blackmon", states: ["AL", "GA", "MS", "FL", "NC", "SC"], cta_url: "#" },
        { rep: "Jeremy Ross", states: ["LA"], cta_url: "#" },
        { rep: "Joseph Gebbia", states: ["MN", "WI", "IL", "IN", "IA"], cta_url: "#" },
        { rep: "Ken Smith", states: ["PA", "NJ", "MD", "DE"], cta_url: "#" },
        { rep: "Kyle Krumlauf", states: ["OH", "PA", "VA", "KY", "TN", "IN"], cta_url: "#" },
        { rep: "Luke Rice", states: ["CT", "NY", "NH", "RI", "ME", "MA", "VT"], cta_url: "#" },
        { rep: "Steve Smith & Steve Antonini", states: ["NY", "NJ"], cta_url: "#" },
        { rep: "Dan Livesay", states: ["NE", "KS", "OK", "MO", "AR"], cta_url: "#" },
        { rep: "Pat Tuel", states: ["CA", "NV"], cta_url: "#" },
        { rep: "Rick Coury", states: ["CA", "NV"], cta_url: "#" },
        { rep: "Phil Kristianson", states: ["HI"], cta_url: "#" },
        { rep: "Kurt Hodson", states: ["MT", "ID"], cta_url: "#" },
        { rep: "Steve Schapp", states: ["UT", "CO"], cta_url: "#" },
        { rep: "Paul Mosher", states: ["AZ", "NM"], cta_url: "#" },
        { rep: "Will McHarness", states: ["OR", "WA"], cta_url: "#" },
        { rep: "Alex Anako, Paul Mosher, Aaron Schultz", states: ["WA", "ID"], cta_url: "#" }
      ];

      const { error: insertError } = await supabase
        .from('representatives')
        .insert(originalReps);

      if (insertError) {
        throw new Error(`Insert error: ${insertError.message}`);
      }
    }

    res.status(200).json({ 
      message: 'Database setup completed successfully',
      tableCreated: true,
      initialDataInserted: count === 0
    });
  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({ error: 'Database setup failed', details: error.message });
  }
}
