import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from './auth-middleware.js';
import { checkAndIncrementUsage } from './usage.js';
import { getCacheKey, getCached, setCache } from './cache.js';

export const partnerSearchRouter = Router();

const FT_API = 'https://api.tech.ec.europa.eu/search-api/prod/rest/search';
const SPARQL_ENDPOINT = process.env.SPARQL_ENDPOINT || 'https://cordis.europa.eu/datalab/sparql';

const CLUSTER_PREFIXES: Record<string, string> = {
  '1': 'HORIZON-HEALTH',
  '2': 'HORIZON-CL2',
  '3': 'HORIZON-CL3',
  '4': 'HORIZON-CL4',
  '5': 'HORIZON-CL5',
  '6': 'HORIZON-CL6',
};

interface FtProfile {
  id: string;
  orgName: string;
  country: string;
  callReference?: string;
  callTitle?: string;
  type: 'offer' | 'request';
  summary: string;
  expertise: string[];
  deadline?: string;
  ftPortalUrl: string;
}

interface SparqlEnrichment {
  projectCount: number;
  recentProjects: string[];
}

async function fetchFtProfiles(
  callId?: string,
  cluster?: string,
  country?: string,
  page = 1,
): Promise<{ profiles: FtProfile[]; total: number; callTitle?: string; unavailable?: boolean }> {
  const PAGE_SIZE = 20;
  const start = (page - 1) * PAGE_SIZE;

  const query: Record<string, string> = {
    scope: 'partnerSearch',
    size: String(PAGE_SIZE),
    start: String(start),
    languages: 'en',
  };

  const filters: string[] = [];
  if (callId) filters.push(`callId=${callId}`);
  if (cluster && CLUSTER_PREFIXES[cluster]) {
    filters.push(`callId=*${CLUSTER_PREFIXES[cluster]}*`);
  }
  if (country) filters.push(`country=${country}`);

  if (filters.length) query['filterQuery'] = filters.join(',');

  const url = `${FT_API}?${new URLSearchParams(query)}`;

  try {
    const resp = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!resp.ok) {
      console.warn(`[partner-search] F&T API returned ${resp.status}`);
      return { profiles: [], total: 0, unavailable: true };
    }

    const json = await resp.json() as any;
    const hits: any[] = json?.results ?? json?.hits?.hits ?? [];
    const total: number = json?.total ?? json?.hits?.total?.value ?? 0;

    const profiles: FtProfile[] = hits.map((h: any) => {
      const src = h._source ?? h;
      return {
        id: String(h._id ?? src.id ?? Math.random()),
        orgName: src.legalName ?? src.organisationName ?? src.name ?? 'Unknown',
        country: src.country ?? src.countryCode ?? '',
        callReference: src.callIdentifier ?? src.callReference,
        callTitle: src.callTitle,
        type: (src.type === 'offer' || src.requestType === 'offer') ? 'offer' : 'request',
        summary: src.description ?? src.partnershipProposal ?? src.summary ?? '',
        expertise: Array.isArray(src.expertise) ? src.expertise
          : typeof src.expertise === 'string' ? [src.expertise]
          : [],
        deadline: src.deadline,
        ftPortalUrl: src.url ?? `https://ec.europa.eu/research/participants/portal/desktop/en/organisations/partner-search.html${callId ? `?callId=${callId}` : ''}`,
      };
    });

    return { profiles, total, callTitle: hits[0]?._source?.callTitle };
  } catch (err) {
    console.warn('[partner-search] F&T API unavailable:', err);
    return { profiles: [], total: 0, unavailable: true };
  }
}

async function enrichWithSparql(orgNames: string[]): Promise<Record<string, SparqlEnrichment>> {
  if (!orgNames.length) return {};
  const nameFilters = orgNames
    .slice(0, 20)
    .map(n => `"${n.replace(/"/g, '\\"')}"`)
    .join(', ');

  const query = `
PREFIX eurio: <http://data.europa.eu/s66#>
SELECT ?orgName (COUNT(DISTINCT ?project) AS ?projectCount)
       (GROUP_CONCAT(DISTINCT ?title; SEPARATOR="||") AS ?titles)
WHERE {
  ?org eurio:legalName ?orgName .
  FILTER(?orgName IN (${nameFilters}))
  OPTIONAL {
    ?project a eurio:Project .
    ?project eurio:hasInvolvedParty ?role .
    ?role eurio:isRoleOf ?org .
    ?project eurio:title ?title .
  }
}
GROUP BY ?orgName
  `.trim();

  try {
    const resp = await fetch(SPARQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/sparql-results+json',
      },
      body: new URLSearchParams({ query }),
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return {};
    const json = await resp.json() as any;
    const bindings: any[] = json.results?.bindings ?? [];
    const result: Record<string, SparqlEnrichment> = {};
    for (const b of bindings) {
      const name = b.orgName?.value ?? '';
      if (!name) continue;
      result[name] = {
        projectCount: parseInt(b.projectCount?.value ?? '0', 10),
        recentProjects: (b.titles?.value ?? '').split('||').filter(Boolean).slice(0, 3),
      };
    }
    return result;
  } catch {
    return {};
  }
}

partnerSearchRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const { callId, cluster, country, page = '1' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  try {
    await checkAndIncrementUsage(req.userId!, 'partner_search');

    const cacheKey = getCacheKey(`partner-search:${callId}:${cluster}:${country}:${page}`);
    const cached = getCached(cacheKey);
    if (cached) { res.json(cached); return; }

    const { profiles, total, callTitle, unavailable } = await fetchFtProfiles(callId, cluster, country, pageNum);

    if (unavailable) {
      const fallback = { profiles: [], total: 0, page: pageNum, ftUnavailable: true };
      res.json(fallback);
      return;
    }

    const orgNames = profiles.slice(0, 20).map(p => p.orgName);
    const enrichment = await enrichWithSparql(orgNames);

    const enrichedProfiles = profiles.map(p => ({
      ...p,
      cordisProjectCount: enrichment[p.orgName]?.projectCount,
      cordisRecentProjects: enrichment[p.orgName]?.recentProjects,
      cordisEnriched: p.orgName in enrichment,
    }));

    const payload = { profiles: enrichedProfiles, total, page: pageNum, callTitle };
    setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Partner search failed';
    const statusCode = typeof (err as any).statusCode === 'number' ? (err as any).statusCode : 502;
    res.status(statusCode).json({ error: message });
  }
});
