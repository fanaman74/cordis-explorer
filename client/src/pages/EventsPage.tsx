import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useCountries } from '../hooks/useCountries';
import ClusterBubbles from '../components/common/ClusterBubbles';
import Pagination from '../components/common/Pagination';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import type { EventFilters } from '../hooks/useEvents';

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: countries = [] } = useCountries();

  const [filters, setFilters] = useState<EventFilters>({
    cluster: searchParams.get('cluster') ?? undefined,
    country: searchParams.get('country') ?? undefined,
    page: parseInt(searchParams.get('page') ?? '1', 10),
  });

  useEffect(() => {
    document.title = 'Brokerage Events — CORDIS Explorer';
  }, []);

  const { data, isLoading, error } = useEvents(filters);

  function applyFilters(updates: Partial<EventFilters>) {
    const next = { ...filters, ...updates, page: 1 };
    setFilters(next);
    const params: Record<string, string> = {};
    if (next.cluster) params.cluster = next.cluster;
    if (next.country) params.country = next.country;
    if (next.page > 1) params.page = String(next.page);
    setSearchParams(params, { replace: true });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          Brokerage Events
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          EU research networking and brokerage events from the Enterprise Europe Network (EEN).
          Find partnership opportunities, matchmaking sessions, and consortium-building events.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-8 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="flex flex-wrap gap-3 items-end">
          <select
            value={filters.country ?? ''}
            onChange={(e) => applyFilters({ country: e.target.value || undefined })}
            className="px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none"
          >
            <option value="">All countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <ClusterBubbles
          selected={filters.cluster ?? null}
          onChange={(v) => applyFilters({ cluster: v ?? undefined })}
          label="Filter by Horizon Europe Cluster"
        />
      </div>

      {isLoading && <Spinner />}

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300">
          Could not load events.{' '}
          <a
            href="https://een.ec.europa.eu/events"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Browse on een.ec.europa.eu →
          </a>
        </div>
      )}

      {!isLoading && data && (
        <>
          {data.events.length === 0 ? (
            <EmptyState
              title="No events found"
              description="Try different filters, or browse events directly on the EEN website: een.ec.europa.eu/events"
            />
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {data.events.map(ev => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 hover:border-[var(--color-eu-blue-lighter)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">
                        {ev.title}
                      </h3>
                      <span className="shrink-0 text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                        {formatDate(ev.startDate)}
                      </span>
                    </div>
                    {(ev.city || ev.country) && (
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        📍 {[ev.city, ev.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {ev.description && (
                      <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed line-clamp-3">
                        {ev.description.replace(/<[^>]+>/g, ' ').trim()}
                      </p>
                    )}
                    {ev.registrationUrl && (
                      <a
                        href={ev.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-eu-blue-lighter)] hover:underline mt-3"
                      >
                        Register / Learn more →
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <Pagination
                page={filters.page}
                pageSize={PAGE_SIZE}
                resultCount={data.events.length}
                onPageChange={(p) => {
                  const next = { ...filters, page: p };
                  setFilters(next);
                  const params: Record<string, string> = {};
                  if (next.cluster) params.cluster = next.cluster;
                  if (next.country) params.country = next.country;
                  params.page = String(p);
                  setSearchParams(params, { replace: true });
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
