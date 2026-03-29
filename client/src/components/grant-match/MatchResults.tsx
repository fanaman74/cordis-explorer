import type { MatchResult, StartupProfile } from '../../api/types';
import MatchCard from './MatchCard';

function generateMarkdown(profile: StartupProfile, results: MatchResult[]): string {
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

      {/* Legend */}
      <div className="mb-5 rounded-xl border border-[var(--color-border)] bg-white/[0.03] px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--color-text-muted)]">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[var(--color-text-secondary)]">Score 0–100</span>
          — how well your profile fits the call
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-[11px]">GO</span>
          <span>Strong match — worth applying</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-amber)_20%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_35%,transparent)] font-bold text-[11px]">MAYBE</span>
          <span>Partial fit — possible with pivots</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-bold text-[11px]">NO-GO</span>
          <span>Poor fit — significant gaps</span>
        </div>
        <p className="w-full text-[var(--color-text-muted)] opacity-70">Click any card to see Claude's reasoning, strengths, and weaknesses.</p>
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
