/**
 * A lead's industry as the student should read it.
 *
 * The company research that fills it in sometimes leaves its citation on the
 * end, "AdTech ([builtin.com](https://builtin.com/company/responsiveads))",
 * on about 1 in 90 leads. A bracketed markdown link goes entirely, any other
 * markdown link keeps only its text, bare URLs go, and the punctuation and
 * empty brackets left behind are tidied away. "" when nothing is left.
 *
 * Pure: no React, so tests can import it directly.
 */
// A URL may hold one level of brackets of its own (wiki/On_(company)).
const URL_BODY = String.raw`(?:[^()\s]|\([^()\s]*\))*`;
// These two take the punctuation in front of them: "Ecommerce. ([...](...))".
const CITATION = new RegExp(String.raw`[\s.,;:]*\(\s*\[[^\]]*\]\(${URL_BODY}\)\s*\)`, "g");
const BARE_URL = new RegExp(String.raw`[\s.,;:]*(?:https?://|www\.)${URL_BODY}`, "gi");
const MD_LINK = new RegExp(String.raw`\[([^\]]*)\]\(${URL_BODY}\)`, "g");

export function cleanIndustry(raw: string | null | undefined): string {
  return String(raw ?? "")
    .replace(CITATION, " ")
    .replace(MD_LINK, "$1")
    .replace(BARE_URL, " ")
    .replace(/\(\s*\)|\[\s*\]/g, " ")
    .replace(/\s+/g, " ")
    // No full stop here: in a clean value it closes an abbreviation ("n.e.c.").
    .replace(/^[\s,;:|/-]+|[\s,;:|/-]+$/g, "");
}
