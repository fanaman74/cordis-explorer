# CORDIS Explorer — 7 Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 7 high-value features to CORDIS Explorer — AI re-ranking, F&T Partner Search Hub, Open Call Watchlist, Action Type + TRL filters, Org Deep-Dive page, Brokerage Events Calendar, and MSCA-specific flow.

**Architecture:** Each feature follows the established pattern: Express route in `server/src/` (behind `requireAuth` + `checkAndIncrementUsage` where needed), React hook in `client/src/hooks/`, page/component in `client/src/pages/` or `client/src/components/`. New server routes are registered in `server/src/index.ts`; new pages get a `<Route>` in `client/src/App.tsx`.

**Tech Stack:** React 18 + TypeScript + Tailwind v4 (client), Express + TypeScript (server), Supabase (auth + DB), Anthropic Claude `claude-sonnet-4-6` (AI), EURIO SPARQL endpoint, F&T Portal EC Search API, EEN Events API.

---

## File Map

| File | Action | Task |
|---|---|---|
| `server/src/usage.ts` | Modify — add new `ToolName` values | 1, 2 |
| `server/src/search-enhance-route.ts` | Create — Claude re-ranking endpoint | 1 |
| `server/src/partner-search-route.ts` | Create — F&T Portal proxy + SPARQL enrichment | 2 |
| `server/src/watchlist-route.ts` | Create — watchlist CRUD + call-check cron | 3 |
| `server/src/events-route.ts` | Create — EEN events proxy | 6 |
| `server/src/index.ts` | Modify — register 4 new routers | 1, 2, 3, 6 |
| `client/src/api/types.ts` | Modify — add 5 new interfaces + 3 new filter fields | 1, 2, 3, 4 |
| `client/src/api/query-builder.ts` | Modify — add actionType/TRL + orgDetail + MSCA queries | 4, 5, 7 |
| `client/src/hooks/useSearchEnhance.ts` | Create | 1 |
| `client/src/hooks/usePartnerSearch.ts` | Create | 2 |
| `client/src/hooks/useWatchlist.ts` | Create | 3 |
| `client/src/hooks/useOrgDetail.ts` | Create | 5 |
| `client/src/hooks/useEvents.ts` | Create | 6 |
| `client/src/hooks/useMscaSearch.ts` | Create | 7 |
| `client/src/pages/PartnerSearchPage.tsx` | Create | 2 |
| `client/src/pages/OrgPage.tsx` | Create | 5 |
| `client/src/pages/EventsPage.tsx` | Create | 6 |
| `client/src/pages/MscaPage.tsx` | Create | 7 |
| `client/src/pages/SearchPage.tsx` | Modify — AI toggle + URL sync for new filters | 1, 4 |
| `client/src/pages/ProjectPage.tsx` | Modify — link orgs to `/org/:name` | 5 |
| `client/src/pages/PartnerMatchPage.tsx` | Modify — link orgs to `/org/:name` | 5 |
| `client/src/pages/HomePage.tsx` | Modify — add 3 new tools to grid | 2, 6, 7 |
| `client/src/components/search/FilterPanel.tsx` | Modify — actionType + TRL dropdowns | 4 |
| `client/src/components/search/ActiveFilters.tsx` | Modify — actionType + TRL pills | 4 |
| `client/src/components/grant-match/MatchCard.tsx` | Modify — star/watchlist button + Find Partners badge | 2, 3 |
| `client/src/App.tsx` | Modify — 4 new routes | 2, 5, 6, 7 |
| `client/public/sitemap.xml` | Modify — add 4 new URLs | 2, 5, 6, 7 |

---

## Task 1: Semantic/AI Search — Claude Re-ranking

**Files:**
- Create: `server/src/search-enhance-route.ts`
- Modify: `server/src/usage.ts`
- Modify: `server/src/index.ts`
- Modify: `client/src/api/types.ts`
- Create: `client/src/hooks/useSearchEnhance.ts`
- Modify: `client/src/pages/SearchPage.tsx`

### 1.1 — Extend `ToolName` in usage.ts

- [ ] Open `server/src/usage.ts`. Change `ToolName` and `COL`:

```typescript
export type ToolName = 'grant_search' | 'profile_match' | 'grant_match' | 'partner_match' | 'search_enhance' | 'partner_search';

const COL: Record<ToolName, string> = {
  grant_search: 'grant_search_count',
  profile_match: 'profile_match_count',
  grant_match: 'grant_match_count',
  partner_match: 'partner_match_count',
  search_enhance: 'search_enhance_count',
  partner_search: 'partner_search_count',
};
```

- [ ] Add the two new columns to the Supabase `user_usage` table. Run this SQL in the Supabase SQL editor (or migration file):

```sql
ALTER TABLE user_usage
  ADD COLUMN IF NOT EXISTS search_enhance_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS partner_search_count integer NOT NULL DEFAULT 0;
```

- [ ] Verify: `npx ts-node -e "import './src/usage'" 2>&1 | head` — no type errors.

### 1.2 — Create `server/src/search-enhance-route.ts`

- [ ] Create the file:

```typescript
import { Router } from 'express';
import type { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from './auth-middleware.js';
import { checkAndIncrementUsage } from './usage.js';
import { getCacheKey, getCached, setCache } from './cache.js';

export const searchEnhanceRouter = Router();

interface ProjectSnippet {
  uri: string;
  title: string;
  acronym?: string;
  identifier?: string;
  startDate?: string;
  countries: string[];
  topicLabel?: string;
}

interface EnhancedProject extends ProjectSnippet {
  relevanceScore: number;
  relevanceExplanation: string;
}

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function rerankWithClaude(
  keyword: string,
  projects: ProjectSnippet[],
): Promise<EnhancedProject[]> {
  const list = projects.slice(0, 30).map((p, i) =>
    `${i + 1}. [${p.identifier ?? 'N/A'}] "${p.title}"${p.acronym ? ` (${p.acronym})` : ''} — ${p.startDate?.slice(0, 4) ?? '?'}, ${p.countries.join(', ')}${p.topicLabel ? `, topic: ${p.topicLabel}` : ''}`
  ).join('\n');

  const prompt = `You are an EU research project relevance assistant.

A researcher searched for: "${keyword}"

Below are ${Math.min(projects.length, 30)} CORDIS projects returned by a keyword search. Re-rank them by genuine semantic relevance to the search intent and provide a one-sentence explanation for each.

PROJECTS:
${list}

Return a JSON array with EXACTLY ${Math.min(projects.length, 30)} entries, ordered from most to least relevant. Use the exact 1-based index number from the list above.

JSON format (return ONLY the array, no other text):
[
  { "index": 1, "relevanceScore": 92, "relevanceExplanation": "Directly addresses X because Y." },
  ...
]`;

  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Claude returned invalid JSON for re-ranking');

  const ranked: Array<{ index: number; relevanceScore: number; relevanceExplanation: string }> =
    JSON.parse(jsonMatch[0]);

  return ranked.map((r) => {
    const project = projects[r.index - 1];
    return {
      ...project,
      relevanceScore: Math.min(100, Math.max(0, r.relevanceScore)),
      relevanceExplanation: r.relevanceExplanation,
    };
  }).filter(Boolean);
}

searchEnhanceRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { keyword, projects } = req.body as { keyword: string; projects: ProjectSnippet[] };

  if (!keyword || !Array.isArray(projects) || projects.length === 0) {
    res.status(400).json({ error: 'keyword and projects[] are required' });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    return;
  }

  const cacheKey = getCacheKey(`search-enhance:${keyword}:${projects.map(p => p.uri).join(',')}`);
  const cached = getCached(cacheKey);
  if (cached) { res.json(cached); return; }

  try {
    await checkAndIncrementUsage(req.userId!, 'search_enhance');
    const results = await rerankWithClaude(keyword, projects);
    const payload = { results };
    setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search enhance failed';
    const statusCode = (err as any).statusCode ?? 502;
    res.status(statusCode).json({ error: message });
  }
});
```

### 1.3 — Register route in `server/src/index.ts`

- [ ] Add import and `app.use` after existing routes:

```typescript
// Add after existing imports:
import { searchEnhanceRouter } from './search-enhance-route.js';

// Add after app.use('/api/partner-match', partnerMatchRouter):
app.use('/api/search-enhance', searchEnhanceRouter);
```

### 1.4 — Add `EnhancedProject` to `client/src/api/types.ts`

- [ ] Append to end of file:

