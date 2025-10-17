import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { reps } from './src/data/reps.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase payload limit to 10MB

// In-memory storage for development
let representatives = reps.map((rep, index) => ({ ...rep, id: index + 1 }));

// API Routes
app.get('/api/reps', (req, res) => {
  res.json(representatives);
});

app.post('/api/reps', (req, res) => {
  const { rep, states, ctaUrl, profileImage } = req.body;
  
  if (!rep || !states || !Array.isArray(states)) {
    return res.status(400).json({ error: 'Representative name and states are required' });
  }

  const newRep = {
    id: Date.now(),
    rep,
    states,
    cta_url: ctaUrl || '#',
    profile_image: profileImage || null
  };

  representatives.push(newRep);
  res.status(201).json(newRep);
});

app.put('/api/update-rep', (req, res) => {
  const { id, ...updateData } = req.body;
  
  const index = representatives.findIndex(rep => rep.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Representative not found' });
  }

  representatives[index] = { ...representatives[index], ...updateData };
  res.json(representatives[index]);
});

app.delete('/api/delete-rep', (req, res) => {
  const { id } = req.body;
  
  const index = representatives.findIndex(rep => rep.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Representative not found' });
  }

  const deletedRep = representatives[index];
  representatives.splice(index, 1);
  res.json(deletedRep);
});

app.post('/api/reps/reset', (req, res) => {
  representatives = [...reps];
  res.json(representatives);
});

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
