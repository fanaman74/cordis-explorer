import { useQuery } from '@tanstack/react-query';
import { buildMapDataQuery } from '../api/query-builder';

export interface CountryMapData {
  country: string;
  projectCount: number;
  orgCount: number;
}

async function fetchMapData(programme?: string): Promise<CountryMapData[]> {
  const query = buildMapDataQuery(programme);
  const res = await fetch('/api/sparql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Failed to fetch map data');
  const json = await res.json();
  const bindings: any[] = json.results?.bindings ?? [];
  return bindings.map((b) => ({
    country: b.countryName?.value ?? '',
    projectCount: parseInt(b.projectCount?.value ?? '0', 10),
    orgCount: parseInt(b.orgCount?.value ?? '0', 10),
  })).filter((d) => d.country);
}

export function useMapData(programme?: string) {
  return useQuery({
    queryKey: ['map-data', programme ?? 'all'],
    queryFn: () => fetchMapData(programme),
    staleTime: 1000 * 60 * 30,
  });
}
