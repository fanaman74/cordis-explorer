import type { ProjectSummary } from '../../api/types';
import ProjectCard from '../project/ProjectCard';
import Spinner from '../common/Spinner';
import EmptyState from '../common/EmptyState';

interface SearchResultsProps {
  projects: ProjectSummary[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasSearched: boolean;
}

export default function SearchResults({ projects, isLoading, isError, error, hasSearched }: SearchResultsProps) {
  if (isLoading) return <Spinner />;

  if (isError) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
        <strong>Error:</strong> {error?.message || 'Failed to search projects'}
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <EmptyState
        title="Search EU research projects"
        description="Enter a keyword or apply filters to explore FP7, Horizon 2020, and Horizon Europe projects"
      />
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects found"
        description="Try different keywords or adjust your filters"
      />
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <ProjectCard key={project.uri} project={project} />
      ))}
    </div>
  );
}
