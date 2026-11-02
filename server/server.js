import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../public/data');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for Vite frontend origin
app.use(cors());
app.use(express.json());

// Simulated delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Artificial delay & error simulation middleware
app.use(async (req, res, next) => {
  // 1. Artificial Delay: query param ?delay=1500 or env var DELAY_MS
  const delayParam = req.query.delay
    ? parseInt(req.query.delay, 10)
    : parseInt(process.env.DELAY_MS || '0', 10);
  if (!isNaN(delayParam) && delayParam > 0) {
    await delay(delayParam);
  }

  // 2. On-Demand Error Simulation: query param ?error=true or ?error=500
  if (req.query.error === 'true' || req.query.error === '500') {
    return res.status(500).json({
      error: 'Simulated server failure: 500 Internal Server Error',
      endpoint: req.path,
      timestamp: new Date().toISOString(),
    });
  }

  // 3. On-Demand 404 Simulation: query param ?error=404
  if (req.query.error === '404') {
    return res.status(404).json({
      error: 'Simulated resource not found: 404 Not Found',
      endpoint: req.path,
      timestamp: new Date().toISOString(),
    });
  }

  next();
});

// Helper to load and send JSON data
async function serveDataFile(filename, res, req) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const raw = await fs.readFile(filePath, 'utf-8');
    let data = JSON.parse(raw);

    // On-Demand Empty State simulation: query param ?empty=true
    if (req.query.empty === 'true' && Array.isArray(data)) {
      data = [];
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `Failed to read ${filename}: ${err.message}` });
  }
}

// REST Endpoints
app.get('/api/case', (req, res) => serveDataFile('case.json', res, req));
app.get('/api/evidence', (req, res) => serveDataFile('evidence.json', res, req));
app.get('/api/people', (req, res) => serveDataFile('people.json', res, req));
app.get('/api/locations', (req, res) => serveDataFile('locations.json', res, req));
app.get('/api/timeline', (req, res) => serveDataFile('timeline.json', res, req));

// Dedicated simulation status endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ReMotion Case Investigation Backend', port: PORT });
});

export default app;

if (process.env.NODE_ENV !== 'test' && !process.env.DONT_START) {
  app.listen(PORT, () => {
    console.log(`[ReMotion Backend] Server listening at http://localhost:${PORT}`);
    console.log(
      `[ReMotion Backend] Endpoints: /api/case, /api/evidence, /api/people, /api/locations, /api/timeline`
    );
    console.log(
      `[ReMotion Backend] Simulation query params available: ?delay=2000, ?error=500, ?empty=true`
    );
  });
}

