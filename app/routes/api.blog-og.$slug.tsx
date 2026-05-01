import type { Route } from "./+types/api.blog-og.$slug";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

// Deterministic pseudo-random from slug — same slug always generates same image
function seededRandom(slug: string) {
  let seed = 5381;
  for (const c of slug) seed = (((seed * 33) ^ c.charCodeAt(0)) >>> 0);
  return () => {
    seed = (((seed * 1664525) + 1013904223) >>> 0);
    return seed / 0xffffffff;
  };
}

const PALETTES: Record<string, { bg: string; bgB: string; primary: string; accent: string; dim: string }> = {
  internships:  { bg: "#0C0818", bgB: "#160C2E", primary: "#7C3AED", accent: "#A78BFA", dim: "#4C1D95" },
  internship:   { bg: "#0C0818", bgB: "#160C2E", primary: "#7C3AED", accent: "#A78BFA", dim: "#4C1D95" },
  career:       { bg: "#051510", bgB: "#0A2218", primary: "#059669", accent: "#34D399", dim: "#064E3B" },
  careers:      { bg: "#051510", bgB: "#0A2218", primary: "#059669", accent: "#34D399", dim: "#064E3B" },
  resume:       { bg: "#051510", bgB: "#0A2218", primary: "#059669", accent: "#34D399", dim: "#064E3B" },
  ai:           { bg: "#04101A", bgB: "#071826", primary: "#0891B2", accent: "#38BDF8", dim: "#0369A1" },
  tech:         { bg: "#04101A", bgB: "#071826", primary: "#0891B2", accent: "#38BDF8", dim: "#0369A1" },
  assignment:   { bg: "#180D00", bgB: "#231200", primary: "#D97706", accent: "#FCD34D", dim: "#92400E" },
  assignments:  { bg: "#180D00", bgB: "#231200", primary: "#D97706", accent: "#FCD34D", dim: "#92400E" },
  default:      { bg: "#0C0818", bgB: "#160C2E", primary: "#7C3AED", accent: "#A78BFA", dim: "#4C1D95" },
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
  return lines.slice(0, 4); // max 4 lines
}

function getFontSize(title: string) {
  if (title.length < 30) return 74;
  if (title.length < 48) return 62;
  if (title.length < 68) return 52;
  return 42;
}

