import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMscaProjects, useMscaSupervisors } from '../hooks/useMscaSearch';
import type { MscaType } from '../hooks/useMscaSearch';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

const PAGE_SIZE = 20;

const MSCA_TYPES: { value: MscaType; label: string }[] = [
  { value: 'all', label: 'All MSCA' },
  { value: 'PF', label: 'Postdoctoral Fellowships' },
  { value: 'DN', label: 'Doctoral Networks' },
  { value: 'SE', label: 'Staff Exchanges' },
  { value: 'IF', label: 'Individual Fellowships (H2020)' },
  { value: 'COFUND', label: 'COFUND' },
];

export default function MscaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'projects' | 'supervisors'>(
    (searchParams.get('tab') as 'projects' | 'supervisors') ?? 'projects',
  );
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');
  const [inputValue, setInputValue] = useState(keyword);
  const [mscaType, setMscaType] = useState<MscaType>(
    (searchParams.get('type') as MscaType) ?? 'all',
  );
  const [page, setPage] = useState(parseInt(searchParams.get('page') ?? '1', 10));
  const [supervisorArea, setSupervisorArea] = useState(searchParams.get('area') ?? '');
  const [supervisorInput, setSupervisorInput] = useState(supervisorArea);

  useEffect(() => {
    document.title = 'MSCA Search — CORDIS Explorer';
  }, []);

  const { data: projects = [], isLoading: projectsLoading } = useMscaProjects({
    keyword,
    mscaType,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: supervisors = [], isLoading: supervisorsLoading } = useMscaSupervisors(supervisorArea);

  function search() {
    setKeyword(inputValue);
    setPage(1);
    const params: Record<string, string> = { tab: activeTab };
    if (inputValue) params.q = inputValue;
    if (mscaType !== 'all') params.type = mscaType;
    setSearchParams(params, { replace: true });
  }

  function searchSupervisors() {
    setSupervisorArea(supervisorInput);
    setSearchParams({ tab: 'supervisors', area: supervisorInput }, { replace: true });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          MSCA Research Explorer
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Search Marie Skłodowska-Curie Actions projects, and discover host organisations
          and supervisors by research area.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] w-fit">
        {(['projects', 'supervisors'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchParams({ tab }, { replace: true });
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-[var(--color-eu-blue)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab === 'projects' ? 'Projects' : 'Supervisors & Hosts'}
          </button>
        ))}
      </div>

      {activeTab === 'projects' && (
        <>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Search MSCA projects (e.g. quantum computing, RNA biology…)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') search(); }}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
            />
            <button
              onClick={search}
              className="px-5 py-2 rounded-lg bg-[var(--color-eu-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {MSCA_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setMscaType(t.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  mscaType === t.value
                    ? 'bg-[var(--color-eu-blue)] text-white border-transparent'
                    : 'text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-eu-blue-lighter)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {projectsLoading && <Spinner />}
          {!projectsLoading && projects.length === 0 && (
            <EmptyState
              title="No MSCA projects found"
              description="Try different keywords or select a different MSCA type."
            />
          )}
          {!projectsLoading && projects.length > 0 && (
            <>
              <div className="divide-y divide-[var(--color-border)] mb-8">
                {projects.map((p, i) => (
                  <div key={i} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {p.identifier ? (
                          <Link
                            to={`/project/${encodeURIComponent(p.identifier)}`}
                            className="text-sm font-medium text-[var(--color-eu-blue-lighter)] hover:underline"
                          >
                            {p.acronym ? `${p.acronym} — ` : ''}{p.title}
                          </Link>
                        ) : (
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {p.acronym ? `${p.acronym} — ` : ''}{p.title}
                          </p>
                        )}
                        {p.countries.length > 0 && (
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                            {p.countries.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        {p.startDate && (
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {p.startDate.slice(0, 4)}
                          </p>
                        )}
                        {p.topicLabel && (
                          <span className="text-xs font-mono text-[var(--color-text-secondary)] block mt-0.5 max-w-[160px] truncate">
                            {p.topicLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                resultCount={projects.length}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo(0, 0);
                }}
              />
            </>
          )}
        </>
      )}

      {activeTab === 'supervisors' && (
        <>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Research area (e.g. machine learning, proteomics, urban planning…)"
              value={supervisorInput}
              onChange={(e) => setSupervisorInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') searchSupervisors(); }}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)]"
            />
            <button
              onClick={searchSupervisors}
              className="px-5 py-2 rounded-lg bg-[var(--color-eu-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Find Hosts
            </button>
          </div>

          {supervisorsLoading && <Spinner />}
          {!supervisorsLoading && supervisors.length === 0 && supervisorArea.length >= 3 && (
            <EmptyState
              title="No host organisations found"
              description="Try a broader research area term."
            />
          )}
          {!supervisorsLoading && supervisors.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {supervisors.map((org, i) => (
                <Link
                  key={i}
                  to={`/org/${encodeURIComponent(org.orgName)}`}
                  className="block p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-eu-blue-lighter)] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      {org.orgName}
                    </p>
                    <span className="shrink-0 text-xs text-[var(--color-eu-blue-lighter)] font-medium">
                      {org.mscaProjectCount} MSCA
                    </span>
                  </div>
                  {org.country && (
                    <p className="text-xs text-[var(--color-text-secondary)] mb-2">{org.country}</p>
                  )}
                  <ul className="text-xs text-[var(--color-text-secondary)] space-y-0.5 list-disc list-inside">
                    {org.projectTitles.slice(0, 2).map((t, j) => (
                      <li key={j} className="truncate">{t}</li>
                    ))}
                  </ul>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
