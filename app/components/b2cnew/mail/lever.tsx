// AutopilotLever. compact: the chip in the mission header and Approvals
// (tapping it opens the lever sheet). Full: the content of the lever sheet
// (the shell wraps it in a <Sheet>). Three notches; raising takes a 600ms
// hold, lowering is instant; notch 3 unlocks after 20 approvals, 18+ only.
import { useState } from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiArrowUp, FiCheckSquare, FiHelpCircle, FiMail } from "react-icons/fi";
import { COPY, NOTCH3_UNLOCK, NOTCHES, notchMeta } from "../config";
import { isMinor } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C, useMission } from "../core/store";
import { useMotionPresets } from "../motion";
import type { Notch } from "../types";
import { Button, cx, FOCUS_RING, LiveRegion, PRESS } from "../ui";
import { Guardrails, NotchRow, Throttle, useHold } from "./lever-parts";

const HOLD_MS = 600;

export function AutopilotLever({ compact = false }: { compact?: boolean }) {
  const { dispatch } = useB2C();
  const m = useMission();
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => dispatch({ type: "SHEET", sheet: "lever" })}
        aria-label={`Autopilot: ${notchMeta(m.notch).name}. Change it`}
        className={cx("inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-studojo-ink bg-white px-3 font-satoshi text-xs font-bold shadow-[2px_2px_0_0_#191a23] hover:bg-studojo-purple-bg active:shadow-none", PRESS, FOCUS_RING)}
      >
        <span aria-hidden className="flex h-4 flex-col-reverse gap-[2px]">
          {[1, 2, 3].map((n) => (
            <span key={n} className={cx("h-[3px] w-3 rounded-full", n <= m.notch ? "bg-studojo-purple-strong" : "bg-studojo-ink/20")} />
          ))}
        </span>
        Autopilot: {notchMeta(m.notch).name}
      </button>
    );
  }
  return <FullLever />;
}

function FullLever() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const m = useMission();
  const motionP = useMotionPresets();
  const [target, setTarget] = useState<Notch | null>(null);
  const [said, setSaid] = useState("");
  const minor = isMinor(s);
  const lock3 = minor
    ? "18 or older only. Your page stays private, and Batch is as high as it goes."
    : m.approvals < NOTCH3_UNLOCK
      ? `Unlocks after ${NOTCH3_UNLOCK} approvals in this mission. You have ${m.approvals}.`
      : null;

  const setNotch = (n: Notch) => {
    const old = m.notch;
    dispatch({ type: "SET_NOTCH", missionId: m.id, notch: n });
    dispatch({ type: "TOAST", text: `Autopilot: ${notchMeta(n).name}. ${n < old ? "Lowered straight away." : "Lower it any time."}`, undo: { type: "SET_NOTCH", missionId: m.id, notch: old } });
    agent.note(
      n === 3
        ? `Autopilot is on ${notchMeta(3).name} for ${m.short}. First emails to people above fit ${m.fitFloor} go inside the cap, with every guardrail on. I still never reply for you.`
        : n === 2
          ? `Autopilot is on Batch for ${m.short}. You can approve a whole run in one tap, and follow-ups to people you approved go on schedule.`
          : `Autopilot is on Ask me for ${m.short}. Every email waits for your tap, follow-ups included.`,
    );
    setSaid(`Autopilot set to ${notchMeta(n).name}.`);
    setTarget(null);
  };
  const hold = useHold(HOLD_MS, () => {
    if (target && target > m.notch) setNotch(target);
  });

  const pick = (n: Notch) => {
    if (n === m.notch) return setTarget(null);
    if (n < m.notch) return setNotch(n);
    setTarget(n);
  };

  const pickedLocked = target === 3 && lock3;

  return (
    <div className="space-y-4">
      <LiveRegion message={said} />
      {s.gmail.paused ? (
        <p className="flex items-center gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-orange-bg px-3 py-2 font-satoshi text-sm text-[#92400e]">
          <FiAlertTriangle aria-hidden className="shrink-0" />
          Sending is paused, so no notch sends anything until you resume.
        </p>
      ) : null}

      <div className="flex gap-3">
        <Throttle notch={m.notch} target={target} holding={hold.holding} ms={HOLD_MS} lockedFrom={lock3 ? 3 : null} />
        <div role="radiogroup" aria-label={`Autopilot for ${m.short}`} className="flex min-w-0 flex-1 flex-col">
          {[...NOTCHES].reverse().map((n) => (
            <NotchRow key={n.n} n={n.n} current={m.notch} picked={target === n.n} locked={n.n === 3 ? lock3 : null} onPick={() => pick(n.n)} />
          ))}
        </div>
      </div>

      {target && target > m.notch ? (
        <motion.div
          key={target}
          variants={motionP.pop}
          initial="hidden"
          animate="show"
          className="space-y-3 rounded-2xl border-2 border-studojo-ink bg-white p-3 shadow-brutal"
        >
          {pickedLocked ? (
            <LockedPanel reason={lock3} approvals={m.approvals} minor={minor} fitFloor={m.fitFloor} onReview={() => {
              dispatch({ type: "SHEET", sheet: null });
              dispatch({ type: "SET_TAB", tab: "approvals" });
            }} />
          ) : (
            <>
              <div>
                <p className="font-clash text-lg font-semibold">Raise to {notchMeta(target).name}</p>
                <p className="mt-0.5 font-satoshi text-sm text-studojo-muted">{notchMeta(target).may}</p>
              </div>
              {target === 3 ? <Guardrails fitFloor={m.fitFloor} /> : null}
              <ul className="space-y-1 font-satoshi text-sm">
                <li>Stays the same: you can lower it any time, and it takes effect at once.</li>
                <li>Stays the same: replies are yours. Senpai only puts drafts in Gmail drafts.</li>
              </ul>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  {...hold.handlers}
                  aria-label={`Hold to raise autopilot to ${notchMeta(target).name}`}
                  className={cx(
                    "relative inline-flex min-h-12 touch-none select-none items-center gap-2 overflow-hidden rounded-xl border-2 border-studojo-ink bg-studojo-purple-strong px-5 font-satoshi text-base font-bold text-white shadow-brutal",
                    PRESS,
                    FOCUS_RING,
                  )}
                >
                  <motion.span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-full origin-left bg-white/25"
                    initial={false}
                    animate={{ scaleX: hold.holding ? 1 : 0 }}
                    transition={hold.holding ? { duration: HOLD_MS / 1000, ease: "linear" } : { duration: 0.15 }}
                  />
                  <FiArrowUp aria-hidden className="relative" />
                  <span className="relative">Hold to raise</span>
                </button>
                <Button variant="ghost" size="sm" onClick={() => setTarget(null)}>
                  Not now
                </Button>
              </div>
            </>
          )}
        </motion.div>
      ) : null}

      <NeverReplies />

      <button
        type="button"
        onClick={() => {
          dispatch({ type: "SHEET", sheet: null });
          agent.open({ focus: false });
          agent.start("F11", { value: m.notch });
        }}
        className={cx("inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-studojo-ink bg-studojo-purple-bg px-3 font-satoshi text-sm font-bold text-studojo-purple-strong", FOCUS_RING)}
      >
        <FiHelpCircle aria-hidden />
        What does autopilot change?
      </button>
    </div>
  );
}

