export async function loader() {
  const baseUrl = "https://studojo.com";

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin/API/auth routes
Disallow: /api/
Disallow: /auth
Disallow: /settings
Disallow: /onboarding
Disallow: /outreach
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}