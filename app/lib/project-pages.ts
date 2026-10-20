/**
 * Launched project pages (studojo.com/<handle>/<slug>): the address rules both
 * the route and its tests share. Contract: career-agent docs/b2c8/CONTRACT-PAGES.md
 * sections 1 and 6. Pure, no server imports, so tests and the browser can load it.
 */

/** 3 to 30 characters, lower case letters, digits and inner hyphens. */
export const HANDLE_RE = /^[a-z0-9](?:[a-z0-9-]{1,28})[a-z0-9]$/;
/** 3 to 60 characters, same alphabet. */
export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,58})[a-z0-9]$/;

/**
 * Words no student can take as a handle: every first path segment of this site
 * and the ones career-agent keeps back. career-agent refuses them at launch and
 * this site answers 404 for them. app/lib/project-pages-reserved.test.mjs fails
 * when a route's first segment is missing here. Keep it equal to the contract's
 * list: a word only one side knows gives a student a page that never opens.
 */
export const RESERVED: ReadonlySet<string> = new Set(
  `about account admin api apidashboard apidocs app assets assignments auth autoapply b2cnew blog bob brand build
campus-ambassador careers cc connect-linkedin contact content crm dashboard docs dojos explore extension
extension-auth favicon flow fonts forgot-password go help home images insider install-extension internships jernew
legal linkedin lkot login logout maps mcpdocs media mesa meta msl my-applications new no-one-is-hiring official
oldui onboarding outreach partners partners-phone payment payment-success pb pbadmin playbook pricing privacy
profile projects refund-policy register reports reset-password ressources resume-maker robots security sensei
settings sign-in signin signup sitemap sites start static status studojo support team terms test test123 toolkit
u user users webinar well-known www`
    .split(/\s+/)
    .filter(Boolean),
);

/** A handle this site will look up: the right shape, at least one letter, not reserved. */
export function isPageHandle(handle: string): boolean {
  return HANDLE_RE.test(handle) && /[a-z]/.test(handle) && !RESERVED.has(handle);
}

/** A slug this site will look up. */
export function isPageSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

/** The page's Content-Security-Policy (contract section 4): its own scripts, styles and images, and frames only from the embed providers. */
export const PAGE_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' https://cdn.fontshare.com",
  "connect-src 'self'",
  // Each embed host only at its embed path (view.ts PROVIDERS), so a student's web build cannot move its own sandboxed
  // frame to another page of an allowed host, such as a Google Form that would record what a visitor typed.
  "frame-src 'self' https://docs.google.com/spreadsheets/d/ https://docs.google.com/presentation/d/ https://docs.google.com/document/d/ https://www.figma.com/embed https://*.notion.site https://www.loom.com/embed/ https://www.youtube-nocookie.com/embed/ https://www.canva.com/design/ https://public.tableau.com/views/ https://lookerstudio.google.com/embed/",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");
