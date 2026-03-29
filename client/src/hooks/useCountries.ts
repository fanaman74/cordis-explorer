import { useQuery } from '@tanstack/react-query';
import { executeSparql, parseStringList } from '../api/sparql-client';
import { buildCountriesQuery } from '../api/query-builder';

export function useCountries() {
  return useQuery<string[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const query = buildCountriesQuery();
      const data = await executeSparql(query);
      return parseStringList(data, 'countryName');
    },
    staleTime: Infinity,
  });
}
