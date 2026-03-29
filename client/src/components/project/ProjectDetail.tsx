import type { ProjectDetail as ProjectDetailType, Publication } from '../../api/types';
import Badge from '../common/Badge';
import ParticipantList from './ParticipantList';
import PublicationList from './PublicationList';

interface ProjectDetailProps {
  project: ProjectDetailType;
  publications: Publication[];
}

function formatDate(date?: string): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ProjectDetailView({ project, publications }: ProjectDetailProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Badge programme={project.programme} />
          {project.acronym && (
            <span className="font-mono text-lg font-bold text-[var(--color-amber)]">
              {project.acronym}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] leading-tight">
          {project.title}
        </h1>
        {project.identifier && (
          <p className="mt-1 font-mono text-sm text-[var(--color-text-muted)]">
            Grant Agreement #{project.identifier}
          </p>
        )}
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-lg p-4">
          <div className="text-xs text-[var(--color-text-muted)] mb-1">Start Date</div>
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{formatDate(project.startDate)}</div>
        </div>
        <div className="glass-card rounded-lg p-4">
          <div className="text-xs text-[var(--color-text-muted)] mb-1">End Date</div>
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{formatDate(project.endDate)}</div>
        </div>
        <div className="glass-card rounded-lg p-4">
          <div className="text-xs text-[var(--color-text-muted)] mb-1">Coordinator</div>
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{project.coordinator || 'N/A'}</div>
        </div>
        <div className="glass-card rounded-lg p-4">
          <div className="text-xs text-[var(--color-text-muted)] mb-1">Countries</div>
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{project.countries.join(', ') || 'N/A'}</div>
        </div>
      </div>

      {/* Description */}
      {project.abstract && (
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Description</h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
            {project.abstract}
          </p>
        </div>
      )}

      {/* Keywords */}
      {project.keywords && project.keywords.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {project.keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[color-mix(in_srgb,var(--color-eu-blue-lighter)_15%,transparent)] text-[var(--color-eu-blue-lighter)] border border-[color-mix(in_srgb,var(--color-eu-blue-lighter)_25%,transparent)]"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Participants */}
      <ParticipantList participants={project.participants} />

      {/* Publications */}
      <PublicationList publications={publications} />

      {/* External link */}
      {project.identifier && (
        <div className="pt-4 border-t border-[var(--color-border)]">
          <a
            href={`https://cordis.europa.eu/project/id/${project.identifier}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-eu-blue-lighter)] hover:underline"
          >
            View on CORDIS
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
