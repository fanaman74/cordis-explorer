import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
const COUNTRY_CENTROIDS = {
  "Afghanistan": [33.93, 67.71],
  "Albania": [41.15, 20.17],
  "Algeria": [28.03, 1.66],
  "Argentina": [-38.42, -63.62],
  "Armenia": [40.07, 45.04],
  "Australia": [-25.27, 133.78],
  "Austria": [47.52, 14.55],
  "Azerbaijan": [40.14, 47.58],
  "Bangladesh": [23.68, 90.36],
  "Belarus": [53.71, 27.95],
  "Belgium": [50.5, 4.47],
  "Bolivia": [-16.29, -63.59],
  "Bosnia and Herzegovina": [43.92, 17.68],
  "Brazil": [-14.24, -51.93],
  "Bulgaria": [42.73, 25.49],
  "Cambodia": [12.57, 104.99],
  "Cameroon": [3.85, 11.5],
  "Canada": [56.13, -106.35],
  "Chile": [-35.68, -71.54],
  "China": [35.86, 104.19],
  "Colombia": [4.57, -74.3],
  "Croatia": [45.1, 15.2],
  "Cyprus": [35.13, 33.43],
  "Czech Republic": [49.82, 15.47],
  "Czechia": [49.82, 15.47],
  "Denmark": [56.26, 9.5],
  "Ecuador": [-1.83, -78.18],
  "Egypt": [26.82, 30.8],
  "Estonia": [58.6, 25.01],
  "Ethiopia": [9.15, 40.49],
  "Finland": [61.92, 25.75],
  "France": [46.23, 2.21],
  "Georgia": [42.31, 43.36],
  "Germany": [51.17, 10.45],
  "Ghana": [7.95, -1.02],
  "Greece": [39.07, 21.82],
  "Hungary": [47.16, 19.5],
  "Iceland": [64.96, -19.02],
  "India": [20.59, 78.96],
  "Indonesia": [-0.79, 113.92],
  "Iran": [32.43, 53.69],
  "Iran, Islamic Republic of": [32.43, 53.69],
  "Iraq": [33.22, 43.68],
  "Ireland": [53.41, -8.24],
  "Israel": [31.05, 34.85],
  "Italy": [41.87, 12.57],
  "Japan": [36.2, 138.25],
  "Jordan": [30.59, 36.24],
  "Kazakhstan": [48.02, 66.92],
  "Kenya": [-0.02, 37.91],
  "Korea, Republic of": [35.91, 127.77],
  "Kuwait": [29.31, 47.48],
  "Latvia": [56.88, 24.6],
  "Lebanon": [33.85, 35.86],
  "Libya": [26.34, 17.23],
  "Liechtenstein": [47.17, 9.56],
  "Lithuania": [55.17, 23.88],
  "Luxembourg": [49.82, 6.13],
  "Malta": [35.94, 14.38],
  "Mexico": [23.63, -102.55],
  "Moldova": [47.41, 28.37],
  "Moldova, Republic of": [47.41, 28.37],
  "Montenegro": [42.71, 19.37],
  "Morocco": [31.79, -7.09],
  "Mozambique": [-18.67, 35.53],
  "Netherlands": [52.13, 5.29],
  "New Zealand": [-40.9, 174.89],
  "Nigeria": [9.08, 8.68],
  "North Macedonia": [41.61, 21.75],
  "Norway": [60.47, 8.47],
  "Pakistan": [30.38, 69.35],
  "Peru": [-9.19, -75.02],
  "Philippines": [12.88, 121.77],
  "Poland": [51.92, 19.15],
  "Portugal": [39.4, -8.22],
  "Romania": [45.94, 24.97],
  "Russia": [61.52, 105.32],
  "Russian Federation": [61.52, 105.32],
  "Saudi Arabia": [23.89, 45.08],
  "Senegal": [14.5, -14.45],
  "Serbia": [44.02, 21.01],
  "Singapore": [1.35, 103.82],
  "Slovak Republic": [48.67, 19.7],
  "Slovakia": [48.67, 19.7],
  "Slovenia": [46.15, 14.99],
  "South Africa": [-30.56, 22.94],
  "Spain": [40.46, -3.75],
  "Sweden": [60.13, 18.64],
  "Switzerland": [46.82, 8.23],
  "Taiwan": [23.7, 121],
  "Thailand": [15.87, 100.99],
  "Tunisia": [33.89, 9.54],
  "Turkey": [38.96, 35.24],
  "Türkiye": [38.96, 35.24],
  "Uganda": [1.37, 32.29],
  "Ukraine": [48.38, 31.17],
  "United Arab Emirates": [23.42, 53.85],
  "United Kingdom": [55.38, -3.44],
  "United States": [37.09, -95.71],
  "United States of America": [37.09, -95.71],
  "Uruguay": [-32.52, -55.77],
  "Vietnam": [14.06, 108.28]
};
const NORMALISE = {
  "Czech Republic": "Czech Rep.",
  "Czechia": "Czech Rep.",
  "Slovak Republic": "Slovakia",
  "North Macedonia": "Macedonia",
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  "Moldova, Republic of": "Moldova",
  "Korea, Republic of": "South Korea",
  "Iran, Islamic Republic of": "Iran",
  "Russian Federation": "Russia",
  "United States": "United States of America",
  "Türkiye": "Turkey"
};
function norm(name) {
  return NORMALISE[name] ?? name;
}
function getColor(t) {
  const r = Math.round(26 + t * (96 - 26));
  const g = Math.round(58 + t * (165 - 58));
  const b = Math.round(107 + t * (250 - 107));
  return `rgb(${r},${g},${b})`;
}
const GEOJSON_URL = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
function CordisMap({ data, onCountryClick, selected, showBubbles }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const geoLayerRef = useRef(null);
  const bubblesRef = useRef([]);
  const dataRef = useRef(data);
  dataRef.current = data;
  Math.max(...data.map((d) => d.projectCount), 1);
  function styleFeature(feature) {
    var _a;
    const name = ((_a = feature == null ? void 0 : feature.properties) == null ? void 0 : _a.name) ?? "";
    const d = dataRef.current.find((x) => norm(x.country) === name);
    const count = (d == null ? void 0 : d.projectCount) ?? 0;
    const t = count > 0 ? Math.pow(count / Math.max(...dataRef.current.map((x) => x.projectCount), 1), 0.4) : 0;
    return {
      fillColor: count > 0 ? getColor(t) : "#1a1f2e",
      fillOpacity: count > 0 ? 0.82 : 0.4,
      color: "#2d3a52",
      weight: 0.8
    };
  }
  function renderBubbles(L, map) {
    bubblesRef.current.forEach((m) => m.remove());
    bubblesRef.current = [];
    if (!showBubbles) return;
    const currentMax = Math.max(...dataRef.current.map((d) => d.projectCount), 1);
    dataRef.current.forEach((d) => {
      const coords = COUNTRY_CENTROIDS[d.country];
      if (!coords) return;
      const t = Math.pow(d.projectCount / currentMax, 0.45);
      const circle = L.circleMarker(coords, {
        radius: 5 + t * 35,
        fillColor: getColor(t),
        fillOpacity: 0.7,
        color: "rgba(255,255,255,0.2)",
        weight: 1.2
      });
      circle.on("click", () => onCountryClick(d));
      circle.bindTooltip(
        `<div style="font-weight:600;color:#f1f5f9">${d.country}</div><div style="color:#94a3b8">${d.projectCount.toLocaleString()} projects</div>`,
        { sticky: true, className: "cordis-map-tooltip" }
      );
      circle.addTo(map);
      bubblesRef.current.push(circle);
    });
  }
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    import("leaflet").then((L) => {
      const map = L.map(containerRef.current, {
        center: [50, 12],
        zoom: 4,
        zoomControl: true,
        scrollWheelZoom: true,
        minZoom: 2,
        maxZoom: 8
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OSM &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19
      }).addTo(map);
      mapRef.current = map;
      fetch(GEOJSON_URL).then((r) => r.json()).then((geojson) => {
        if (!mapRef.current) return;
        const layer = L.geoJSON(geojson, {
          style: styleFeature,
          onEachFeature: (feature, layer2) => {
            var _a;
            const name = ((_a = feature == null ? void 0 : feature.properties) == null ? void 0 : _a.name) ?? "";
            const d = dataRef.current.find((x) => norm(x.country) === name);
            if (d) {
              layer2.bindTooltip(
                `<div style="font-weight:600;color:#f1f5f9;font-size:13px">${d.country}</div><div style="color:#94a3b8;font-size:12px">${d.projectCount.toLocaleString()} projects · ${d.orgCount.toLocaleString()} orgs</div>`,
                { sticky: true, className: "cordis-map-tooltip" }
              );
            }
            layer2.on({
              mouseover: (e) => e.target.setStyle({ weight: 2, color: "#60a5fa", fillOpacity: d ? 0.95 : 0.55 }),
              mouseout: () => layer2.setStyle(styleFeature(feature)),
              click: () => onCountryClick(d ?? null)
            });
          }
        }).addTo(map);
        geoLayerRef.current = layer;
      }).catch(() => console.warn("GeoJSON fetch failed, map will show without country shapes"));
      requestAnimationFrame(() => map.invalidateSize());
    });
    return () => {
      var _a;
      (_a = mapRef.current) == null ? void 0 : _a.remove();
      mapRef.current = null;
      geoLayerRef.current = null;
      bubblesRef.current = [];
    };
  }, []);
  useEffect(() => {
    var _a;
    (_a = geoLayerRef.current) == null ? void 0 : _a.setStyle(styleFeature);
  }, [data]);
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => renderBubbles(L, mapRef.current));
  }, [showBubbles, data]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { ref: containerRef, style: { position: "absolute", inset: 0, background: "#0d1117" } }),
    /* @__PURE__ */ jsx("style", { children: `
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
      ` })
  ] });
}
export {
  CordisMap as default
};
