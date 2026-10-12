// The controls for the visibility step: one switch per ring, the 18+
// confirmation, and the plain-language notice. Owned by builder B.
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiEye, FiHelpCircle, FiPower } from "react-icons/fi";
import { PROFILE_DRAFT } from "../../data";
import { SPRING_SNAP, useMotionPresets } from "../../motion";
import type { VisibilityState } from "../../types";
import { Card, cx, Switch } from "../../ui";
import { ringLive, RINGS, type RingId } from "./visibility-logic";

const COPY: Record<RingId, { label: string; description: ReactNode }> = {
  link: {
    label: "Anyone with the link",
    description: (
      <>
        Your page lives at <span className="font-bold text-studojo-ink">{PROFILE_DRAFT.url}</span>. Only people you send it to can open it,
        like the hiring managers in your follow-ups. Off keeps it private.
      </>
    ),
  },
  search: {
    label: "Show in search engines",
    description: "People who search your name could find your page. Off by default, and you can switch it off again any time.",
  },
  managers: {
    label: "Show me to hiring managers",
    description:
      "Studojo may suggest your page to hiring managers looking for someone like you. They see your page, never your phone or email. Off unless you switch it on.",
  },
};

export interface SwitchListProps {
  v: VisibilityState;
  locks: Record<RingId, string | null>;
  onToggle: (id: RingId, next: boolean) => void;
  onHot: (id: RingId | null) => void;
}

export function SwitchList({ v, locks, onToggle, onHot }: SwitchListProps) {
  return (
    <Card tone="white" shadow="md" pad="none" className="divide-y-2 divide-studojo-ink/10">
      {RINGS.map((ring, i) => (
        <div
          key={ring.id}
          className="flex gap-3 px-4 py-4 sm:px-5"
          onPointerEnter={() => onHot(ring.id)}
          onPointerLeave={() => onHot(null)}
          onFocus={() => onHot(ring.id)}
          onBlur={() => onHot(null)}
        >
          <RingMarker index={i} hex={ring.hex} lit={ringLive(v, ring.id)} pending={ring.id === "link" && v.link && !v.adult} />
          <Switch
            className="min-w-0 flex-1"
            tone="page"
            checked={v[ring.id] && !locks[ring.id]}
            pending={ring.id === "link" && !v.adult}
            pendingCaption="Turns on when you confirm 18+"
            onChange={(next) => onToggle(ring.id, next)}
            label={COPY[ring.id].label}
            description={COPY[ring.id].description}
            locked={Boolean(locks[ring.id])}
            lockedReason={locks[ring.id]}
          />
        </div>
      ))}
    </Card>
  );
}

/**
 * A small copy of the rings beside each switch. Its own ring lights with the
 * switch, so on a phone the change shows right where you tapped.
 */
function RingMarker({ index, hex, lit, pending }: { index: number; hex: string; lit: boolean; pending: boolean }) {
  const m = useMotionPresets();
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="mt-0.5 h-12 w-12 shrink-0">
      <defs>
        <pattern id={`jn-hatch-${index}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="5" fill="#ffffff" />
          <rect width="2.5" height="5" fill={hex} opacity="0.55" />
        </pattern>
      </defs>
      {[22, 16.5, 11].map((r, k) => {
        const mine = 2 - k === index;
        if (mine && pending) {
          return <circle key={r} cx="24" cy="24" r={r} fill={`url(#jn-hatch-${index})`} stroke="#171717" strokeWidth="1.6" strokeDasharray="3 2" />;
        }
        return (
          <motion.circle
            key={r}
            cx="24"
            cy="24"
            r={r}
            stroke="#171717"
            strokeWidth="1.6"
            strokeDasharray={mine && !lit ? "3 3" : undefined}
            initial={false}
            animate={{ fill: mine && lit ? hex : "#ffffff" }}
            transition={{ duration: m.reduced ? 0 : 0.2 }}
          />
        );
      })}
      <circle cx="24" cy="24" r="5" fill="#6d28d9" stroke="#171717" strokeWidth="1.2" />
    </svg>
  );
}

export function AdultCheck({ v, onChange, onPrivate }: { v: VisibilityState; onChange: (next: boolean) => void; onPrivate: () => void }) {
  const m = useMotionPresets();
  const needs = v.link && !v.adult;
  return (
    <Card tone={needs ? "yellow" : "white"} shadow="md" pad="sm">
      <label htmlFor="jernew-adult" className="flex min-h-11 cursor-pointer items-start gap-3">
        <input
          id="jernew-adult"
          type="checkbox"
          className="peer sr-only"
          checked={v.adult}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby="jernew-adult-help"
        />
        <span
          aria-hidden
          className={cx(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-studojo-ink shadow-[2px_2px_0_0_#191a23]",
            "peer-focus-visible:ring-4 peer-focus-visible:ring-studojo-purple/40 peer-focus-visible:ring-offset-2",
            v.adult ? "bg-studojo-pink" : "bg-white",
          )}
        >
          <motion.span initial={false} animate={{ scale: v.adult ? 1 : 0, opacity: v.adult ? 1 : 0 }} transition={m.reduced ? { duration: 0 } : SPRING_SNAP}>
            <FiCheck className="text-base text-studojo-ink" strokeWidth={4} />
          </motion.span>
        </span>
        <span className="min-w-0">
          <span className="block font-satoshi text-base font-bold">I am 18 or older</span>
          <span id="jernew-adult-help" className="mt-0.5 block font-satoshi text-sm text-studojo-muted">
            Needed for a public link. Under 18? Keep the link off and your page stays private.
          </span>
        </span>
      </label>
      <AnimatePresence initial={false}>
        {needs ? (
          <motion.div key="priv" variants={m.fade} initial="hidden" animate="show" exit="hidden" className="mt-2 pl-10">
            <button
              type="button"
              onClick={onPrivate}
              className="min-h-11 rounded-lg px-1 font-satoshi text-sm font-bold text-studojo-purple-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-studojo-purple/40"
            >
              Keep my page private instead
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}

const NOTICE = [
  {
    icon: <FiEye />,
    title: "What is shown",
    body: "Your name, headline, about, projects, experience and skills, exactly as you approved them. Never your phone number, email, home address or marks.",
  },
  {
    icon: <FiHelpCircle />,
    title: "Why",
    body: "So the hiring managers you email can see your work in one click, without opening an attachment.",
  },
  {
    icon: <FiPower />,
    title: "How to unpublish",
    body: "One tap on your dashboard. The page goes offline immediately and the link stops working. Switch it back on whenever you like.",
  },
];

export function PlainNotice() {
  return (
    <section aria-labelledby="jernew-notice-title" className="rounded-2xl border-2 border-dashed border-studojo-ink/50 bg-white/85 p-4 sm:p-5">
      <h2 id="jernew-notice-title" className="font-clash text-lg font-semibold">
        The plain version
      </h2>
      <ul className="mt-3 space-y-3">
        {NOTICE.map((n) => (
          <li key={n.title} className="flex gap-3">
            <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-studojo-ink bg-studojo-pink-bg">
              {n.icon}
            </span>
            <p className="font-satoshi text-sm leading-relaxed text-studojo-ink">
              <strong className="block">{n.title}</strong>
              {n.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
