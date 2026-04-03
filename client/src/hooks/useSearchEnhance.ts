import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ProjectSummary, SearchEnhanceResponse } from '../api/types';

async function postSearchEnhance(
  keyword: string,
  projects: ProjectSummary[],
): Promise<SearchEnhanceResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch('/api/search-enhance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ keyword, projects }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Search enhance failed: ${response.status}`);
  }
  return response.json();
}

export function useSearchEnhance() {
  const navigate = useNavigate();
  return useMutation<
    SearchEnhanceResponse,
    Error,
    { keyword: string; projects: ProjectSummary[] }
  >({
    mutationFn: ({ keyword, projects }) => postSearchEnhance(keyword, projects),
    onError: (err) => {
      if (err.message === 'limit_exceeded') navigate('/pricing');
    },
  });
}
