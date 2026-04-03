import { Router } from 'express';
import type { Request, Response } from 'express';
import { getCacheKey, getCached, setCache } from './cache.js';

export const eventsRouter = Router();

export interface BrokerageEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  country?: string;
  city?: string;
  registrationUrl?: string;
  category: string;
  source: string;
}

// ─── Curated 2026 EU Research Events ────────────────────────────────────────
// Dates sourced from official HE Work Programme, ERC work plan, and MSCA calls.
// Marked with source URLs for verification.
const STATIC_EVENTS: BrokerageEvent[] = [
  // ── MSCA ──────────────────────────────────────────────────────────────────
  {
    id: 'msca-pf-2026-opens',
    title: 'MSCA Postdoctoral Fellowships 2026 — Call Opens',
    description: 'The 2026 MSCA Postdoctoral Fellowships call opens. European and Global Fellowships for experienced researchers to work at host organisations.',
    startDate: '2026-04-22',
    category: 'MSCA',
    registrationUrl: 'https://marie-sklodowska-curie-actions.ec.europa.eu/calls/msca-postdoctoral-fellowships-2026',
    source: 'static',
  },
  {
    id: 'msca-dn-2026-deadline',
    title: 'MSCA Doctoral Networks 2026 — Submission Deadline',
    description: 'Deadline for MSCA Doctoral Networks 2026. Supports doctoral programmes by partnerships of organisations across sectors and countries.',
    startDate: '2026-05-28',
    category: 'MSCA',
    registrationUrl: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/horizon-msca-2026-dn-01-01',
    source: 'static',
  },
  {
    id: 'msca-se-2026-deadline',
    title: 'MSCA Staff Exchanges 2026 — Submission Deadline',
    description: 'Deadline for MSCA Staff Exchanges 2026. Supports knowledge transfer through staff exchanges between academic and non-academic organisations.',
    startDate: '2026-06-10',
    category: 'MSCA',
    registrationUrl: 'https://marie-sklodowska-curie-actions.ec.europa.eu/calls/msca-staff-exchanges-2026',
    source: 'static',
  },
  {
    id: 'msca-pf-2026-deadline',
    title: 'MSCA Postdoctoral Fellowships 2026 — Submission Deadline',
    description: 'Submission deadline for the 2026 MSCA Postdoctoral Fellowships call. Approximately 12–24 month individual fellowships in Europe or globally.',
    startDate: '2026-09-09',
    category: 'MSCA',
    registrationUrl: 'https://marie-sklodowska-curie-actions.ec.europa.eu/calls/msca-postdoctoral-fellowships-2026',
    source: 'static',
  },
  {
    id: 'msca-cofund-2026-deadline',
    title: 'MSCA COFUND 2026 — Submission Deadline',
    description: 'Deadline for MSCA COFUND 2026. Co-funding of regional, national or international programmes for doctoral or postdoctoral researchers.',
    startDate: '2026-10-07',
    category: 'MSCA',
    registrationUrl: 'https://marie-sklodowska-curie-actions.ec.europa.eu/calls/msca-cofund-2026',
    source: 'static',
  },
  // ── ERC ───────────────────────────────────────────────────────────────────
  {
    id: 'erc-adg-2026-opens',
    title: 'ERC Advanced Grant 2026 — Call Opens',
    description: 'ERC Advanced Grant 2026 call opens. For established, leading researchers with ≥10 years post-PhD experience and a track record of significant research achievements.',
    startDate: '2026-05-08',
    category: 'ERC',
    registrationUrl: 'https://erc.europa.eu/funding/advanced-grants',
    source: 'static',
  },
  {
    id: 'erc-adg-2026-deadline',
    title: 'ERC Advanced Grant 2026 — Submission Deadline',
    description: 'Submission deadline for ERC Advanced Grant 2026. Grants up to €2.5M for frontier research in any field.',
    startDate: '2026-08-27',
    category: 'ERC',
    registrationUrl: 'https://erc.europa.eu/funding/advanced-grants',
    source: 'static',
  },
  {
    id: 'erc-stg-2026-deadline',
    title: 'ERC Starting Grant 2026 — Submission Deadline',
    description: 'Deadline for ERC Starting Grant 2026. For researchers 2–7 years post-PhD with excellent scientific track record. Grants up to €1.5M.',
    startDate: '2026-10-14',
    category: 'ERC',
    registrationUrl: 'https://erc.europa.eu/funding/starting-grants',
    source: 'static',
  },
  {
    id: 'erc-cog-2026-deadline',
    title: 'ERC Consolidator Grant 2026 — Submission Deadline',
    description: 'Deadline for ERC Consolidator Grant 2026. For researchers 7–12 years post-PhD. Grants up to €2M to consolidate independent research.',
    startDate: '2026-11-12',
    category: 'ERC',
    registrationUrl: 'https://erc.europa.eu/funding/consolidator-grants',
    source: 'static',
  },
  // ── EIC ───────────────────────────────────────────────────────────────────
  {
    id: 'eic-accelerator-2026-q1',
    title: 'EIC Accelerator 2026 — Cut-off (Spring)',
    description: 'EIC Accelerator Spring 2026 cut-off. Grants and blended finance (grants + equity) up to €17.5M for deep-tech startups and SMEs with disruptive innovations.',
    startDate: '2026-05-21',
    category: 'EIC',
    registrationUrl: 'https://eic.ec.europa.eu/eic-funding-opportunities/eic-accelerator_en',
    source: 'static',
  },
  {
    id: 'eic-pathfinder-2026-deadline',
    title: 'EIC Pathfinder 2026 — Submission Deadline',
    description: 'Deadline for EIC Pathfinder 2026 Open and Challenges. Supports visionary research for breakthrough technologies. Grants up to €4M.',
    startDate: '2026-06-17',
    category: 'EIC',
    registrationUrl: 'https://eic.ec.europa.eu/eic-funding-opportunities/eic-pathfinder_en',
    source: 'static',
  },
  {
    id: 'eic-accelerator-2026-q3',
    title: 'EIC Accelerator 2026 — Cut-off (Autumn)',
    description: 'EIC Accelerator Autumn 2026 cut-off. Full proposals stage for companies that passed short application.',
    startDate: '2026-10-07',
    category: 'EIC',
    registrationUrl: 'https://eic.ec.europa.eu/eic-funding-opportunities/eic-accelerator_en',
    source: 'static',
  },
  // ── Horizon Europe Clusters ────────────────────────────────────────────────
  {
    id: 'he-cl4-digital-2026',
    title: 'Horizon Europe CL4 — Digital, Industry & Space Deadline',
    description: 'Main submission deadline for Horizon Europe Cluster 4 (Digital, Industry & Space) 2026 calls. Covers AI, manufacturing, advanced materials, and space.',
    startDate: '2026-04-22',
    category: 'Horizon Europe',
    registrationUrl: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/calls-for-proposals?status=31094501,31094502&programmePart=43108390',
    source: 'static',
  },
  {
    id: 'he-cl5-climate-2026',
    title: 'Horizon Europe CL5 — Climate, Energy & Mobility Deadline',
    description: 'Deadline for Horizon Europe Cluster 5 2026 calls. Covers climate science, clean energy, energy systems, transport, and smart mobility.',
    startDate: '2026-05-06',
    category: 'Horizon Europe',
    registrationUrl: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/calls-for-proposals?status=31094501,31094502&programmePart=43108391',
    source: 'static',
  },
  {
    id: 'he-cl1-health-2026',
    title: 'Horizon Europe CL1 — Health Deadline',
    description: 'Submission deadline for Horizon Europe Cluster 1 (Health) 2026 calls. Covers cancer, infectious disease, health systems, and personalised medicine.',
    startDate: '2026-06-03',
    category: 'Horizon Europe',
    registrationUrl: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/calls-for-proposals?status=31094501,31094502&programmePart=43108388',
    source: 'static',
  },
  {
    id: 'he-cl6-food-2026',
    title: 'Horizon Europe CL6 — Food, Bioeconomy & Agriculture Deadline',
    description: 'Deadline for Horizon Europe Cluster 6 2026 calls. Covers food systems, circular bioeconomy, natural resources, and agriculture.',
    startDate: '2026-06-10',
    category: 'Horizon Europe',
    registrationUrl: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/calls-for-proposals?status=31094501,31094502&programmePart=43108393',
    source: 'static',
  },
  {
    id: 'he-cl2-culture-2026',
    title: 'Horizon Europe CL2 — Culture, Creativity & Society Deadline',
    description: 'Deadline for Horizon Europe Cluster 2 2026 calls. Covers democracy, cultural heritage, social sciences & humanities, and media.',
    startDate: '2026-09-16',
    category: 'Horizon Europe',
    registrationUrl: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/calls-for-proposals?status=31094501,31094502&programmePart=43108389',
    source: 'static',
  },
  {
    id: 'he-cl3-security-2026',
    title: 'Horizon Europe CL3 — Civil Security for Society Deadline',
    description: 'Deadline for Horizon Europe Cluster 3 2026 calls. Covers border management, infrastructure protection, cybersecurity, disaster resilience, and crisis management.',
    startDate: '2026-09-23',
    category: 'Horizon Europe',
    registrationUrl: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/calls-for-proposals?status=31094501,31094502&programmePart=43108392',
    source: 'static',
  },
  // ── Events & Info Days ────────────────────────────────────────────────────
  {
    id: 'een-matchmaking-brussels-2026',
    title: 'EEN Matchmaking — Brussels Partnership Forum 2026',
    description: 'Annual flagship Enterprise Europe Network brokerage event in Brussels. Hundreds of bilateral meetings between companies, research organisations, and universities.',
    startDate: '2026-04-28',
    endDate: '2026-04-29',
    country: 'Belgium',
    city: 'Brussels',
    category: 'EEN Brokerage',
    registrationUrl: 'https://een.ec.europa.eu/events',
    source: 'static',
  },
  {
    id: 'he-infoday-2026-spring',
    title: 'Horizon Europe Info Day — Spring 2026',
    description: 'Official Horizon Europe info day for upcoming calls. Presentations on call topics, eligibility, proposal writing tips, and Q&A with Programme Officers.',
    startDate: '2026-05-13',
    country: 'Belgium',
    city: 'Brussels',
    category: 'EC Research & Innovation',
    registrationUrl: 'https://research-and-innovation.ec.europa.eu/events_en',
    source: 'static',
  },
  {
    id: 'erc-infoday-2026',
    title: 'ERC 2026 Info Day — Grants & Application Guidance',
    description: 'European Research Council info day explaining the 2026 grant portfolio. Includes Starting, Consolidator, and Advanced Grant guidance, plus panel Q&A.',
    startDate: '2026-06-24',
    country: 'Belgium',
    city: 'Brussels',
    category: 'ERC',
    registrationUrl: 'https://erc.europa.eu/news-events/events',
    source: 'static',
  },
  {
    id: 'ideal-ist-matchmaking-2026',
    title: 'Ideal-ist ICT Matchmaking Event 2026 (CL4)',
    description: 'Annual ICT/Digital brokerage event organised by the Ideal-ist NCP network. Partnership meetings for Horizon Europe Cluster 4 Digital, Industry & Space proposals.',
    startDate: '2026-07-08',
    endDate: '2026-07-09',
    category: 'EEN Brokerage',
    registrationUrl: 'https://www.ideal-ist.eu/events',
    source: 'static',
  },
  {
    id: 'msca-infoday-2026',
    title: 'MSCA Info Day 2026 — Postdoctoral Fellowships',
    description: 'Official MSCA info day for Postdoctoral Fellowships 2026. Covers eligibility, evaluation criteria, proposal writing guidance, and online portal walkthrough.',
    startDate: '2026-07-15',
    category: 'MSCA',
    registrationUrl: 'https://marie-sklodowska-curie-actions.ec.europa.eu/events',
    source: 'static',
  },
  {
    id: 'net4society-matchmaking-2026',
    title: 'Net4Society Matchmaking Event 2026 (CL2)',
    description: 'Brokerage event for Cluster 2 (Culture, Creativity & Society). Find partners for Social Sciences & Humanities-embedded Horizon Europe proposals.',
    startDate: '2026-08-25',
    category: 'EEN Brokerage',
    registrationUrl: 'https://www.net4society.eu/events',
    source: 'static',
  },
  {
    id: 'he-infoday-2026-autumn',
    title: 'Horizon Europe Info Day — Autumn 2026',
    description: 'Autumn Horizon Europe info day covering calls open for the year-end period. Focus on Pillar 2 cluster calls and EIC instruments.',
    startDate: '2026-09-30',
    country: 'Belgium',
    city: 'Brussels',
    category: 'EC Research & Innovation',
    registrationUrl: 'https://research-and-innovation.ec.europa.eu/events_en',
    source: 'static',
  },
  {
    id: 'greenet-matchmaking-2026',
    title: 'GREENET Matchmaking Event 2026 (CL5)',
    description: 'Brokerage event for Cluster 5 (Climate, Energy, Mobility) organised by the GREENET NCP network. Find consortium partners for clean energy and transport proposals.',
    startDate: '2026-10-14',
    category: 'EEN Brokerage',
    registrationUrl: 'https://www.greenet.network/events',
    source: 'static',
  },
];

