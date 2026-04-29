import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePartnerSearch } from '../hooks/usePartnerSearch';
import { useSaveHistory } from '../hooks/useHistory';
import { useCountries } from '../hooks/useCountries';
import ClusterBubbles from '../components/common/ClusterBubbles';
import Pagination from '../components/common/Pagination';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import type { PartnerProfile, PartnerSearchFilters } from '../api/types';
import { Seo } from '../lib/seo';

const PAGE_SIZE = 20;

function PartnerCard({ profile }: { profile: PartnerProfile }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 space-y-3 hover:border-[var(--color-eu-blue-lighter)] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{profile.orgName}</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{profile.country}</p>
        </div>
        {profile.projectCount > 0 && (
          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {profile.projectCount} EU projects
          </span>
        )}
      </div>

      {profile.expertise.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.expertise.slice(0, 5).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              {tag}
            </span>
          ))}
        </div>
      )}

      {profile.recentProjects && profile.recentProjects.length > 0 && (
        <div className="pt-2 border-t border-[var(--color-border)] space-y-1">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">Recent projects:</p>
          <ul className="text-xs text-[var(--color-text-secondary)] space-y-0.5 list-disc list-inside">
            {profile.recentProjects.map((t, i) => (
              <li key={i} className="truncate">{t}</li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={profile.ftPortalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-eu-blue-lighter)] hover:underline"
      >
        Find on F&T Portal →
      </a>
    </div>
  );
}

export default function PartnerSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: countries = [] } = useCountries();

  const [filters, setFilters] = useState<PartnerSearchFilters>({
    callId: searchParams.get('callId') ?? '',
    cluster: searchParams.get('cluster') ?? undefined,
    country: searchParams.get('country') ?? undefined,
    page: parseInt(searchParams.get('page') ?? '1', 10),
  });

  const [callInput, setCallInput] = useState(filters.callId ?? '');

  const { data, isLoading, error } = usePartnerSearch(filters);
  const saveHistory = useSaveHistory();
  const savedKeyRef = useRef<string>('');

  useEffect(() => {
    const partners = data?.partners ?? [];
    if (!filters.callId || partners.length === 0) return;
    const key = JSON.stringify(filters);
    if (savedKeyRef.current === key) return;
    savedKeyRef.current = key;
    saveHistory.mutate({
      query_type: 'partner_search',
      query_params: { callId: filters.callId, country: filters.country, cluster: filters.cluster },
      result_count: partners.length,
      results_snapshot: partners.slice(0, 8).map(p => ({ orgName: p.orgName, country: p.country, projectCount: p.projectCount })),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filters.callId]);

  function applyFilters(updates: Partial<PartnerSearchFilters>) {
    const next = { ...filters, ...updates, page: 1 };
    setFilters(next);
    const params: Record<string, string> = {};
    if (next.callId) params.callId = next.callId;
    if (next.cluster) params.cluster = next.cluster;
    if (next.country) params.country = next.country;
    if (next.page > 1) params.page = String(next.page);
    setSearchParams(params, { replace: true });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Seo
        title="Partner Search Hub — Organisations with EU Research Track Record | CORDIS Explorer"
        description="Find organisations with a proven EU research track record. Filter by Horizon Europe cluster, call reference, or country. Enriched with CORDIS project data."
        canonical="/partner-search"
        keywords="EU research partners, partner search, Horizon Europe organisations, consortium builder, research track record"
      />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          Partner Search Hub
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Find organisations with a proven track record in EU research projects. Filter by Horizon Europe cluster or call reference.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-8 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Call reference (e.g. HORIZON-CL4-2026-TWIN-01)"
              value={callInput}
              onChange={(e) => setCallInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') applyFilters({ callId: callInput }); }}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
            />
          </div>
          <select
            value={filters.country ?? ''}
            onChange={(e) => applyFilters({ country: e.target.value || undefined })}
            className="px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none"
          >
            <option value="">All countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => applyFilters({ callId: callInput })}
            className="px-4 py-2 rounded-lg bg-[var(--color-eu-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </div>
        <ClusterBubbles
          selected={filters.cluster ?? null}
          onChange={(v) => applyFilters({ cluster: v ?? undefined })}
          label="Filter by Horizon Europe Cluster"
        />
      </div>


      {/* Results */}
      {isLoading && <Spinner />}
      {error && <p className="text-red-400 text-sm">{error.message}</p>}

      {!isLoading && data && (
        <>
          {data.callTitle && (
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Call: <span className="text-[var(--color-text-primary)] font-medium">{data.callTitle}</span>
            </p>
          )}
          {data.profiles.length === 0 ? (
            <EmptyState
              title="No active partnership requests found"
              description="No profiles match your filters. Post yours on the F&T Portal to get started."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {data.profiles.map(p => <PartnerCard key={p.id} profile={p} />)}
              </div>
              <Pagination
                page={filters.page}
                pageSize={PAGE_SIZE}
                resultCount={data.profiles.length}
                onPageChange={(p) => {
                  const next = { ...filters, page: p };
                  setFilters(next);
                  setSearchParams(
                    Object.fromEntries(
                      Object.entries({
                        callId: next.callId,
                        cluster: next.cluster,
                        country: next.country,
                        page: String(p),
                      }).filter(([, v]) => v) as [string, string][]
                    ),
                    { replace: true },
                  );
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
