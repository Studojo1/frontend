import type { CSSProperties } from "react";
import { switchHref, type Look } from "../../lib/look";

// CLASSIC LOOK (app/lib/look.ts): the small floating "look: new / classic" switch, for the owner to flip live. It
// shows only when the look switch is on (the ?look= query or the sj_look cookie); a visitor who never asked for a look
// never sees it. Each side is a full page load of this page with ?look= set, so the server stores the choice and
// draws the first paint in it. Inline styles: nothing is added to any stylesheet.

const wrap: CSSProperties = {
  position: "fixed",
  left: 10,
  bottom: 10,
  zIndex: 2147483000,
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: 4,
  borderRadius: 999,
  background: "#fff",
  border: "2px solid #191a23",
  boxShadow: "3px 3px 0 #191a23",
  fontFamily: "Satoshi, system-ui, sans-serif",
  fontSize: 12,
  lineHeight: 1,
  color: "#191a23",
};
const label: CSSProperties = { padding: "0 4px 0 6px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 10.5 };
const side = (on: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  height: 24,
  padding: "0 10px",
  borderRadius: 999,
  fontWeight: 700,
  textDecoration: "none",
  color: on ? "#fff" : "#191a23",
  background: on ? "#191a23" : "transparent",
});

export function LookSwitch({ look }: { look: Look }) {
  const go = (to: Look) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (to !== look) window.location.assign(switchHref(window.location.href, to));
  };
  return (
    <div style={wrap} data-look-switch="" role="group" aria-label="look">
      <span style={label} aria-hidden="true">look</span>
      <a href="?look=new" onClick={go("new")} style={side(look === "new")} aria-current={look === "new" ? "true" : undefined}>
        new
      </a>
      <a href="?look=classic" onClick={go("classic")} style={side(look === "classic")} aria-current={look === "classic" ? "true" : undefined}>
        classic
      </a>
    </div>
  );
}
