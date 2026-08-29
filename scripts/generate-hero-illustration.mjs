// Generates a stylized isometric line-art illustration of a modern house
// (wireframe massing + pool + dimension lines) to use as the homepage hero
// background -- an original vector illustration, not an attempt to copy any
// reference photo/render. Run with: node scripts/generate-hero-illustration.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "home", "hero-illustration.svg");

// --- Isometric projection (raw, unit=1) ---------------------------------
// +x -> screen right+down, +z -> screen left+down, +y -> screen up.
const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);

function projectRaw([x, y, z]) {
  return [(x - z) * COS30, (x + z) * SIN30 - y];
}

// --- Massing (model units) ------------------------------------------------
function box([x0, y0, z0], [x1, y1, z1]) {
  const v = {
    b0: [x0, y0, z0], b1: [x1, y0, z0], b2: [x1, y0, z1], b3: [x0, y0, z1],
    t0: [x0, y1, z0], t1: [x1, y1, z0], t2: [x1, y1, z1], t3: [x0, y1, z1],
  };
  const edges = [
    [v.b0, v.b1], [v.b1, v.b2], [v.b2, v.b3], [v.b3, v.b0],
    [v.t0, v.t1], [v.t1, v.t2], [v.t2, v.t3], [v.t3, v.t0],
    [v.b0, v.t0], [v.b1, v.t1], [v.b2, v.t2], [v.b3, v.t3],
  ];
  return { v, edges, top: [v.t0, v.t1, v.t2, v.t3], right: [v.b1, v.b2, v.t2, v.t1], left: [v.b0, v.b1, v.t1, v.t0] };
}

const main = box([0, 0, 0], [8, 2.6, 5.5]);
// upper volume: narrower + shallower than main, clearly cantilevered past
// the main box's right (x=8) face and inset from its left/back edges.
const upper = box([3.4, 2.6, 1.3], [11.4, 4.5, 4.4]);

const terrace = [[-3, 0, -2], [8, 0, -2], [8, 0, 12], [-3, 0, 12]];
const pool = [[-1.5, -0.04, 6.5], [7, -0.04, 6.5], [7, -0.04, 11], [-1.5, -0.04, 11]];

const glazing = [0.4, 1.6, 2.8, 4].map((gz) => ({
  quad: [[8, 0.3, gz], [8, 0.3, gz + 0.9], [8, 2.1, gz + 0.9], [8, 2.1, gz]],
}));

const trees = [
  { base: [7.6, 0, 10.2], h: 2.5 },
  { base: [-2.2, 0, 9.4], h: 1.9 },
  { base: [-2.6, 0, 7.2], h: 2.2 },
];

const dimLines = [
  [[0, 0, -3.4], [0, 0, -2.4]],
  [[8, 0, -3.4], [8, 0, -2.4]],
  [[0, -1.1, -3], [8, -1.1, -3]],
  [[-4.2, 0, 0], [-3.4, 0, 0]],
  [[-4.2, 0, 5.5], [-3.4, 0, 5.5]],
  [[-4.8, 0, 0], [-4.8, 0, 5.5]],
];

// --- Fit projected geometry into the target viewBox -----------------------
const VB_W = 1100, VB_H = 900;
const PAD = 40;

const allPoints3D = [
  ...main.edges.flat(), ...upper.edges.flat(),
  ...terrace, ...pool,
  ...glazing.flatMap((g) => g.quad),
  ...trees.flatMap((t) => [t.base, [t.base[0], t.h, t.base[2]]]),
  ...dimLines.flat(),
];
const rawPts = allPoints3D.map(projectRaw);
const xs = rawPts.map((p) => p[0]);
const ys = rawPts.map((p) => p[1]);
const minX = Math.min(...xs), maxX = Math.max(...xs);
const minY = Math.min(...ys), maxY = Math.max(...ys);
const scale = Math.min((VB_W - PAD * 2) / (maxX - minX), (VB_H - PAD * 2) / (maxY - minY));
// Bias the composition toward the right/bottom (house upper-right, pool foreground)
const offsetX = PAD - minX * scale + (VB_W - PAD * 2 - (maxX - minX) * scale) * 0.72;
const offsetY = PAD - minY * scale + (VB_H - PAD * 2 - (maxY - minY) * scale) * 0.68;

function project(p) {
  const [rx, ry] = projectRaw(p);
  return [r(rx * scale + offsetX), r(ry * scale + offsetY)];
}
function r(n) {
  return Math.round(n * 10) / 10;
}
function lineD(p0, p1) {
  const [x0, y0] = project(p0);
  const [x1, y1] = project(p1);
  return `M${x0},${y0} L${x1},${y1}`;
}
function polyD(points) {
  const pts = points.map(project);
  return `M${pts[0][0]},${pts[0][1]} ` + pts.slice(1).map((p) => `L${p[0]},${p[1]}`).join(" ") + " Z";
}

const GOLD = "#C7A468";
const CREAM = "#F2EDE4";

let svg = "";
svg += `<svg viewBox="0 0 ${VB_W} ${VB_H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">\n`;
svg += `<defs><filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="10"/></filter></defs>\n`;

svg += `<path d="${polyD(terrace)}" fill="none" stroke="${GOLD}" stroke-opacity="0.14" stroke-width="1.2"/>\n`;
svg += `<path d="${polyD(pool)}" fill="${GOLD}" fill-opacity="0.07" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="1.2"/>\n`;

for (let i = 1; i < 5; i++) {
  const t = i / 5;
  const p0 = [-1.5 + t * 8.5, -0.04, 6.5];
  const p1 = [-1.5 + t * 8.5, -0.04, 11];
  svg += `<path d="${lineD(p0, p1)}" stroke="${GOLD}" stroke-opacity="0.14" stroke-width="1"/>\n`;
}

for (const [p0, p1] of dimLines) {
  svg += `<path d="${lineD(p0, p1)}" stroke="${GOLD}" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="2 3"/>\n`;
}

for (const g of glazing) {
  svg += `<path d="${polyD(g.quad)}" fill="${GOLD}" fill-opacity="0.55" filter="url(#glow)"/>\n`;
}
for (const g of glazing) {
  svg += `<path d="${polyD(g.quad)}" fill="${GOLD}" fill-opacity="0.2" stroke="${GOLD}" stroke-opacity="0.6" stroke-width="1"/>\n`;
}

svg += `<path d="${polyD(main.left)}" fill="${CREAM}" fill-opacity="0.025"/>\n`;
svg += `<path d="${polyD(main.top)}" fill="${CREAM}" fill-opacity="0.05"/>\n`;
svg += `<path d="${polyD(upper.top)}" fill="${CREAM}" fill-opacity="0.06"/>\n`;
svg += `<path d="${polyD(upper.left)}" fill="${CREAM}" fill-opacity="0.035"/>\n`;
svg += `<path d="${polyD(upper.right)}" fill="${CREAM}" fill-opacity="0.025"/>\n`;

for (const [p0, p1] of [...main.edges, ...upper.edges]) {
  svg += `<path d="${lineD(p0, p1)}" stroke="${CREAM}" stroke-opacity="0.65" stroke-width="1.3"/>\n`;
}

for (const t of trees) {
  svg += `<path d="${lineD(t.base, [t.base[0], t.h, t.base[2]])}" stroke="${GOLD}" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round"/>\n`;
}

svg += `</svg>\n`;

fs.writeFileSync(OUT, svg, "utf8");
console.log("wrote", OUT, `(${svg.length} bytes)`, { scale: r(scale) });
