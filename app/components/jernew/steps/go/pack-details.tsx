// What the selected pack includes, a cost-per-email comparison, the money
// rules, and the mock payment receipt that prints out. Owned by builder D.
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiLoader, FiRefreshCw, FiShield, FiZap } from "react-icons/fi";
import { formatINR, PACK_RULES, PACKS, type Pack } from "../../data";
import { SPRING, SPRING_SOFT, useMotionPresets } from "../../motion";
import type { PackId } from "../../types";
import { Badge, Card, cx } from "../../ui";
import { mockReceiptRef } from "./shared";

const PAID = PACKS.filter((p) => p.perEmail !== null);
const MAX_PER = Math.max(...PAID.map((p) => p.perEmail ?? 0));

export type PayPhase = "idle" | "processing" | "paid";

export function PackDetails({ pack, phase }: { pack: Pack; phase: PayPhase }) {
  const m = useMotionPresets();
  return (
    <Card shadow="lg" className="relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pack.id}
          initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={m.reduced ? { duration: 0.15 } : SPRING}
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-clash text-2xl font-semibold">{pack.name}</h2>
            <span className="font-satoshi text-sm text-studojo-muted">{pack.tagline}</span>
            {pack.badge ? <Badge kind="success" icon={<FiZap />}>{pack.badge}</Badge> : null}
          </div>
          <ul className="mt-4 space-y-2">
            {pack.includes.map((line) => (
              <li key={line} className="flex items-start gap-2.5 font-satoshi text-base">
                <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-green-bg text-[11px]">
                  <FiCheck strokeWidth={4} />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>

      <PerEmailBars selected={pack.id} />

      <ul className="mt-5 space-y-2 border-t-2 border-dashed border-studojo-ink/25 pt-4 font-satoshi text-sm">
        <Rule icon={<FiShield />} strong>{PACK_RULES.oneTime}</Rule>
        <Rule icon={<FiRefreshCw />}>{PACK_RULES.recredit}</Rule>
        <Rule icon={<FiCheck />}>{PACK_RULES.hires}</Rule>
        <Rule icon={<FiZap />}>{PACK_RULES.noGuarantee}</Rule>
      </ul>

      <AnimatePresence>{phase !== "idle" ? <Receipt key="receipt" pack={pack} phase={phase} /> : null}</AnimatePresence>
    </Card>
  );
}

function Rule({ icon, children, strong }: { icon: ReactNode; children: ReactNode; strong?: boolean }) {
  return (
    <li className={cx("flex items-start gap-2", strong ? "font-bold text-studojo-ink" : "text-studojo-muted")}>
      <span aria-hidden className="mt-0.5 shrink-0 text-studojo-ink">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

/** Horizontal bars: cost per email for each paid pack. Shorter is cheaper. */
function PerEmailBars({ selected }: { selected: PackId }) {
  return (
    <figure className="mt-5">
      <figcaption className="mb-2 font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">
        Cost per email (shorter is cheaper)
      </figcaption>
      <ul className="space-y-1.5">
        {PAID.map((p) => {
          const on = p.id === selected;
          return (
            <li key={p.id} className="grid grid-cols-[4.5rem_1fr_3.75rem] items-center gap-2 font-satoshi text-sm">
              <span className={cx(on ? "font-bold text-studojo-ink" : "text-studojo-muted")}>{p.name}</span>
              <span className="relative block h-4 overflow-hidden rounded-full border-2 border-studojo-ink bg-white">
                <motion.span
                  className={cx("absolute inset-0 origin-left", on ? "bg-studojo-purple" : "bg-studojo-ink/20")}
                  initial={false}
                  animate={{ scaleX: (p.perEmail ?? 0) / MAX_PER }}
                  transition={SPRING}
                />
              </span>
              <span className={cx("text-right tabular-nums", on ? "font-bold" : "text-studojo-muted")}>
                {formatINR(p.perEmail ?? 0, { decimals: 2 })}
              </span>
            </li>
          );
        })}
      </ul>
      {selected === "free" ? (
        <p className="mt-2 font-satoshi text-sm text-studojo-muted">Free sends nothing, so there is no cost per email.</p>
      ) : null}
    </figure>
  );
}

/** The mock payment: a spinner, then a receipt that prints down over the card. */
function Receipt({ pack, phase }: { pack: Pack; phase: PayPhase }) {
  const m = useMotionPresets();
  return (
    <motion.div
      className="absolute inset-0 z-10 flex items-start justify-center bg-white/85 p-4 backdrop-blur-[2px] sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {phase === "processing" ? (
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <motion.span
            aria-hidden
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-purple-bg text-2xl"
            {...m.loop({ rotate: [0, 360] }, 1)}
          >
            <FiLoader />
          </motion.span>
          <p className="font-clash text-xl font-semibold">Processing mock payment</p>
          <p className="font-satoshi text-sm text-studojo-muted">Nothing is charged. This is a concept preview.</p>
        </div>
      ) : (
        <div className="w-full max-w-xs overflow-hidden pt-1">
          <motion.div
            className="rounded-b-xl border-2 border-t-4 border-studojo-ink bg-white px-4 pb-4 pt-3 font-satoshi text-sm shadow-brutal"
            initial={m.reduced ? { opacity: 0 } : { y: "-105%" }}
            animate={m.reduced ? { opacity: 1 } : { y: 0 }}
            transition={m.reduced ? { duration: 0.15 } : SPRING_SOFT}
          >
            <p className="text-center font-clash text-lg font-semibold">Receipt</p>
            <p className="text-center text-xs text-studojo-muted">Ref {mockReceiptRef(pack.id)}</p>
            <dl className="mt-3 space-y-1.5 border-y-2 border-dashed border-studojo-ink/30 py-3">
              <Line k="Pack" v={pack.name} />
              <Line k="Emails" v={String(pack.outreaches)} />
              <Line k="Price" v={formatINR(pack.price)} />
              <Line k="Charged today" v="₹0 (preview)" strong />
            </dl>
            <motion.p
              className="mt-3 flex items-center justify-center gap-1.5 font-bold text-[#047857]"
              initial={m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: m.reduced ? 0 : -4 }}
              transition={m.reduced ? { duration: 0.15 } : { ...SPRING, delay: 0.25 }}
            >
              <FiCheck aria-hidden strokeWidth={4} /> Paid. Nothing was charged.
            </motion.p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function Line({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-studojo-muted">{k}</dt>
      <dd className={cx("tabular-nums", strong && "font-bold")}>{v}</dd>
    </div>
  );
}
