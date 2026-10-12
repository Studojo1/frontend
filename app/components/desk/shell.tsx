// The student desk frame at /b2cnew.
//
// Desktop (1024px and up): the assistant panel on the left, 428px, open by
// default and remembered per browser (the agent store keeps desk.agentOpen),
// pushing the workspace; closed, it collapses to nothing and the top bar
// offers "Show assistant". Phones: a sticky top bar, the four tabs in a
// bottom dock, and the assistant as a bottom sheet from the Ask button.
//
// Which screen shows is URL state (nav.ts). Data comes through the cache
// (cache.ts), primed by one bootstrap call and kept fresh by the feed poll
// and by the invalidate keys each agent turn sends.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router";
import { AgentPanel } from "~/components/desk/agent";
import { HomeTab, InboxTab, OutreachPage, PeopleTab, ProfileTab, SettingsTab } from "~/components/desk/tabs";
import { cx } from "~/components/desk/agent/bits";
import { useAgent } from "~/lib/desk/agent-store";
import { useDeskBoot, useDeskStatus, useFeedPolling, useInboxBadge, useIsDesktop } from "~/lib/desk/hooks";
import { serializeDeskParams, useDeskParams, DESK_BASE, type DeskParams } from "~/lib/desk/nav";
import { AgentSheet, AskButton, PhoneDock } from "./shell/dock";
import { DeskError, DeskLoading, DeskUnavailable, NeedsMatches, TabBoundary } from "./shell/states";
import { DesktopTopBar, PhoneTopBar, PlainTopBar } from "./shell/top-bar";

const BACKDROP: CSSProperties = {
  backgroundColor: "#fcfbff",
  backgroundImage: "radial-gradient(circle, rgba(23,23,23,0.08) 1px, transparent 1.3px)",
  backgroundSize: "22px 22px",
};

export function DeskShell() {
  const boot = useDeskBoot();
  if (boot.phase === "ready") return <ReadyDesk />;
  if (boot.phase === "needs_matches") return <NeedsMatches />;
  return (
    <div className="flex min-h-dvh flex-col font-satoshi text-studojo-ink" style={BACKDROP}>
      <PlainTopBar />
      <main className="flex-1 pb-16">
        {boot.phase === "unavailable" ? (
          <DeskUnavailable reason={boot.reason} step={boot.step} />
        ) : boot.phase === "error" ? (
          <DeskError message={boot.message} retry={boot.retry} />
        ) : (
          <DeskLoading />
        )}
      </main>
    </div>
  );
}

function ReadyDesk() {
  const [params] = useDeskParams();
  const isDesktop = useIsDesktop();
  const agent = useAgent();
  const status = useDeskStatus(true);
  const inboxCount = useInboxBadge(true);
  const sheetReady = useSheetSync(params, isDesktop, agent.isOpen, () => agent.open(), () => agent.close());
  useFeedPolling(true);

  const scope = params.tab === "outreach" && params.id ? `outreach:${params.id}` : undefined;
  const panelKey = scope ?? "main";
  const busy = agent.busy;
  const credits = status?.credits.available;
  // The top bar's button disappears as the panel opens: move focus into the
  // composer so it is never left on the page body.
  const showAgent = () => {
    agent.open();
    focusSoon(() => document.querySelector<HTMLElement>('aside textarea[id^="desk-agent-input-panel-"]'));
  };

  return (
    <div className="flex min-h-dvh font-satoshi text-studojo-ink lg:h-dvh lg:overflow-hidden" style={BACKDROP}>
      <a
        href="#desk-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:rounded-lg focus:bg-white focus:p-2"
      >
        Skip to workspace
      </a>
      <aside
        aria-label="Assistant"
        className={cx(
          "hidden shrink-0 flex-col bg-white lg:flex",
          agent.isOpen ? "w-[428px] border-r-2 border-studojo-ink" : "w-0 overflow-hidden",
        )}
      >
        {isDesktop && agent.isOpen ? <AgentPanel key={panelKey} variant="panel" scope={scope} /> : null}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <DesktopTopBar tab={params.tab} inboxCount={inboxCount} credits={credits} agentOpen={agent.isOpen} onShowAgent={showAgent} />
        <PhoneTopBar tab={params.tab} credits={credits} />
        <main id="desk-main" tabIndex={-1} className="min-h-0 flex-1 outline-none lg:overflow-y-auto" data-scroll-container>
          <div className="mx-auto w-full max-w-[1100px] px-4 pb-40 pt-4 lg:px-6 lg:pb-10 lg:pt-6">
            <TabBoundary key={params.tab === "outreach" ? `outreach:${params.id}` : params.tab}>
              <TabView params={params} />
            </TabBoundary>
          </div>
        </main>
      </div>
      <PhoneDock tab={params.tab} inboxCount={inboxCount} />
      {!isDesktop ? <AskButton onClick={() => agent.open()} busy={busy} hidden={sheetReady && agent.isOpen} /> : null}
      {!isDesktop && sheetReady && agent.isOpen ? (
        <AgentSheet onClose={() => agent.close()}>
          <AgentPanel key={panelKey} variant="sheet" scope={scope} />
        </AgentSheet>
      ) : null}
    </div>
  );
}

/** Focus an element once React has committed and the browser painted, retrying a few frames while it mounts. */
export function focusSoon(find: () => HTMLElement | null, tries = 10): void {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    const el = find();
    if (el) el.focus({ preventScroll: true });
    else if (tries > 1) focusSoon(find, tries - 1);
  });
}

function TabView({ params }: { params: DeskParams }) {
  switch (params.tab) {
    case "people":
      return <PeopleTab />;
    case "inbox":
      return <InboxTab />;
    case "profile":
      return <ProfileTab />;
    case "settings":
      return <SettingsTab />;
    case "outreach":
      return params.id ? <OutreachPage id={params.id} /> : <HomeTab />;
    default:
      return <HomeTab />;
  }
}

/**
 * Phones keep the open sheet in the URL as ?ask=1, so Back closes it.
 * Opening pushes ask=1; closing any other way (its close control, Escape,
 * an agent navigation) drops it by replacing the entry, never by going back,
 * so a navigation that just happened is never undone. Returns false until
 * the first sync has run, so a sheet never flashes open on a phone.
 */
function useSheetSync(params: DeskParams, isDesktop: boolean, isOpen: boolean, open: () => void, close: () => void): boolean {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const latest = useRef({ params, isOpen, isDesktop });
  latest.current = { params, isOpen, isDesktop };

  const go = (ask: boolean, replace: boolean) => {
    const p = latest.current.params;
    navigate(`${DESK_BASE}${serializeDeskParams({ ...p, ask })}`, { replace, preventScrollReset: true });
  };

  // First run on a phone: the sheet starts closed unless the URL asks for it.
  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      if (params.ask) open();
      else close();
    }
    setReady(true);
    // Mount only.
  }, []);

  // The panel opened or closed: bring the URL along.
  useEffect(() => {
    if (!ready) return;
    const { params: p, isDesktop: desk } = latest.current;
    if (desk) {
      if (p.ask) go(false, true);
      return;
    }
    if (isOpen && !p.ask) go(true, false);
    else if (!isOpen && p.ask) go(false, true);
  }, [isOpen, ready]);

  // Back (or a link) changed ?ask: bring the panel along.
  useEffect(() => {
    if (!ready || latest.current.isDesktop) return;
    if (params.ask && !latest.current.isOpen) open();
    else if (!params.ask && latest.current.isOpen) close();
  }, [params.ask, ready]);

  return ready;
}
