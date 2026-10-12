// The person drawer's body: address status, "Why them" with evidence chips,
// and the thread timeline. Owned by Group 2.
import { motion } from "framer-motion";
import { FiAlertTriangle, FiCheck, FiCheckCircle, FiClock, FiEye, FiFileText, FiMail, FiMessageSquare, FiMoon, FiStar, FiX } from "react-icons/fi";
import type { ReactNode } from "react";
import type { PersonView } from "../core/derive";
import { useB2C } from "../core/store";
import { lineById, PAGE_URL, RESUME_SECTION_LABEL } from "../data";
import { SPRING, useMotionPresets } from "../motion";
import { cx, EvidenceChip, SimNote } from "../ui";
import { threadOf, type ThreadItem, type ThreadStatus } from "./people-model";

export function AddressStatus({ v }: { v: PersonView }) {
  const ok = v.p.address === "verified";
  return (
    <p
      className={cx(
        "flex items-start gap-2 rounded-xl border-2 px-3 py-2 font-satoshi text-sm",
        ok ? "border-studojo-green bg-studojo-green-bg text-[#047857]" : "border-studojo-orange bg-studojo-orange-bg text-[#92400e]",
      )}
    >
      {ok ? <FiCheckCircle aria-hidden className="mt-0.5 shrink-0" /> : <FiAlertTriangle aria-hidden className="mt-0.5 shrink-0" />}
      <span>
        <b>{ok ? "Verified address." : "Risky address."}</b>{" "}
        {ok ? "Checked before a credit was spent." : "Senpai will not spend a credit on it."}
      </span>
    </p>
  );
}

export function WhyThem({ v }: { v: PersonView }) {
  const { p } = v;
  return (
    <section aria-labelledby={`why-${p.id}`}>
      <div className="flex items-center gap-2">
        <h3 id={`why-${p.id}`} className="font-clash text-base font-semibold">
          Why them
        </h3>
        <span className="font-satoshi text-xs text-studojo-muted">
          Fit {p.fit} <SimNote kind="sample" className="ml-1" />
        </span>
      </div>
      <p className="mt-1 font-satoshi text-sm text-studojo-ink">{p.why}</p>
      <p className="mt-1 font-satoshi text-sm text-studojo-muted">
        {p.company} builds {p.hook}. {p.stageLabel}, {p.city}. Hiring for {p.hiringFor}.
      </p>
      {p.evidence.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {p.evidence.map((id) => {
            const line = lineById(id);
            if (!line) return null;
            const section = RESUME_SECTION_LABEL[line.section] || "Resume";
            return <EvidenceChip key={id} lineId={id} label={`${section}: ${shorten(line.text)}`} />;
          })}
        </div>
      ) : null}
    </section>
  );
}

const shorten = (t: string) => (t.length > 28 ? `${t.slice(0, 26).trimEnd()}...` : t);

const ICON: Record<ThreadItem["kind"], ReactNode> = {
  draft: <FiFileText />,
  first: <FiMail />,
  follow: <FiMail />,
  opened: <FiEye />,
  reply: <FiMessageSquare />,
  nudge: <FiMail />,
  outcome: <FiStar />,
  snooze: <FiMoon />,
};

const DOT: Record<ThreadStatus, string> = {
  done: "bg-studojo-ink text-white",
  next: "bg-studojo-purple text-white",
  later: "bg-white text-studojo-muted border-dashed",
  off: "bg-studojo-surface-muted text-studojo-muted",
  waiting: "bg-studojo-orange-bg text-[#92400e]",
};

const STATUS_WORD: Record<ThreadStatus, ReactNode> = {
  done: <FiCheck aria-label="done" />,
  next: "Next",
  later: <FiClock aria-label="scheduled" />,
  off: <FiX aria-label="not sent" />,
  waiting: "Needs you",
};

export function ThreadTimeline({ v }: { v: PersonView }) {
  const { s } = useB2C();
  const m = useMotionPresets();
  const items = threadOf(s, v);
  return (
    <section aria-labelledby={`thread-${v.p.id}`}>
      <div className="flex items-center gap-2">
        <h3 id={`thread-${v.p.id}`} className="font-clash text-base font-semibold">
          Thread
        </h3>
        <SimNote kind="simulated" />
      </div>
      <ol className="relative mt-2 space-y-1">
        <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-0.5 bg-studojo-ink/15" />
        {items.map((it, i) => (
          <motion.li
            key={it.id}
            initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={m.reduced ? { duration: 0.18 } : { ...SPRING, delay: i * 0.05 }}
            className="relative flex gap-3 py-1"
          >
            <span aria-hidden className={cx("relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink text-sm", DOT[it.status])}>
              {ICON[it.kind]}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className={cx("flex flex-wrap items-baseline gap-x-2 font-satoshi text-sm", it.status === "off" && "text-studojo-muted line-through decoration-studojo-ink/30")}>
                <b className={it.status === "off" ? "font-medium" : undefined}>{it.label}</b>
                {it.when ? <span className="text-xs text-studojo-muted no-underline">{it.when}</span> : null}
                <span className="ml-auto inline-flex items-center text-[11px] font-bold uppercase tracking-wide text-studojo-muted">{STATUS_WORD[it.status]}</span>
              </p>
              {it.detail ? <p className="mt-0.5 line-clamp-3 font-satoshi text-sm text-studojo-muted">{it.detail}</p> : null}
              {it.kind === "follow" && it.status !== "off" && s.page.live ? <PageCard /> : null}
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

/** The page card that rides along in a follow-up. */
function PageCard() {
  const url = PAGE_URL.replace(/^https?:\/\//, "");
  return (
    <span className="mt-1.5 flex items-center gap-2 rounded-lg border-2 border-studojo-ink bg-studojo-purple-bg px-2 py-1.5 font-satoshi text-xs">
      <FiFileText aria-hidden className="shrink-0 text-studojo-purple-strong" />
      <span className="min-w-0 truncate">
        <b>Riya's page</b> <span className="text-studojo-muted">{url}</span>
      </span>
    </span>
  );
}
