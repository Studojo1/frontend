// Step 11: mission control after launch. A Day 0 to Day 14 scrubber drives a
// SIMULATED campaign: sent count, page opens, reply toasts, one-tap
// interview and offer, a top-up near the end, and Unpublish. Owned by builder D.
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiArrowRight, FiFlag, FiRotateCcw } from "react-icons/fi";
import { Link } from "react-router";
import { formatINR, MISSION_DAYS, packById, PACKS, REPLY_TAG_STYLE, simulateCampaign, type SimReply } from "../data";
import { useFlow, useStepBar } from "../flow";
import { SPRING_SOFT, useMotionPresets } from "../motion";
import { Badge, Button, Card, cx, FOCUS_RING, PRESS, StepHeader } from "../ui";
import { Outcomes, PageStatus, Stats, TopUp } from "./go/mission-panels";
import { Replies } from "./go/mission-replies";
import { Scrubber } from "./go/mission-scrubber";
import { matchById, pageIsPublic, sendsEmail, totalOutreaches } from "./go/shared";

const NOTICE = "Simulated preview. Real results vary and replies are not guaranteed.";

export function Mission() {
  const f = useFlow();
  const ms = f.data.mission;
  const paid = sendsEmail(f.data.pack);
  const pageLive = pageIsPublic(f.data.visibility) && !ms.unpublished;
  const total = totalOutreaches(f.data);
  const snap = useMemo(() => simulateCampaign(total, ms.day), [total, ms.day]);
  const allReplies = useMemo(() => simulateCampaign(total, MISSION_DAYS).replies, [total]);
  // Phones: the reply feed is below the fold, so each new reply also floats up as a toast.
  const [toast, setToast] = useState<{ r: SimReply; more: number; n: number } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(t);
  }, [toast]);
  const showTopUp = paid && (ms.day >= 10 || snap.allSent || ms.toppedUp);
  const [finished, setFinished] = useState(false);
  const endRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (finished) endRef.current?.focus({ preventScroll: false });
  }, [finished]);

  useStepBar({
    label: finished ? "Start over" : "Finish preview",
    tone: finished ? "dark" : "primary",
    enterToContinue: !finished,
    hint: "Everything on this screen is simulated.",
    hintOnPhone: true,
    onPrimary: () => {
      if (finished) f.startOver();
      else setFinished(true);
    },
  });

  const seen = (id: string) => {
    if (!ms.seenReplies.includes(id)) f.update("mission", { seenReplies: [...ms.seenReplies, id] });
  };

  return (
    <div>
      <AnimatePresence initial={false}>{finished ? <EndCard key="end" headingRef={endRef} /> : null}</AnimatePresence>

      <StepHeader
        kicker="Mission control"
        title={paid ? "Your campaign, live" : pageLive ? "Your page, live" : "Your page, saved"}
        description={
          paid
            ? "Drag through the first two weeks. Replies show up here, tagged, and you answer them from your own Gmail."
            : pageLive
              ? "Free keeps your page up and sends nothing. Share the link wherever you like."
              : "Free sends nothing, and your page stays private until you turn the link on."
        }
        aside={<Badge kind="simulated" />}
      />

      <p className="mb-6 flex items-start gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-orange-bg px-3 py-2.5 font-satoshi text-sm font-bold sm:text-base">
        <FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />
        {NOTICE}
      </p>

      {paid ? (
        // Phones: a compact scrubber sticks under the header while the stats and replies scroll beneath it.
        <div className="sticky top-[6.75rem] z-20 mb-6 md:static">
          <Card shadow="lg" pad="sm" className="md:p-6">
            <Scrubber
              day={ms.day}
              onChange={(day) => f.update("mission", { day })}
              marks={allReplies.map((r) => ({ id: r.id, day: r.day, tag: r.tag }))}
              autoPlay
            />
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-6">
          {paid ? <Stats snap={snap} total={total} pageLive={pageLive} /> : <FreeUpsell />}
          {/* Nothing was sent on Free, so there is no news to log. */}
          {paid ? (
            <Outcomes
              interview={ms.interview}
              offer={ms.offer}
              onChange={(k, v) => f.update("mission", k === "interview" ? { interview: v } : { offer: v })}
            />
          ) : null}
          <AnimatePresence initial={false}>
            {showTopUp ? (
              <TopUp key="topup" toppedUp={ms.toppedUp} onTopUp={() => f.update("mission", { toppedUp: true })} />
            ) : null}
          </AnimatePresence>
        </div>
        <div className="space-y-6">
          {paid ? (
            <Replies
              replies={snap.replies}
              seen={ms.seenReplies}
              onSeen={seen}
              onArrive={(r, more) => setToast((t) => ({ r, more, n: (t?.n ?? 0) + 1 }))}
            />
          ) : null}
          <PageStatus
            v={f.data.visibility}
            unpublished={ms.unpublished}
            onUnpublish={(off) => f.update("mission", { unpublished: off })}
            onOpenVisibility={() => f.goTo("visibility")}
          />
        </div>
      </div>

      <AnimatePresence>{toast ? <ReplyToast key={toast.n} reply={toast.r} more={toast.more} /> : null}</AnimatePresence>
    </div>
  );
}

/** Phones only: a new reply floats just above the action bar. The feed's live region announces it. */
function ReplyToast({ reply, more }: { reply: SimReply; more: number }) {
  const m = useMotionPresets();
  const who = matchById(reply.matchId);
  return (
    <motion.div
      data-floating-cta
      aria-hidden
      className="pointer-events-none fixed inset-x-4 bottom-[calc(6.75rem+env(safe-area-inset-bottom))] z-40 md:hidden"
      initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={m.reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      transition={m.reduced ? { duration: 0.15 } : SPRING_SOFT}
    >
      <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-pink-bg p-3 font-satoshi shadow-brutal">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold">
            {who?.manager.first}, {who?.company}
          </span>
          <span className={cx("rounded-full border-2 border-studojo-ink px-2 text-xs font-bold", REPLY_TAG_STYLE[reply.tag])}>{reply.tag}</span>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-studojo-muted">Simulated</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-snug">&ldquo;{reply.text}&rdquo;</p>
        {more > 0 ? <p className="mt-1 text-xs font-bold text-studojo-muted">and {more} more in Replies</p> : null}
      </div>
    </motion.div>
  );
}

/** Free: the page is live, nothing sends. Offer the smallest pack, honestly. */
function FreeUpsell() {
  const f = useFlow();
  const starter = packById("starter") ?? PACKS[1];
  return (
    <Card tone="green" shadow="md">
      <h2 className="font-clash text-xl font-semibold">Want it in front of hiring managers?</h2>
      <p className="mt-2 font-satoshi text-base">
        {starter.name} sends {starter.outreaches} personal emails from your Gmail for {formatINR(starter.price)}, with your page in the
        follow-ups. One-time payment. No subscription.
      </p>
      <div className="mt-4">
        <Button variant="dark" iconRight={<FiArrowRight />} onClick={() => f.goTo("pack")}>
          Pick a pack
        </Button>
      </div>
    </Card>
  );
}

function EndCard({ headingRef }: { headingRef: RefObject<HTMLHeadingElement | null> }) {
  const f = useFlow();
  const m = useMotionPresets();
  return (
    <motion.div
      className="mb-8"
      initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={m.reduced ? { duration: 0.15 } : SPRING_SOFT}
    >
      <Card tone="ink" shadow="lg" pad="lg">
        <h2 ref={headingRef} tabIndex={-1} className="flex items-center gap-2 font-clash text-2xl font-semibold outline-none sm:text-3xl">
          <FiFlag aria-hidden /> That is the whole flow
        </h2>
        <p className="mt-2 max-w-2xl font-satoshi text-base text-white/85">
          Resume to launch in about four minutes. This was a concept preview: nothing was uploaded, charged or sent.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" icon={<FiRotateCcw />} onClick={f.startOver}>
            Start over
          </Button>
          <Link
            to="/"
            className={cx(
              "inline-flex min-h-12 items-center rounded-xl border-2 border-white px-5 font-satoshi text-base font-bold text-white hover:bg-white/10",
              PRESS,
              FOCUS_RING,
            )}
          >
            Back to Studojo
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
