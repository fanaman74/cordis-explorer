import { useEffect, useState } from 'react';
import ClusterBubbles from '../components/common/ClusterBubbles';
import CalendarView from '../components/events/CalendarView';
import { useEvents } from '../hooks/useEvents';

interface EventSource {
  name: string;
  description: string;
  url: string;
  clusters?: string[];
  type: 'general' | 'cluster' | 'national' | 'matchmaking';
}

const EVENT_SOURCES: EventSource[] = [
  {
    name: 'Enterprise Europe Network (EEN)',
    description: 'Official EU brokerage events calendar — matchmaking sessions, partnership meetings, and consortium-building events across all Horizon Europe clusters.',
    url: 'https://een.ec.europa.eu/events',
    type: 'general',
  },
  {
    name: 'European Commission Research Events',
    description: 'Official EC research and innovation events including info days, stakeholder conferences, and programme launch events.',
    url: 'https://research-and-innovation.ec.europa.eu/events_en',
    type: 'general',
  },
  {
    name: 'Horizon Europe Info Days (Funding & Tenders)',
    description: 'Info days and webinars for open Horizon Europe calls — directly on the EU Funding & Tenders Portal.',
    url: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/events',
    type: 'general',
  },
  {
    name: 'Ideal-ist ICT / Digital (CL4)',
    description: 'NCP network for ICT and digital technology — Cluster 4 brokerage events, partner search events, and proposal writing workshops.',
    url: 'https://www.ideal-ist.eu/events',
    clusters: ['Digital, Industry & Space (CL4)'],
    type: 'cluster',
  },
  {
    name: 'GREENET (Climate & Energy) (CL5)',
    description: 'Events for Cluster 5 (Climate, Energy, Mobility) — info days, brokerage, and NCP matchmaking in clean energy and transport.',
    url: 'https://www.greenet.network/events',
    clusters: ['Climate, Energy & Mobility (CL5)'],
    type: 'cluster',
  },
  {
    name: 'Net4Society (Social Sciences) (CL2)',
    description: 'NCP network for Cluster 2 (Culture, Creativity, Social Sciences) — training days, partnering events, and cross-cutting Social Sciences & Humanities activities.',
    url: 'https://www.net4society.eu/events',
    clusters: ['Culture, Creativity & Society (CL2)'],
    type: 'cluster',
  },
  {
    name: 'BESTPRAC / EaP NCP Network (CL3)',
    description: 'NCP coordination for Cluster 3 (Civil Security for Society) — networking events and brokerage.',
    url: 'https://www.ncpeasecurity.eu/events/',
    clusters: ['Civil Security for Society (CL3)'],
    type: 'cluster',
  },
  {
    name: 'HealthNCPs (CL1)',
    description: 'NCP network for Cluster 1 (Health) — consortium-building events, info days, and proposal support for health research calls.',
    url: 'https://www.healthncps.eu/events/',
    clusters: ['Health (CL1)'],
    type: 'cluster',
  },
  {
    name: 'AgriFoodNCP Network (CL6)',
    description: 'NCP network for Cluster 6 (Food, Bioeconomy, Agriculture) — partnering events and info days for food & nature research.',
    url: 'https://www.ncp-agrifood.eu/events',
    clusters: ['Food, Bioeconomy & Agriculture (CL6)'],
    type: 'cluster',
  },
  {
    name: 'ERC Events',
    description: 'European Research Council info days, webinars, and open science events for ERC grants (Starting, Consolidator, Advanced, Synergy).',
    url: 'https://erc.europa.eu/news-events/events',
    type: 'general',
  },
  {
    name: 'MSCA Events',
    description: 'Marie Skłodowska-Curie Actions info days, researcher training events, and MSCA matchmaking (Postdoctoral Fellowships, Doctoral Networks, etc.).',
    url: 'https://marie-sklodowska-curie-actions.ec.europa.eu/events',
    type: 'general',
  },
  {
    name: 'KIC / EIT Events',
    description: 'Events from EIT Knowledge and Innovation Communities (KIC Climate, KIC Food, KIC Health, KIC Manufacturing, etc.)',
    url: 'https://eit.europa.eu/our-activities/events',
    type: 'general',
  },
];

const TYPE_LABELS: Record<EventSource['type'], string> = {
  general: 'General / Cross-Cluster',
  cluster: 'Cluster-Specific NCP',
  national: 'National NCP',
  matchmaking: 'Matchmaking',
};

const TYPE_COLORS: Record<EventSource['type'], string> = {
  general: 'bg-[var(--color-eu-blue)]/20 text-[var(--color-eu-blue-lighter)] border-[var(--color-eu-blue)]/30',
  cluster: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  national: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  matchmaking: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
};

const CLUSTER_MAP: Record<string, string[]> = {
  '1': ['Health (CL1)'],
  '2': ['Culture, Creativity & Society (CL2)'],
  '3': ['Civil Security for Society (CL3)'],
  '4': ['Digital, Industry & Space (CL4)'],
  '5': ['Climate, Energy & Mobility (CL5)'],
  '6': ['Food, Bioeconomy & Agriculture (CL6)'],
};

export default function EventsPage() {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    cluster: selectedCluster ?? undefined,
    page: 1,
  });

  useEffect(() => {
    document.title = 'Brokerage Events — CORDIS Explorer';
  }, []);

  const filtered = selectedCluster
    ? EVENT_SOURCES.filter(s =>
        !s.clusters ||
        s.type === 'general' ||
        (CLUSTER_MAP[selectedCluster] &&
          s.clusters?.some(c => CLUSTER_MAP[selectedCluster].includes(c)))
      )
    : EVENT_SOURCES;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          Brokerage Events
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          EU research networking and brokerage events from across the Horizon Europe ecosystem.
          Browse official sources for partnership opportunities, matchmaking sessions, and consortium-building events.
        </p>
      </div>

      {/* Cluster filter */}
      <div className="mb-6 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <ClusterBubbles
          selected={selectedCluster}
          onChange={setSelectedCluster}
          label="Filter by Horizon Europe Cluster"
        />
      </div>

      {/* Events Calendar */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Upcoming Events
        </h2>
        <CalendarView
          events={eventsData?.events ?? []}
          isLoading={eventsLoading}
        />
      </div>

      {/* Event sources */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Browse Event Sources
        </h2>
        <div className="space-y-4">
          {filtered.map(source => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 hover:border-[var(--color-eu-blue-lighter)] transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-[var(--color-text-primary)] text-sm group-hover:text-[var(--color-eu-blue-lighter)] transition-colors">
                      {source.name}
                    </h3>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[source.type]}`}>
                      {TYPE_LABELS[source.type]}
                    </span>
                  </div>
                  {source.clusters && (
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                      {source.clusters.join(' · ')}
                    </p>
                  )}
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {source.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-[var(--color-eu-blue-lighter)] whitespace-nowrap mt-1">
                  Browse events →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <p className="mt-8 text-xs text-[var(--color-text-secondary)] text-center">
        Want to list your event?{' '}
        <a href="https://een.ec.europa.eu/events/add" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-text-primary)] transition-colors">
          Submit to the EEN events calendar →
        </a>
      </p>
    </div>
  );
}
