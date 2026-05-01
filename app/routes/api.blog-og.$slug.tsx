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

// Brand-accurate palette per category — matches Studojo dojo color system
const PALETTES: Record<string, {
  bg: string; bgB: string;
  primary: string; primaryDim: string;
  accent: string; accentDim: string;
  label: string;
}> = {
  internships: {
    bg: "#0D0920", bgB: "#130C2E",
    primary: "#8b5cf6", primaryDim: "#4c1d95",
    accent: "#c4b5fd", accentDim: "#6d28d9",
    label: "INTERNSHIP",
  },
  internship: {
    bg: "#0D0920", bgB: "#130C2E",
    primary: "#8b5cf6", primaryDim: "#4c1d95",
    accent: "#c4b5fd", accentDim: "#6d28d9",
    label: "INTERNSHIP",
  },
  career: {
    bg: "#051A10", bgB: "#082318",
    primary: "#10b981", primaryDim: "#064e3b",
    accent: "#6ee7b7", accentDim: "#065f46",
    label: "CAREER",
  },
  careers: {
    bg: "#051A10", bgB: "#082318",
    primary: "#10b981", primaryDim: "#064e3b",
    accent: "#6ee7b7", accentDim: "#065f46",
    label: "CAREER",
  },
  resume: {
    bg: "#051A10", bgB: "#082318",
    primary: "#10b981", primaryDim: "#064e3b",
    accent: "#6ee7b7", accentDim: "#065f46",
    label: "RESUME",
  },
  ai: {
    bg: "#021520", bgB: "#041D2C",
    primary: "#0ea5e9", primaryDim: "#0369a1",
    accent: "#7dd3fc", accentDim: "#0284c7",
    label: "AI",
  },
  tech: {
    bg: "#021520", bgB: "#041D2C",
    primary: "#0ea5e9", primaryDim: "#0369a1",
    accent: "#7dd3fc", accentDim: "#0284c7",
    label: "TECH",
  },
  assignment: {
    bg: "#1A1000", bgB: "#231500",
    primary: "#f59e0b", primaryDim: "#92400e",
    accent: "#fcd34d", accentDim: "#b45309",
    label: "ASSIGNMENT",
  },
  assignments: {
    bg: "#1A1000", bgB: "#231500",
    primary: "#f59e0b", primaryDim: "#92400e",
    accent: "#fcd34d", accentDim: "#b45309",
    label: "ASSIGNMENT",
  },
  default: {
    bg: "#0D0920", bgB: "#130C2E",
    primary: "#8b5cf6", primaryDim: "#4c1d95",
    accent: "#c4b5fd", accentDim: "#6d28d9",
    label: "STUDOJO",
  },
};

function getPalette(category: string) {
  return PALETTES[category.toLowerCase()] ?? PALETTES.default;
}

