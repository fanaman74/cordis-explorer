import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export interface PartnerRequest {
  description: string;
  country?: string;
  maxResults?: number;
}

export interface PartnerResult {
  orgName: string;
  country: string;
  projectCount: number;
  matchScore: number;
  reason: string;
  expertise: string[];
  sampleProjects: string[];
}

export interface PartnerMatchResponse {
  results: PartnerResult[];
  keywords: string[];
  totalCandidates: number;
}

async function postPartnerMatch(req: PartnerRequest): Promise<PartnerMatchResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch('/api/partner-match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Partner match failed: ${response.status}`);
  }
  return response.json();
}

export function usePartnerMatch() {
  const navigate = useNavigate();
  return useMutation<PartnerMatchResponse, Error, PartnerRequest>({
    mutationFn: postPartnerMatch,
    onError: (err) => {
      if (err.message === 'limit_exceeded') navigate('/credits');
    },
  });
}
