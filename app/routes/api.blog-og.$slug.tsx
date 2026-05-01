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
  primary: string; primaryDim: string;
  accent: string;
  label: string;
}> = {
  internships: { bg: "#08041A", bgB: "#0D0825", primary: "#8b5cf6", primaryDim: "#3b0764", accent: "#c4b5fd", label: "INTERNSHIP" },
  internship:  { bg: "#08041A", bgB: "#0D0825", primary: "#8b5cf6", primaryDim: "#3b0764", accent: "#c4b5fd", label: "INTERNSHIP" },
  career:      { bg: "#021208", bgB: "#031A0C", primary: "#10b981", primaryDim: "#064e3b", accent: "#6ee7b7", label: "CAREER" },
  careers:     { bg: "#021208", bgB: "#031A0C", primary: "#10b981", primaryDim: "#064e3b", accent: "#6ee7b7", label: "CAREER" },
  resume:      { bg: "#021208", bgB: "#031A0C", primary: "#10b981", primaryDim: "#064e3b", accent: "#6ee7b7", label: "RESUME" },
  ai:          { bg: "#010E18", bgB: "#021824", primary: "#0ea5e9", primaryDim: "#0c4a6e", accent: "#7dd3fc", label: "AI" },
  tech:        { bg: "#010E18", bgB: "#021824", primary: "#0ea5e9", primaryDim: "#0c4a6e", accent: "#7dd3fc", label: "TECH" },
  assignment:  { bg: "#120A00", bgB: "#1C1000", primary: "#f59e0b", primaryDim: "#78350f", accent: "#fde68a", label: "ASSIGNMENT" },
  assignments: { bg: "#120A00", bgB: "#1C1000", primary: "#f59e0b", primaryDim: "#78350f", accent: "#fde68a", label: "ASSIGNMENT" },
  default:     { bg: "#08041A", bgB: "#0D0825", primary: "#8b5cf6", primaryDim: "#3b0764", accent: "#c4b5fd", label: "BLOG" },
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
  return lines.slice(0, 3); // max 3 lines for breathing room
}

function getFontSize(title: string): number {
  if (title.length < 24) return 78;
  if (title.length < 38) return 66;
  if (title.length < 52) return 56;
  if (title.length < 68) return 48;
  return 42;
}

function approxW(text: string, size: number): number {
  return text.length * size * 0.545;
}

