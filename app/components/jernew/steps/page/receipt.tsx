// The privacy receipt: a till slip that reprints a line whenever a setting
// changes, so the student can see exactly what they agreed to.
// Owned by builder B (Your page).
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROFILE_DRAFT, seeded } from "../../data";
import { useMotionPresets } from "../../motion";
import type { VisibilityState } from "../../types";
import { Badge } from "../../ui";
import { reachShort } from "./visibility-logic";

interface Row {
  label: string;
  value: string;
  strong?: boolean;
}

export function Receipt({ v, approved }: { v: VisibilityState; approved: boolean }) {
  const isPublic = v.link && v.adult;
  const rows: Row[] = [
    { label: "Page", value: PROFILE_DRAFT.url },
    { label: "Reviewed by you", value: approved ? "Yes" : "Not yet" },
    { label: "Link", value: !v.link ? "Off, private" : v.adult ? "On" : "On, waiting on 18+" },
    { label: "Search engines", value: isPublic && v.search ? "On" : "Off" },
    { label: "Hiring managers", value: isPublic && v.managers ? "On" : "Off" },
    { label: "18 or older", value: v.adult ? "Confirmed" : "Not confirmed" },
    { label: "Phone, email, address", value: "Never shown" },
    { label: "Unpublish", value: "Any time, instant" },
    { label: "Hires from your emails", value: "Yours, no fee", strong: true },
  ];

  return (
    <div className="mx-auto w-full max-w-md" role="group" aria-labelledby="jernew-receipt-title">
      <div className="rounded-t-2xl border-x-2 border-t-2 border-studojo-ink bg-white px-4 pb-2 pt-4 font-mono text-[13px] text-studojo-ink sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <h2 id="jernew-receipt-title" className="font-satoshi text-sm font-bold uppercase tracking-[0.16em]">
            Privacy receipt
          </h2>
          <Badge kind="concept">Concept</Badge>
        </div>
        <p className="mt-1 text-xs text-studojo-muted">No. RS-7K2 · Saved in this browser only</p>
        <Rule />
        <dl className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline gap-2">
              <dt className="shrink-0">{r.label}</dt>
              <span aria-hidden className="min-w-4 flex-1 translate-y-[-3px] border-b-2 border-dotted border-studojo-ink/30" />
              <dd className={r.strong ? "min-w-0 text-right font-bold" : "min-w-0 text-right"}>
                <Reprint value={r.value} />
              </dd>
            </div>
          ))}
        </dl>
        <Rule />
        <div className="flex items-baseline justify-between gap-3 text-sm font-bold uppercase">
          <span>Visible to</span>
          <span className="text-right">
            <Reprint value={reachShort(v)} />
          </span>
        </div>
        <Barcode />
        <p className="pb-1 text-center text-[11px] text-studojo-muted">Short on purpose. Nothing hidden below.</p>
      </div>
      <Zigzag />
    </div>
  );
}

/** A value that reprints (slides in fresh) when it changes. */
function Reprint({ value }: { value: string }) {
  const m = useMotionPresets();
  return (
    <span className="relative inline-block break-all">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="relative inline-block"
          initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.span
            aria-hidden
            className="absolute inset-[-2px] rounded bg-studojo-yellow/40"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          />
          <span className="relative">{value}</span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Rule() {
  return <div aria-hidden className="my-3 border-t-2 border-dashed border-studojo-ink/40" />;
}

/** Decorative barcode, seeded so server and browser draw the same bars. */
function Barcode() {
  const bars = useMemo(() => {
    const rnd = seeded(7_2026);
    const out: { x: number; w: number }[] = [];
    let x = 0;
    while (x < 236) {
      const w = 1 + Math.floor(rnd() * 3.2);
      out.push({ x, w });
      x += w + 1 + Math.floor(rnd() * 2.5);
    }
    return out;
  }, []);
  return (
    <svg aria-hidden viewBox="0 0 240 34" className="mx-auto mt-4 h-9 w-56">
      {bars.map((b) => (
        <rect key={b.x} x={b.x + 2} y="0" width={b.w} height="34" fill="#171717" />
      ))}
    </svg>
  );
}

/** Torn paper edge at the bottom of the slip. */
function Zigzag() {
  const teeth = 24;
  const step = 100 / teeth;
  let d = "M0 0";
  for (let i = 0; i < teeth; i++) d += ` L${(i * step + step / 2).toFixed(3)} 10 L${((i + 1) * step).toFixed(3)} 0`;
  return (
    <svg aria-hidden viewBox="0 0 100 10" preserveAspectRatio="none" className="-mt-px block h-3 w-full">
      <path d={`${d} Z`} fill="#ffffff" />
      <path d={d} fill="none" stroke="#171717" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
