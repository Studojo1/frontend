import { type RouteConfig, route } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

// File-based route discovery: any file added to app/routes/ is automatically
// registered. No need to manually edit this file for new routes.
//
// Three routes stay explicit because their paths can't be expressed in the
// flat-file naming convention (dots in path segments, leading dot, .xml/.txt):
//   .well-known/*    → /.well-known/* (leading dot not representable)
//   sitemap.xml      → /sitemap.xml  (dot inside path segment)
//   robots.txt       → /robots.txt   (dot inside path segment)
//
// All other routes: create app/routes/<name>.tsx and it will be picked up.

export default [
  ...(await flatRoutes({
    ignoredRouteFiles: [
      "**/well-known.$.tsx",
      "**/sitemap.xml.tsx",
      "**/robots.txt.tsx",
    ],
  })),
  route(".well-known/*", "routes/well-known.$.tsx"),
  route("sitemap.xml", "routes/sitemap.xml.tsx"),
  route("robots.txt", "routes/robots.txt.tsx"),
] satisfies RouteConfig;
