import { useQuery } from '@tanstack/react-query';
import { executeSparql, parseProjectDetail, parsePublications } from '../api/sparql-client';
import { buildProjectDetailQuery, buildPublicationsQuery } from '../api/query-builder';
import type { ProjectDetail, Publication } from '../api/types';

export function useProjectDetail(projectId: string | undefined) {
  const detailQuery = useQuery<ProjectDetail | null>({
    queryKey: ['projectDetail', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const query = buildProjectDetailQuery(projectId);
      const data = await executeSparql(query);
      return parseProjectDetail(data);
    },
    enabled: !!projectId,
  });

  const publicationsQuery = useQuery<Publication[]>({
    queryKey: ['projectPublications', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const query = buildPublicationsQuery(projectId);
      const data = await executeSparql(query);
      return parsePublications(data);
    },
    enabled: !!projectId,
  });

  return { detail: detailQuery, publications: publicationsQuery };
}