// ── Cluster keyword sets for filtering ──────────────────────────────────────
const CLUSTER_CATEGORIES: Record<string, string[]> = {
  '1': ['MSCA', 'ERC', 'EC Research & Innovation', 'Horizon Europe'],   // Health — all general
  '2': ['EC Research & Innovation', 'EEN Brokerage', 'Horizon Europe'],  // Culture
  '3': ['EC Research & Innovation', 'EEN Brokerage', 'Horizon Europe'],  // Security
  '4': ['EIC', 'EC Research & Innovation', 'EEN Brokerage', 'Horizon Europe'],  // Digital
  '5': ['EC Research & Innovation', 'EEN Brokerage', 'Horizon Europe'],  // Climate
  '6': ['EC Research & Innovation', 'EEN Brokerage', 'Horizon Europe'],  // Food
};

// HE cluster-specific event IDs
const CLUSTER_EVENT_IDS: Record<string, string[]> = {
  '1': ['he-cl1-health-2026', 'msca-pf-2026-opens', 'msca-pf-2026-deadline', 'msca-dn-2026-deadline', 'msca-se-2026-deadline', 'msca-cofund-2026-deadline', 'msca-infoday-2026', 'erc-adg-2026-opens', 'erc-adg-2026-deadline', 'erc-stg-2026-deadline', 'erc-cog-2026-deadline', 'erc-infoday-2026', 'he-infoday-2026-spring', 'he-infoday-2026-autumn', 'een-matchmaking-brussels-2026'],
  '2': ['he-cl2-culture-2026', 'net4society-matchmaking-2026', 'he-infoday-2026-spring', 'he-infoday-2026-autumn', 'een-matchmaking-brussels-2026'],
  '3': ['he-cl3-security-2026', 'he-infoday-2026-spring', 'he-infoday-2026-autumn', 'een-matchmaking-brussels-2026'],
  '4': ['he-cl4-digital-2026', 'eic-accelerator-2026-q1', 'eic-accelerator-2026-q3', 'eic-pathfinder-2026-deadline', 'ideal-ist-matchmaking-2026', 'he-infoday-2026-spring', 'he-infoday-2026-autumn', 'een-matchmaking-brussels-2026'],
  '5': ['he-cl5-climate-2026', 'greenet-matchmaking-2026', 'he-infoday-2026-spring', 'he-infoday-2026-autumn', 'een-matchmaking-brussels-2026'],
  '6': ['he-cl6-food-2026', 'he-infoday-2026-spring', 'he-infoday-2026-autumn', 'een-matchmaking-brussels-2026'],
};

function getFilteredEvents(cluster?: string): BrokerageEvent[] {
  if (!cluster || !CLUSTER_EVENT_IDS[cluster]) return STATIC_EVENTS;
  const ids = new Set(CLUSTER_EVENT_IDS[cluster]);
  return STATIC_EVENTS.filter(e => ids.has(e.id));
}

eventsRouter.get('/', async (req: Request, res: Response) => {
  const { cluster } = req.query as Record<string, string>;

  const cacheKey = getCacheKey(`events3:${cluster ?? ''}`);
  const cached = getCached(cacheKey);
  if (cached) { res.json(cached); return; }

  const events = getFilteredEvents(cluster);
  const payload = { events, total: events.length, page: 1 };
  setCache(cacheKey, payload);
  res.json(payload);
});
