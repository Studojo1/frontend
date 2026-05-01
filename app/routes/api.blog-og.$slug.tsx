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
  accent: string; accentLight: string;
  label: string;
}> = {
  internships: {
    bg: "#08041A", bgB: "#0E0828",
    primary: "#8b5cf6", primaryDim: "#3b0764",
    accent: "#c4b5fd", accentLight: "#ede9fe",
    label: "INTERNSHIP",
  },
  internship: {
    bg: "#08041A", bgB: "#0E0828",
    primary: "#8b5cf6", primaryDim: "#3b0764",
    accent: "#c4b5fd", accentLight: "#ede9fe",
    label: "INTERNSHIP",
  },
  career: {
    bg: "#021208", bgB: "#031A0C",
    primary: "#10b981", primaryDim: "#064e3b",
    accent: "#6ee7b7", accentLight: "#d1fae5",
    label: "CAREER",
  },
  careers: {
    bg: "#021208", bgB: "#031A0C",
    primary: "#10b981", primaryDim: "#064e3b",
    accent: "#6ee7b7", accentLight: "#d1fae5",
    label: "CAREER",
  },
  resume: {
    bg: "#021208", bgB: "#031A0C",
    primary: "#10b981", primaryDim: "#064e3b",
    accent: "#6ee7b7", accentLight: "#d1fae5",
    label: "RESUME",
  },
  ai: {
    bg: "#010E18", bgB: "#021824",
    primary: "#0ea5e9", primaryDim: "#0c4a6e",
    accent: "#7dd3fc", accentLight: "#e0f2fe",
    label: "AI",
  },
  tech: {
    bg: "#010E18", bgB: "#021824",
    primary: "#0ea5e9", primaryDim: "#0c4a6e",
    accent: "#7dd3fc", accentLight: "#e0f2fe",
    label: "TECH",
  },
  assignment: {
    bg: "#120A00", bgB: "#1C1000",
    primary: "#f59e0b", primaryDim: "#78350f",
    accent: "#fde68a", accentLight: "#fef9c3",
    label: "ASSIGNMENT",
  },
  assignments: {
    bg: "#120A00", bgB: "#1C1000",
    primary: "#f59e0b", primaryDim: "#78350f",
    accent: "#fde68a", accentLight: "#fef9c3",
    label: "ASSIGNMENT",
  },
  default: {
    bg: "#08041A", bgB: "#0E0828",
    primary: "#8b5cf6", primaryDim: "#3b0764",
    accent: "#c4b5fd", accentLight: "#ede9fe",
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
  if (title.length < 26) return 76;
  if (title.length < 40) return 64;
  if (title.length < 56) return 54;
  return 44;
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
  const year = new Date().getFullYear();

  // ── Title layout ──
  const fontSize = getFontSize(title);
  const charsPerLine = Math.floor(860 / (fontSize * 0.545));
  const lines = wrapTitle(title, charsPerLine);
  const lineH = fontSize * 1.28;

  // Split: first N-1 lines = white, last line = primary accent colour (reports-page style)
  const whiteLines = lines.length > 1 ? lines.slice(0, -1) : lines;
  const colourLine = lines.length > 1 ? lines[lines.length - 1] : null;

  const totalH = lines.length * lineH;
  const titleX = 96;
  // Push title into middle-upper zone with good breathing room
  const titleY = 158;

  // Filled highlight box on the first meaningful word (homepage "Get contacted." style)
  // — sits ON the first white line
  const firstLine = whiteLines[0] ?? lines[0] ?? "";
  const stopWords = new Set(["the","a","an","to","for","and","or","of","in","on","at","how","why","what","when","your","you","is","are","was","were","that","this","with","from","by","its","it","if","but"]);
  const significantWords = firstLine.split(" ").filter(w => !stopWords.has(w.toLowerCase()) && w.length > 3);
  const highlightWord = significantWords[0] ?? firstLine.split(" ")[0] ?? "";
  const hlW = approxW(highlightWord, fontSize) + 24;
  const hlX = titleX - 12;
  const hlY = titleY - 8;
  const hlH = fontSize * 1.16;

  // Underline below coloured line (or last white line if no coloured)
  const lastLineForUnderline = colourLine ?? (whiteLines[whiteLines.length - 1] ?? "");
  const underlineY = titleY + lines.length * lineH + 8;
  const underlineW = Math.min(approxW(lastLineForUnderline, fontSize), 860);

  // ── Badge ── "STUDOJO BLOG · INTERNSHIP · 2026"
  const badgeText = `STUDOJO BLOG  ·  ${pal.label}  ·  ${year}`;
  const badgeW = badgeText.length * 7.8 + 40;
  const badgeX = 88;

  // ── Meta row ── reading time + category (bottom of image, like reports page)
  const metaItems = [
    readingTime > 0 ? `${readingTime} MIN READ` : "QUICK READ",
    pal.label,
    "STUDOJO.COM",
  ];

  // ── Seeded decoration ──
  const dots = Array.from({ length: 18 + Math.floor(rng() * 12) }, () => {
    const dx = (520 + rng() * 660).toFixed(0);
    const dy = (rng() * H).toFixed(0);
    const dr = (0.7 + rng() * 2.6).toFixed(1);
    const op = (0.10 + rng() * 0.28).toFixed(2);
    const fill = rng() > 0.45 ? pal.accent : "#FFFFFF";
    return `<circle cx="${dx}" cy="${dy}" r="${dr}" fill="${fill}" opacity="${op}"/>`;
  });

  const ringCx = (720 + rng() * 360).toFixed(0);
  const ringCy = (50 + rng() * 400).toFixed(0);
  const ringR  = (60 + rng() * 140).toFixed(0);
  const ringSW = (0.8 + rng() * 1.6).toFixed(1);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${pal.bg}"/>
      <stop offset="100%" stop-color="${pal.bgB}"/>
    </linearGradient>
    <!-- Large right glow -->
    <radialGradient id="glowR" cx="90%" cy="15%" r="60%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${pal.primary}" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="${pal.primary}" stop-opacity="0"/>
    </radialGradient>
    <!-- Bottom-left glow -->
    <radialGradient id="glowL" cx="4%" cy="94%" r="48%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${pal.primaryDim}" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="${pal.primaryDim}" stop-opacity="0"/>
    </radialGradient>
    <!-- Title area warm fill -->
    <radialGradient id="titleGlow" cx="35%" cy="52%" r="45%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${pal.primary}" stop-opacity="0.09"/>
      <stop offset="100%" stop-color="${pal.primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="72%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.56"/>
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

    <!-- Background layers -->
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#glowR)"/>
    <rect width="${W}" height="${H}" fill="url(#glowL)"/>
    <rect width="${W}" height="${H}" fill="url(#titleGlow)"/>

    <!-- ── RIGHT DECORATION ── -->
    <!-- Large primary circle -->
    <circle cx="1090" cy="110" r="260" fill="${pal.primary}" opacity="0.09"/>
    <circle cx="1090" cy="110" r="170" fill="${pal.primary}" opacity="0.07"/>
    <!-- Outline rings -->
    <circle cx="1040" cy="460" r="200" fill="none" stroke="${pal.accent}" stroke-width="1.2" opacity="0.12"/>
    <circle cx="1040" cy="460" r="130" fill="none" stroke="${pal.accent}" stroke-width="0.8" opacity="0.08"/>
    <!-- Seeded per-post ring -->
    <circle cx="${ringCx}" cy="${ringCy}" r="${ringR}" fill="none" stroke="${pal.primary}" stroke-width="${ringSW}" opacity="0.10"/>
    <!-- 5×4 dot grid -->
    ${Array.from({ length: 5 }, (_, c) =>
      Array.from({ length: 4 }, (_, r) =>
        `<circle cx="${1030 + c * 24}" cy="${330 + r * 24}" r="1.8" fill="${pal.accent}" opacity="0.24"/>`
      ).join("\n    ")
    ).join("\n    ")}
    <!-- Scatter -->
    ${dots.join("\n    ")}
    <!-- Diagonal line -->
    <line x1="660" y1="0" x2="1200" y2="${H}" stroke="${pal.primary}" stroke-width="0.8" opacity="0.05"/>

    <!-- Grain + vignette -->
    <rect width="${W}" height="${H}" fill="white" opacity="0.013" filter="url(#grain)"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>

    <!-- ══ LEFT STRIPE ══ -->
    <rect x="0" y="0" width="8" height="${H}" fill="${pal.primary}" opacity="0.90"/>

    <!-- ══ TOP ZONE ══ -->

    <!-- Badge: "STUDOJO BLOG · INTERNSHIP · 2026" — styled like the reports research badge -->
    <rect x="${badgeX}" y="28" width="${badgeW.toFixed(0)}" height="32" rx="16"
          fill="${pal.primary}" opacity="0.18"/>
    <rect x="${badgeX}" y="28" width="${badgeW.toFixed(0)}" height="32" rx="16"
          fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.60"/>
    <text x="${(badgeX + badgeW / 2).toFixed(0)}" y="49"
          font-family="${FONT}" font-size="10.5" font-weight="700"
          fill="${pal.accent}" text-anchor="middle" letter-spacing="0.12em">${badgeText}</text>

    <!-- Breadcrumb: "Blog › Category" — small, subtle, like reports page -->
    <text x="${badgeX}" y="86"
          font-family="${FONT}" font-size="12" font-weight="500"
          fill="${pal.primary}" opacity="0.75" letter-spacing="0.03em">Blog</text>
    <text x="${(badgeX + 28).toFixed(0)}" y="86"
          font-family="${FONT}" font-size="12" font-weight="400"
          fill="${pal.accent}" opacity="0.40">›</text>
    <text x="${(badgeX + 40).toFixed(0)}" y="86"
          font-family="${FONT}" font-size="12" font-weight="400"
          fill="#6B7280" letter-spacing="0.02em">${safe(pal.label.charAt(0) + pal.label.slice(1).toLowerCase())}</text>

    <!-- Separator line -->
    <line x1="80" y1="100" x2="${W - 80}" y2="100"
          stroke="${pal.accent}" stroke-width="0.75" opacity="0.18"/>

    <!-- ══ TITLE BLOCK ══ -->

    <!-- Filled highlight box on first significant word (homepage "Get contacted." style) -->
    <rect x="${hlX.toFixed(0)}" y="${hlY.toFixed(0)}"
          width="${hlW.toFixed(0)}" height="${hlH.toFixed(0)}"
          rx="10" fill="${pal.primary}" opacity="0.28"/>
    <rect x="${hlX.toFixed(0)}" y="${hlY.toFixed(0)}"
          width="${hlW.toFixed(0)}" height="${hlH.toFixed(0)}"
          rx="10" fill="none" stroke="${pal.accent}" stroke-width="2" opacity="0.55"/>

    <!-- Left accent bar spanning full title height -->
    <rect x="80" y="${(titleY - 10).toFixed(0)}"
          width="6" height="${(totalH + 16).toFixed(0)}"
          rx="3" fill="${pal.primary}" opacity="0.92"/>

    <!-- WHITE lines of title -->
    ${whiteLines.map((line, i) => {
      const y = (titleY + i * lineH + fontSize).toFixed(0);
      return `<text x="${titleX}" y="${y}" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="#FFFFFF" letter-spacing="-0.03em">${safe(line)}</text>`;
    }).join("\n    ")}

    ${colourLine ? `
    <!-- ACCENT-COLOURED last line — reports-page two-tone title effect -->
    <text x="${titleX}" y="${(titleY + (lines.length - 1) * lineH + fontSize).toFixed(0)}"
          font-family="${FONT}" font-size="${fontSize}" font-weight="800"
          fill="${pal.primary}" letter-spacing="-0.03em">${safe(colourLine)}</text>
    ` : ""}

    <!-- Double underline under title -->
    <rect x="${titleX}" y="${underlineY.toFixed(0)}"
          width="${underlineW.toFixed(0)}" height="3" rx="1.5"
          fill="${pal.primary}" opacity="0.70"/>
    <rect x="${titleX}" y="${(underlineY + 7).toFixed(0)}"
          width="${(underlineW * 0.4).toFixed(0)}" height="1.5" rx="1"
          fill="${pal.accent}" opacity="0.38"/>

    <!-- ══ BOTTOM META ROW ══ (reports-page metadata style) -->
    <line x1="80" y1="${H - 80}" x2="${W - 80}" y2="${H - 80}"
          stroke="${pal.accent}" stroke-width="0.75" opacity="0.20"/>

    <!-- Meta items with label/value style -->
    ${metaItems.map((item, i) => {
      const mx = 96 + i * 220;
      return `<text x="${mx}" y="${H - 52}" font-family="${FONT}" font-size="9" font-weight="700" fill="${pal.primary}" opacity="0.60" letter-spacing="0.12em">${safe(item)}</text>`;
    }).join("\n    ")}

    <!-- Wordmark bottom-right -->
    <circle cx="${W - 104}" cy="${H - 52}" r="5" fill="${pal.primary}" opacity="0.8"/>
    <text x="${W - 96}" y="${H - 47}"
          font-family="${FONT}" font-size="13" font-weight="700"
          fill="#FFFFFF" opacity="0.50" letter-spacing="0.06em">studojo</text>

    <!-- Tagline -->
    <text x="96" y="${H - 26}"
          font-family="${FONT}" font-size="12" font-weight="400"
          fill="#6B7280" letter-spacing="0.04em">Work on things that matter.</text>

    <!-- Corner brackets — neo-brutalist detail -->
    <path d="M${W - 80} 24 L${W - 80} 50 M${W - 104} 24 L${W - 80} 24"
          stroke="${pal.accent}" stroke-width="1.5" opacity="0.30" fill="none"/>
    <path d="M80 ${H - 24} L80 ${H - 50} M80 ${H - 24} L104 ${H - 24}"
          stroke="${pal.accent}" stroke-width="1.5" opacity="0.30" fill="none"/>

  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
