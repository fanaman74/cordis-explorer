import { useMutation } from '@tanstack/react-query';
import type { StartupProfile, MatchResult } from '../api/types';

async function postGrantMatch(profile: StartupProfile): Promise<MatchResult[]> {
  const response = await fetch('/api/grant-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Grant match failed: ${response.status}`);
  }
  const data = await response.json();
  return data.results as MatchResult[];
}

export function useGrantMatch() {
  return useMutation<MatchResult[], Error, StartupProfile>({
    mutationFn: postGrantMatch,
  });
}
