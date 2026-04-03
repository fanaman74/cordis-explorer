import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { EnhancedProject, SearchFilters } from '../api/types';
import { useProjectSearch } from '../hooks/useProjectSearch';
import { useSearchEnhance } from '../hooks/useSearchEnhance';
import SearchBar from '../components/search/SearchBar';
import FilterPanel from '../components/search/FilterPanel';
import ActiveFilters from '../components/search/ActiveFilters';
import SearchResults from '../components/search/SearchResults';
import Pagination from '../components/common/Pagination';

const PAGE_SIZE = 25;

function filtersFromParams(params: URLSearchParams): SearchFilters {
  return {
    keyword: params.get('q') || undefined,
    country: params.get('country') || undefined,
    organisation: params.get('org') || undefined,
    euroSciVoc: params.get('esv') || undefined,
    programme: (params.get('prog') as SearchFilters['programme']) || null,
    cluster: params.get('cluster') || null,
    startDateFrom: params.get('from') || undefined,
    startDateTo: params.get('to') || undefined,
    status: (params.get('status') as SearchFilters['status']) || null,
    managingInstitution: params.get('inst') || undefined,
    page: parseInt(params.get('page') || '1', 10),
    pageSize: PAGE_SIZE,
  };
}

function filtersToParams(filters: SearchFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.keyword) params.q = filters.keyword;
  if (filters.country) params.country = filters.country;
  if (filters.organisation) params.org = filters.organisation;
  if (filters.euroSciVoc) params.esv = filters.euroSciVoc;
  if (filters.programme) params.prog = filters.programme;
  if (filters.cluster) params.cluster = filters.cluster;
  if (filters.startDateFrom) params.from = filters.startDateFrom;
  if (filters.startDateTo) params.to = filters.startDateTo;
  if (filters.status) params.status = filters.status;
  if (filters.managingInstitution) params.inst = filters.managingInstitution;
  if (filters.page > 1) params.page = String(filters.page);
  return params;
}

function exportToCsv(projects: { title: string; acronym?: string; identifier?: string; startDate?: string; endDate?: string; countries: string[] }[]) {
  const header = 'Title,Acronym,Grant ID,Start Date,End Date,Countries';
  const rows = projects.map((p) =>
    [
      `"${(p.title || '').replace(/"/g, '""')}"`,
      p.acronym || '',
      p.identifier || '',
      p.startDate || '',
      p.endDate || '',
      `"${p.countries.join('; ')}"`,
    ].join(','),
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cordis-results-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromParams(searchParams);

  useEffect(() => {
    const kw = filters.keyword;
    document.title = kw
      ? `"${kw}" — CORDIS Project Search`
      : 'Search EU Research Projects — CORDIS Explorer';
  }, [filters.keyword]);
  const { data: projects = [], isLoading, isError, error } = useProjectSearch(filters);

  const enhanceMutation = useSearchEnhance();
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const enhancedProjects = enhanceMutation.data?.results ?? null;
  const displayProjects = aiEnhanced && enhancedProjects
    ? enhancedProjects.map((ep: EnhancedProject) => projects?.find(p => p.uri === ep.uri) ?? ep)
    : projects;

  useEffect(() => {
    setAiEnhanced(false);
    enhanceMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword]);

  const updateFilters = useCallback(
    (updates: Partial<SearchFilters>) => {
      const newFilters = { ...filters, ...updates, page: updates.page ?? 1 };
      setSearchParams(filtersToParams(newFilters));
    },
    [filters, setSearchParams],
  );

  function handleKeywordChange(keyword: string) {
    updateFilters({ keyword: keyword || undefined });
  }

  function handleFilterChange(key: keyof SearchFilters, value: string | null) {
    updateFilters({ [key]: value || undefined });
  }

  function handleRemoveFilter(key: keyof SearchFilters) {
    updateFilters({ [key]: undefined });
  }

  function handlePageChange(page: number) {
    updateFilters({ ...filters, page });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-4">
        <SearchBar value={filters.keyword || ''} onChange={handleKeywordChange} />
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        <ActiveFilters filters={filters} onRemove={handleRemoveFilter} />
      </div>

      {projects.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-muted)]">
            {projects.length} result{projects.length !== 1 ? 's' : ''} on this page
          </span>
          <button
            onClick={() => exportToCsv(projects)}
            className="text-sm text-[var(--color-eu-blue-lighter)] hover:underline cursor-pointer bg-transparent border-0"
          >
            Export CSV
          </button>
        </div>
      )}
      {projects && projects.length > 0 && filters.keyword && (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => {
              if (!aiEnhanced) {
                enhanceMutation.mutate(
                  { keyword: filters.keyword!, projects: projects.slice(0, 30) },
                  { onSuccess: () => setAiEnhanced(true) },
                );
              } else {
                setAiEnhanced(false);
              }
            }}
            disabled={enhanceMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
            style={
              aiEnhanced
                ? { background: 'var(--color-eu-blue)', color: '#fff', borderColor: 'var(--color-eu-blue)' }
                : { background: 'transparent', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
            }
          >
            {enhanceMutation.isPending ? (
              <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <span>✦</span>
            )}
            {aiEnhanced ? 'AI ranked' : 'AI re-rank'}
          </button>
          {aiEnhanced && (
            <span className="text-xs text-[var(--color-text-secondary)]">
              Results re-ordered by semantic relevance
            </span>
          )}
        </div>
      )}

      <div className="mt-4">
        <SearchResults
          projects={displayProjects ?? []}
          isLoading={isLoading}
          isError={isError}
          error={error}
          hasSearched={true}
        />
      </div>

      {projects.length > 0 && (
        <div className="mt-6">
          <Pagination
            page={filters.page}
            pageSize={filters.pageSize}
            resultCount={projects.length}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
