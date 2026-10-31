// Company logos by domain, the same way the Sensei table draws them (app/routes/bob.tsx CompanyLogo).
// Context.dev Logo Link: a free CDN with its own monthly quota (it never touches our search credits) that returns
// image bytes, and a generated monogram when a domain has no logo. The public client id is frontend safe (locked to
// our allowed referring domains) and is baked in at build time (VITE_CONTEXT_LOGO_CLIENT_ID: the Dockerfile and the
// deploy workflows). Without it, Google's free favicon service. Logo Link does not allow storing or rehosting its
// images, so they are always linked, never copied.
const LOGO_CLIENT_ID =
  (import.meta.env as Record<string, string | undefined>).VITE_CONTEXT_LOGO_CLIENT_ID || "";

/** Logo Link's theme: "light" prefers a dark mark for a light surface; null takes its default near-square icon. */
export type LogoTheme = "light" | "dark" | null;

/** Google's favicon for a domain: the logo when Logo Link is not set up, and the fallback when it fails. */
export const faviconUrl = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

/** A company's logo for an <img>: Logo Link when its client id is set, else Google's favicon. */
export function companyLogoUrl(domain: string, theme: LogoTheme = "light"): string {
  if (!LOGO_CLIENT_ID) return faviconUrl(domain);
  return `https://logos.context.dev/?publicClientId=${encodeURIComponent(LOGO_CLIENT_ID)}&domain=${encodeURIComponent(domain)}${theme ? `&theme=${theme}` : ""}`;
}
