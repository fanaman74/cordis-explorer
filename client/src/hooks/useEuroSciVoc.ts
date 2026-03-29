import { useQuery } from '@tanstack/react-query';
import { executeSparql, parseStringList } from '../api/sparql-client';
import { buildEuroSciVocQuery } from '../api/query-builder';

export function useEuroSciVoc() {
  return useQuery<string[]>({
    queryKey: ['euroSciVoc'],
    queryFn: async () => {
      const query = buildEuroSciVocQuery();
      const data = await executeSparql(query);
      return parseStringList(data, 'label');
    },
    staleTime: Infinity,
  });
}
