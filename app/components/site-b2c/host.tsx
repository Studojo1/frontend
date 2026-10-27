import { createContext, useContext } from "react";
import { useRouteLoaderData } from "react-router";
import { b2cHomeHost } from "../../lib/b2c-home";

// SITE-V2: whether this page is on a B2C host (studojo.pro, localhost), for the root Layout and the common header and
// footer. Normally the root loader's b2cHost (app/lib/b2c-home.ts). An unmatched URL (a 404) runs no loader, so the
// root has no data; then the server's own answer for the request (entry.server.tsx provides it below the router)
// and, in the browser, the same rule on the page's host. Both sides agree, so hydration matches, and studojo.com
// (server: BETTER_AUTH_URL is studojo.com; browser: host studojo.com) is never B2C.

export const Sv2HostContext = createContext<boolean | null>(null);

export function useSiteB2c(): boolean {
  const data = useRouteLoaderData("root") as { b2cHost?: boolean } | undefined;
  const fromServer = useContext(Sv2HostContext);
  if (data && typeof data.b2cHost === "boolean") return data.b2cHost;
  if (fromServer !== null) return fromServer;
  if (typeof window !== "undefined") return b2cHomeHost(window.location.host, undefined);
  return false;
}
