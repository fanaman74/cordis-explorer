import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import ForceGraph from '../components/graph/ForceGraph';
import type { GraphNode, GraphEdge } from '../components/graph/ForceGraph';
import {
  buildOrgSearchForGraphQuery,
  buildOrgProjectsForGraphQuery,
  buildCountryOrgsForGraphQuery,
  buildProjectSearchForGraphQuery,
  buildProjectParticipantsForGraphQuery,
} from '../api/query-builder';
import { executeSparql } from '../api/sparql-client';
import { useCountries } from '../hooks/useCountries';

function getVal(b: Record<string, { value: string } | undefined>, key: string) {
  return b[key]?.value;
}

function formatDate(iso?: string) {
  if (!iso) return null;
  try { return new Date(iso).getFullYear().toString(); } catch { return null; }
}

function connectedNodes(nodeId: string, filterType: string, nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  return edges
    .map(e => {
      const otherId = e.source === nodeId ? e.target : e.target === nodeId ? e.source : null;
      return otherId ? nodeMap.get(otherId) : undefined;
    })
    .filter((n): n is GraphNode => !!n && n.type === filterType);
}

interface SidebarProject { title: string; acronym?: string; projectId?: string; startDate?: string; }

async function fetchOrgProjects(orgName: string): Promise<SidebarProject[]> {
  const data = await executeSparql(buildOrgProjectsForGraphQuery(orgName));
  return (data.results.bindings as any[]).map(b => ({
    title: getVal(b, 'projectTitle') ?? '',
    acronym: getVal(b, 'projectAcronym'),
    projectId: getVal(b, 'projectId'),
    startDate: getVal(b, 'startDate'),
  })).filter(p => p.title);
}

