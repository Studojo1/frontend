// Profile strength: a signal meter, the score, and a checklist where every
// item has a one-tap way to do it. Owned by builder B (Your page).
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { PROFILE_CHECKS, profileStrength } from "../../data";
import { SPRING_SNAP, useMotionPresets } from "../../motion";
import type { ProfileCheckId, ProfileState } from "../../types";
import { AnimatedNumber, Badge, Card, cx, FOCUS_RING, SignalMeter } from "../../ui";
import { OtpPanel } from "./otp";
import { strengthWord } from "./profile-logic";

export interface StrengthProps {
  profile: ProfileState;
  onAddNumber: () => void;
  onEditHeadline: () => void;
  onEditAbout: () => void;
  onVerified: () => void;
}

const ACTION: Record<ProfileCheckId, string> = {
  number: "Put 1,200 users in my headline",
  "college-email": "Verify with a code",
  headline: "Edit the headline",
  about: "Edit the about",
};

export function Strength(p: StrengthProps) {
  const m = useMotionPresets();
  const [otpOpen, setOtpOpen] = useState(false);
  const value = profileStrength(p.profile);
  const done = PROFILE_CHECKS.filter((c) => p.profile.checks[c.id]).length;

  const run = (id: ProfileCheckId) => {
    if (id === "number") p.onAddNumber();
    else if (id === "college-email") setOtpOpen(true);
    else if (id === "headline") p.onEditHeadline();
    else p.onEditAbout();
  };

  return (
    <Card tone="white" shadow="md" pad="sm" aria-labelledby="jernew-strength-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="jernew-strength-title" className="font-clash text-lg font-semibold">
            Page strength
          </h2>
          <p className="font-satoshi text-sm text-studojo-muted">
            {done} of {PROFILE_CHECKS.length} done · {strengthWord(value)}
          </p>
        </div>
        <div className="flex items-end gap-3">
          <span className="font-clash text-4xl font-semibold leading-none tabular-nums">
            <AnimatedNumber value={value} />
            <span className="text-xl">%</span>
          </span>
        </div>
      </div>

      <SignalMeter value={value} label="Signal" valueText={strengthWord(value)} tone="page" bars={7} size="lg" className="mt-3" />

      <ul className="mt-4 grid items-start gap-2 lg:grid-cols-2">
        {PROFILE_CHECKS.map((c) => {
          const isDone = !!p.profile.checks[c.id];
          return (
            <li key={c.id} className={cx("rounded-xl border-2 px-3 py-2.5", isDone ? "border-studojo-ink/20 bg-studojo-green-bg/60" : "border-studojo-ink bg-white")}>
              <div className="flex items-start gap-3">
                <CheckMark done={isDone} />
                <div className="min-w-0 flex-1">
                  <p className={cx("font-satoshi text-sm font-bold", isDone ? "text-studojo-muted line-through decoration-2" : "text-studojo-ink")}>
                    {c.label}
                  </p>
                  {!isDone ? <p className="font-satoshi text-sm text-studojo-muted">{c.hint}</p> : null}
                  {!isDone && !(c.id === "college-email" && otpOpen) ? (
                    <button
                      type="button"
                      onClick={() => run(c.id)}
                      className={cx(
                        "-ml-1 mt-0.5 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-left font-satoshi text-sm font-bold text-studojo-purple-strong",
                        FOCUS_RING,
                      )}
                    >
                      {ACTION[c.id]} <FiArrowRight aria-hidden />
                    </button>
                  ) : null}
                </div>
                <span className="shrink-0">
                  <Badge kind={isDone ? "success" : "neutral"}>+{c.points}</Badge>
                </span>
              </div>
              <AnimatePresence initial={false}>
                {c.id === "college-email" && otpOpen && !isDone ? (
                  <motion.div key="otp" exit={{ opacity: 0 }} transition={{ duration: m.reduced ? 0 : 0.15 }}>
                    <OtpPanel
                      onClose={() => setOtpOpen(false)}
                      onVerified={() => {
                        setOtpOpen(false);
                        p.onVerified();
                      }}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/** Round check that draws itself in (scale and opacity only). */
function CheckMark({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden
      className={cx(
        "relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink",
        done ? "bg-studojo-green" : "bg-white",
      )}
    >
      <motion.svg
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5"
        initial={false}
        animate={{ scale: done ? 1 : 0, opacity: done ? 1 : 0, rotate: done ? 0 : -30 }}
        transition={SPRING_SNAP}
      >
        <path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </span>
  );
}
