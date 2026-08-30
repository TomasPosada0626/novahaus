// Generates the 6 RenovHaus logo SVG files from a single master monogram
// definition (100-unit coordinate space) and real Manrope glyph outlines
// (via fontkit) for the wordmark/subtitle text -- no <text> elements, no
// rasterized text, just paths. Run with: node scripts/generate-logos.mjs
import * as fontkit from "fontkit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FONT_DIR = path.join(ROOT, "node_modules", "@fontsource", "manrope", "files");
const OUT_DIR = path.join(ROOT, "assets", "logo");

const COLOR = {
  bgDark: "#131210",
  // Medium-dark olive green accent, replacing the original gold. Two shades
  // for the same reason gold needed two: oliveOnLight (~5.15:1 on #F3EEE6)
  // is the canonical "verde oliva medio oscuro"; oliveOnDark is a lighter
  // moss tone kept legible (~7.6:1) against the near-black background.
  oliveOnDark: "#9CAD5E",
  textOnDark: "#F2EDE4",
  subtitleOnDark: "#9A9186",
  bgLight: "#F3EEE6",
  oliveOnLight: "#556B2F",
  textOnLight: "#1A1815",
  // Derived neutral for the light-background lockup's subtitle. Not part of
  // the approved 7-color palette (the brief only specified a dark-bg
  // subtitle tone) -- picked to sit in the same muted family and verified
  // at ~5:1 contrast against #F3EEE6 (WCAG AA pass for normal text).
  subtitleOnLight: "#6B6558",
  white: "#FFFFFF",
  black: "#000000",
};

// --- Master monogram, drawn once in a 100x100 unit box -------------------
// Square frame, rx = 8 (8% of 100, per brand spec). Geometric "R": a full
// stem, a rectangular bowl (top/right/bottom bars, open counter), and a
// diagonal leg -- same 12-unit stroke thickness and 18-unit margins as the
// original N, so it reads as the same construction system.
const FRAME_RX = 8;
const MONOGRAM_D =
  "M18,18 H30 V82 H18 Z " +
  "M30,18 H70 V30 H30 Z " +
  "M58,18 H70 V52 H58 Z " +
  "M30,40 H70 V52 H30 Z " +
  "M46,52 L58,52 L82,82 L70,82 Z";
const FRAME_STROKE_WIDTH = 4; // used only for outline (monochrome) treatment

// --- Text-to-path (real Manrope outlines, not <text>) ---------------------
function commandsToD(commands) {
  return commands
    .map((c) => {
      const a = c.args;
      switch (c.command) {
        case "moveTo":
          return `M${r(a[0])},${r(a[1])}`;
        case "lineTo":
          return `L${r(a[0])},${r(a[1])}`;
        case "quadraticCurveTo":
          return `Q${r(a[0])},${r(a[1])} ${r(a[2])},${r(a[3])}`;
        case "bezierCurveTo":
          return `C${r(a[0])},${r(a[1])} ${r(a[2])},${r(a[3])} ${r(a[4])},${r(a[5])}`;
        case "closePath":
          return "Z";
        default:
          return "";
      }
    })
    .join("");
}
function r(n) {
  return Math.round(n * 1000) / 1000;
}
function transformCommands(commands, scale, tx) {
  return commands.map((c) => ({
    command: c.command,
    args: c.args.map((v, i) => (i % 2 === 0 ? v * scale + tx : v * -scale)),
  }));
}
function textToPath(fontFile, text, fontSize, trackingEm = 0) {
  const font = fontkit.openSync(path.join(FONT_DIR, fontFile));
  const scale = fontSize / font.unitsPerEm;
  const tracking = trackingEm * fontSize;
  let x = 0;
  const dParts = [];
  for (const char of text) {
    const glyph = font.glyphForCodePoint(char.codePointAt(0));
    if (glyph.path.commands.length > 0) {
      dParts.push(commandsToD(transformCommands(glyph.path.commands, scale, x)));
    }
    x += glyph.advanceWidth * scale + tracking;
  }
  return { d: dParts.join(" "), width: r(x - tracking), capHeight: r(font.capHeight * scale) };
}

const wordmark = textToPath("manrope-latin-800-normal.woff", "RENOVHAUS", 48, 0.045);
const subtitle = textToPath("manrope-latin-600-normal.woff", "ARQUITECTURA · INTERIORISMO", 13, 0.14);

// --- Layout constants -------------------------------------------------
const ICON = 64; // rendered icon size in composed lockups
const ICON_SCALE = ICON / 100;

