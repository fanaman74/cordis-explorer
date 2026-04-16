import { Router } from 'express';
import type { Request, Response } from 'express';
import { chat } from './ai-client.js';
import { requireAuth } from './auth-middleware.js';
import { checkAndIncrementUsage } from './usage.js';

export const partnerMatchRouter = Router();

export interface PartnerRequest {
  description: string;
  country?: string;
  maxResults?: number;
}

export interface PartnerResult {
  orgName: string;
  country: string;
  projectCount: number;
  matchScore: number;
  reason: string;
  expertise: string[];
  sampleProjects: string[];
}

interface SparqlOrg {
  orgName: string;
  country: string;
  projectCount: number;
  projectTitles: string[];
}

function extractKeywords(description: string): string[] {
  // Strip common stop words and extract meaningful terms
  const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for',
    'of','with','by','from','that','this','is','are','was','were','be','been','have',
    'has','had','will','would','could','should','may','might','can','their','our','we',
    'it','its','as','into','about','which','who','when','where','how','what','project',
    'research','development','innovation','european','eu','horizon','grant']);

  const words = description
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  // Deduplicate and take up to 5 most meaningful terms
  return [...new Set(words)].slice(0, 5);
}

async function fetchOrgsFromSparql(keywords: string[], country?: string): Promise<SparqlOrg[]> {
  const kw = keywords.length ? keywords : ['technology'];
  const keywordFilters = kw
    .map(k => `CONTAINS(LCASE(STR(?title)), '${k.replace(/'/g, "\\'")}')`)
    .join(' || ');

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
  FILTER(${keywordFilters})
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?org eurio:legalName ?orgName .
  ${countryClause}
  OPTIONAL {
    ?org eurio:hasSite ?site .
    ?site eurio:hasGeographicalLocation ?country .
    ?country a eurio:Country .
    ?country eurio:name ?countryName .
  }
}
GROUP BY ?orgName ?countryName
ORDER BY DESC(?projectCount)
LIMIT 80
  `.trim();

  const sparqlEndpoint = process.env.SPARQL_ENDPOINT || 'https://cordis.europa.eu/datalab/sparql';
  const res = await fetch(sparqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json',
    },
    body: new URLSearchParams({ query }),
  });

  if (!res.ok) throw new Error(`SPARQL error: ${res.status}`);
  const json = await res.json() as any;
  const bindings: any[] = json.results?.bindings ?? [];

  return bindings.map((b: any) => ({
    orgName: b.orgName?.value ?? '',
    country: b.countryName?.value ?? 'Unknown',
    projectCount: parseInt(b.projectCount?.value ?? '0', 10),
    projectTitles: (b.projectTitles?.value ?? '').split('||').filter(Boolean).slice(0, 5),
  })).filter(o => o.orgName);
}

async function scoreWithClaude(description: string, orgs: SparqlOrg[], maxResults: number): Promise<PartnerResult[]> {
  const orgList = orgs.slice(0, 60).map((o, i) =>
    `${i + 1}. ${o.orgName} (${o.country}) — ${o.projectCount} relevant projects\n   Sample: ${o.projectTitles.slice(0, 3).join('; ')}`
  ).join('\n');

  const prompt = `You are a partner-matching assistant for EU research projects.

A user is looking for consortium partners for this project:
"${description}"

Below are ${Math.min(orgs.length, 60)} organisations found in the CORDIS database that have worked on related projects. Your job is to identify the best potential partners.

ORGANISATIONS:
${orgList}

Return EXACTLY ${maxResults} organisations as a JSON array. For each pick the ones with the strongest expertise match, not just highest project count.

JSON format (return ONLY the array, no other text):
[
  {
    "orgName": "exact name from list",
    "matchScore": 85,
    "reason": "One clear sentence explaining why they are a good fit",
    "expertise": ["tag1", "tag2", "tag3"]
  }
]`;

  const text = await chat([{ role: 'user', content: prompt }], { max_tokens: 2000 });
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned invalid JSON');

  const scored: Array<{orgName: string; matchScore: number; reason: string; expertise: string[]}> = JSON.parse(jsonMatch[0]);

  return scored.map(s => {
    const org = orgs.find(o => o.orgName === s.orgName) ?? orgs[0];
    return {
      orgName: s.orgName,
      country: org?.country ?? 'Unknown',
      projectCount: org?.projectCount ?? 0,
      matchScore: Math.min(100, Math.max(0, s.matchScore)),
      reason: s.reason,
      expertise: s.expertise ?? [],
      sampleProjects: org?.projectTitles?.slice(0, 3) ?? [],
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

partnerMatchRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { description, country, maxResults = 10 } = req.body as PartnerRequest;

  if (!description || description.trim().length < 20) {
    res.status(400).json({ error: 'Please provide a project description of at least 20 characters.' });
    return;
  }
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(500).json({ error: 'OPENROUTER_API_KEY not configured.' });
    return;
  }

  try {
    await checkAndIncrementUsage(req.userId!, 'partner_match');

    const keywords = extractKeywords(description);
    const orgs = await fetchOrgsFromSparql(keywords, country);

    if (orgs.length === 0) {
      res.json({ results: [], keywords });
      return;
    }

    const results = await scoreWithClaude(description, orgs, Math.min(maxResults, 15));
    res.json({ results, keywords, totalCandidates: orgs.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Partner matching failed';
    const statusCode = (err as any).statusCode ?? 502;
    res.status(statusCode).json({ error: message });
  }
});
