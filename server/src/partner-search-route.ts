import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from './auth-middleware.js';
import { checkAndIncrementUsage } from './usage.js';
import { getCacheKey, getCached, setCache } from './cache.js';

export const partnerSearchRouter = Router();

const SPARQL_ENDPOINT = process.env.SPARQL_ENDPOINT || 'https://cordis.europa.eu/datalab/sparql';

const CLUSTER_KEYWORDS: Record<string, string[]> = {
  '1': ['health', 'cancer', 'disease', 'medicine', 'clinical', 'pandemic'],
  '2': ['culture', 'society', 'democracy', 'heritage', 'social', 'migration'],
  '3': ['security', 'defence', 'cyber', 'border', 'resilience', 'disaster'],
  '4': ['digital', 'ai', 'artificial intelligence', 'data', 'cloud', 'robotics', 'manufacturing'],
  '5': ['climate', 'energy', 'transport', 'mobility', 'hydrogen', 'renewable', 'emission'],
  '6': ['food', 'agriculture', 'biodiversity', 'environment', 'ecosystem', 'soil', 'water'],
};

interface PartnerProfile {
  id: string;
  orgName: string;
  country: string;
  projectCount: number;
  recentProjects: string[];
  expertise: string[];
  ftPortalUrl: string;
}

async function searchOrgsBySparql(
  callRef?: string,
  cluster?: string,
  country?: string,
  page = 1,
): Promise<{ profiles: PartnerProfile[]; total: number }> {
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  // Build keyword filters from cluster or callRef
  let keywordFilter = '';
  const keywords: string[] = [];

  if (callRef && callRef.trim()) {
    // Extract keywords from call reference e.g. HORIZON-CL4-2026-TWIN-01
    const parts = callRef.toUpperCase().replace(/HORIZON-?/i, '').split(/[-_]/);
    for (const p of parts) {
      if (p.length > 2 && !/^\d+$/.test(p)) keywords.push(p.toLowerCase());
    }
  }

  if (cluster && CLUSTER_KEYWORDS[cluster]) {
    keywords.push(...CLUSTER_KEYWORDS[cluster].slice(0, 3));
  }

  if (!keywords.length) keywords.push('research');

  // Use first 3 keywords
  const kw = keywords.slice(0, 3);
  keywordFilter = kw.map(k => `CONTAINS(LCASE(STR(?title)), '${k.replace(/'/g, "\\'")}')`).join(' || ');

  const countryClause = country
    ? `?org eurio:hasSite ?_cs . ?_cs eurio:hasGeographicalLocation ?_cc . ?_cc a eurio:Country . ?_cc eurio:name '${country.replace(/'/g, "\\'")}' .`
    : '';

  const query = `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT ?orgName ?countryName (COUNT(DISTINCT ?project) AS ?projectCount)
       (GROUP_CONCAT(DISTINCT ?title; SEPARATOR="||") AS ?projectTitles)
WHERE {
  ?project a eurio:Project .
  ?project eurio:title ?title .
  FILTER(${keywordFilter})
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?org eurio:legalName ?orgName .
  ${countryClause}
  OPTIONAL {
    ?org eurio:hasSite ?site .
    ?site eurio:hasGeographicalLocation ?geo .
    ?geo a eurio:Country .
    ?geo eurio:name ?countryName .
  }
}
GROUP BY ?orgName ?countryName
ORDER BY DESC(?projectCount)
LIMIT ${PAGE_SIZE}
OFFSET ${offset}
  `.trim();

  try {
    const resp = await fetch(SPARQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/sparql-results+json',
      },
      body: new URLSearchParams({ query }),
      signal: AbortSignal.timeout(15000),
    });

    if (!resp.ok) return { profiles: [], total: 0 };

    const json = await resp.json() as any;
    const bindings: any[] = json.results?.bindings ?? [];

    const profiles: PartnerProfile[] = bindings
      .filter((b: any) => b.orgName?.value)
      .map((b: any) => {
        const name = b.orgName.value;
        const titles = (b.projectTitles?.value ?? '').split('||').filter(Boolean);
        // Derive expertise tags from project titles
        const expertise = deriveExpertise(titles, kw);
        return {
          id: encodeURIComponent(name),
          orgName: name,
          country: b.countryName?.value ?? '',
          projectCount: parseInt(b.projectCount?.value ?? '0', 10),
          recentProjects: titles.slice(0, 3),
          expertise,
          ftPortalUrl: `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/partner-search${callRef ? `?callId=${encodeURIComponent(callRef)}` : ''}`,
        };
      });

    return { profiles, total: profiles.length + offset + (profiles.length === PAGE_SIZE ? 1 : 0) };
  } catch (err) {
    console.warn('[partner-search] SPARQL error:', err);
    return { profiles: [], total: 0 };
  }
}

function deriveExpertise(titles: string[], baseKeywords: string[]): string[] {
  const tags = new Set<string>(baseKeywords.slice(0, 2).map(k => k.charAt(0).toUpperCase() + k.slice(1)));
  const domainWords = [
    'AI', 'ML', 'IoT', 'blockchain', 'cloud', 'digital', 'health', 'energy',
    'climate', 'data', 'security', 'robotics', 'materials', 'pharma', 'biotech',
    'agri', 'transport', 'mobility', 'manufacturing', 'social', 'education',
  ];
  for (const t of titles.slice(0, 5)) {
    for (const dw of domainWords) {
      if (t.toLowerCase().includes(dw.toLowerCase()) && tags.size < 5) {
        tags.add(dw);
      }
    }
  }
  return [...tags].slice(0, 4);
}

partnerSearchRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const { callId, cluster, country, page = '1' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  try {
    await checkAndIncrementUsage(req.userId!, 'partner_search');

    const cacheKey = getCacheKey(`partner-search-v2:${callId}:${cluster}:${country}:${page}`);
    const cached = getCached(cacheKey);
    if (cached) { res.json(cached); return; }

    const { profiles, total } = await searchOrgsBySparql(callId, cluster, country, pageNum);

    const payload = { profiles, total, page: pageNum, source: 'cordis' };
    if (profiles.length) setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Partner search failed';
    const statusCode = typeof (err as any).statusCode === 'number' ? (err as any).statusCode : 502;
    res.status(statusCode).json({ error: message });
  }
});
