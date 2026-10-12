// The chat thread for the active mission: every message kind, day labels,
// a welcome when the thread is empty, and sticky scrolling that follows new
// messages unless you have scrolled up to read.
import { Fragment, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowDown } from "react-icons/fi";
import { missionOf } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { dayDate } from "../data";
import { QUICK, SPRING_SNAP, useSafeReducedMotion } from "../motion";
import type { ChatMsg, QuickChip } from "../types";
import { cx, FOCUS_RING, LiveRegion } from "../ui";
import { ChipButton } from "./bits";
import { DecisionCard, MemoryProposal, SenpaiShell, WhyCard } from "./cards";
import { DiffCard } from "./diff-card";
import { RunCard } from "./run-card";

export function Thread({ scrollRef }: { scrollRef: RefObject<HTMLDivElement | null> }) {
  const { s } = useB2C();
  const agent = useAgent();
  const reduced = useSafeReducedMotion();
  const msgs = s.chat.filter((c) => c.missionId === s.env);
  const lastRun = [...msgs].reverse().find((c) => c.kind === "run");
  const lastAsk = [...msgs].reverse().find((c) => c.kind === "senpai" && c.chips?.some((x) => x.answer !== undefined));
  const [stuck, setStuck] = useState(true);
  const stick = useRef(true);
  const listRef = useRef<HTMLOListElement>(null);
  const live = agent.liveStep;
  const sig = `${msgs.length}:${live?.index ?? -1}:${live?.needsYou ?? false}:${s.env}`;
  // Messages already here when the thread mounted (or the mission changed) appear
  // without their entrance animation; only new ones animate in.
  const atMount = useMemo(() => new Set(msgs.map((m) => m.id)), [s.env]);
  // Screen readers hear Senpai's newest words once, not the whole list on a
  // mission switch. Run progress is announced by the shell's RunAnnouncer only.
  const said = [...msgs].reverse().find((m) => m.kind === "senpai" || m.kind === "decision");
  const [announce, setAnnounce] = useState("");
  const lastSaid = useRef<{ env: string; id: string | undefined } | null>(null);
  useEffect(() => {
    const prev = lastSaid.current;
    lastSaid.current = { env: s.env, id: said?.id };
    if (!prev || prev.env !== s.env || !said || prev.id === said.id) return;
    if (said.kind === "senpai" || said.kind === "decision") setAnnounce(`Senpai: ${said.text}`);
  }, [said?.id, s.env]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Only you scrolling up unsticks it; our own smooth scroll only moves down.
    let lastTop = el.scrollTop;
    const onScroll = () => {
      const near = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
      if (near) stick.current = true;
      else if (el.scrollTop < lastTop - 4) stick.current = false;
      lastTop = el.scrollTop;
      setStuck(stick.current);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    // Cards that grow after they land (steps, expanding) keep the view pinned.
    const ro = new ResizeObserver(() => {
      if (stick.current) el.scrollTop = el.scrollHeight;
    });
    if (listRef.current) ro.observe(listRef.current);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [scrollRef, msgs.length > 0]);

  useEffect(() => {
    const el = scrollRef.current;
    const last = msgs[msgs.length - 1];
    if (last?.kind === "you") stick.current = true;
    if (!el || !stick.current) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [sig]);

  const jump = () => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" });

  if (!msgs.length) return <Welcome />;
  return (
    <div className="relative">
      <LiveRegion message={announce} />
      <ol ref={listRef} aria-label="Conversation with Senpai" className="space-y-3 pb-2 pt-1">
        {msgs.map((m, i) => {
          const prev = msgs[i - 1];
          const newDay = prev && prev.day !== m.day && m.kind !== "divider" && prev.kind !== "divider";
          return (
            <Fragment key={m.id}>
              {newDay ? <DayLabel text={`${dayDate(m.day).label} · Day ${m.day}`} /> : null}
              <motion.li
                initial={atMount.has(m.id) ? false : reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduced ? QUICK : SPRING_SNAP}
              >
                <Message m={m} latestRun={m.id === lastRun?.id} latestAsk={m.id === lastAsk?.id} />
              </motion.li>
            </Fragment>
          );
        })}
      </ol>
      <AnimatePresence>
        {!stuck ? (
          <motion.button
            type="button"
            onClick={jump}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={QUICK}
            className={cx(
              "sticky bottom-2 left-full z-10 ml-auto flex min-h-9 items-center gap-1 rounded-full border-2 border-studojo-ink bg-white px-3 font-satoshi text-xs font-bold shadow-[2px_2px_0_0_#191a23]",
              FOCUS_RING,
            )}
          >
            <FiArrowDown aria-hidden /> Latest
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DayLabel({ text }: { text: string }) {
  return (
    <li aria-hidden className="flex items-center gap-2 py-1">
      <span className="h-px flex-1 bg-studojo-ink/15" />
      <span className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-muted">{text}</span>
      <span className="h-px flex-1 bg-studojo-ink/15" />
    </li>
  );
}

function Message({ m, latestRun, latestAsk }: { m: ChatMsg; latestRun: boolean; latestAsk: boolean }) {
  const { s } = useB2C();
  switch (m.kind) {
    case "divider":
      return (
        <div className="flex items-center gap-2 py-1">
          <span className="h-0.5 flex-1 rounded-full bg-studojo-ink/15" />
          <span className="max-w-[80%] text-center font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">{m.text}</span>
          <span className="h-0.5 flex-1 rounded-full bg-studojo-ink/15" />
        </div>
      );
    case "you":
      return (
        <div className="flex flex-col items-end gap-1 pl-10">
          <p className="rounded-2xl rounded-tr-md border-2 border-studojo-ink bg-studojo-ink px-3 py-2 font-satoshi text-sm leading-relaxed text-white">
            <span className="sr-only">You: </span>
            {m.text}
          </p>
          {m.context.length ? (
            <p className="flex flex-wrap justify-end gap-1">
              {m.context.map((c) => (
                <span key={`${c.kind}-${c.id}`} className="rounded-full border border-studojo-ink/30 bg-white px-2 py-0.5 font-satoshi text-[11px] font-bold text-studojo-muted">
                  {c.label}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      );
    case "senpai":
      return <SenpaiText m={m} latestAsk={latestAsk} />;
    case "decision":
      return <DecisionCard m={m} />;
    case "memory":
      return <MemoryProposal m={m} />;
    case "why":
      return <WhyCard m={m} />;
    case "diff":
      return <DiffCard m={m} />;
    case "run": {
      const run = s.runs.find((r) => r.id === m.runId);
      return run ? <RunCard run={run} latest={latestRun} /> : null;
    }
    default:
      return null;
  }
}

function SenpaiText({ m, latestAsk }: { m: Extract<ChatMsg, { kind: "senpai" }>; latestAsk: boolean }) {
  const { dispatch } = useB2C();
  const agent = useAgent();
  const waiting = !!agent.liveStep?.needsYou;
  const chips = (m.chips ?? []).filter((c) => c.answer === undefined || (latestAsk && waiting));
  const pick = (c: QuickChip) => {
    if (c.flow || c.answer !== undefined) dispatch({ type: "CHAT_UPDATE", id: m.id, patch: { chips: (m.chips ?? []).filter((x) => !x.flow && x.answer === undefined) } });
    agent.chip(c);
  };
  const asking = latestAsk && waiting;
  return (
    <SenpaiShell tone={asking ? "yellow" : "white"}>
      {asking ? <p className="mb-0.5 font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-[#92400e]">Needs you</p> : null}
      <p className="font-satoshi text-sm leading-relaxed text-studojo-ink">
        <span className="sr-only">Senpai: </span>
        {m.text}
      </p>
      {chips.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <ChipButton key={c.label} tone={c.tone === "primary" ? "primary" : c.tab || c.action ? "soft" : "plain"} onClick={() => pick(c)}>
              {c.label}
            </ChipButton>
          ))}
        </div>
      ) : null}
    </SenpaiShell>
  );
}

function Welcome() {
  const { s } = useB2C();
  const agent = useAgent();
  const m = missionOf(s);
  return (
    <div className="pt-2">
      <SenpaiShell tone="purple">
        <p className="font-clash text-lg font-semibold text-studojo-ink">Hi Riya. I am Senpai.</p>
        <p className="mt-1 font-satoshi text-sm leading-relaxed text-studojo-ink">
          This is the thread for {m.short}. I find named hiring managers, draft from your resume and pace sends from your Gmail. I never send a reply for you, and nothing goes out until you approve.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {agent.quickChips().map((c) => (
            <ChipButton key={c.label} tone={c.tone === "primary" ? "primary" : "plain"} onClick={() => agent.chip(c)}>
              {c.label}
            </ChipButton>
          ))}
        </div>
      </SenpaiShell>
    </div>
  );
}
