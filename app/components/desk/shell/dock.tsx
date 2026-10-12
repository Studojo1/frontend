// Phones (under 1024px): the bottom dock with the four tabs, the floating
// Ask button, and the assistant as a bottom sheet. Back closes the sheet
// (the shell keeps it in the URL as ?ask=1), and so do Escape and its own
// close control.
import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { FiHome, FiInbox, FiMessageCircle, FiUser, FiUsers } from "react-icons/fi";
import { cx, FOCUS_RING, PRESS } from "~/components/desk/agent/bits";
import { deskPath, DESK_TABS } from "~/lib/desk/nav";
import type { DeskRoute } from "~/lib/desk/types";
import { activeTab, CountBubble } from "./top-bar";

const ICONS: Partial<Record<DeskRoute, ReactNode>> = {
  home: <FiHome />,
  people: <FiUsers />,
  inbox: <FiInbox />,
  profile: <FiUser />,
};

export function PhoneDock({ tab, inboxCount }: { tab: DeskRoute; inboxCount: number }) {
  const on = activeTab(tab);
  return (
    <nav
      aria-label="Desk"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t-2 border-studojo-ink bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {DESK_TABS.map((t) => {
        const current = on === t.id;
        return (
          <Link
            key={t.id}
            to={deskPath(t.id)}
            aria-current={current ? "page" : undefined}
            aria-label={t.id === "inbox" && inboxCount > 0 ? `${t.label}, ${inboxCount} waiting` : t.label}
            className={cx(
              "relative flex min-h-14 flex-col items-center justify-center gap-0.5 font-satoshi text-xs font-bold",
              FOCUS_RING,
              current ? "text-studojo-purple-strong" : "text-studojo-muted",
            )}
          >
            <span aria-hidden className={cx("relative flex h-7 w-12 items-center justify-center rounded-full text-lg", current && "bg-studojo-purple-bg")}>
              {ICONS[t.id]}
              {t.id === "inbox" ? <CountBubble n={inboxCount} className="absolute -right-1 -top-1" /> : null}
            </span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * The floating Ask button. While the sheet is open it stays mounted but
 * hidden, so the sheet can hand focus back to it when it closes.
 */
export function AskButton({ onClick, busy, hidden }: { onClick: () => void; busy?: boolean; hidden?: boolean }) {
  return (
    <button
      type="button"
      id="desk-ask-button"
      onClick={onClick}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      aria-label={busy ? "Open the assistant. It is working" : "Open the assistant"}
      className={cx(
        "fixed bottom-[calc(4.5rem_+_env(safe-area-inset-bottom))] right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-studojo-ink bg-studojo-purple-strong px-5 font-satoshi text-base font-bold text-white shadow-[3px_3px_0_0_#191a23] lg:hidden",
        hidden && "invisible",
        PRESS,
        FOCUS_RING,
      )}
    >
      <FiMessageCircle aria-hidden />
      Ask
      {busy ? <span aria-hidden className="h-2.5 w-2.5 animate-pulse rounded-full border border-white bg-studojo-green" /> : null}
    </button>
  );
}

const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * The assistant on phones: a modal sheet from the bottom, 88% of the screen,
 * so the workspace still peeks out above it. Holds focus while open, returns
 * it to the Ask button when it closes, and locks the page scroll.
 */
export function AgentSheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = window.requestAnimationFrame(() => {
      const el = ref.current;
      if (!el || el.contains(document.activeElement)) return;
      (el.querySelector<HTMLElement>("textarea,input") ?? el).focus({ preventScroll: true });
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (before && document.contains(before)) before.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button type="button" tabIndex={-1} aria-label="Close the assistant" onClick={() => close.current()} className="absolute inset-0 h-full w-full cursor-default bg-studojo-ink/40" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Assistant"
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex h-[88dvh] flex-col overflow-hidden rounded-t-3xl border-2 border-b-0 border-studojo-ink bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_0_0_#191a23] outline-none"
      >
        <span aria-hidden className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-studojo-ink/25" />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
