import type { SearchFilters } from '../../api/types';
import { HE_CLUSTERS } from '../../api/query-builder';

interface ActiveFiltersProps {
  filters: SearchFilters;
  onRemove: (key: keyof SearchFilters) => void;
}

export default function ActiveFilters({ filters, onRemove }: ActiveFiltersProps) {
  const pills: { key: keyof SearchFilters; label: string; color?: string }[] = [];

  if (filters.cluster && HE_CLUSTERS[filters.cluster]) {
    const c = HE_CLUSTERS[filters.cluster];
    pills.push({ key: 'cluster', label: `Cluster ${filters.cluster}: ${c.short}`, color: c.color });
  }
  if (filters.programme) pills.push({ key: 'programme', label: filters.programme });
  if (filters.country) pills.push({ key: 'country', label: filters.country });
  if (filters.euroSciVoc) pills.push({ key: 'euroSciVoc', label: filters.euroSciVoc });
  if (filters.organisation) pills.push({ key: 'organisation', label: `Org: ${filters.organisation}` });
  if (filters.startDateFrom) pills.push({ key: 'startDateFrom', label: `From: ${filters.startDateFrom}` });
  if (filters.startDateTo) pills.push({ key: 'startDateTo', label: `To: ${filters.startDateTo}` });
  if (filters.status) pills.push({ key: 'status', label: filters.status });
  if (filters.managingInstitution) pills.push({ key: 'managingInstitution', label: `Inst: ${filters.managingInstitution}` });
  if (filters.actionType) pills.push({ key: 'actionType', label: `Action: ${filters.actionType}` });
  if (filters.trlMin != null) pills.push({ key: 'trlMin', label: `TRL ≥ ${filters.trlMin}` });
  if (filters.trlMax != null) pills.push({ key: 'trlMax', label: `TRL ≤ ${filters.trlMax}` });

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-[var(--color-text-muted)] py-1">Active:</span>
      {pills.map(({ key, label, color }) => (
        <button
          key={key}
          onClick={() => onRemove(key)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm transition-colors cursor-pointer border-0"
          style={
            color
              ? { background: `${color}18`, color, border: `1px solid ${color}35` }
              : { background: 'color-mix(in srgb, var(--color-eu-blue) 20%, transparent)', color: 'var(--color-eu-blue-lighter)' }
          }
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
