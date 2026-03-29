import type { SearchFilters } from '../../api/types';

interface ActiveFiltersProps {
  filters: SearchFilters;
  onRemove: (key: keyof SearchFilters) => void;
}

export default function ActiveFilters({ filters, onRemove }: ActiveFiltersProps) {
  const pills: { key: keyof SearchFilters; label: string }[] = [];

  if (filters.programme) pills.push({ key: 'programme', label: filters.programme });
  if (filters.country) pills.push({ key: 'country', label: filters.country });
  if (filters.euroSciVoc) pills.push({ key: 'euroSciVoc', label: filters.euroSciVoc });
  if (filters.organisation) pills.push({ key: 'organisation', label: `Org: ${filters.organisation}` });
  if (filters.startDateFrom) pills.push({ key: 'startDateFrom', label: `From: ${filters.startDateFrom}` });
  if (filters.startDateTo) pills.push({ key: 'startDateTo', label: `To: ${filters.startDateTo}` });
  if (filters.status) pills.push({ key: 'status', label: filters.status });
  if (filters.managingInstitution) pills.push({ key: 'managingInstitution', label: `Inst: ${filters.managingInstitution}` });

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-[var(--color-text-muted)] py-1">Active:</span>
      {pills.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onRemove(key)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[color-mix(in_srgb,var(--color-eu-blue)_20%,transparent)] text-sm text-[var(--color-eu-blue-lighter)] hover:bg-[color-mix(in_srgb,var(--color-eu-blue)_30%,transparent)] transition-colors cursor-pointer border-0"
        >
          {label}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}
    </div>
  );
}
