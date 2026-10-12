// The intro's three-part visual: your page, your people, your inbox, joined
// by a line with a travelling dot. Owned by the foundation (part of Intro).
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiInbox, FiUsers } from "react-icons/fi";
import { PROFILE_DRAFT, rankMatches, SIM_REPLIES, MATCHES, REPLY_TAG_STYLE } from "../data";
import { initialData } from "../flow-state";
import { useMotionPresets } from "../motion";
import { Badge, BrowserFrame, Card, cx } from "../ui";

// Fixed sample: the same three people on the server and in the browser.
const PEOPLE = rankMatches({ ...initialData().quiz, role: "sde", cities: ["pune", "bengaluru"], stage: 1 }).slice(0, 3);
const REPLY = SIM_REPLIES.find((r) => r.tag === "Positive") ?? SIM_REPLIES[0];
const REPLY_FROM = MATCHES.find((m) => m.id === REPLY.matchId);

export function IntroVisual({ animateIn }: { animateIn: boolean }) {
  const m = useMotionPresets();
  return (
    <motion.ol
      aria-label="What you get"
      className="relative mx-auto w-full max-w-md space-y-0 lg:max-w-none"
      variants={m.list}
      initial={animateIn ? "hidden" : false}
      animate="show"
    >
      <Panel n={1} label="Your page" tone="bg-studojo-pink-bg" className="lg:mr-14 lg:-rotate-2">
        <BrowserFrame url={PROFILE_DRAFT.url} className="shadow-none">
          <div className="space-y-2 p-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-purple-bg font-clash text-sm font-semibold">
                {PROFILE_DRAFT.initials}
              </span>
              <span className="min-w-0">
                <span className="block font-clash text-base font-semibold leading-tight">{PROFILE_DRAFT.name}</span>
                <span className="block truncate text-xs text-studojo-muted">{PROFILE_DRAFT.meta}</span>
              </span>
              <span className="ml-auto inline-flex -rotate-6 items-center gap-1 rounded-md border-2 border-studojo-green px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#047857]">
                <FiCheck aria-hidden strokeWidth={4} /> Reviewed
              </span>
            </div>
            {PROFILE_DRAFT.claims.slice(1, 3).map((c) => (
              <p key={c.id} className="flex items-start gap-2 text-xs leading-snug text-studojo-ink">
                <span aria-hidden className="mt-1 h-2 w-2 shrink-0 rounded-full border border-studojo-ink bg-studojo-green" />
                {c.text}
              </p>
            ))}
          </div>
        </BrowserFrame>
      </Panel>

      <Connector />

      <Panel n={2} label="Your people" tone="bg-studojo-orange-bg" className="lg:ml-14 lg:rotate-1" badge={<Badge kind="sample" />}>
        <ul className="space-y-2">
          {PEOPLE.map((p) => (
            <li key={p.id} className="flex items-center gap-2.5 rounded-xl border-2 border-studojo-ink bg-white px-2.5 py-1.5">
              <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-yellow-bg text-[11px] font-bold">
                {p.manager.first[0]}
              </span>
              <span className="min-w-0 flex-1 text-xs leading-tight">
                <span className="block truncate font-bold">
                  {p.manager.first} {p.manager.maskedLast}, {p.company}
                </span>
                <span className="block truncate text-studojo-muted">{p.manager.title}</span>
              </span>
              <span className="shrink-0 rounded-full border-2 border-studojo-ink bg-studojo-green-bg px-1.5 text-[11px] font-bold tabular-nums">
                {p.fit}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Connector />

      <Panel n={3} label="Your inbox" tone="bg-studojo-green-bg" className="lg:mr-8 lg:-rotate-1" badge={<Badge kind="simulated" />}>
        <div className="flex items-start gap-3 rounded-xl border-2 border-studojo-ink bg-white p-2.5">
          <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-studojo-ink bg-studojo-purple-bg">
            <FiInbox />
          </span>
          <span className="min-w-0 text-xs leading-snug">
            <span className="flex items-center gap-2">
              <span className="truncate font-bold">{REPLY_FROM?.company} replied</span>
              <span className={cx("shrink-0 rounded-full px-1.5 text-[10px] font-bold", REPLY_TAG_STYLE[REPLY.tag])}>{REPLY.tag}</span>
            </span>
            <span className="mt-0.5 block text-studojo-muted">{REPLY.text}</span>
          </span>
        </div>
      </Panel>
    </motion.ol>
  );
}

function Panel({
  n,
  label,
  tone,
  className,
  badge,
  children,
}: {
  n: number;
  label: string;
  tone: string;
  className?: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const m = useMotionPresets();
  return (
    <motion.li variants={m.item} className={cx("relative", className)}>
      <Card shadow="lg" pad="sm" className={tone}>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-studojo-ink bg-white font-clash text-xs font-semibold">
            {n}
          </span>
          <span className="font-clash text-lg font-semibold leading-none">{label}</span>
          {badge ? <span className="ml-auto">{badge}</span> : n === 2 ? <FiUsers aria-hidden className="ml-auto" /> : null}
        </div>
        {children}
      </Card>
    </motion.li>
  );
}

/** A short dashed line between panels with a dot that travels down it (transform only). */
function Connector() {
  const m = useMotionPresets();
  return (
    <li aria-hidden className="relative mx-auto h-9 w-6 list-none">
      <svg viewBox="0 0 24 36" className="absolute inset-0 h-full w-full overflow-visible">
        <line x1="12" y1="0" x2="12" y2="36" stroke="#171717" strokeWidth="2" strokeDasharray="3 4" />
      </svg>
      <motion.span
        className="absolute left-1/2 top-0 -ml-[5px] h-2.5 w-2.5 rounded-full border-2 border-studojo-ink bg-studojo-purple"
        {...m.loop({ y: [0, 26, 26], opacity: [0, 1, 0] }, 1.6)}
      />
    </li>
  );
}