// Extract a short "key word" from the title for the background echo
function echoWord(title: string): string {
  const stop = new Set(["the","a","an","to","for","and","or","of","in","on","at","how","why","what","when","your","you","is","are","was","were","that","this","with","from","by"]);
  const words = title.split(/\s+/);
  const meaningful = words.filter(w => !stop.has(w.toLowerCase()) && w.length > 3);
  return (meaningful[0] || words[0] || "STUDY").toUpperCase().slice(0, 8);
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
  const lines = wrapTitle(title, Math.floor(900 / (fontSize * 0.56)));
  const lineH = fontSize * 1.22;
  const totalTitleH = lines.length * lineH;
  const titleY = Math.max(160, (H - totalTitleH) / 2 - 30);

  const echo = echoWord(title);
  const catLabel = category.charAt(0).toUpperCase() + category.slice(1);

  // --- Unique geometry per post ---

  // 1. Large background shapes (2–3 big abstract blobs)
  const shapes: string[] = [];

  // Big circle A — always present, position varies
  const cxA = 700 + rng() * 400;
  const cyA = 80 + rng() * 300;
  const rA = 180 + rng() * 200;
  shapes.push(`<circle cx="${cxA}" cy="${cyA}" r="${rA}" fill="${pal.primary}" opacity="${(0.12 + rng() * 0.10).toFixed(2)}"/>`);

  // Big circle B — sometimes an ellipse
  const cxB = rng() * 500;
  const cyB = 300 + rng() * 280;
  const rB = 140 + rng() * 180;
  const rxB = rB * (0.6 + rng() * 0.8);
  const ryB = rB * (0.6 + rng() * 0.8);
  shapes.push(`<ellipse cx="${cxB}" cy="${cyB}" rx="${rxB}" ry="${ryB}" fill="${pal.dim}" opacity="${(0.18 + rng() * 0.12).toFixed(2)}"/>`);

  // Rotated rectangle — adds geometric tension
  const rectX = 100 + rng() * 600;
  const rectY = 50 + rng() * 400;
  const rectW = 200 + rng() * 400;
  const rectH2 = 80 + rng() * 200;
  const angle = -35 + rng() * 70;
  shapes.push(`<rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH2}" rx="8" fill="${pal.accent}" opacity="${(0.04 + rng() * 0.06).toFixed(2)}" transform="rotate(${angle.toFixed(1)} ${(rectX + rectW/2).toFixed(0)} ${(rectY + rectH2/2).toFixed(0)})"/>`);

  // Outline circle — ring motif
  const cxC = 500 + rng() * 500;
  const cyC = rng() * 500;
  const rC = 120 + rng() * 260;
  shapes.push(`<circle cx="${cxC}" cy="${cyC}" r="${rC}" fill="none" stroke="${pal.accent}" stroke-width="${(1 + rng() * 2).toFixed(1)}" opacity="${(0.10 + rng() * 0.14).toFixed(2)}"/>`);

  // Thin diagonal lines (2–4)
  const numLines = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < numLines; i++) {
    const lx1 = rng() * W;
    const ly1 = rng() * H;
    const lx2 = rng() * W;
    const ly2 = rng() * H;
    shapes.push(`<line x1="${lx1.toFixed(0)}" y1="${ly1.toFixed(0)}" x2="${lx2.toFixed(0)}" y2="${ly2.toFixed(0)}" stroke="${pal.primary}" stroke-width="1" opacity="${(0.08 + rng() * 0.10).toFixed(2)}"/>`);
  }

  // Constellation dots (8–14 scattered)
  const numDots = 8 + Math.floor(rng() * 7);
  for (let i = 0; i < numDots; i++) {
    const dx = rng() * W;
    const dy = rng() * H;
    const dr = 1 + rng() * 3;
    const opacity = (0.15 + rng() * 0.4).toFixed(2);
    shapes.push(`<circle cx="${dx.toFixed(0)}" cy="${dy.toFixed(0)}" r="${dr.toFixed(1)}" fill="${rng() > 0.5 ? pal.accent : "#FFFFFF"}" opacity="${opacity}"/>`);
  }

  // 2–3 small accent squares
  const numSquares = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < numSquares; i++) {
    const sx = rng() * W;
    const sy = rng() * H;
    const ss = 4 + rng() * 12;
    const sa = -45 + rng() * 90;
    shapes.push(`<rect x="${sx.toFixed(0)}" y="${sy.toFixed(0)}" width="${ss.toFixed(1)}" height="${ss.toFixed(1)}" fill="${pal.accent}" opacity="${(0.3 + rng() * 0.4).toFixed(2)}" transform="rotate(${sa.toFixed(1)} ${(sx + ss/2).toFixed(0)} ${(sy + ss/2).toFixed(0)})"/>`);
  }

  // --- Title SVG elements ---
  const titleSvg = lines.map((line, i) => {
    const y = titleY + i * lineH + fontSize;
    const safe = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    return `<text x="72" y="${y.toFixed(0)}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif" font-size="${fontSize}" font-weight="800" fill="#FFFFFF" letter-spacing="-0.025em">${safe}</text>`;
  }).join("\n  ");

  // Accent underline under last title line
  const underlineY = (titleY + lines.length * lineH + fontSize * 0.15).toFixed(0);
  const underlineW = Math.min(lines[lines.length - 1].length * fontSize * 0.53, 900);

  // Category pill dimensions
  const catPW = catLabel.length * 9 + 36;
  const catPX = W - 72 - catPW;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.bg}"/>
      <stop offset="100%" stop-color="${pal.bgB}"/>
    </linearGradient>
    <!-- Right-side glow -->
    <radialGradient id="glowR" cx="90%" cy="25%" r="60%">
      <stop offset="0%" stop-color="${pal.primary}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${pal.primary}" stop-opacity="0"/>
    </radialGradient>
    <!-- Left-side glow -->
    <radialGradient id="glowL" cx="10%" cy="80%" r="50%">
      <stop offset="0%" stop-color="${pal.dim}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${pal.dim}" stop-opacity="0"/>
    </radialGradient>
    <!-- Film grain -->
    <filter id="grain" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
      <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blended"/>
      <feComposite in="blended" in2="SourceGraphic" operator="in"/>
    </filter>
    <!-- Soft vignette -->
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
    </radialGradient>
  </defs>

  <!-- Base background -->
  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>

  <!-- Glows -->
  <rect width="${W}" height="${H}" fill="url(#glowR)"/>
  <rect width="${W}" height="${H}" fill="url(#glowL)"/>

  <!-- Unique geometry for this post -->
  ${shapes.join("\n  ")}

  <!-- Echo text — large faded background word -->
  <text x="-20" y="${(H * 0.78).toFixed(0)}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="320" font-weight="900" fill="${pal.primary}" opacity="0.045" letter-spacing="-0.04em" user-select="none">${echo}</text>

  <!-- Film grain overlay -->
  <rect width="${W}" height="${H}" fill="white" opacity="0.018" filter="url(#grain)"/>

  <!-- Vignette -->
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>

  <!-- Left accent bar -->
  <rect x="72" y="${(titleY - 6).toFixed(0)}" width="3" height="${(totalTitleH + fontSize * 0.3).toFixed(0)}" rx="2" fill="${pal.accent}" opacity="0.9"/>

  <!-- Title -->
  ${titleSvg}

  <!-- Accent underline under last title line -->
  <rect x="72" y="${underlineY}" width="${underlineW.toFixed(0)}" height="2" rx="1" fill="${pal.accent}" opacity="0.35"/>

  <!-- Top bar separator -->
  <line x1="72" y1="92" x2="${W - 72}" y2="92" stroke="${pal.primary}" stroke-width="1" opacity="0.2"/>

  <!-- Wordmark top-left -->
  <circle cx="56" cy="62" r="5" fill="${pal.accent}"/>
  <text x="72" y="68" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="19" font-weight="700" fill="#FFFFFF" letter-spacing="0.06em">studojo</text>

  <!-- Category pill top-right -->
  <rect x="${catPX}" y="42" width="${catPW}" height="30" rx="15" fill="none" stroke="${pal.accent}" stroke-width="1.5" opacity="0.7"/>
  <text x="${(catPX + catPW / 2).toFixed(0)}" y="62" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="12" font-weight="600" fill="${pal.accent}" text-anchor="middle" letter-spacing="0.07em">${catLabel.toUpperCase()}</text>

  <!-- Bottom bar -->
  <line x1="72" y1="${H - 64}" x2="${W - 72}" y2="${H - 64}" stroke="${pal.primary}" stroke-width="1" opacity="0.2"/>
  <text x="72" y="${H - 36}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="14" font-weight="500" fill="#6B7280" letter-spacing="0.04em">studojo.com</text>
  <text x="${W - 72}" y="${H - 36}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="13" fill="${pal.accent}" opacity="0.6" text-anchor="end" letter-spacing="0.05em">Work on things that matter.</text>

  <!-- Corner brackets -->
  <path d="M${W - 72} 40 L${W - 72} 60 M${W - 90} 40 L${W - 72} 40" stroke="${pal.accent}" stroke-width="1.5" opacity="0.45" fill="none"/>
  <path d="M72 ${H - 42} L72 ${H - 62} M72 ${H - 42} L90 ${H - 42}" stroke="${pal.accent}" stroke-width="1.5" opacity="0.45" fill="none"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
