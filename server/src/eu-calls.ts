import type { FundingCall } from './types.js';

/**
 * EU Member States (27 countries as of 2025)
 */
export const EU_MEMBER_STATES = new Set([
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
  'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia',
  'Slovenia', 'Spain', 'Sweden',
]);

/**
 * Horizon Europe Associated Countries (as of 2025-2026)
 * Includes EEA/EFTA, Western Balkans, Eastern Partnership, and others
 */
export const HORIZON_ASSOCIATED_COUNTRIES = new Set([
  // EEA/EFTA
  'Iceland', 'Norway', 'Switzerland',
  // Western Balkans
  'Albania', 'Bosnia and Herzegovina', 'Kosovo', 'Montenegro',
  'North Macedonia', 'Serbia', 'Turkey',
  // Eastern Partnership
  'Armenia', 'Georgia', 'Moldova', 'Ukraine',
  // Other
  'Israel', 'Tunisia', 'Faroe Islands', 'United Kingdom',
  'New Zealand', 'Canada', 'South Korea',
]);

/**
 * Digital Europe Programme associated countries
 */
export const DEP_ASSOCIATED_COUNTRIES = new Set([
  'Iceland', 'Norway', 'Switzerland',
  'Albania', 'Bosnia and Herzegovina', 'Kosovo', 'Montenegro',
  'North Macedonia', 'Serbia', 'Turkey',
  'Ukraine', 'Moldova',
]);

/**
 * EUREKA / Eurostars member countries (beyond EU)
 */
export const EUREKA_COUNTRIES = new Set([
  ...EU_MEMBER_STATES,
  'Iceland', 'Norway', 'Switzerland', 'Turkey', 'United Kingdom',
  'Canada', 'Israel', 'South Korea', 'Singapore', 'South Africa',
]);

/**
 * LIFE programme associated countries
 */
export const LIFE_ASSOCIATED_COUNTRIES = new Set([
  'Iceland', 'Norway',
  'Moldova', 'North Macedonia', 'Ukraine',
]);