```typescript
export interface EnhancedProject {
  uri: string;
  title: string;
  acronym?: string;
  identifier?: string;
  startDate?: string;
  countries: string[];
  topicLabel?: string;
  relevanceScore: number;
  relevanceExplanation: string;
}

export interface SearchEnhanceResponse {
  results: EnhancedProject[];
}
```

### 1.5 — Create `client/src/hooks/useSearchEnhance.ts`

- [ ] Create the file:

```typescript
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ProjectSummary, SearchEnhanceResponse } from '../api/types';

async function postSearchEnhance(
  keyword: string,
  projects: ProjectSummary[],
): Promise<SearchEnhanceResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch('/api/search-enhance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ keyword, projects }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Search enhance failed: ${response.status}`);
  }
  return response.json();
}

export function useSearchEnhance() {
  const navigate = useNavigate();
  return useMutation<
    SearchEnhanceResponse,
    Error,
    { keyword: string; projects: ProjectSummary[] }
  >({
    mutationFn: ({ keyword, projects }) => postSearchEnhance(keyword, projects),
    onError: (err) => {
      if (err.message === 'limit_exceeded') navigate('/pricing');
    },
  });
}
```

### 1.6 — Add AI re-rank toggle to `client/src/pages/SearchPage.tsx`

- [ ] Add state + mutation at the top of the `SearchPage` component (after existing state):

```typescript
import { useSearchEnhance } from '../hooks/useSearchEnhance';
// ...inside SearchPage component:
const enhanceMutation = useSearchEnhance();
const [aiEnhanced, setAiEnhanced] = useState(false);
const enhancedProjects = enhanceMutation.data?.results ?? null;
const displayProjects = aiEnhanced && enhancedProjects
  ? (enhancedProjects as any[]).map(ep => projects?.find(p => p.uri === ep.uri) ?? ep)
  : projects;
```

- [ ] In the JSX, add an "AI Re-rank" button next to the results count (show only when results exist and a keyword is set):

```tsx
{/* AI re-rank toggle — shown when there are keyword results */}
{projects && projects.length > 0 && filters.keyword && (
  <div className="flex items-center gap-2 mt-2">
    <button
      onClick={() => {
        if (!aiEnhanced) {
          enhanceMutation.mutate(
            { keyword: filters.keyword!, projects: projects.slice(0, 30) },
            { onSuccess: () => setAiEnhanced(true) },
          );
        } else {
          setAiEnhanced(false);
        }
      }}
      disabled={enhanceMutation.isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
      style={
        aiEnhanced
          ? { background: 'var(--color-eu-blue)', color: '#fff', borderColor: 'var(--color-eu-blue)' }
          : { background: 'transparent', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
      }
    >
      {enhanceMutation.isPending ? (
        <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <span>✦</span>
      )}
      {aiEnhanced ? 'AI ranked' : 'AI re-rank'}
    </button>
    {aiEnhanced && (
      <span className="text-xs text-[var(--color-text-secondary)]">
        Results re-ordered by semantic relevance
      </span>
    )}
  </div>
)}
```

- [ ] Reset `aiEnhanced` to `false` inside the `useEffect` that reacts to `filters.keyword` changes:

```typescript
useEffect(() => {
  setAiEnhanced(false);
  enhanceMutation.reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [filters.keyword]);
```

- [ ] Pass `displayProjects` instead of `projects` to `<SearchResults>`:

```tsx
<SearchResults projects={displayProjects ?? []} isLoading={isLoading} ... />
```

### 1.7 — Commit

- [ ] `git add server/src/search-enhance-route.ts server/src/usage.ts server/src/index.ts client/src/api/types.ts client/src/hooks/useSearchEnhance.ts client/src/pages/SearchPage.tsx`
- [ ] `git commit -m "feat: add Claude AI re-ranking to project search results"`
- [ ] Verify: start dev servers, search "artificial intelligence", click "AI re-rank" — results re-ordered with scores.

---

## Task 2: Unified Partner Search Hub (F&T Portal)

**Files:**
- Create: `server/src/partner-search-route.ts`
- Modify: `server/src/index.ts`
- Modify: `client/src/api/types.ts`
- Create: `client/src/hooks/usePartnerSearch.ts`
- Create: `client/src/pages/PartnerSearchPage.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/pages/HomePage.tsx`
- Modify: `client/src/components/grant-match/MatchCard.tsx`

### 2.1 — Add `PartnerProfile` types to `client/src/api/types.ts`

- [ ] Append after `SearchEnhanceResponse`:

```typescript
export interface PartnerProfile {
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
  cordisProjectCount?: number;
  cordisRecentProjects?: string[];
  cordisEnriched: boolean;
}

export interface PartnerSearchFilters {
  callId?: string;
  cluster?: string; // '1'–'6'
  country?: string;
  page: number;
}

export interface PartnerSearchResponse {
  profiles: PartnerProfile[];
  total: number;
  page: number;
  callTitle?: string;
  ftUnavailable?: boolean;
}
```

### 2.2 — Create `server/src/partner-search-route.ts`

- [ ] Create the file:

```typescript
import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from './auth-middleware.js';
import { checkAndIncrementUsage } from './usage.js';
import { getCacheKey, getCached, setCache } from './cache.js';

export const partnerSearchRouter = Router();

const FT_API = 'https://api.tech.ec.europa.eu/search-api/prod/rest/search';
const SPARQL_ENDPOINT = process.env.SPARQL_ENDPOINT || 'https://cordis.europa.eu/datalab/sparql';

// Cluster number → call identifier prefix (used to filter by cluster in F&T)
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

  const cacheKey = getCacheKey(`partner-search:${callId}:${cluster}:${country}:${page}`);
  const cached = getCached(cacheKey);
  if (cached) { res.json(cached); return; }

  try {
    await checkAndIncrementUsage(req.userId!, 'partner_search');
    const { profiles, total, callTitle, unavailable } = await fetchFtProfiles(callId, cluster, country, pageNum);

    if (unavailable) {
      const fallback = { profiles: [], total: 0, page: pageNum, ftUnavailable: true };
      res.json(fallback);
      return;
    }

    // Enrich top 20 with SPARQL in parallel
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
    const statusCode = (err as any).statusCode ?? 502;
    res.status(statusCode).json({ error: message });
  }
});
```

### 2.3 — Register route in `server/src/index.ts`

- [ ] Add import and `app.use`:

```typescript
import { partnerSearchRouter } from './partner-search-route.js';
// after other app.use() calls:
app.use('/api/partner-search-hub', partnerSearchRouter);
```

Note: the route is `/api/partner-search-hub` (not `/api/partner-search`) to avoid a name clash with the existing `/api/partner-match` and to match the new feature name.

### 2.4 — Create `client/src/hooks/usePartnerSearch.ts`

- [ ] Create the file:

```typescript
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { PartnerSearchFilters, PartnerSearchResponse } from '../api/types';

async function fetchPartnerSearch(filters: PartnerSearchFilters): Promise<PartnerSearchResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const params = new URLSearchParams();
  if (filters.callId) params.set('callId', filters.callId);
  if (filters.cluster) params.set('cluster', filters.cluster);
  if (filters.country) params.set('country', filters.country);
  params.set('page', String(filters.page));

  const response = await fetch(`/api/partner-search-hub?${params}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Partner search failed: ${response.status}`);
  }
  return response.json();
}

export function usePartnerSearch(filters: PartnerSearchFilters) {
  return useQuery<PartnerSearchResponse>({
    queryKey: ['partnerSearch', filters],
    queryFn: () => fetchPartnerSearch(filters),
    placeholderData: keepPreviousData,
    enabled: !!(filters.callId || filters.cluster || filters.country),
    staleTime: 1000 * 60 * 15, // 15 min — matches server cache TTL
  });
}
```

### 2.5 — Create `client/src/pages/PartnerSearchPage.tsx`

- [ ] Create the file:

```tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePartnerSearch } from '../hooks/usePartnerSearch';
import { useCountries } from '../hooks/useCountries';
import ClusterBubbles from '../components/common/ClusterBubbles';
import Pagination from '../components/common/Pagination';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import type { PartnerProfile, PartnerSearchFilters } from '../api/types';

const PAGE_SIZE = 20;

