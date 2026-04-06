import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
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
import { partnerMatchRouter } from './partner-match-route.js';
import { searchEnhanceRouter } from './search-enhance-route.js';
import { partnerSearchRouter } from './partner-search-route.js';
import { watchlistRouter } from './watchlist-route.js';
import { eventsRouter } from './events-route.js';
import { historyRouter } from './history-route.js';

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
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
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
app.use('/api/partner-match', partnerMatchRouter);
app.use('/api/search-enhance', searchEnhanceRouter);
app.use('/api/partner-search-hub', partnerSearchRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/events', eventsRouter);
app.use('/api/history', historyRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// In production, serve the built React frontend with SSR
const clientDistPath = resolve(__dirname, '../../client/dist');
const ssrDistPath = resolve(__dirname, '../../client/dist-ssr');

app.use(express.static(clientDistPath, { index: false }));

// Load SSR module and HTML template
let ssrRender: ((url: string) => string) | null = null;
let htmlTemplate = '';

const ssrEntryPath = resolve(ssrDistPath, 'entry-server.js');
const htmlPath = resolve(clientDistPath, 'index.html');

if (existsSync(ssrEntryPath) && existsSync(htmlPath)) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ssrModule = require(ssrEntryPath);
    ssrRender = ssrModule.render;
    htmlTemplate = readFileSync(htmlPath, 'utf-8');
    console.log('[ssr] SSR enabled — crawlers will see pre-rendered HTML');
  } catch (err) {
    console.warn('[ssr] Failed to load SSR module, falling back to SPA:', err);
  }
} else {
  console.log('[ssr] SSR bundle not found, serving as SPA');
}

app.get('*', (req, res) => {
  if (ssrRender && htmlTemplate) {
    try {
      const appHtml = ssrRender(req.originalUrl);
      const html = htmlTemplate.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
      res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
      return;
    } catch (err) {
      console.error('[ssr] Render error, falling back to SPA:', err);
    }
  }
  // Fallback: serve the SPA shell
  res.sendFile(resolve(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CORDIS Explorer server running on port ${PORT}`);
});
