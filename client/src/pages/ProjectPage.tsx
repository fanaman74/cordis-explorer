import { useParams, Link } from 'react-router-dom';
import { useProjectDetail } from '../hooks/useProjectDetail';
import ProjectDetailView from '../components/project/ProjectDetail';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { Seo, breadcrumbJsonLd } from '../lib/seo';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { detail, publications } = useProjectDetail(id);

  const data = detail.data;
  const acronym = data?.acronym ? ` (${data.acronym})` : '';
  const title = data?.title
    ? `${data.title}${acronym} — CORDIS Explorer`
    : `Project ${id ?? ''} — CORDIS Explorer`;
  const description = data?.abstract
    ? data.abstract.slice(0, 280)
    : `Details, partners, and publications for EU-funded research project ${data?.acronym ?? id ?? ''}.`;

  const researchProjectLd = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'ResearchProject',
        name: data.title,
        alternateName: data.acronym,
        identifier: data.identifier ?? id,
        url: `https://cordis-explorer.eu/project/${id}`,
        description: data.abstract,
        startDate: data.startDate,
        endDate: data.endDate,
        funder: {
          '@type': 'Organization',
          name: 'European Commission',
          url: 'https://commission.europa.eu/',
        },
        funding: data.programme
          ? {
              '@type': 'Grant',
              name: data.programme,
              funder: {
                '@type': 'Organization',
                name: 'European Commission',
              },
            }
          : undefined,
        keywords: data.keywords,
      }
    : null;

  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Search', path: '/search' },
      { name: data?.acronym ?? data?.title ?? (id ?? 'Project'), path: `/project/${id}` },
    ]),
    ...(researchProjectLd ? [researchProjectLd] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Seo
        title={title}
        description={description}
        canonical={`/project/${id}`}
        ogType="article"
        jsonLd={jsonLd}
      />
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
