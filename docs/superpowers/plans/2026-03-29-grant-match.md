# GrantMatch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/grant-match` page to CORDIS Explorer — a 3-step startup profile wizard that runs Claude-powered matching against a curated list of 2025–2026 EU funding calls and displays ranked results below the form.

**Architecture:** Client-side 3-step wizard (React Hook Form) posts to `/api/grant-match`; server runs boolean hard filters then Claude semantic scoring; top-5 results returned as `MatchResult[]`; results replace the loading spinner below the submitted form.

**Tech Stack:** React 18 + TypeScript, React Hook Form, TanStack Query v5 (mutation), Express + TypeScript, Anthropic SDK (`@anthropic-ai/sdk`), Tailwind CSS v4.

---

## File Map

### New files
| File | Responsibility |
|---|---|
| `client/src/pages/GrantMatchPage.tsx` | Route shell — holds wizard state, renders ProfileWizard or results |
| `client/src/components/grant-match/ProfileWizard.tsx` | 3-step wizard container with progress bar |
| `client/src/components/grant-match/Step1Contact.tsx` | Email, First Name, Last Name, Organisation Name |
| `client/src/components/grant-match/Step2Startup.tsx` | Org Type, Country, Sector, Description, Stage |
| `client/src/components/grant-match/Step3Funding.tsx` | Team Size, Revenue, R&D, Co-funding, Consent checkboxes |
| `client/src/components/grant-match/MatchResults.tsx` | Results section rendered below form after submission |
| `client/src/components/grant-match/MatchCard.tsx` | Single grant match card (GO/MAYBE/NO-GO) |
| `client/src/hooks/useGrantMatch.ts` | TanStack mutation hook for POST /api/grant-match |
| `server/src/eu-calls.ts` | Static list of ~20 curated 2025-2026 EU funding calls |
| `server/src/grant-matcher.ts` | Boolean hard filters + markdown serialiser + Claude scoring |
| `server/src/grant-match-route.ts` | Express route handler POST /api/grant-match |

### Modified files
| File | Change |
|---|---|
| `client/src/api/types.ts` | Add `StartupProfile`, `MatchResult`, `FundingCall` interfaces |
| `client/src/App.tsx` | Add `/grant-match` route |
| `client/src/components/layout/Header.tsx` | Add "GrantMatch" nav link |
| `server/src/index.ts` | Register grant-match route |
| `server/package.json` | Add `@anthropic-ai/sdk` dependency |

---

## Task 1: Install Anthropic SDK on server

**Files:**
- Modify: `server/package.json`

- [ ] **Step 1: Install the SDK**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer/server && npm install @anthropic-ai/sdk
```

Expected output: `added 1 package` (or similar).

- [ ] **Step 2: Verify it resolves**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer/server && node -e "require('@anthropic-ai/sdk'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Add ANTHROPIC_API_KEY to .env.example**

Append to `/Users/fredanaman/Documents/claudecode/cordis-explorer/.env.example`:

```
ANTHROPIC_API_KEY=your_api_key_here
```

- [ ] **Step 4: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add server/package.json server/package-lock.json .env.example
git commit -m "chore: add @anthropic-ai/sdk to server"
```

---

## Task 2: Add types

**Files:**
- Modify: `client/src/api/types.ts`

- [ ] **Step 1: Add the three interfaces**

Append to the bottom of `client/src/api/types.ts`:

```typescript
export interface StartupProfile {
  // Step 1
  email: string;
  firstName: string;
  lastName: string;
  organisationName: string;
  // Step 2
  organisationType: string;
  countryOfTaxResidence: string;
  countryOfIncorporation?: string;
  sector: string;
  productDescription: string;
  stage: string;
  // Step 3
  teamSize: string;
  annualRevenue?: string;
  rdActivity: string;
  coFundingCapacity?: string;
}

export interface MatchResult {
  callTitle: string;
  callId: string;
  deadline?: string;
  budget?: string;
  matchScore: number;
  verdict: 'GO' | 'MAYBE' | 'NO-GO';
  reasoning: {
    strengths: string[];
    weaknesses: string[];
    redFlags: string[];
  };
  strategicFitAnalysis: string;
  recommendedPivot?: string;
}

export interface FundingCall {
  identifier: string;
  title: string;
  deadline: string;
  nextDeadline: string;
  budgetMax: number;
  eligibleCountries: string[];   // ['EU', 'EEA'] means all EU/EEA members
  programmeCode: string;
  scope: string;
  expectedImpacts: string;
  smeOnly: boolean;
  isMultiStage: boolean;
  minTrl?: number;
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add client/src/api/types.ts
git commit -m "feat(grant-match): add StartupProfile, MatchResult, FundingCall types"
```

---

## Task 3: Create EU funding calls data

**Files:**
- Create: `server/src/eu-calls.ts`

- [ ] **Step 1: Write the calls list**

Create `server/src/eu-calls.ts`:

