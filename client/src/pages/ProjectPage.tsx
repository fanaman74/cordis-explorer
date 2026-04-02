import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectDetail } from '../hooks/useProjectDetail';
import ProjectDetailView from '../components/project/ProjectDetail';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { detail, publications } = useProjectDetail(id);

  useEffect(() => {
    if (detail.data?.title) {
      const acronym = detail.data.acronym ? ` (${detail.data.acronym})` : '';
      document.title = `${detail.data.title}${acronym} — CORDIS Explorer`;
    } else {
      document.title = 'Project Details — CORDIS Explorer';
    }
  }, [detail.data]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 no-underline transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </Link>

      {detail.isLoading && <Spinner />}

      {detail.isError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
          <strong>Error:</strong> {detail.error?.message || 'Failed to load project'}
        </div>
      )}

      {detail.data === null && !detail.isLoading && (
        <EmptyState title="Project not found" description="The requested project could not be found" />
      )}

      {detail.data && (
        <ProjectDetailView
          project={detail.data}
          publications={publications.data || []}
        />
      )}
    </div>
  );
}
