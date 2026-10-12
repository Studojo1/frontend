// The Senpai pill above the phone bottom bar: "Ask Senpai", the live step
// during a run ("Scout: checking addresses, 3 of 4"), or "Ask about
// Ananya" with a selection. Tap opens the agent sheet.
// Shared file: owned by the foundation.
import { AnimatePresence, motion } from "framer-motion";
import { FiMessageCircle } from "react-icons/fi";
import { SKILL_STYLE } from "../config";
import { pendingDrafts } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { QUICK, useSafeReducedMotion } from "../motion";
import { cx, FOCUS_RING } from "../ui";

export function SenpaiPill() {
  const { s } = useB2C();
  const agent = useAgent();
  const reduced = useSafeReducedMotion();
  const live = agent.liveStep;
  // On Approvals the card on top carries "Ask Senpai" and "Make this warmer", so the
  // pill steps aside instead of covering the subject line (it comes back for a live run).
  if (!live && s.tab === "approvals" && pendingDrafts(s).length > 0) return null;
  const text = live
    ? `${SKILL_STYLE[live.skill].label}: ${live.label.charAt(0).toLowerCase()}${live.label.slice(1)}, ${live.index + 1} of ${live.total}`
    : s.focus
      ? `Ask about ${s.focus.label.split(",")[0]}`
      : "Ask Senpai";
  return (
    <div className="pointer-events-none flex justify-center px-4 pb-2">
      <button
        type="button"
        onClick={() => agent.open({ focus: !live, attach: s.focus ?? undefined })}
        aria-label={live ? `Senpai is working. ${text}. Open Senpai` : `${text}. Open Senpai`}
        className={cx(
          "pointer-events-auto inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border-2 border-studojo-ink py-1.5 pl-1.5 pr-4 font-satoshi text-sm font-bold shadow-brutal",
          live?.needsYou ? "bg-studojo-orange-bg" : live ? "bg-studojo-purple-bg" : "bg-white",
          FOCUS_RING,
        )}
      >
        <span aria-hidden className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-purple text-white">
          <FiMessageCircle />
          {live ? (
            <motion.span
              className={cx("absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white", live.needsYou ? "bg-studojo-orange" : "bg-studojo-green")}
              {...(reduced ? {} : { animate: { scale: [1, 1.3, 1] }, transition: { duration: 1.2, repeat: Infinity } })}
            />
          ) : null}
        </span>
        {/* popLayout, so a fast change of text never leaves the pill empty while the old text exits. */}
        <span className="relative min-w-0">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={text} className="block min-w-0 truncate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={QUICK}>
              {text}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>
    </div>
  );
}
