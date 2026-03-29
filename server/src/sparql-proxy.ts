import { Router, Request, Response } from 'express';
import { getCacheKey, getCached, setCache } from './cache.js';

const SPARQL_ENDPOINT =
  process.env.SPARQL_ENDPOINT ||
  'https://cordis.europa.eu/datalab/sparql';

const router = Router();

// Rate limiter for upstream SPARQL requests: max 2 per second globally
// Only counts actual upstream requests (not cached responses)
const upstreamRequestTimes: number[] = [];
const RATE_LIMIT = 2;
const RATE_WINDOW = 1000;

function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  // Clean old entries
  while (upstreamRequestTimes.length > 0 && now - upstreamRequestTimes[0] > RATE_WINDOW) {
    upstreamRequestTimes.shift();
  }
  if (upstreamRequestTimes.length < RATE_LIMIT) {
    upstreamRequestTimes.push(now);
    return Promise.resolve();
  }
  // Wait until the oldest request expires
  const waitMs = RATE_WINDOW - (now - upstreamRequestTimes[0]) + 10;
  return new Promise((resolve) => setTimeout(() => {
    upstreamRequestTimes.shift();
    upstreamRequestTimes.push(Date.now());
    resolve();
  }, waitMs));
}

router.post('/api/sparql', async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    res.status(400).json({ error: 'Missing or invalid query' });
    return;
  }

  // Check cache
  const cacheKey = getCacheKey(query);
  const cached = getCached(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    // Wait for rate limit slot before making upstream request
    await waitForRateLimit();

    const response = await fetch(SPARQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/sparql-results+json',
      },
      body: `query=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`SPARQL endpoint error ${response.status}:`, text.slice(0, 500));
      res.status(502).json({
        error: 'SPARQL endpoint returned an error',
        status: response.status,
      });
      return;
    }

    const data = await response.json();
    setCache(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('SPARQL proxy error:', err);
    res.status(502).json({
      error: 'Failed to query CORDIS SPARQL endpoint',
      detail: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

export default router;
