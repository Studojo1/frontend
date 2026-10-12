// WalletSheet: fuel for this mission, every mission's balance, the top-up
// (₹999 for 150 more, to people already matched) or a pack for an unfunded
// mission, a mock purchase that charges nothing, and the receipt. Group 4.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiLoader, FiZap } from "react-icons/fi";
import { COPY, MISSION_ACCENT } from "../config";
import { fuel } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C, useMission } from "../core/store";
import { dayDate, formatCount, formatINR, PACK_RULES, PACKS, packById, TOP_UP } from "../data";
import { useMotionPresets } from "../motion";
import type { PackId } from "../types";
import { Button, Card, cx, FOCUS_RING, HoldButton, SectionHeader, Sheet } from "../ui";
import { FuelBreakdown, PackOption, Receipt, RulesList, type ReceiptData } from "./wallet-parts";

type Phase = "home" | "review" | "paying" | "receipt";
type Choice = { kind: "topup" } | { kind: "pack"; pack: PackId };

export function WalletSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const mission = useMission();
  const m = useMotionPresets();
  const [phase, setPhase] = useState<Phase>("home");
  const [choice, setChoice] = useState<Choice | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const timer = useRef<number | null>(null);
  const funded = mission.total > 0;
  const f = fuel(s);
  const packs = PACKS.filter((p) => p.outreaches > 0);
  const picked = choice?.kind === "pack" ? packById(choice.pack) : null;
  const item = choice?.kind === "topup" ? { name: "Top-up", price: TOP_UP.price, outreaches: TOP_UP.outreaches } : picked ? { name: `${picked.name} pack`, price: picked.price, outreaches: picked.outreaches } : null;

  useEffect(() => {
    if (open) return;
    if (timer.current) window.clearTimeout(timer.current);
    setPhase("home");
    setChoice(null);
    setReceipt(null);
  }, [open]);
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const pay = () => {
    if (!choice || !item) return;
    setPhase("paying");
    const no = `SJ-${String(s.seq + 1).padStart(4, "0")}`;
    const newTotal = mission.total + item.outreaches;
    timer.current = window.setTimeout(() => {
      if (choice.kind === "topup") dispatch({ type: "TOP_UP", missionId: mission.id });
      else dispatch({ type: "FUND_MISSION", missionId: mission.id, pack: choice.pack });
      setReceipt({ no, item: item.name, outreaches: item.outreaches, price: item.price, mission: mission.short, date: `${dayDate(s.day).label}, Day ${s.day}`, newTotal });
      setPhase("receipt");
      agent.note(
        choice.kind === "topup"
          ? `Topped up: ${item.outreaches} more, to people already matched. ${COPY.mockPay}. I will pace them inside the daily cap, and nothing new goes without your approval.`
          : `${mission.short} is funded with ${item.outreaches} outreaches. ${COPY.mockPay}. First drafts wait for you in Approvals.`,
      );
    }, 900);
  };

  const footer =
    phase === "review" && item ? (
      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <HoldButton tone="primary" onConfirm={pay} label={`Hold to pay ${formatINR(item.price)}. ${COPY.mockPay}`} className="w-full sm:flex-1">
          Hold to pay {formatINR(item.price)}
        </HoldButton>
        <Button variant="ghost" icon={<FiArrowLeft />} onClick={() => setPhase("home")}>
          Back
        </Button>
      </div>
    ) : phase === "receipt" ? (
      <Button className="w-full" onClick={onClose}>
        Done
      </Button>
    ) : phase === "home" && choice ? (
      <Button className="w-full" onClick={() => setPhase("review")}>
        Review {item ? `${item.name}, ${formatINR(item.price)}` : ""}
      </Button>
    ) : undefined;

  return (
    <Sheet open={open} onClose={onClose} title="Wallet" description={`${PACK_RULES.oneTime} Prices in ₹.`} footer={footer}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={phase} initial={{ opacity: 0, x: m.reduced ? 0 : 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-5">
          {phase === "home" ? (
            <>
              <FuelBreakdown f={f} title={mission.short} notch={mission.notch} />
              <OtherMissions />
              {funded ? (
                <section aria-labelledby="wallet-topup">
                  <SectionHeader as="h3" id="wallet-topup" title="Top up" kicker="More from people already matched" />
                  <button
                    type="button"
                    aria-pressed={choice?.kind === "topup"}
                    onClick={() => setChoice(choice?.kind === "topup" ? null : { kind: "topup" })}
                    className={cx(
                      "flex w-full items-center gap-3 rounded-2xl border-2 border-studojo-ink p-4 text-left font-satoshi transition-shadow",
                      choice?.kind === "topup" ? "bg-studojo-yellow-bg shadow-brutal" : "bg-white",
                      FOCUS_RING,
                    )}
                  >
                    <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-studojo-ink bg-studojo-yellow text-lg"><FiZap /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold">{TOP_UP.outreaches} more emails</span>
                      <span className="block text-sm text-studojo-muted">No new questions. Same target, same guardrails.</span>
                    </span>
                    <span className="font-clash text-2xl font-semibold">{formatINR(TOP_UP.price)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      agent.open({ focus: false });
                      agent.start("F13");
                    }}
                    className={cx("mt-2 min-h-11 rounded-lg font-satoshi text-sm font-bold text-studojo-purple-strong underline underline-offset-4", FOCUS_RING)}
                  >
                    Ask Senpai to preview the best {TOP_UP.outreaches} first
                  </button>
                </section>
              ) : (
                <section aria-labelledby="wallet-packs">
                  <SectionHeader as="h3" id="wallet-packs" title={`Fund ${mission.short}`} kicker="Pick a pack" />
                  <div role="radiogroup" aria-labelledby="wallet-packs" className="space-y-2">
                    {packs.map((p) => (
                      <PackOption key={p.id} pack={p} selected={choice?.kind === "pack" && choice.pack === p.id} onSelect={() => setChoice({ kind: "pack", pack: p.id })} />
                    ))}
                  </div>
                </section>
              )}
              <Receipts />
            </>
          ) : phase === "review" && item ? (
            <>
              <Card tone="purple" shadow="md">
                <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-purple-strong">You are buying</p>
                <p className="mt-1 font-clash text-2xl font-semibold">{item.name}: {item.outreaches} personal emails</p>
                <p className="font-satoshi text-sm text-studojo-muted">For {mission.name}. Sent from {s.gmail.address}, only after you approve.</p>
                <p className="mt-3 font-clash text-4xl font-semibold">{formatINR(item.price)}</p>
                <p className="font-satoshi text-sm font-bold text-[#92400e]">{COPY.mockPay}. This is a concept preview.</p>
              </Card>
              <RulesList />
            </>
          ) : phase === "paying" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center font-satoshi" role="status">
              <FiLoader aria-hidden className={cx("text-3xl", !m.reduced && "animate-spin")} />
              <p className="text-base font-bold">Confirming. {COPY.mockPay}.</p>
            </div>
          ) : receipt ? (
            <>
              <Receipt r={receipt} />
              <FuelBreakdown f={f} title={`${mission.short}, after`} notch={mission.notch} />
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </Sheet>
  );
}

function OtherMissions() {
  const { s, dispatch } = useB2C();
  const others = s.missions.filter((x) => x.id !== s.env);
  if (!others.length) return null;
  return (
    <ul className="space-y-1.5" aria-label="Other missions">
      {others.map((x) => {
        const fx = fuel(s, x.id);
        return (
          <li key={x.id} className="flex min-h-12 items-center gap-3 rounded-xl border-2 border-studojo-ink/20 bg-white px-3 font-satoshi text-sm">
            <span aria-hidden className={cx("h-3 w-3 shrink-0 rounded-full border-2 border-studojo-ink", MISSION_ACCENT[x.accent].solid)} />
            <span className="min-w-0 flex-1 truncate font-bold">{x.short}</span>
            <span className="text-studojo-muted">{fx.total ? `${formatCount(fx.left)} of ${formatCount(fx.total)} left` : "No pack yet"}</span>
            <button type="button" onClick={() => dispatch({ type: "SET_ENV", env: x.id })} className={cx("min-h-10 rounded-lg px-2 font-bold text-studojo-purple-strong underline underline-offset-2", FOCUS_RING)}>
              Open
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Past mock purchases, read from the activity log. */
function Receipts() {
  const { s } = useB2C();
  const rows = s.log.filter((l) => l.text.includes(COPY.mockPay)).reverse();
  return (
    <section aria-labelledby="wallet-receipts">
      <SectionHeader as="h3" id="wallet-receipts" title="Receipts" />
      {rows.length ? (
        <ul className="divide-y-2 divide-studojo-ink/10 rounded-2xl border-2 border-studojo-ink bg-white">
          {rows.map((l) => (
            <li key={l.id} className="flex items-start gap-3 px-3 py-2.5 font-satoshi text-sm">
              <span className="min-w-0 flex-1">{l.text}</span>
              <span className="shrink-0 text-xs font-bold text-studojo-muted">Day {l.day}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-satoshi text-sm text-studojo-muted">No purchases yet in this preview. New ones show here, each one {COPY.mockPay.toLowerCase()}.</p>
      )}
    </section>
  );
}
