import { Outlet } from "react-router";

/**
 * Layout wrapper for /outreach/*.
 *
 * Under @react-router/fs-routes flat routing, `outreach.tsx` is the parent
 * layout for every `outreach.*.tsx` file in this folder (chat, upload,
 * leads, campaign, etc.). Without this Outlet, child routes silently
 * fail to render and the URL changes but the page does not.
 *
 * The marketing landing that used to live here moved to
 * `outreach._index.tsx`, which renders inside this Outlet at exactly
 * `/outreach`. All deeper routes render their own Header/Footer.
 */
export default function OutreachLayout() {
  return <Outlet />;
}
