import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { PartnerSearchFilters, PartnerSearchResponse } from '../api/types';

async function fetchPartnerSearch(filters: PartnerSearchFilters): Promise<PartnerSearchResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const params = new URLSearchParams();
  if (filters.callId) params.set('callId', filters.callId);
  if (filters.cluster) params.set('cluster', filters.cluster);
  if (filters.country) params.set('country', filters.country);
  params.set('page', String(filters.page));

  const response = await fetch(`/api/partner-search-hub?${params}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });

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
