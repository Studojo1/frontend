// Wallet pieces: the fuel breakdown bar, a pack option, the rules list and
// the receipt. Group 4.
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiCheckCircle } from "react-icons/fi";
import { COPY, LOW_FUEL_STOP, LOW_FUEL_WARN } from "../config";
import type { Fuel } from "../core/derive";
import { formatCount, formatINR, PACK_RULES, type Pack } from "../data";
import { SPRING, stampVariants, useMotionPresets } from "../motion";
import { Badge, cx, FOCUS_RING, PRESS, SimNote } from "../ui";

const HATCH = "repeating-linear-gradient(135deg, #8b5cf6 0 3px, #ede4fe 3px 7px)";

export function FuelBreakdown({ f, title, notch }: { f: Fuel; title: string; notch?: number }) {
  const m = useMotionPresets();
  const pct = (n: number) => (f.total ? `${(n / f.total) * 100}%` : "0%");
  const low = f.total > 0 && f.left <= LOW_FUEL_WARN;
  return (
    <div className="rounded-2xl border-2 border-studojo-ink bg-white p-4 shadow-brutal">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-muted">{title}</p>
          <p className={cx("font-clash text-4xl font-semibold tabular-nums", low ? "text-[#b45309]" : "text-studojo-ink")} aria-live="polite">
            {formatCount(f.left)}
            <span className="ml-1.5 font-satoshi text-base font-bold text-studojo-muted">{f.total ? `left of ${formatCount(f.total)}` : "no pack yet"}</span>
          </p>
        </div>
        <Badge kind="simulated" />
      </div>
      {f.total === 0 ? (
        <p className="mt-2 font-satoshi text-sm text-studojo-muted">Nothing sends from this mission until it has a pack. Pick one below.</p>
      ) : (
      <>
      <div className="mt-3 flex h-5 overflow-hidden rounded-full border-2 border-studojo-ink bg-white" role="img" aria-label={`${f.sent} sent, ${f.reserved} reserved, ${f.left} left`}>
        <motion.span className="h-full bg-studojo-ink" initial={false} animate={{ width: pct(f.sent) }} transition={m.reduced ? { duration: 0 } : SPRING} />
        <motion.span className="h-full" style={{ backgroundImage: HATCH }} initial={false} animate={{ width: pct(f.reserved) }} transition={m.reduced ? { duration: 0 } : SPRING} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 font-satoshi text-sm sm:grid-cols-4">
        <Stat dot={<i className="h-2.5 w-2.5 rounded-full bg-studojo-ink" />} label="Sent" value={formatCount(f.sent)} />
        <Stat dot={<i className="h-2.5 w-2.5 rounded-full" style={{ backgroundImage: HATCH }} />} label="Reserved" value={String(f.reserved)} />
        <Stat dot={<i className="h-2.5 w-2.5 rounded-full border border-studojo-ink bg-white" />} label="Left" value={formatCount(f.left)} />
        <Stat dot={<i className="h-2.5 w-2.5 rounded-full bg-studojo-green" />} label="Given back" value={`+${f.givenBack}`} tone="text-[#047857]" />
      </dl>
      <p className="mt-2 font-satoshi text-xs text-studojo-muted">
        Reserved means approved and waiting for its send slot. {PACK_RULES.recredit} <SimNote kind="sample">Given back is Sample</SimNote>
      </p>
      <p className="mt-1 font-satoshi text-xs font-bold text-studojo-ink">{COPY.noFee.replace(/^Yours\. /, "")}</p>
      </>
      )}
      {low ? (
        <p className="mt-2 rounded-lg bg-studojo-orange-bg px-2.5 py-1.5 font-satoshi text-sm font-bold text-[#92400e]">
          {f.left === 0
            ? `Your pack is used up.${f.waiting ? ` ${f.waiting} first ${f.waiting === 1 ? "email waits" : "emails wait"} for credits.` : ""}`
            : `${formatCount(f.left)} left.${f.waiting ? ` ${f.waiting} ${f.waiting === 1 ? "draft" : "drafts"} waiting would use ${Math.min(f.waiting, f.left)}.` : ""}`}
          {notch === 3 ? ` Guardrailed autopilot stops at ${LOW_FUEL_STOP} left.` : ""}
        </p>
      ) : null}
    </div>
  );
}

