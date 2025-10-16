const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all representatives
      const result = await sql`SELECT * FROM representatives ORDER BY id`;
      res.status(200).json(result.rows);
    } else if (req.method === 'POST') {
      // Create new representative
      const { rep, states, ctaUrl, profileImage } = req.body;
      
      if (!rep || !states || !Array.isArray(states)) {
        return res.status(400).json({ error: 'Representative name and states are required' });
      }

      const result = await sql`
        INSERT INTO representatives (rep, states, cta_url, profile_image)
        VALUES (${rep}, ${JSON.stringify(states)}, ${ctaUrl || '#'}, ${profileImage || null})
        RETURNING *
      `;
      
      res.status(201).json(result.rows[0]);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
