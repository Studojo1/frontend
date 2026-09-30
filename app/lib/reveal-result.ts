/**
 * Bring a form's result into view once the form is replaced by it (audit PH-16).
 *
 * On /insider (/campus-ambassador) a phone user taps "Apply now" at the bottom
 * of a long form. The form is swapped for a short "Application received" card,
 * the page shrinks, and the browser keeps the old scroll position clamped to
 * the new bottom, so the viewport landed in the footer with the card 850px
 * above it. Nobody saw the confirmation; until 28 Sep the footer held a
 * "Join the Dojo" email box, and its Join button took the rage clicks.
 *
 * Scrolls the result to the top of the screen and moves focus to it, so a
 * screen reader announces it too.
 */
export function revealResult(el: HTMLElement | null | undefined): boolean {
  if (!el) return false;
  try {
    el.scrollIntoView({ block: "start", behavior: "smooth" });
  } catch {
    el.scrollIntoView();
  }
  try {
    el.focus({ preventScroll: true });
  } catch {
    // Focus is a courtesy; the scroll is what matters.
  }
  return true;
}
