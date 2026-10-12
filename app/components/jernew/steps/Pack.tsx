// Step 8: pack. A gauge whose needle snaps between Free, Starter, Standard
// and Pro, a per-email price ticker, what is included, the money rules, and a
// mock Pay that prints a receipt. Nothing is charged. Owned by builder D.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiRefreshCw } from "react-icons/fi";
import { formatINR, packById, PACKS } from "../data";
import { useFlow, useStepBar } from "../flow";
import { SPRING_SNAP, useMotionPresets } from "../motion";
import type { PackId } from "../types";
import { AnimatedNumber, Badge, Card, Chip, cx, LiveRegion, StepHeader } from "../ui";
import { PackDetails, type PayPhase } from "./go/pack-details";
import { PACK_ORDER, PackDial } from "./go/pack-dial";

export function Pack() {
  const f = useFlow();
  const m = useMotionPresets();
  const [sel, setSel] = useState<PackId>(f.data.pack ?? "standard");
  const [phase, setPhase] = useState<PayPhase>("idle");
  const [say, setSay] = useState("");
  const timers = useRef<number[]>([]);
  const detailsRef = useRef<HTMLDivElement>(null);
  const pack = packById(sel) ?? PACKS[2];
  const alreadyPaid = sel !== "free" && f.data.pack === sel && f.data.paid;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const choose = (id: PackId) => {
    if (phase !== "idle") return;
    setSel(id);
    const p = packById(id);
    if (p) setSay(p.id === "free" ? "Free: your page only." : `${p.name}: ${formatINR(p.price)} for ${p.outreaches} emails.`);
  };

  const pay = () => {
    if (phase === "processing") return;
    if (phase === "paid" || alreadyPaid) return f.next();
    // A different pack than the one launched means a fresh launch moment.
    const relaunch = f.data.pack !== sel;
    if (sel === "free") {
      f.set({ pack: "free", paid: false, ...(relaunch ? { launched: false } : {}) });
      return f.next();
    }
    setPhase("processing");
    setSay("Processing mock payment. Nothing is charged.");
    // On phones the receipt prints in the card below the dial: bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      detailsRef.current?.scrollIntoView({ block: "center", behavior: m.reduced ? "auto" : "smooth" });
    }
    const quick = m.reduced;
    timers.current.push(
      window.setTimeout(() => {
        setPhase("paid");
        f.set({ pack: sel, paid: true, ...(relaunch ? { launched: false } : {}) });
        setSay(`Paid for ${pack.name}. Nothing was charged.`);
      }, quick ? 350 : 1100),
      window.setTimeout(() => f.next(), quick ? 1100 : 2700),
    );
  };

  const label =
    sel === "free"
      ? "Keep my page, free"
      : alreadyPaid || phase === "paid"
        ? "Continue"
        : phase === "processing"
          ? "Processing"
          : `Pay ${formatINR(pack.price)}`;

  useStepBar({
    label,
    onPrimary: pay,
    hint: sel === "free" ? "No payment and no Gmail needed." : "Mock payment: nothing is charged.",
    hintOnPhone: true,
    tone: sel === "free" ? "primary" : "green",
    // Money needs an explicit tap: Enter never pays.
    enterToContinue: false,
  });

  return (
    <div>
      <StepHeader
        title="Pick your pack"
        description="Turn the dial. More emails, lower price per email. Pay once, keep your page either way."
        aside={<Badge kind="concept">Nothing is charged</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8">
        <Card shadow="lg" pad="lg" className="flex flex-col items-center">
          <PackDial value={sel} onChange={choose} locked={phase !== "idle"} />

          <div className="mt-2 text-center" aria-hidden>
            <p className="font-clash text-5xl font-semibold leading-none tabular-nums sm:text-6xl">
              <AnimatedNumber value={pack.price} format={(n) => formatINR(Math.round(n))} />
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={pack.id}
                className="mt-2 font-satoshi text-base text-studojo-muted"
                initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={m.reduced ? { duration: 0.15 } : SPRING_SNAP}
              >
                {pack.id === "free" ? "Your page, link-only, plus a preview of matches" : `for ${pack.outreaches} personal emails`}
              </motion.p>
            </AnimatePresence>
          </div>

          <PerEmailTicker perEmail={pack.perEmail} />

          {/* Phones and tablets: the money rules sit right under the price, in reach of Pay. */}
          <p className="mt-3 flex max-w-xs items-start gap-2 text-left font-satoshi text-xs leading-snug text-studojo-ink lg:hidden">
            <FiRefreshCw aria-hidden className="mt-0.5 shrink-0" />
            <span>
              <strong>One-time. No subscription.</strong> Failed sends are given back. Replies not guaranteed.
            </span>
          </p>

          <div role="group" aria-label="Choose a pack" className="mt-6 grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-center">
            {PACK_ORDER.map((id) => {
              const p = packById(id);
              if (!p) return null;
              return (
                <Chip key={id} selected={id === sel} tone="go" onClick={() => choose(id)} disabled={phase !== "idle"} className="justify-center">
                  {p.name}
                  <span className="sr-only">{p.id === "free" ? ", no emails" : `, ${formatINR(p.price)} for ${p.outreaches} emails`}</span>
                </Chip>
              );
            })}
          </div>
        </Card>

        <div ref={detailsRef} className="scroll-mt-40">
          <PackDetails pack={pack} phase={phase} />
        </div>
      </div>

      <LiveRegion message={say} />
    </div>
  );
}

/** "₹9.13 per email" with digits that count, or a note for Free. */
function PerEmailTicker({ perEmail }: { perEmail: number | null }) {
  return (
    <div
      className={cx(
        "mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-studojo-ink px-3 py-1.5 font-satoshi shadow-[2px_2px_0_0_#191a23]",
        perEmail === null ? "bg-studojo-surface-muted" : "bg-studojo-green-bg",
      )}
    >
      {perEmail === null ? (
        <span className="text-sm font-bold">No emails sent on Free</span>
      ) : (
        <>
          <span className="font-clash text-2xl font-semibold tabular-nums">
            <AnimatedNumber value={perEmail} format={(n) => formatINR(Math.round(n * 100) / 100, { decimals: 2 })} duration={0.6} />
          </span>
          <span className="text-sm font-bold text-studojo-muted">per email</span>
        </>
      )}
    </div>
  );
}
