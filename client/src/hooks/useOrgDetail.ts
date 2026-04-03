import { useQuery } from '@tanstack/react-query';
import { executeSparql } from '../api/sparql-client';
import {
  buildOrgSummaryQuery,
  buildOrgProjectsQuery,
  buildOrgCoApplicantsQuery,
} from '../api/query-builder';

export interface OrgSummary {
  orgName: string;
  country?: string;
  projectCount: number;
}

export interface OrgProject {
  title: string;
  acronym?: string;
  identifier?: string;
  startDate?: string;
  role?: string;
}

export interface OrgCoApplicant {
  orgName: string;
  sharedCount: number;
}

export function useOrgSummary(orgName: string) {
  return useQuery<OrgSummary>({
    queryKey: ['orgSummary', orgName],
    queryFn: async () => {
      const data = await executeSparql(buildOrgSummaryQuery(orgName));
      const b = data.results.bindings[0];
      return {
        orgName,
        country: b?.countryName?.value,
        projectCount: parseInt(b?.projectCount?.value ?? '0', 10),
      };
    },
    enabled: !!orgName,
    staleTime: 1000 * 60 * 30,
  });
}

export function useOrgProjects(orgName: string) {
  return useQuery<OrgProject[]>({
    queryKey: ['orgProjects', orgName],
    queryFn: async () => {
      const data = await executeSparql(buildOrgProjectsQuery(orgName));
      return data.results.bindings.map(b => ({
        title: b.title?.value ?? '',
        acronym: b.acronym?.value,
        identifier: b.identifier?.value,
        startDate: b.startDate?.value?.slice(0, 10),
        role: b.roleLabel?.value,
      }));
    },
    enabled: !!orgName,
    staleTime: 1000 * 60 * 30,
  });
}

export function useOrgCoApplicants(orgName: string) {
  return useQuery<OrgCoApplicant[]>({
    queryKey: ['orgCoApplicants', orgName],
    queryFn: async () => {
      const data = await executeSparql(buildOrgCoApplicantsQuery(orgName));
      return data.results.bindings.map(b => ({
        orgName: b.coOrgName?.value ?? '',
        sharedCount: parseInt(b.sharedCount?.value ?? '0', 10),
      }));
    },
    enabled: !!orgName,
    staleTime: 1000 * 60 * 30,
  });
}
