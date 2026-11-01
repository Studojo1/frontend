import { productOrigin, productRedirect } from "~/lib/product-origin";

// /b2cnew and /b2cnew/* (RELAUNCH, 2 Nov 2026): the product moved to its own host (PRODUCT_ORIGIN,
// https://platform.studojo.com; app/lib/product-origin.ts). Every old address answers 301 to the same path and query
// there: /b2cnew/join?via=x goes to https://platform.studojo.com/join?via=x. Without PRODUCT_ORIGIN (a local run)
// there is nowhere to send it: 404. Registered in app/routes.ts for both paths.
export function loader({ request }: { request: Request }) {
  const to = productRedirect(request.url, productOrigin());
  if (!to) throw new Response("Not found", { status: 404 });
  return new Response(null, { status: 301, headers: { Location: to, "Cache-Control": "public, max-age=3600" } });
}

export function action({ request }: { request: Request }) {
  return loader({ request });
}

export default function B2cNewHandoff() {
  return null;
}
