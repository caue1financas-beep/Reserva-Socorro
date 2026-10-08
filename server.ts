import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import adminHandler from './api/admin';
import personsHandler from './api/persons';
import personDetailHandler from './api/persons/[id]';
import resetHandler from './api/reset';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Routes
app.all('/api/admin', (req, res) => adminHandler(req, res));
app.all('/api/persons', (req, res) => personsHandler(req, res));
app.all('/api/persons/:id', (req, res) => {
  // Ensure req.query.id is populated for parity with Vercel serverless functions
  req.query = req.query || {};
  req.query.id = req.params.id;
  return personDetailHandler(req, res);
});
app.all('/api/reset', (req, res) => resetHandler(req, res));

// Setup Frontend serving (Vite in dev, static dist in prod)
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin password loaded: ${process.env.ADMIN_PASSWORD ? '[CONFIGURED IN ENV]' : 'socorro (default fallback)'}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
