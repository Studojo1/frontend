// Page tab, top of the tab: the status card (link, Copy link, instant
// Unpublish with a 10 second Undo), the private banner and Senpai's headline
// proposal as a word diff. Group 4.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiCopy, FiEyeOff, FiGlobe, FiLock, FiRotateCcw } from "react-icons/fi";
import { COPY, UNDO_MS } from "../config";
import { isMinor } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { PAGE_URL } from "../data";
import { QUICK, useMotionPresets } from "../motion";
import { Button, Card, cx, FOCUS_RING, PRESS, SkillChip } from "../ui";
import { checkClaim, wordDiff } from "./page-logic";

/** "Live, link-only, not in search" and friends. */
function reachLine(live: boolean, v: { link: boolean; search: boolean; managers: boolean; adult: boolean }): string {
  if (!live || !v.link) return "Private. Only you can open it.";
  if (!v.adult) return "Private until you confirm you are 18 or older.";
  const parts = ["Live", v.search ? "link and search" : "link-only", v.search ? "" : "not in search"];
  if (v.managers) parts.push("shown to hiring managers");
  return parts.filter(Boolean).join(", ");
}

export function StatusCard() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const m = useMotionPresets();
  const live = s.page.live;
  const minor = isMinor(s);
  const [copied, setCopied] = useState(false);
  // Inline Undo window after an Unpublish from this card. Local UI only.
  const [undoUntil, setUndoUntil] = useState<number | null>(null);
  const [left, setLeft] = useState(0);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    if (undoUntil === null) return;
    const tick = () => {
      const ms = undoUntil - Date.now();
      if (ms <= 0) {
        setUndoUntil(null);
        setLeft(0);
      } else setLeft(Math.ceil(ms / 1000));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [undoUntil]);

  useEffect(() => {
    if (live) setUndoUntil(null);
  }, [live]);

  useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${PAGE_URL}`);
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
      dispatch({ type: "TOAST", text: live ? "Link copied. It opens for anyone you send it to." : "Link copied. While private, it only opens for you." });
    } catch {
      dispatch({ type: "TOAST", text: `Copy did not work here. Your link: ${PAGE_URL}` });
    }
  };

  const unpublish = () => {
    dispatch({ type: "UNPUBLISH" });
    setUndoUntil(Date.now() + UNDO_MS);
    agent.note("Your page is private. Queued follow-ups now go without the link. Undo is right there for 10 seconds.");
  };

  const republish = (fromUndo: boolean) => {
    dispatch({ type: "REPUBLISH" });
    dispatch({ type: "CLEAR_TOAST" });
    setUndoUntil(null);
    agent.note(fromUndo ? "Undone. Your page is live again, link-only, and follow-ups carry the link." : "Your page is live again, link-only. Follow-ups carry the link from now on.");
  };

  return (
    <Card as="section" aria-labelledby="page-status" shadow="lg" tone={live ? "white" : "orange"} className="relative overflow-hidden">
      <div className="flex flex-wrap items-start gap-3">
        <span aria-hidden className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-studojo-ink text-lg", live ? "bg-studojo-pink-bg text-[#be185d]" : "bg-white text-studojo-ink")}>
          {live ? <FiGlobe /> : <FiLock />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="page-status" className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-muted">Your page</h2>
          <p className="truncate font-clash text-lg font-semibold text-studojo-ink sm:text-xl">{PAGE_URL}</p>
          <p className="mt-0.5 flex items-center gap-2 font-satoshi text-sm font-bold text-studojo-ink" aria-live="polite">
            <span className="relative flex h-2.5 w-2.5" aria-hidden>
              {live && !m.reduced ? <span className="absolute inset-0 animate-ping rounded-full bg-studojo-green opacity-60" /> : null}
              <span className={cx("relative h-2.5 w-2.5 rounded-full border border-studojo-ink", live ? "bg-studojo-green" : "bg-studojo-orange")} />
            </span>
            {reachLine(live, s.page.visibility)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" icon={copied ? <FiCheck /> : <FiCopy />} onClick={copy} aria-live="polite">
          {copied ? "Copied" : "Copy link"}
        </Button>
        {live ? (
          <Button variant="dark" size="sm" icon={<FiEyeOff />} onClick={unpublish}>
            Unpublish now
          </Button>
        ) : undoUntil !== null ? null : (
          <Button size="sm" icon={<FiGlobe />} onClick={() => republish(false)} disabled={minor} aria-describedby={minor ? "page-minor" : undefined}>
            Publish again, link-only
          </Button>
        )}
        <AnimatePresence>
          {!live && undoUntil !== null ? (
            <motion.button
              key="undo"
              type="button"
              initial={{ opacity: 0, scale: m.reduced ? 1 : 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={QUICK}
              onClick={() => republish(true)}
              className={cx("relative inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-xl border-2 border-studojo-ink bg-white px-3 font-satoshi text-sm font-bold shadow-brutal active:shadow-none", PRESS, FOCUS_RING)}
            >
              <motion.span
                aria-hidden
                className="absolute inset-y-0 left-0 w-full origin-left bg-studojo-yellow-bg"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: UNDO_MS / 1000, ease: "linear" }}
              />
              <span className="relative inline-flex items-center gap-2">
                <FiRotateCcw aria-hidden /> Undo <span className="tabular-nums text-studojo-muted">{left}s</span>
              </span>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
      <p className="mt-3 font-satoshi text-sm text-studojo-muted">
        {live ? "Unpublishing is instant. Follow-ups that have not gone yet switch to a version without the link." : COPY.privatePage}
      </p>
      {minor ? (
        <p id="page-minor" className="mt-2 inline-flex items-center gap-1.5 font-satoshi text-sm font-bold text-[#92400e]">
          <FiLock aria-hidden /> Under 18, your page stays private. Emails still go, without the link.
        </p>
      ) : null}
    </Card>
  );
}

/** Senpai's proposed headline (F9), shown as a word diff with Approve or Keep mine. */
export function HeadlineDiff() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const m = useMotionPresets();
  const next = s.page.pendingHeadline;
  return (
    <AnimatePresence initial={false}>
      {next ? (
        <motion.div key="diff" variants={m.pop} initial="hidden" animate="show" exit="hidden">
          <Card as="section" aria-labelledby="page-diff" tone="purple" shadow="md">
            <div className="flex flex-wrap items-center gap-2">
              <SkillChip skill="coach" />
              <h2 id="page-diff" className="font-satoshi text-sm font-bold text-studojo-ink">Senpai suggests a new headline</h2>
            </div>
            <p className="mt-3 font-clash text-lg leading-snug text-studojo-ink">
              {wordDiff(s.page.headline, next).map((p, i) => (
                <span key={i}>
                  <span
                    className={cx(
                      p.kind === "add" && "rounded bg-white px-0.5 text-studojo-purple-strong underline decoration-studojo-purple decoration-2 underline-offset-4",
                      p.kind === "del" && "text-studojo-muted line-through decoration-studojo-pink decoration-2",
                    )}
                  >
                    {p.kind === "add" ? <span className="sr-only">added: </span> : p.kind === "del" ? <span className="sr-only">removed: </span> : null}
                    {p.text}
                  </span>{" "}
                </span>
              ))}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 font-satoshi text-sm text-[#047857]">
              <FiCheck aria-hidden /> {checkClaim(next, []).reason}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  dispatch({ type: "SET_PAGE", patch: { headline: next, pendingHeadline: undefined }, note: "Approved the new headline on your page" });
                  agent.note("Headline updated. It shows on your page and in every follow-up card from now on.");
                }}
              >
                Approve
              </Button>
              <Button size="sm" variant="secondary" onClick={() => dispatch({ type: "SET_PAGE", patch: { pendingHeadline: undefined }, note: "Kept your own headline" })}>
                Keep mine
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
