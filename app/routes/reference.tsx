// Interactive OpenAPI reference (Swagger UI), served at /reference.
// Assets are self-hosted under /public/swagger (CSP is script-src 'self' 'unsafe-inline'
// 'unsafe-eval', so a CDN would be blocked but self-hosted + inline init is fine).
// Resource route: only a loader, returns the HTML shell directly.
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Contact Enrichment API - Reference - Studojo</title>
  <link rel="stylesheet" href="/swagger/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fff; }
    .swagger-ui .topbar { display: none; }
    .sd-bar { display:flex; align-items:center; gap:12px; padding:14px 20px; border-bottom:2px solid #171717; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; }
    .sd-bar a { color:#6d28d9; font-weight:700; text-decoration:none; }
    .sd-bar .sp { flex:1; }
    .sd-bar .t { font-weight:700; }
  </style>
</head>
<body>
  <div class="sd-bar">
    <span class="t">Studojo Contact Enrichment API</span>
    <span class="sp"></span>
    <a href="/apidocs">Guide &amp; API keys</a>
    <a href="/openapi.json">openapi.json</a>
  </div>
  <div id="swagger-ui"></div>
  <script src="/swagger/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: "/openapi.json",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis],
      layout: "BaseLayout",
      defaultModelsExpandDepth: 1,
      docExpansion: "list",
      tryItOutEnabled: true,
      persistAuthorization: true
    });
  </script>
</body>
</html>`;

export function loader() {
  return new Response(HTML, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}
