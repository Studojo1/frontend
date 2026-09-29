/**
 * Rich text (HTML from the internship editor) to plain text for meta tags and
 * structured data. Every internship description starts with <p>, which
 * rendered as "&lt;p&gt;Knacks is..." in search results (audit HP-N15).
 */
const ENTITIES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " ",
};

export function plainText(html: string | null | undefined, max?: number): string {
  let text = String(html ?? "")
    .replace(/<(br|\/p|\/li|\/h\d)\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim();
  if (max && text.length > max) text = `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}\u2026`;
  return text;
}
