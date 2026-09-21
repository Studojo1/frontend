import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,

  // Eager route discovery asks /__manifest for a patch describing routes the
  // client does not have yet. Ours answers 204 with an empty body, so the client
  // never receives the patch it asked for and asks again, in a tight loop.
  //
  // Traced on studojo.pro at 390x844: /outreach/leads/discovery fired 33,523
  // requests to /__manifest in 13 seconds and pinned the renderer at 152% CPU,
  // against 21% on /outreach. Reproduced logged out on the same route: 13,133
  // requests, every one of them
  // `?paths=/outreach/onboarding/upload` -- the route it redirects to and then
  // cannot resolve. Plain logged-out pages fire 2 and settle, so this is about
  // routes the client has to discover, not links on screen.
  //
  // The whole route manifest ships in the initial payload, so "initial" costs
  // nothing. The 204 is the real defect and wants fixing server-side; this stops
  // the client melting in the meantime.
  routeDiscovery: { mode: "initial" },
} satisfies Config;
