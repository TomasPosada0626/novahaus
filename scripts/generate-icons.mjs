// Generates the favicon/PWA icon package from assets/logo/logo-icon-only.svg.
// Run with: node scripts/generate-icons.mjs (after `npm install`).
import sharp from "sharp";
import pngToIco from "png-to-ico";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC_SVG = path.join(ROOT, "assets", "logo", "logo-icon-only.svg");
const OUT_DIR = path.join(ROOT, "assets", "favicon");

fs.mkdirSync(OUT_DIR, { recursive: true });
const svgBuffer = fs.readFileSync(SRC_SVG);

async function renderPng(size, fileName) {
  const outPath = path.join(OUT_DIR, fileName);
  await sharp(svgBuffer, { density: 384 }).resize(size, size).png().toFile(outPath);
  console.log("wrote", fileName, `${size}x${size}`);
  return outPath;
}

async function main() {
  // Intermediate sizes for the multi-resolution .ico
  const ico16 = await renderPng(16, "_ico-16.png");
  const ico32 = await renderPng(32, "_ico-32.png");
  const ico48 = await renderPng(48, "_ico-48.png");

  const icoBuffer = await pngToIco([ico16, ico32, ico48]);
  fs.writeFileSync(path.join(OUT_DIR, "favicon.ico"), icoBuffer);
  console.log("wrote favicon.ico (16/32/48)");

  // Drop the intermediates -- only favicon.ico is needed from these sizes.
  for (const f of [ico16, ico32, ico48]) fs.unlinkSync(f);

  await renderPng(180, "apple-touch-icon.png");
  await renderPng(192, "icon-192.png");
  await renderPng(512, "icon-512.png");

  fs.copyFileSync(SRC_SVG, path.join(OUT_DIR, "favicon.svg"));
  console.log("wrote favicon.svg (copy of logo-icon-only.svg)");

  const manifest = {
    name: "NovaHaus",
    short_name: "NovaHaus",
    icons: [
      { src: "icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: "#131210",
    background_color: "#131210",
    display: "standalone",
  };
  fs.writeFileSync(
    path.join(OUT_DIR, "site.webmanifest"),
    JSON.stringify(manifest, null, 2) + "\n"
  );
  console.log("wrote site.webmanifest");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
