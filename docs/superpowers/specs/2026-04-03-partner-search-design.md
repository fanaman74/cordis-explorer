# Partner Search — Design Spec
**Date:** 2026-04-03
**Status:** Approved

## Goal

Surface live partnership requests from the European Commission's Funding & Tenders (F&T) Portal, enriched with each organisation's verified CORDIS project track record. Users can find who is actively seeking partners for a specific open call, assess their credibility from past EU projects, and click through directly to the F&T Portal to connect.

---

## Architecture & Data Flow

```
GET /api/partner-search?callId=X&cluster=N&country=Y&page=1
    │
    ├─► EC Search API (F&T Portal)
    │   https://api.tech.ec.europa.eu/search-api/prod/rest/search
    │   scope=partnerSearch, filtered by callId / cluster prefix / country
    │   → raw partner profiles (org name, country, call ref, summary, F&T URL)
    │
    └─► SPARQL (CORDIS/EURIO)     ← parallel, top 20 results only
        Look up each org by legalName
        → projectCount, top topics, 3 recent project titles

    Merge → PartnerProfile[] → client

    On failure:
    - F&T down → 503, client shows fallback link to F&T Portal directly
    - SPARQL fails → profiles returned without enrichment (cordisEnriched: false)
```

**Caching:** 15-minute server-side cache per `(callId, cluster, country)` tuple using the existing `cache.ts` module. Prevents hammering the F&T API on repeated page loads.

**F&T API note:** The EC Search API is public but not all scopes are fully documented. The exact request shape for `scope=partnerSearch` must be verified during implementation. If partner profiles are not accessible via this endpoint, the badge on grant cards degrades gracefully to a direct deep-link to `ec.europa.eu/…/partner-search?callId=X` (no count shown).

---

## Data Model

```typescript
// client/src/api/types.ts

interface PartnerProfile {
  id: string;                     // F&T profile ID
  orgName: string;
  country: string;
  callReference?: string;
  callTitle?: string;
  type: 'offer' | 'request';     // offering expertise or seeking a specific partner type
  summary: string;
  expertise: string[];
  deadline?: string;
  ftPortalUrl: string;            // deep link to their specific F&T profile
  // CORDIS enrichment — absent if SPARQL enrichment failed
  cordisProjectCount?: number;
  cordisRecentProjects?: string[];
  cordisEnriched: boolean;
}

interface PartnerSearchResponse {
  profiles: PartnerProfile[];
  total: number;
  page: number;
  callTitle?: string;             // resolved from F&T if callId was provided
}
```

---

## Server

**New file:** `server/src/partner-search-route.ts`

- Express router registered at `/api/partner-search` in `server/src/index.ts`
- Sits behind `requireAuth` middleware (free account required, consistent with all other AI/data routes)
- Parallel fetch: F&T API + SPARQL enrichment
- SPARQL enrichment runs only for the top 20 profiles to bound latency
- Returns `PartnerSearchResponse`
- No new Supabase tables — no data is persisted

Kept **separate** from `partner-match-route.ts` — that route uses Claude to score CORDIS orgs; this route proxies F&T profiles. Different purpose, different data source.

---

## Client

### New page: `/partner-search`

**Route:** Added to `App.tsx`. No `requiresAuth` on the page itself — browsable without login (matching Browse CORDIS and Knowledge Graph). The API behind it requires auth, so unauthenticated users see an `AuthGate` prompt when results are requested.

**Added to:** homepage tools grid, app navigation.

**Layout:**

1. **Filter bar**
   - Call reference text input (e.g. `HORIZON-CL4-2026-TWIN-01`)
   - `ClusterBubbles` component (reused from existing)
   - Country dropdown via `useCountries` hook (reused)
   - All filters as URL params — page is bookmarkable and shareable

2. **Result cards** — each shows:
   - Org name + country
   - `offer` / `request` badge
   - Summary text (what they're offering or seeking)
   - Expertise tags
   - CORDIS enrichment block: project count + 2–3 recent project titles
   - **"View on F&T Portal →"** CTA (external link)

3. **Empty state:** "No active partnership requests for this call yet. Be the first — post yours on the F&T Portal." with direct link.

4. **F&T unavailable state:** Banner with direct link to `ec.europa.eu/…/partner-search` — user is never left without a path forward.

5. **Pagination:** Reuses existing `Pagination` component.

### New hook: `usePartnerSearch(filters)`

Mirrors `useProjectSearch` — `@tanstack/react-query`, same stale-time pattern.

### Grant card badge integration

On `GrantMatch` and `GrantSearch` result cards, each call gets a **"Find partners →"** link beneath the call title. Links to `/partner-search?callId=CALL-ID`. No pre-fetching of counts — avoids N+1 API calls when 10+ grant results are visible simultaneously.

---

## Error Handling

| Failure | Behaviour |
|---|---|
| F&T API unavailable | 503 from server; client shows banner with direct F&T Portal link |
| F&T API returns 0 results | Empty state with link to post on F&T Portal |
| SPARQL enrichment fails | Profiles shown without CORDIS block; `cordisEnriched: false` |
| F&T `scope=partnerSearch` not supported | Grant card badge degrades to direct deep-link; `/partner-search` page shows F&T Portal embed/link |

---

## Files Changed

| File | Change |
|---|---|
| `server/src/partner-search-route.ts` | New — F&T proxy + SPARQL enrichment |
| `server/src/index.ts` | Register new router |
| `client/src/api/types.ts` | Add `PartnerProfile`, `PartnerSearchResponse` |
| `client/src/hooks/usePartnerSearch.ts` | New hook |
| `client/src/pages/PartnerSearchPage.tsx` | New page |
| `client/src/App.tsx` | Add `/partner-search` route |
| `client/src/pages/HomePage.tsx` | Add to tools grid |
| `client/src/components/grant-match/MatchResults.tsx` | Add "Find partners →" badge to call cards |
| `client/src/components/grant-search/GrantSearchForm.tsx` | Add "Find partners →" badge to call cards |

---

## Out of Scope

- Storing or caching partner profiles in Supabase
- Letting users post their own profiles from within CORDIS Explorer (F&T Portal owns that)
- AI scoring of partner profiles (the CORDIS track record is the enrichment signal)
- Contact/messaging between users
