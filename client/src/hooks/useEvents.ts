import { useQuery, keepPreviousData } from '@tanstack/react-query';

export interface BrokerageEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  country?: string;
  city?: string;
  registrationUrl?: string;
  source: 'een';
}

export interface EventsResponse {
  events: BrokerageEvent[];
  total: number;
  page: number;
}

export interface EventFilters {
  cluster?: string;
  country?: string;
  page: number;
}

async function fetchEvents(filters: EventFilters): Promise<EventsResponse> {
  const params = new URLSearchParams();
  if (filters.cluster) params.set('cluster', filters.cluster);
  if (filters.country) params.set('country', filters.country);
  params.set('page', String(filters.page));

  const resp = await fetch(`/api/events?${params}`);
  if (!resp.ok) throw new Error(`Events fetch failed: ${resp.status}`);
  return resp.json() as Promise<EventsResponse>;
}

export function useEvents(filters: EventFilters) {
  return useQuery<EventsResponse>({
    queryKey: ['events', filters],
    queryFn: () => fetchEvents(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 15,
  });
}
