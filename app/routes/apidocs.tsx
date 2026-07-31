// studojo.com/apidocs - Apollo-style OpenAPI reference, rendered by Redoc from
// /openapi.json. Redoc is self-hosted at /redoc.standalone.js (CSP is
// script-src 'self'; a CDN would be blocked). API keys are created/managed at
// /apidashboard. Resource route: only a loader, returns the HTML shell directly.
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Contact Enrichment API - Studojo</title>
  <meta name="description" content="Turn a LinkedIn profile, or a name and company, into a verified work email, personal email and mobile number. One call, verified results, billed only when a contact comes back." />
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
    .sd-bar { display:flex; align-items:center; gap:16px; padding:11px 22px; border-bottom:1px solid #e7e7e7; position:sticky; top:0; background:#fff; z-index:20; }
    .sd-bar .brand { font-weight:700; font-size:15px; }
    .sd-bar .brand span { color:#8a8a94; font-weight:500; }
    .sd-bar .sp { flex:1; }
    .sd-bar a { color:#6d28d9; font-weight:600; text-decoration:none; font-size:14px; }
    .sd-bar a.key { background:#6d28d9; color:#fff; padding:8px 16px; border-radius:10px; }
    .sd-bar a.key:hover { background:#5b21b6; }
  </style>
</head>
<body>
  <div class="sd-bar">
    <div class="brand">Studojo <span>Contact Enrichment API</span></div>
    <div class="sp"></div>
    <a href="/openapi.json">openapi.json</a>
    <a class="key" href="/apidashboard">Get API keys</a>
  </div>
  <redoc
    spec-url="/openapi.json"
    expand-responses="200"
    required-props-first
    hide-download-button
    theme='{"colors":{"primary":{"main":"#6d28d9"}},"typography":{"fontFamily":"-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif","fontSize":"15px","headings":{"fontFamily":"-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif","fontWeight":"700"},"code":{"fontFamily":"SF Mono,Menlo,Consolas,monospace"}},"sidebar":{"width":"270px","backgroundColor":"#faf9f6"},"rightPanel":{"backgroundColor":"#17171f"}}'
  ></redoc>
  <script src="/redoc.standalone.js"></script>
</body>
</html>`;

export function loader() {
  return new Response(HTML, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}
