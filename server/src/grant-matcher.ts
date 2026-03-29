import Anthropic from '@anthropic-ai/sdk';
import type { StartupProfile, MatchResult, FilteredCall, FundingCall } from './types.js';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

// Map startup stage to implied TRL range [min, max]
const STAGE_TRL: Record<string, [number, number]> = {
  'Idea / Pre-product': [1, 3],
  'MVP / Prototype': [4, 5],
  'Early Revenue': [5, 7],
  'Growth / Scaling': [7, 8],
  'Established': [8, 9],
};

export function runBooleanFilters(profile: StartupProfile, call: FundingCall): { eligible: boolean; reason?: string } {
  // Country check is handled by getCallsForProfile() upstream.

  // SME-only calls: Research Organisations and NGOs don't qualify
  if (call.smeOnly) {
    const nonSmeTypes = new Set(['Research Organisation', 'Non-profit / NGO']);
    if (nonSmeTypes.has(profile.organisationType)) {
      return {
        eligible: false,
        reason: `This call is open to SMEs and startups only — ${profile.organisationType} organisations are not eligible.`,
      };
    }
  }

  // TRL check: if call has minTrl, startup stage must reach it
  if (call.minTrl !== undefined) {
    const [, stageMax] = STAGE_TRL[profile.stage] ?? [1, 9];
    if (stageMax < call.minTrl) {
      return {
        eligible: false,
        reason: `Your current stage (${profile.stage}) implies a maximum TRL of ${stageMax}, below the TRL ${call.minTrl} minimum required by this call.`,
      };
    }
  }

  return { eligible: true };
}

export function serialiseProfileToMarkdown(profile: StartupProfile): string {
  const teamSizeNum = profile.teamSize === 'Solo founder' ? 1
    : profile.teamSize === '2-5' ? 5
    : profile.teamSize === '6-15' ? 15
    : profile.teamSize === '16-50' ? 50
    : 51;
  const isSME = teamSizeNum < 250;

  return `# Profile: ${profile.organisationName ?? 'Anonymous'}

## Organisation
- Type: ${profile.organisationType}
- Country (Tax Residence): ${profile.countryOfTaxResidence}${profile.sector ? `\n- Sector: ${profile.sector}` : ''}

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
- SME Status: ${isSME ? 'Eligible ✓' : 'Not eligible ✗'}`.trim();
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

  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const parsed = JSON.parse(text);

  return {
    callTitle: call.title,
    callId: call.identifier,
    deadline: call.nextDeadline,
    budget: `up to €${(call.budgetMax / 1_000_000).toFixed(1)}M`,
    matchScore: parsed.match_score,
    verdict: parsed.verdict,
    reasoning: {
      strengths: parsed.reasoning.strengths,
      weaknesses: parsed.reasoning.weaknesses,
      redFlags: parsed.reasoning.red_flags,
    },
    strategicFitAnalysis: parsed.strategic_fit_analysis,
    recommendedPivot: parsed.recommended_pivot ?? undefined,
    consortiumRequired: call.consortiumRequired,
    minPartners: call.minPartners,
    minCountries: call.minCountries,
    fundingType: call.fundingType,
    typicalSuccessRate: call.typicalSuccessRate,
    applicationEffortHours: call.applicationEffortHours,
    timeToMoneyMonths: call.timeToMoneyMonths,
    minTrl: call.minTrl,
    maxTrl: call.maxTrl,
  };
}

export async function matchProfile(profile: StartupProfile): Promise<{ results: MatchResult[]; filteredCalls: FilteredCall[] }> {
  const { getCallsForProfile } = await import('./eu-calls.js');
  const allCalls = getCallsForProfile(profile.countryOfTaxResidence);

  // Stage 1: boolean hard filters — collect eligible and filtered-out with reasons
  const eligible: FundingCall[] = [];
  const filteredCalls: FilteredCall[] = [];

  for (const call of allCalls) {
    const { eligible: pass, reason } = runBooleanFilters(profile, call);
    if (pass) {
      eligible.push(call);
    } else {
      filteredCalls.push({ callTitle: call.title, callId: call.identifier, reason: reason! });
    }
  }

  const count = profile.matchCount ?? 5;

  // Stage 2: Claude semantic scoring — score ALL eligible calls in parallel
  const scored = await Promise.all(eligible.map(call => scoreCallWithClaude(profile, call)));

  const results = scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, count);
  return { results, filteredCalls };
}
