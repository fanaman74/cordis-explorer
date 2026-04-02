import { useRef, useEffect, useCallback } from 'react';

export interface GraphNode {
  id: string;
  label: string;
  type: 'org' | 'project' | 'country';
  expanded?: boolean;
  meta?: Record<string, string | undefined>;
}

export interface GraphEdge {
  source: string;
  target: string;
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId?: string;
  onNodeClick: (node: GraphNode) => void;
}

const RADIUS = 13;
const COLORS: Record<string, string> = {
  org: '#4f8ef7',
  project: '#4ade80',
  country: '#fbbf24',
};
const BG_COLORS: Record<string, string> = {
  org: 'rgba(79,142,247,0.14)',
  project: 'rgba(74,222,128,0.14)',
  country: 'rgba(251,191,36,0.14)',
};

export default function ForceGraph({ nodes, edges, selectedNodeId, onNodeClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const simRef = useRef<{
    nodes: SimNode[];
    edges: GraphEdge[];
    alpha: number;
    panX: number; panY: number; scale: number;
    dragging: boolean;
    dragX: number; dragY: number;
    lastPanX: number; lastPanY: number;
    selectedId: string | undefined;
  }>({
    nodes: [], edges: [], alpha: 1,
    panX: 0, panY: 0, scale: 1,
    dragging: false, dragX: 0, dragY: 0,
    lastPanX: 0, lastPanY: 0,
    selectedId: undefined,
  });

  const rafRef = useRef<number>();

  // Sync nodes/edges into sim, preserving existing positions
  useEffect(() => {
    const existing = new Map(simRef.current.nodes.map(n => [n.id, n]));
    simRef.current.nodes = nodes.map(n => {
      if (existing.has(n.id)) return { ...existing.get(n.id)!, ...n };
      const connEdge = edges.find(e => e.source === n.id || e.target === n.id);
      const nbr = connEdge ? existing.get(connEdge.source === n.id ? connEdge.target : connEdge.source) : undefined;
      return {
        ...n,
        x: (nbr?.x ?? 0) + (Math.random() - 0.5) * 100,
        y: (nbr?.y ?? 0) + (Math.random() - 0.5) * 100,
        vx: 0, vy: 0,
      };
    });
    simRef.current.edges = edges;
    simRef.current.alpha = Math.min(simRef.current.alpha + 0.4, 1);
  }, [nodes, edges]);

  useEffect(() => { simRef.current.selectedId = selectedNodeId; }, [selectedNodeId]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d')!;

    function tick() {
      const sim = simRef.current;
      const { nodes, edges, alpha } = sim;
      const W = canvas!.width;
      const H = canvas!.height;

      // Physics
      if (nodes.length > 1 && alpha > 0.002) {
        const REPULSION = 3500;
        const IDEAL = 140;
        const SPRING = 0.055;
        const DAMP = 0.8;
        const fx = new Float64Array(nodes.length);
        const fy = new Float64Array(nodes.length);

        // Repulsion
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const f = REPULSION / (d * d);
            fx[i] += (dx / d) * f; fy[i] += (dy / d) * f;
            fx[j] -= (dx / d) * f; fy[j] -= (dy / d) * f;
          }
        }

        // Springs
        const idx = new Map(nodes.map((n, i) => [n.id, i]));
        for (const e of edges) {
          const si = idx.get(e.source); const ti = idx.get(e.target);
          if (si === undefined || ti === undefined) continue;
          const dx = nodes[ti].x - nodes[si].x;
          const dy = nodes[ti].y - nodes[si].y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const stretch = (d - IDEAL) * SPRING;
          const f = stretch; // already scaled
          fx[si] += (dx / d) * f; fy[si] += (dy / d) * f;
          fx[ti] -= (dx / d) * f; fy[ti] -= (dy / d) * f;
        }

        // Centering
        const cx = nodes.reduce((s, n) => s + n.x, 0) / nodes.length;
        const cy = nodes.reduce((s, n) => s + n.y, 0) / nodes.length;

        for (let i = 0; i < nodes.length; i++) {
          fx[i] -= (nodes[i].x - cx) * 0.01;
          fy[i] -= (nodes[i].y - cy) * 0.01;
          nodes[i].vx = (nodes[i].vx + fx[i] * alpha) * DAMP;
          nodes[i].vy = (nodes[i].vy + fy[i] * alpha) * DAMP;
          nodes[i].x += nodes[i].vx;
          nodes[i].y += nodes[i].vy;
        }
        sim.alpha *= 0.98;
      }

      // Draw
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W / 2 + sim.panX, H / 2 + sim.panY);
      ctx.scale(sim.scale, sim.scale);

      const idx2 = new Map(nodes.map((n, i) => [n.id, i]));

      // Edges
      ctx.strokeStyle = 'rgba(100,100,120,0.18)';
      ctx.lineWidth = 1;
      for (const e of edges) {
        const si = idx2.get(e.source); const ti = idx2.get(e.target);
        if (si === undefined || ti === undefined) continue;
        const s = nodes[si]; const t = nodes[ti];
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y); ctx.stroke();
      }

      // Nodes
      for (const node of nodes) {
        const color = COLORS[node.type] ?? '#888';
        const bg = BG_COLORS[node.type] ?? 'rgba(255,255,255,0.1)';
        const sel = node.id === sim.selectedId;

        if (sel) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, RADIUS + 9, 0, Math.PI * 2);
          ctx.fillStyle = bg;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = sel ? color : bg;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = sel ? 2.5 : 1.5;
        ctx.stroke();

        // + badge for unexpanded
        if (!node.expanded && node.type !== 'country') {
          ctx.fillStyle = color;
          ctx.font = `bold ${sel ? 11 : 10}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('+', node.x, node.y);
        }

        // Label
        const raw = node.label;
        const lbl = raw.length > 24 ? raw.slice(0, 22) + '…' : raw;
        ctx.font = `${sel ? 'bold ' : ''}10.5px sans-serif`;
        ctx.fillStyle = sel ? color : 'rgba(40,40,60,0.7)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(lbl, node.x, node.y + RADIUS + 4);
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  const nodeAt = useCallback((clientX: number, clientY: number): SimNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const sim = simRef.current;
    const mx = (clientX - rect.left - canvas.width / 2 - sim.panX) / sim.scale;
    const my = (clientY - rect.top - canvas.height / 2 - sim.panY) / sim.scale;
    for (const n of sim.nodes) {
      if (Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2) <= RADIUS + 6) return n;
    }
    return null;
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const s = simRef.current;
    s.dragging = true;
    s.dragX = e.clientX; s.dragY = e.clientY;
    s.lastPanX = s.panX; s.lastPanY = s.panY;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const s = simRef.current;
    if (!s.dragging) return;
    s.panX = s.lastPanX + e.clientX - s.dragX;
    s.panY = s.lastPanY + e.clientY - s.dragY;
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    const s = simRef.current;
    const moved = Math.abs(e.clientX - s.dragX) + Math.abs(e.clientY - s.dragY) > 5;
    s.dragging = false;
    if (!moved) {
      const n = nodeAt(e.clientX, e.clientY);
      if (n) onNodeClick(n);
    }
  }, [nodeAt, onNodeClick]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const s = simRef.current;
    s.scale = Math.max(0.15, Math.min(5, s.scale * (e.deltaY > 0 ? 0.9 : 1.11)));
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ cursor: 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { simRef.current.dragging = false; }}
      onWheel={onWheel}
    />
  );
}