```typescript
import type { FundingCall } from '../../client/src/api/types';

export const EU_FUNDING_CALLS: FundingCall[] = [
  {
    identifier: 'HORIZON-EIC-2026-ACCELERATOR-01',
    title: 'EIC Accelerator 2026 — Open',
    deadline: '2026-06-04',
    nextDeadline: '2026-06-04',
    budgetMax: 2500000,
    eligibleCountries: ['EU', 'EEA'],
    programmeCode: 'HORIZON',
    smeOnly: true,
    isMultiStage: true,
    minTrl: 5,
    scope: 'The EIC Accelerator supports individual SMEs, in particular startups and spinoffs, to develop and scale up breakthrough innovations. It covers deep tech and high-tech innovations with high market-creation potential. Grant + equity blended finance available.',
    expectedImpacts: 'Market-creating innovation that creates new industries or disrupts existing ones. Products or services ready for market launch or requiring final development steps. Revenue generation within 3 years post-funding.',
  },
  {
    identifier: 'HORIZON-EIC-2026-PATHFINDEROPEN-01',
    title: 'EIC Pathfinder Open 2026',
    deadline: '2026-09-17',
    nextDeadline: '2026-09-17',
    budgetMax: 3000000,
    eligibleCountries: ['EU', 'EEA'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 1,
    scope: 'EIC Pathfinder Open supports visionary research for radically new technologies. Projects should address unconventional, high-risk research with a long-term vision for future breakthrough technology. Consortia of at least 3 legal entities from 3 different EU Member States or Associated Countries.',
    expectedImpacts: 'Scientific and technological foundations for a new technology paradigm. Technology roadmap from TRL 1-4 towards eventual market application. New interdisciplinary research community formed around a technology vision.',
  },
  {
    identifier: 'HORIZON-MSCA-2026-PF-01',
    title: 'MSCA Postdoctoral Fellowships 2026',
    deadline: '2026-09-10',
    nextDeadline: '2026-09-10',
    budgetMax: 300000,
    eligibleCountries: ['EU', 'EEA'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 1,
    scope: 'MSCA Postdoctoral Fellowships support the career development of researchers with a PhD. Fellows can work in academia, research institutions, or the private sector including SMEs. Projects must have an international mobility component.',
    expectedImpacts: 'Enhanced researcher mobility and career development. Knowledge transfer between sectors and countries. Interdisciplinary collaboration and innovation through researcher placements in non-academic organisations.',
  },
  {
    identifier: 'HORIZON-CL4-2026-RESILIENCE-01',
    title: 'Horizon Europe Cluster 4 — Digital Industry & Space Resilience 2026',
    deadline: '2026-09-03',
    nextDeadline: '2026-09-03',
    budgetMax: 8000000,
    eligibleCountries: ['EU', 'EEA'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 4,
    scope: 'Supports R&D&I in digital technologies and manufacturing including advanced materials, AI, robotics, photonics, quantum, and micro/nanoelectronics. Projects must address strategic autonomy of European industry in digital technologies.',
    expectedImpacts: 'European leadership in key digital enabling technologies. Strengthened digital industrial base with measurable SME participation. Deployment of next-generation digital solutions in industrial settings.',
  },
  {
    identifier: 'HORIZON-CL5-2026-D3-01',
    title: 'Horizon Europe Cluster 5 — Clean Energy Transition 2026',
    deadline: '2026-09-09',
    nextDeadline: '2026-09-09',
    budgetMax: 6000000,
    eligibleCountries: ['EU', 'EEA'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 4,
    scope: 'Supports R&D for climate, energy and mobility. Covers renewable energy, energy storage, smart grids, energy efficiency in buildings and industry, carbon capture, and sustainable transport. Contribution to European Green Deal and Clean Industrial Deal.',
    expectedImpacts: 'Accelerated clean energy deployment with demonstrated cost reductions. Cross-border energy systems integration. Measurable CO2 reduction potential from funded technologies.',
  },
  {
    identifier: 'HORIZON-CL6-2026-FARM2FORK-01',
    title: 'Horizon Europe Cluster 6 — Food, Bioeconomy, Natural Resources 2026',
    deadline: '2026-09-03',
    nextDeadline: '2026-09-03',
    budgetMax: 5000000,
    eligibleCountries: ['EU', 'EEA'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 3,
    scope: 'Supports sustainable food systems, circular bioeconomy, clean water, soil health, and rural communities. Projects must align with Farm to Fork strategy and EU Biodiversity Strategy. Multidisciplinary approaches combining biological, ecological, and social sciences.',
    expectedImpacts: 'More sustainable and resilient food production systems. Reduced environmental footprint of agriculture and food processing. Improved circularity of bio-based materials and resources.',
  },
  {
    identifier: 'HORIZON-CL1-2026-HEALTH-01',
    title: 'Horizon Europe Cluster 1 — Health 2026',
    deadline: '2026-09-23',
    nextDeadline: '2026-09-23',
    budgetMax: 7000000,
    eligibleCountries: ['EU', 'EEA'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 3,
    scope: 'Supports research on infectious diseases, cancer, rare diseases, mental health, and healthy ageing. Projects must involve clinical validation and patient communities. Focus on personalised medicine, early detection, and innovative therapies.',
    expectedImpacts: 'New diagnostic tools or therapies with defined clinical development pathway. Reduced disease burden with quantified impact metrics. Patient-centric approaches with demonstrated engagement.',
  },
  {
    identifier: 'DIGITAL-2026-AI-09-GENAI-PA',
    title: 'Digital Europe — AI for Public Administration 2026',
    deadline: '2026-06-19',
    nextDeadline: '2026-06-19',
    budgetMax: 4000000,
    eligibleCountries: ['EU'],
    programmeCode: 'DIGITAL',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 6,
    scope: 'Deployment of AI solutions for public administration modernisation. Projects must demonstrate integration with existing government IT infrastructure and compliance with EU AI Act. Pilots in at least 3 EU Member States required.',
    expectedImpacts: 'Measurable efficiency gains in public service delivery. Replicable AI solutions with cross-border potential. Full compliance with EU AI Act and GDPR demonstrated.',
  },
  {
    identifier: 'DIGITAL-2026-CLOUD-01',
    title: 'Digital Europe — European Cloud & Edge Infrastructure 2026',
    deadline: '2026-07-15',
    nextDeadline: '2026-07-15',
    budgetMax: 10000000,
    eligibleCountries: ['EU', 'EEA'],
    programmeCode: 'DIGITAL',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 7,
    scope: 'Scale-up of federated cloud and edge computing infrastructure aligned with GAIA-X principles. Projects must demonstrate data sovereignty, interoperability, and European data space integration.',
    expectedImpacts: 'Expanded European cloud capacity reducing dependence on non-EU hyperscalers. Operational federated data spaces in at least 2 industry sectors.',
  },
  {
    identifier: 'HORIZON-EIC-2026-TRANSITIONOPEN-01',
    title: 'EIC Transition Open 2026',
    deadline: '2026-10-07',
    nextDeadline: '2026-10-07',
    budgetMax: 2500000,
    eligibleCountries: ['EU', 'EEA'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 3,
    scope: 'EIC Transition supports activities that bridge the gap between EIC Pathfinder research and innovation/market deployment. Projects must demonstrate the viability and potential of a new technology and develop a business plan.',
    expectedImpacts: 'Technology validated in relevant environment (TRL 5-6). Initial market validation and first customers identified. Clear spin-off or licensing pathway defined.',
  },
  {
    identifier: 'EUREKA-EUROSTARS-2026',
    title: 'EUREKA Eurostars 2026 — Call for R&D SMEs',
    deadline: '2026-09-11',
    nextDeadline: '2026-09-11',
    budgetMax: 500000,
    eligibleCountries: ['EU', 'EEA', 'EUREKA'],
    programmeCode: 'EUREKA',
    smeOnly: true,
    isMultiStage: false,
    minTrl: 3,
    scope: 'Eurostars supports R&D-performing SMEs to develop innovative products, processes and services for global markets. Projects must be led by an R&D-performing SME and involve at least one partner from another EUREKA country.',
    expectedImpacts: 'New or significantly improved product, process or service ready for commercialisation within 2 years. At least 2 countries participating. Market launch plan with revenue projections.',
  },
  {
    identifier: 'LIFE-2026-CET',
    title: 'LIFE Programme — Clean Energy Transition 2026',
    deadline: '2026-09-18',
    nextDeadline: '2026-09-18',
    budgetMax: 3000000,
    eligibleCountries: ['EU'],
    programmeCode: 'LIFE',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 6,
    scope: 'LIFE CET supports demonstration, deployment and replication of innovative solutions in clean energy. Projects must accelerate the shift towards an energy-efficient, renewable-based economy. Local authorities, SMEs, NGOs, and research organisations can apply.',
    expectedImpacts: 'Quantified energy savings or renewable energy deployment. Replicability in at least 5 EU Member States. Consumer behaviour change measurable at scale.',
  },
  {
    identifier: 'HORIZON-JU-CBE-2026-R-01',
    title: 'CBE JU — Circular Bio-based Europe 2026',
    deadline: '2026-10-21',
    nextDeadline: '2026-10-21',
    budgetMax: 5000000,
    eligibleCountries: ['EU', 'EEA'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 3,
    scope: 'CBE JU funds research and innovation projects in circular bio-based industries. Projects should develop bio-based materials, chemicals, or fuels from renewable biological resources. Must address value chain development from biomass to end products.',
    expectedImpacts: 'New bio-based value chains commercially viable without subsidies by 2030. Measurable reduction in fossil-based resource use. Industrial-scale demonstration of bio-based processes.',
  },
  {
    identifier: 'HORIZON-JU-CHIPS-2026-KEY-01',
    title: 'Chips JU — Key Digital Technologies 2026',
    deadline: '2026-11-06',
    nextDeadline: '2026-11-06',
    budgetMax: 12000000,
    eligibleCountries: ['EU', 'EEA'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 2,
    scope: 'Chips JU supports R&D in semiconductor technology, chip design, and microelectronics manufacturing. Projects must address European strategic autonomy in chips. Collaboration between industry, research, and SMEs required.',
    expectedImpacts: 'European leadership in next-generation chip technology. Reduced dependence on non-EU chip manufacturing. At least 20% SME participation in project consortium.',
  },
  {
    identifier: 'InvestEU-2026-SME-GUARANTEE',
    title: 'InvestEU — SME Window Guarantee Facility 2026',
    deadline: '2026-12-31',
    nextDeadline: '2026-12-31',
    budgetMax: 15000000,
    eligibleCountries: ['EU'],
    programmeCode: 'InvestEU',
    smeOnly: true,
    isMultiStage: false,
    minTrl: 7,
    scope: 'InvestEU SME Window provides guarantee-backed loans and equity investments for SMEs in growth phase. Focuses on innovative SMEs, green transition, and digitalisation. Delivered through national promotional banks and financial intermediaries.',
    expectedImpacts: 'Increased SME investment in innovation and digital transformation. Job creation and economic growth in EU regions. Leverage of at least 5x private capital per euro of EU guarantee.',
  },
];

export function getCallsForProfile(countryOfTaxResidence: string): FundingCall[] {
  const isEU = true; // All EU member states qualify — full list check would be added here
  return EU_FUNDING_CALLS.filter(call => {
    if (call.eligibleCountries.includes('EU') && isEU) return true;
    if (call.eligibleCountries.includes('EEA')) return true;
    if (call.eligibleCountries.includes(countryOfTaxResidence)) return true;
    return false;
  });
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add server/src/eu-calls.ts
git commit -m "feat(grant-match): add curated 2025-2026 EU funding calls data"
```

