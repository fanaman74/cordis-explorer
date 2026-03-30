import { useEffect, useRef } from 'react';
import type { CountryMapData } from '../../hooks/useMapData';
import { COUNTRY_CENTROIDS } from './country-centroids';

// CORDIS country name → GeoJSON name (where they differ)
const NORMALISE: Record<string, string> = {
  'Czech Republic': 'Czech Rep.',
  'Czechia': 'Czech Rep.',
  'Slovak Republic': 'Slovakia',
  'North Macedonia': 'Macedonia',
  'Bosnia and Herzegovina': 'Bosnia and Herz.',
  'Moldova, Republic of': 'Moldova',
  'Korea, Republic of': 'South Korea',
  'Iran, Islamic Republic of': 'Iran',
  'Russian Federation': 'Russia',
  'United States': 'United States of America',
  'Türkiye': 'Turkey',
};

function norm(name: string) { return NORMALISE[name] ?? name; }

function getColor(t: number): string {
  const r = Math.round(26 + t * (96 - 26));
  const g = Math.round(58 + t * (165 - 58));
  const b = Math.round(107 + t * (250 - 107));
  return `rgb(${r},${g},${b})`;
}

interface Props {
  data: CountryMapData[];
  onCountryClick: (c: CountryMapData | null) => void;
  selected: string | null;
  showBubbles: boolean;
}

const GEOJSON_URL = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';

export default function CordisMap({ data, onCountryClick, selected, showBubbles }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const geoLayerRef = useRef<any>(null);
  const bubblesRef = useRef<any[]>([]);
  const dataRef = useRef(data);
  dataRef.current = data;

  const max = Math.max(...data.map(d => d.projectCount), 1);

  function styleFeature(feature: any) {
    const name = feature?.properties?.name ?? '';
    const d = dataRef.current.find(x => norm(x.country) === name);
    const count = d?.projectCount ?? 0;
    const t = count > 0 ? Math.pow(count / Math.max(...dataRef.current.map(x => x.projectCount), 1), 0.4) : 0;
    return {
      fillColor: count > 0 ? getColor(t) : '#1a1f2e',
      fillOpacity: count > 0 ? 0.82 : 0.4,
      color: '#2d3a52',
      weight: 0.8,
    };
  }

  function renderBubbles(L: any, map: any) {
    bubblesRef.current.forEach(m => m.remove());
    bubblesRef.current = [];
    if (!showBubbles) return;

    const currentMax = Math.max(...dataRef.current.map(d => d.projectCount), 1);

    dataRef.current.forEach(d => {
      const coords = COUNTRY_CENTROIDS[d.country];
      if (!coords) return;
      const t = Math.pow(d.projectCount / currentMax, 0.45);
      const circle = L.circleMarker(coords, {
        radius: 5 + t * 35,
        fillColor: getColor(t),
        fillOpacity: 0.7,
        color: 'rgba(255,255,255,0.2)',
        weight: 1.2,
      });
      circle.on('click', () => onCountryClick(d));
      circle.bindTooltip(
        `<div style="font-weight:600;color:#f1f5f9">${d.country}</div><div style="color:#94a3b8">${d.projectCount.toLocaleString()} projects</div>`,
        { sticky: true, className: 'cordis-map-tooltip' }
      );
      circle.addTo(map);
      bubblesRef.current.push(circle);
    });
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then(L => {
      const map = L.map(containerRef.current!, {
        center: [50, 12], zoom: 4,
        zoomControl: true, scrollWheelZoom: true,
        minZoom: 2, maxZoom: 8,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM &copy; CARTO',
        subdomains: 'abcd', maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      fetch(GEOJSON_URL)
        .then(r => r.json())
        .then(geojson => {
          if (!mapRef.current) return;
          const layer = L.geoJSON(geojson, {
            style: styleFeature,
            onEachFeature: (feature: any, layer: any) => {
              const name = feature?.properties?.name ?? '';
              const d = dataRef.current.find(x => norm(x.country) === name);
              if (d) {
                layer.bindTooltip(
                  `<div style="font-weight:600;color:#f1f5f9;font-size:13px">${d.country}</div><div style="color:#94a3b8;font-size:12px">${d.projectCount.toLocaleString()} projects · ${d.orgCount.toLocaleString()} orgs</div>`,
                  { sticky: true, className: 'cordis-map-tooltip' }
                );
              }
              layer.on({
                mouseover: (e: any) => e.target.setStyle({ weight: 2, color: '#60a5fa', fillOpacity: d ? 0.95 : 0.55 }),
                mouseout: () => layer.setStyle(styleFeature(feature)),
                click: () => onCountryClick(d ?? null),
              });
            },
          }).addTo(map);
          geoLayerRef.current = layer;
        })
        .catch(() => console.warn('GeoJSON fetch failed, map will show without country shapes'));

      requestAnimationFrame(() => map.invalidateSize());
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      geoLayerRef.current = null;
      bubblesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restyle choropleth when data changes
  useEffect(() => {
    geoLayerRef.current?.setStyle(styleFeature);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Re-render bubbles when toggle or data changes
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then(L => renderBubbles(L, mapRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBubbles, data]);

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
          font-family: system-ui !important;
        }
        .leaflet-control-attribution { background: rgba(13,17,23,0.8) !important; color: #475569 !important; font-size: 9px !important; }
        .leaflet-control-attribution a { color: #64748b !important; }
        .leaflet-bar a { background: rgba(20,24,33,0.97) !important; color: #94a3b8 !important; border-color: rgba(255,255,255,0.08) !important; }
        .leaflet-bar a:hover { background: rgba(59,130,246,0.2) !important; color: #f1f5f9 !important; }
      `}</style>
    </>
  );
}