function Stat({ dot, label, value, tone }: { dot: ReactNode; label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-studojo-surface-muted px-2.5 py-1.5">
      <dt className="flex items-center gap-1.5 text-xs text-studojo-muted"><span aria-hidden className="inline-flex">{dot}</span>{label}</dt>
      <dd className={cx("font-clash text-lg font-semibold tabular-nums", tone)}>{value}</dd>
    </div>
  );
}

/** A selectable pack (radio). */
export function PackOption({ pack, selected, onSelect }: { pack: Pack; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cx(
        "relative flex w-full items-center gap-3 rounded-2xl border-2 border-studojo-ink p-3 text-left font-satoshi",
        selected ? "bg-studojo-purple-bg shadow-brutal" : "bg-white",
        PRESS,
        FOCUS_RING,
      )}
    >
      <span aria-hidden className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink", selected ? "bg-studojo-purple-strong text-white" : "bg-white")}>
        {selected ? <FiCheck className="text-sm" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-base font-bold">
          {pack.name}
          {pack.badge ? <Badge kind="neutral">{pack.badge}</Badge> : null}
        </span>
        <span className="block text-sm text-studojo-muted">
          {pack.outreaches} personal emails · {pack.tagline}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-clash text-xl font-semibold">{formatINR(pack.price)}</span>
        {pack.perEmail ? <span className="block text-[11px] text-studojo-muted">₹{pack.perEmail.toFixed(2)} per email</span> : null}
      </span>
    </button>
  );
}

export function RulesList() {
  return (
    <ul className="space-y-1.5 font-satoshi text-sm text-studojo-ink">
      {[PACK_RULES.oneTime, PACK_RULES.recredit, PACK_RULES.noGuarantee, PACK_RULES.hires].map((r) => (
        <li key={r} className="flex items-start gap-2">
          <FiCheckCircle aria-hidden className="mt-0.5 shrink-0 text-[#047857]" />
          {r}
        </li>
      ))}
    </ul>
  );
}

export interface ReceiptData {
  no: string;
  item: string;
  outreaches: number;
  price: number;
  mission: string;
  date: string;
  newTotal: number;
}

export function Receipt({ r }: { r: ReceiptData }) {
  const m = useMotionPresets();
  const rows: [string, string][] = [
    ["Item", r.item],
    ["Mission", r.mission],
    ["Outreaches added", `+${r.outreaches}`],
    ["New total", formatCount(r.newTotal)],
    ["Price", formatINR(r.price)],
    ["Charged", `${formatINR(0)} (${COPY.mockPay})`],
  ];
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-studojo-ink bg-white p-4 shadow-brutal-lg">
      <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-muted">Receipt {r.no}</p>
      <p className="font-clash text-2xl font-semibold">{r.item}</p>
      <p className="font-satoshi text-sm text-studojo-muted">{r.date}</p>
      <dl className="mt-3 divide-y-2 divide-dashed divide-studojo-ink/15 font-satoshi text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 py-1.5">
            <dt className="text-studojo-muted">{k}</dt>
            <dd className="text-right font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      <motion.p
        variants={stampVariants(m.reduced)}
        initial="hidden"
        animate="show"
        className="pointer-events-none absolute right-3 top-3 rounded-lg border-[3px] border-[#92400e] bg-studojo-orange-bg/90 px-2 py-1 text-center font-clash text-sm font-semibold uppercase leading-tight text-[#92400e]"
      >
        Simulated
        <span className="block font-satoshi text-[10px] font-bold normal-case">nothing charged</span>
      </motion.p>
      <p className="mt-3 font-satoshi text-xs text-studojo-muted">{PACK_RULES.oneTime} {PACK_RULES.hires}</p>
    </div>
  );
}
