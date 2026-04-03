import { useState } from 'react';
import type { MatchResult } from '../../api/types';
import { useWatchlist, useToggleWatchlist } from '../../hooks/useWatchlist';

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
  const { data: watchlist = [] } = useWatchlist();
  const { add, remove } = useToggleWatchlist();
  const isSaved = watchlist.some(w => w.call_id === result.callId);

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
          {result.callId && (
            <a
              href={`/partner-search?callId=${encodeURIComponent(result.callId)}`}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-eu-blue-lighter)] hover:underline mt-1"
            >
              🤝 Find partners →
            </a>
          )}
          {(result.deadline || result.budget) && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {result.budget && <span>{result.budget}</span>}
              {result.deadline && result.budget && <span className="mx-1">·</span>}
              {result.deadline && <span>Deadline: {result.deadline}</span>}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {/* Consortium / solo */}
            {result.consortiumRequired ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
                Consortium · {result.minPartners}+ partners · {result.minCountries}+ countries
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Solo application
              </span>
            )}
            {/* Funding type */}
            {result.fundingType === 'grant' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/8 text-emerald-400 border border-emerald-500/20">Grant</span>
            )}
            {result.fundingType === 'blended' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Grant + Equity</span>
            )}
            {result.fundingType === 'guarantee' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Loan / Guarantee</span>
            )}
            {result.fundingType === 'fellowship' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">Fellowship</span>
            )}
            {/* TRL range */}
            {result.minTrl !== undefined && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                TRL {result.minTrl}{result.maxTrl ? `–${result.maxTrl}` : '+'}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
            className="text-lg leading-none transition-transform hover:scale-110 ml-2 shrink-0"
            aria-label={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {isSaved ? '⭐' : '☆'}
          </button>
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
        <div className="px-4 pb-4 border-t border-[var(--color-border)] pt-3 space-y-3">
          {/* Effort & odds */}
          {(result.typicalSuccessRate || result.applicationEffortHours || result.timeToMoneyMonths) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--color-text-muted)] pb-2 border-b border-[var(--color-border)]">
              {result.typicalSuccessRate && (
                <span><span className="font-semibold text-[var(--color-text-secondary)]">Success rate:</span> {result.typicalSuccessRate}</span>
              )}
              {result.applicationEffortHours && (
                <span><span className="font-semibold text-[var(--color-text-secondary)]">Application effort:</span> ~{result.applicationEffortHours}h</span>
              )}
              {result.timeToMoneyMonths && (
                <span><span className="font-semibold text-[var(--color-text-secondary)]">Time to funding:</span> ~{result.timeToMoneyMonths} months</span>
              )}
            </div>
          )}
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