function safe(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;
  let title = "Studojo";
  let category = "internships";
  let readingTime = 0;

  try {
    const result = await db.execute(
      sql.raw(`SELECT title, categories, reading_time FROM blog_posts WHERE slug = '${(slug ?? "").replace(/'/g, "''")}' AND status = 'published' LIMIT 1`)
    );
    if (result.rows.length > 0) {
      const row = result.rows[0] as any;
      title = row.title ?? title;
      category = (Array.isArray(row.categories) ? row.categories[0] : row.categories) ?? category;
      readingTime = Number(row.reading_time) || 0;
    }
  } catch { /* fallback */ }

  const W = 1200;
  const H = 630;
  const rng = seededRandom(slug ?? title);
  const pal = getPalette(category);
  const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif`;

  // ── Typography ──
  const fontSize = getFontSize(title);
  const lineH = fontSize * 1.30;
  const charsPerLine = Math.floor(860 / (fontSize * 0.545));
  const lines = wrapTitle(title, charsPerLine);
  const totalTitleH = lines.length * lineH;

  // ── Vertical centering ──
  // Safe zone: top reserved = 110px (badge area), bottom reserved = 100px (meta row)
  // Center title block in remaining space
  const SAFE_TOP = 110;
  const SAFE_BOTTOM = H - 100;
  const centerY = (SAFE_TOP + SAFE_BOTTOM) / 2;
  const titleY = centerY - totalTitleH / 2;

  // ── Two-tone split: white lines / coloured last line ──
  const whiteLines = lines.length > 1 ? lines.slice(0, -1) : lines;
  const colourLine = lines.length > 1 ? lines[lines.length - 1] : null;

  // ── Underline ──
  const lastLine = colourLine ?? lines[lines.length - 1] ?? "";
  const underlineY = titleY + lines.length * lineH + 10;
  const underlineW = Math.min(approxW(lastLine, fontSize), 860);

  // ── Badge: "INTERNSHIP  ·  5 MIN READ" ──
  const readLabel = readingTime > 0 ? `${readingTime} MIN READ` : "STUDOJO BLOG";
  const badgeText = `${pal.label}  ·  ${readLabel}`;
  const badgeW = badgeText.length * 7.6 + 44;

  // ── Decoration (seeded, right-biased) ──
  const dots = Array.from({ length: 20 + Math.floor(rng() * 12) }, () => {
    const dx = (500 + rng() * 680).toFixed(0);
    const dy = (rng() * H).toFixed(0);
    const dr = (0.6 + rng() * 2.8).toFixed(1);
    const op = (0.10 + rng() * 0.26).toFixed(2);
    const fill = rng() > 0.45 ? pal.accent : "#FFFFFF";
    return `<circle cx="${dx}" cy="${dy}" r="${dr}" fill="${fill}" opacity="${op}"/>`;
  });
  const ringCx = (700 + rng() * 380).toFixed(0);
  const ringCy = (40 + rng() * 420).toFixed(0);
  const ringR  = (55 + rng() * 130).toFixed(0);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${pal.bg}"/>
      <stop offset="100%" stop-color="${pal.bgB}"/>
    </linearGradient>
    <radialGradient id="gR" cx="88%" cy="14%" r="58%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${pal.primary}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${pal.primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="gL" cx="4%" cy="92%" r="50%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${pal.primaryDim}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${pal.primaryDim}" stop-opacity="0"/>
    </radialGradient>
    <!-- Centre glow — makes title pop -->
    <radialGradient id="gC" cx="38%" cy="50%" r="42%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${pal.primary}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${pal.primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="72%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.58"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" result="n"/>
      <feColorMatrix type="saturate" values="0" in="n" result="g"/>
      <feBlend in="SourceGraphic" in2="g" mode="overlay" result="b"/>
      <feComposite in="b" in2="SourceGraphic" operator="in"/>
    </filter>
    <clipPath id="clip"><rect width="${W}" height="${H}"/></clipPath>
  </defs>

  <g clip-path="url(#clip)">

    <!-- Background -->
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#gR)"/>
    <rect width="${W}" height="${H}" fill="url(#gL)"/>
    <rect width="${W}" height="${H}" fill="url(#gC)"/>

    <!-- Right decoration: two large circles -->
    <circle cx="1100" cy="120" r="280" fill="${pal.primary}" opacity="0.08"/>
    <circle cx="1100" cy="120" r="180" fill="${pal.primary}" opacity="0.06"/>
    <!-- Outline rings -->
    <circle cx="1050" cy="480" r="220" fill="none" stroke="${pal.accent}" stroke-width="1.2" opacity="0.11"/>
    <circle cx="1050" cy="480" r="140" fill="none" stroke="${pal.accent}" stroke-width="0.8" opacity="0.07"/>
    <!-- Seeded ring -->
    <circle cx="${ringCx}" cy="${ringCy}" r="${ringR}" fill="none" stroke="${pal.primary}" stroke-width="1" opacity="0.09"/>
    <!-- 5×4 dot grid -->
    ${Array.from({ length: 5 }, (_, c) =>
      Array.from({ length: 4 }, (_, r) =>
        `<circle cx="${1040 + c * 24}" cy="${320 + r * 24}" r="1.8" fill="${pal.accent}" opacity="0.22"/>`
      ).join("\n    ")
    ).join("\n    ")}
    <!-- Scatter dots -->
    ${dots.join("\n    ")}
    <!-- Diagonal tension line -->
    <line x1="640" y1="0" x2="1200" y2="${H}" stroke="${pal.primary}" stroke-width="0.8" opacity="0.05"/>

    <!-- Grain + vignette -->
    <rect width="${W}" height="${H}" fill="white" opacity="0.012" filter="url(#grain)"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>

    <!-- ══ LEFT STRIPE ══ -->
    <rect x="0" y="0" width="8" height="${H}" fill="${pal.primary}" opacity="0.92"/>

    <!-- ══ TOP BAR ══ -->
    <!-- Wordmark: dot + text -->
    <circle cx="92" cy="52" r="7" fill="${pal.primary}"/>
    <circle cx="92" cy="52" r="7" fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.50"/>
    <text x="108" y="58" font-family="${FONT}" font-size="17" font-weight="700"
          fill="#FFFFFF" letter-spacing="0.07em" opacity="0.90">studojo</text>

    <!-- Badge: category + read time, top-right -->
    <rect x="${(W - 80 - badgeW).toFixed(0)}" y="34" width="${badgeW.toFixed(0)}" height="30" rx="15"
          fill="${pal.primary}" opacity="0.20"/>
    <rect x="${(W - 80 - badgeW).toFixed(0)}" y="34" width="${badgeW.toFixed(0)}" height="30" rx="15"
          fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.65"/>
    <text x="${(W - 80 - badgeW / 2).toFixed(0)}" y="54"
          font-family="${FONT}" font-size="10.5" font-weight="700"
          fill="${pal.accent}" text-anchor="middle" letter-spacing="0.10em">${badgeText}</text>

    <!-- Top separator -->
    <line x1="80" y1="96" x2="${W - 80}" y2="96"
          stroke="${pal.accent}" stroke-width="0.75" opacity="0.18"/>

    <!-- ══ TITLE BLOCK — vertically centred ══ -->

    <!-- Left accent bar spanning full title -->
    <rect x="80" y="${(titleY - 8).toFixed(0)}" width="5" height="${(totalTitleH + 20).toFixed(0)}"
          rx="2.5" fill="${pal.primary}" opacity="0.90"/>

    <!-- White lines -->
    ${whiteLines.map((line, i) => {
      const y = (titleY + i * lineH + fontSize).toFixed(0);
      return `<text x="104" y="${y}" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="#FFFFFF" letter-spacing="-0.03em">${safe(line)}</text>`;
    }).join("\n    ")}

    ${colourLine ? `
    <!-- Accent-coloured last line — two-tone title (reports-page style) -->
    <text x="104" y="${(titleY + (lines.length - 1) * lineH + fontSize).toFixed(0)}"
          font-family="${FONT}" font-size="${fontSize}" font-weight="800"
          fill="${pal.primary}" letter-spacing="-0.03em">${safe(colourLine)}</text>
    ` : ""}

    <!-- Underline under last line -->
    <rect x="104" y="${underlineY.toFixed(0)}"
          width="${underlineW.toFixed(0)}" height="3" rx="1.5"
          fill="${pal.primary}" opacity="0.65"/>
    <rect x="104" y="${(underlineY + 8).toFixed(0)}"
          width="${(underlineW * 0.38).toFixed(0)}" height="1.5" rx="1"
          fill="${pal.accent}" opacity="0.35"/>

    <!-- ══ BOTTOM BAR ══ -->
    <line x1="80" y1="${H - 68}" x2="${W - 80}" y2="${H - 68}"
          stroke="${pal.accent}" stroke-width="0.75" opacity="0.18"/>

    <!-- Meta items -->
    <text x="104" y="${H - 40}"
          font-family="${FONT}" font-size="11" font-weight="600"
          fill="${pal.primary}" opacity="0.70" letter-spacing="0.10em">${readingTime > 0 ? readingTime + " MIN READ" : "STUDOJO BLOG"}</text>
    <text x="104" y="${H - 22}"
          font-family="${FONT}" font-size="12" font-weight="400"
          fill="#6B7280" letter-spacing="0.04em">Work on things that matter.</text>

    <!-- Tagline right -->
    <text x="${W - 80}" y="${H - 28}"
          font-family="${FONT}" font-size="13" font-weight="500"
          fill="#FFFFFF" opacity="0.35" text-anchor="end" letter-spacing="0.05em">studojo.com</text>

    <!-- Corner brackets -->
    <path d="M${W - 80} 24 L${W - 80} 48 M${W - 102} 24 L${W - 80} 24"
          stroke="${pal.accent}" stroke-width="1.5" opacity="0.28" fill="none"/>
    <path d="M80 ${H - 24} L80 ${H - 48} M80 ${H - 24} L102 ${H - 24}"
          stroke="${pal.accent}" stroke-width="1.5" opacity="0.28" fill="none"/>

  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
