import { createContext, useContext } from "react";
import type { Look } from "../../lib/look";

// CLASSIC LOOK (app/lib/look.ts): the look this page draws, when the look switch is on (the ?look= query or the
// sj_look cookie), else null. The server decides (entry.server.tsx provides it below the router, so a 404 without a
// root loader has it too); in the browser it is read back from <html data-look>, which the server rendered, so
// hydration always matches. null means the page is exactly as it was: no attribute, no classic sheets, no switch.

export const LookContext = createContext<Look | null | undefined>(undefined);

export function useLook(): Look | null {
  const fromServer = useContext(LookContext);
  if (fromServer !== undefined) return fromServer;
  if (typeof document !== "undefined") {
    const v = document.documentElement.getAttribute("data-look");
    return v === "classic" || v === "new" ? v : null;
  }
  return null;
}
