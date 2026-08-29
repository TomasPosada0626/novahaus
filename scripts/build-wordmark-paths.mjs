// One-off build utility: converts brand text into real SVG path data using
// the actual Manrope glyph outlines (fontkit), so wordmark/subtitle in the
// logo SVGs are true vector paths rather than <text> elements or rasterized
// images. Run with: node scripts/build-wordmark-paths.mjs
// Prints JSON { d, width, capHeight } for each requested string; paste the
// resulting `d` values into the hand-authored logo SVGs.
import * as fontkit from "fontkit";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_DIR = path.join(
  __dirname,
  "..",
  "node_modules",
  "@fontsource",
  "manrope",
  "files"
);

function commandsToD(commands) {
  return commands
    .map((c) => {
      const a = c.args;
      switch (c.command) {
        case "moveTo":
          return `M${round(a[0])},${round(a[1])}`;
        case "lineTo":
          return `L${round(a[0])},${round(a[1])}`;
        case "quadraticCurveTo":
          return `Q${round(a[0])},${round(a[1])} ${round(a[2])},${round(a[3])}`;
        case "bezierCurveTo":
          return `C${round(a[0])},${round(a[1])} ${round(a[2])},${round(a[3])} ${round(a[4])},${round(a[5])}`;
        case "closePath":
          return "Z";
        default:
          return "";
      }
    })
    .join("");
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}

// Transforms raw glyph command args (font units, y-up) into SVG space
// (y-down) at the given x offset, without mutating the shared glyph path.
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
      const transformed = transformCommands(glyph.path.commands, scale, x);
      dParts.push(commandsToD(transformed));
    }
    x += glyph.advanceWidth * scale + tracking;
  }

  const capHeight = font.capHeight * scale;
  const ascent = font.ascent * scale;
  const descent = font.descent * scale;
  return {
    d: dParts.join(" "),
    width: round(x - tracking),
    capHeight: round(capHeight),
    ascent: round(ascent),
    descent: round(descent),
  };
}

const wordmark = textToPath(
  "manrope-latin-800-normal.woff",
  "NOVAHAUS",
  48,
  0.045
);

const subtitle = textToPath(
  "manrope-latin-600-normal.woff",
  "ARQUITECTURA · INTERIORISMO",
  13,
  0.14
);

console.log(
  JSON.stringify(
    {
      wordmark: { ...wordmark, dLength: wordmark.d.length },
      subtitle: { ...subtitle, dLength: subtitle.d.length },
    },
    null,
    2
  )
);

console.log("\n--- wordmark d ---\n" + wordmark.d);
console.log("\n--- subtitle d ---\n" + subtitle.d);
