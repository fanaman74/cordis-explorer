import { useState } from 'react';
import type { SearchFilters } from '../../api/types';
import { useCountries } from '../../hooks/useCountries';
import { useEuroSciVoc } from '../../hooks/useEuroSciVoc';
import { useManagingInstitutions } from '../../hooks/useManagingInstitutions';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: string | null) => void;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  loading,
}: {
  label: string;
  value: string | null | undefined;
  options: string[];
  onChange: (value: string | null) => void;
  loading?: boolean;
}) {
  return (
    <div>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)] cursor-pointer appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px', paddingRight: '32px' }}
      >
        <option value="">{loading ? 'Loading...' : label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const { data: countries = [], isLoading: countriesLoading } = useCountries();
  const { data: euroSciVoc = [], isLoading: esvLoading } = useEuroSciVoc();
  const { data: managingInstitutions = [], isLoading: institutionsLoading } = useManagingInstitutions();
  const [orgInput, setOrgInput] = useState(filters.organisation || '');

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <FilterSelect
        label="Programme"
        value={filters.programme}
        options={['FP7', 'H2020', 'HE']}
        onChange={(v) => onFilterChange('programme', v)}
      />
      <FilterSelect
        label="Country"
        value={filters.country}
        options={countries}
        onChange={(v) => onFilterChange('country', v)}
        loading={countriesLoading}
      />
      <FilterSelect
        label="Field of Science"
        value={filters.euroSciVoc}
        options={euroSciVoc}
        onChange={(v) => onFilterChange('euroSciVoc', v)}
        loading={esvLoading}
      />
      <FilterSelect
        label="Managing Institution"
        value={filters.managingInstitution}
        options={managingInstitutions}
        onChange={(v) => onFilterChange('managingInstitution', v)}
        loading={institutionsLoading}
      />
      <div>
        <input
          type="text"
          value={orgInput}
          onChange={(e) => setOrgInput(e.target.value)}
          onBlur={() => onFilterChange('organisation', orgInput || null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onFilterChange('organisation', orgInput || null);
          }}
          placeholder="Organisation"
          className="w-40 px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
        />
      </div>
      <div>
        <input
          type="date"
          value={filters.startDateFrom || ''}
          onChange={(e) => onFilterChange('startDateFrom', e.target.value || null)}
          className="px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
          title="Start date from"
        />
      </div>
      <div>
        <input
          type="date"
          value={filters.startDateTo || ''}
          onChange={(e) => onFilterChange('startDateTo', e.target.value || null)}
          className="px-3 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
          title="Start date to"
        />
      </div>
    </div>
  );
}
