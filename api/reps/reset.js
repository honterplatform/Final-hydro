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

    // Delete all existing representatives
    const { error: deleteError } = await supabase
      .from('representatives')
      .delete()
      .neq('id', 0); // Delete all rows

    if (deleteError) {
      throw new Error(`Delete error: ${deleteError.message}`);
    }

    // Insert the original data
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

    const { data, error: insertError } = await supabase
      .from('representatives')
      .insert(originalReps)
      .select();

    if (insertError) {
      throw new Error(`Insert error: ${insertError.message}`);
    }

    res.status(200).json({ 
      message: 'Representatives reset to default data successfully',
      data: data
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Reset failed', details: error.message });
  }
}