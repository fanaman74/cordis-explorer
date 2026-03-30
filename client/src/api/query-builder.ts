import type { SearchFilters } from './types';

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

export function buildCountQuery(filters: SearchFilters): string {
  const searchQuery = buildProjectSearchQuery({ ...filters, page: 1, pageSize: 1 });
  // Wrap the search query as a subquery to count results
  const innerWhere = searchQuery
    .replace(/SELECT DISTINCT.*?WHERE/s, 'SELECT (COUNT(DISTINCT ?project) AS ?count) WHERE')
    .replace(/ORDER BY.*$/s, '}');

  return innerWhere;
}
