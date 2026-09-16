// Bundles home/index.html into a single self-contained HTML file: CSS and
// JS inlined, every local image (favicon, logo, photos) converted to a
// base64 data: URI. Google Fonts stay as external <link> tags (fetched from
// Google's CDN, not worth inlining). Meant for handing the client one file
// they can open directly, no server needed.
// Run with: node scripts/build-standalone.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const HOME = path.join(ROOT, "home");
const OUT = path.join(ROOT, "dist");

const MIME = {
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function toDataUri(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  const mime = MIME[ext];
  if (!mime) throw new Error(`No MIME mapping for ${absPath}`);
  const b64 = fs.readFileSync(absPath).toString("base64");
  return `data:${mime};base64,${b64}`;
}

// Resolves an href/src found in home/index.html to an absolute file path.
// Paths starting with "../" are relative to home/, others relative to home/ too
// (all current refs in home/index.html are relative to the home/ directory).
function resolveAsset(ref) {
  return path.normalize(path.join(HOME, ref));
}

let html = fs.readFileSync(path.join(HOME, "index.html"), "utf8");

// 1) Inline CSS
html = html.replace(
  /<link rel="stylesheet" href="css\/home\.css">/,
  () => `<style>\n${fs.readFileSync(path.join(HOME, "css", "home.css"), "utf8")}\n</style>`
);

// 2) Inline JS
html = html.replace(
  /<script src="js\/home\.js"><\/script>/,
  () => `<script>\n${fs.readFileSync(path.join(HOME, "js", "home.js"), "utf8")}\n</script>`
);

// 3) Drop the PWA manifest link -- not meaningful for a single emailed file
html = html.replace(/<link rel="manifest"[^>]*>/, "");

// 4) Inline every local image reference (src="...", srcset="...", and the
// favicon/touch-icon href="...") that points at a real file on disk (skip
// absolute http(s) URLs and plain anchors like href="#contacto").
html = html.replace(/(src|srcset|href)="([^"]+)"/g, (match, attr, ref) => {
  if (attr === "href" && !/\.(svg|ico|png|jpg|jpeg|webp)$/i.test(ref)) return match;
  if (/^https?:\/\//.test(ref)) return match;
  const abs = resolveAsset(ref);
  if (!fs.existsSync(abs)) {
    console.warn("WARNING: asset not found, leaving as-is:", ref);
    return match;
  }
  return `${attr}="${toDataUri(abs)}"`;
});

fs.mkdirSync(OUT, { recursive: true });
const outPath = path.join(OUT, "renovhaus.html");
fs.writeFileSync(outPath, html, "utf8");

const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(0);
console.log(`wrote ${outPath} (${sizeKB} KB)`);
