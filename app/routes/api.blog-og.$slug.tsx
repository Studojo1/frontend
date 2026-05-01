import type { Route } from "./+types/api.blog-og.$slug";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

function seededRandom(slug: string) {
  let seed = 5381;
  for (const c of slug) seed = (((seed * 33) ^ c.charCodeAt(0)) >>> 0);
  return () => {
    seed = (((seed * 1664525) + 1013904223) >>> 0);
    return seed / 0xffffffff;
  };
}

const PALETTES: Record<string, {
  bg: string; bgB: string;
  primary: string; primaryMid: string; primaryDim: string;
  accent: string;
  label: string;
}> = {
  internships: {
    bg: "#0A0614", bgB: "#100A22",
    primary: "#8b5cf6", primaryMid: "#6d28d9", primaryDim: "#3b0764",
    accent: "#dab2ff", label: "INTERNSHIP",
  },
  internship: {
    bg: "#0A0614", bgB: "#100A22",
    primary: "#8b5cf6", primaryMid: "#6d28d9", primaryDim: "#3b0764",
    accent: "#dab2ff", label: "INTERNSHIP",
  },
  career: {
    bg: "#021008", bgB: "#041A0E",
    primary: "#10b981", primaryMid: "#059669", primaryDim: "#064e3b",
    accent: "#6ee7b7", label: "CAREER",
  },
  careers: {
    bg: "#021008", bgB: "#041A0E",
    primary: "#10b981", primaryMid: "#059669", primaryDim: "#064e3b",
    accent: "#6ee7b7", label: "CAREER",
  },
  resume: {
    bg: "#021008", bgB: "#041A0E",
    primary: "#10b981", primaryMid: "#059669", primaryDim: "#064e3b",
    accent: "#6ee7b7", label: "RESUME",
  },
  ai: {
    bg: "#010C14", bgB: "#021520",
    primary: "#0ea5e9", primaryMid: "#0284c7", primaryDim: "#0c4a6e",
    accent: "#7dd3fc", label: "AI",
  },
  tech: {
    bg: "#010C14", bgB: "#021520",
    primary: "#0ea5e9", primaryMid: "#0284c7", primaryDim: "#0c4a6e",
    accent: "#7dd3fc", label: "TECH",
  },
  assignment: {
    bg: "#100800", bgB: "#1A1000",
    primary: "#f59e0b", primaryMid: "#d97706", primaryDim: "#78350f",
    accent: "#fde68a", label: "ASSIGNMENT",
  },
  assignments: {
    bg: "#100800", bgB: "#1A1000",
    primary: "#f59e0b", primaryMid: "#d97706", primaryDim: "#78350f",
    accent: "#fde68a", label: "ASSIGNMENT",
  },
  default: {
    bg: "#0A0614", bgB: "#100A22",
    primary: "#8b5cf6", primaryMid: "#6d28d9", primaryDim: "#3b0764",
    accent: "#dab2ff", label: "BLOG",
  },
};

function getPalette(cat: string) {
  return PALETTES[cat.toLowerCase()] ?? PALETTES.default;
}

