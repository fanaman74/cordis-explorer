# Matching Logic — How Each Tool Works

This document explains what each of the three grant-matching tools does and how the logic works behind the scenes, in plain language.

---

## 1. Grant Search

### What it does

The quickest route to relevant EU funding. You provide three things: your organisation type, your country, and a free-text description of your work. No sector dropdown, no multi-step wizard. Submit the form and receive a ranked list of EU funding calls you're most likely to qualify for.

### How it works

**Step 1 — You describe your work**
You fill in three fields: organisation type (e.g. Startup, SME, Research Organisation), your country of tax residence, and a plain-text description of what you do, what problem you solve, and what makes it innovative. The more detail you give here, the better the results — Claude reads this verbatim.

Since no sector is selected, the system defaults to a mid-stage profile (MVP/Prototype, team of 2–5, active R&D) so it doesn't accidentally exclude you from calls that require a TRL level or active research.

**Step 2 — Hard eligibility filter**
Before Claude is consulted, the system runs a fast automatic check against all 15 curated EU funding calls. It eliminates any calls where you definitively cannot apply:
- Your country is not in the call's eligible countries list
- The call is SME-only and your organisation type doesn't qualify
- The call requires a minimum Technology Readiness Level (TRL) that your stage hasn't reached (e.g. a call requiring a market-ready product is filtered out for idea-stage organisations)

This step is instant and binary — yes or no. It narrows the pool before involving Claude.

**Step 3 — Claude reads your description and scores each remaining call**
For every call that passed the hard filter, Claude is given your full description alongside the call's scope, expected impacts, budget, deadline, and programme. Claude acts as a Senior EU Innovation Consultant and scores the fit on four dimensions:

1. **Hard eligibility** — country, SME status, TRL (double-checked here in context)
2. **Strategic alignment** — does your work align with EU policy priorities like the Clean Industrial Deal, EU AI Act, or the 5 EU Missions?
3. **Technical scope** — does what you do directly address what this specific call is funding?
4. **Impact feasibility** — could your organisation realistically deliver the outcomes the call expects?

Claude returns a score from 0–100, a verdict (GO / MAYBE / NO-GO), a list of strengths and weaknesses, a two-sentence strategic analysis, and an optional "pivot suggestion" if you're close but not quite there.

**Step 4 — Results ranked and returned**
Results are sorted highest score first. You see the top 5, 10, or 15 depending on what you selected. Each card is collapsed by default — click to expand the full reasoning.

---

## 2. Profile Match

### What it does

A more detailed version of Grant Search. You complete a 2-step form that captures more about your organisation: type, country, development stage, team size, R&D activity, revenue, and co-funding capacity — plus the free-text description. No sector dropdown. The extra data gives Claude a richer picture, which tends to produce more precise match scores and more specific reasoning.

### How it works

The matching logic is identical to Grant Search (same two-stage pipeline), but the profile sent to Claude is more complete:

**More context = better scoring**
When Claude evaluates a call, it can now factor in:
- **Stage** — "Idea / Pre-product" vs "Growth / Scaling" affects whether TRL-gated calls are realistic
- **Team size** — confirms SME eligibility explicitly
- **R&D activity** — many Horizon calls require active or planned R&D; this tells Claude whether you qualify
- **Revenue** — helps Claude assess impact feasibility ("can this organisation deliver €7M of expected economic impact?")
- **Co-funding capacity** — some calls require the applicant to contribute 30–50% of project costs; Claude flags this as a risk if your capacity is low

**Why no sector?**
Sector is deliberately excluded so Claude must infer the domain from your description. This tends to produce more nuanced matches — rather than filtering to "Cleantech" calls, Claude reads what you actually do and finds calls across multiple programmes that genuinely fit your work.

**What's the same as Grant Search**
- Same hard eligibility filter runs first
- Same Claude scoring model and four evaluation pillars
- Same GO / MAYBE / NO-GO verdicts
- Same collapsible result cards with strengths, weaknesses, and pivot suggestions
- Same markdown download of your profile and results

---

## 3. GrantMatch

### What it does

The most structured and precise matching tool. A 3-step wizard that walks you through contact details, startup profile (including sector), and funding readiness. It is the closest to what a professional grant consultant would ask before recommending a funding route.

### How it works

