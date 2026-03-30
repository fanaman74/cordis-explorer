import { useEffect, useRef } from 'react';
import type { CountryMapData } from '../../hooks/useMapData';
import { COUNTRY_CENTROIDS } from './country-centroids';

function getColor(t: number): string {
  // blue gradient: dark navy → vivid blue
  const r = Math.round(30 + t * (96 - 30));
  const g = Math.round(60 + t * (165 - 60));
  const b = Math.round(120 + t * (250 - 120));
  return `rgb(${r},${g},${b})`;
}

function getRadius(count: number, max: number): number {
  const t = Math.pow(count / max, 0.45);
  return 6 + t * 42;
}

interface Props {
  data: CountryMapData[];
  onCountryClick: (country: CountryMapData | null) => void;
  selected: string | null;
  showBubbles: boolean;
}

export default function CordisMap({ data, onCountryClick, selected, showBubbles }: Props) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  const max = Math.max(...data.map((d) => d.projectCount), 1);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then((L) => {
      const map = L.map(containerRef.current!, {
        center: [48, 14],
        zoom: 4,
        zoomControl: true,
        scrollWheelZoom: true,
        minZoom: 2,
        maxZoom: 8,
      });

      // Dark no-label tile layer (CartoDB)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Allow layout to settle before sizing
      requestAnimationFrame(() => {
        map.invalidateSize();
        renderMarkers(L, map, showBubbles);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderMarkers(L: any, map: any, visible: boolean) {
    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!visible) return;

    const currentData = dataRef.current;
    const currentMax = Math.max(...currentData.map((d) => d.projectCount), 1);

    currentData.forEach((d) => {
      const coords = COUNTRY_CENTROIDS[d.country];
      if (!coords) return;

      const t = Math.pow(d.projectCount / currentMax, 0.45);
      const radius = getRadius(d.projectCount, currentMax);
      const color = getColor(t);

      const circle = L.circleMarker(coords, {
        radius,
        fillColor: color,
        fillOpacity: 0.75,
        color: 'rgba(255,255,255,0.25)',
        weight: 1.5,
      });

      circle.bindTooltip(
        `<div style="font-family:system-ui;font-size:13px;font-weight:600;color:#f1f5f9">${d.country}</div>
         <div style="font-size:12px;color:#94a3b8">${d.projectCount.toLocaleString()} projects · ${d.orgCount.toLocaleString()} orgs</div>`,
        { sticky: true, className: 'cordis-map-tooltip' }
      );

      circle.on('click', () => onCountryClick(d));
      circle.addTo(map);
      markersRef.current.push(circle);
    });
  }

  // Re-render markers when data or bubble visibility changes
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then((L) => renderMarkers(L, mapRef.current, showBubbles));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, showBubbles]);

  return (
    <>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, background: '#0d1117' }} />
      <style>{`
        .leaflet-container { background: #0d1117 !important; }
        .cordis-map-tooltip {
          background: rgba(13,17,23,0.97) !important;
          border: 1px solid rgba(59,130,246,0.35) !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;
        }
        .leaflet-control-attribution { background: rgba(13,17,23,0.8) !important; color: #475569 !important; font-size: 9px !important; }
        .leaflet-control-attribution a { color: #64748b !important; }
        .leaflet-bar a { background: rgba(20,24,33,0.97) !important; color: #94a3b8 !important; border-color: rgba(255,255,255,0.08) !important; }
        .leaflet-bar a:hover { background: rgba(59,130,246,0.2) !important; color: #f1f5f9 !important; }
      `}</style>
    </>
  );
}