function wrapTitle(title: string, maxChars: number): string[] {
  const words = title.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (test.length <= maxChars) { cur = test; }
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

function getFontSize(title: string): number {
  if (title.length < 28) return 74;
  if (title.length < 42) return 62;
  if (title.length < 58) return 52;
  return 42;
}

function approxW(text: string, size: number): number {
  return text.length * size * 0.54;
}

function safe(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Pick a meaningful word from a line to highlight (skip short stop words)
const STOP = new Set(["the","a","an","to","for","and","or","of","in","on","at","how","why","what","when","your","you","is","are","was","were","that","this","with","from","by","its","it","if","but"]);
function pickHighlightWord(line: string): string | null {
  const words = line.split(" ");
  // prefer last meaningful word that's long enough
  for (let i = words.length - 1; i >= 0; i--) {
    if (!STOP.has(words[i].toLowerCase()) && words[i].length > 3) return words[i];
  }
  return null;
}

// X offset of a word within a line
function wordOffsetX(line: string, word: string, fontSize: number, lineStartX: number): number {
  const idx = line.indexOf(word);
  if (idx < 0) return lineStartX;
  return lineStartX + approxW(line.slice(0, idx), fontSize);
}

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;
  let title = "Studojo";
  let category = "internships";

  try {
    const result = await db.execute(
      sql.raw(`SELECT title, categories FROM blog_posts WHERE slug = '${(slug ?? "").replace(/'/g, "''")}' AND status = 'published' LIMIT 1`)
    );
    if (result.rows.length > 0) {
      const row = result.rows[0] as any;
      title = row.title ?? title;
      category = (Array.isArray(row.categories) ? row.categories[0] : row.categories) ?? category;
    }
  } catch { /* fallback */ }

  const W = 1200;
  const H = 630;
  const rng = seededRandom(slug ?? title);
  const pal = getPalette(category);
  const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif`;

  // ── Title layout ──
  const fontSize = getFontSize(title);
  const charsPerLine = Math.floor(840 / (fontSize * 0.54));
  const lines = wrapTitle(title, charsPerLine);
  const lineH = fontSize * 1.3;
  const totalH = lines.length * lineH;
  const titleX = 100;
  const titleY = Math.max(145, (H - totalH) / 2 - 18);

  // Editorial index number (seeded, 01–96)
  const editNum = String(1 + Math.floor(rng() * 96)).padStart(2, "0");

  // ── Highlight boxes on title ──
  // Box A: first word of line 1 — filled primary
  const firstWord = (lines[0] ?? "").split(" ")[0] ?? "";
  const boxAW = approxW(firstWord, fontSize) + 20;
  const boxAX = titleX - 10;
  const boxAY = titleY - 6;
  const boxAH = fontSize * 1.14;

  // Box B: last meaningful word on line 2 (if exists) — accent stroke style
  const line2 = lines[1] ?? "";
  const wordB = pickHighlightWord(line2);
  const boxBW = wordB ? approxW(wordB, fontSize) + 20 : 0;
  const boxBX = wordB ? wordOffsetX(line2, wordB, fontSize, titleX) - 10 : 0;
  const boxBY = titleY + lineH - 6;
  const boxBH = fontSize * 1.14;

  // Box C (optional): last word of last line if ≥ 3 lines — outlined rotated shard
  const lastLine = lines[lines.length - 1] ?? "";
  const wordC = lines.length >= 3 ? pickHighlightWord(lastLine) : null;
  const boxCW = wordC ? approxW(wordC, fontSize) + 20 : 0;
  const boxCX = wordC ? wordOffsetX(lastLine, wordC, fontSize, titleX) - 10 : 0;
  const boxCY = titleY + (lines.length - 1) * lineH - 6;
  const boxCH = fontSize * 1.14;

  // Underline below last line
  const underlineW = Math.min(approxW(lastLine, fontSize), 860);

  // Category pill
  const pillW = pal.label.length * 9 + 40;
  const pillX = W - 80 - pillW;

  // ── Seeded scatter dots ──
  const scatterDots = Array.from({ length: 14 + Math.floor(rng() * 10) }, () => {
    const dx = (580 + rng() * 600).toFixed(0);
    const dy = (rng() * H).toFixed(0);
    const dr = (0.8 + rng() * 2.8).toFixed(1);
    const op = (0.12 + rng() * 0.30).toFixed(2);
    const fill = rng() > 0.5 ? pal.accent : "#FFFFFF";
    return `<circle cx="${dx}" cy="${dy}" r="${dr}" fill="${fill}" opacity="${op}"/>`;
  });

  // Seeded outline ring
  const ringCx = (700 + rng() * 400).toFixed(0);
  const ringCy = (rng() * H * 0.65).toFixed(0);
  const ringR  = (70 + rng() * 150).toFixed(0);
  const ringSW = (1 + rng() * 1.8).toFixed(1);
  const ringOp = (0.09 + rng() * 0.13).toFixed(2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${pal.bg}"/>
      <stop offset="100%" stop-color="${pal.bgB}"/>
    </linearGradient>
    <radialGradient id="glowR" cx="92%" cy="16%" r="58%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${pal.primary}" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="${pal.primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowL" cx="5%" cy="92%" r="50%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${pal.primaryDim}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${pal.primaryDim}" stop-opacity="0"/>
    </radialGradient>
    <!-- Title-area glow — makes title pop -->
    <radialGradient id="titleGlow" cx="40%" cy="50%" r="40%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${pal.primary}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${pal.primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="70%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.54"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="3" stitchTiles="stitch" result="n"/>
      <feColorMatrix type="saturate" values="0" in="n" result="g"/>
      <feBlend in="SourceGraphic" in2="g" mode="overlay" result="b"/>
      <feComposite in="b" in2="SourceGraphic" operator="in"/>
    </filter>
    <clipPath id="clip"><rect width="${W}" height="${H}"/></clipPath>
  </defs>

  <g clip-path="url(#clip)">

    <!-- ── BACKGROUND ── -->
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#glowR)"/>
    <rect width="${W}" height="${H}" fill="url(#glowL)"/>
    <!-- Title area warm glow -->
    <rect width="${W}" height="${H}" fill="url(#titleGlow)"/>

    <!-- ── RIGHT SIDE DECORATION ── -->
    <circle cx="1080" cy="130" r="240" fill="${pal.primary}" opacity="0.10"/>
    <circle cx="1080" cy="130" r="155" fill="${pal.primary}" opacity="0.07"/>
    <circle cx="1020" cy="430" r="175" fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.13"/>
    <circle cx="${ringCx}" cy="${ringCy}" r="${ringR}" fill="none" stroke="${pal.primary}" stroke-width="${ringSW}" opacity="${ringOp}"/>

    <!-- Structured 5×4 dot grid -->
    ${Array.from({ length: 5 }, (_, c) =>
      Array.from({ length: 4 }, (_, r) =>
        `<circle cx="${1022 + c * 26}" cy="${342 + r * 26}" r="2" fill="${pal.accent}" opacity="0.26"/>`
      ).join("\n    ")
    ).join("\n    ")}

    <!-- Scatter dots -->
    ${scatterDots.join("\n    ")}

    <!-- Tension line -->
    <line x1="680" y1="0" x2="1200" y2="${H}" stroke="${pal.primary}" stroke-width="1" opacity="0.05"/>

    <!-- ── GRAIN + VIGNETTE ── -->
    <rect width="${W}" height="${H}" fill="white" opacity="0.014" filter="url(#grain)"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>

    <!-- ── LEFT STRIPE ── -->
    <rect x="0" y="0" width="8" height="${H}" fill="${pal.primary}" opacity="0.88"/>

    <!-- ── TOP BAR ── -->
    <line x1="80" y1="84" x2="${W - 80}" y2="84" stroke="${pal.accent}" stroke-width="0.75" opacity="0.20"/>
    <!-- Wordmark -->
    <circle cx="92" cy="52" r="7" fill="${pal.primary}"/>
    <circle cx="92" cy="52" r="7" fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.55"/>
    <text x="108" y="58" font-family="${FONT}" font-size="18" font-weight="700" fill="#FFFFFF" letter-spacing="0.07em" opacity="0.92">studojo</text>
    <!-- Category pill -->
    <rect x="${pillX}" y="34" width="${pillW}" height="32" rx="7" fill="${pal.primary}" opacity="0.22"/>
    <rect x="${pillX}" y="34" width="${pillW}" height="32" rx="7" fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.70"/>
    <text x="${(pillX + pillW / 2).toFixed(0)}" y="55" font-family="${FONT}" font-size="11" font-weight="700" fill="${pal.accent}" text-anchor="middle" letter-spacing="0.11em">${pal.label}</text>

    <!-- ══════════════════════════════════
         TITLE BLOCK — enhanced
    ══════════════════════════════════ -->

    <!-- Editorial number — large faded behind title (magazine feel) -->
    <text x="${(titleX - 14).toFixed(0)}" y="${(titleY + totalH * 0.85).toFixed(0)}"
          font-family="${FONT}" font-size="220" font-weight="900"
          fill="${pal.primary}" opacity="0.055"
          letter-spacing="-0.06em">${editNum}</text>

    <!-- Outline "ghost" title — slightly offset behind, adds depth -->
    ${lines.map((line, i) => {
      const y = (titleY + i * lineH + fontSize).toFixed(0);
      const ox = (titleX + 2).toFixed(0);
      const oy = (titleY + i * lineH + fontSize + 2).toFixed(0);
      return `<text x="${ox}" y="${oy}" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="none" stroke="${pal.primary}" stroke-width="1" opacity="0.25" letter-spacing="-0.03em">${safe(line)}</text>`;
    }).join("\n    ")}

    <!-- Horizontal rule ABOVE title — brand-weight accent line -->
    <line x1="${titleX}" y1="${(titleY - 14).toFixed(0)}" x2="${(titleX + Math.min(approxW(lines[0] ?? "", fontSize) * 0.85, 700)).toFixed(0)}" y2="${(titleY - 14).toFixed(0)}"
          stroke="${pal.primary}" stroke-width="2" opacity="0.55"/>
    <!-- Small diamond cap on above line -->
    <rect x="${(titleX - 5).toFixed(0)}" y="${(titleY - 18).toFixed(0)}"
          width="8" height="8" rx="1"
          fill="${pal.primary}" opacity="0.80"
          transform="rotate(45 ${titleX} ${(titleY - 14).toFixed(0)})"/>

    <!-- Box A: first word, filled primary (brand highlight pill) -->
    <rect x="${boxAX.toFixed(0)}" y="${boxAY.toFixed(0)}"
          width="${boxAW.toFixed(0)}" height="${boxAH.toFixed(0)}"
          rx="8" fill="${pal.primary}" opacity="0.20"/>
    <rect x="${boxAX.toFixed(0)}" y="${boxAY.toFixed(0)}"
          width="${boxAW.toFixed(0)}" height="${boxAH.toFixed(0)}"
          rx="8" fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.45"/>

    ${wordB ? `
    <!-- Box B: key word on line 2, accent outline style -->
    <rect x="${boxBX.toFixed(0)}" y="${boxBY.toFixed(0)}"
          width="${boxBW.toFixed(0)}" height="${boxBH.toFixed(0)}"
          rx="6" fill="${pal.accent}" opacity="0.12"/>
    <rect x="${boxBX.toFixed(0)}" y="${boxBY.toFixed(0)}"
          width="${boxBW.toFixed(0)}" height="${boxBH.toFixed(0)}"
          rx="6" fill="none" stroke="${pal.accent}" stroke-width="1" opacity="0.55" stroke-dasharray="4 3"/>
    ` : ""}

    ${wordC ? `
    <!-- Box C: key word on last line, rotated shard (neo-brutalist accent) -->
    <rect x="${(boxCX - 2).toFixed(0)}" y="${(boxCY + 2).toFixed(0)}"
          width="${boxCW.toFixed(0)}" height="${boxCH.toFixed(0)}"
          rx="4" fill="${pal.primaryMid}" opacity="0.28"
          transform="rotate(-1.5 ${(boxCX + boxCW / 2).toFixed(0)} ${(boxCY + boxCH / 2).toFixed(0)})"/>
    ` : ""}

    <!-- Left accent bar -->
    <rect x="80" y="${(titleY - 8).toFixed(0)}"
          width="6" height="${(totalH + fontSize * 0.3).toFixed(0)}"
          rx="3" fill="${pal.primary}" opacity="0.92"/>

    <!-- Small arrow / chevron mark before first line (editorial detail) -->
    <text x="${(titleX - 18).toFixed(0)}" y="${(titleY + fontSize * 0.72).toFixed(0)}"
          font-family="${FONT}" font-size="${(fontSize * 0.38).toFixed(0)}" font-weight="700"
          fill="${pal.accent}" opacity="0.70">›</text>

    <!-- TITLE TEXT — main layer -->
    ${lines.map((line, i) => {
      const y = (titleY + i * lineH + fontSize).toFixed(0);
      return `<text x="${titleX}" y="${y}" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="#FFFFFF" letter-spacing="-0.03em">${safe(line)}</text>`;
    }).join("\n    ")}

    <!-- Thick accent underline (last line) -->
    <rect x="${titleX}" y="${(titleY + lines.length * lineH + fontSize * 0.08).toFixed(0)}"
          width="${underlineW.toFixed(0)}" height="3.5" rx="2"
          fill="${pal.primary}" opacity="0.65"/>
    <!-- Thin secondary underline offset -->
    <rect x="${titleX}" y="${(titleY + lines.length * lineH + fontSize * 0.08 + 7).toFixed(0)}"
          width="${(underlineW * 0.45).toFixed(0)}" height="1.5" rx="1"
          fill="${pal.accent}" opacity="0.40"/>

    <!-- ── BOTTOM BAR ── -->
    <line x1="80" y1="${H - 54}" x2="${W - 80}" y2="${H - 54}"
          stroke="${pal.accent}" stroke-width="0.75" opacity="0.20"/>
    <text x="96" y="${H - 26}" font-family="${FONT}" font-size="13" font-weight="500"
          fill="#6B7280" letter-spacing="0.05em">studojo.com</text>
    <text x="${W - 80}" y="${H - 26}" font-family="${FONT}" font-size="12" font-weight="500"
          fill="${pal.accent}" opacity="0.62" text-anchor="end" letter-spacing="0.06em">Work on things that matter.</text>

    <!-- Corner brackets -->
    <path d="M${W - 80} 32 L${W - 80} 56 M${W - 102} 32 L${W - 80} 32"
          stroke="${pal.accent}" stroke-width="1.5" opacity="0.35" fill="none"/>
    <path d="M80 ${H - 32} L80 ${H - 56} M80 ${H - 32} L102 ${H - 32}"
          stroke="${pal.accent}" stroke-width="1.5" opacity="0.35" fill="none"/>

  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
