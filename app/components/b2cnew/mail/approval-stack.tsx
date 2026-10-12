// The approval stack: the top draft in full, two peeking behind it. Swipe
// right to approve (the card tilts, a stamp lands, the shadow collapses,
// then it flies into its send-day slot), left to skip, up to edit. Every
// swipe has a button and a key (A, S, E).
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { animate, motion, useDragControls, useMotionValue, useTransform, type MotionValue, type PanInfo } from "framer-motion";
import { needsCredit, personById } from "../core/derive";
import { chipFor } from "../core/engine";
import { useB2C } from "../core/store";
import { dayDate } from "../data";
import { LAYOUT, SPRING, stampVariants, useSafeReducedMotion } from "../motion";
import { useHotkeys } from "../shell/keys";
import type { Draft } from "../types";
import { cx, LiveRegion } from "../ui";
import { ApprovalCardBody, draftLabel, Recipient } from "./approval-card";
import { slotPreview } from "./helpers";

const SWIPE_X = 110;
const SWIPE_UP = 90;

export function ApprovalStack({ drafts }: { drafts: Draft[] }) {
  const { s, dispatch } = useB2C();
  const reduced = useSafeReducedMotion();
  const [editing, setEditing] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<{ id: string; dir: "approve" | "skip" } | null>(null);
  const [said, setSaid] = useState("");
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const tilt = useMotionValue(0);
  const rotate = useTransform(() => Math.max(-6, Math.min(6, x.get() / 55 + tilt.get())));
  const approveInk = useTransform(x, [30, SWIPE_X], [0, 1]);
  const skipInk = useTransform(x, [-SWIPE_X, -30], [1, 0]);
  const editInk = useTransform(y, [-SWIPE_UP, -24], [1, 0]);
  const controls = useDragControls();
  const timers = useRef(new Set<number>());
  useEffect(() => {
    const all = timers.current;
    return () => all.forEach((t) => window.clearTimeout(t));
  }, []);

  const top = drafts[0];
  const peeks = drafts.slice(1, 3);
  const p = top ? personById(s, top.personId) : undefined;
  const label = top ? draftLabel(top, p) : "";

  // The top card is what "Make this warmer" and the composer talk about.
  useEffect(() => {
    if (top && s.focus?.id !== top.id) dispatch({ type: "FOCUS", item: chipFor.draft(top, label) });
    // Only when the top card changes.
  }, [top?.id]);

  useLayoutEffect(() => {
    x.jump(0);
    y.jump(0);
    tilt.jump(0);
  }, [top?.id]);

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, reduced ? Math.min(ms, 120) : ms);
    timers.current.add(id);
  };

  const approve = () => {
    if (!top || leaving) return;
    // No credit left: the reducer refuses and says to top up. No stamp, no flight.
    if (needsCredit(s, top)) {
      animate(x, 0, SPRING);
      animate(y, 0, SPRING);
      dispatch({ type: "APPROVE_DRAFT", id: top.id });
      return;
    }
    const slot = slotPreview(s, top.missionId);
    setLeaving({ id: top.id, dir: "approve" });
    setEditing(null);
    if (!reduced) {
      animate(tilt, 4 - Math.max(-6, Math.min(6, x.get() / 55)), SPRING);
      animate(y, 0, SPRING);
    }
    later(() => {
      dispatch({ type: "APPROVE_DRAFT", id: top.id });
      dispatch({ type: "TOAST", text: `Approved. ${p?.first ?? "It"} gets it ${dayDate(slot).label}, inside the cap.`, undo: { type: "UNAPPROVE_DRAFT", id: top.id } });
      setSaid(`Approved the ${label}. Goes out ${dayDate(slot).label}.`);
      setLeaving(null);
    }, 420);
  };

  const skip = () => {
    if (!top || leaving) return;
    setLeaving({ id: top.id, dir: "skip" });
    setEditing(null);
    if (!reduced) {
      animate(x, -520, { duration: 0.24, ease: [0.4, 0, 1, 1] });
    }
    later(() => {
      dispatch({ type: "SKIP_DRAFT", id: top.id });
      dispatch({ type: "TOAST", text: `Skipped ${p?.first ?? "them"}. No credit used.`, undo: { type: "RESTORE_DRAFT", id: top.id } });
      setSaid(`Skipped the ${label}. No credit used.`);
      setLeaving(null);
    }, 240);
  };

  const edit = () => {
    if (!top || leaving) return;
    animate(x, 0, SPRING);
    animate(y, 0, SPRING);
    setEditing(top.id);
  };

  useHotkeys({ a: approve, s: skip, e: edit }, !!top && !editing && !leaving && !top.diff && s.tab === "approvals");

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dx = info.offset.x + info.velocity.x * 0.15;
    const dy = info.offset.y + info.velocity.y * 0.15;
    if (dx > SWIPE_X) approve();
    else if (dx < -SWIPE_X) skip();
    else if (dy < -SWIPE_UP && Math.abs(info.offset.x) < SWIPE_X) edit();
    else {
      animate(x, 0, SPRING);
      animate(y, 0, SPRING);
    }
  };

  const startDrag = (e: ReactPointerEvent) => {
    if (!top || editing === top.id || leaving || top.diff) return;
    const t = e.target as HTMLElement;
    if (t.closest("button,a,input,textarea,select,label,[role=note],[role=button]")) return;
    controls.start(e);
  };

  if (!top) return null;
  const isEditing = editing === top.id;
  const stamping = leaving?.id === top.id && leaving.dir === "approve";

  return (
    <div className="relative pb-6">
      <LiveRegion message={said} />
      {peeks.map((d, i) => (
        <div
          key={d.id}
          aria-hidden
          className="absolute inset-x-0 top-0 rounded-2xl border-2 border-studojo-ink bg-white p-4 shadow-brutal"
          style={{ bottom: 24, transform: `translateY(${(i + 1) * 12}px) scale(${1 - (i + 1) * 0.04})`, transformOrigin: "50% 100%", zIndex: 2 - i }}
        >
          <div className="opacity-50">
            <Recipient d={d} p={personById(s, d.personId)} />
          </div>
        </div>
      ))}
      <motion.article
        key={top.id}
        aria-label={`${label}. ${drafts.length} waiting.`}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING}
        drag={!isEditing && !top.diff && !leaving}
        dragControls={controls}
        dragListener={false}
        dragDirectionLock
        dragMomentum={false}
        onDragEnd={onDragEnd}
        onPointerDown={startDrag}
        style={{ x, y, rotate, zIndex: 5, touchAction: "pan-y" }}
        className={cx(
          "relative rounded-2xl border-2 border-studojo-ink bg-white p-4 transition-shadow duration-200 sm:p-5",
          stamping ? "translate-x-[3px] translate-y-[3px] shadow-none" : "shadow-brutal-lg",
          !isEditing && !top.diff && "cursor-grab active:cursor-grabbing",
        )}
      >
        {/* The invisible twin that flies into the send slot (shared layoutId with the schedule). */}
        <motion.span layoutId={LAYOUT.draft(top.id)} aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl opacity-0" />
        <div className="mb-2 flex touch-none items-center justify-between gap-2 font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-muted">
          <span>
            {label.split(" to ")[0]} · 1 of {drafts.length}
          </span>
          <span aria-hidden className="h-1.5 w-10 rounded-full bg-studojo-ink/20" />
        </div>
        <ApprovalCardBody d={top} onApprove={approve} onSkip={skip} editing={isEditing} setEditing={(v) => setEditing(v ? top.id : null)} pinActions />

        {/* Swipe ink: what letting go would do. */}
        <SwipeInk value={approveInk} className="right-4 top-12 rotate-[8deg] border-studojo-purple-strong text-studojo-purple-strong">Approve</SwipeInk>
        <SwipeInk value={skipInk} className="left-4 top-12 -rotate-[8deg] border-studojo-ink text-studojo-ink">Skip</SwipeInk>
        <SwipeInk value={editInk} className="left-1/2 top-3 -translate-x-1/2 border-[#854d0e] text-[#854d0e]">Edit</SwipeInk>

        {stamping ? (
          <motion.span
            variants={stampVariants(reduced)}
            initial="hidden"
            animate="show"
            aria-hidden
            className="pointer-events-none absolute right-5 top-16 rounded-xl border-4 border-studojo-purple-strong bg-white/90 px-3 py-1 font-clash text-2xl font-bold uppercase tracking-wider text-studojo-purple-strong"
          >
            Approved
          </motion.span>
        ) : null}
      </motion.article>
    </div>
  );
}

function SwipeInk({ value, className, children }: { value: MotionValue<number>; className: string; children: string }) {
  return (
    <motion.span
      aria-hidden
      style={{ opacity: value }}
      className={cx("pointer-events-none absolute rounded-lg border-[3px] bg-white/90 px-2 py-0.5 font-clash text-lg font-bold uppercase tracking-wider", className)}
    >
      {children}
    </motion.span>
  );
}
