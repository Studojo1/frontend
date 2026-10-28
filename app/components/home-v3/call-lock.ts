// HOMEPAGE V2 TAKEOVER (27 Oct 2026, the owner): the moment a visitor taps Stu, "start the call", the floating agent
// or the footer's button, the page becomes a focused call screen: a full-screen layer, the page under it locked
// (nothing behind it reachable by scroll), closed by its x, Escape or the browser's Back (a history entry of its own,
// #stu), and back on the page at the same scroll position. These are the pieces with no React in them, for tests
// (app/lib/home-v3.test.mjs runs them against a stand-in window). Takeover.tsx draws the layer.

/** The takeover's own history entry: Back closes it. No element on the page has this id, so nothing scrolls to it. */
export const CALL_HASH = "#stu";

const BODY = ["position", "top", "left", "right", "width", "overflow"] as const;
type BodyProp = (typeof BODY)[number];

export type ScrollLock = { y: number; body: Record<BodyProp, string>; html: string };

type Win = Pick<Window, "scrollY" | "scrollTo"> & { document: { body: { style: CSSStyleDeclaration }; documentElement: { style: CSSStyleDeclaration } } };

/**
 * Lock the page where it is: the body is pinned (position fixed, moved up by the scroll so nothing jumps) and
 * neither it nor the root can scroll, which also holds on iOS Safari, where overflow alone does not.
 */
export function lockScroll(win: Win): ScrollLock {
  const y = win.scrollY;
  const body = win.document.body.style;
  const html = win.document.documentElement.style;
  const lock: ScrollLock = { y, body: Object.fromEntries(BODY.map((p) => [p, body[p]])) as Record<BodyProp, string>, html: html.overflow };
  body.position = "fixed";
  body.top = `-${y}px`;
  body.left = "0";
  body.right = "0";
  body.width = "100%";
  body.overflow = "hidden";
  html.overflow = "hidden";
  return lock;
}

/** Undo lockScroll: the body's own styles back as they were, and the page at the same place, at once. */
export function unlockScroll(win: Win, lock: ScrollLock): void {
  const body = win.document.body.style;
  for (const p of BODY) body[p] = lock.body[p];
  win.document.documentElement.style.overflow = lock.html;
  win.scrollTo({ top: lock.y, left: 0, behavior: "instant" });
}

/** Pranav's facts from the lobby before the call (career-agent d596ce92, components/voice/Lobby.tsx), word for word. */
export const CALL_FACTS_LEFT = [
  { icon: "clock", title: "About 10 minutes", sub: "One conversation with Stu" },
  { icon: "target", title: "Mostly about the role you want", sub: "What you're after, and why" },
] as const;
export const CALL_FACTS_RIGHT = [
  { icon: "file", title: "Your resume handy", sub: "As a PDF, you'll drop it in" },
  { icon: "volume", title: "A quiet spot", sub: "Headphones help" },
] as const;