function LockedPanel({ reason, approvals, minor, fitFloor, onReview }: { reason: string | null; approvals: number; minor: boolean; fitFloor: number; onReview: () => void }) {
  const pct = Math.min(100, (approvals / NOTCH3_UNLOCK) * 100);
  return (
    <div className="space-y-2">
      <p className="font-clash text-lg font-semibold">{notchMeta(3).name} is locked</p>
      <p className="font-satoshi text-sm text-studojo-ink">{reason}</p>
      {minor ? null : (
        <>
          <div
            role="progressbar"
            aria-label="Approvals toward notch 3"
            aria-valuemin={0}
            aria-valuemax={NOTCH3_UNLOCK}
            aria-valuenow={approvals}
            className="h-3 overflow-hidden rounded-full border-2 border-studojo-ink bg-white"
          >
            <div className="h-full bg-studojo-purple" style={{ width: `${pct}%` }} />
          </div>
          <p className="font-satoshi text-xs text-studojo-muted">You earn it by approving drafts yourself first, so Senpai learns what you would send.</p>
          <p className="pt-1 font-satoshi text-xs font-bold uppercase tracking-[0.12em] text-studojo-muted">What it would do, inside these guardrails</p>
          <Guardrails fitFloor={fitFloor} dim />
          <Button size="sm" variant="secondary" icon={<FiCheckSquare />} onClick={onReview}>
            Review drafts
          </Button>
        </>
      )}
    </div>
  );
}

/** Lit green at every notch. */
function NeverReplies() {
  const m = useMotionPresets();
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-studojo-ink bg-studojo-green-bg px-3 py-2.5 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]">
      <span className="relative flex h-3 w-3 shrink-0">
        <motion.span aria-hidden className="absolute inset-0 rounded-full bg-studojo-green" {...m.loop({ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }, 2.2)} />
        <span aria-hidden className="relative h-3 w-3 rounded-full border-2 border-studojo-ink bg-studojo-green" />
      </span>
      <FiMail aria-hidden className="shrink-0 text-[#047857]" />
      <p className="font-satoshi text-sm font-bold text-[#047857]">{COPY.neverReplies}</p>
    </div>
  );
}
