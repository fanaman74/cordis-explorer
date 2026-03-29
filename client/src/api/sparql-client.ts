import type { SparqlResponse, SparqlBinding, ProjectSummary, ProjectDetail, Participant, Publication } from './types';
import { juNameFromLabel } from './query-builder';

export async function executeSparql(query: string): Promise<SparqlResponse> {
  const response = await fetch('/api/sparql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `SPARQL query failed: ${response.status}`);
  }

  return response.json();
}

function getValue(binding: SparqlBinding, key: string): string | undefined {
  return binding[key]?.value;
}

function detectProgramme(identifier?: string, startDate?: string): 'FP7' | 'H2020' | 'HE' | undefined {
  if (!identifier && !startDate) return undefined;
  // Heuristic: FP7 grants are typically 6 digits, H2020 are 6-7 digits starting with certain prefixes
  // More reliable: use date ranges
  if (startDate) {
    const year = new Date(startDate).getFullYear();
    if (year < 2014) return 'FP7';
    if (year < 2021) return 'H2020';
    return 'HE';
  }
  return undefined;
}

export function parseProjectSummaries(data: SparqlResponse): ProjectSummary[] {
  const projectMap = new Map<string, ProjectSummary>();

  for (const binding of data.results.bindings) {
    const uri = getValue(binding, 'project') || '';
    const existing = projectMap.get(uri);

    if (!existing) {
      const startDate = getValue(binding, 'startDate');
      const identifier = getValue(binding, 'identifier');
      const juLabel = getValue(binding, 'juLabel');
      const topicLabel = getValue(binding, 'topicLabel');
      projectMap.set(uri, {
        uri,
        title: getValue(binding, 'title') || 'Untitled',
        acronym: getValue(binding, 'acronym'),
        identifier,
        startDate,
        endDate: getValue(binding, 'endDate'),
        programme: detectProgramme(identifier, startDate),
        countries: [],
        managingInstitution: juLabel ? juNameFromLabel(juLabel) : undefined,
        topicLabel,
      });
    }

    // Collect unique countries
    const country = getValue(binding, 'countryName');
    const project = projectMap.get(uri)!;
    if (country && !project.countries.includes(country)) {
      project.countries.push(country);
    }
    // Update topicLabel if not yet set (first non-null wins)
    if (!project.topicLabel) {
      const tl = getValue(binding, 'topicLabel');
      if (tl) project.topicLabel = tl;
    }
  }

  return Array.from(projectMap.values());
}

export function parseProjectDetail(data: SparqlResponse): ProjectDetail | null {
  const bindings = data.results.bindings;
  if (bindings.length === 0) return null;

  const first = bindings[0];
  const startDate = getValue(first, 'startDate');
  const identifier = getValue(first, 'identifier');

  const participantMap = new Map<string, Participant>();
  const countries: string[] = [];
  const keywords: string[] = [];

  for (const binding of bindings) {
    const orgName = getValue(binding, 'orgName');
    const role = getValue(binding, 'roleLabel') || 'participant';
    const country = getValue(binding, 'countryName') || '';
    const keyword = getValue(binding, 'keyword');

    if (orgName && !participantMap.has(orgName)) {
      participantMap.set(orgName, { orgName, role, country });
    }
    if (country && !countries.includes(country)) {
      countries.push(country);
    }
    if (keyword && !keywords.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  // Sort participants: coordinator first
  const participants = Array.from(participantMap.values()).sort((a, b) => {
    if (a.role.toLowerCase().includes('coordinator')) return -1;
    if (b.role.toLowerCase().includes('coordinator')) return 1;
    return a.orgName.localeCompare(b.orgName);
  });

  return {
    uri: '',
    title: getValue(first, 'title') || 'Untitled',
    acronym: getValue(first, 'acronym'),
    identifier,
    startDate,
    endDate: getValue(first, 'endDate'),
    abstract: getValue(first, 'abstract'),
    keywords: keywords.length > 0 ? keywords : undefined,
    programme: detectProgramme(identifier, startDate),
    coordinator: participants.find((p) => p.role.toLowerCase().includes('coordinator'))?.orgName,
    countries,
    participants,
  };
}

export function parsePublications(data: SparqlResponse): Publication[] {
  return data.results.bindings.map((binding) => ({
    title: getValue(binding, 'pubTitle'),
    doi: getValue(binding, 'doi'),
    authors: getValue(binding, 'authors'),
    publisher: getValue(binding, 'publisher'),
  }));
}

export function parseStringList(data: SparqlResponse, key: string): string[] {
  return data.results.bindings
    .map((binding) => getValue(binding, key))
    .filter((v): v is string => !!v)
    .sort();
}
