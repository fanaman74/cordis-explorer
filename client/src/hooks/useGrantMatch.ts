import { useMutation } from '@tanstack/react-query';
import type { StartupProfile, MatchResult, FilteredCall } from '../api/types';

export interface GrantMatchResponse {
  results: MatchResult[];
  filteredCalls: FilteredCall[];
}

async function postGrantMatch(profile: StartupProfile): Promise<GrantMatchResponse> {
  const response = await fetch('/api/grant-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Grant match failed: ${response.status}`);
  }
  return response.json();
}

export function useGrantMatch() {
  return useMutation<GrantMatchResponse, Error, StartupProfile>({
    mutationFn: postGrantMatch,
  });
}
