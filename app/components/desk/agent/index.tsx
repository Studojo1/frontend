// AgentPanel: the assistant as the 428px left panel (desktop) or the body of
// the bottom sheet (phones). The main thread comes from the desk's one
// bootstrap call; an outreach page passes scope "outreach:<id>" and gets that
// person's own thread (get or create). Header, thread, composer. No persona
// name: the assistant speaks as I.
import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useDeskResource } from "~/lib/desk/cache";
import { deskPath } from "~/lib/desk/nav";
import type { BootstrapResponse } from "~/lib/desk/types";
import { ChipButton, Spinner } from "./bits";
import { loadBootstrap } from "./calls";
import { Composer } from "./composer";
import { PanelHeader } from "./header";
import { ensureScoped, hydrateMain } from "./runner";
import { getState, MAIN, registerNavigator, setActiveScope } from "./store";
import { Thread } from "./thread";
import { scopeKey } from "./use-agent";

export { askAbout, askAgent, attachToAgent, detachFromAgent, useAgent, usePageContext } from "./use-agent";

function useMainBootstrap(active: boolean) {
  const res = useDeskResource<BootstrapResponse>("bootstrap", loadBootstrap, { enabled: active });
  const data = res.data;
  useEffect(() => {
    if (!active || !data) return;
    // A switched off or not enabled account never reaches the panel: the
    // shell shows the whole page unavailable state instead (useDeskBoot).
    if (data.enabled) hydrateMain(data);
  }, [active, data]);
  return res;
}

export function AgentPanel({ variant, scope }: { variant: "panel" | "sheet"; scope?: string }) {
  const key = scopeKey(scope);
  const main = key === MAIN;
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const boot = useMainBootstrap(main);

  // askAgent and the shell's useAgent() follow the panel on screen.
  useEffect(() => {
    setActiveScope(key);
    return () => {
      if (getState().activeScope === key) setActiveScope(MAIN);
    };
  }, [key]);

  // Navigate events from the agent move the workspace through the router.
  useEffect(() => {
    registerNavigator((t) => navigate(deskPath(t)));
    return () => registerNavigator(null);
  }, [navigate]);

  useEffect(() => {
    if (!main) void ensureScoped(key);
  }, [key, main]);

  let body: ReactNode;
  if (main && !boot.data && boot.error) {
    body = (
      <div className="py-6">
        <p className="font-satoshi text-sm text-studojo-muted">I could not load your chat.</p>
        <ChipButton className="mt-2" onClick={() => void boot.reload().catch(() => {})}>
          Try again
        </ChipButton>
      </div>
    );
  } else if (main && !boot.data) {
    body = (
      <p className="flex items-center gap-2 py-6 font-satoshi text-sm text-studojo-muted">
        <Spinner /> Opening your chat
      </p>
    );
  } else {
    body = <Thread scope={key} scrollRef={scrollRef} />;
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-white">
      <PanelHeader scope={key} variant={variant} />
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3">
        {body}
      </div>
      <Composer scope={key} variant={variant} />
    </div>
  );
}
