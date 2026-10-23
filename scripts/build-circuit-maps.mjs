// Generates src/content/circuitMaps.ts: simplified SVG outlines + projected stop positions
// for each signature circuit, from Natural Earth 1:10m data (public domain).
// Usage: download ne_10m_admin_0_countries.geojson and ne_10m_admin_1_states_provinces.geojson
// into .geo/, then: node scripts/build-circuit-maps.mjs
import fs from "node:fs";
import { geoMercator } from "d3-geo";

const WIDTH = 500;
const PAD = 24;
const TOLERANCE = 0.9; // RDP tolerance in output px

const admin0 = JSON.parse(fs.readFileSync(".geo/admin0.geojson", "utf8")).features;
const admin1 = JSON.parse(fs.readFileSync(".geo/admin1.geojson", "utf8")).features;
const country = (iso) => admin0.filter((f) => f.properties.ADM0_A3 === iso);
const state = (name, iso) => admin1.filter((f) => f.properties.name === name && f.properties.adm0_a3 === iso);

/**
 * circuits: features to outline, stops in itinerary order, and either
 * - bbox: lon/lat box; rings whose centre falls outside are dropped (far-off islands), or
 * - view: lon/lat box the map is framed to; outlines run past the edge and are clipped by the SVG.
 * Stops follow Plumeria's published itineraries (plumeriaholidays.com).
 */
const circuits = [
  { id: "kashmir", features: [...state("Jammu and Kashmir", "IND"), ...state("Ladakh", "IND")], view: [73.9, 33.55, 75.75, 34.5], stops: [
    ["srinagar", "Srinagar", 74.8, 34.08], ["gulmarg", "Gulmarg", 74.38, 34.05], ["pahalgam", "Pahalgam", 75.32, 34.02]] },
  { id: "golden-triangle", features: ["Delhi", "Haryana", "Rajasthan", "Uttar Pradesh"].flatMap((s) => state(s, "IND")), view: [75.2, 26.5, 78.6, 29.1], stops: [
    ["delhi", "Delhi", 77.21, 28.61], ["agra", "Agra", 78.01, 27.18], ["jaipur", "Jaipur", 75.79, 26.91]] },
  { id: "thailand", features: ["Bangkok Metropolis", "Samut Prakan", "Chachoengsao", "Chon Buri"].flatMap((s) => state(s, "THA")), view: [100.25, 12.75, 101.15, 14.0], stops: [
    ["pattaya", "Pattaya", 100.88, 12.93], ["coral-island", "Coral Island", 100.78, 12.92],
    ["safari-world", "Safari World", 100.7, 13.86], ["bangkok", "Bangkok", 100.51, 13.74]] },
  { id: "vietnam", features: ["Hồ Chí Minh city", "Bình Dương", "Tây Ninh", "Long An", "Tiền Giang", "Bến Tre"].flatMap((s) => state(s, "VNM")), view: [105.9, 9.85, 107.1, 11.45], stops: [
    ["ho-chi-minh-city", "Ho Chi Minh City", 106.7, 10.78], ["cu-chi", "Cu Chi Tunnels", 106.46, 11.14], ["ben-tre", "Ben Tre", 106.38, 10.24]] },
  { id: "bali", features: country("IDN"), bbox: [114.4, -8.95, 115.75, -8.0], stops: [
    ["kuta", "Kuta", 115.17, -8.72], ["uluwatu", "Uluwatu", 115.085, -8.83], ["ubud", "Ubud", 115.26, -8.51],
    ["kintamani", "Kintamani", 115.35, -8.25], ["nusa-penida", "Nusa Penida", 115.54, -8.73]] },
];

const rings = (geom) =>
  geom.type === "Polygon" ? [geom.coordinates[0]] : geom.coordinates.map((p) => p[0]);

const inBox = (ring, b) => {
  if (!b) return true;
  const [x, y] = ring.reduce(([sx, sy], [lx, ly]) => [sx + lx, sy + ly], [0, 0]).map((v) => v / ring.length);
  return x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];
};

/** Keep only rings whose lon/lat extent overlaps the view box. */
const touchesView = (ring, v) => {
  if (!v) return true;
  const xs = ring.map((p) => p[0]), ys = ring.map((p) => p[1]);
  return Math.max(...xs) >= v[0] && Math.min(...xs) <= v[2] && Math.max(...ys) >= v[1] && Math.min(...ys) <= v[3];
};

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
    if (d > max) { max = d; idx = i; }
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)];
}

/** Closed rings break RDP (start == end); simplify the two halves separately. */
function simplifyRing(ring, eps) {
  const mid = Math.floor(ring.length / 2);
  return [...rdp(ring.slice(0, mid + 1), eps).slice(0, -1), ...rdp(ring.slice(mid), eps)];
}

const out = {};
for (const c of circuits) {
  if (!c.features.length) throw new Error(`no features for ${c.id}`);
  const proj = geoMercator();
  const ringsLL = c.features.flatMap((f) => rings(f.geometry)).filter((r) => inBox(r, c.bbox) && touchesView(r, c.view));
  const projected = ringsLL.map((r) => r.map((p) => proj(p)));
  // Frame to the view box when given, otherwise to the outlines themselves.
  const all = c.view ? [proj([c.view[0], c.view[3]]), proj([c.view[2], c.view[1]])] : projected.flat();
  const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
  const s = (WIDTH - PAD * 2) / (maxX - minX);
  const height = Math.round((maxY - minY) * s + PAD * 2);
  const tx = ([x, y]) => [+(PAD + (x - minX) * s).toFixed(1), +(PAD + (y - minY) * s).toFixed(1)];

  const d = projected
    .map((r) => simplifyRing(r.map(tx), TOLERANCE))
    .filter((r) => r.length >= 4)
    .map((r) => "M" + r.map((p) => p.join(" ")).join("L") + "Z")
    .join("");
  const stops = c.stops.map(([slug, name, lon, lat]) => {
    const [x, y] = tx(proj([lon, lat]));
    return { slug, name, x, y };
  });
  out[c.id] = { viewBox: `0 0 ${WIDTH} ${height}`, outline: d, stops, ...(c.view ? { framed: true } : {}) };
  console.log(c.id, `h=${height}`, `${d.length} chars`, `${ringsLL.length} rings`);
}

const ts = `// GENERATED by scripts/build-circuit-maps.mjs from Natural Earth 1:10m (public domain). Do not edit.
/** framed: outline is cropped by a view box and runs past the edges (fade it out when drawing). */
export interface CircuitMapData { viewBox: string; outline: string; stops: { slug: string; name: string; x: number; y: number }[]; framed?: boolean }
export const circuitMaps: Record<string, CircuitMapData> = ${JSON.stringify(out)};
`;
fs.writeFileSync("src/content/circuitMaps.ts", ts);
