// Mission control panels: simulated stats, one-tap outcomes, the top-up card
// and the page status with Unpublish. Owned by builder D.
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAward, FiBriefcase, FiEye, FiGlobe, FiMail, FiMessageCircle, FiPlusCircle, FiPower, FiRepeat } from "react-icons/fi";
import { formatCount, formatINR, PACK_RULES, PROFILE_DRAFT, TOP_UP, type CampaignSnapshot } from "../../data";
import { SPRING, SPRING_SNAP, useMotionPresets } from "../../motion";
import type { VisibilityState } from "../../types";
import { AnimatedNumber, Badge, Button, Card, cx } from "../../ui";
import { pageIsPublic, visibilitySummary } from "./shared";

// ── Stats ───────────────────────────────────────────────────────────────────

export function Stats({ snap, total, pageLive }: { snap: CampaignSnapshot; total: number; pageLive: boolean }) {
  return (
    <Card shadow="md">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-clash text-xl font-semibold">Day {snap.day} at a glance</h2>
        <span className="ml-auto">
          <Badge kind="simulated" />
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <Tile icon={<FiMail />} label="First emails sent" value={snap.sent} sub={`of ${formatCount(total)}`} fill={total ? snap.sent / total : 0} />
        <Tile icon={<FiRepeat />} label="Follow-ups sent" value={snap.followUps} sub={pageLive ? "with your page card" : "without your page (private)"} />
        <Tile icon={<FiEye />} label="Page opens" value={pageLive ? snap.pageOpens : 0} sub={pageLive ? "from your link" : "your page is private"} />
        <Tile
          icon={<FiMessageCircle />}
          label="Replies"
          value={snap.replies.length}
          sub={`${formatCount(Math.max(0, snap.sent - snap.replies.length))} with no reply yet`}
        />
      </dl>
      {snap.allSent ? (
        <p className="mt-3 font-satoshi text-sm font-bold text-[#047857]">Every first email in your pack has gone out.</p>
      ) : null}
    </Card>
  );
}

function Tile({ icon, label, value, sub, fill }: { icon: ReactNode; label: string; value: number; sub: string; fill?: number }) {
  return (
    <div className="rounded-xl border-2 border-studojo-ink bg-white p-3">
      <dt className="flex items-center gap-1.5 font-satoshi text-xs font-bold text-studojo-muted">
        <span aria-hidden className="text-studojo-ink">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1">
        <span className="font-clash text-3xl font-semibold leading-none">
          <AnimatedNumber value={value} />
        </span>
        <span className="mt-1 block font-satoshi text-xs text-studojo-muted">{sub}</span>
        {fill !== undefined ? (
          <span aria-hidden className="mt-2 block h-2 overflow-hidden rounded-full border-2 border-studojo-ink bg-white">
            <motion.span className="block h-full origin-left bg-studojo-green" initial={false} animate={{ scaleX: Math.min(1, fill) }} transition={SPRING} />
          </span>
        ) : null}
      </dd>
    </div>
  );
}

// ── Outcomes ────────────────────────────────────────────────────────────────

export function Outcomes({ interview, offer, onChange }: { interview: boolean; offer: boolean; onChange: (k: "interview" | "offer", v: boolean) => void }) {
  return (
    <Card shadow="md">
      <h2 className="font-clash text-xl font-semibold">Got news? One tap.</h2>
      <p className="mt-1 font-satoshi text-sm text-studojo-muted">Log it here so your dashboard keeps track. Tap again to undo.</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <OutcomeButton on={interview} onClick={() => onChange("interview", !interview)} icon={<FiBriefcase />} label="I got an interview" tone="bg-studojo-purple-bg" />
        <OutcomeButton on={offer} onClick={() => onChange("offer", !offer)} icon={<FiAward />} label="I got an offer" tone="bg-studojo-green-bg" />
      </div>
      <AnimatePresence initial={false}>
        {offer ? (
          <motion.p
            key="offer"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-xl border-2 border-studojo-ink bg-studojo-yellow-bg px-3 py-2 font-satoshi text-sm font-bold"
          >
            Congratulations. {PACK_RULES.hires}
          </motion.p>
        ) : interview ? (
          <motion.p key="int" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 font-satoshi text-sm text-studojo-muted">
            Logged. Good luck in there.
          </motion.p>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}

const BURST = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);

function OutcomeButton({ on, onClick, icon, label, tone }: { on: boolean; onClick: () => void; icon: ReactNode; label: string; tone: string }) {
  const m = useMotionPresets();
  const [pops, setPops] = useState(0);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        if (!on) setPops((n) => n + 1);
        onClick();
      }}
      className={cx(
        "relative flex min-h-14 items-center gap-3 rounded-2xl border-2 border-studojo-ink px-4 py-3 text-left font-satoshi text-base font-bold",
        "transition-[transform,box-shadow] duration-150 ease-out active:translate-x-[2px] active:translate-y-[2px]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-studojo-purple/40 focus-visible:ring-offset-2",
        on ? cx(tone, "shadow-[2px_2px_0_0_#191a23]") : "bg-white shadow-brutal hover:bg-studojo-purple-bg",
      )}
    >
      <motion.span
        aria-hidden
        className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-studojo-ink text-lg", on ? "bg-white" : "bg-studojo-surface-muted")}
        animate={{ rotate: on && !m.reduced ? [0, -12, 8, 0] : 0, scale: on ? 1.05 : 1 }}
        transition={{ duration: 0.35 }}
      >
        {icon}
      </motion.span>
      <span className="flex-1">{label}</span>
      <span aria-hidden className={cx("rounded-full border-2 border-studojo-ink px-2 text-xs", on ? "bg-studojo-ink text-white" : "bg-white")}>
        {on ? "Logged" : "Tap"}
      </span>
      {!m.reduced && pops > 0 ? <Burst key={pops} /> : null}
    </button>
  );
}

