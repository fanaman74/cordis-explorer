import { useEffect, useRef } from 'react';
import type { CountryMapData } from '../../hooks/useMapData';

// Country name normalisation: CORDIS name → GeoJSON name
const CORDIS_TO_GEOJSON: Record<string, string> = {
  'Czech Republic': 'Czech Rep.',
  'Czechia': 'Czech Rep.',
  'Slovak Republic': 'Slovakia',
  'North Macedonia': 'Macedonia',
  'Bosnia and Herzegovina': 'Bosnia and Herz.',
  'United Kingdom': 'United Kingdom',
  'Netherlands': 'Netherlands',
  'Moldova, Republic of': 'Moldova',
  'Korea, Republic of': 'South Korea',
  'Taiwan': 'Taiwan',
  'Iran, Islamic Republic of': 'Iran',
  'Russian Federation': 'Russia',
  'United States': 'United States of America',
  'United States of America': 'United States of America',
  'Türkiye': 'Turkey',
  'Turkey': 'Turkey',
};

function normalise(name: string): string {
  return CORDIS_TO_GEOJSON[name] ?? name;
}

function getColor(count: number, max: number): string {
  if (count === 0) return '#1e2235';
  const t = Math.pow(count / max, 0.4); // power scale so mid-range is visible
  // interpolate from #1a3a6b (low) → #3b82f6 (mid) → #60a5fa (high)
  const r = Math.round(26 + t * (96 - 26));
  const g = Math.round(58 + t * (165 - 58));
  const b = Math.round(107 + t * (250 - 107));
  return `rgb(${r},${g},${b})`;
}

interface Props {
  data: CountryMapData[];
  onCountryClick: (country: CountryMapData | null) => void;
  selected: string | null;
}

export default function CordisMap({ data, onCountryClick, selected }: Props) {
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const geoLayerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const countByName = new Map(data.map((d) => [normalise(d.country), d]));
  const max = Math.max(...data.map((d) => d.projectCount), 1);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamic import to avoid SSR issues
    import('leaflet').then((L) => {
      leafletRef.current = L;

      // Fix default icon path issue in Vite
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!, {
        center: [52, 15],
        zoom: 3,
        zoomControl: true,
        scrollWheelZoom: true,
        minZoom: 2,
        maxZoom: 7,
      });

      // Force Leaflet to recalculate dimensions after CSS layout resolves
      setTimeout(() => map.invalidateSize(), 100);

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Load GeoJSON
      fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        .then((r) => r.json())
        .then((geojson) => {
          if (!mapRef.current) return;

          const layer = L.geoJSON(geojson, {
            style: (feature) => {
              const name = feature?.properties?.name ?? '';
              const d = countByName.get(name);
              const count = d?.projectCount ?? 0;
              return {
                fillColor: getColor(count, max),
                fillOpacity: count > 0 ? 0.85 : 0.3,
                color: '#2d3748',
                weight: 0.8,
                opacity: 1,
              };
            },
            onEachFeature: (feature, layer) => {
              const name = feature?.properties?.name ?? '';
              const d = countByName.get(name);
              const count = d?.projectCount ?? 0;

              layer.on({
                mouseover: (e: any) => {
                  e.target.setStyle({ weight: 2, color: '#60a5fa', fillOpacity: count > 0 ? 0.95 : 0.5 });
                },
                mouseout: (e: any) => {
                  layer.setStyle({
                    fillColor: getColor(count, max),
                    fillOpacity: count > 0 ? 0.85 : 0.3,
                    color: '#2d3748',
                    weight: 0.8,
                  });
                },
                click: () => {
                  if (d) {
                    onCountryClick(d);
                  } else {
                    onCountryClick(null);
                  }
                },
              });

              if (count > 0) {
                layer.bindTooltip(
                  `<div style="font-family:system-ui;font-size:13px;font-weight:600;color:#f1f5f9">${name}</div><div style="font-size:12px;color:#94a3b8">${count.toLocaleString()} projects · ${d?.orgCount.toLocaleString()} orgs</div>`,
                  { sticky: true, className: 'cordis-map-tooltip' }
                );
              }
            },
          }).addTo(mapRef.current);

          geoLayerRef.current = layer;
        });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        geoLayerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-style when data changes
  useEffect(() => {
    if (!geoLayerRef.current) return;
    geoLayerRef.current.setStyle((feature: any) => {
      const name = feature?.properties?.name ?? '';
      const d = countByName.get(name);
      const count = d?.projectCount ?? 0;
      return {
        fillColor: getColor(count, max),
        fillOpacity: count > 0 ? 0.85 : 0.3,
        color: '#2d3748',
        weight: 0.8,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, background: '#0f1117' }} />
  );
}