/** Floating animated node + edge SVG for the hero */
function HeroGraphAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {/* Floating group A — top-left area */}
      <div className="absolute hero-node-a" style={{ top: '12%', left: '8%' }}>
        <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
          <line x1="20" y1="20" x2="100" y2="65" stroke="#ff385c" strokeWidth="1.5" strokeOpacity="0.18" strokeDasharray="6 4" />
          <circle cx="20" cy="20" r="10" fill="#ff385c" fillOpacity="0.12" stroke="#ff385c" strokeOpacity="0.3" strokeWidth="1.5" />
          <circle cx="100" cy="65" r="7" fill="#2563eb" fillOpacity="0.1" stroke="#2563eb" strokeOpacity="0.25" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Floating group B — top-right area */}
      <div className="absolute hero-node-b" style={{ top: '8%', right: '10%' }}>
        <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
          <line x1="80" y1="20" x2="20" y2="90" stroke="#2563eb" strokeWidth="1.5" strokeOpacity="0.15" strokeDasharray="5 5" />
          <line x1="80" y1="20" x2="140" y2="80" stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.15" strokeDasharray="5 5" />
          <circle cx="80" cy="20" r="12" fill="#ff385c" fillOpacity="0.1" stroke="#ff385c" strokeOpacity="0.28" strokeWidth="1.5" />
          <circle cx="20" cy="90" r="8" fill="#d97706" fillOpacity="0.1" stroke="#d97706" strokeOpacity="0.25" strokeWidth="1.5" />
          <circle cx="140" cy="80" r="8" fill="#2563eb" fillOpacity="0.1" stroke="#2563eb" strokeOpacity="0.25" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Floating group C — bottom-left */}
      <div className="absolute hero-node-c" style={{ bottom: '15%', left: '5%' }}>
        <svg width="140" height="100" viewBox="0 0 140 100" fill="none">
          <line x1="20" y1="50" x2="120" y2="30" stroke="#16a34a" strokeWidth="1.5" strokeOpacity="0.15" strokeDasharray="6 4" />
          <line x1="20" y1="50" x2="90" y2="85" stroke="#ff385c" strokeWidth="1.5" strokeOpacity="0.12" strokeDasharray="6 4" />
          <circle cx="20" cy="50" r="9" fill="#2563eb" fillOpacity="0.1" stroke="#2563eb" strokeOpacity="0.25" strokeWidth="1.5" />
          <circle cx="120" cy="30" r="7" fill="#16a34a" fillOpacity="0.1" stroke="#16a34a" strokeOpacity="0.2" strokeWidth="1.5" />
          <circle cx="90" cy="85" r="7" fill="#16a34a" fillOpacity="0.1" stroke="#16a34a" strokeOpacity="0.2" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Floating group D — bottom-right */}
      <div className="absolute hero-node-a" style={{ bottom: '18%', right: '8%', animationDelay: '3s' }}>
        <svg width="130" height="110" viewBox="0 0 130 110" fill="none">
          <line x1="65" y1="20" x2="20" y2="80" stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.18" strokeDasharray="5 5" />
          <line x1="65" y1="20" x2="110" y2="75" stroke="#2563eb" strokeWidth="1.5" strokeOpacity="0.15" strokeDasharray="5 5" />
          <circle cx="65" cy="20" r="11" fill="#d97706" fillOpacity="0.1" stroke="#d97706" strokeOpacity="0.28" strokeWidth="1.5" />
          <circle cx="20" cy="80" r="7" fill="#ff385c" fillOpacity="0.1" stroke="#ff385c" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="110" cy="75" r="7" fill="#ff385c" fillOpacity="0.1" stroke="#ff385c" strokeOpacity="0.22" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Center-ish large faint node */}
      <div className="absolute hero-node-b" style={{ top: '38%', left: '50%', transform: 'translateX(-50%)', animationDelay: '5s' }}>
        <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
          <line x1="100" y1="80" x2="30" y2="30" stroke="#ff385c" strokeWidth="1" strokeOpacity="0.08" />
          <line x1="100" y1="80" x2="170" y2="25" stroke="#2563eb" strokeWidth="1" strokeOpacity="0.08" />
          <line x1="100" y1="80" x2="50" y2="135" stroke="#d97706" strokeWidth="1" strokeOpacity="0.08" />
          <line x1="100" y1="80" x2="160" y2="130" stroke="#16a34a" strokeWidth="1" strokeOpacity="0.08" />
          <circle cx="100" cy="80" r="18" fill="#ff385c" fillOpacity="0.04" stroke="#ff385c" strokeOpacity="0.12" strokeWidth="1.5" />
          <circle cx="30" cy="30" r="6" fill="#2563eb" fillOpacity="0.06" stroke="#2563eb" strokeOpacity="0.15" strokeWidth="1" />
          <circle cx="170" cy="25" r="6" fill="#2563eb" fillOpacity="0.06" stroke="#2563eb" strokeOpacity="0.15" strokeWidth="1" />
          <circle cx="50" cy="135" r="6" fill="#d97706" fillOpacity="0.06" stroke="#d97706" strokeOpacity="0.15" strokeWidth="1" />
          <circle cx="160" cy="130" r="6" fill="#16a34a" fillOpacity="0.06" stroke="#16a34a" strokeOpacity="0.15" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

