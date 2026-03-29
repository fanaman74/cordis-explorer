import { useQuery } from '@tanstack/react-query';
import { JU_TOPIC_PATTERNS } from '../api/query-builder';

const JU_NAMES = Object.keys(JU_TOPIC_PATTERNS).sort();

export function useManagingInstitutions() {
  return useQuery<string[]>({
    queryKey: ['managingInstitutions'],
    queryFn: () => Promise.resolve(JU_NAMES),
    staleTime: Infinity,
  });
}
