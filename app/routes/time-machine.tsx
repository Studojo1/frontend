import oldHome from "~/time-machine/old-home.html?raw";

// TIME MACHINE (2 Nov 2026, the owner): a frozen snapshot of the old studojo.com homepage, kept as a relic. The page
// is static HTML (no scripts, every link goes to "/") with its CSS, fonts and images under public/time-machine-assets/.
// A resource route (no default export), so the response is the HTML itself with no app shell around it.
// It is not a retired route, so the "301 to /" list in app/lib/retired-routes.ts does not touch it.

export function loader() {
  return new Response(oldHome, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
