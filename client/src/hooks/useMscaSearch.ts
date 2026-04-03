import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { executeSparql } from '../api/sparql-client';
import { buildMscaProjectSearchQuery, buildMscaSupervisorSearchQuery } from '../api/query-builder';
import type { SparqlResponse } from '../api/types';

export type MscaType = 'all' | 'PF' | 'DN' | 'SE' | 'IF' | 'COFUND';

export interface MscaFilters {
  keyword: string;
  mscaType: MscaType;
  page: number;
  pageSize: number;
}

export interface MscaProject {
  uri: string;
  title: string;
  acronym?: string;
  identifier?: string;
  startDate?: string;
  countries: string[];
  topicLabel?: string;
}

export interface MscaSupervisorOrg {
  orgName: string;
  country?: string;
  mscaProjectCount: number;
  projectTitles: string[];
}

export function useMscaProjects(filters: MscaFilters) {
  const query = useQuery<MscaProject[]>({
    queryKey: ['mscaProjects', filters],
    queryFn: async () => {
      const data: SparqlResponse = await executeSparql(
        buildMscaProjectSearchQuery(filters.keyword, filters.mscaType, filters.page, filters.pageSize),
      );
      return data.results.bindings.map(b => ({
        uri: b.project?.value ?? '',
        title: b.title?.value ?? '',
        acronym: b.acronym?.value,
        identifier: b.identifier?.value,
        startDate: b.startDate?.value?.slice(0, 10),
        countries: b.countryName?.value ? [b.countryName.value] : [],
        topicLabel: b.mscaLabel?.value,
      }));
    },
    placeholderData: keepPreviousData,
  });
  return { ...query, isLoading: query.isLoading || query.isFetching };
}

export function useMscaSupervisors(researchArea: string) {
  const query = useQuery<MscaSupervisorOrg[]>({
    queryKey: ['mscaSupervisors', researchArea],
    queryFn: async () => {
      const data: SparqlResponse = await executeSparql(buildMscaSupervisorSearchQuery(researchArea));
      return data.results.bindings.map(b => ({
        orgName: b.orgName?.value ?? '',
        country: b.countryName?.value,
        mscaProjectCount: parseInt(b.mscaProjectCount?.value ?? '0', 10),
        projectTitles: (b.projectTitles?.value ?? '').split('||').filter(Boolean).slice(0, 3),
      }));
    },
    enabled: researchArea.length >= 3,
    staleTime: 1000 * 60 * 30,
  });
  return { ...query, isLoading: query.isLoading || query.isFetching };
}
