import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { StartupProfile, MatchResult, FilteredCall } from '../api/types';
import { supabase } from '../lib/supabase';

export type GrantTool = 'grant_search' | 'profile_match' | 'grant_match';

export interface GrantMatchResponse {
  results: MatchResult[];
  filteredCalls: FilteredCall[];
}

async function postGrantMatch(profile: StartupProfile, tool: GrantTool): Promise<GrantMatchResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch('/api/grant-match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ...profile, _tool: tool }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Grant match failed: ${response.status}`);
  }
  return response.json();
}

export function useGrantMatch(tool: GrantTool = 'grant_match') {
  const navigate = useNavigate();
  return useMutation<GrantMatchResponse, Error, StartupProfile>({
    mutationFn: (profile) => postGrantMatch(profile, tool),
    onError: (err) => {
      if (err.message === 'limit_exceeded') navigate('/credits');
    },
  });
}
