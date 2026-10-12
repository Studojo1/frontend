// Top bars for the desk. Desktop (1024px and up): the four tabs, then
// Settings and the credit pill, plus "Show assistant" while the panel is
// closed. Phones: wordmark, credit pill and Settings; the tabs live in the
// bottom dock (dock.tsx).
import type { ReactNode } from "react";
import { Link } from "react-router";
import { FiMessageCircle, FiSettings } from "react-icons/fi";
import { cx, FOCUS_RING, PRESS } from "~/components/desk/agent/bits";
import { deskPath, DESK_TABS } from "~/lib/desk/nav";
import type { DeskRoute } from "~/lib/desk/types";

export function Wordmark({ className }: { className?: string }) {
  return (
    <a
      href="/"
      className={cx("flex min-h-11 shrink-0 items-center rounded-lg font-clash text-2xl font-bold tracking-tight text-studojo-ink", FOCUS_RING, className)}
    >
      studojo
    </a>
  );
}

/** A small count bubble beside a tab name. */
export function CountBubble({ n, className }: { n: number; className?: string }) {
  if (n <= 0) return null;
  return (
    <span
      aria-hidden
      className={cx(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-pink px-1 font-satoshi text-[11px] font-bold tabular-nums leading-none text-white",
        className,
      )}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}

/** "38 left": the student's email credits. Opens the credits page. */
export function CreditPill({ available, className }: { available: number | null | undefined; className?: string }) {
  if (available === null || available === undefined) return null;
  const n = Math.max(0, available);
  return (
    <a
      href="/outreach/enrichment"
      aria-label={`${n} email ${n === 1 ? "credit" : "credits"} left. Open credits`}
      title="Email credits left"
      className={cx(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border-2 border-studojo-ink bg-studojo-yellow-bg px-3 font-satoshi text-sm font-bold tabular-nums text-studojo-ink shadow-[2px_2px_0_0_#191a23] hover:bg-[#fef9c3]",
        PRESS,
        FOCUS_RING,
      )}
    >
      <span aria-hidden className="h-2 w-2 rounded-full border border-studojo-ink bg-studojo-yellow" />
      {n} left
    </a>
  );
}

function tabLabel(id: DeskRoute, inboxCount: number): string {
  const t = DESK_TABS.find((x) => x.id === id)?.label ?? id;
  return id === "inbox" && inboxCount > 0 ? `${t}, ${inboxCount} ${inboxCount === 1 ? "reply wants" : "replies want"} you` : t;
}

/** Which tab lights up: the outreach page belongs to Home. */
export function activeTab(tab: DeskRoute): DeskRoute {
  return tab === "outreach" ? "home" : tab;
}

/** The header focuses this button after "Hide assistant", so focus is never lost. */
export const SHOW_AGENT_ID = "desk-show-agent";

export interface TopBarProps {
  tab: DeskRoute;
  inboxCount: number;
  credits: number | null | undefined;
  agentOpen: boolean;
  onShowAgent: () => void;
}

export function DesktopTopBar({ tab, inboxCount, credits, agentOpen, onShowAgent }: TopBarProps) {
  const on = activeTab(tab);
  return (
    <header className="hidden h-14 shrink-0 items-center gap-2 border-b-2 border-studojo-ink bg-white px-4 lg:flex">
      {agentOpen ? null : (
        <button
          type="button"
          id={SHOW_AGENT_ID}
          onClick={() => onShowAgent()}
          className={cx(
            "mr-1 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-purple-bg px-3 font-satoshi text-sm font-bold text-studojo-purple-strong shadow-[2px_2px_0_0_#191a23]",
            PRESS,
            FOCUS_RING,
          )}
        >
          <FiMessageCircle aria-hidden />
          Show assistant
        </button>
      )}
      <Wordmark className="mr-2 text-xl" />
      <nav aria-label="Desk" className="flex min-w-0 items-center gap-1">
        {DESK_TABS.map((t) => (
          <TabLink key={t.id} to={deskPath(t.id)} current={on === t.id} label={tabLabel(t.id, inboxCount)}>
            {t.label}
            {t.id === "inbox" ? <CountBubble n={inboxCount} /> : null}
          </TabLink>
        ))}
      </nav>
      <div className="flex-1" />
      <TabLink to={deskPath("settings")} current={on === "settings"} label="Settings">
        <FiSettings aria-hidden />
        Settings
      </TabLink>
      <CreditPill available={credits} />
    </header>
  );
}

function TabLink({ to, current, label, children }: { to: string; current: boolean; label: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      aria-current={current ? "page" : undefined}
      aria-label={label}
      className={cx(
        "inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 px-3 font-satoshi text-[15px] font-bold",
        FOCUS_RING,
        current ? "border-studojo-ink bg-studojo-ink text-white" : "border-transparent text-studojo-ink hover:border-studojo-ink/20 hover:bg-studojo-purple-bg",
      )}
    >
      {children}
    </Link>
  );
}

export function PhoneTopBar({ tab, credits }: { tab: DeskRoute; credits: number | null | undefined }) {
  const onSettings = tab === "settings";
  return (
    <header className="sticky top-0 z-30 flex h-[52px] shrink-0 items-center gap-2 border-b-2 border-studojo-ink bg-white px-4 lg:hidden">
      <Wordmark />
      <div className="flex-1" />
      <CreditPill available={credits} />
      <Link
        to={deskPath("settings")}
        aria-label="Settings"
        aria-current={onSettings ? "page" : undefined}
        className={cx(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 text-lg",
          FOCUS_RING,
          onSettings ? "border-studojo-ink bg-studojo-ink text-white" : "border-transparent text-studojo-ink hover:bg-studojo-purple-bg",
        )}
      >
        <FiSettings aria-hidden />
      </Link>
    </header>
  );
}

/** The bar shown before the desk is ready, or when it is not available. */
export function PlainTopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center border-b-2 border-studojo-ink bg-white px-4">
      <Wordmark />
    </header>
  );
}