export const EU_FUNDING_CALLS: FundingCall[] = [
  {
    identifier: 'HORIZON-EIC-2026-ACCELERATOR-01',
    title: 'EIC Accelerator 2026 — Open',
    deadline: '2026-05-06',
    nextDeadline: '2026-05-06',
    budgetMax: 2500000,
    eligibleCountries: ['EU+AC'],
    programmeCode: 'HORIZON',
    smeOnly: true,
    isMultiStage: true,
    minTrl: 5,
    scope: 'The EIC Accelerator supports individual SMEs (including startups, spinoffs, and small mid-caps up to 499 employees) to develop and scale up breakthrough innovations. It covers deep tech and high-tech innovations with high market-creation potential. Grant component up to €2.5M plus optional equity investment up to €10M from the EIC Fund. Three-stage process: short application (5 pages + 3-min video, open continuously), full application (20 pages, submitted to batching dates), and jury interview in Brussels. Six batching dates in 2026: 7 Jan, 4 Mar, 6 May, 8 Jul, 2 Sep, 4 Nov.',
    expectedImpacts: 'Market-creating innovation that creates new industries or disrupts existing ones. Products or services at TRL 5/6 ready for development through TRL 6-8 and scale-up to TRL 9. Revenue generation within 3 years post-funding.',
  },
  {
    identifier: 'HORIZON-EIC-2026-PATHFINDEROPEN-01',
    title: 'EIC Pathfinder Open 2026',
    deadline: '2026-05-12',
    nextDeadline: '2026-05-12',
    budgetMax: 4000000,
    eligibleCountries: ['EU+AC'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 1,
    scope: 'EIC Pathfinder Open supports visionary research for radically new technologies at TRL 1-4. Projects should address unconventional, high-risk research with a long-term vision for future breakthrough technology. Consortia of at least 3 legal entities from 3 different EU Member States or Associated Countries. Budget up to €4M per project (increased from €3M). Total call budget: €166M.',
    expectedImpacts: 'Scientific and technological foundations for a new technology paradigm. Technology roadmap from TRL 1 towards TRL 4 by project end. New interdisciplinary research community formed around a technology vision.',
  },
  {
    identifier: 'HORIZON-MSCA-2026-PF-01',
    title: 'MSCA Postdoctoral Fellowships 2026',
    deadline: '2026-09-09',
    nextDeadline: '2026-09-09',
    budgetMax: 230000,
    eligibleCountries: ['EU+AC'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 1,
    scope: 'MSCA Postdoctoral Fellowships support the career development of researchers with a PhD. Fellows can work in academia, research institutions, or the private sector including SMEs. Projects must have an international mobility component. Funding is provided as monthly allowances (living, mobility, family, research costs). A typical 24-month European Fellowship totals €190-230K depending on host country. Optional 6-month non-academic placement available. Total call budget: €399M.',
    expectedImpacts: 'Enhanced researcher mobility and career development. Knowledge transfer between sectors and countries. Interdisciplinary collaboration and innovation through researcher placements in non-academic organisations.',
  },
  {
    identifier: 'HORIZON-CL4-2026-RESILIENCE-01',
    title: 'Horizon Europe Cluster 4 — Digital Industry & Space 2026',
    deadline: '2026-09-03',
    nextDeadline: '2026-09-03',
    budgetMax: 8000000,
    eligibleCountries: ['EU+AC'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 3,
    scope: 'Supports R&D&I in digital technologies and manufacturing including advanced materials, AI, robotics, photonics, quantum, and micro/nanoelectronics. Projects must address strategic autonomy of European industry in digital technologies. Budget varies by topic: RIAs typically €3-6M, Innovation Actions up to €8M. TRL requirements vary by action type: RIAs target TRL 3-6, IAs target TRL 5-8. 2026-2027 total budget: €1.5B.',
    expectedImpacts: 'European leadership in key digital enabling technologies. Strengthened digital industrial base with measurable SME participation. Deployment of next-generation digital solutions in industrial settings.',
  },
  {
    identifier: 'HORIZON-CL5-2026-D3-01',
    title: 'Horizon Europe Cluster 5 — Clean Energy Transition 2026',
    deadline: '2026-09-09',
    nextDeadline: '2026-09-09',
    budgetMax: 6000000,
    eligibleCountries: ['EU+AC'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 3,
    scope: 'Supports R&D for climate, energy and mobility. Covers renewable energy, energy storage, smart grids, energy efficiency in buildings and industry, carbon capture, and sustainable transport. Contribution to European Green Deal and Clean Industrial Deal. Budget varies: RIAs €1.5-5M, IAs up to €6M. TRL varies by action type. HORIZON-CL5-2026-02 budget: €318M across 20 topics.',
    expectedImpacts: 'Accelerated clean energy deployment with demonstrated cost reductions. Cross-border energy systems integration. Measurable CO2 reduction potential from funded technologies.',
  },
  {
    identifier: 'HORIZON-CL6-2026-FARM2FORK-01',
    title: 'Horizon Europe Cluster 6 — Food, Bioeconomy, Natural Resources 2026',
    deadline: '2026-09-03',
    nextDeadline: '2026-09-03',
    budgetMax: 7000000,
    eligibleCountries: ['EU+AC'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 3,
    scope: 'Supports sustainable food systems, circular bioeconomy, clean water, soil health, and rural communities. Projects must align with Farm to Fork strategy and EU Biodiversity Strategy. Multidisciplinary approaches combining biological, ecological, and social sciences. 2026 budget: €638M across 57 calls. Typical RIA grants €3-7M.',
    expectedImpacts: 'More sustainable and resilient food production systems. Reduced environmental footprint of agriculture and food processing. Improved circularity of bio-based materials and resources.',
  },
  {
    identifier: 'HORIZON-CL1-2026-HEALTH-01',
    title: 'Horizon Europe Cluster 1 — Health 2026',
    deadline: '2026-04-16',
    nextDeadline: '2026-04-16',
    budgetMax: 8000000,
    eligibleCountries: ['EU+AC'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 3,
    scope: 'Supports research on infectious diseases, cancer, rare diseases, mental health, and healthy ageing. Projects must involve clinical validation and patient communities. Focus on personalised medicine, early detection, and innovative therapies. Individual topics expect €6-8M per project, some up to €10M.',
    expectedImpacts: 'New diagnostic tools or therapies with defined clinical development pathway. Reduced disease burden with quantified impact metrics. Patient-centric approaches with demonstrated engagement.',
  },
  {
    identifier: 'DIGITAL-2026-AI-09-GENAI-PA',
    title: 'Digital Europe — AI for Public Administration 2026',
    deadline: '2026-06-19',
    nextDeadline: '2026-06-19',
    budgetMax: 1800000,
    eligibleCountries: ['EU+DEP'],
    programmeCode: 'DIGITAL',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 7,
    scope: 'Deployment of AI and generative AI solutions for public administration modernisation. Projects must demonstrate integration with existing government IT infrastructure and compliance with EU AI Act. Pilots in at least 3 EU Member States required. 100% EU co-funding rate. Open to EU Member States and DEP-associated countries.',
    expectedImpacts: 'Measurable efficiency gains in public service delivery. Replicable AI solutions with cross-border potential. Full compliance with EU AI Act and GDPR demonstrated.',
  },
  {
    identifier: 'DIGITAL-2026-CLOUD-DATA-01',
    title: 'Digital Europe — Cloud-to-Edge & European Data Spaces 2026',
    deadline: '2026-07-15',
    nextDeadline: '2026-07-15',
    budgetMax: 5000000,
    eligibleCountries: ['EU+DEP'],
    programmeCode: 'DIGITAL',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 7,
    scope: 'Deployment of federated cloud-to-edge infrastructure and European data spaces aligned with EU data strategy. Projects must demonstrate data sovereignty, interoperability, and GAIA-X compliance. Focus on operational deployment rather than research. Open to EU Member States and DEP-associated countries.',
    expectedImpacts: 'Expanded European cloud capacity reducing dependence on non-EU hyperscalers. Operational federated data spaces in at least 2 industry sectors. Demonstrated GDPR-compliant cross-border data sharing.',
  },
  {
    identifier: 'HORIZON-EIC-2026-TRANSITIONOPEN-01',
    title: 'EIC Transition Open 2026',
    deadline: '2026-09-16',
    nextDeadline: '2026-09-16',
    budgetMax: 2500000,
    eligibleCountries: ['EU+AC'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 3,
    scope: 'EIC Transition supports activities that bridge the gap between EIC Pathfinder research and innovation/market deployment. Projects must start at TRL 3-4 and demonstrate the viability and potential of a new technology, developing a business plan. Should reach TRL 5-6 by end of project. Total budget: €100M.',
    expectedImpacts: 'Technology validated in relevant environment (TRL 5-6). Initial market validation and first customers identified. Clear spin-off or licensing pathway defined.',
  },
  {
    identifier: 'EUREKA-EUROSTARS-2026-SEP',
    title: 'EUREKA Eurostars September 2026 — R&D SMEs',
    deadline: '2026-09-11',
    nextDeadline: '2026-09-11',
    budgetMax: 1500000,
    eligibleCountries: ['EUREKA'],
    programmeCode: 'EUREKA',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 3,
    scope: 'Eurostars supports innovative SME-led consortia developing products, processes and services for global markets. Projects must be LED by an R&D-performing SME (50%+ of budget from SMEs), but universities, research organisations, and large companies can participate as partners. At least 2 partners from 2 different EUREKA countries. Average total project subsidy ~€1.5M split among partners; per-country maximums vary. 37 participating countries including non-EU (UK, Canada, Israel, South Korea, etc.).',
    expectedImpacts: 'New or significantly improved product, process or service ready for commercialisation within 2 years. International R&D collaboration. Market launch plan with revenue projections.',
  },
  {
    identifier: 'LIFE-2026-CET',
    title: 'LIFE Programme — Clean Energy Transition 2026',
    deadline: '2026-09-18',
    nextDeadline: '2026-09-18',
    budgetMax: 3000000,
    eligibleCountries: ['EU+LIFE'],
    programmeCode: 'LIFE',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 6,
    scope: 'LIFE CET supports demonstration, deployment and replication of innovative solutions in clean energy. Projects must accelerate the shift towards an energy-efficient, renewable-based economy. Local authorities, SMEs, NGOs, and research organisations can apply. Open to EU Member States and LIFE-associated countries (including EEA, Moldova, North Macedonia, Ukraine).',
    expectedImpacts: 'Quantified energy savings or renewable energy deployment. Replicability in at least 5 EU Member States. Consumer behaviour change measurable at scale.',
  },
  {
    identifier: 'HORIZON-JU-CBE-2026-R-01',
    title: 'CBE JU — Circular Bio-based Europe 2026',
    deadline: '2026-09-22',
    nextDeadline: '2026-09-22',
    budgetMax: 7000000,
    eligibleCountries: ['EU+AC'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 4,
    scope: 'CBE JU funds research and innovation projects in circular bio-based industries. Projects should develop bio-based materials, chemicals, or fuels from renewable biological resources. Must address value chain development from biomass to end products. RIAs target TRL 4-5 (~€6-7M each), Innovation Actions target TRL 6-7 (~€14M each), Flagships target TRL 8 (~€20M each). Total 2026 call budget: €170.7M.',
    expectedImpacts: 'New bio-based value chains commercially viable without subsidies by 2030. Measurable reduction in fossil-based resource use. Industrial-scale demonstration of bio-based processes.',
  },
  {
    identifier: 'HORIZON-JU-CHIPS-2026-KEY-01',
    title: 'Chips JU — Key Digital Technologies 2026',
    deadline: '2026-11-06',
    nextDeadline: '2026-11-06',
    budgetMax: 12000000,
    eligibleCountries: ['EU+AC'],
    programmeCode: 'HORIZON',
    smeOnly: false,
    isMultiStage: false,
    minTrl: 3,
    scope: 'Chips JU supports R&D in semiconductor technology, chip design, and microelectronics manufacturing. Projects must address European strategic autonomy in chips. Collaboration between industry, research, and SMEs required. RIA calls cover TRL 3-4, IA calls cover TRL 5-8 with grants up to €15M. At least 20% SME participation expected. 2026 budget: €216M.',
    expectedImpacts: 'European leadership in next-generation chip technology. Reduced dependence on non-EU chip manufacturing. Pilot lines and design capabilities for advanced chips.',
  },
  {
    identifier: 'InvestEU-2026-SME-GUARANTEE',
    title: 'InvestEU — SME Window (Guarantee-backed Finance)',
    deadline: '2027-06-30',
    nextDeadline: '2027-06-30',
    budgetMax: 15000000,
    eligibleCountries: ['EU'],
    programmeCode: 'InvestEU',
    smeOnly: true,
    isMultiStage: false,
    minTrl: 1,
    scope: 'InvestEU SME Window is NOT a grant programme. It provides EU guarantee-backed loans and equity investments for SMEs, delivered through national promotional banks and financial intermediaries (e.g. EIF). SMEs do not apply directly — they access financing through participating intermediaries. Focuses on innovative SMEs, green transition, and digitalisation. No TRL requirement. Rolling access until June 2027.',
    expectedImpacts: 'Increased SME investment in innovation and digital transformation. Job creation and economic growth in EU regions. Leverage of at least 5x private capital per euro of EU guarantee.',
  },
];

/**
 * Determines whether a country is eligible for a given call
 * based on the call's eligibility tag and the country's status.
 */
function isCountryEligible(country: string, eligibilityTags: string[]): boolean {
  for (const tag of eligibilityTags) {
    switch (tag) {
      case 'EU':
        if (EU_MEMBER_STATES.has(country)) return true;
        break;
      case 'EU+AC':
        if (EU_MEMBER_STATES.has(country) || HORIZON_ASSOCIATED_COUNTRIES.has(country)) return true;
        break;
      case 'EU+DEP':
        if (EU_MEMBER_STATES.has(country) || DEP_ASSOCIATED_COUNTRIES.has(country)) return true;
        break;
      case 'EU+LIFE':
        if (EU_MEMBER_STATES.has(country) || LIFE_ASSOCIATED_COUNTRIES.has(country)) return true;
        break;
      case 'EUREKA':
        if (EUREKA_COUNTRIES.has(country)) return true;
        break;
      default:
        if (tag === country) return true;
    }
  }
  return false;
}

export function getCallsForProfile(countryOfTaxResidence: string): FundingCall[] {
  return EU_FUNDING_CALLS.filter(call =>
    isCountryEligible(countryOfTaxResidence, call.eligibleCountries),
  );
}
