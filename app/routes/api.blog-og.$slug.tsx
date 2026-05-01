import type { Route } from "./+types/api.blog-og.$slug";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

// Deterministic per-slug randomness — same slug = same image every time
function seededRandom(slug: string) {
  let seed = 5381;
  for (const c of slug) seed = (((seed * 33) ^ c.charCodeAt(0)) >>> 0);
  return () => {
    seed = (((seed * 1664525) + 1013904223) >>> 0);
    return seed / 0xffffffff;
  };
}

// Exact Studojo brand palette per dojo/category
const PALETTES: Record<string, {
  bg: string; bgB: string;
  primary: string; primaryMid: string; primaryDim: string;
  accent: string;
  label: string;
}> = {
  internships: {
    bg: "#0A0614", bgB: "#100A22",
    primary: "#8b5cf6", primaryMid: "#6d28d9", primaryDim: "#3b0764",
    accent: "#dab2ff",
    label: "INTERNSHIP",
  },
  internship: {
    bg: "#0A0614", bgB: "#100A22",
    primary: "#8b5cf6", primaryMid: "#6d28d9", primaryDim: "#3b0764",
    accent: "#dab2ff",
    label: "INTERNSHIP",
  },
  career: {
    bg: "#021008", bgB: "#041A0E",
    primary: "#10b981", primaryMid: "#059669", primaryDim: "#064e3b",
    accent: "#6ee7b7",
    label: "CAREER",
  },
  careers: {
    bg: "#021008", bgB: "#041A0E",
    primary: "#10b981", primaryMid: "#059669", primaryDim: "#064e3b",
    accent: "#6ee7b7",
    label: "CAREER",
  },
  resume: {
    bg: "#021008", bgB: "#041A0E",
    primary: "#10b981", primaryMid: "#059669", primaryDim: "#064e3b",
    accent: "#6ee7b7",
    label: "RESUME",
  },
  ai: {
    bg: "#010C14", bgB: "#021520",
    primary: "#0ea5e9", primaryMid: "#0284c7", primaryDim: "#0c4a6e",
    accent: "#7dd3fc",
    label: "AI",
  },
  tech: {
    bg: "#010C14", bgB: "#021520",
    primary: "#0ea5e9", primaryMid: "#0284c7", primaryDim: "#0c4a6e",
    accent: "#7dd3fc",
    label: "TECH",
  },
  assignment: {
    bg: "#100800", bgB: "#1A1000",
    primary: "#f59e0b", primaryMid: "#d97706", primaryDim: "#78350f",
    accent: "#fde68a",
    label: "ASSIGNMENT",
  },
  assignments: {
    bg: "#100800", bgB: "#1A1000",
    primary: "#f59e0b", primaryMid: "#d97706", primaryDim: "#78350f",
    accent: "#fde68a",
    label: "ASSIGNMENT",
  },
  default: {
    bg: "#0A0614", bgB: "#100A22",
    primary: "#8b5cf6", primaryMid: "#6d28d9", primaryDim: "#3b0764",
    accent: "#dab2ff",
    label: "BLOG",
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

// Approx pixel width of a string in the heading font
function approxTextWidth(text: string, size: number): number {
  return text.length * size * 0.54;
}

function safe(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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

  // Title layout
  const fontSize = getFontSize(title);
  const charsPerLine = Math.floor(840 / (fontSize * 0.54));
  const lines = wrapTitle(title, charsPerLine);
  const lineH = fontSize * 1.3;
  const totalH = lines.length * lineH;
  const titleX = 96;
  const titleY = Math.max(148, (H - totalH) / 2 - 20);

  // First-word highlight box (brand signature highlight pill)
  const firstLine = lines[0] ?? "";
  const firstWord = firstLine.split(" ")[0] ?? "";
  const highlightW = approxTextWidth(firstWord, fontSize) + 16;
  const highlightX = titleX - 8;
  const highlightY = titleY - 4;
  const highlightH = fontSize * 1.14;

  // Accent underline width (under last line)
  const lastLine = lines[lines.length - 1] ?? "";
  const underlineW = Math.min(approxTextWidth(lastLine, fontSize), 860);

  // Category pill
  const pillW = pal.label.length * 9 + 40;
  const pillX = W - 80 - pillW;

  // ─── Seeded scatter dots (small, right-biased) ───
  const scatterDots: string[] = [];
  const numDots = 14 + Math.floor(rng() * 10);
  for (let i = 0; i < numDots; i++) {
    const dx = (600 + rng() * 580).toFixed(0);
    const dy = (rng() * H).toFixed(0);
    const dr = (0.8 + rng() * 2.6).toFixed(1);
    const op = (0.14 + rng() * 0.32).toFixed(2);
    const fill = rng() > 0.55 ? pal.accent : "#FFFFFF";
    scatterDots.push(`<circle cx="${dx}" cy="${dy}" r="${dr}" fill="${fill}" opacity="${op}"/>`);
  }

  // ─── Seeded outline ring (per-post variation) ───
  const ringCx = (720 + rng() * 380).toFixed(0);
  const ringCy = (rng() * H * 0.7).toFixed(0);
  const ringR  = (80 + rng() * 160).toFixed(0);
  const ringSW = (1 + rng() * 1.5).toFixed(1);
  const ringOp = (0.10 + rng() * 0.12).toFixed(2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>

    <!-- Background gradient -->
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${pal.bg}"/>
      <stop offset="100%" stop-color="${pal.bgB}"/>
    </linearGradient>

    <!-- Right glow — primary hue -->
    <radialGradient id="glowR" cx="92%" cy="18%" r="58%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${pal.primary}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${pal.primary}" stop-opacity="0"/>
    </radialGradient>

    <!-- Bottom-left glow — deeper hue -->
    <radialGradient id="glowL" cx="5%" cy="90%" r="50%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${pal.primaryDim}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${pal.primaryDim}" stop-opacity="0"/>
    </radialGradient>

    <!-- Vignette -->
    <radialGradient id="vig" cx="50%" cy="50%" r="70%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.52"/>
    </radialGradient>

    <!-- Film grain -->
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="3" stitchTiles="stitch" result="n"/>
      <feColorMatrix type="saturate" values="0" in="n" result="g"/>
      <feBlend in="SourceGraphic" in2="g" mode="overlay" result="b"/>
      <feComposite in="b" in2="SourceGraphic" operator="in"/>
    </filter>

    <!-- Clip to canvas -->
    <clipPath id="clip"><rect width="${W}" height="${H}"/></clipPath>
  </defs>

  <g clip-path="url(#clip)">

    <!-- ── BACKGROUND ── -->
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#glowR)"/>
    <rect width="${W}" height="${H}" fill="url(#glowL)"/>

    <!-- ── LARGE DECORATION — right side ── -->

    <!-- Big filled circle (anchored top-right) -->
    <circle cx="1080" cy="140" r="240" fill="${pal.primary}" opacity="0.11"/>
    <circle cx="1080" cy="140" r="160" fill="${pal.primary}" opacity="0.08"/>

    <!-- Outline ring, large (overlaps big circle) -->
    <circle cx="1020" cy="420" r="180" fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.14"/>

    <!-- Seeded per-post outline ring -->
    <circle cx="${ringCx}" cy="${ringCy}" r="${ringR}" fill="none" stroke="${pal.primary}" stroke-width="${ringSW}" opacity="${ringOp}"/>

    <!-- Structured grid dot cluster — 5 × 4, right zone -->
    ${Array.from({ length: 5 }, (_, col) =>
      Array.from({ length: 4 }, (_, row) => {
        const gx = 1020 + col * 26;
        const gy = 340 + row * 26;
        return `<circle cx="${gx}" cy="${gy}" r="2" fill="${pal.accent}" opacity="0.28"/>`;
      }).join("\n    ")
    ).join("\n    ")}

    <!-- Scatter dots (seeded) -->
    ${scatterDots.join("\n    ")}

    <!-- Thin diagonal tension line -->
    <line x1="700" y1="0" x2="1200" y2="${H}" stroke="${pal.primary}" stroke-width="1" opacity="0.06"/>

    <!-- ── GRAIN + VIGNETTE ── -->
    <rect width="${W}" height="${H}" fill="white" opacity="0.015" filter="url(#grain)"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>

    <!-- ── LEFT COLOR STRIPE — neo-brutalist dojo spine ── -->
    <rect x="0" y="0" width="8" height="${H}" fill="${pal.primary}" opacity="0.85"/>

    <!-- ── TOP BAR ── -->
    <line x1="80" y1="84" x2="${W - 80}" y2="84" stroke="${pal.accent}" stroke-width="0.75" opacity="0.20"/>

    <!-- Wordmark — dot + logotype (matches brand header style) -->
    <circle cx="92" cy="52" r="7" fill="${pal.primary}"/>
    <circle cx="92" cy="52" r="7" fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.55"/>
    <text x="108" y="58" font-family="${FONT}" font-size="18" font-weight="700" fill="#FFFFFF" letter-spacing="0.07em" opacity="0.92">studojo</text>

    <!-- Category pill — filled primary, accent border, bold label -->
    <rect x="${pillX}" y="34" width="${pillW}" height="32" rx="7"
          fill="${pal.primary}" opacity="0.22"/>
    <rect x="${pillX}" y="34" width="${pillW}" height="32" rx="7"
          fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.70"/>
    <text x="${(pillX + pillW / 2).toFixed(0)}" y="55"
          font-family="${FONT}" font-size="11" font-weight="700"
          fill="${pal.accent}" text-anchor="middle" letter-spacing="0.11em">${pal.label}</text>

    <!-- ── TITLE BLOCK ── -->

    <!-- Highlight box on first word (Studojo brand highlight pattern) -->
    <rect x="${highlightX}" y="${highlightY.toFixed(0)}"
          width="${highlightW.toFixed(0)}" height="${highlightH.toFixed(0)}"
          rx="8" fill="${pal.primary}" opacity="0.18"/>
    <rect x="${highlightX}" y="${highlightY.toFixed(0)}"
          width="${highlightW.toFixed(0)}" height="${highlightH.toFixed(0)}"
          rx="8" fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.40"/>

    <!-- Accent bar — brand spine on title (neo-brutalist left edge) -->
    <rect x="80" y="${(titleY - 6).toFixed(0)}"
          width="6" height="${(totalH + fontSize * 0.3).toFixed(0)}"
          rx="3" fill="${pal.primary}" opacity="0.90"/>

    <!-- Title lines -->
    ${lines.map((line, i) => {
      const y = (titleY + i * lineH + fontSize).toFixed(0);
      return `<text x="${titleX}" y="${y}" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="#FFFFFF" letter-spacing="-0.03em">${safe(line)}</text>`;
    }).join("\n    ")}

    <!-- Accent underline (last title line) -->
    <rect x="${titleX}" y="${(titleY + lines.length * lineH + fontSize * 0.1).toFixed(0)}"
          width="${underlineW.toFixed(0)}" height="3" rx="1.5"
          fill="${pal.primary}" opacity="0.60"/>

    <!-- ── BOTTOM BAR ── -->
    <line x1="80" y1="${H - 54}" x2="${W - 80}" y2="${H - 54}"
          stroke="${pal.accent}" stroke-width="0.75" opacity="0.20"/>

    <!-- Domain -->
    <text x="96" y="${H - 26}"
          font-family="${FONT}" font-size="13" font-weight="500"
          fill="#6B7280" letter-spacing="0.05em">studojo.com</text>

    <!-- Tagline — always present, brand signature -->
    <text x="${W - 80}" y="${H - 26}"
          font-family="${FONT}" font-size="12" font-weight="500"
          fill="${pal.accent}" opacity="0.62"
          text-anchor="end" letter-spacing="0.06em">Work on things that matter.</text>

    <!-- Corner brackets (neo-brutalist detail) — top-right & bottom-left -->
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
