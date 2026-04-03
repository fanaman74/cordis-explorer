import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface WatchlistItem {
  id: string;
  call_id: string;
  call_title: string;
  cluster?: string;
  deadline?: string;
  created_at: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { 'Authorization': `Bearer ${session.access_token}` }
    : {};
}

export function useWatchlist() {
  return useQuery<WatchlistItem[]>({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const headers = await authHeaders();
      if (!headers['Authorization']) return [];
      const resp = await fetch('/api/watchlist', { headers });
      if (!resp.ok) return [];
      const data = await resp.json() as { items: WatchlistItem[] };
      return data.items ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useToggleWatchlist() {
  const qc = useQueryClient();

  const add = useMutation({
    mutationFn: async (item: { call_id: string; call_title: string; cluster?: string; deadline?: string }) => {
      const headers = { ...(await authHeaders()), 'Content-Type': 'application/json' };
      const resp = await fetch('/api/watchlist', {
        method: 'POST',
        headers,
        body: JSON.stringify(item),
      });
      if (!resp.ok) throw new Error('Failed to save to watchlist');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  const remove = useMutation({
    mutationFn: async (callId: string) => {
      const headers = await authHeaders();
      const resp = await fetch(`/api/watchlist/${encodeURIComponent(callId)}`, {
        method: 'DELETE',
        headers,
      });
      if (!resp.ok) throw new Error('Failed to remove from watchlist');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  return { add, remove };
}