function svgOpen(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="RENOVHAUS">`;
}

function frameRect(fill) {
  return `<rect x="0" y="0" width="100" height="100" rx="${FRAME_RX}" fill="${fill}"/>`;
}
function frameOutline(stroke) {
  return `<rect x="${FRAME_STROKE_WIDTH / 2}" y="${FRAME_STROKE_WIDTH / 2}" width="${100 - FRAME_STROKE_WIDTH}" height="${100 - FRAME_STROKE_WIDTH}" rx="${FRAME_RX}" fill="none" stroke="${stroke}" stroke-width="${FRAME_STROKE_WIDTH}"/>`;
}
function monogram(fill) {
  return `<path d="${MONOGRAM_D}" fill="${fill}"/>`;
}

// 1) Icon only -- beige frame (matches the surrounding light palette) with
// an olive R, per brand direction (favicon/avatar use, light theme).
const iconOnly = `${svgOpen(100, 100)}
  ${frameRect(COLOR.bgLight)}
  ${monogram(COLOR.oliveOnLight)}
</svg>
`;

// 2/3) Primary lockups (icon + wordmark + subtitle) -----------------------
function primaryLockup({ bg, gold, text, subtitleColor }) {
  const PAD = 32;
  const GAP = 24;
  const textX = PAD + ICON + GAP;
  const contentH = ICON;
  const wmTopMargin = (contentH - (wordmark.capHeight + 10 + subtitle.capHeight)) / 2;
  const wmBaselineY = PAD + wmTopMargin + wordmark.capHeight;
  const subBaselineY = wmBaselineY + 10 + subtitle.capHeight;
  const width = r(textX + wordmark.width + PAD);
  const height = PAD + ICON + PAD;

  return `${svgOpen(width, height)}
  <g transform="translate(${PAD},${PAD}) scale(${ICON_SCALE})">
    ${monogram(gold)}
  </g>
  <path d="${wordmark.d}" fill="${text}" transform="translate(${textX},${r(wmBaselineY)})"/>
  <path d="${subtitle.d}" fill="${subtitleColor}" transform="translate(${textX},${r(subBaselineY)})"/>
</svg>
`;
}

const primaryDark = (() => {
  const PAD = 32;
  const inner = primaryLockup({
    bg: COLOR.bgDark,
    gold: COLOR.oliveOnDark,
    text: COLOR.textOnDark,
    subtitleColor: COLOR.subtitleOnDark,
  });
  // re-inject a full-bleed background rect right after the opening <svg> tag
  return inner.replace(/(<svg[^>]*>)/, `$1\n  <rect width="100%" height="100%" fill="${COLOR.bgDark}"/>`);
})();

const primaryLight = (() => {
  const inner = primaryLockup({
    bg: COLOR.bgLight,
    gold: COLOR.oliveOnLight,
    text: COLOR.textOnLight,
    subtitleColor: COLOR.subtitleOnLight,
  });
  return inner.replace(/(<svg[^>]*>)/, `$1\n  <rect width="100%" height="100%" fill="${COLOR.bgLight}"/>`);
})();

// 4) Compact (icon + wordmark, no subtitle) -------------------------------
const compact = (() => {
  const PAD = 20;
  const GAP = 20;
  const textX = PAD + ICON + GAP;
  const wmTopMargin = (ICON - wordmark.capHeight) / 2;
  const wmBaselineY = PAD + wmTopMargin + wordmark.capHeight;
  const width = r(textX + wordmark.width + PAD);
  const height = PAD + ICON + PAD;

  return `${svgOpen(width, height)}
  <rect width="100%" height="100%" fill="${COLOR.bgDark}"/>
  <g transform="translate(${PAD},${PAD}) scale(${ICON_SCALE})">
    ${monogram(COLOR.oliveOnDark)}
  </g>
  <path d="${wordmark.d}" fill="${COLOR.textOnDark}" transform="translate(${textX},${r(wmBaselineY)})"/>
</svg>
`;
})();

// 5/6) Monochrome (outline frame + solid monogram + wordmark, transparent) -
function monochrome(color) {
  const PAD = 20;
  const GAP = 20;
  const textX = PAD + ICON + GAP;
  const wmTopMargin = (ICON - wordmark.capHeight) / 2;
  const wmBaselineY = PAD + wmTopMargin + wordmark.capHeight;
  const width = r(textX + wordmark.width + PAD);
  const height = PAD + ICON + PAD;

  return `${svgOpen(width, height)}
  <g transform="translate(${PAD},${PAD}) scale(${ICON_SCALE})">
    ${frameOutline(color)}
    ${monogram(color)}
  </g>
  <path d="${wordmark.d}" fill="${color}" transform="translate(${textX},${r(wmBaselineY)})"/>
</svg>
`;
}

const monoWhite = monochrome(COLOR.white);
const monoBlack = monochrome(COLOR.black);

// --- Write files ----------------------------------------------------------
const files = {
  "logo-icon-only.svg": iconOnly,
  "logo-primary-dark.svg": primaryDark,
  "logo-primary-light.svg": primaryLight,
  "logo-compact.svg": compact,
  "logo-monochrome-white.svg": monoWhite,
  "logo-monochrome-black.svg": monoBlack,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT_DIR, name), content.trim() + "\n", "utf8");
  console.log("wrote", name, `(${content.length} bytes)`);
}
