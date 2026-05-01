import type { Route } from "./+types/api.blog-og.$slug";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  // Approximate char width: bold sans-serif is ~0.58x font size per char
  const charWidth = fontSize * 0.58;
  const maxChars = Math.floor(maxWidth / charWidth);
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length <= maxChars) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function getFontSize(title: string): number {
  if (title.length < 35) return 72;
  if (title.length < 55) return 60;
  if (title.length < 75) return 50;
  return 42;
}

function getCategoryColor(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("intern")) return "#7C3AED";
  if (c.includes("resume") || c.includes("career")) return "#059669";
  if (c.includes("ai") || c.includes("tech")) return "#0891B2";
  if (c.includes("assign")) return "#D97706";
  return "#7C3AED";
}

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;

  let title = "Studojo Blog";
  let category = "internships";

  try {
    const result = await db.execute(
      sql.raw(`SELECT title, categories FROM blog_posts WHERE slug = '${slug?.replace(/'/g, "''")}' AND status = 'published' LIMIT 1`)
    );
    if (result.rows.length > 0) {
      const row = result.rows[0] as any;
      title = row.title || title;
      category = (row.categories && row.categories[0]) || category;
    }
  } catch {
    // serve a fallback poster if DB query fails
  }

  const W = 1200;
  const H = 630;
  const PAD = 72;
  const titleAreaWidth = W - PAD * 2;
  const fontSize = getFontSize(title);
  const lineHeight = fontSize * 1.2;
  const lines = wrapText(title, titleAreaWidth, fontSize);
  const catColor = getCategoryColor(category);

  // Start title block at y=200, centred vertically ish
  const titleBlockHeight = lines.length * lineHeight;
  const titleY = Math.min(220, (H - titleBlockHeight) / 2 - 20);

  // Dot grid rows/cols
  const dotSpacing = 40;
  const dots: string[] = [];
  for (let x = dotSpacing; x < W; x += dotSpacing) {
    for (let y = dotSpacing; y < H; y += dotSpacing) {
      dots.push(`<circle cx="${x}" cy="${y}" r="1.2" fill="#7C3AED" opacity="0.13"/>`);
    }
  }

  // Title lines as SVG text elements
  const titleLines = lines
    .map((line, i) => {
      const y = titleY + i * lineHeight + fontSize;
      return `<text x="${PAD}" y="${y}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="#FFFFFF" letter-spacing="-0.02em">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>`;
    })
    .join("\n  ");

  // Category pill
  const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const catPillWidth = catLabel.length * 9 + 32;
  const catPillX = W - PAD - catPillWidth;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="#0A0612"/>

  <!-- Dot grid -->
  ${dots.join("\n  ")}

  <!-- Right glow -->
  <defs>
    <radialGradient id="glow" cx="85%" cy="35%" r="55%">
      <stop offset="0%" stop-color="${catColor}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${catColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Top-left wordmark -->
  <text x="${PAD}" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="0.04em">studojo</text>

  <!-- Top-left accent dot -->
  <circle cx="${PAD - 16}" cy="63" r="4" fill="${catColor}"/>

  <!-- Category pill top-right -->
  <rect x="${catPillX}" y="42" width="${catPillWidth}" height="32" rx="16" fill="none" stroke="${catColor}" stroke-width="1.5"/>
  <text x="${catPillX + catPillWidth / 2}" y="63" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="${catColor}" text-anchor="middle" letter-spacing="0.05em">${catLabel}</text>

  <!-- Left accent bar -->
  <rect x="${PAD}" y="${titleY - 4}" width="3" height="${titleBlockHeight + fontSize * 0.2}" rx="2" fill="${catColor}" opacity="0.9"/>

  <!-- Title -->
  ${titleLines}

  <!-- Bottom divider -->
  <line x1="${PAD}" y1="${H - 68}" x2="${W - PAD}" y2="${H - 68}" stroke="${catColor}" stroke-width="1" opacity="0.25"/>

  <!-- Bottom left: domain -->
  <text x="${PAD}" y="${H - 36}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" font-size="15" font-weight="500" fill="#6B7280" letter-spacing="0.03em">studojo.com</text>

  <!-- Bottom right: tagline -->
  <text x="${W - PAD}" y="${H - 36}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" font-size="13" font-weight="400" fill="${catColor}" opacity="0.7" text-anchor="end" letter-spacing="0.04em">Work on things that matter.</text>

  <!-- Top-right corner bracket -->
  <path d="M${W - PAD} 40 L${W - PAD} 58" stroke="${catColor}" stroke-width="1.5" opacity="0.5"/>
  <path d="M${W - PAD - 16} 40 L${W - PAD} 40" stroke="${catColor}" stroke-width="1.5" opacity="0.5"/>

  <!-- Bottom-left corner bracket -->
  <path d="M${PAD} ${H - 40} L${PAD} ${H - 58}" stroke="${catColor}" stroke-width="1.5" opacity="0.5"/>
  <path d="M${PAD} ${H - 40} L${PAD + 16} ${H - 40}" stroke="${catColor}" stroke-width="1.5" opacity="0.5"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
