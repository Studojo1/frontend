// The send timeline: a day 0 to 10 track with stops at day 0, 4 and 9. The
// filled part of the track grows to the email you are looking at. The day 4
// row holds your page card until the follow-up is open, then the card flies
// into the email. Owned by builder C.
import { motion } from "framer-motion";
import { FiCornerUpLeft } from "react-icons/fi";
import { SEND_TIMELINE, type EmailDraft } from "../../data";
import { SPRING, SPRING_SNAP, useMotionPresets } from "../../motion";
import type { ProfileState } from "../../types";
import { Card, cx, FOCUS_RING } from "../../ui";
import { MiniLabel } from "./bits";
import { PageCard, PageCardGhost } from "./page-card";

const SPAN = 10;
const pct = (day: number) => (day / SPAN) * 100;

export function SendTimeline({
  drafts,
  index,
  onPick,
  profile,
  pageLive = true,
}: {
  drafts: EmailDraft[];
  index: number;
  onPick: (i: number) => void;
  profile: ProfileState;
  /** False when the page is private: the follow-up goes without it. */
  pageLive?: boolean;
}) {
  const m = useMotionPresets();
  const active = drafts[index];

  return (
    <Card shadow="md" pad="md">
      <div className="flex items-center justify-between gap-2">
        <MiniLabel>Send timeline</MiniLabel>
        <span className="font-satoshi text-xs font-bold text-studojo-muted">3 emails over 9 days</span>
      </div>

      {/* Track */}
      <div className="relative mx-5 mb-2 mt-6 h-[76px]">
        <div aria-hidden className="absolute inset-x-0 top-[20px] h-2 rounded-full border-2 border-studojo-ink bg-white" />
        <motion.div
          aria-hidden
          className="absolute left-0 top-[20px] h-2 w-full origin-left rounded-full border-2 border-studojo-ink bg-studojo-orange"
          initial={false}
          animate={{ scaleX: Math.max(0.02, pct(active.day) / 100) }}
          transition={m.reduced ? { duration: 0 } : SPRING}
        />
        {Array.from({ length: SPAN + 1 }, (_, d) => (
          <span
            key={d}
            aria-hidden
            className="absolute top-[34px] h-2 w-[2px] -translate-x-1/2 bg-studojo-ink/25"
            style={{ left: `${pct(d)}%` }}
          />
        ))}
        {drafts.map((d, i) => {
          const on = i === index;
          const passed = d.day <= active.day;
          return (
            <button
              key={d.id}
              type="button"
              aria-pressed={on}
              aria-label={`Day ${d.day}: ${d.label}`}
              onClick={() => onPick(i)}
              className={cx("absolute top-0 flex -translate-x-1/2 flex-col items-center rounded-xl", FOCUS_RING)}
              style={{ left: `${pct(d.day)}%` }}
            >
              <span className="relative flex h-11 w-11 items-center justify-center">
                {on ? (
                  <motion.span
                    layoutId={m.reduced ? undefined : "email-tl-cursor"}
                    transition={SPRING_SNAP}
                    className="absolute inset-0 rounded-full border-2 border-studojo-ink bg-studojo-orange-bg"
                  />
                ) : null}
                <span
                  className={cx(
                    "relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-studojo-ink font-clash text-xs font-semibold",
                    passed ? "bg-studojo-orange text-studojo-ink" : "bg-white text-studojo-ink",
                  )}
                >
                  {i + 1}
                </span>
              </span>
              <span className={cx("mt-1 whitespace-nowrap font-satoshi text-xs font-bold", on ? "text-studojo-ink" : "text-studojo-muted")}>
                Day {d.day}
              </span>
            </button>
          );
        })}
      </div>

      {/* What each email does */}
      <ol className="mt-2 space-y-2">
        {SEND_TIMELINE.map((t, i) => {
          const on = i === index;
          return (
            <li
              key={t.id}
              className={cx(
                "rounded-xl border-2 px-3 py-2.5 transition-colors duration-200",
                on ? "border-studojo-ink bg-studojo-orange-bg" : "border-studojo-ink/15 bg-white",
              )}
            >
              <p className="flex flex-wrap items-baseline gap-x-2 font-satoshi text-sm">
                <span className="font-bold text-studojo-ink">{t.label}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#b45309]">Day {t.day}</span>
              </p>
              <p className="mt-0.5 font-satoshi text-sm text-studojo-muted">
                {t.id === "follow" && !pageLive ? "A short nudge. Your page stays out of it while it is private." : t.note}
              </p>
              {t.id === "follow" && pageLive ? (
                <div className="mt-2.5">
                  {active.pageCard ? <PageCardGhost /> : <PageCard profile={profile} compact reduced={m.reduced} />}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="mt-3 flex items-start gap-2 font-satoshi text-sm text-studojo-ink">
        <FiCornerUpLeft aria-hidden className="mt-0.5 shrink-0" />
        <span>
          <strong>A reply stops the rest.</strong> If someone answers, they never get the next email.
        </span>
      </p>
    </Card>
  );
}
