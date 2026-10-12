// Phones and tablets (under 1024px): the Senpai pill and the bottom bar,
// fixed together. Five slots: Today, People, Approve, Replies, More.
// Shared file: owned by the foundation.
import { useRef, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { FiMoreHorizontal } from "react-icons/fi";
import { TABS } from "../config";
import { tabCounts, unseenReplies } from "../core/derive";
import { useB2C } from "../core/store";
import { LAYOUT, SPRING_SNAP } from "../motion";
import type { TabId } from "../types";
import { CountBadge, cx, FOCUS_RING } from "../ui";
import { SenpaiPill } from "./senpai-pill";

const BAR_LABEL: Partial<Record<TabId, string>> = { approvals: "Approve" };

export function PhoneDock() {
  return (
    <div data-floating-cta className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <SenpaiPill />
      <BottomBar />
    </div>
  );
}

function BottomBar() {
  const { s, dispatch } = useB2C();
  const counts = tabCounts(s);
  const unseen = unseenReplies(s);
  const barTabs = TABS.filter((t) => t.phoneBar);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const inMore = !barTabs.some((t) => t.id === s.tab);
  const moreLabel = inMore ? TABS.find((t) => t.id === s.tab)?.label ?? "More" : "More";

  const onKey = (e: KeyboardEvent, i: number) => {
    const n = barTabs.length;
    const to = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : -1;
    if (to < 0) return;
    e.preventDefault();
    refs.current[to]?.focus();
    dispatch({ type: "SET_TAB", tab: barTabs[to].id });
  };

  const slot = "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl font-satoshi text-[11px] font-bold";
  return (
    <nav aria-label="Workspace" className="border-t-2 border-studojo-ink bg-white px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1">
      <div className="flex items-stretch gap-1">
        <div role="tablist" aria-label="Workspace tabs" className="flex flex-[4] items-stretch gap-1">
          {barTabs.map((t, i) => {
            const on = s.tab === t.id;
            const count = t.id === "approvals" ? counts.approvals : null;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`b2c-bar-tab-${t.id}`}
                aria-selected={on}
                aria-controls="b2c-ws-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => dispatch({ type: "SET_TAB", tab: t.id })}
                onKeyDown={(e) => onKey(e, i)}
                className={cx(slot, on ? "text-studojo-ink" : "text-studojo-muted", FOCUS_RING)}
              >
                {on ? <motion.span layoutId={LAYOUT.barPill} transition={SPRING_SNAP} aria-hidden className="absolute inset-0 rounded-xl border-2 border-studojo-ink bg-studojo-purple-bg" /> : null}
                <span className="relative text-xl" aria-hidden>
                  <t.icon />
                  {count ? <CountBadge n={count} tone="purple" className="absolute -right-3.5 -top-2" /> : null}
                  {t.id === "replies" && unseen ? <span className="absolute -right-1.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-studojo-pink" /> : null}
                </span>
                <span className="relative">{BAR_LABEL[t.id] ?? t.label}</span>
                {count ? <span className="sr-only">, {count} waiting</span> : null}
                {t.id === "replies" && unseen ? <span className="sr-only">, {unseen} new</span> : null}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={inMore ? `More, showing ${moreLabel}` : "More"}
          onClick={() => dispatch({ type: "SHEET", sheet: "more" })}
          className={cx(slot, inMore ? "text-studojo-ink" : "text-studojo-muted", FOCUS_RING)}
        >
          {inMore ? <motion.span layoutId={LAYOUT.barPill} transition={SPRING_SNAP} aria-hidden className="absolute inset-0 rounded-xl border-2 border-studojo-ink bg-studojo-purple-bg" /> : null}
          <FiMoreHorizontal aria-hidden className="relative text-xl" />
          <span className="relative">{moreLabel}</span>
        </button>
      </div>
    </nav>
  );
}
