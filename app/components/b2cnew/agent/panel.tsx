// AgentPanel: Senpai's dock (desktop) and full-height sheet (phones).
// Header with live status and close, the Chat, Runs and Memory segments
// bound to s.dock.seg, and the composer (always there, so Ctrl or Cmd K and
// "/" can focus it from any segment). Owned by Group 1.
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiChevronsRight } from "react-icons/fi";
import { DOCK_SEGS, MISSION_ACCENT, SKILL_STYLE } from "../config";
import { missionOf } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { LAYOUT, QUICK } from "../motion";
import { cx, IconButton, Segmented } from "../ui";
import { lowerFirst, SenpaiMark } from "./bits";
import { Composer } from "./composer";
import { MemoryBoard } from "./memory-board";
import { RunsLog } from "./runs-log";
import { Thread } from "./thread";

export function AgentPanel({ variant }: { variant: "dock" | "sheet" }) {
  const { s, dispatch } = useB2C();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefix = `b2c-dock-${variant}`;
  const memCount = s.memory.filter((x) => x.scope === "shared" || x.scope === s.env).length;
  const live = !!useAgent().liveStep;
  // Runs and Memory open at the top; the thread scrolls itself to the latest.
  useEffect(() => {
    if (s.dock.seg !== "chat" && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [s.dock.seg]);
  const items = DOCK_SEGS.map((seg) => ({
    id: seg.id,
    label: seg.label,
    count: seg.id === "memory" ? memCount : null,
    dot: seg.id === "runs" && live && s.dock.seg !== "runs",
  }));

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <Header variant={variant} />
      <div className="shrink-0 px-3 pb-2 pt-2">
        <Segmented
          items={items}
          value={s.dock.seg}
          onChange={(seg) => dispatch({ type: "DOCK", seg })}
          label="Senpai views"
          layoutId={`${LAYOUT.dockSeg}-${variant}`}
          idPrefix={prefix}
          size="sm"
        />
      </div>
      <div
        ref={scrollRef}
        id={`${prefix}-panel`}
        role="tabpanel"
        aria-labelledby={`${prefix}-tab-${s.dock.seg}`}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={s.dock.seg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={QUICK}>
            {s.dock.seg === "chat" ? <Thread scrollRef={scrollRef} /> : s.dock.seg === "runs" ? <RunsLog /> : <MemoryBoard />}
          </motion.div>
        </AnimatePresence>
      </div>
      <Composer variant={variant} />
    </div>
  );
}

function Header({ variant }: { variant: "dock" | "sheet" }) {
  const { s } = useB2C();
  const agent = useAgent();
  const m = missionOf(s);
  const accent = MISSION_ACCENT[m.accent];
  const l = agent.liveStep;
  const status = l
    ? l.needsYou
      ? "Waiting for your answer"
      : `${SKILL_STYLE[l.skill].label}: ${lowerFirst(l.label)}, ${l.index + 1} of ${l.total}`
    : "Ready. Nothing runs without you.";
  return (
    <div className="flex shrink-0 items-center gap-2.5 border-b-2 border-studojo-ink px-3 py-2">
      <SenpaiMark busy={!!l} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2">
          <span data-dock-focus tabIndex={-1} className="rounded font-clash text-lg font-semibold leading-tight text-studojo-ink outline-none focus-visible:ring-2 focus-visible:ring-studojo-purple">
            Senpai
          </span>
          <span className={cx("inline-flex min-w-0 items-center gap-1 truncate rounded-full border px-2 py-px font-satoshi text-[11px] font-bold", accent.tint, accent.text, "border-studojo-ink/20")}>
            <span aria-hidden className={cx("h-1.5 w-1.5 shrink-0 rounded-full", accent.solid)} />
            <span className="truncate">{m.short}</span>
          </span>
        </p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={QUICK}
            className={cx("truncate font-satoshi text-xs", l?.needsYou ? "font-bold text-[#92400e]" : l ? "text-studojo-purple-strong" : "text-studojo-muted")}
          >
            {status}
          </motion.p>
        </AnimatePresence>
      </div>
      <IconButton
        label={variant === "sheet" ? "Close Senpai" : "Collapse Senpai"}
        icon={variant === "sheet" ? <FiChevronDown /> : <FiChevronsRight />}
        onClick={agent.close}
      />
    </div>
  );
}
