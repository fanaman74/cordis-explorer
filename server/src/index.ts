import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
// Find .env regardless of where the server process is started from
const envCandidates = [
  resolve(__dirname, '../../.env'),
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../.env'),
];
console.log('[dotenv] cwd:', process.cwd(), '| __dirname:', __dirname);
for (const p of envCandidates) {
  if (existsSync(p)) {
    config({ path: p });
    console.log('[dotenv] loaded from:', p, '| key set:', !!process.env.ANTHROPIC_API_KEY);
    break;
  }
  console.log('[dotenv] not found at:', p);
}
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sparqlProxy from './sparql-proxy.js';
import { grantMatchRouter } from './grant-match-route.js';
import { adminRouter } from './admin-route.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://*.basemaps.cartocdn.com",
        "https://*.tile.openstreetmap.org",
        "https://unpkg.com",
      ],
      connectSrc: [
        "'self'",
        "https://*.supabase.co",
        "https://cordis.europa.eu",
        "https://raw.githubusercontent.com",
      ],
      fontSrc: ["'self'", "data:"],
      workerSrc: ["'self'", "blob:"],
    },
  },
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use(sparqlProxy);
app.use('/api/grant-match', grantMatchRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// In production, serve the built React frontend
const clientDistPath = resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (_req, res) => {
  res.sendFile(resolve(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CORDIS Explorer server running on port ${PORT}`);
});