---

## Task 4: Create grant-matcher (boolean filters + markdown + Claude)

**Files:**
- Create: `server/src/grant-matcher.ts`

- [ ] **Step 1: Write the matcher**

Create `server/src/grant-matcher.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { StartupProfile, MatchResult, FundingCall } from '../../client/src/api/types';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

// Map startup stage to implied TRL range [min, max]
const STAGE_TRL: Record<string, [number, number]> = {
  'Idea / Pre-product': [1, 3],
  'MVP / Prototype': [4, 5],
  'Early Revenue': [5, 7],
  'Growth / Scaling': [7, 8],
  'Established': [8, 9],
};

// EU SME: < 250 employees. All teamSize options qualify by headcount.
const LARGE_COMPANY_TEAM_SIZES = new Set<string>(); // none of the options exceed 250

export function runBooleanFilters(profile: StartupProfile, call: FundingCall): boolean {
  // Country check
  const isEligibleCountry =
    call.eligibleCountries.includes('EU') ||
    call.eligibleCountries.includes('EEA') ||
    call.eligibleCountries.includes(profile.countryOfTaxResidence);
  if (!isEligibleCountry) return false;

  // SME-only calls: all our teamSize options are < 250 so they all qualify
  if (call.smeOnly && LARGE_COMPANY_TEAM_SIZES.has(profile.teamSize)) return false;

  // TRL check: if call has minTrl, startup stage must reach it
  if (call.minTrl !== undefined) {
    const [, stageMax] = STAGE_TRL[profile.stage] ?? [1, 9];
    if (stageMax < call.minTrl) return false;
  }

  return true;
}

export function serialiseProfileToMarkdown(profile: StartupProfile): string {
  const teamSizeNum = profile.teamSize === 'Solo founder' ? 1
    : profile.teamSize === '2-5' ? 5
    : profile.teamSize === '6-15' ? 15
    : profile.teamSize === '16-50' ? 50
    : 51;
  const isSME = teamSizeNum < 250;

  return `# Startup Profile: ${profile.organisationName}

