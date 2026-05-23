// User-controlled typography on top of the template's defaults.
// Applied as a scoped <style> block injected next to the template render,
// so neither the template nor the editor needs to be aware of it.

export type FontFamilyChoice = "default" | "sans" | "serif" | "mono";

export interface ResumeFormatting {
  fontScale: number;       // 0.8 – 1.3, multiplies all text
  lineHeight: number;      // 1.1 – 1.7 absolute line-height
  fontFamily: FontFamilyChoice;
  headingsBold: boolean;
  headingsItalic: boolean;
  headingsUnderline: boolean;
  sectionPageBreak: boolean; // each section starts on a new printed page
}

export const DEFAULT_FORMATTING: ResumeFormatting = {
  fontScale: 1,
  lineHeight: 1.45,
  fontFamily: "default",
  headingsBold: false,
  headingsItalic: false,
  headingsUnderline: false,
  sectionPageBreak: false,
};

const FORMATTING_KEY = "jrs:formatting:v1";

export function loadFormatting(): ResumeFormatting {
  if (typeof window === "undefined") return DEFAULT_FORMATTING;
  try {
    const raw = localStorage.getItem(FORMATTING_KEY);
    if (!raw) return DEFAULT_FORMATTING;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FORMATTING, ...parsed };
  } catch {
    return DEFAULT_FORMATTING;
  }
}

export function saveFormatting(f: ResumeFormatting): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FORMATTING_KEY, JSON.stringify(f));
  } catch {
    /* ignore */
  }
}

const FONT_STACK: Record<FontFamilyChoice, string | null> = {
  default: null,
  sans: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  serif: "'Georgia', 'Times New Roman', serif",
  mono: "'JetBrains Mono', 'Menlo', 'Consolas', monospace",
};

/**
 * CSS for a scoped wrapper. The font-scale is applied via the wrapper's
 * `zoom` (set inline by the caller, multiplied by the density factor) so we
 * don't repeat it here. Everything else cascades via `!important` overrides
 * because the templates set inline styles per element.
 */
export function formattingCSS(scopeClass: string, f: ResumeFormatting): string {
  const family = FONT_STACK[f.fontFamily];
  const rules: string[] = [];

  rules.push(
    `.${scopeClass} *, .${scopeClass} { line-height: ${f.lineHeight} !important; }`,
  );

  if (family) {
    rules.push(
      `.${scopeClass}, .${scopeClass} * { font-family: ${family} !important; }`,
    );
  }

  const headingSel = `.${scopeClass} h1, .${scopeClass} h2, .${scopeClass} h3`;
  if (f.headingsBold) rules.push(`${headingSel} { font-weight: 900 !important; }`);
  if (f.headingsItalic) rules.push(`${headingSel} { font-style: italic !important; }`);
  if (f.headingsUnderline) rules.push(`${headingSel} { text-decoration: underline !important; }`);

  if (f.sectionPageBreak) {
    // h2 = section heading in every template. Avoid breaking before the
    // first one (the first section comes right after the header block).
    rules.push(`.${scopeClass} h2 + * { break-inside: avoid; }`);
    rules.push(
      `.${scopeClass} h2:not(:first-of-type) { break-before: page; page-break-before: always; }`,
    );
  }

  return rules.join("\n");
}
