import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { executeSparql, parseProjectSummaries } from '../api/sparql-client';
import { buildProjectSearchQuery } from '../api/query-builder';
import type { SearchFilters, ProjectSummary } from '../api/types';

export function useProjectSearch(filters: SearchFilters) {
  return useQuery<ProjectSummary[]>({
    queryKey: ['projectSearch', filters],
    queryFn: async () => {
      const query = buildProjectSearchQuery(filters);
      const data = await executeSparql(query);
      return parseProjectSummaries(data);
    },
    placeholderData: keepPreviousData,
  });
}
