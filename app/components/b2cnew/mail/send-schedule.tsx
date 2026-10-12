// The send schedule: seven day slots on the DAILY_SEND_CAP ramp. Ink is
// what your pack already has queued; violet blocks are drafts you approved
// here, and each one is the landing spot for its card's flight.
import { motion } from "framer-motion";
import { FiPause } from "react-icons/fi";
import { personById } from "../core/derive";
import { useB2C, useMission } from "../core/store";
import { DAILY_SEND_CAP } from "../data";
import { LAYOUT, SPRING_SOFT } from "../motion";
import { cx, SectionHeader, SimNote } from "../ui";
import { sendSchedule } from "./helpers";

export function SendSchedule({ className }: { className?: string }) {
  const { s } = useB2C();
  const m = useMission();
  const days = sendSchedule(s, m.total);
  const held = s.gmail.paused;
  const mine = days.reduce((n, d) => n + d.approved.length, 0);
  return (
    <section aria-labelledby="ap-schedule" className={className}>
      <SectionHeader
        id="ap-schedule"
        as="h3"
        title="Send schedule"
        kicker={held ? "Held" : `Next 7 days · cap ${DAILY_SEND_CAP[0]} to ${DAILY_SEND_CAP[DAILY_SEND_CAP.length - 1]}`}
        action={<SimNote />}
      />
      <div className="rounded-2xl border-2 border-studojo-ink bg-white p-3 shadow-[2px_2px_0_0_#191a23]">
        <ol className="grid grid-cols-7 gap-1.5" aria-label="Send days">
          {days.map((d) => {
            const used = d.planned + d.approved.length;
            const plannedPct = Math.min(100, (d.planned / d.cap) * 100);
            return (
              <li
                key={d.day}
                aria-label={`${d.weekday} ${d.label}${d.isToday ? ", today" : ""}: ${held ? "held" : `${used} of ${d.cap}`}, ${d.approved.length} you approved`}
                className={cx(
                  "flex min-w-0 flex-col items-center gap-1 rounded-xl px-0.5 py-1.5",
                  d.isToday ? "outline-2 outline-offset-0 outline-studojo-purple outline-dashed bg-studojo-purple-bg/50" : "",
                )}
              >
                <span className={cx("font-satoshi text-[11px] font-bold uppercase", d.isToday ? "text-studojo-purple-strong" : "text-studojo-muted")}>{d.weekday}</span>
                <div
                  className={cx(
                    "relative flex h-24 w-full max-w-9 flex-col-reverse overflow-hidden rounded-md border-2",
                    held ? "border-dashed border-[#92400e]/50 bg-studojo-orange-bg" : "border-studojo-ink bg-white",
                  )}
                >
                  {!held && plannedPct > 0 ? <span aria-hidden className="w-full shrink-0 bg-studojo-ink" style={{ height: `${plannedPct}%` }} /> : null}
                  {d.approved.map((a) => (
                    <motion.span
                      key={a.id}
                      layoutId={LAYOUT.draft(a.id)}
                      transition={SPRING_SOFT}
                      title={personById(s, a.personId)?.company}
                      className={cx("w-full shrink-0 border-t border-white", held ? "bg-studojo-purple/40" : "bg-studojo-purple")}
                      style={{ height: `${Math.max(4, 100 / d.cap)}%`, borderRadius: 2 }}
                    />
                  ))}
                  {held ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <FiPause aria-hidden className="text-[#92400e]" />
                    </span>
                  ) : null}
                </div>
                <span className="font-satoshi text-[11px] tabular-nums text-studojo-muted">{held ? "Held" : `${used}/${d.cap}`}</span>
                <span className={cx("font-satoshi text-[10px] leading-none", d.isToday ? "font-bold text-studojo-purple-strong" : "text-studojo-muted")}>{d.isToday ? "today" : d.label.split(" ")[0]}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-satoshi text-xs text-studojo-muted">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-studojo-ink" />
            Already queued from your pack
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-studojo-purple" />
            You approved here ({mine})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm outline-2 outline-dashed outline-studojo-purple" />
            Today
          </span>
        </div>
        <p className="mt-2 font-satoshi text-xs text-studojo-ink">
          {held ? "Sending is paused, so every day is held. Approvals keep their place." : "Up to 10 of your approvals a day, never past the day's cap. A steady trickle, never all at once."}
        </p>
      </div>
    </section>
  );
}
