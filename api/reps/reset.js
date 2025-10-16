const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
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
    // Clear existing data
    await sql`DELETE FROM representatives`;
    
    // Insert original data
    const originalReps = [
      { rep: "Randy Blackmon", states: ["AL", "GA", "MS", "FL", "NC", "SC"], ctaUrl: "#" },
      { rep: "Jeremy Ross", states: ["LA"], ctaUrl: "#" },
      { rep: "Joseph Gebbia", states: ["MN", "WI", "IL", "IN", "IA"], ctaUrl: "#" },
      { rep: "Ken Smith", states: ["PA", "NJ", "MD", "DE"], ctaUrl: "#" },
      { rep: "Kyle Krumlauf", states: ["OH", "PA", "VA", "KY", "TN", "IN"], ctaUrl: "#" },
      { rep: "Luke Rice", states: ["CT", "NY", "NH", "RI", "ME", "MA", "VT"], ctaUrl: "#" },
      { rep: "Steve Smith & Steve Antonini", states: ["NY", "NJ"], ctaUrl: "#" },
      { rep: "Dan Livesay", states: ["NE", "KS", "OK", "MO", "AR"], ctaUrl: "#" },
      { rep: "Pat Tuel", states: ["CA", "NV"], ctaUrl: "#" },
      { rep: "Rick Coury", states: ["CA", "NV"], ctaUrl: "#" },
      { rep: "Phil Kristianson", states: ["HI"], ctaUrl: "#" },
      { rep: "Kurt Hodson", states: ["MT", "ID"], ctaUrl: "#" },
      { rep: "Steve Schapp", states: ["UT", "CO"], ctaUrl: "#" },
      { rep: "Paul Mosher", states: ["AZ", "NM"], ctaUrl: "#" },
      { rep: "Will McHarness", states: ["OR", "WA"], ctaUrl: "#" },
      { rep: "Alex Anako, Paul Mosher, Aaron Schultz", states: ["WA", "ID"], ctaUrl: "#" }
    ];

    for (const rep of originalReps) {
      await sql`
        INSERT INTO representatives (rep, states, cta_url, profile_image)
        VALUES (${rep.rep}, ${JSON.stringify(rep.states)}, ${rep.ctaUrl}, null)
      `;
    }

    // Return the reset data
    const result = await sql`SELECT * FROM representatives ORDER BY id`;
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