function PartnerCard({ profile }: { profile: PartnerProfile }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 space-y-3 hover:border-[var(--color-eu-blue-lighter)] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{profile.orgName}</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{profile.country}</p>
        </div>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
          profile.type === 'offer'
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        }`}>
          {profile.type === 'offer' ? 'Offering' : 'Seeking'}
        </span>
      </div>

      {profile.callReference && (
        <p className="text-xs text-[var(--color-text-secondary)]">
          Call: <span className="font-mono text-[var(--color-text-primary)]">{profile.callReference}</span>
        </p>
      )}

      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
        {profile.summary}
      </p>

      {profile.expertise.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.expertise.slice(0, 5).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              {tag}
            </span>
          ))}
        </div>
      )}

      {profile.cordisEnriched && profile.cordisProjectCount !== undefined && (
        <div className="pt-2 border-t border-[var(--color-border)] space-y-1">
          <p className="text-xs text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--color-text-primary)]">{profile.cordisProjectCount}</span> EU projects in CORDIS
          </p>
          {profile.cordisRecentProjects && profile.cordisRecentProjects.length > 0 && (
            <ul className="text-xs text-[var(--color-text-secondary)] space-y-0.5 list-disc list-inside">
              {profile.cordisRecentProjects.map((t, i) => (
                <li key={i} className="truncate">{t}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <a
        href={profile.ftPortalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-eu-blue-lighter)] hover:underline"
      >
        View on F&T Portal →
      </a>
    </div>
  );
}

export default function PartnerSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: countries = [] } = useCountries();

  const [filters, setFilters] = useState<PartnerSearchFilters>({
    callId: searchParams.get('callId') ?? '',
    cluster: searchParams.get('cluster') ?? undefined,
    country: searchParams.get('country') ?? undefined,
    page: parseInt(searchParams.get('page') ?? '1', 10),
  });

  const [callInput, setCallInput] = useState(filters.callId ?? '');

  const { data, isLoading, error } = usePartnerSearch(filters);

  useEffect(() => {
    document.title = 'Partner Search — CORDIS Explorer';
  }, []);

  function applyFilters(updates: Partial<PartnerSearchFilters>) {
    const next = { ...filters, ...updates, page: 1 };
    setFilters(next);
    const params: Record<string, string> = {};
    if (next.callId) params.callId = next.callId;
    if (next.cluster) params.cluster = next.cluster;
    if (next.country) params.country = next.country;
    if (next.page > 1) params.page = String(next.page);
    setSearchParams(params, { replace: true });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          Partner Search Hub
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Find organisations actively seeking or offering EU research partnership opportunities via the F&T Portal, enriched with their CORDIS project track record.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-8 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Call reference (e.g. HORIZON-CL4-2026-TWIN-01)"
              value={callInput}
              onChange={(e) => setCallInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') applyFilters({ callId: callInput }); }}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
            />
          </div>
          <select
            value={filters.country ?? ''}
            onChange={(e) => applyFilters({ country: e.target.value || undefined })}
            className="px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none"
          >
            <option value="">All countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => applyFilters({ callId: callInput })}
            className="px-4 py-2 rounded-lg bg-[var(--color-eu-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </div>
        <ClusterBubbles
          selected={filters.cluster ?? null}
          onChange={(v) => applyFilters({ cluster: v ?? undefined })}
          label="Filter by Horizon Europe Cluster"
        />
      </div>

      {/* F&T unavailable fallback */}
      {data?.ftUnavailable && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm">
          <p className="text-amber-300 font-medium mb-1">F&T Portal API unavailable</p>
          <p className="text-[var(--color-text-secondary)]">
            Browse partnership requests directly on the{' '}
            <a
              href="https://ec.europa.eu/research/participants/portal/desktop/en/organisations/partner-search.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 underline"
            >
              F&T Portal partner search
            </a>.
          </p>
        </div>
      )}

      {/* Results */}
      {isLoading && <Spinner />}
      {error && <p className="text-red-400 text-sm">{error.message}</p>}

      {!isLoading && data && !data.ftUnavailable && (
        <>
          {data.callTitle && (
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Call: <span className="text-[var(--color-text-primary)] font-medium">{data.callTitle}</span>
            </p>
          )}
          {data.profiles.length === 0 ? (
            <EmptyState
              title="No active partnership requests found"
              description="No profiles match your filters. Be the first to post yours on the F&T Portal."
              action={
                <a
                  href="https://ec.europa.eu/research/participants/portal/desktop/en/organisations/partner-search.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-eu-blue-lighter)] underline"
                >
                  Post on F&T Portal →
                </a>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {data.profiles.map(p => <PartnerCard key={p.id} profile={p} />)}
              </div>
              <Pagination
                page={filters.page}
                pageSize={PAGE_SIZE}
                total={data.total}
                onPageChange={(p) => {
                  const next = { ...filters, page: p };
                  setFilters(next);
                  setSearchParams(
                    Object.fromEntries(
                      Object.entries({ callId: next.callId, cluster: next.cluster, country: next.country, page: String(p) })
                        .filter(([, v]) => v) as [string, string][]
                    ),
                    { replace: true },
                  );
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
```

### 2.6 — Register route in `client/src/App.tsx`

- [ ] Add import and route:

```typescript
import PartnerSearchPage from './pages/PartnerSearchPage';
// inside <Routes>:
<Route path="/partner-search" element={<PartnerSearchPage />} />
```

### 2.7 — Add to `client/src/pages/HomePage.tsx` tools grid

- [ ] Find the existing tools grid array/section and add:

```tsx
{
  href: '/partner-search',
  icon: '🤝',
  title: 'Partner Search Hub',
  description: 'Find organisations actively seeking EU research partners via the F&T Portal, enriched with their CORDIS track record.',
}
```

### 2.8 — Add "Find partners →" badge to `client/src/components/grant-match/MatchCard.tsx`

- [ ] After the `callId` display in each grant card, add:

```tsx
{result.callId && (
  <a
    href={`/partner-search?callId=${encodeURIComponent(result.callId)}`}
    className="inline-flex items-center gap-1 text-xs text-[var(--color-eu-blue-lighter)] hover:underline mt-1"
  >
    🤝 Find partners →
  </a>
)}
```

### 2.9 — Update sitemap

- [ ] Add to `client/public/sitemap.xml`:

```xml
<url>
  <loc>https://cordis-explorer.eu/partner-search</loc>
  <lastmod>2026-04-03</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.8</priority>
</url>
```

### 2.10 — Commit

- [ ] `git add` all modified files
- [ ] `git commit -m "feat: add Partner Search Hub page with F&T Portal proxy and CORDIS enrichment"`
- [ ] Verify: navigate to `/partner-search`, enter a call ID or select cluster → cards appear (or fallback banner).

---

## Task 3: Open Call Alerts / Watchlist

**Files:**
- Create: `server/src/watchlist-route.ts`
- Modify: `server/src/index.ts`
- Create: `client/src/hooks/useWatchlist.ts`
- Modify: `client/src/components/grant-match/MatchCard.tsx`

### 3.1 — Create Supabase table

- [ ] Run in Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS call_watchlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  call_id     text NOT NULL,
  call_title  text NOT NULL,
  cluster     text,
  deadline    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, call_id)
);

ALTER TABLE call_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own watchlist"
  ON call_watchlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3.2 — Create `server/src/watchlist-route.ts`

- [ ] Create the file:

```typescript
import { Router } from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from './auth-middleware.js';

export const watchlistRouter = Router();

function getAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// GET /api/watchlist — list saved calls for the authenticated user
watchlistRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from('call_watchlist')
    .select('*')
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ items: data });
});

// POST /api/watchlist — add a call
watchlistRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { call_id, call_title, cluster, deadline } = req.body;
  if (!call_id || !call_title) {
    res.status(400).json({ error: 'call_id and call_title are required' });
    return;
  }

  const supabase = getAdmin();
  const { error } = await supabase
    .from('call_watchlist')
    .upsert(
      { user_id: req.userId!, call_id, call_title, cluster, deadline },
      { onConflict: 'user_id,call_id' },
    );

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true });
});

// DELETE /api/watchlist/:callId — remove a call
watchlistRouter.delete('/:callId', requireAuth, async (req: Request, res: Response) => {
  const supabase = getAdmin();
  const { error } = await supabase
    .from('call_watchlist')
    .delete()
    .eq('user_id', req.userId!)
    .eq('call_id', req.params.callId);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true });
});

// POST /api/watchlist/check-deadlines — internal cron endpoint
// Call this from a Supabase Edge Function or external cron every 24h.
// Returns list of (user_id, call_id) pairs where deadline is in ≤30 days.
watchlistRouter.post('/check-deadlines', async (req: Request, res: Response) => {
  // Protect with a shared secret
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const supabase = getAdmin();
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('call_watchlist')
    .select('user_id, call_id, call_title, deadline')
    .lte('deadline', in30)
    .gte('deadline', now.toISOString().slice(0, 10));

  if (error) { res.status(500).json({ error: error.message }); return; }
  // In a production setup, iterate `data` and send emails via Supabase Auth / Resend.
  // For now, return the list so an external job can act on it.
  res.json({ alerts: data });
});
```

