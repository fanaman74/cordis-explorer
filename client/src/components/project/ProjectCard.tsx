import { Link } from 'react-router-dom';
import type { ProjectSummary } from '../../api/types';
import Badge from '../common/Badge';

interface ProjectCardProps {
  project: ProjectSummary;
}

function formatDate(date?: string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getDateStatus(endDate?: string): 'closed' | 'ending-soon' | 'active' | null {
  if (!endDate) return null;
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (end < now) return 'closed';
  if (end - now < 6 * 30 * 24 * 60 * 60 * 1000) return 'ending-soon';
  return 'active';
}

const DATE_STATUS_CLASS: Record<string, string> = {
  closed: 'text-red-400',
  'ending-soon': 'text-[var(--color-amber)]',
  active: 'text-emerald-400',
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const dateStatus = getDateStatus(project.endDate);

  return (
    <Link
      to={project.identifier ? `/project/${project.identifier}` : '#'}
      className="glass-card block rounded-xl p-5 no-underline"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge programme={project.programme} />
            {project.managingInstitution && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[color-mix(in_srgb,var(--color-amber)_20%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_30%,transparent)]">
                {project.managingInstitution}
              </span>
            )}
            {project.acronym && (
              <span className="font-mono text-sm font-semibold text-[var(--color-amber)]">
                {project.acronym}
              </span>
            )}
            {project.identifier && (
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                Grant #{project.identifier}
              </span>
            )}
            {project.topicLabel && (
              <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[color-mix(in_srgb,var(--color-amber)_15%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_25%,transparent)]">
                {project.topicLabel}
              </span>
            )}
          </div>
          <h3 className="text-[var(--color-text-primary)] font-medium leading-snug line-clamp-2">
            {project.title}
          </h3>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
        {(project.startDate || project.endDate) && (
          <span className={`flex items-center gap-1 ${dateStatus ? DATE_STATUS_CLASS[dateStatus] : ''}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(project.startDate)}
            {project.endDate && ` \u2192 ${formatDate(project.endDate)}`}
          </span>
        )}
        {project.coordinator && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {project.coordinator}
          </span>
        )}
        {project.countries.length > 0 && (
          <span className="text-[var(--color-text-muted)]">
            {project.countries.slice(0, 5).join(', ')}
            {project.countries.length > 5 && ` +${project.countries.length - 5}`}
          </span>
        )}
      </div>
    </Link>
  );
}
