// SPARQL response envelope
export interface SparqlResponse {
  results: {
    bindings: SparqlBinding[];
  };
}

export interface SparqlBinding {
  [key: string]: {
    type: string;
    value: string;
    datatype?: string;
    'xml:lang'?: string;
  };
}

// App domain types
export interface ProjectSummary {
  uri: string;
  title: string;
  acronym?: string;
  identifier?: string;
  startDate?: string;
  endDate?: string;
  programme?: 'FP7' | 'H2020' | 'HE';
  coordinator?: string;
  countries: string[];
  managingInstitution?: string;
  topicLabel?: string;
}

export interface ProjectDetail extends ProjectSummary {
  abstract?: string;
  keywords?: string[];
  participants: Participant[];
  totalCost?: string;
  ecContribution?: string;
  status?: string;
}

export interface Participant {
  orgName: string;
  role: string;
  country: string;
}

export interface Publication {
  title?: string;
  doi?: string;
  authors?: string;
  publisher?: string;
}

export interface SearchFilters {
  keyword?: string;
  country?: string;
  organisation?: string;
  euroSciVoc?: string;
  programme?: 'FP7' | 'H2020' | 'HE' | null;
  cluster?: string | null; // '1'–'6' = HE Pillar 2 cluster number
  startDateFrom?: string;
  startDateTo?: string;
  status?: 'SIGNED' | 'CLOSED' | null;
  managingInstitution?: string;
  page: number;
  pageSize: number;
}

export interface SearchResult {
  projects: ProjectSummary[];
  totalEstimate: number;
}

export interface StartupProfile {
  // Step 1
  email: string;
  firstName: string;
  lastName: string;
  organisationName: string;
  preferredCluster?: string; // HE cluster number '1'–'6', passed as context hint to AI
  // Step 2
  organisationType: string;
  countryOfTaxResidence: string;
  countryOfIncorporation?: string;
  sector?: string;
  productDescription: string;
  stage: string;
  // Step 3
  teamSize: string;
  annualRevenue?: string;
  rdActivity: string;
  coFundingCapacity?: string;
  matchCount?: number;
}

export interface MatchResult {
  callTitle: string;
  callId: string;
  deadline?: string;
  budget?: string;
  matchScore: number;
  verdict: 'GO' | 'MAYBE' | 'NO-GO';
  reasoning: {
    strengths: string[];
    weaknesses: string[];
    redFlags: string[];
  };
  strategicFitAnalysis: string;
  recommendedPivot?: string;
  consortiumRequired: boolean;
  minPartners?: number;
  minCountries?: number;
  fundingType: 'grant' | 'blended' | 'guarantee' | 'fellowship';
  typicalSuccessRate?: string;
  applicationEffortHours?: number;
  timeToMoneyMonths?: number;
  minTrl?: number;
  maxTrl?: number;
}

export interface FilteredCall {
  callTitle: string;
  callId: string;
  reason: string;
}

export interface FundingCall {
  identifier: string;
  title: string;
  deadline: string;
  nextDeadline: string;
  budgetMax: number;
  eligibleCountries: string[];
  programmeCode: string;
  scope: string;
  expectedImpacts: string;
  smeOnly: boolean;
  isMultiStage: boolean;
  minTrl?: number;
  maxTrl?: number;
  consortiumRequired: boolean;
  minPartners?: number;
  minCountries?: number;
  fundingType: 'grant' | 'blended' | 'guarantee' | 'fellowship';
  typicalSuccessRate?: string;
  applicationEffortHours?: number;
  timeToMoneyMonths?: number;
}
