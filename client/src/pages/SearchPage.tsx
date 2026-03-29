import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchFilters } from '../api/types';
import { useProjectSearch } from '../hooks/useProjectSearch';
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
  const { data: projects = [], isLoading, isError, error } = useProjectSearch(filters);

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

      <div className="mt-4">
        <SearchResults
          projects={projects}
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