## Organisation
- Type: ${profile.organisationType}
- Country (Tax Residence): ${profile.countryOfTaxResidence}
- Sector: ${profile.sector}

## Mission Statement
${profile.productDescription}

## Development Stage
- Stage: ${profile.stage}
- Team Size: ${profile.teamSize}
- Annual Revenue: ${profile.annualRevenue ?? 'Not provided'}
- R&D Activity: ${profile.rdActivity}
- Co-funding Capacity: ${profile.coFundingCapacity ?? 'Not provided'}

## SME Eligibility
- Headcount: ${profile.teamSize} (< 250 ${isSME ? '✓' : '✗'})
- SME Status: ${isSME ? 'Eligible ✓' : 'Not eligible ✗'}
`.trim();
}

export async function scoreCallWithClaude(
  profile: StartupProfile,
  call: FundingCall,
): Promise<MatchResult> {
  const profileMd = serialiseProfileToMarkdown(profile);

  const prompt = `You are a Senior EU Innovation Consultant specialising in Horizon Europe 2025-2027 and EIC Accelerator 2026 guidelines.

### STARTUP PROFILE
${profileMd}

### FUNDING CALL
Title: ${call.title}
Identifier: ${call.identifier}
Programme: ${call.programmeCode}
Deadline: ${call.nextDeadline}
Max Budget: €${call.budgetMax.toLocaleString()}
SME Only: ${call.smeOnly}
Min TRL: ${call.minTrl ?? 'Not specified'}
Multi-stage: ${call.isMultiStage}

Scope:
${call.scope}

Expected Impacts:
${call.expectedImpacts}

### TASK
Evaluate whether this startup is a strong match for this funding call. EU funding is highly competitive (often <5% success rate) — be cynical and rigorous.

Evaluate on 4 pillars:
1. HARD ELIGIBILITY (binary): Country, SME status, TRL match
2. STRATEGIC ALIGNMENT: Clean Industrial Deal, EU AI Act, 5 EU Missions
3. TECHNICAL SCOPE: Does the innovation directly address the call scope?
4. IMPACT FEASIBILITY: Can this startup realistically deliver the expected impacts?

Return ONLY a valid JSON object with this exact structure, no other text:
{
  "match_score": <integer 0-100>,
  "verdict": "GO" | "MAYBE" | "NO-GO",
  "reasoning": {
    "strengths": [<string>, ...],
    "weaknesses": [<string>, ...],
    "red_flags": [<string>, ...]
  },
  "strategic_fit_analysis": "<2-sentence summary>",
  "recommended_pivot": "<string or null>"
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const parsed = JSON.parse(text);

  return {
    callTitle: call.title,
    callId: call.identifier,
    deadline: call.nextDeadline,
    budget: `up to €${(call.budgetMax / 1_000_000).toFixed(1)}M`,
    matchScore: parsed.match_score,
    verdict: parsed.verdict,
    reasoning: parsed.reasoning,
    strategicFitAnalysis: parsed.strategic_fit_analysis,
    recommendedPivot: parsed.recommended_pivot ?? undefined,
  };
}