/** A one-shot burst of dots from the button's icon. */
function Burst() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setShow(false), 700);
    return () => window.clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute left-9 top-1/2">
      {BURST.map((a, i) => (
        <motion.span
          key={i}
          className={cx("absolute h-2.5 w-2.5 rounded-full border-2 border-studojo-ink", i % 2 ? "bg-studojo-yellow" : "bg-studojo-pink")}
          initial={{ x: -5, y: -5, scale: 0.4, opacity: 1 }}
          animate={{ x: Math.cos(a) * 38 - 5, y: Math.sin(a) * 38 - 5, scale: 1, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

// ── Top-up ──────────────────────────────────────────────────────────────────

export function TopUp({ toppedUp, onTopUp }: { toppedUp: boolean; onTopUp: () => void }) {
  const m = useMotionPresets();
  return (
    <motion.div initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={m.reduced ? { duration: 0.15 } : SPRING_SNAP}>
      <Card tone={toppedUp ? "green" : "yellow"} shadow="lg">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-clash text-xl font-semibold">
            <FiPlusCircle aria-hidden /> {toppedUp ? "Topped up" : "Keep it going"}
          </h2>
          <Badge kind="concept">Nothing is charged</Badge>
        </div>
        <p className="mt-2 font-satoshi text-base">
          {toppedUp
            ? `${TOP_UP.outreaches} more emails queued to people already matched. Nothing was charged.`
            : `${formatINR(TOP_UP.price)} for ${TOP_UP.outreaches} more emails, to people already matched. No new questions.`}
        </p>
        {!toppedUp ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="dark" onClick={onTopUp}>
              Top up {formatINR(TOP_UP.price)}
            </Button>
            <span className="font-satoshi text-sm text-studojo-muted">{PACK_RULES.oneTime}</span>
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}

// ── Page status ─────────────────────────────────────────────────────────────

export function PageStatus({
  v,
  unpublished,
  onUnpublish,
  onOpenVisibility,
}: {
  v: VisibilityState;
  unpublished: boolean;
  onUnpublish: (off: boolean) => void;
  /** A private page has nothing to unpublish: offer to turn the link on instead. */
  onOpenVisibility: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (!confirm) return;
    const t = window.setTimeout(() => setConfirm(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirm]);
  const isPublic = pageIsPublic(v) && !unpublished;
  const status = unpublished ? "Offline" : isPublic ? "Live" : "Private";
  return (
    <Card shadow="md">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 font-clash text-xl font-semibold">
          <FiGlobe aria-hidden /> Your page
        </h2>
        <span
          className={cx(
            "rounded-full border-2 border-studojo-ink px-2 font-satoshi text-xs font-bold uppercase",
            unpublished ? "bg-studojo-surface-muted" : isPublic ? "bg-studojo-green" : "bg-studojo-yellow-bg",
          )}
        >
          {status}
        </span>
      </div>
      <p className={cx("mt-2 truncate font-satoshi text-sm", unpublished ? "text-studojo-muted line-through" : "text-studojo-ink")}>{PROFILE_DRAFT.url}</p>
      <p className="font-satoshi text-sm text-studojo-muted">
        {unpublished ? "Offline. The link shows nothing until you publish again." : visibilitySummary(v)}
      </p>
      <div className="mt-4">
        {unpublished ? (
          <Button variant="secondary" size="sm" icon={<FiGlobe />} onClick={() => onUnpublish(false)}>
            Publish again
          </Button>
        ) : !isPublic ? (
          <Button variant="secondary" size="sm" icon={<FiGlobe />} onClick={onOpenVisibility}>
            Turn your link on
          </Button>
        ) : (
          <Button
            variant={confirm ? "dark" : "secondary"}
            size="sm"
            icon={<FiPower />}
            onClick={() => {
              if (!confirm) return setConfirm(true);
              setConfirm(false);
              onUnpublish(true);
            }}
          >
            {confirm ? "Tap again to take it offline" : "Unpublish page"}
          </Button>
        )}
        {unpublished ? null : (
          <p className="mt-2 font-satoshi text-xs text-studojo-muted">
            {isPublic ? "Unpublishing takes the page offline immediately." : "Only you can see it until the link is on."}
          </p>
        )}
      </div>
    </Card>
  );
}
