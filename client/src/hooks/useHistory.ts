import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';

export type QueryType =
  | 'project_search'
  | 'partner_search'
  | 'msca_projects'
  | 'msca_supervisors'
  | 'grant_match'
  | 'ai_rerank';

export interface HistoryEntry {
  id: string;
  query_type: QueryType;
  query_params: Record<string, unknown>;
  result_count: number;
  results_snapshot: Record<string, unknown>[];
  created_at: string;
}

export interface HistoryResponse {
  items: HistoryEntry[];
  total: number;
}

async function apiFetch(path: string, init?: RequestInit) {
  const resp = await fetch(path, init);
  if (!resp.ok) throw new Error(`History API ${resp.status}`);
  return resp.json();
}

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export function useHistory(type?: QueryType) {
  const { session } = useAuth();
  return useQuery<HistoryResponse>({
    queryKey: ['history', type ?? 'all'],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      return apiFetch(`/api/history?${params}`, {
        headers: authHeaders(session!.access_token),
      });
    },
    enabled: !!session,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSaveHistory() {
  const { session } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      query_type: QueryType;
      query_params: Record<string, unknown>;
      result_count: number;
      results_snapshot: Record<string, unknown>[];
    }) => {
      if (!session) return null;
      return apiFetch('/api/history', {
        method: 'POST',
        headers: authHeaders(session.access_token),
        body: JSON.stringify(entry),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['history'] }),
  });
}

export function useDeleteHistory() {
  const { session } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | 'all') => {
      if (!session) return;
      const url = id === 'all' ? '/api/history' : `/api/history/${id}`;
      return apiFetch(url, {
        method: 'DELETE',
        headers: authHeaders(session.access_token),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['history'] }),
  });
}