export default function KnowledgeGraphPage() {
  useEffect(() => {
    document.title = 'EU Research Knowledge Graph — CORDIS Explorer';
    return () => { document.title = 'CORDIS Explorer — Search EU-Funded Research Projects'; };
  }, []);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selected, setSelected] = useState<GraphNode | null>(null);

  const [sidebarProjects, setSidebarProjects] = useState<SidebarProject[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(false);

  const [mode, setMode] = useState<'org' | 'project' | 'country'>('org');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ name: string; count: number }[]>([]);
  const [projectResults, setProjectResults] = useState<{ title: string; acronym?: string; projectId: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [expandLoading, setExpandLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: countries = [] } = useCountries();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== 'org') return;
    if (searchTerm.trim().length < 3) { setSearchResults([]); setShowDropdown(false); return; }
    clearTimeout(debounceRef.current);
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await executeSparql(buildOrgSearchForGraphQuery(searchTerm.trim()));
        const results = (data.results.bindings as any[]).map(b => ({
          name: getVal(b, 'orgName') ?? '',
          count: parseInt(getVal(b, 'projectCount') ?? '0', 10),
        })).filter(r => r.name);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 420);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, mode]);

  useEffect(() => {
    if (mode !== 'project') return;
    if (searchTerm.trim().length < 3) { setProjectResults([]); setShowDropdown(false); return; }
    clearTimeout(debounceRef.current);
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await executeSparql(buildProjectSearchForGraphQuery(searchTerm.trim()));
        const results = (data.results.bindings as any[]).map(b => ({
          title: getVal(b, 'projectTitle') ?? '',
          acronym: getVal(b, 'projectAcronym'),
          projectId: getVal(b, 'projectId') ?? '',
        })).filter(r => r.title && r.projectId);
        setProjectResults(results);
        setShowDropdown(results.length > 0);
      } catch { setProjectResults([]); }
      finally { setSearchLoading(false); }
    }, 420);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, mode]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function addNodes(newNodes: GraphNode[], newEdges: GraphEdge[]) {
    setNodes(prev => {
      const ids = new Set(prev.map(n => n.id));
      return [...prev, ...newNodes.filter(n => !ids.has(n.id))];
    });
    setEdges(prev => {
      const keys = new Set(prev.map(e => `${e.source}->${e.target}`));
      return [...prev, ...newEdges.filter(e => !keys.has(`${e.source}->${e.target}`))];
    });
  }

  function markExpanded(nodeId: string) {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, expanded: true } : n));
    setSelected(s => s?.id === nodeId ? { ...s, expanded: true } : s);
  }

  async function loadOrg(orgName: string) {
    setShowDropdown(false);
    setSearchTerm(orgName);
    setExpandLoading(true);
    const orgId = `org:${orgName}`;
    try {
      const data = await executeSparql(buildOrgProjectsForGraphQuery(orgName));
      const bindings = data.results.bindings as any[];
      const newNodes: GraphNode[] = [{ id: orgId, label: orgName, type: 'org', expanded: true }];
      const newEdges: GraphEdge[] = [];
      const seen = new Set<string>();
      for (const b of bindings) {
        const title = getVal(b, 'projectTitle') ?? '';
        const acronym = getVal(b, 'projectAcronym');
        const projectId = getVal(b, 'projectId');
        const startDate = getVal(b, 'startDate');
        if (!title) continue;
        const nodeId = `project:${projectId ?? title}`;
        if (seen.has(nodeId)) continue;
        seen.add(nodeId);
        newNodes.push({
          id: nodeId, label: acronym ?? (title.length > 30 ? title.slice(0, 28) + '…' : title),
          type: 'project', expanded: true,
          meta: { projectId, title, startDate, acronym },
        });
        newEdges.push({ source: orgId, target: nodeId });
      }
      setNodes(newNodes);
      setEdges(newEdges);
      setSelected({ id: orgId, label: orgName, type: 'org', expanded: true });
      setSidebarProjects(newNodes.filter(n => n.type === 'project').map(n => ({
        title: n.meta?.title ?? n.label,
        acronym: n.meta?.acronym,
        projectId: n.meta?.projectId,
        startDate: n.meta?.startDate,
      })));
    } finally { setExpandLoading(false); }
  }

  async function loadCountry(countryName: string) {
    setExpandLoading(true);
    const countryId = `country:${countryName}`;
    try {
      const data = await executeSparql(buildCountryOrgsForGraphQuery(countryName));
      const bindings = data.results.bindings as any[];
      const newNodes: GraphNode[] = [{ id: countryId, label: countryName, type: 'country', expanded: true }];
      const newEdges: GraphEdge[] = [];
      const seen = new Set<string>();
      for (const b of bindings) {
        const orgName = getVal(b, 'orgName') ?? '';
        const count = parseInt(getVal(b, 'projectCount') ?? '0', 10);
        if (!orgName) continue;
        const nodeId = `org:${orgName}`;
        if (seen.has(nodeId)) continue;
        seen.add(nodeId);
        newNodes.push({ id: nodeId, label: orgName, type: 'org', expanded: false, meta: { country: countryName, projectCount: String(count) } });
        newEdges.push({ source: countryId, target: nodeId });
      }
      setNodes(newNodes);
      setEdges(newEdges);
      setSelected({ id: countryId, label: countryName, type: 'country', expanded: true });
    } finally { setExpandLoading(false); }
  }

  async function loadProject(projectId: string, projectTitle: string, projectAcronym?: string) {
    setShowDropdown(false);
    setSearchTerm(projectAcronym ?? (projectTitle.length > 30 ? projectTitle.slice(0, 28) + '…' : projectTitle));
    setExpandLoading(true);
    const projNodeId = `project:${projectId}`;
    try {
      const data = await executeSparql(buildProjectParticipantsForGraphQuery(projectId));
      const bindings = data.results.bindings as any[];
      const lbl = projectAcronym ?? (projectTitle.length > 30 ? projectTitle.slice(0, 28) + '…' : projectTitle);
      const newNodes: GraphNode[] = [{ id: projNodeId, label: lbl, type: 'project', expanded: true, meta: { projectId, title: projectTitle, acronym: projectAcronym } }];
      const newEdges: GraphEdge[] = [];
      const seen = new Set<string>();
      for (const b of bindings) {
        const orgName = getVal(b, 'orgName') ?? '';
        const countryName = getVal(b, 'countryName');
        if (!orgName) continue;
        const nodeId = `org:${orgName}`;
        if (seen.has(nodeId)) continue;
        seen.add(nodeId);
        newNodes.push({ id: nodeId, label: orgName, type: 'org', expanded: false, meta: { country: countryName } });
        newEdges.push({ source: projNodeId, target: nodeId });
      }
      setNodes(newNodes);
      setEdges(newEdges);
      setSelected({ id: projNodeId, label: lbl, type: 'project', expanded: true, meta: { projectId, title: projectTitle, acronym: projectAcronym } });
      setSidebarProjects([]);
    } finally { setExpandLoading(false); }
  }

  async function expandOrg(node: GraphNode) {
    const orgName = node.label;
    setExpandLoading(true);
    const orgId = `org:${orgName}`;
    try {
      const data = await executeSparql(buildOrgProjectsForGraphQuery(orgName));
      const bindings = data.results.bindings as any[];
      const newNodes: GraphNode[] = [];
      const newEdges: GraphEdge[] = [];
      const seen = new Set<string>();
      for (const b of bindings) {
        const title = getVal(b, 'projectTitle') ?? '';
        const acronym = getVal(b, 'projectAcronym');
        const projectId = getVal(b, 'projectId');
        const startDate = getVal(b, 'startDate');
        if (!title) continue;
        const nodeId = `project:${projectId ?? title}`;
        if (seen.has(nodeId)) continue;
        seen.add(nodeId);
        newNodes.push({ id: nodeId, label: acronym ?? (title.length > 30 ? title.slice(0, 28) + '…' : title), type: 'project', expanded: true, meta: { projectId, title, startDate, acronym } });
        newEdges.push({ source: orgId, target: nodeId });
      }
      addNodes(newNodes, newEdges);
      markExpanded(orgId);
    } finally { setExpandLoading(false); }
  }

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelected(node);
    if (node.type === 'org') {
      setSidebarProjects([]);
      setSidebarLoading(true);
      fetchOrgProjects(node.label)
        .then(setSidebarProjects)
        .catch(() => setSidebarProjects([]))
        .finally(() => setSidebarLoading(false));
    }
  }, []);

  const liveSelected = selected ? nodes.find(n => n.id === selected.id) ?? selected : null;
  const hasGraph = nodes.length > 0;

  /* ════════════════════════════════════════
     HERO (shown before any graph is loaded)
  ════════════════════════════════════════ */
  if (!hasGraph) {
    return (
      <div
        className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #fff5f7 0%, #ffffff 60%)' }}
      >
        <HeroGraphAnimation />

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 text-xs font-semibold"
            style={{ background: 'rgba(255,56,92,0.08)', border: '1px solid rgba(255,56,92,0.22)', color: '#ff385c' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2.5" /><circle cx="19" cy="6" r="2.5" /><circle cx="19" cy="18" r="2.5" /><circle cx="12" cy="12" r="2.5" />
              <path strokeLinecap="round" d="M7.5 12h2M14.5 12h2M17 7.5l-3 3M17 16.5l-3-3" />
            </svg>
            EURIO Knowledge Graph
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl font-bold leading-tight mb-5"
            style={{ color: '#222222', letterSpacing: '-0.44px' }}
          >
            Explore EU Research{' '}
            <span className="animate-gradient-text">Connections.</span>
          </h1>

          <p className="text-lg leading-relaxed mb-10" style={{ color: '#6a6a6a', maxWidth: '480px' }}>
            Discover how organisations, projects and countries are connected
            across the EU research landscape.
          </p>

          {/* Search card */}
          <div
            className="w-full max-w-xl rounded-2xl p-5 mb-10"
            style={{
              background: '#ffffff',
              boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 16px, rgba(0,0,0,0.1) 0px 8px 24px',
            }}
          >
            {/* Mode toggle */}
            <div
              className="flex gap-1 rounded-xl p-1 mb-4"
              style={{ background: '#f2f2f2' }}
            >
              {(['org', 'project', 'country'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setSearchTerm(''); setSearchResults([]); setProjectResults([]); setShowDropdown(false); }}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer border-0 transition-all duration-200"
                  style={
                    mode === m
                      ? { background: '#ffffff', color: '#222222', boxShadow: 'rgba(0,0,0,0.08) 0px 2px 4px' }
                      : { background: 'transparent', color: '#6a6a6a' }
                  }
                >
                  {m === 'org' ? 'Organisation' : m === 'project' ? 'Project' : 'Country'}
                </button>
              ))}
            </div>

            {/* Input */}
            {(mode === 'org' || mode === 'project') ? (
              <div className="relative" ref={dropdownRef}>
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="#6a6a6a" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => (mode === 'org' ? searchResults : projectResults).length > 0 && setShowDropdown(true)}
                  placeholder={mode === 'org' ? 'Type to search organisation…' : 'Type to search project title or acronym…'}
                  className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                  style={{ background: '#f7f7f7', border: '1px solid #ebebeb', color: '#222222', fontFamily: 'inherit' }}
                  onFocusCapture={e => { (e.target as HTMLInputElement).style.borderColor = '#ff385c'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(255,56,92,0.12)'; }}
                  onBlurCapture={e => { (e.target as HTMLInputElement).style.borderColor = '#ebebeb'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
                />
                {searchLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#dddddd', borderTopColor: '#ff385c' }} />
                )}
                {showDropdown && mode === 'org' && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-20" style={{ background: '#ffffff', boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 8px 24px' }}>
                    {searchResults.map(r => (
                      <button key={r.name} onClick={() => loadOrg(r.name)}
                        className="w-full text-left px-4 py-3 text-sm flex items-center justify-between gap-3 border-0"
                        style={{ background: 'transparent', color: '#222222', cursor: 'pointer', fontFamily: 'inherit', borderBottom: '1px solid #f7f7f7' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#f7f7f7')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      >
                        <span className="truncate font-medium">{r.name}</span>
                        <span className="text-xs shrink-0 font-medium" style={{ color: '#ff385c' }}>{r.count} projects</span>
                      </button>
                    ))}
                  </div>
                )}
                {showDropdown && mode === 'project' && projectResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-20" style={{ background: '#ffffff', boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 8px 24px' }}>
                    {projectResults.map(r => (
                      <button key={r.projectId} onClick={() => loadProject(r.projectId, r.title, r.acronym)}
                        className="w-full text-left px-4 py-3 text-sm flex items-start gap-3 border-0"
                        style={{ background: 'transparent', color: '#222222', cursor: 'pointer', fontFamily: 'inherit', borderBottom: '1px solid #f7f7f7' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#f7f7f7')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      >
                        <div className="min-w-0">
                          {r.acronym && <p className="text-[10px] font-bold mb-0.5" style={{ color: '#16a34a' }}>{r.acronym}</p>}
                          <p className="truncate font-medium">{r.title.length > 60 ? r.title.slice(0, 58) + '…' : r.title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <select
                defaultValue=""
                onChange={e => e.target.value && loadCountry(e.target.value)}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-medium focus:outline-none appearance-none"
                style={{ background: '#f7f7f7', border: '1px solid #ebebeb', color: '#222222', fontFamily: 'inherit', cursor: 'pointer' }}
              >
                <option value="" disabled>Select a country…</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {expandLoading && (
              <div className="flex items-center gap-2 mt-3 text-sm" style={{ color: '#6a6a6a' }}>
                <div className="w-4 h-4 border-2 rounded-full animate-spin shrink-0" style={{ borderColor: '#dddddd', borderTopColor: '#ff385c' }} />
                Loading from EURIO…
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6">
            {[
              { color: '#2563eb', label: 'Organisation' },
              { color: '#16a34a', label: 'Project' },
              { color: '#d97706', label: 'Country' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-medium" style={{ color: '#6a6a6a' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════
     GRAPH VIEW (once nodes are loaded)
  ════════════════════════════════════════ */
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>

      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid #ebebeb', background: '#ffffff' }}
      >
        {/* Mode tabs */}
        <div
          className="flex rounded-xl overflow-hidden text-xs"
          style={{ border: '1px solid #ebebeb', background: '#f7f7f7', padding: '2px' }}
        >
          {(['org', 'project', 'country'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setSearchTerm(''); setSearchResults([]); setProjectResults([]); setShowDropdown(false); }}
              className="px-3 py-1.5 font-semibold capitalize transition-all rounded-lg border-0 cursor-pointer"
              style={{
                background: mode === m ? '#ffffff' : 'transparent',
                color: mode === m ? '#222222' : '#6a6a6a',
                boxShadow: mode === m ? 'rgba(0,0,0,0.08) 0px 1px 3px' : 'none',
              }}
            >
              {m === 'org' ? 'Organisation' : m === 'project' ? 'Project' : 'Country'}
            </button>
          ))}
        </div>

        {/* Org / Project search */}
        {(mode === 'org' || mode === 'project') && (
          <div className="relative" ref={dropdownRef} style={{ width: 300 }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" fill="none" stroke="#6a6a6a" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => (mode === 'org' ? searchResults : projectResults).length > 0 && setShowDropdown(true)}
              placeholder={mode === 'org' ? 'Search organisation…' : 'Search project title or acronym…'}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-sm focus:outline-none"
              style={{ background: '#f7f7f7', border: '1px solid #ebebeb', color: '#222222', fontFamily: 'inherit' }}
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: '#dddddd', borderTopColor: '#ff385c' }} />
            )}
            {showDropdown && mode === 'org' && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20" style={{ background: '#ffffff', boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 8px 24px' }}>
                {searchResults.map(r => (
                  <button key={r.name} onClick={() => loadOrg(r.name)}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 border-0 cursor-pointer"
                    style={{ background: 'transparent', color: '#222222', fontFamily: 'inherit', borderBottom: '1px solid #f7f7f7' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#f7f7f7')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    <span className="truncate font-medium">{r.name}</span>
                    <span className="text-xs shrink-0" style={{ color: '#ff385c' }}>{r.count} projects</span>
                  </button>
                ))}
              </div>
            )}
            {showDropdown && mode === 'project' && projectResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20" style={{ background: '#ffffff', boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 8px 24px' }}>
                {projectResults.map(r => (
                  <button key={r.projectId} onClick={() => loadProject(r.projectId, r.title, r.acronym)}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-start gap-2 border-0 cursor-pointer"
                    style={{ background: 'transparent', color: '#222222', fontFamily: 'inherit', borderBottom: '1px solid #f7f7f7' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#f7f7f7')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    <div className="min-w-0">
                      {r.acronym && <p className="text-[10px] font-bold mb-0.5" style={{ color: '#16a34a' }}>{r.acronym}</p>}
                      <p className="truncate font-medium">{r.title.length > 50 ? r.title.slice(0, 48) + '…' : r.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Country select */}
        {mode === 'country' && (
          <select
            defaultValue=""
            onChange={e => e.target.value && loadCountry(e.target.value)}
            className="py-2 px-3 rounded-xl text-sm focus:outline-none appearance-none"
            style={{ background: '#f7f7f7', border: '1px solid #ebebeb', color: '#222222', width: 220, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <option value="" disabled>Select a country…</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <span className="text-xs font-medium" style={{ color: '#6a6a6a' }}>
          {nodes.length} nodes · {edges.length} edges
        </span>

        {expandLoading && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
            <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: '#dddddd', borderTopColor: '#ff385c' }} />
            Loading…
          </div>
        )}

        <button
          onClick={() => { setNodes([]); setEdges([]); setSelected(null); setSearchTerm(''); }}
          className="ml-auto btn-secondary btn-sm"
          style={{ height: '32px', fontSize: '12px' }}
        >
          ← Back
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas */}
        <div className="flex-1 relative min-w-0" style={{ background: '#fafafa' }}>
          <ForceGraph nodes={nodes} edges={edges} selectedNodeId={liveSelected?.id} onNodeClick={handleNodeClick} />

          {/* Legend overlay */}
          <div
            className="absolute bottom-4 left-4 flex flex-col gap-1.5 px-3 py-2.5 rounded-xl text-xs"
            style={{ background: '#ffffff', boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 12px' }}
          >
            {[
              { color: '#2563eb', label: 'Organisation' },
              { color: '#16a34a', label: 'Project' },
              { color: '#d97706', label: 'Country' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 font-medium" style={{ color: '#484848' }}>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                {label}
              </div>
            ))}
            <p className="mt-1 text-[10px]" style={{ color: '#aaaaaa' }}>Scroll to zoom · Drag to pan</p>
          </div>
        </div>

        {/* ── Sidebar ── */}
        {liveSelected && (
          <div
            className="w-72 shrink-0 flex flex-col"
            style={{ borderLeft: '1px solid #ebebeb', background: '#ffffff' }}
          >
            <div className="p-5 flex-1 overflow-y-auto">
              {/* Type badge */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: liveSelected.type === 'org' ? '#2563eb' : liveSelected.type === 'project' ? '#16a34a' : '#d97706' }}
                />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#aaaaaa' }}>
                  {liveSelected.type}
                </span>
              </div>

              {/* ── ORG ── */}
              {liveSelected.type === 'org' && (
                <>
                  <h3 className="text-sm font-bold leading-snug mb-2" style={{ color: '#222222' }}>
                    {liveSelected.label}
                  </h3>
                  {liveSelected.meta?.country && (
                    <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: '#6a6a6a' }}>
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {liveSelected.meta.country}
                    </div>
                  )}

                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#aaaaaa' }}>
                    CORDIS Projects
                  </p>
                  {sidebarLoading ? (
                    <div className="flex items-center gap-2 text-xs py-2" style={{ color: '#6a6a6a' }}>
                      <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin shrink-0" style={{ borderColor: '#dddddd', borderTopColor: '#ff385c' }} />
                      Loading projects…
                    </div>
                  ) : sidebarProjects.length > 0 ? (
                    <div className="space-y-2">
                      {sidebarProjects.map((p, i) => (
                        <div
                          key={i}
                          className="rounded-xl px-3 py-2.5"
                          style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              {p.acronym && (
                                <p className="text-[10px] font-bold mb-0.5" style={{ color: '#16a34a' }}>{p.acronym}</p>
                              )}
                              <p className="text-xs leading-snug font-medium" style={{ color: '#222222' }}>
                                {p.title.length > 60 ? p.title.slice(0, 58) + '…' : p.title}
                              </p>
                            </div>
                            {p.startDate && (
                              <span className="text-[10px] shrink-0 mt-0.5 font-medium" style={{ color: '#aaaaaa' }}>
                                {formatDate(p.startDate)}
                              </span>
                            )}
                          </div>
                          {p.projectId && (
                            <Link
                              to={`/project/${p.projectId}`}
                              className="text-[11px] mt-1.5 inline-flex items-center gap-0.5 font-semibold no-underline hover:underline"
                              style={{ color: '#ff385c' }}
                            >
                              View in CORDIS →
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: '#aaaaaa' }}>No projects found.</p>
                  )}

                  {!liveSelected.expanded && (
                    <button
                      onClick={() => expandOrg(liveSelected)}
                      disabled={expandLoading}
                      className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all btn-primary"
                      style={{ borderRadius: '12px' }}
                    >
                      {expandLoading ? 'Loading…' : '+ Add to Graph'}
                    </button>
                  )}
                </>
              )}

              {/* ── PROJECT ── */}
              {liveSelected.type === 'project' && (
                <>
                  {liveSelected.meta?.acronym && (
                    <p className="text-xs font-bold tracking-wider mb-1" style={{ color: '#16a34a' }}>
                      {liveSelected.meta.acronym}
                    </p>
                  )}
                  <h3 className="text-sm font-bold leading-snug mb-3" style={{ color: '#222222' }}>
                    {liveSelected.meta?.title ?? liveSelected.label}
                  </h3>
                  <div className="space-y-2">
                    {liveSelected.meta?.startDate && (
                      <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#6a6a6a' }}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
                          <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/><line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/>
                          <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
                        </svg>
                        Started {formatDate(liveSelected.meta.startDate)}
                      </div>
                    )}
                    {(() => {
                      const cnt = connectedNodes(liveSelected.id, 'org', nodes, edges).length;
                      return cnt > 0 ? (
                        <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#6a6a6a' }}>
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z"/>
                          </svg>
                          {cnt} organisation{cnt !== 1 ? 's' : ''} in graph
                        </div>
                      ) : null;
                    })()}
                  </div>
                  {liveSelected.meta?.projectId && (
                    <Link
                      to={`/project/${liveSelected.meta.projectId}`}
                      className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 btn-primary no-underline"
                      style={{ borderRadius: '12px' }}
                    >
                      View in CORDIS
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  )}
                </>
              )}

              {/* ── COUNTRY ── */}
              {liveSelected.type === 'country' && (
                <>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#222222', letterSpacing: '-0.44px' }}>
                    {liveSelected.label}
                  </h3>
                  {(() => {
                    const cnt = connectedNodes(liveSelected.id, 'org', nodes, edges).length;
                    return (
                      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#6a6a6a' }}>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        {cnt} organisation{cnt !== 1 ? 's' : ''} loaded
                      </div>
                    );
                  })()}
                  <p className="mt-3 text-xs" style={{ color: '#aaaaaa' }}>
                    Click any organisation node to load its projects.
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="px-4 py-3 text-xs text-left transition-colors border-0 cursor-pointer"
              style={{ borderTop: '1px solid #ebebeb', color: '#aaaaaa', background: '#ffffff', fontFamily: 'inherit' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#f7f7f7')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#ffffff')}
            >
              ✕ Deselect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