### 3.3 — Register route in `server/src/index.ts`

- [ ] Add:

```typescript
import { watchlistRouter } from './watchlist-route.js';
app.use('/api/watchlist', watchlistRouter);
```

### 3.4 — Create `client/src/hooks/useWatchlist.ts`

- [ ] Create the file:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface WatchlistItem {
  id: string;
  call_id: string;
  call_title: string;
  cluster?: string;
  deadline?: string;
  created_at: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
}

export function useWatchlist() {
  return useQuery<WatchlistItem[]>({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const headers = await authHeaders();
      if (!headers['Authorization']) return [];
      const resp = await fetch('/api/watchlist', { headers });
      if (!resp.ok) return [];
      const data = await resp.json();
      return data.items ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useToggleWatchlist() {
  const qc = useQueryClient();
  const add = useMutation({
    mutationFn: async (item: { call_id: string; call_title: string; cluster?: string; deadline?: string }) => {
      const headers = { ...(await authHeaders()), 'Content-Type': 'application/json' };
      const resp = await fetch('/api/watchlist', { method: 'POST', headers, body: JSON.stringify(item) });
      if (!resp.ok) throw new Error('Failed to save');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  const remove = useMutation({
    mutationFn: async (callId: string) => {
      const headers = await authHeaders();
      const resp = await fetch(`/api/watchlist/${encodeURIComponent(callId)}`, { method: 'DELETE', headers });
      if (!resp.ok) throw new Error('Failed to remove');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  return { add, remove };
}
```

### 3.5 — Add star button to `client/src/components/grant-match/MatchCard.tsx`

- [ ] Add imports at top:

```typescript
import { useWatchlist, useToggleWatchlist } from '../../hooks/useWatchlist';
import { useAuth } from '../../contexts/AuthContext';
```

- [ ] Inside the component, add hooks and a star button in the card header:

```tsx
const { user } = useAuth();
const { data: watchlist = [] } = useWatchlist();
const { add, remove } = useToggleWatchlist();
const isSaved = watchlist.some(w => w.call_id === result.callId);

// In JSX, after the call title:
{user && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      if (isSaved) {
        remove.mutate(result.callId);
      } else {
        add.mutate({
          call_id: result.callId,
          call_title: result.callTitle,
          deadline: result.deadline,
        });
      }
    }}
    title={isSaved ? 'Remove from watchlist' : 'Save to watchlist'}
    className="text-lg transition-transform hover:scale-110"
    aria-label={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
  >
    {isSaved ? '⭐' : '☆'}
  </button>
)}
```

### 3.6 — Add env variable documentation

- [ ] Add to `.env.example` (or top of `server/src/index.ts` comment):

```
CRON_SECRET=<random secret for /api/watchlist/check-deadlines>
```

### 3.7 — Commit

- [ ] `git add` all modified files
- [ ] `git commit -m "feat: add open call watchlist with star button and deadline check endpoint"`
- [ ] Verify: sign in, go to grant match, click star on a result — star turns filled. Call to GET /api/watchlist returns saved item.

---

## Task 4: Action Type + TRL Filters

**Files:**
- Modify: `client/src/api/types.ts`
- Modify: `client/src/api/query-builder.ts`
- Modify: `client/src/components/search/FilterPanel.tsx`
- Modify: `client/src/components/search/ActiveFilters.tsx`
- Modify: `client/src/pages/SearchPage.tsx`

### 4.1 — Extend `SearchFilters` in `client/src/api/types.ts`

- [ ] In the `SearchFilters` interface, add three fields after `managingInstitution`:

```typescript
actionType?: 'RIA' | 'IA' | 'CSA' | 'ERC' | 'MSCA' | null;
trlMin?: number | null; // 1–9
trlMax?: number | null; // 1–9
```

### 4.2 — Add SPARQL clauses to `client/src/api/query-builder.ts`

- [ ] After the cluster filter block in `buildProjectSearchQuery`, add:

```typescript
// Action type filter — matched via funding scheme topic label suffix
if (filters.actionType) {
  const at = escapeString(filters.actionType.toUpperCase());
  whereClauses.push(
    '?project eurio:isFundedBy ?atGrant .',
    '{ ?atGrant eurio:hasFundingSchemeTopic ?atTopic . } UNION { ?atGrant eurio:hasFundingSchemeCall ?atTopic . }',
    '?atTopic rdfs:label ?atTopicLabel .',
    // Action type appears as a segment in the topic label, e.g. "HORIZON-CL4-2026-RIA-01" or "HORIZON-MSCA-2026-PF-01"
    `FILTER(CONTAINS(UCASE(?atTopicLabel), '-${at}-') || REGEXP(UCASE(?atTopicLabel), '-${at}$'))`,
  );
}

// TRL filter — use eurio:minTrl / eurio:maxTrl if present
// These are optional in EURIO so we use OPTIONAL + FILTER
if (filters.trlMin != null || filters.trlMax != null) {
  whereClauses.push(
    'OPTIONAL { ?project eurio:isFundedBy ?trlGrant . ?trlGrant eurio:minTrl ?minTrl . }',
    'OPTIONAL { ?project eurio:isFundedBy ?trlGrant2 . ?trlGrant2 eurio:maxTrl ?maxTrl . }',
  );
  if (filters.trlMin != null) {
    whereClauses.push(`FILTER(!BOUND(?maxTrl) || ?maxTrl >= ${filters.trlMin})`);
  }
  if (filters.trlMax != null) {
    whereClauses.push(`FILTER(!BOUND(?minTrl) || ?minTrl <= ${filters.trlMax})`);
  }
}
```

### 4.3 — Add filter dropdowns to `client/src/components/search/FilterPanel.tsx`

- [ ] In the `<div className="flex flex-wrap gap-3 items-end">` section, add two new `<FilterSelect>` elements after the existing ones:

```tsx
<FilterSelect
  label="Action Type"
  value={filters.actionType}
  options={['RIA', 'IA', 'CSA', 'ERC', 'MSCA']}
  onChange={(v) => onFilterChange('actionType', v)}
/>
<FilterSelect
  label="Min TRL"
  value={filters.trlMin != null ? String(filters.trlMin) : null}
  options={['1','2','3','4','5','6','7','8','9']}
  onChange={(v) => onFilterChange('trlMin', v)}
/>
<FilterSelect
  label="Max TRL"
  value={filters.trlMax != null ? String(filters.trlMax) : null}
  options={['1','2','3','4','5','6','7','8','9']}
  onChange={(v) => onFilterChange('trlMax', v)}
/>
```

Note: `onFilterChange` accepts `string | null`. For numeric TRL values, `SearchPage.tsx` will convert the string to a number when constructing the filters object.

### 4.4 — Add active filter pills to `client/src/components/search/ActiveFilters.tsx`

- [ ] After the existing filter pill rendering logic, add:

```tsx
{filters.actionType && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
    Action: {filters.actionType}
    <button onClick={() => onFilterChange('actionType', null)} className="hover:text-white">×</button>
  </span>
)}
{filters.trlMin != null && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-300 border border-orange-500/20">
    TRL ≥ {filters.trlMin}
    <button onClick={() => onFilterChange('trlMin', null)} className="hover:text-white">×</button>
  </span>
)}
{filters.trlMax != null && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-300 border border-orange-500/20">
    TRL ≤ {filters.trlMax}
    <button onClick={() => onFilterChange('trlMax', null)} className="hover:text-white">×</button>
  </span>
)}
```

### 4.5 — Sync new filters with URL params in `client/src/pages/SearchPage.tsx`

- [ ] In `filtersFromParams`, add:

```typescript
actionType: (searchParams.get('actionType') as SearchFilters['actionType']) ?? null,
trlMin: searchParams.get('trlMin') ? parseInt(searchParams.get('trlMin')!, 10) : null,
trlMax: searchParams.get('trlMax') ? parseInt(searchParams.get('trlMax')!, 10) : null,
```

- [ ] In `filtersToParams`, add:

```typescript
if (f.actionType) params.set('actionType', f.actionType);
if (f.trlMin != null) params.set('trlMin', String(f.trlMin));
if (f.trlMax != null) params.set('trlMax', String(f.trlMax));
```

- [ ] In `handleFilterChange`, handle TRL string→number conversion:

```typescript
// In the onFilterChange handler where filters are updated:
const numericFields: (keyof SearchFilters)[] = ['trlMin', 'trlMax'];
const newValue = numericFields.includes(key) && value !== null
  ? parseInt(value as string, 10)
  : value;
setFilters(prev => ({ ...prev, [key]: newValue, page: 1 }));
```

### 4.6 — Commit

- [ ] `git add` all modified files
- [ ] `git commit -m "feat: add action type (RIA/IA/CSA/ERC/MSCA) and TRL range filters to project search"`
- [ ] Verify: search with actionType=RIA — SPARQL query includes `-RIA-` filter. Active filter pill shows. URL param persists.

---

## Task 5: Organisation Deep-Dive Page

**Files:**
- Modify: `client/src/api/query-builder.ts`
- Create: `client/src/hooks/useOrgDetail.ts`
- Create: `client/src/pages/OrgPage.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/pages/ProjectPage.tsx`
- Modify: `client/src/pages/PartnerMatchPage.tsx`
- Modify: `client/public/sitemap.xml`

### 5.1 — Add SPARQL queries to `client/src/api/query-builder.ts`

- [ ] Append three new exported functions:

```typescript
/** Fetch summary stats for an org: project count, total EC contribution, top topics, top co-applicants */
export function buildOrgSummaryQuery(orgName: string): string {
  const name = escapeString(orgName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?countryName
       (COUNT(DISTINCT ?project) AS ?projectCount)
       (SUM(xsd:decimal(COALESCE(?ecContrib, "0"))) AS ?totalFunding)
WHERE {
  ?org eurio:legalName '${name}' .
  OPTIONAL {
    ?org eurio:hasSite ?site .
    ?site eurio:hasGeographicalLocation ?country .
    ?country a eurio:Country .
    ?country eurio:name ?countryName .
  }
  OPTIONAL {
    ?project a eurio:Project .
    ?project eurio:hasInvolvedParty ?role .
    ?role eurio:isRoleOf ?org .
    OPTIONAL { ?role eurio:ecContribution ?ecContrib }
  }
}
GROUP BY ?countryName
  `.trim();
}

/** Fetch recent projects for an org */
export function buildOrgProjectsQuery(orgName: string): string {
  const name = escapeString(orgName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?title ?acronym ?identifier ?startDate ?roleLabel
WHERE {
  ?org eurio:legalName '${name}' .
  ?project a eurio:Project .
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?project eurio:title ?title .
  OPTIONAL { ?project eurio:acronym ?acronym }
  OPTIONAL { ?project eurio:identifier ?identifier }
  OPTIONAL { ?project eurio:startDate ?startDate }
  OPTIONAL { ?role eurio:roleLabel ?roleLabel }
}
ORDER BY DESC(?startDate)
LIMIT 20
  `.trim();
}

/** Fetch frequent co-applicant organisations */
export function buildOrgCoApplicantsQuery(orgName: string): string {
  const name = escapeString(orgName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT ?coOrgName (COUNT(DISTINCT ?project) AS ?sharedCount)
WHERE {
  ?org eurio:legalName '${name}' .
  ?project a eurio:Project .
  ?project eurio:hasInvolvedParty ?role1 .
  ?role1 eurio:isRoleOf ?org .
  ?project eurio:hasInvolvedParty ?role2 .
  ?role2 eurio:isRoleOf ?coOrg .
  ?coOrg eurio:legalName ?coOrgName .
  FILTER(?coOrgName != '${name}')
}
GROUP BY ?coOrgName
ORDER BY DESC(?sharedCount)
LIMIT 10
  `.trim();
}
```

### 5.2 — Create `client/src/hooks/useOrgDetail.ts`

- [ ] Create the file:

```typescript
import { useQuery } from '@tanstack/react-query';
import { executeSparql } from '../api/sparql-client';
import {
  buildOrgSummaryQuery,
  buildOrgProjectsQuery,
  buildOrgCoApplicantsQuery,
} from '../api/query-builder';

export interface OrgSummary {
  orgName: string;
  country?: string;
  projectCount: number;
  totalFunding: number;
}

export interface OrgProject {
  title: string;
  acronym?: string;
  identifier?: string;
  startDate?: string;
  role?: string;
}

export interface OrgCoApplicant {
  orgName: string;
  sharedCount: number;
}

export function useOrgSummary(orgName: string) {
  return useQuery<OrgSummary>({
    queryKey: ['orgSummary', orgName],
    queryFn: async () => {
      const data = await executeSparql(buildOrgSummaryQuery(orgName));
      const b = data.results.bindings[0];
      return {
        orgName,
        country: b?.countryName?.value,
        projectCount: parseInt(b?.projectCount?.value ?? '0', 10),
        totalFunding: parseFloat(b?.totalFunding?.value ?? '0'),
      };
    },
    enabled: !!orgName,
    staleTime: 1000 * 60 * 30,
  });
}

export function useOrgProjects(orgName: string) {
  return useQuery<OrgProject[]>({
    queryKey: ['orgProjects', orgName],
    queryFn: async () => {
      const data = await executeSparql(buildOrgProjectsQuery(orgName));
      return data.results.bindings.map(b => ({
        title: b.title?.value ?? '',
        acronym: b.acronym?.value,
        identifier: b.identifier?.value,
        startDate: b.startDate?.value?.slice(0, 10),
        role: b.roleLabel?.value,
      }));
    },
    enabled: !!orgName,
    staleTime: 1000 * 60 * 30,
  });
}

export function useOrgCoApplicants(orgName: string) {
  return useQuery<OrgCoApplicant[]>({
    queryKey: ['orgCoApplicants', orgName],
    queryFn: async () => {
      const data = await executeSparql(buildOrgCoApplicantsQuery(orgName));
      return data.results.bindings.map(b => ({
        orgName: b.coOrgName?.value ?? '',
        sharedCount: parseInt(b.sharedCount?.value ?? '0', 10),
      }));
    },
    enabled: !!orgName,
    staleTime: 1000 * 60 * 30,
  });
}
```

### 5.3 — Create `client/src/pages/OrgPage.tsx`

- [ ] Create the file:

```tsx
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrgSummary, useOrgProjects, useOrgCoApplicants } from '../hooks/useOrgDetail';
import Spinner from '../components/common/Spinner';

export default function OrgPage() {
  const { encodedName } = useParams<{ encodedName: string }>();
  const orgName = decodeURIComponent(encodedName ?? '');

  useEffect(() => {
    document.title = `${orgName} — CORDIS Explorer`;
  }, [orgName]);

  const { data: summary, isLoading: summaryLoading } = useOrgSummary(orgName);
  const { data: projects = [], isLoading: projectsLoading } = useOrgProjects(orgName);
  const { data: coApplicants = [], isLoading: coLoading } = useOrgCoApplicants(orgName);

  if (!orgName) return <p className="p-8 text-[var(--color-text-secondary)]">No organisation specified.</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{orgName}</h1>
        {summaryLoading ? <Spinner /> : summary && (
          <div className="flex flex-wrap gap-6 mt-4">
            <div>
              <p className="text-3xl font-bold text-[var(--color-eu-blue-lighter)]">{summary.projectCount}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">EU Projects</p>
            </div>
            {summary.totalFunding > 0 && (
              <div>
                <p className="text-3xl font-bold text-[var(--color-eu-blue-lighter)]">
                  €{(summary.totalFunding / 1_000_000).toFixed(1)}M
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Total EC Funding</p>
              </div>
            )}
            {summary.country && (
              <div>
                <p className="text-xl font-semibold text-[var(--color-text-primary)]">{summary.country}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Country</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Projects */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Recent Projects</h2>
        {projectsLoading ? <Spinner /> : (
          <div className="divide-y divide-[var(--color-border)]">
            {projects.map((p, i) => (
              <div key={i} className="py-3 flex items-start justify-between gap-4">
                <div>
                  {p.identifier ? (
                    <Link
                      to={`/project/${encodeURIComponent(p.identifier)}`}
                      className="text-sm font-medium text-[var(--color-eu-blue-lighter)] hover:underline"
                    >
                      {p.acronym ? `${p.acronym} — ` : ''}{p.title}
                    </Link>
                  ) : (
                    <p className="text-sm text-[var(--color-text-primary)]">{p.acronym ? `${p.acronym} — ` : ''}{p.title}</p>
                  )}
                  {p.role && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{p.role}</p>}
                </div>
                {p.startDate && (
                  <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">{p.startDate.slice(0, 4)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Co-applicants */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Frequent Partners</h2>
        {coLoading ? <Spinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {coApplicants.map((c, i) => (
              <Link
                key={i}
                to={`/org/${encodeURIComponent(c.orgName)}`}
                className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-eu-blue-lighter)] transition-colors"
              >
                <span className="text-sm text-[var(--color-text-primary)] truncate">{c.orgName}</span>
                <span className="shrink-0 text-xs text-[var(--color-text-secondary)] ml-2">{c.sharedCount} shared</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Back link */}
      <div>
        <Link to="/search" className="text-sm text-[var(--color-eu-blue-lighter)] hover:underline">
          ← Back to search
        </Link>
      </div>
    </div>
  );
}
```

### 5.4 — Add route to `client/src/App.tsx`

- [ ] Add:

```typescript
import OrgPage from './pages/OrgPage';
// inside <Routes>:
<Route path="/org/:encodedName" element={<OrgPage />} />
```

### 5.5 — Link org names from `client/src/pages/ProjectPage.tsx`

- [ ] Find where participant `orgName` is rendered. Wrap it in a `<Link>`:

```tsx
import { Link } from 'react-router-dom';
// ...
<Link
  to={`/org/${encodeURIComponent(participant.orgName)}`}
  className="text-[var(--color-eu-blue-lighter)] hover:underline"
>
  {participant.orgName}
</Link>
```

### 5.6 — Link org names from `client/src/pages/PartnerMatchPage.tsx`

- [ ] Find where `result.orgName` is rendered in partner match results. Wrap in `<Link>`:

```tsx
<Link
  to={`/org/${encodeURIComponent(result.orgName)}`}
  className="text-[var(--color-eu-blue-lighter)] hover:underline"
>
  {result.orgName}
</Link>
```

### 5.7 — Commit

- [ ] `git add` all modified files
- [ ] `git commit -m "feat: add organisation deep-dive page with project history and co-applicant network"`
- [ ] Verify: click an org name on a project detail page → `/org/Org%20Name` loads with stats + project list.

---

## Task 6: Brokerage Events Calendar

**Files:**
- Create: `server/src/events-route.ts`
- Modify: `server/src/index.ts`
- Create: `client/src/hooks/useEvents.ts`
- Create: `client/src/pages/EventsPage.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/pages/HomePage.tsx`
- Modify: `client/public/sitemap.xml`

### 6.1 — Create `server/src/events-route.ts`

- [ ] Create the file:

```typescript
import { Router } from 'express';
import type { Request, Response } from 'express';
import { getCacheKey, getCached, setCache } from './cache.js';

export const eventsRouter = Router();

// EEN public events API. Endpoint format verified against https://een.ec.europa.eu
const EEN_API = 'https://een.ec.europa.eu/api/v2/events';

// Cluster → EEN keyword mapping (best-effort; EEN doesn't natively use HE cluster numbers)
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

async function fetchEenEvents(cluster?: string, country?: string, page = 1): Promise<{ events: EenEvent[]; total: number }> {
  const params = new URLSearchParams({
    _format: 'json',
    items_per_page: '20',
    page: String(page - 1), // EEN uses 0-based pages
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

    const json = await resp.json() as any;
    const items: any[] = Array.isArray(json) ? json : json.data ?? json.items ?? [];
    const total: number = json.total ?? json.meta?.total ?? items.length;

    const events: EenEvent[] = items.map((item: any) => ({
      id: String(item.nid ?? item.id ?? Math.random()),
      title: item.title ?? item.name ?? 'Event',
      description: item.body ?? item.description ?? '',
      startDate: item.field_date_from ?? item.startDate ?? item.date ?? '',
      endDate: item.field_date_to ?? item.endDate,
      country: item.field_country ?? item.country,
      city: item.field_city ?? item.city,
      registrationUrl: item.field_registration_url ?? item.url ?? `https://een.ec.europa.eu/events/${item.nid ?? ''}`,
      source: 'een',
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

  const cacheKey = getCacheKey(`events:${cluster}:${country}:${page}`);
  const cached = getCached(cacheKey);
  if (cached) { res.json(cached); return; }

  const { events, total } = await fetchEenEvents(cluster, country, pageNum);
  const payload = { events, total, page: pageNum };
  setCache(cacheKey, payload);
  res.json(payload);
});
```

### 6.2 — Register in `server/src/index.ts`

- [ ] Add:

```typescript
import { eventsRouter } from './events-route.js';
app.use('/api/events', eventsRouter);
```

### 6.3 — Create `client/src/hooks/useEvents.ts`

- [ ] Create the file:

```typescript
import { useQuery, keepPreviousData } from '@tanstack/react-query';

export interface BrokerageEvent {
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

export interface EventsResponse {
  events: BrokerageEvent[];
  total: number;
  page: number;
}

export interface EventFilters {
  cluster?: string;
  country?: string;
  page: number;
}

async function fetchEvents(filters: EventFilters): Promise<EventsResponse> {
  const params = new URLSearchParams();
  if (filters.cluster) params.set('cluster', filters.cluster);
  if (filters.country) params.set('country', filters.country);
  params.set('page', String(filters.page));

  const resp = await fetch(`/api/events?${params}`);
  if (!resp.ok) throw new Error(`Events fetch failed: ${resp.status}`);
  return resp.json();
}

export function useEvents(filters: EventFilters) {
  return useQuery<EventsResponse>({
    queryKey: ['events', filters],
    queryFn: () => fetchEvents(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 15,
  });
}
```

### 6.4 — Create `client/src/pages/EventsPage.tsx`

- [ ] Create the file:

```tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useCountries } from '../hooks/useCountries';
import ClusterBubbles from '../components/common/ClusterBubbles';
import Pagination from '../components/common/Pagination';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import type { EventFilters } from '../hooks/useEvents';

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: countries = [] } = useCountries();

  const [filters, setFilters] = useState<EventFilters>({
    cluster: searchParams.get('cluster') ?? undefined,
    country: searchParams.get('country') ?? undefined,
    page: parseInt(searchParams.get('page') ?? '1', 10),
  });

  useEffect(() => {
    document.title = 'Brokerage Events — CORDIS Explorer';
  }, []);

  const { data, isLoading, error } = useEvents(filters);

  function applyFilters(updates: Partial<EventFilters>) {
    const next = { ...filters, ...updates, page: 1 };
    setFilters(next);
    const params: Record<string, string> = {};
    if (next.cluster) params.cluster = next.cluster;
    if (next.country) params.country = next.country;
    if (next.page > 1) params.page = String(next.page);
    setSearchParams(params, { replace: true });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Brokerage Events</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          EU research networking and brokerage events from the Enterprise Europe Network (EEN).
          Find partnership opportunities, matchmaking sessions, and consortium-building events.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-8 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="flex flex-wrap gap-3 items-end">
          <select
            value={filters.country ?? ''}
            onChange={(e) => applyFilters({ country: e.target.value || undefined })}
            className="px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none"
          >
            <option value="">All countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <ClusterBubbles
          selected={filters.cluster ?? null}
          onChange={(v) => applyFilters({ cluster: v ?? undefined })}
          label="Filter by Horizon Europe Cluster"
        />
      </div>

      {isLoading && <Spinner />}
      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300">
          Could not load events.{' '}
          <a href="https://een.ec.europa.eu/events" target="_blank" rel="noopener noreferrer" className="underline">
            Browse on een.ec.europa.eu →
          </a>
        </div>
      )}

      {!isLoading && data && (
        <>
          {data.events.length === 0 ? (
            <EmptyState
              title="No events found"
              description="Try different filters, or browse events directly on the EEN website."
              action={
                <a href="https://een.ec.europa.eu/events" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-eu-blue-lighter)] underline">
                  Browse on EEN →
                </a>
              }
            />
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {data.events.map(ev => (
                  <div key={ev.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 hover:border-[var(--color-eu-blue-lighter)] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{ev.title}</h3>
                      <span className="shrink-0 text-xs text-[var(--color-text-secondary)] whitespace-nowrap">{formatDate(ev.startDate)}</span>
                    </div>
                    {(ev.city || ev.country) && (
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        📍 {[ev.city, ev.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {ev.description && (
                      <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: ev.description.replace(/<[^>]+>/g, ' ').trim() }}
                      />
                    )}
                    {ev.registrationUrl && (
                      <a
                        href={ev.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-eu-blue-lighter)] hover:underline mt-3"
                      >
                        Register / Learn more →
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <Pagination
                page={filters.page}
                pageSize={PAGE_SIZE}
                total={data.total}
                onPageChange={(p) => {
                  const next = { ...filters, page: p };
                  setFilters(next);
                  const params: Record<string, string> = {};
                  if (next.cluster) params.cluster = next.cluster;
                  if (next.country) params.country = next.country;
                  params.page = String(p);
                  setSearchParams(params, { replace: true });
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
```

### 6.5 — Add route in `client/src/App.tsx`

- [ ] Add:

```typescript
import EventsPage from './pages/EventsPage';
// inside <Routes>:
<Route path="/events" element={<EventsPage />} />
```

### 6.6 — Add to `client/src/pages/HomePage.tsx` tools grid

- [ ] Add tool card:

```tsx
{
  href: '/events',
  icon: '📅',
  title: 'Brokerage Events',
  description: 'Find EU research networking and matchmaking events from the Enterprise Europe Network, filterable by cluster and country.',
}
```

### 6.7 — Update sitemap

- [ ] Add to `client/public/sitemap.xml`:

```xml
<url>
  <loc>https://cordis-explorer.eu/events</loc>
  <lastmod>2026-04-03</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.7</priority>
</url>
```

### 6.8 — Commit

- [ ] `git add` all modified files
- [ ] `git commit -m "feat: add brokerage events calendar from EEN API"`
- [ ] Verify: `/events` loads; EEN API may be rate-limited so verify fallback empty state + EEN link shows.

---

## Task 7: MSCA-Specific Flow

**Files:**
- Modify: `client/src/api/query-builder.ts`
- Create: `client/src/hooks/useMscaSearch.ts`
- Create: `client/src/pages/MscaPage.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/pages/HomePage.tsx`
- Modify: `client/public/sitemap.xml`

### 7.1 — Add MSCA queries to `client/src/api/query-builder.ts`

- [ ] Append two new exported functions:

```typescript
/** Search for MSCA projects by keyword, filtered to MSCA topic patterns */
export function buildMscaProjectSearchQuery(keyword: string, mscaType: string, page: number, pageSize: number): string {
  const offset = (page - 1) * pageSize;
  const kw = keyword ? `FILTER(CONTAINS(LCASE(?title), '${escapeString(keyword.toLowerCase())}') || CONTAINS(LCASE(COALESCE(?objective,"")), '${escapeString(keyword.toLowerCase())}'))` : '';
  const typeFilter = mscaType && mscaType !== 'all'
    ? `FILTER(CONTAINS(UCASE(?mscaLabel), '${escapeString(mscaType.toUpperCase())}'))`
    : '';

  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?project ?title ?acronym ?identifier ?startDate ?mscaLabel ?countryName
WHERE {
  ?project a eurio:Project .
  ?project eurio:title ?title .
  OPTIONAL { ?project eurio:acronym ?acronym }
  OPTIONAL { ?project eurio:identifier ?identifier }
  OPTIONAL { ?project eurio:startDate ?startDate }
  OPTIONAL { ?project eurio:objective ?objective }

  # Restrict to MSCA calls
  ?project eurio:isFundedBy ?mscaGrant .
  { ?mscaGrant eurio:hasFundingSchemeTopic ?mscaTopic . } UNION { ?mscaGrant eurio:hasFundingSchemeCall ?mscaTopic . }
  ?mscaTopic rdfs:label ?mscaLabel .
  FILTER(
    CONTAINS(UCASE(?mscaLabel), 'MSCA') ||
    CONTAINS(UCASE(?mscaLabel), 'MARIE-CURIE') ||
    CONTAINS(UCASE(?mscaLabel), 'MARIE CURIE') ||
    CONTAINS(UCASE(?mscaLabel), 'H2020-MSCA') ||
    CONTAINS(UCASE(?mscaLabel), 'FP7-PEOPLE')
  )
  ${typeFilter}

  # Coordinator country
  OPTIONAL {
    ?project eurio:hasInvolvedParty ?coordRole .
    ?coordRole eurio:roleLabel ?rl .
    FILTER(CONTAINS(UCASE(?rl), 'COORDINATOR'))
    ?coordRole eurio:isRoleOf ?coordOrg .
    ?coordOrg eurio:hasSite ?coordSite .
    ?coordSite eurio:hasGeographicalLocation ?coordCountry .
    ?coordCountry a eurio:Country .
    ?coordCountry eurio:name ?countryName .
  }

  ${kw}
}
ORDER BY DESC(?startDate)
LIMIT ${pageSize}
OFFSET ${offset}
  `.trim();
}

/** Search for MSCA supervisor/host organisations by research area */
export function buildMscaSupervisorSearchQuery(researchArea: string): string {
  const area = escapeString(researchArea.toLowerCase());
  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?orgName ?countryName (COUNT(DISTINCT ?project) AS ?mscaProjectCount)
       (GROUP_CONCAT(DISTINCT ?title; SEPARATOR="||") AS ?projectTitles)
WHERE {
  ?project a eurio:Project .
  ?project eurio:title ?title .
  FILTER(CONTAINS(LCASE(?title), '${area}'))

  # Filter to MSCA projects
  ?project eurio:isFundedBy ?mscaGrant .
  { ?mscaGrant eurio:hasFundingSchemeTopic ?mscaTopic . } UNION { ?mscaGrant eurio:hasFundingSchemeCall ?mscaTopic . }
  ?mscaTopic rdfs:label ?mscaLabel .
  FILTER(CONTAINS(UCASE(?mscaLabel), 'MSCA') || CONTAINS(UCASE(?mscaLabel), 'MARIE') || CONTAINS(UCASE(?mscaLabel), 'FP7-PEOPLE'))

  # Get PI/host orgs
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?org eurio:legalName ?orgName .
  OPTIONAL {
    ?org eurio:hasSite ?site .
    ?site eurio:hasGeographicalLocation ?country .
    ?country a eurio:Country .
    ?country eurio:name ?countryName .
  }
}
GROUP BY ?orgName ?countryName
ORDER BY DESC(?mscaProjectCount)
LIMIT 20
  `.trim();
}
```

### 7.2 — Create `client/src/hooks/useMscaSearch.ts`

- [ ] Create the file:

```typescript
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { executeSparql } from '../api/sparql-client';
import { buildMscaProjectSearchQuery, buildMscaSupervisorSearchQuery } from '../api/query-builder';
import type { ProjectSummary } from '../api/types';

export type MscaType = 'all' | 'PF' | 'DN' | 'SE' | 'IF' | 'COFUND';

export interface MscaFilters {
  keyword: string;
  mscaType: MscaType;
  page: number;
  pageSize: number;
}

export interface MscaSupervisorOrg {
  orgName: string;
  country?: string;
  mscaProjectCount: number;
  projectTitles: string[];
}

export function useMscaProjects(filters: MscaFilters) {
  return useQuery<ProjectSummary[]>({
    queryKey: ['mscaProjects', filters],
    queryFn: async () => {
      const data = await executeSparql(
        buildMscaProjectSearchQuery(filters.keyword, filters.mscaType, filters.page, filters.pageSize)
      );
      return data.results.bindings.map(b => ({
        uri: b.project?.value ?? '',
        title: b.title?.value ?? '',
        acronym: b.acronym?.value,
        identifier: b.identifier?.value,
        startDate: b.startDate?.value?.slice(0, 10),
        countries: b.countryName?.value ? [b.countryName.value] : [],
        topicLabel: b.mscaLabel?.value,
      }));
    },
    placeholderData: keepPreviousData,
    enabled: true,
  });
}

export function useMscaSupervisors(researchArea: string) {
  return useQuery<MscaSupervisorOrg[]>({
    queryKey: ['mscaSupervisors', researchArea],
    queryFn: async () => {
      const data = await executeSparql(buildMscaSupervisorSearchQuery(researchArea));
      return data.results.bindings.map(b => ({
        orgName: b.orgName?.value ?? '',
        country: b.countryName?.value,
        mscaProjectCount: parseInt(b.mscaProjectCount?.value ?? '0', 10),
        projectTitles: (b.projectTitles?.value ?? '').split('||').filter(Boolean).slice(0, 3),
      }));
    },
    enabled: researchArea.length >= 3,
    staleTime: 1000 * 60 * 30,
  });
}
```

### 7.3 — Create `client/src/pages/MscaPage.tsx`

- [ ] Create the file:

```tsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMscaProjects, useMscaSupervisors } from '../hooks/useMscaSearch';
import type { MscaType } from '../hooks/useMscaSearch';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

const PAGE_SIZE = 20;

const MSCA_TYPES: { value: MscaType; label: string; description: string }[] = [
  { value: 'all', label: 'All MSCA', description: '' },
  { value: 'PF', label: 'Postdoctoral Fellowships', description: 'Individual fellowships for experienced researchers' },
  { value: 'DN', label: 'Doctoral Networks', description: 'Joint doctoral training programs' },
  { value: 'SE', label: 'Staff Exchanges', description: 'Short-term secondments between organisations' },
  { value: 'IF', label: 'Individual Fellowships (H2020)', description: 'Previous generation of PF' },
  { value: 'COFUND', label: 'COFUND', description: 'Co-funding of regional or national programs' },
];

export default function MscaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'projects' | 'supervisors'>(
    (searchParams.get('tab') as 'projects' | 'supervisors') ?? 'projects'
  );
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');
  const [inputValue, setInputValue] = useState(keyword);
  const [mscaType, setMscaType] = useState<MscaType>((searchParams.get('type') as MscaType) ?? 'all');
  const [page, setPage] = useState(parseInt(searchParams.get('page') ?? '1', 10));
  const [supervisorArea, setSupervisorArea] = useState(searchParams.get('area') ?? '');
  const [supervisorInput, setSupervisorInput] = useState(supervisorArea);

  useEffect(() => {
    document.title = 'MSCA Search — CORDIS Explorer';
  }, []);

  const { data: projects = [], isLoading: projectsLoading } = useMscaProjects({
    keyword,
    mscaType,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: supervisors = [], isLoading: supervisorsLoading } = useMscaSupervisors(supervisorArea);

  function search() {
    setKeyword(inputValue);
    setPage(1);
    const params: Record<string, string> = { tab: activeTab };
    if (inputValue) params.q = inputValue;
    if (mscaType !== 'all') params.type = mscaType;
    setSearchParams(params, { replace: true });
  }

  function searchSupervisors() {
    setSupervisorArea(supervisorInput);
    setSearchParams({ tab: 'supervisors', area: supervisorInput }, { replace: true });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          MSCA Research Explorer
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Search Marie Skłodowska-Curie Actions projects, find Postdoctoral Fellowship opportunities,
          and discover host organisations and supervisors by research area.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] w-fit">
        {(['projects', 'supervisors'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearchParams({ tab }, { replace: true }); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-[var(--color-eu-blue)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab === 'projects' ? 'Projects' : 'Supervisors & Hosts'}
          </button>
        ))}
      </div>

      {activeTab === 'projects' && (
        <>
          {/* Search bar */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Search MSCA projects (e.g. quantum computing, RNA biology…)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') search(); }}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
            />
            <button
              onClick={search}
              className="px-5 py-2 rounded-lg bg-[var(--color-eu-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>

          {/* MSCA type filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {MSCA_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setMscaType(t.value)}
                title={t.description}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  mscaType === t.value
                    ? 'bg-[var(--color-eu-blue)] text-white border-transparent'
                    : 'text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-eu-blue-lighter)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {projectsLoading && <Spinner />}
          {!projectsLoading && projects.length === 0 && (
            <EmptyState title="No MSCA projects found" description="Try different keywords or MSCA type." />
          )}
          {!projectsLoading && projects.length > 0 && (
            <>
              <div className="divide-y divide-[var(--color-border)] mb-8">
                {projects.map((p, i) => (
                  <div key={i} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {p.identifier ? (
                          <Link
                            to={`/project/${encodeURIComponent(p.identifier)}`}
                            className="text-sm font-medium text-[var(--color-eu-blue-lighter)] hover:underline"
                          >
                            {p.acronym ? `${p.acronym} — ` : ''}{p.title}
                          </Link>
                        ) : (
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">{p.acronym ? `${p.acronym} — ` : ''}{p.title}</p>
                        )}
                        {p.countries.length > 0 && (
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{p.countries.join(', ')}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        {p.startDate && <p className="text-xs text-[var(--color-text-secondary)]">{p.startDate.slice(0, 4)}</p>}
                        {p.topicLabel && (
                          <span className="text-xs font-mono text-[var(--color-text-secondary)] block mt-0.5 max-w-[160px] truncate">
                            {p.topicLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={projects.length === PAGE_SIZE ? (page + 1) * PAGE_SIZE : (page - 1) * PAGE_SIZE + projects.length}
                onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }}
              />
            </>
          )}
        </>
      )}

      {activeTab === 'supervisors' && (
        <>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Research area (e.g. machine learning, proteomics, urban planning…)"
              value={supervisorInput}
              onChange={(e) => setSupervisorInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') searchSupervisors(); }}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
            />
            <button
              onClick={searchSupervisors}
              className="px-5 py-2 rounded-lg bg-[var(--color-eu-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Find Hosts
            </button>
          </div>

          {supervisorsLoading && <Spinner />}
          {!supervisorsLoading && supervisors.length === 0 && supervisorArea.length >= 3 && (
            <EmptyState title="No host organisations found" description="Try a broader research area term." />
          )}
          {!supervisorsLoading && supervisors.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {supervisors.map((org, i) => (
                <Link
                  key={i}
                  to={`/org/${encodeURIComponent(org.orgName)}`}
                  className="block p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-eu-blue-lighter)] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{org.orgName}</p>
                    <span className="shrink-0 text-xs text-[var(--color-eu-blue-lighter)] font-medium">{org.mscaProjectCount} MSCA</span>
                  </div>
                  {org.country && <p className="text-xs text-[var(--color-text-secondary)] mb-2">{org.country}</p>}
                  <ul className="text-xs text-[var(--color-text-secondary)] space-y-0.5 list-disc list-inside">
                    {org.projectTitles.slice(0, 2).map((t, j) => (
                      <li key={j} className="truncate">{t}</li>
                    ))}
                  </ul>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

### 7.4 — Add route in `client/src/App.tsx`

- [ ] Add:

```typescript
import MscaPage from './pages/MscaPage';
// inside <Routes>:
<Route path="/msca" element={<MscaPage />} />
```

### 7.5 — Add to `client/src/pages/HomePage.tsx` tools grid

- [ ] Add tool card:

```tsx
{
  href: '/msca',
  icon: '🎓',
  title: 'MSCA Explorer',
  description: 'Search Marie Skłodowska-Curie Actions projects and discover host organisations for fellowships and doctoral networks.',
}
```

### 7.6 — Update sitemap

- [ ] Add to `client/public/sitemap.xml`:

```xml
<url>
  <loc>https://cordis-explorer.eu/msca</loc>
  <lastmod>2026-04-03</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://cordis-explorer.eu/org</loc>
  <lastmod>2026-04-03</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.6</priority>
</url>
```

### 7.7 — Commit

- [ ] `git add` all modified files
- [ ] `git commit -m "feat: add MSCA-specific project and supervisor search page"`
- [ ] Verify: `/msca`, search "machine learning" → MSCA projects appear. Switch to Supervisors tab → org cards link to `/org/:name`.

---

## Post-Implementation Checklist

- [ ] Run `npm run build` from repo root — both client and server compile without TypeScript errors
- [ ] Confirm all 7 new pages render without blank screens
- [ ] Confirm existing routes (/, /search, /project/:id, /grant-match, /partner-match) still work
- [ ] Check `/api/watchlist` SQL migration was applied in Supabase (new columns visible in Table Editor)
- [ ] Check `user_usage` table has `search_enhance_count` and `partner_search_count` columns
- [ ] Test auth-gated routes: `/api/search-enhance`, `/api/partner-search-hub`, `/api/watchlist` return 401 without token
- [ ] Update `client/public/sitemap.xml` date to today on final commit

---

## Known Risks & Mitigations

| Risk | Mitigation |
|---|---|
| F&T Portal API shape may differ from spec | `fetchFtProfiles` maps generously from `_source`, `hits`, etc. Returns graceful fallback banner if unavailable. |
| EEN API endpoint/format may have changed | Returns empty list + fallback link if fetch fails or returns non-200 |
| EURIO TRL predicates (`eurio:minTrl`) may not exist | Filters wrapped in `OPTIONAL` + `BOUND()` guard — projects without TRL data still appear |
| MSCA topic labels vary across FP7/H2020/HE | FILTER checks multiple patterns: `MSCA`, `MARIE-CURIE`, `MARIE CURIE`, `FP7-PEOPLE`, `H2020-MSCA` |
| `checkAndIncrementUsage` columns missing in Supabase | SQL migration in Task 1.1 adds them with `IF NOT EXISTS` — safe to re-run |
