# GrantMatch — Design Spec
Date: 2026-03-29

## Overview

A new `/grant-match` page within the existing CORDIS Explorer app. Users fill out a 3-step startup profile wizard. On submission, the server fetches live EU funding calls, runs a Claude-powered matching analysis, and displays ranked grant results below the form. A markdown version of the profile can be downloaded.

Modelled on the EuroFounders EU Funds Sign-Up form (https://eurofounders.org/eu-funds-sign-up/).

---

## Architecture

```
React /grant-match page
  └── ProfileWizard (3-step local state, React Hook Form)
        └── on submit → POST /api/grant-match
              └── Express route: server/src/grant-match.ts
                    ├── 1. Fetch open calls from EU Funding & Tenders API
                    │        GET api.tech.ec.europa.eu/funding-api/fc/data/call
                    │        Filtered by: status=open, programmeCode=HORIZON/EIC
                    ├── 2. Serialise StartupProfile → markdown string
                    └── 3. Claude API call (claude-sonnet-4-6)
                              prompt: GrantMatch evaluation prompt (see §Matching Logic)
                              └── Returns MatchResult[] → client renders result cards
```

The existing CORDIS SPARQL proxy (`/api/sparql`) is unchanged. The new `/api/grant-match` route is independent.

---

## Data Models

### StartupProfile (TypeScript)

```typescript
interface StartupProfile {
  // Step 1 — About You
  email: string;
  firstName: string;
  lastName: string;
  organisationName: string;

  // Step 2 — Your Startup
  organisationType: 'Startup' | 'SME' | 'Non-profit / NGO' | 'Research Organisation' | 'Pre-incorporation / Solo Founder' | 'Other';
  countryOfTaxResidence: string;
  countryOfIncorporation?: string;
  sector: string;
  productDescription: string;   // mission statement fed to Claude
  stage: 'Idea / Pre-product' | 'MVP / Prototype' | 'Early Revenue' | 'Growth / Scaling' | 'Established';

  // Step 3 — Funding Readiness
  teamSize: 'Solo founder' | '2-5' | '6-15' | '16-50' | '51+';
  annualRevenue?: string;
  rdActivity: 'Yes — active R&D' | 'Planned — within 12 months';
  coFundingCapacity?: string;
}
```

### MatchResult (TypeScript)

```typescript
interface MatchResult {
  callTitle: string;
  callId: string;
  deadline?: string;
  budget?: string;
  matchScore: number;           // 0–100
  verdict: 'GO' | 'MAYBE' | 'NO-GO';
  reasoning: {
    strengths: string[];
    weaknesses: string[];
    redFlags: string[];
  };
  strategicFitAnalysis: string; // 2-sentence summary
  recommendedPivot?: string;    // only when score < 70
}
```

### FundingCall (internal, from EU F&T API)

```typescript
interface FundingCall {
  identifier: string;
  title: string;
  deadline: string;
  budgetMin?: number;
  budgetMax?: number;
  eligibleCountries: string[];
  programmeCode: string;
  rawText: string;              // full description blob fed to Claude
  isMultiStage: boolean;
  nextDeadline: string;         // earliest upcoming deadline
}
```

---

## Wizard Steps

### Step 1 — About You
- Email * (text)
- First Name * (text)
- Last Name * (text)
- Organisation Name * (text, placeholder: "Company or project name (working name OK if pre-incorporation)")

### Step 2 — Your Startup
- Organisation Type * (select)
- Sector * (select)
- Country of Tax Residence * (select — EU country list from existing useCountries hook)
- Country of Incorporation (select — optional)
- Product / Service Description * (textarea, placeholder: "Describe your product or service in 2-3 sentences. Be specific. This helps us match you accurately.")
- Stage * (select)

### Step 3 — Funding Readiness
- Team Size * (select)
- Annual Revenue (select — optional)
- R&D Activity * (select)
- Co-funding Capacity (select — optional)
- GDPR Consent * (checkbox)
- Newsletter Consent (checkbox — optional)
- Terms & Conditions * (checkbox)

Submit button: **"🔍 Scan My Profile"**

---

## Dropdown Option Values

| Field | Options |
|---|---|
| Organisation Type | Startup, SME, Non-profit / NGO, Research Organisation, Pre-incorporation / Solo Founder, Other |
| Sector | AI / Machine Learning, Fintech / Finance, Cleantech / Energy, Health / Biotech, Logistics / Supply Chain, AgriTech / Food, Cybersecurity, Space / Aerospace, Creative / Cultural, Tourism / Hospitality, Education / EdTech, Construction / Built Environment, Manufacturing / Industry 4.0, Social Impact / Inclusion, Other |
| Stage | Idea / Pre-product, MVP / Prototype, Early Revenue, Growth / Scaling, Established |
| Team Size | Solo founder, 2–5, 6–15, 16–50, 51+ |
| Annual Revenue | Pre-revenue, Under €100K, €100K–€500K, €500K–€2M, €2M–€10M, Over €10M |
| R&D Activity | Yes — active R&D, Planned — within 12 months |
| Co-funding Capacity | Up to 25%, 25–50%, Over 50%, Not sure |

---

## Matching Logic

### Stage 1 — Boolean Hard Filters (`runBooleanFilters`)

Filters run server-side before calling Claude. A call is excluded if:
1. **Country**: startup's `countryOfTaxResidence` is not in the call's `eligibleCountries` list
2. **SME**: for SME-only calls, startup must have teamSize < 250 (all options qualify — `51+` is the largest and still < 250)
3. **Stage vs TRL**: map startup stage to implied TRL range, exclude calls whose minimum TRL exceeds the startup's implied maximum:
   - Idea / Pre-product → TRL 1–3
   - MVP / Prototype → TRL 4–5
   - Early Revenue → TRL 5–7
   - Growth / Scaling → TRL 7–8
   - Established → TRL 8–9

### Stage 2 — Claude Semantic Scoring

For calls that pass Stage 1, send to Claude with this prompt structure:

```
ROLE: Senior EU Innovation Consultant (Horizon Europe 2025-2027 / EIC Accelerator 2026)

STARTUP_PROFILE: {serialised markdown}
FUNDING_CALL: {title, scope, expected impacts, eligibility, raw text}

Evaluate on 4 pillars:
1. HARD ELIGIBILITY (binary): TRL match, country eligibility, SME definition
2. STRATEGIC ALIGNMENT: Clean Industrial Deal / EU AI Act / 5 EU Missions
3. TECHNICAL SCOPE: Does the innovation solve the problem in the call scope?
4. IMPACT FEASIBILITY: Can the startup deliver the expected impacts?

Return JSON:
{
  "match_score": integer 0-100,
  "verdict": "GO" | "MAYBE" | "NO-GO",
  "reasoning": {
    "strengths": [string],
    "weaknesses": [string],
    "red_flags": [string]
  },
  "strategic_fit_analysis": "2-sentence summary",
  "recommended_pivot": "string if score < 70, else null"
}

Rules: Be cynical (< 5% success rate). Top-down calls need direct fit to score > 50.
```

Results sorted by `match_score` descending. Top 5 returned.

---

## Generated Markdown File

Downloaded via "⬇ Download Profile (.md)" button on results screen.

```markdown
# Startup Profile: {organisationName}
Generated: {ISO date}

## Contact
- **Name:** {firstName} {lastName}
- **Email:** {email}

## Organisation
- **Type:** {organisationType}
- **Country (Tax):** {countryOfTaxResidence}
- **Country (Incorporation):** {countryOfIncorporation or "—"}
- **Sector:** {sector}

## Mission Statement
{productDescription}

## Development Stage
- **Stage:** {stage}
- **Team Size:** {teamSize}
- **Annual Revenue:** {annualRevenue or "Not provided"}
- **R&D Activity:** {rdActivity}
- **Co-funding Capacity:** {coFundingCapacity or "Not provided"}

## SME Eligibility Assessment
- Headcount: {teamSize} (< 250 ✓)
- Revenue: {annualRevenue} ({≤ €50M ✓ or > €50M — review required})
- **SME Status: Eligible ✓**
```

---

## Visual Design

Matches CORDIS Explorer dark theme:
- Background: `#0B1120` navy
- Cards: `glass-card` style (backdrop-blur, `rgba(255,255,255,0.03)` fill, `rgba(255,255,255,0.08)` border)
- Primary action: EU Blue `#1D4ED8`
- Labels / asterisks: Amber `#F59E0B`
- Progress bar: `#3B82F6` filled, `rgba(255,255,255,0.1)` unfilled
- Result cards colour-coded by verdict: green (GO), amber (MAYBE), red (NO-GO)
- Nav badge: amber "GrantMatch" pill next to "CORDIS Explorer" wordmark

---

## New Files

### Client
```
client/src/pages/GrantMatchPage.tsx
client/src/components/grant-match/ProfileWizard.tsx
client/src/components/grant-match/Step1Contact.tsx
client/src/components/grant-match/Step2Startup.tsx
client/src/components/grant-match/Step3Funding.tsx
client/src/components/grant-match/MatchResults.tsx
client/src/components/grant-match/MatchCard.tsx
client/src/hooks/useGrantMatch.ts
```

### Server
```
server/src/grant-match.ts        # Express route: POST /api/grant-match
server/src/eu-calls-client.ts    # Fetch open calls from EU F&T API
server/src/grant-matcher.ts      # Boolean filters + Claude prompt + response parsing
```

### Types
`client/src/api/types.ts` — add `StartupProfile`, `MatchResult`, `FundingCall`

### Routing
`client/src/App.tsx` — add `<Route path="/grant-match" element={<GrantMatchPage />} />`

### Nav
`client/src/components/layout/Header.tsx` — add "GrantMatch" link with amber badge

---

## Out of Scope
- Saving profiles to a database (profile only lives in the request/response cycle)
- User accounts / authentication
- Email notifications
- TRL field on the form (excluded by user decision)
- CLI interface (deferred)
