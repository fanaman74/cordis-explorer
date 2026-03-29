export interface StartupProfile {
  email: string;
  firstName: string;
  lastName: string;
  organisationName: string;
  organisationType: string;
  countryOfTaxResidence: string;
  countryOfIncorporation?: string;
  sector?: string;
  productDescription: string;
  stage: string;
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
