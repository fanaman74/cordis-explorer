import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { PartnerSearchFilters, PartnerSearchResponse } from '../api/types';

async function fetchPartnerSearch(filters: PartnerSearchFilters): Promise<PartnerSearchResponse> {
  const params = new URLSearchParams();
  if (filters.callId) params.set('callId', filters.callId);
  if (filters.cluster) params.set('cluster', filters.cluster);
  if (filters.country) params.set('country', filters.country);
  params.set('page', String(filters.page));

  const response = await fetch(`/api/partner-search-hub?${params}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Partner search failed: ${response.status}`);
  }
  return response.json();
}

export function usePartnerSearch(filters: PartnerSearchFilters) {
  return useQuery<PartnerSearchResponse>({
    queryKey: ['partnerSearch', filters],
    queryFn: () => fetchPartnerSearch(filters),
    placeholderData: keepPreviousData,
    enabled: !!(filters.callId || filters.cluster || filters.country),
    staleTime: 1000 * 60 * 15,
  });
}
