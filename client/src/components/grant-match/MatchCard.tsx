import { useState } from 'react';
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
  const [expanded, setExpanded] = useState(false);
  const styles = VERDICT_STYLES[result.verdict] ?? VERDICT_STYLES['MAYBE'];

  return (
    <div className={`rounded-xl border ${styles.card}`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-4 flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[var(--color-text-primary)] text-sm leading-snug">
            {result.callTitle}
          </h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-mono">{result.callId}</p>
          {(result.deadline || result.budget) && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {result.budget && <span>{result.budget}</span>}
              {result.deadline && result.budget && <span className="mx-1">·</span>}
              {result.deadline && <span>Deadline: {result.deadline}</span>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles.badge}`}>
            {result.matchScore} · {result.verdict}
          </span>
          <svg
            className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--color-border)] pt-3 space-y-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
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

          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            {result.strategicFitAnalysis}
          </p>

          {result.recommendedPivot && (
            <p className="text-xs text-[var(--color-text-secondary)] italic">
              Pivot suggestion: {result.recommendedPivot}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