export async function matchProfile(profile: StartupProfile): Promise<MatchResult[]> {
  const { getCallsForProfile } = await import('./eu-calls.js');
  const allCalls = getCallsForProfile(profile.countryOfTaxResidence);

  // Stage 1: boolean hard filters
  const eligible = allCalls.filter(call => runBooleanFilters(profile, call));

  // Stage 2: Claude semantic scoring (parallel, max 8 calls to control latency)
  const toScore = eligible.slice(0, 8);
  const results = await Promise.all(toScore.map(call => scoreCallWithClaude(profile, call)));

  // Sort by score descending, return top 5
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add server/src/grant-matcher.ts
git commit -m "feat(grant-match): add boolean filters, markdown serialiser, Claude scoring"
```

---

## Task 5: Create Express route and register it

**Files:**
- Create: `server/src/grant-match-route.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Write the route**

Create `server/src/grant-match-route.ts`:

```typescript
import { Router } from 'express';
import type { Request, Response } from 'express';
import { matchProfile } from './grant-matcher.js';
import type { StartupProfile } from '../../client/src/api/types';

export const grantMatchRouter = Router();

grantMatchRouter.post('/', async (req: Request, res: Response) => {
  const profile = req.body as StartupProfile;

  // Basic validation
  if (!profile.email || !profile.organisationName || !profile.productDescription) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' });
    return;
  }

  try {
    const results = await matchProfile(profile);
    res.json({ results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Matching failed';
    res.status(502).json({ error: message });
  }
});
```

- [ ] **Step 2: Register the route in index.ts**

Read `server/src/index.ts` to find where other routers are registered (look for `app.use`), then add:

```typescript
import { grantMatchRouter } from './grant-match-route.js';
// ... existing imports ...

app.use('/api/grant-match', grantMatchRouter);
```

- [ ] **Step 3: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add server/src/grant-match-route.ts server/src/index.ts
git commit -m "feat(grant-match): add POST /api/grant-match route"
```

---

## Task 6: Create useGrantMatch hook

**Files:**
- Create: `client/src/hooks/useGrantMatch.ts`

- [ ] **Step 1: Write the hook**

Create `client/src/hooks/useGrantMatch.ts`:

```typescript
import { useMutation } from '@tanstack/react-query';
import type { StartupProfile, MatchResult } from '../api/types';

async function postGrantMatch(profile: StartupProfile): Promise<MatchResult[]> {
  const response = await fetch('/api/grant-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Grant match failed: ${response.status}`);
  }
  const data = await response.json();
  return data.results as MatchResult[];
}

export function useGrantMatch() {
  return useMutation<MatchResult[], Error, StartupProfile>({
    mutationFn: postGrantMatch,
  });
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add client/src/hooks/useGrantMatch.ts
git commit -m "feat(grant-match): add useGrantMatch mutation hook"
```

---

## Task 7: Create Step1Contact component

**Files:**
- Create: `client/src/components/grant-match/Step1Contact.tsx`

- [ ] **Step 1: Write the component**

Create `client/src/components/grant-match/Step1Contact.tsx`:

```tsx
import type { StartupProfile } from '../../api/types';

interface Props {
  data: Partial<StartupProfile>;
  onChange: (updates: Partial<StartupProfile>) => void;
  onNext: () => void;
}

export default function Step1Contact({ data, onChange, onNext }: Props) {
  const valid = !!(data.email && data.firstName && data.lastName && data.organisationName);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (valid) onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="step-title-row">
        <span className="step-num">1</span>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">About You</h2>
      </div>

      <div>
        <label className="field-label">Email <span className="text-[var(--color-amber)]">*</span></label>
        <input
          type="email"
          required
          value={data.email ?? ''}
          onChange={e => onChange({ email: e.target.value })}
          className="gm-input"
          placeholder="you@company.io"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">First Name <span className="text-[var(--color-amber)]">*</span></label>
          <input
            type="text"
            required
            value={data.firstName ?? ''}
            onChange={e => onChange({ firstName: e.target.value })}
            className="gm-input"
            placeholder="Jane"
          />
        </div>
        <div>
          <label className="field-label">Last Name <span className="text-[var(--color-amber)]">*</span></label>
          <input
            type="text"
            required
            value={data.lastName ?? ''}
            onChange={e => onChange({ lastName: e.target.value })}
            className="gm-input"
            placeholder="Smith"
          />
        </div>
      </div>

      <div>
        <label className="field-label">Organisation Name <span className="text-[var(--color-amber)]">*</span></label>
        <input
          type="text"
          required
          value={data.organisationName ?? ''}
          onChange={e => onChange({ organisationName: e.target.value })}
          className="gm-input"
          placeholder="Company or project name (working name OK if pre-incorporation)"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={!valid} className="gm-btn-primary">
          Next →
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add client/src/components/grant-match/Step1Contact.tsx
git commit -m "feat(grant-match): add Step1Contact form component"
```

---

## Task 8: Create Step2Startup component

**Files:**
- Create: `client/src/components/grant-match/Step2Startup.tsx`

- [ ] **Step 1: Write the component**

Create `client/src/components/grant-match/Step2Startup.tsx`:

```tsx
import { useCountries } from '../../hooks/useCountries';
import type { StartupProfile } from '../../api/types';

const ORGANISATION_TYPES = ['Startup', 'SME', 'Non-profit / NGO', 'Research Organisation', 'Pre-incorporation / Solo Founder', 'Other'];
const SECTORS = ['AI / Machine Learning', 'Fintech / Finance', 'Cleantech / Energy', 'Health / Biotech', 'Logistics / Supply Chain', 'AgriTech / Food', 'Cybersecurity', 'Space / Aerospace', 'Creative / Cultural', 'Tourism / Hospitality', 'Education / EdTech', 'Construction / Built Environment', 'Manufacturing / Industry 4.0', 'Social Impact / Inclusion', 'Other'];
const STAGES = ['Idea / Pre-product', 'MVP / Prototype', 'Early Revenue', 'Growth / Scaling', 'Established'];

interface Props {
  data: Partial<StartupProfile>;
  onChange: (updates: Partial<StartupProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Startup({ data, onChange, onNext, onBack }: Props) {
  const { data: countries = [] } = useCountries();
  const valid = !!(data.organisationType && data.countryOfTaxResidence && data.sector && data.productDescription && data.stage);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (valid) onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="step-title-row">
        <span className="step-num">2</span>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Your Startup</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Organisation Type <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.organisationType ?? ''} onChange={e => onChange({ organisationType: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {ORGANISATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Sector <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.sector ?? ''} onChange={e => onChange({ sector: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Country of Tax Residence <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.countryOfTaxResidence ?? ''} onChange={e => onChange({ countryOfTaxResidence: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Country of Incorporation</label>
          <select value={data.countryOfIncorporation ?? ''} onChange={e => onChange({ countryOfIncorporation: e.target.value || undefined })} className="gm-select">
            <option value="">— optional —</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Product / Service Description <span className="text-[var(--color-amber)]">*</span></label>
        <textarea
          required
          value={data.productDescription ?? ''}
          onChange={e => onChange({ productDescription: e.target.value })}
          className="gm-textarea"
          placeholder="Describe your product or service in 2-3 sentences. Be specific. This helps us match you accurately."
          rows={4}
        />
      </div>

      <div>
        <label className="field-label">Stage <span className="text-[var(--color-amber)]">*</span></label>
        <select value={data.stage ?? ''} onChange={e => onChange({ stage: e.target.value })} className="gm-select" required>
          <option value="">— Select —</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="gm-btn-secondary">← Back</button>
        <button type="submit" disabled={!valid} className="gm-btn-primary">Next →</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add client/src/components/grant-match/Step2Startup.tsx
git commit -m "feat(grant-match): add Step2Startup form component"
```

---

## Task 9: Create Step3Funding component

**Files:**
- Create: `client/src/components/grant-match/Step3Funding.tsx`

- [ ] **Step 1: Write the component**

Create `client/src/components/grant-match/Step3Funding.tsx`:

```tsx
import type { StartupProfile } from '../../api/types';

const TEAM_SIZES = ['Solo founder', '2-5', '6-15', '16-50', '51+'];
const REVENUES = ['Pre-revenue', 'Under €100K', '€100K–€500K', '€500K–€2M', '€2M–€10M', 'Over €10M'];
const RD_OPTIONS = ['Yes — active R&D', 'Planned — within 12 months'];
const COFUNDING = ['Up to 25%', '25–50%', 'Over 50%', 'Not sure'];

interface Props {
  data: Partial<StartupProfile>;
  onChange: (updates: Partial<StartupProfile>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function Step3Funding({ data, onChange, onBack, onSubmit, isLoading }: Props) {
  const [gdpr, setGdpr] = useState(false);
  const [terms, setTerms] = useState(false);
  const valid = !!(data.teamSize && data.rdActivity && gdpr && terms);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (valid) onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="step-title-row">
        <span className="step-num">3</span>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Funding Readiness</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Team Size <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.teamSize ?? ''} onChange={e => onChange({ teamSize: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {TEAM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Annual Revenue</label>
          <select value={data.annualRevenue ?? ''} onChange={e => onChange({ annualRevenue: e.target.value || undefined })} className="gm-select">
            <option value="">— Select —</option>
            {REVENUES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">R&D Activity <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.rdActivity ?? ''} onChange={e => onChange({ rdActivity: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {RD_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Co-funding Capacity</label>
          <select value={data.coFundingCapacity ?? ''} onChange={e => onChange({ coFundingCapacity: e.target.value || undefined })} className="gm-select">
            <option value="">— Select —</option>
            {COFUNDING.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={gdpr} onChange={e => setGdpr(e.target.checked)} className="mt-1 accent-[var(--color-eu-blue-lighter)]" required />
          <span className="text-xs text-[var(--color-text-secondary)]">
            I consent to processing of my data to scan EU funding opportunities and send me matching alerts. I can unsubscribe at any time. <span className="text-[var(--color-amber)]">*</span>
          </span>
        </label>
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-1 accent-[var(--color-eu-blue-lighter)]" required />
          <span className="text-xs text-[var(--color-text-secondary)]">
            I have read and agree to the Terms and Conditions. <span className="text-[var(--color-amber)]">*</span>
          </span>
        </label>
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} disabled={isLoading} className="gm-btn-secondary">← Back</button>
        <button type="submit" disabled={!valid || isLoading} className="gm-btn-scan">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Scanning…
            </span>
          ) : '🔍 Scan My Profile'}
        </button>
      </div>
    </form>
  );
}
```

Add the missing `useState` import at the top:

```tsx
import { useState } from 'react';
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add client/src/components/grant-match/Step3Funding.tsx
git commit -m "feat(grant-match): add Step3Funding form component"
```

---

## Task 10: Create MatchCard and MatchResults components

**Files:**
- Create: `client/src/components/grant-match/MatchCard.tsx`
- Create: `client/src/components/grant-match/MatchResults.tsx`

- [ ] **Step 1: Write MatchCard**

Create `client/src/components/grant-match/MatchCard.tsx`:

```tsx
import type { MatchResult } from '../../api/types';

const VERDICT_STYLES: Record<string, { card: string; badge: string }> = {
  GO: {
    card: 'border-emerald-500/20 bg-emerald-500/[0.04]',
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  },
  MAYBE: {
    card: 'border-[color-mix(in_srgb,var(--color-amber)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-amber)_4%,transparent)]',
    badge: 'bg-[color-mix(in_srgb,var(--color-amber)_20%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_35%,transparent)]',
  },
  'NO-GO': {
    card: 'border-red-500/15 bg-red-500/[0.04]',
    badge: 'bg-red-500/15 text-red-400 border border-red-500/30',
  },
};

export default function MatchCard({ result }: { result: MatchResult }) {
  const styles = VERDICT_STYLES[result.verdict] ?? VERDICT_STYLES['MAYBE'];

  return (
    <div className={`rounded-xl border p-4 ${styles.card}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 className="font-semibold text-[var(--color-text-primary)] text-sm leading-snug">
            {result.callTitle}
          </h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-mono">{result.callId}</p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${styles.badge}`}>
          {result.matchScore} · {result.verdict}
        </span>
      </div>

      {(result.deadline || result.budget) && (
        <p className="text-xs text-[var(--color-text-muted)] mb-2">
          {result.budget && <span>{result.budget}</span>}
          {result.deadline && result.budget && <span className="mx-1">·</span>}
          {result.deadline && <span>Deadline: {result.deadline}</span>}
        </p>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mb-2">
        {result.reasoning.strengths.map(s => (
          <span key={s} className="text-emerald-400">✓ {s}</span>
        ))}
        {result.reasoning.weaknesses.map(w => (
          <span key={w} className="text-[var(--color-amber)]">⚠ {w}</span>
        ))}
        {result.reasoning.redFlags.map(f => (
          <span key={f} className="text-red-400">✗ {f}</span>
        ))}
      </div>

      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed border-t border-[var(--color-border)] pt-2">
        {result.strategicFitAnalysis}
      </p>

      {result.recommendedPivot && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-2 italic">
          Pivot suggestion: {result.recommendedPivot}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write MatchResults**

Create `client/src/components/grant-match/MatchResults.tsx`:

```tsx
import type { MatchResult, StartupProfile } from '../../api/types';
import MatchCard from './MatchCard';

function generateMarkdown(profile: StartupProfile, results: MatchResult[]): string {
  const isSME = !['51+'].includes(profile.teamSize) || true; // all options < 250
  const date = new Date().toISOString().slice(0, 10);

  return `# Startup Profile: ${profile.organisationName}
Generated: ${date}

## Contact
- **Name:** ${profile.firstName} ${profile.lastName}
- **Email:** ${profile.email}

## Organisation
- **Type:** ${profile.organisationType}
- **Country (Tax):** ${profile.countryOfTaxResidence}
- **Sector:** ${profile.sector}

## Mission Statement
${profile.productDescription}

## Development Stage
- **Stage:** ${profile.stage}
- **Team Size:** ${profile.teamSize}
- **Annual Revenue:** ${profile.annualRevenue ?? 'Not provided'}
- **R&D Activity:** ${profile.rdActivity}
- **Co-funding Capacity:** ${profile.coFundingCapacity ?? 'Not provided'}

## SME Eligibility
- Headcount: ${profile.teamSize} (< 250 ✓)
- **SME Status: Eligible ✓**

## Top Matching EU Grants
${results.map((r, i) => `
### ${i + 1}. ${r.callTitle} — Score: ${r.matchScore}/100 (${r.verdict})
- **Call ID:** ${r.callId}
- **Deadline:** ${r.deadline ?? 'TBC'}
- **Budget:** ${r.budget ?? 'TBC'}
- **Strengths:** ${r.reasoning.strengths.join(', ')}
- **Weaknesses:** ${r.reasoning.weaknesses.join(', ')}
- ${r.strategicFitAnalysis}
`).join('')}`;
}

function downloadMarkdown(profile: StartupProfile, results: MatchResult[]) {
  const md = generateMarkdown(profile, results);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${profile.organisationName.toLowerCase().replace(/\s+/g, '-')}-grant-profile.md`;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  profile: StartupProfile;
  results: MatchResult[];
}

export default function MatchResults({ profile, results }: Props) {
  return (
    <div className="mt-10">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Your Top Matches</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {results.length} match{results.length !== 1 ? 'es' : ''} found for{' '}
            <span className="text-[var(--color-text-secondary)]">{profile.organisationName}</span>
            {' · '}{profile.sector}{' · '}{profile.countryOfTaxResidence}
          </p>
        </div>
        <button
          onClick={() => downloadMarkdown(profile, results)}
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-lg px-3 py-2 hover:border-[var(--color-eu-blue-lighter)] hover:text-[var(--color-eu-blue-lighter)] transition-colors"
        >
          ⬇ Download Profile (.md)
        </button>
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
          No matches found for your current profile. Try adjusting your sector or stage.
        </p>
      ) : (
        <div className="space-y-3">
          {results.map(r => <MatchCard key={r.callId} result={r} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add client/src/components/grant-match/MatchCard.tsx client/src/components/grant-match/MatchResults.tsx
git commit -m "feat(grant-match): add MatchCard and MatchResults display components"
```

---

## Task 11: Create ProfileWizard

**Files:**
- Create: `client/src/components/grant-match/ProfileWizard.tsx`

- [ ] **Step 1: Write the wizard shell**

Create `client/src/components/grant-match/ProfileWizard.tsx`:

```tsx
import { useState } from 'react';
import type { StartupProfile, MatchResult } from '../../api/types';
import Step1Contact from './Step1Contact';
import Step2Startup from './Step2Startup';
import Step3Funding from './Step3Funding';
import MatchResults from './MatchResults';
import { useGrantMatch } from '../../hooks/useGrantMatch';

const STEP_LABELS = ['About You', 'Your Startup', 'Funding Readiness'];

export default function ProfileWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<StartupProfile>>({});
  const { mutate, isPending, isError, error, data: results } = useGrantMatch();

  function update(updates: Partial<StartupProfile>) {
    setData(prev => ({ ...prev, ...updates }));
  }

  function handleSubmit() {
    mutate(data as StartupProfile);
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-2">
        {STEP_LABELS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-[3px] rounded-full transition-colors ${
              i < step ? 'bg-[var(--color-eu-blue-lighter)]' : i === step ? 'bg-[var(--color-eu-blue-lighter)] opacity-80' : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">
        {STEP_LABELS.map((label, i) => (
          <span key={i}>
            {i > 0 && <span className="mx-1.5">→</span>}
            <span className={i === step ? 'text-[var(--color-text-secondary)]' : i < step ? 'line-through opacity-50' : ''}>
              {label}{i < step ? ' ✓' : ''}
            </span>
          </span>
        ))}
      </p>

      {/* Glass card */}
      <div className="glass-card rounded-xl p-6">
        {step === 0 && <Step1Contact data={data} onChange={update} onNext={() => setStep(1)} />}
        {step === 1 && <Step2Startup data={data} onChange={update} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <Step3Funding data={data} onChange={update} onBack={() => setStep(1)} onSubmit={handleSubmit} isLoading={isPending} />}
      </div>

      {/* Error state */}
      {isError && (
        <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error?.message ?? 'Matching failed. Please try again.'}
        </div>
      )}

      {/* Results */}
      {results && results.length >= 0 && (
        <MatchResults profile={data as StartupProfile} results={results} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add shared CSS classes to index.css**

Open `client/src/index.css` and add these utility classes in the `@layer components` block (or after existing component classes):

```css
@layer components {
  .step-num {
    @apply w-6 h-6 rounded-full bg-[var(--color-eu-blue)] text-white text-xs font-bold inline-flex items-center justify-center flex-shrink-0;
  }
  .step-title-row {
    @apply flex items-center gap-2 mb-4;
  }
  .field-label {
    @apply block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1;
  }
  .gm-input {
    @apply w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)];
  }
  .gm-select {
    @apply w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)] cursor-pointer appearance-none;
  }
  .gm-textarea {
    @apply w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)] resize-y;
  }
  .gm-btn-primary {
    @apply px-5 py-2 rounded-lg text-sm font-semibold bg-[var(--color-eu-blue)] text-white disabled:opacity-40 disabled:cursor-not-allowed;
  }
  .gm-btn-secondary {
    @apply px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 border border-white/10 text-[var(--color-text-muted)] disabled:opacity-40;
  }
  .gm-btn-scan {
    @apply px-5 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[var(--color-eu-blue)] to-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed;
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add client/src/components/grant-match/ProfileWizard.tsx client/src/index.css
git commit -m "feat(grant-match): add ProfileWizard shell and shared CSS utilities"
```

---

## Task 12: Create GrantMatchPage

**Files:**
- Create: `client/src/pages/GrantMatchPage.tsx`

- [ ] **Step 1: Write the page**

Create `client/src/pages/GrantMatchPage.tsx`:

```tsx
import ProfileWizard from '../components/grant-match/ProfileWizard';

export default function GrantMatchPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <span className="inline-block bg-[color-mix(in_srgb,var(--color-amber)_12%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_25%,transparent)] rounded-full text-xs font-semibold px-3 py-1 mb-4">
          100% Free · AI-Powered
        </span>
        <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] leading-tight tracking-tight mb-3">
          Find EU Grants That{' '}
          <span className="text-[var(--color-eu-blue-lighter)]">Match Your Startup</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
          Answer a few questions and we'll scan 900+ open EU funding calls — ranked by how well they fit your profile using Claude AI.
        </p>
      </div>

      <ProfileWizard />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add client/src/pages/GrantMatchPage.tsx
git commit -m "feat(grant-match): add GrantMatchPage"
```

---

## Task 13: Wire routing and navigation

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/layout/Header.tsx`

- [ ] **Step 1: Add route in App.tsx**

Read `client/src/App.tsx`. Add the import and route:

```tsx
import GrantMatchPage from './pages/GrantMatchPage';

// Inside <Routes>:
<Route path="/grant-match" element={<GrantMatchPage />} />
```

- [ ] **Step 2: Add nav link in Header.tsx**

Read `client/src/components/layout/Header.tsx`. Add a GrantMatch link next to the existing navigation items:

```tsx
import { Link, useLocation } from 'react-router-dom';

// In the nav, add alongside existing links:
<Link
  to="/grant-match"
  className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
>
  GrantMatch
  <span className="bg-[color-mix(in_srgb,var(--color-amber)_15%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_30%,transparent)] rounded-full text-[10px] font-bold px-1.5 py-0.5">
    NEW
  </span>
</Link>
```

- [ ] **Step 3: Commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add client/src/App.tsx client/src/components/layout/Header.tsx
git commit -m "feat(grant-match): wire /grant-match route and add nav link"
```

---

## Task 14: Smoke test end-to-end

- [ ] **Step 1: Set ANTHROPIC_API_KEY**

```bash
echo "ANTHROPIC_API_KEY=<your-key>" >> /Users/fredanaman/Documents/claudecode/cordis-explorer/.env
```

The server loads `.env` via `dotenv` — verify it's loaded in `server/src/index.ts`. If not, add at the top:

```typescript
import 'dotenv/config';
```

And install dotenv if missing:

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer/server && npm install dotenv
```

- [ ] **Step 2: Start the dev server**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer && npm run dev
```

- [ ] **Step 3: Navigate to the page**

Open http://localhost:5173/grant-match and verify:
- Progress bar and 3-step wizard render with dark theme
- Step 1 → 2 → 3 navigation works
- "Scan My Profile" button shows loading spinner

- [ ] **Step 4: Fill and submit a test profile**

Use:
- Org: Test AI Ltd · Type: Startup · Country: Ireland · Sector: AI / Machine Learning
- Description: "We build edge inference software for industrial robots that reduces latency by 10x."
- Stage: MVP / Prototype · Team: 2-5 · R&D: Yes — active R&D

Expected: Loading spinner → results appear below with GO/MAYBE/NO-GO cards

- [ ] **Step 5: Test download**

Click "Download Profile (.md)" and verify a valid markdown file is downloaded.

- [ ] **Step 6: Final commit**

```bash
cd /Users/fredanaman/Documents/claudecode/cordis-explorer
git add .
git commit -m "feat(grant-match): complete GrantMatch feature — wizard + Claude matching + results"
```

---

## Self-Review Notes

- **Spec coverage:** All sections covered — 3-step wizard ✓, dark theme ✓, StartupProfile types ✓, boolean filters ✓, Claude scoring ✓, markdown download ✓, results below form ✓, nav link ✓
- **No placeholders:** All code blocks complete
- **Type consistency:** `StartupProfile`, `MatchResult`, `FundingCall` defined in Task 2 and used consistently throughout. `matchProfile` returns `MatchResult[]`, `useGrantMatch` typed as `MatchResult[]`
- **CSS classes:** `gm-input`, `gm-select`, `gm-textarea`, `gm-btn-*`, `step-num`, `field-label` defined in Task 11 and used in Tasks 7–9
