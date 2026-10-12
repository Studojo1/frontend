// The agent dock on desktop. From 1280px: a 400px aside, or a 56px strip
// when collapsed. From 1024 to 1279px: the strip only; it opens the
// slide-over (sheet-host.tsx). Shared file: owned by the foundation.
import { useEffect, useRef } from "react";
import { FiChevronsLeft, FiMessageCircle } from "react-icons/fi";
import { AgentPanel } from "../agent/panel";
import { pendingDrafts } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { CountBadge, cx, FOCUS_RING, Kbd, POINTER_FINE } from "../ui";

export function Dock() {
  const { s, viewport } = useB2C();
  const expanded = viewport === "wide" && s.dock.open;
  const ref = useRef<HTMLElement>(null);
  const was = useRef(expanded);
  // Opening or collapsing swaps the strip and the panel. If that dropped focus
  // (the button you pressed is gone), land on the panel's title or the strip's
  // Open button, so keyboard and screen reader users keep their place.
  useEffect(() => {
    if (was.current === expanded) return;
    was.current = expanded;
    const active = document.activeElement;
    if (active && active !== document.body && document.contains(active)) return;
    const raf = window.requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>(expanded ? "[data-dock-focus]" : "[data-strip-open]")?.focus());
    return () => window.cancelAnimationFrame(raf);
  }, [expanded]);
  return (
    <aside ref={ref} aria-label="Senpai" className={cx("hidden shrink-0 border-l-2 border-studojo-ink bg-white lg:flex", expanded ? "w-[400px]" : "w-14")}>
      {expanded ? (
        <div className="flex min-w-0 flex-1 flex-col">
          <AgentPanel variant="dock" />
        </div>
      ) : (
        <Strip />
      )}
    </aside>
  );
}

function Strip() {
  const { s } = useB2C();
  const agent = useAgent();
  const waiting = pendingDrafts(s).length;
  const live = agent.liveStep;
  return (
    <div className="flex w-14 flex-col items-center gap-3 py-3">
      <button
        type="button"
        data-strip-open
        onClick={() => agent.open({ focus: false })}
        aria-label={`Open Senpai${live ? `. Working: ${live.label}` : ""}${waiting ? `. ${waiting} drafts waiting` : ""}`}
        className={cx("relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-purple text-lg text-white shadow-[2px_2px_0_0_#191a23]", FOCUS_RING)}
      >
        <FiMessageCircle aria-hidden />
        <span
          aria-hidden
          className={cx("absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white", live?.needsYou ? "bg-studojo-orange" : live ? "bg-studojo-green" : "bg-studojo-ink/30")}
        />
      </button>
      {waiting ? <CountBadge n={waiting} tone="purple" /> : null}
      <button
        type="button"
        onClick={() => agent.open({ focus: false })}
        aria-label="Expand Senpai"
        className={cx("mt-auto flex h-11 w-11 items-center justify-center rounded-xl hover:bg-studojo-surface-muted", FOCUS_RING)}
      >
        <FiChevronsLeft aria-hidden />
      </button>
      <span aria-hidden className={POINTER_FINE} title="Press . to toggle Senpai">
        <Kbd>.</Kbd>
      </span>
    </div>
  );
}
