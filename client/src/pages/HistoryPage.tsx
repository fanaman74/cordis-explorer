import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, useDeleteHistory } from '../hooks/useHistory';
import type { HistoryEntry, QueryType } from '../hooks/useHistory';
import Spinner from '../components/common/Spinner';

const TYPE_META: Record<QueryType, { label: string; color: string; icon: string; toUrl: (p: Record<string, unknown>) => string }> = {
  project_search: {
    label: 'Project Search',
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: '🔍',
    toUrl: p => `/search?q=${encodeURIComponent(String(p.keyword ?? ''))}${p.cluster ? `&cluster=${p.cluster}` : ''}${p.actionType ? `&actionType=${p.actionType}` : ''}${p.country ? `&country=${p.country}` : ''}`,
  },
  partner_search: {
    label: 'Partner Search',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: '🤝',
    toUrl: p => `/partner-search?callId=${encodeURIComponent(String(p.callId ?? ''))}${p.country ? `&country=${p.country}` : ''}`,
  },
  msca_projects: {
    label: 'MSCA Projects',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: '🎓',
    toUrl: p => `/msca?tab=projects&q=${encodeURIComponent(String(p.keyword ?? ''))}${p.mscaType && p.mscaType !== 'all' ? `&type=${p.mscaType}` : ''}`,
  },
  msca_supervisors: {
    label: 'MSCA Supervisors',
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    icon: '🏛',
    toUrl: p => `/msca?tab=supervisors&area=${encodeURIComponent(String(p.researchArea ?? ''))}`,
  },
  grant_match: {
    label: 'Grant Match',
    color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    icon: '✦',
    toUrl: () => '/grant-match',
  },
  ai_rerank: {
    label: 'AI Re-rank',
    color: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    icon: '🤖',
    toUrl: p => `/search?q=${encodeURIComponent(String(p.keyword ?? ''))}`,
  },
};

const TABS: { value: QueryType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'project_search', label: 'Projects' },
  { value: 'partner_search', label: 'Partners' },
  { value: 'msca_projects', label: 'MSCA' },
  { value: 'msca_supervisors', label: 'Supervisors' },
  { value: 'grant_match', label: 'Grant Match' },
];

function queryLabel(entry: HistoryEntry): string {
  const p = entry.query_params;
  switch (entry.query_type) {
    case 'project_search': return String(p.keyword ?? 'All projects');
    case 'partner_search': return String(p.callId ?? 'Partner search');
    case 'msca_projects': return `${p.keyword ?? 'All'} · ${p.mscaType && p.mscaType !== 'all' ? p.mscaType : 'All types'}`;
    case 'msca_supervisors': return String(p.researchArea ?? 'Supervisor search');
    case 'grant_match': return 'Grant Match session';
    case 'ai_rerank': return `AI re-rank: ${p.keyword ?? ''}`;
    default: return 'Search';
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HistoryPage() {
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<QueryType | 'all'>('all');
  const { data, isLoading } = useHistory(activeTab === 'all' ? undefined : activeTab);
  const deleteHistory = useDeleteHistory();

  useEffect(() => {
    document.title = 'Search History — CORDIS Explorer';
  }, []);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-4xl mb-4">🔐</p>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Sign in to view your history</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">Your search history is saved automatically when you're signed in.</p>
        <button onClick={openAuthModal} className="btn-primary btn-sm btn-pill px-6">Sign in</button>
      </div>
    );
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Search History</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{total} saved {total === 1 ? 'search' : 'searches'}</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => { if (confirm('Clear all search history?')) deleteHistory.mutate('all'); }}
            className="text-xs text-[var(--color-text-secondary)] hover:text-rose-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] w-fit flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-[var(--color-eu-blue)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}

      {!isLoading && items.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm text-[var(--color-text-secondary)]">No searches yet. Start exploring to build your history.</p>
          <Link to="/" className="inline-block mt-4 text-sm text-[var(--color-eu-blue-lighter)] hover:underline">Go to home →</Link>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="space-y-3">
          {items.map(entry => {
            const meta = TYPE_META[entry.query_type];
            const snapshot = entry.results_snapshot ?? [];
            return (
              <div key={entry.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 group">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 shrink-0">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">{timeAgo(entry.created_at)}</span>
                      <span className="text-xs text-[var(--color-text-secondary)]">· {entry.result_count} results</span>
                    </div>

                    <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      {queryLabel(entry)}
                    </p>

                    {snapshot.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {snapshot.slice(0, 5).map((r, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-[var(--color-border)] text-[var(--color-text-secondary)]">
                            {String((r as Record<string, unknown>).acronym || (r as Record<string, unknown>).orgName || (r as Record<string, unknown>).title || '').slice(0, 40)}
                          </span>
                        ))}
                        {snapshot.length > 5 && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--color-border)] text-[var(--color-text-secondary)]">
                            +{snapshot.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Link
                        to={meta.toUrl(entry.query_params)}
                        className="text-xs font-medium text-[var(--color-eu-blue-lighter)] hover:underline"
                      >
                        Re-run search →
                      </Link>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteHistory.mutate(entry.id)}
                    className="shrink-0 text-[var(--color-text-secondary)] hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none"
                    aria-label="Delete entry"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
