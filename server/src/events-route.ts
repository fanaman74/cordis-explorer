import { Router } from 'express';
import type { Request, Response } from 'express';
import { getCacheKey, getCached, setCache } from './cache.js';

export const eventsRouter = Router();

// EEN public events API
const EEN_API = 'https://een.ec.europa.eu/api/v2/events';

// Cluster → EEN keyword mapping
const CLUSTER_KEYWORDS: Record<string, string> = {
  '1': 'health',
  '2': 'culture society',
  '3': 'security',
  '4': 'digital industry',
  '5': 'climate energy',
  '6': 'food bioeconomy',
};

interface EenEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  country?: string;
  city?: string;
  registrationUrl?: string;
  source: 'een';
}

async function fetchEenEvents(
  cluster?: string,
  country?: string,
  page = 1,
): Promise<{ events: EenEvent[]; total: number }> {
  const params = new URLSearchParams({
    _format: 'json',
    items_per_page: '20',
    page: String(page - 1),
  });

  if (cluster && CLUSTER_KEYWORDS[cluster]) params.set('keywords', CLUSTER_KEYWORDS[cluster]);
  if (country) params.set('country', country);

  try {
    const resp = await fetch(`${EEN_API}?${params}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!resp.ok) {
      console.warn(`[events] EEN API returned ${resp.status}`);
      return { events: [], total: 0 };
    }

    const json = await resp.json() as unknown;
    const items: unknown[] = Array.isArray(json)
      ? json
      : (json as Record<string, unknown>)?.data as unknown[] ?? (json as Record<string, unknown>)?.items as unknown[] ?? [];
    const total: number = (json as Record<string, unknown>)?.total as number ?? items.length;

    const events: EenEvent[] = (items as Record<string, unknown>[]).map((item) => ({
      id: String(item.nid ?? item.id ?? Math.random()),
      title: String(item.title ?? item.name ?? 'Event'),
      description: String(item.body ?? item.description ?? ''),
      startDate: String(item.field_date_from ?? item.startDate ?? item.date ?? ''),
      endDate: item.field_date_to != null ? String(item.field_date_to) : undefined,
      country: item.field_country != null ? String(item.field_country) : undefined,
      city: item.field_city != null ? String(item.field_city) : undefined,
      registrationUrl: item.field_registration_url != null
        ? String(item.field_registration_url)
        : `https://een.ec.europa.eu/events/${item.nid ?? ''}`,
      source: 'een' as const,
    }));

    return { events, total };
  } catch (err) {
    console.warn('[events] EEN API unavailable:', err);
    return { events: [], total: 0 };
  }
}

eventsRouter.get('/', async (req: Request, res: Response) => {
  const { cluster, country, page = '1' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  const cacheKey = getCacheKey(`events:${cluster ?? ''}:${country ?? ''}:${page}`);
  const cached = getCached(cacheKey);
  if (cached) { res.json(cached); return; }

  const { events, total } = await fetchEenEvents(cluster, country, pageNum);
  const payload = { events, total, page: pageNum };
  setCache(cacheKey, payload);
  res.json(payload);
});