function wrapTitle(title: string, maxCharsPerLine: number): string[] {
  const words = title.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (test.length <= maxCharsPerLine) { cur = test; }
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

function getFontSize(title: string) {
  if (title.length < 28) return 72;
  if (title.length < 44) return 60;
  if (title.length < 62) return 50;
  return 40;
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

  const fontSize = getFontSize(title);
  const charsPerLine = Math.floor(820 / (fontSize * 0.54));
  const lines = wrapTitle(title, charsPerLine);
  const lineH = fontSize * 1.25;
  const totalTitleH = lines.length * lineH;

  // Content block starts at a fixed Y — centred vertically with slight upward bias
  const blockY = Math.max(140, (H - totalTitleH) / 2 - 40);

  // --- Decorative geometry (seeded, brand-aligned) ---
  const shapes: string[] = [];

  // 1. Large filled circle — primary colour, blurred feel via opacity layers
  const cxA = 820 + rng() * 280;
  const cyA = -40 + rng() * 260;
  const rA = 160 + rng() * 180;
  shapes.push(`<circle cx="${cxA}" cy="${cyA}" r="${rA}" fill="${pal.primary}" opacity="0.13"/>`);
  shapes.push(`<circle cx="${cxA}" cy="${cyA}" r="${rA * 0.6}" fill="${pal.primary}" opacity="0.10"/>`);

  // 2. Bottom-left accent blob
  const cxB = -60 + rng() * 200;
  const cyB = 380 + rng() * 220;
  const rB = 120 + rng() * 160;
  shapes.push(`<circle cx="${cxB}" cy="${cyB}" r="${rB}" fill="${pal.primaryDim}" opacity="0.22"/>`);

  // 3. Outline ring — gives depth
  const cxC = 400 + rng() * 500;
  const cyC = -60 + rng() * 500;
  const rC = 100 + rng() * 240;
  const strokeW = (1.2 + rng() * 1.8).toFixed(1);
  shapes.push(`<circle cx="${cxC}" cy="${cyC}" r="${rC}" fill="none" stroke="${pal.accent}" stroke-width="${strokeW}" opacity="${(0.12 + rng() * 0.14).toFixed(2)}"/>`);

  // 4. Rotated rectangle — neo-brutalist shard
  const rx = 200 + rng() * 600;
  const ry = 40 + rng() * 420;
  const rw = 180 + rng() * 320;
  const rh = 60 + rng() * 160;
  const angle = -40 + rng() * 80;
  shapes.push(`<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="4" fill="${pal.accent}" opacity="${(0.04 + rng() * 0.05).toFixed(2)}" transform="rotate(${angle.toFixed(1)} ${(rx + rw / 2).toFixed(0)} ${(ry + rh / 2).toFixed(0)})"/>`);

  // 5. Hard-shadow accent square (neo-brutalist) — only on right side
  const sqX = 900 + rng() * 200;
  const sqY = 300 + rng() * 200;
  const sqS = 28 + rng() * 36;
  const sqAngle = -45 + rng() * 90;
  shapes.push(`<rect x="${sqX}" y="${sqY}" width="${sqS}" height="${sqS}" fill="none" stroke="${pal.accent}" stroke-width="2" opacity="0.5" transform="rotate(${sqAngle.toFixed(1)} ${(sqX + sqS / 2).toFixed(0)} ${(sqY + sqS / 2).toFixed(0)})"/>`);

  // 6. Grid dot field — right quadrant, brand-accurate feel
  const dotCols = 6;
  const dotRows = 4;
  const dotSpacing = 28;
  const dotOriginX = W - 72 - dotCols * dotSpacing;
  const dotOriginY = H / 2 - (dotRows * dotSpacing) / 2;
  for (let col = 0; col < dotCols; col++) {
    for (let row = 0; row < dotRows; row++) {
      const dx = dotOriginX + col * dotSpacing;
      const dy = dotOriginY + row * dotSpacing;
      const opacity = (0.12 + rng() * 0.28).toFixed(2);
      const r = (1.2 + rng() * 1.8).toFixed(1);
      shapes.push(`<circle cx="${dx}" cy="${dy}" r="${r}" fill="${pal.accent}" opacity="${opacity}"/>`);
    }
  }

  // 7. Thin diagonal lines — subtle tension
  const numLines = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < numLines; i++) {
    const lx1 = 600 + rng() * 600;
    const ly1 = rng() * H;
    const lx2 = 600 + rng() * 600;
    const ly2 = rng() * H;
    shapes.push(`<line x1="${lx1.toFixed(0)}" y1="${ly1.toFixed(0)}" x2="${lx2.toFixed(0)}" y2="${ly2.toFixed(0)}" stroke="${pal.primary}" stroke-width="1" opacity="${(0.07 + rng() * 0.09).toFixed(2)}"/>`);
  }

  // 8. Small constellation dots — scattered across canvas
  const numDots = 10 + Math.floor(rng() * 8);
  for (let i = 0; i < numDots; i++) {
    const dx = rng() * W;
    const dy = rng() * H;
    const dr = (0.8 + rng() * 2.4).toFixed(1);
    const op = (0.18 + rng() * 0.38).toFixed(2);
    shapes.push(`<circle cx="${dx.toFixed(0)}" cy="${dy.toFixed(0)}" r="${dr}" fill="${rng() > 0.5 ? pal.accent : "#FFFFFF"}" opacity="${op}"/>`);
  }

  // --- Title lines ---
  const titleSvg = lines.map((line, i) => {
    const y = blockY + i * lineH + fontSize;
    const safe = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    return `<text x="88" y="${y.toFixed(0)}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif" font-size="${fontSize}" font-weight="800" fill="#FFFFFF" letter-spacing="-0.03em">${safe}</text>`;
  }).join("\n  ");

  // Accent underline below last title line
  const underlineY = (blockY + lines.length * lineH + fontSize * 0.12).toFixed(0);
  const lastLineLen = lines[lines.length - 1].length;
  const underlineW = Math.min(lastLineLen * fontSize * 0.52, 820).toFixed(0);

  // Category pill width
  const catLabel = pal.label;
  const pillW = catLabel.length * 8.5 + 32;
  const pillX = W - 80 - pillW;

  // Neo-brutalist accent bar — thicker, brand-accurate
  const accentBarH = totalTitleH + fontSize * 0.25;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.bg}"/>
      <stop offset="100%" stop-color="${pal.bgB}"/>
    </linearGradient>

    <!-- Right ambient glow -->
    <radialGradient id="glowR" cx="88%" cy="20%" r="55%">
      <stop offset="0%" stop-color="${pal.primary}" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="${pal.primary}" stop-opacity="0"/>
    </radialGradient>

    <!-- Bottom-left ambient glow -->
    <radialGradient id="glowL" cx="8%" cy="88%" r="48%">
      <stop offset="0%" stop-color="${pal.primaryDim}" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="${pal.primaryDim}" stop-opacity="0"/>
    </radialGradient>

    <!-- Soft vignette -->
    <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.50"/>
    </radialGradient>

    <!-- Film grain -->
    <filter id="grain" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
      <feBlend in="SourceGraphic" in2="gray" mode="overlay" result="blended"/>
      <feComposite in="blended" in2="SourceGraphic" operator="in"/>
    </filter>

    <!-- Clip to canvas -->
    <clipPath id="canvas">
      <rect width="${W}" height="${H}"/>
    </clipPath>
  </defs>

  <g clip-path="url(#canvas)">

    <!-- Background -->
    <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
    <rect width="${W}" height="${H}" fill="url(#glowR)"/>
    <rect width="${W}" height="${H}" fill="url(#glowL)"/>

    <!-- Decorative geometry -->
    ${shapes.join("\n    ")}

    <!-- Film grain -->
    <rect width="${W}" height="${H}" fill="white" opacity="0.016" filter="url(#grain)"/>

    <!-- Vignette -->
    <rect width="${W}" height="${H}" fill="url(#vignette)"/>

    <!-- ─── TOP BAR ─── -->
    <line x1="80" y1="86" x2="${W - 80}" y2="86" stroke="${pal.primary}" stroke-width="1" opacity="0.25"/>

    <!-- Wordmark: dot + logotype -->
    <circle cx="54" cy="58" r="6" fill="${pal.primary}"/>
    <circle cx="54" cy="58" r="6" fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.6"/>
    <text x="70" y="65" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="0.08em" opacity="0.95">studojo</text>

    <!-- Category pill — neo-brutalist: filled with primary, white text, rounded rect -->
    <rect x="${pillX}" y="38" width="${pillW}" height="30" rx="6" fill="${pal.primary}" opacity="0.18"/>
    <rect x="${pillX}" y="38" width="${pillW}" height="30" rx="6" fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.75"/>
    <text x="${(pillX + pillW / 2).toFixed(0)}" y="58" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="11" font-weight="700" fill="${pal.accent}" text-anchor="middle" letter-spacing="0.10em">${catLabel}</text>

    <!-- ─── TITLE BLOCK ─── -->

    <!-- Neo-brutalist accent bar — left edge of title -->
    <rect x="80" y="${(blockY - 4).toFixed(0)}" width="4" height="${accentBarH.toFixed(0)}" rx="2" fill="${pal.primary}" opacity="0.95"/>

    <!-- Subtle title backing — gives the text block a "card" feel -->
    <rect x="72" y="${(blockY - 10).toFixed(0)}" width="860" height="${(accentBarH + 14).toFixed(0)}" rx="4" fill="#000000" opacity="0.18"/>

    <!-- Title text -->
    ${titleSvg}

    <!-- Accent underline -->
    <rect x="88" y="${underlineY}" width="${underlineW}" height="2.5" rx="1.5" fill="${pal.primary}" opacity="0.55"/>

    <!-- ─── BOTTOM BAR ─── -->
    <line x1="80" y1="${H - 58}" x2="${W - 80}" y2="${H - 58}" stroke="${pal.primary}" stroke-width="1" opacity="0.25"/>

    <!-- Domain -->
    <text x="80" y="${H - 30}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="13" font-weight="500" fill="#6B7280" letter-spacing="0.05em">studojo.com</text>

    <!-- Tagline — brand signature -->
    <text x="${W - 80}" y="${H - 30}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="12" fill="${pal.accent}" opacity="0.65" text-anchor="end" letter-spacing="0.06em">Work on things that matter.</text>

    <!-- Corner bracket — top right (neo-brutalist detail) -->
    <path d="M${W - 80} 36 L${W - 80} 58 M${W - 100} 36 L${W - 80} 36" stroke="${pal.accent}" stroke-width="1.5" opacity="0.40" fill="none"/>

    <!-- Corner bracket — bottom left -->
    <path d="M80 ${H - 36} L80 ${H - 58} M80 ${H - 36} L100 ${H - 36}" stroke="${pal.accent}" stroke-width="1.5" opacity="0.40" fill="none"/>

  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
