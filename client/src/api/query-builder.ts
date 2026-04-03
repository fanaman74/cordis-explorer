import type { SearchFilters } from './types';

// Horizon Europe Pillar 2 clusters — maps cluster number → topic label prefix patterns
export const HE_CLUSTERS: Record<string, { label: string; short: string; color: string; patterns: string[] }> = {
  '1': { label: 'Health',                                      short: 'Health',    color: '#f43f5e', patterns: ['HORIZON-HEALTH-', 'HORIZON-CL1-'] },
  '2': { label: 'Culture, Creativity & Inclusive Society',     short: 'Culture',   color: '#8b5cf6', patterns: ['HORIZON-CL2-'] },
  '3': { label: 'Civil Security for Society',                  short: 'Security',  color: '#6366f1', patterns: ['HORIZON-CL3-'] },
  '4': { label: 'Digital, Industry & Space',                   short: 'Digital',   color: '#06b6d4', patterns: ['HORIZON-CL4-'] },
  '5': { label: 'Climate, Energy & Mobility',                  short: 'Climate',   color: '#10b981', patterns: ['HORIZON-CL5-'] },
  '6': { label: 'Food, Bioeconomy, Natural Resources & Environment', short: 'Food & Env', color: '#f59e0b', patterns: ['HORIZON-CL6-'] },
};

// Maps user-facing JU name → one or more SPARQL topic label patterns (UCASE match, OR-combined)
export const JU_TOPIC_PATTERNS: Record<string, string[]> = {
  'CBE JU':                   ['JU-CBE'],
  'Chips JU':                 ['JU-CHIPS'],
  'Clean Aviation JU':        ['JU-CLEAN-AVIATION'],
  'Clean Hydrogen JU':        ['FCH-JU', 'JTI-FCH'],       // FCH-JU-* (FP7/H2020), H2020-JTI-FCH-*
  'ECSEL JU':                 ['ECSEL'],                   // H2020 era (predecessor to KDT JU)
  "Europe's Rail JU":         ['ER-JU', 'JU-ER', 'S2RJU'], // HORIZON-ER-JU, HORIZON-JU-ER, H2020-S2RJU
  'EuroHPC JU':               ['EUROHPC-JU', 'JU-EUROHPC'],
  'Global Health EDCTP3 JU':  ['EDCTP3'],
  'IHI JU':                   ['JU-IHI'],                  // HE era (Innovative Health Initiative)
  'IMI JU':                   ['JTI-IMI'],                  // H2020 era (Innovative Medicines Initiative)
  'KDT JU':                   ['KDT-JU'],
  'SESAR 3 JU':               ['HORIZON-SESAR'],           // HE era SESAR
  'SNS JU':                   ['JU-SNS'],
};

