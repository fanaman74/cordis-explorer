import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrgSummary, useOrgProjects, useOrgCoApplicants } from '../hooks/useOrgDetail';
import Spinner from '../components/common/Spinner';

export default function OrgPage() {
  const { encodedName } = useParams<{ encodedName: string }>();
  const orgName = decodeURIComponent(encodedName ?? '');

  useEffect(() => {
    document.title = `${orgName} — CORDIS Explorer`;
  }, [orgName]);

  const { data: summary, isLoading: summaryLoading } = useOrgSummary(orgName);
  const { data: projects = [], isLoading: projectsLoading } = useOrgProjects(orgName);
  const { data: coApplicants = [], isLoading: coLoading } = useOrgCoApplicants(orgName);

  if (!orgName) {
    return <p className="p-8 text-[var(--color-text-secondary)]">No organisation specified.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{orgName}</h1>
        {summaryLoading ? <Spinner /> : summary && (
          <div className="flex flex-wrap gap-6 mt-4">
            <div>
              <p className="text-3xl font-bold text-[var(--color-eu-blue-lighter)]">{summary.projectCount}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">EU Projects</p>
            </div>
            {summary.country && (
              <div>
                <p className="text-xl font-semibold text-[var(--color-text-primary)]">{summary.country}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Country</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Projects */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Recent Projects</h2>
        {projectsLoading ? <Spinner /> : (
          <div className="divide-y divide-[var(--color-border)]">
            {projects.map((p, i) => (
              <div key={i} className="py-3 flex items-start justify-between gap-4">
                <div>
                  {p.identifier ? (
                    <Link
                      to={`/project/${encodeURIComponent(p.identifier)}`}
                      className="text-sm font-medium text-[var(--color-eu-blue-lighter)] hover:underline"
                    >
                      {p.acronym ? `${p.acronym} — ` : ''}{p.title}
                    </Link>
                  ) : (
                    <p className="text-sm text-[var(--color-text-primary)]">
                      {p.acronym ? `${p.acronym} — ` : ''}{p.title}
                    </p>
                  )}
                  {p.role && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{p.role}</p>
                  )}
                </div>
                {p.startDate && (
                  <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                    {p.startDate.slice(0, 4)}
                  </span>
                )}
              </div>
            ))}
            {projects.length === 0 && (
              <p className="py-4 text-sm text-[var(--color-text-secondary)]">No projects found.</p>
            )}
          </div>
        )}
      </div>

      {/* Co-applicants */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Frequent Partners</h2>
        {coLoading ? <Spinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {coApplicants.map((c, i) => (
              <Link
                key={i}
                to={`/org/${encodeURIComponent(c.orgName)}`}
                className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-eu-blue-lighter)] transition-colors"
              >
                <span className="text-sm text-[var(--color-text-primary)] truncate">{c.orgName}</span>
                <span className="shrink-0 text-xs text-[var(--color-text-secondary)] ml-2">{c.sharedCount} shared</span>
              </Link>
            ))}
            {coApplicants.length === 0 && (
              <p className="text-sm text-[var(--color-text-secondary)]">No co-applicants found.</p>
            )}
          </div>
        )}
      </div>

      {/* Back link */}
      <div>
        <Link to="/search" className="text-sm text-[var(--color-eu-blue-lighter)] hover:underline">
          ← Back to search
        </Link>
      </div>
    </div>
  );
}
