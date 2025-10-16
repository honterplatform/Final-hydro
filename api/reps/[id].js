import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const { id } = req.query;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'PUT') {
      // Update representative
      const { rep, states, ctaUrl, profileImage } = req.body;
      
      if (!rep || !states || !Array.isArray(states)) {
        return res.status(400).json({ error: 'Representative name and states are required' });
      }

      const result = await sql`
        UPDATE representatives 
        SET rep = ${rep}, states = ${JSON.stringify(states)}, cta_url = ${ctaUrl || '#'}, profile_image = ${profileImage || null}
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Representative not found' });
      }
      
      res.status(200).json(result.rows[0]);
    } else if (req.method === 'DELETE') {
      // Delete representative
      const result = await sql`
        DELETE FROM representatives 
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Representative not found' });
      }
      
      res.status(200).json(result.rows[0]);
    } else {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