**Step 1 — Contact details**
Name, email, and organisation name. This is used to personalise the results header and the downloadable profile markdown file.

**Step 2 — Startup profile (with sector)**
Same as Profile Match, plus a sector dropdown. Options include AI / Machine Learning, Cleantech / Energy, Health / Biotech, etc. Providing a sector gives Claude an explicit signal to prioritise calls in your domain — for example, if you select "Health / Biotech", the Horizon Europe Cluster 1 (Health) call will score higher relative to unrelated programmes.

**Step 3 — Funding readiness**
This step captures the information most relevant to whether you can actually win a grant (not just qualify for it):
- **R&D activity** — active or planned
- **Co-funding capacity** — how much of the project budget you can contribute yourself
- **Annual revenue** — used to assess whether you can absorb the administrative and financial burden of an EU grant
- **Consent checkboxes** — GDPR consent and terms acceptance

**Same two-stage pipeline**
Under the hood, GrantMatch uses the same matching engine as the other two tools — hard eligibility filter first, then parallel Claude scoring. The difference is the richness of the profile document sent to Claude.

When Claude receives a GrantMatch profile, it includes all of the following:
```
Organisation type, country, sector, description, stage, team size,
revenue, R&D activity, co-funding capacity, SME eligibility status
```

This gives Claude the most complete picture and typically produces the most differentiated scores between calls — making it easier to see which is a genuine GO vs a marginal MAYBE.

---

## How the Scoring Works — In Plain Terms

Think of the matching engine as two gatekeepers working in sequence:

**Gatekeeper 1 — The Rules Checker (instant)**
A simple yes/no check. It looks at each of the 15 EU funding calls and asks: is this organisation even allowed to apply? If the answer is no on any hard rule (country, SME status, technology stage), the call is dropped before Claude ever sees it. This keeps costs low and results relevant.

**Gatekeeper 2 — The Expert (Claude AI)**
For every call that passed the rules check, Claude reads both your profile and the full call description — scope, expected impacts, budget, deadline, programme — and asks: "If I were a grant consultant, would I recommend this client apply?" It scores 0–100 and returns a verdict:

| Verdict | Score range | Meaning |
|---|---|---|
| **GO** | ~65–100 | Strong fit. Worth investing time in an application. |
| **MAYBE** | ~35–64 | Partial fit. Possible with adjustments or a pivot. |
| **NO-GO** | 0–34 | Poor fit. Significant eligibility or scope gaps. |

The score is Claude's opinion, not a guarantee. EU grants are highly competitive (often under 5% success rate). A GO verdict means "this is one of the best available options for you right now" — not "you will get this grant."

**The pivot suggestion**
When Claude gives a MAYBE or NO-GO, it often suggests a "recommended pivot" — a specific change you could make to your project scope, partnership structure, or positioning that would improve your chances with that call. This is the most actionable output for organisations who want to adapt their approach.

---

## The Funding Calls Database

All three tools search the same curated list of **15 open 2025–2026 EU funding calls**, covering:

| Programme | Examples |
|---|---|
| Horizon Europe | EIC Accelerator, EIC Pathfinder Open, EIC Transition, MSCA Postdoctoral Fellowships, Clusters 1/4/5/6, CBE JU, Chips JU |
| Digital Europe | AI for Public Administration, Cloud-to-Edge & Data Spaces |
| EUREKA | Eurostars (SME-led R&D consortia) |
| LIFE | Clean Energy Transition |
| InvestEU | SME Window (guarantee-backed finance — not a grant) |

**Country eligibility** is programme-specific. Horizon Europe is open to EU Member States + Associated Countries (including EEA/EFTA, Western Balkans, UK, Israel, Ukraine, and others). Digital Europe has its own set of associated countries. EUREKA/Eurostars includes 37 countries (including Canada, South Korea, Singapore). The system checks your country against each programme's specific eligibility list.

**Important note on InvestEU:** Unlike the other 14 entries, InvestEU is not a grant programme. It provides EU guarantee-backed loans and equity investments delivered through financial intermediaries. SMEs do not apply directly — they access financing through participating banks and funds.

This list is manually curated and verified against the EU Funding & Tenders Portal, EIC work programmes, and programme-specific official sources. It is not a live connection — it represents the most relevant open calls for innovative organisations as of early 2026.
