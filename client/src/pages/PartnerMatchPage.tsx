import { useState, useEffect } from 'react';
import { usePartnerMatch } from '../hooks/usePartnerMatch';
import type { PartnerResult } from '../hooks/usePartnerMatch';
import { useCountries } from '../hooks/useCountries';
import AuthGate from '../components/auth/AuthGate';

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? '#4ade80' :
    score >= 60 ? '#fbbf24' :
    '#f87171';
  const bg =
    score >= 80 ? 'rgba(74,222,128,0.12)' :
    score >= 60 ? 'rgba(251,191,36,0.12)' :
    'rgba(248,113,113,0.12)';
  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold shrink-0"
      style={{ background: bg, color, border: `1px solid ${color}40` }}
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {score}%
    </div>
  );
}

function PartnerCard({ result }: { result: PartnerResult }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-sm leading-snug" style={{ color: 'var(--color-text-primary)' }}>
            {result.orgName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {result.country}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {result.projectCount} CORDIS project{result.projectCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <ScoreBadge score={result.matchScore} />
      </div>

      {/* Reason */}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {result.reason}
      </p>

      {/* Expertise tags */}
      {result.expertise.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.expertise.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium rounded-full px-2 py-0.5"
              style={{
                background: 'rgba(79,142,247,0.1)',
                color: '#7eb3ff',
                border: '1px solid rgba(79,142,247,0.2)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Sample projects */}
      {result.sampleProjects.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Sample projects
          </p>
          <ul className="space-y-1">
            {result.sampleProjects.map((p, i) => (
              <li key={i} className="text-[11px] leading-snug truncate" style={{ color: 'var(--color-text-muted)' }}>
                · {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PartnerMatchPage() {
  useEffect(() => {
    document.title = 'Find EU Research Partners — CORDIS Explorer';
    return () => { document.title = 'CORDIS Explorer — Search EU-Funded Research Projects'; };
  }, []);

  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const { data: countries = [] } = useCountries();
  const { mutate, data, isPending, error, reset } = usePartnerMatch();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (description.trim().length < 20) return;
    mutate({ description: description.trim(), country: country || undefined, maxResults });
  }

  return (
    <AuthGate>
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
              style={{
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.25)',
                color: '#a78bfa',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              AI-Powered · CORDIS Database
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Partner Matchmaking
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Describe your research project and find the best-fit EU consortium partners from the CORDIS database.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Project Description *
              </label>
              <textarea
                value={description}
                onChange={e => { setDescription(e.target.value); reset(); }}
                rows={5}
                placeholder="Describe your research project, technology area, and what kind of partners you're looking for…"
                className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--color-text-primary)',
                }}
                required
                minLength={20}
              />
              <p className="text-[10px] mt-1" style={{ color: description.length < 20 && description.length > 0 ? '#f87171' : 'var(--color-text-muted)' }}>
                {description.length} / 20 characters minimum
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Partner Country (optional)
                </label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: country ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  }}
                >
                  <option value="">Any country</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Number of Results
                </label>
                <select
                  value={maxResults}
                  onChange={e => setMaxResults(Number(e.target.value))}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {[5, 10, 15].map(n => (
                    <option key={n} value={n}>{n} partners</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || description.trim().length < 20}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: isPending || description.trim().length < 20
                  ? 'rgba(139,92,246,0.3)'
                  : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: 'white',
                cursor: isPending || description.trim().length < 20 ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Searching CORDIS &amp; scoring with Claude…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                  Find Partners
                </>
              )}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 mb-6 text-sm"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#fca5a5' }}
            >
              {error.message}
            </div>
          )}

          {/* Results */}
          {data && (
            <div>
              {/* Meta */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
                    {data.results.length} Partner{data.results.length !== 1 ? 's' : ''} Found
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Scored from {data.totalCandidates} organisations · keywords: {data.keywords.join(', ')}
                  </p>
                </div>
              </div>

              {data.results.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                  <p className="text-sm">No matching partners found. Try broadening your description.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {data.results.map((result, i) => (
                    <PartnerCard key={i} result={result} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
