// AR-B05: the Facebook crawler (facebookexternalhit) requests /meta.json
// ~420 times a day. Studojo publishes no such file, so answer with a plain
// 404 from a resource route instead of rendering the full HTML 404 page.
export function loader() {
  return new Response("Not Found", {
    status: 404,
    headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=86400" },
  });
}