/** Given a raw JU topic label (e.g. "HORIZON-KDT-JU-2021-1-IA"), return the display name (e.g. "KDT JU") */
export function juNameFromLabel(label: string): string | undefined {
  const upper = label.toUpperCase();
  for (const [name, patterns] of Object.entries(JU_TOPIC_PATTERNS)) {
    if (patterns.some((p) => upper.includes(p.toUpperCase()))) return name;
  }
  return undefined;
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export function buildProjectSearchQuery(filters: SearchFilters): string {
  const offset = (filters.page - 1) * filters.pageSize;
  const limit = filters.pageSize;

  const whereClauses: string[] = [
    '?project a eurio:Project .',
    '?project eurio:title ?title .',
    'OPTIONAL { ?project eurio:acronym ?acronym }',
    'OPTIONAL { ?project eurio:endDate ?endDate }',
    'OPTIONAL { ?project eurio:identifier ?identifier }',
  ];

  // startDate: required when programme filter is active (needed for date-range FILTER), optional otherwise
  if (filters.programme) {
    whereClauses.push('?project eurio:startDate ?startDate .');
  } else {
    whereClauses.push('OPTIONAL { ?project eurio:startDate ?startDate }');
  }

  // Keyword filter (title + objective)
  if (filters.keyword) {
    const term = escapeString(filters.keyword.toLowerCase());
    whereClauses.push('OPTIONAL { ?project eurio:objective ?objective }');
    whereClauses.push(
      `FILTER(CONTAINS(LCASE(?title), '${term}') || CONTAINS(LCASE(COALESCE(?objective, "")), '${term}'))`,
    );
  }

  // Country filter
  if (filters.country) {
    const country = escapeString(filters.country);
    whereClauses.push(
      '?project eurio:hasInvolvedParty ?countryRole .',
      '?countryRole eurio:isRoleOf ?countryOrg .',
      '?countryOrg eurio:hasSite ?countrySite .',
      '?countrySite eurio:hasGeographicalLocation ?filterCountry .',
      '?filterCountry a eurio:Country .',
      `?filterCountry eurio:name '${country}' .`,
    );
  }

  // Organisation name filter (partial match)
  if (filters.organisation) {
    const orgTerm = escapeString(filters.organisation.toUpperCase());
    whereClauses.push(
      '?project eurio:hasInvolvedParty ?orgRole .',
      '?orgRole eurio:isRoleOf ?filterOrg .',
      '?filterOrg eurio:legalName ?filterOrgName .',
      `FILTER(CONTAINS(UCASE(?filterOrgName), '${orgTerm}'))`,
    );
  }

  // EuroSciVoc field of science filter
  if (filters.euroSciVoc) {
    const esv = escapeString(filters.euroSciVoc);
    whereClauses.push(
      '?project eurio:hasEuroSciVocClassification ?esv .',
      '?esv skos-xl:prefLabel ?esvLabel .',
      `?esvLabel skos-xl:literalForm '${esv}'@en .`,
    );
  }

  // Date range filters
  if (filters.startDateFrom) {
    whereClauses.push(
      `FILTER(?startDate >= "${filters.startDateFrom}"^^xsd:date)`,
    );
  }
  if (filters.startDateTo) {
    whereClauses.push(
      `FILTER(?startDate <= "${filters.startDateTo}"^^xsd:date)`,
    );
  }

  // Programme filter — use date ranges matching detectProgramme() heuristic
  if (filters.programme) {
    if (filters.programme === 'FP7') {
      whereClauses.push('FILTER(?startDate < "2014-01-01"^^xsd:date)');
    } else if (filters.programme === 'H2020') {
      whereClauses.push('FILTER(?startDate >= "2014-01-01"^^xsd:date && ?startDate < "2021-01-01"^^xsd:date)');
    } else if (filters.programme === 'HE') {
      whereClauses.push('FILTER(?startDate >= "2021-01-01"^^xsd:date)');
    }
  }

  // Managing institution filter (EU Joint Undertakings via funding scheme topic label)
  if (filters.managingInstitution) {
    const patterns = JU_TOPIC_PATTERNS[filters.managingInstitution]
      ?? [escapeString(filters.managingInstitution.toUpperCase())];
    const filterExpr = patterns
      .map((p) => `CONTAINS(UCASE(?instTopicLabel), '${escapeString(p.toUpperCase())}')`)
      .join(' || ');
    whereClauses.push(
      '?project eurio:isFundedBy ?instGrant .',
      '{ ?instGrant eurio:hasFundingSchemeTopic ?instTopic . } UNION { ?instGrant eurio:hasFundingSchemeCall ?instTopic . }',
      '?instTopic rdfs:label ?instTopicLabel .',
      `FILTER(${filterExpr})`,
    );
  }

  // Cluster filter (Horizon Europe Pillar 2 clusters, matched via topic label prefix)
  if (filters.cluster && HE_CLUSTERS[filters.cluster]) {
    const clusterPatterns = HE_CLUSTERS[filters.cluster].patterns;
    const clusterFilterExpr = clusterPatterns
      .map((p) => `CONTAINS(UCASE(?clusterTopicLabel), '${escapeString(p.toUpperCase())}')`)
      .join(' || ');
    whereClauses.push(
      '?project eurio:isFundedBy ?clusterGrant .',
      '{ ?clusterGrant eurio:hasFundingSchemeTopic ?clusterTopic . } UNION { ?clusterGrant eurio:hasFundingSchemeCall ?clusterTopic . }',
      '?clusterTopic rdfs:label ?clusterTopicLabel .',
      `FILTER(${clusterFilterExpr})`,
    );
  }

  // Action type filter — matched via funding scheme topic label
  if (filters.actionType) {
    const at = escapeString(filters.actionType.toUpperCase());
    whereClauses.push(
      '?project eurio:isFundedBy ?atGrant .',
      '{ ?atGrant eurio:hasFundingSchemeTopic ?atTopic . } UNION { ?atGrant eurio:hasFundingSchemeCall ?atTopic . }',
      '?atTopic rdfs:label ?atTopicLabel .',
      `FILTER(CONTAINS(UCASE(?atTopicLabel), '-${at}-') || REGEXP(UCASE(?atTopicLabel), '-${at}$'))`,
    );
  }

  // TRL filter — use optional EURIO TRL predicates
  if (filters.trlMin != null || filters.trlMax != null) {
    whereClauses.push(
      'OPTIONAL { ?project eurio:isFundedBy ?trlGrant . ?trlGrant eurio:minTrl ?minTrl . }',
      'OPTIONAL { ?project eurio:isFundedBy ?trlGrant2 . ?trlGrant2 eurio:maxTrl ?maxTrl . }',
    );
    if (filters.trlMin != null) {
      whereClauses.push(`FILTER(!BOUND(?maxTrl) || ?maxTrl >= ${filters.trlMin})`);
    }
    if (filters.trlMax != null) {
      whereClauses.push(`FILTER(!BOUND(?minTrl) || ?minTrl <= ${filters.trlMax})`);
    }
  }

  // Fetch topic/call code label for all projects (code-like = no spaces, e.g. HORIZON-EIC-2026-ACCELERATOR-01)
  whereClauses.push(
    'OPTIONAL {',
    '  ?project eurio:isFundedBy ?_tGrant .',
    '  { ?_tGrant eurio:hasFundingSchemeTopic ?_tTopic . } UNION { ?_tGrant eurio:hasFundingSchemeCall ?_tTopic . }',
    '  ?_tTopic rdfs:label ?topicLabel .',
    "  FILTER(!CONTAINS(?topicLabel, ' '))",
    '}',
    // Keep JU label separately for managingInstitution badge detection
    'OPTIONAL {',
    '  ?project eurio:isFundedBy ?_juGrant .',
    '  { ?_juGrant eurio:hasFundingSchemeTopic ?_juTopic . } UNION { ?_juGrant eurio:hasFundingSchemeCall ?_juTopic . }',
    '  ?_juTopic rdfs:label ?juLabel .',
    "  FILTER(CONTAINS(UCASE(?juLabel), 'JU-') || CONTAINS(UCASE(?juLabel), '-JU') || CONTAINS(UCASE(?juLabel), 'HORIZON-SESAR') || CONTAINS(UCASE(?juLabel), 'ECSEL') || CONTAINS(UCASE(?juLabel), 'JTI-IMI'))",
    '}',
  );

  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos-xl: <http://www.w3.org/2008/05/skos-xl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?project ?title ?acronym ?startDate ?endDate ?identifier ?topicLabel ?juLabel
WHERE {
  ${whereClauses.join('\n  ')}
}
ORDER BY DESC(?startDate)
LIMIT ${limit}
OFFSET ${offset}
  `.trim();
}

export function buildProjectDetailQuery(projectId: string): string {
  const id = escapeString(projectId);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT ?title ?acronym ?identifier ?startDate ?endDate ?abstract ?keyword
       ?orgName ?roleLabel ?countryName
WHERE {
  ?project eurio:identifier '${id}' .
  ?project eurio:title ?title .
  OPTIONAL { ?project eurio:acronym ?acronym }
  OPTIONAL { ?project eurio:startDate ?startDate }
  OPTIONAL { ?project eurio:endDate ?endDate }
  OPTIONAL { ?project eurio:abstract ?abstract }
  OPTIONAL { ?project eurio:keyword ?keyword }

  OPTIONAL {
    ?project eurio:hasInvolvedParty ?role .
    ?role eurio:roleLabel ?roleLabel .
    ?role eurio:isRoleOf ?org .
    ?org eurio:legalName ?orgName .
    OPTIONAL {
      ?org eurio:hasSite ?site .
      ?site eurio:hasGeographicalLocation ?country .
      ?country a eurio:Country .
      ?country eurio:name ?countryName .
    }
  }
}
  `.trim();
}

export function buildPublicationsQuery(projectId: string): string {
  const id = escapeString(projectId);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT ?pubTitle ?doi ?authors ?publisher
WHERE {
  ?project eurio:identifier '${id}' .
  ?project eurio:hasResult ?result .
  ?result a eurio:ProjectPublication .
  OPTIONAL { ?result eurio:title ?pubTitle }
  OPTIONAL { ?result eurio:doi ?doi }
  OPTIONAL { ?result eurio:author ?authors }
  OPTIONAL { ?result eurio:publisher ?publisher }
}
  `.trim();
}

export function buildCountriesQuery(): string {
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?countryName
WHERE {
  ?country a eurio:Country .
  ?country eurio:name ?countryName .
}
ORDER BY ?countryName
  `.trim();
}

export function buildEuroSciVocQuery(): string {
  return `
PREFIX skos-xl: <http://www.w3.org/2008/05/skos-xl#>

SELECT DISTINCT ?label
WHERE {
  ?concept a skos-xl:Label .
  ?concept skos-xl:literalForm ?label .
  FILTER(LANG(?label) = 'en')
}
ORDER BY ?label
LIMIT 2000
  `.trim();
}

export function buildManagingInstitutionsQuery(): string {
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?institutionName
WHERE {
  ?project a eurio:Project .
  ?project eurio:hasFundingSchemeProgramme ?prog .
  ?prog eurio:title ?institutionName .
  FILTER(CONTAINS(UCASE(?institutionName), ' JU') || CONTAINS(UCASE(?institutionName), 'JOINT UNDERTAKING'))
}
ORDER BY ?institutionName
LIMIT 200
  `.trim();
}

export function buildPartnerSearchQuery(keywords: string[], country?: string): string {
  const keywordFilters = keywords
    .map(k => `CONTAINS(LCASE(STR(?title)), '${escapeString(k.toLowerCase())}')`)
    .join(' || ');

  const countryClause = country
    ? `?org eurio:hasSite ?_cs . ?_cs eurio:hasGeographicalLocation ?_cc . ?_cc a eurio:Country . ?_cc eurio:name '${escapeString(country)}' .`
    : '';

  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT ?orgName ?countryName (COUNT(DISTINCT ?project) AS ?projectCount)
       (GROUP_CONCAT(DISTINCT ?title; SEPARATOR="||") AS ?projectTitles)
WHERE {
  ?project a eurio:Project .
  ?project eurio:title ?title .
  FILTER(${keywordFilters})
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?org eurio:legalName ?orgName .
  ${countryClause}
  OPTIONAL {
    ?org eurio:hasSite ?site .
    ?site eurio:hasGeographicalLocation ?country .
    ?country a eurio:Country .
    ?country eurio:name ?countryName .
  }
}
GROUP BY ?orgName ?countryName
ORDER BY DESC(?projectCount)
LIMIT 80
  `.trim();
}

export function buildMapDataQuery(programme?: string): string {
  let progFilter = '';
  if (programme === 'HE') {
    progFilter = `?project eurio:startDate ?_sd . FILTER(?_sd >= "2021-01-01"^^xsd:date)`;
  } else if (programme === 'H2020') {
    progFilter = `?project eurio:startDate ?_sd . FILTER(?_sd >= "2014-01-01"^^xsd:date && ?_sd < "2021-01-01"^^xsd:date)`;
  } else if (programme === 'FP7') {
    progFilter = `?project eurio:startDate ?_sd . FILTER(?_sd < "2014-01-01"^^xsd:date)`;
  }
  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?countryName (COUNT(DISTINCT ?project) AS ?projectCount) (COUNT(DISTINCT ?org) AS ?orgCount)
WHERE {
  ?project a eurio:Project .
  ${progFilter}
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?org eurio:hasSite ?site .
  ?site eurio:hasGeographicalLocation ?country .
  ?country a eurio:Country .
  ?country eurio:name ?countryName .
}
GROUP BY ?countryName
ORDER BY DESC(?projectCount)
  `.trim();
}

export function buildOrgSearchForGraphQuery(searchTerm: string): string {
  const term = escapeString(searchTerm.toUpperCase());
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?orgName (COUNT(DISTINCT ?project) AS ?projectCount)
WHERE {
  ?org eurio:legalName ?orgName .
  FILTER(CONTAINS(UCASE(?orgName), '${term}'))
  OPTIONAL {
    ?project a eurio:Project .
    ?project eurio:hasInvolvedParty ?role .
    ?role eurio:isRoleOf ?org .
  }
}
GROUP BY ?orgName
ORDER BY DESC(?projectCount)
LIMIT 8
  `.trim();
}

export function buildOrgProjectsForGraphQuery(orgName: string): string {
  const name = escapeString(orgName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?projectTitle ?projectAcronym ?projectId ?startDate
WHERE {
  ?org eurio:legalName '${name}' .
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?project a eurio:Project .
  ?project eurio:title ?projectTitle .
  OPTIONAL { ?project eurio:acronym ?projectAcronym }
  OPTIONAL { ?project eurio:identifier ?projectId }
  OPTIONAL { ?project eurio:startDate ?startDate }
}
ORDER BY DESC(?startDate)
LIMIT 12
  `.trim();
}

export function buildCountryOrgsForGraphQuery(countryName: string): string {
  const name = escapeString(countryName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?orgName (COUNT(DISTINCT ?project) AS ?projectCount)
WHERE {
  ?country a eurio:Country .
  ?country eurio:name '${name}' .
  ?org eurio:hasSite ?site .
  ?site eurio:hasGeographicalLocation ?country .
  ?org eurio:legalName ?orgName .
  ?project a eurio:Project .
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
}
GROUP BY ?orgName
ORDER BY DESC(?projectCount)
LIMIT 15
  `.trim();
}

export function buildProjectParticipantsForGraphQuery(projectId: string): string {
  const id = escapeString(projectId);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?orgName ?countryName ?roleLabel
WHERE {
  ?project eurio:identifier '${id}' .
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?org eurio:legalName ?orgName .
  OPTIONAL { ?role eurio:roleLabel ?roleLabel }
  OPTIONAL {
    ?org eurio:hasSite ?site .
    ?site eurio:hasGeographicalLocation ?country .
    ?country a eurio:Country .
    ?country eurio:name ?countryName .
  }
}
LIMIT 25
  `.trim();
}

export function buildProjectSearchForGraphQuery(searchTerm: string): string {
  const term = escapeString(searchTerm.toUpperCase());
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?projectTitle ?projectAcronym ?projectId
WHERE {
  ?project a eurio:Project .
  ?project eurio:title ?projectTitle .
  OPTIONAL { ?project eurio:acronym ?projectAcronym }
  OPTIONAL { ?project eurio:identifier ?projectId }
  FILTER(CONTAINS(UCASE(?projectTitle), '${term}') || CONTAINS(UCASE(COALESCE(?projectAcronym, '')), '${term}'))
}
ORDER BY ?projectTitle
LIMIT 8
  `.trim();
}

export function buildCountQuery(filters: SearchFilters): string {
  const searchQuery = buildProjectSearchQuery({ ...filters, page: 1, pageSize: 1 });
  // Wrap the search query as a subquery to count results
  const innerWhere = searchQuery
    .replace(/SELECT DISTINCT.*?WHERE/s, 'SELECT (COUNT(DISTINCT ?project) AS ?count) WHERE')
    .replace(/ORDER BY.*$/s, '}');

  return innerWhere;
}

/** Fetch summary stats for an org: project count, total EC contribution */
export function buildOrgSummaryQuery(orgName: string): string {
  const name = escapeString(orgName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?countryName
       (COUNT(DISTINCT ?project) AS ?projectCount)
WHERE {
  ?org eurio:legalName '${name}' .
  OPTIONAL {
    ?org eurio:hasSite ?site .
    ?site eurio:hasGeographicalLocation ?country .
    ?country a eurio:Country .
    ?country eurio:name ?countryName .
  }
  OPTIONAL {
    ?project a eurio:Project .
    ?project eurio:hasInvolvedParty ?role .
    ?role eurio:isRoleOf ?org .
  }
}
GROUP BY ?countryName
  `.trim();
}

/** Fetch recent projects for an org */
export function buildOrgProjectsQuery(orgName: string): string {
  const name = escapeString(orgName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT DISTINCT ?title ?acronym ?identifier ?startDate ?roleLabel
WHERE {
  ?org eurio:legalName '${name}' .
  ?project a eurio:Project .
  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?project eurio:title ?title .
  OPTIONAL { ?project eurio:acronym ?acronym }
  OPTIONAL { ?project eurio:identifier ?identifier }
  OPTIONAL { ?project eurio:startDate ?startDate }
  OPTIONAL { ?role eurio:roleLabel ?roleLabel }
}
ORDER BY DESC(?startDate)
LIMIT 20
  `.trim();
}

/** Search for MSCA projects by keyword and type */
export function buildMscaProjectSearchQuery(
  keyword: string,
  mscaType: string,
  page: number,
  pageSize: number,
): string {
  const offset = (page - 1) * pageSize;
  const kwFilter = keyword
    ? `FILTER(CONTAINS(LCASE(?title), '${escapeString(keyword.toLowerCase())}') || CONTAINS(LCASE(COALESCE(?objective,"")), '${escapeString(keyword.toLowerCase())}'))`
    : '';
  const typeFilter =
    mscaType && mscaType !== 'all'
      ? `FILTER(CONTAINS(UCASE(?mscaLabel), '-${escapeString(mscaType.toUpperCase())}-') || REGEXP(UCASE(?mscaLabel), '-${escapeString(mscaType.toUpperCase())}$'))`
      : '';

  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?project ?title ?acronym ?identifier ?startDate ?mscaLabel ?countryName
WHERE {
  ?project a eurio:Project .
  ?project eurio:title ?title .
  OPTIONAL { ?project eurio:acronym ?acronym }
  OPTIONAL { ?project eurio:identifier ?identifier }
  OPTIONAL { ?project eurio:startDate ?startDate }
  OPTIONAL { ?project eurio:objective ?objective }

  ?project eurio:isFundedBy ?mscaGrant .
  { ?mscaGrant eurio:hasFundingSchemeTopic ?mscaTopic . } UNION { ?mscaGrant eurio:hasFundingSchemeCall ?mscaTopic . }
  ?mscaTopic rdfs:label ?mscaLabel .
  FILTER(
    CONTAINS(UCASE(?mscaLabel), 'MSCA') ||
    CONTAINS(UCASE(?mscaLabel), 'MARIE-CURIE') ||
    CONTAINS(UCASE(?mscaLabel), 'MARIE CURIE') ||
    CONTAINS(UCASE(?mscaLabel), 'H2020-MSCA') ||
    CONTAINS(UCASE(?mscaLabel), 'FP7-PEOPLE')
  )
  ${typeFilter}

  OPTIONAL {
    ?project eurio:hasInvolvedParty ?coordRole .
    ?coordRole eurio:roleLabel ?rl .
    FILTER(CONTAINS(UCASE(?rl), 'COORDINATOR'))
    ?coordRole eurio:isRoleOf ?coordOrg .
    ?coordOrg eurio:hasSite ?coordSite .
    ?coordSite eurio:hasGeographicalLocation ?coordCountry .
    ?coordCountry a eurio:Country .
    ?coordCountry eurio:name ?countryName .
  }

  ${kwFilter}
}
ORDER BY DESC(?startDate)
LIMIT ${pageSize}
OFFSET ${offset}
  `.trim();
}

/** Search for MSCA host organisations by research area */
export function buildMscaSupervisorSearchQuery(researchArea: string): string {
  const area = escapeString(researchArea.toLowerCase());
  return `
PREFIX eurio: <http://data.europa.eu/s66#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?orgName ?countryName (COUNT(DISTINCT ?project) AS ?mscaProjectCount)
       (GROUP_CONCAT(DISTINCT ?title; SEPARATOR="||") AS ?projectTitles)
WHERE {
  ?project a eurio:Project .
  ?project eurio:title ?title .
  FILTER(CONTAINS(LCASE(?title), '${area}'))

  ?project eurio:isFundedBy ?mscaGrant .
  { ?mscaGrant eurio:hasFundingSchemeTopic ?mscaTopic . } UNION { ?mscaGrant eurio:hasFundingSchemeCall ?mscaTopic . }
  ?mscaTopic rdfs:label ?mscaLabel .
  FILTER(
    CONTAINS(UCASE(?mscaLabel), 'MSCA') ||
    CONTAINS(UCASE(?mscaLabel), 'MARIE') ||
    CONTAINS(UCASE(?mscaLabel), 'FP7-PEOPLE')
  )

  ?project eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?org .
  ?org eurio:legalName ?orgName .
  OPTIONAL {
    ?org eurio:hasSite ?site .
    ?site eurio:hasGeographicalLocation ?country .
    ?country a eurio:Country .
    ?country eurio:name ?countryName .
  }
}
GROUP BY ?orgName ?countryName
ORDER BY DESC(?mscaProjectCount)
LIMIT 20
  `.trim();
}

/** Fetch frequent co-applicant organisations */
export function buildOrgCoApplicantsQuery(orgName: string): string {
  const name = escapeString(orgName);
  return `
PREFIX eurio: <http://data.europa.eu/s66#>

SELECT ?coOrgName (COUNT(DISTINCT ?project) AS ?sharedCount)
WHERE {
  ?org eurio:legalName '${name}' .
  ?project a eurio:Project .
  ?project eurio:hasInvolvedParty ?role1 .
  ?role1 eurio:isRoleOf ?org .
  ?project eurio:hasInvolvedParty ?role2 .
  ?role2 eurio:isRoleOf ?coOrg .
  ?coOrg eurio:legalName ?coOrgName .
  FILTER(?coOrgName != '${name}')
}
GROUP BY ?coOrgName
ORDER BY DESC(?sharedCount)
LIMIT 10
  `.trim();
}
