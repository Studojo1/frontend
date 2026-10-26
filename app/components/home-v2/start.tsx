import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import { useSignedIn } from "../home-b2c/cta";
import { DESK, homeSignIn, JOIN_LINE, joinHref, type Stage } from "./agent";
import { Arrow, Mic } from "./icons";
import { fetchLine, unlockAudio, useSpoken } from "./useSpoken";

// HOMEPAGE V2: the homepage's one agent, Stu, shared by the hero, the floating agent (side pill, phone bar), the
// sheet it opens and the footer's "ready when you are" button.
//
// Signed out, a tap on any of them is the first step of the owner's flow, here instead of on /b2cnew/join and in the
// same order: Stu says /join's line (useSpoken), then /join's sign-up card (JoinCard), whose Google and email
// buttons go where /join's do (agent.ts homeSignIn: /auth, then /b2cnew/start?fresh with the visit's keys). The
// hero comes alive in place; the floating agent and the footer open the sheet. One stage for all of them
// (idle, speaking, signup), so the line plays once. Never a resume before sign-up: the resume is asked for in the call.
// Signed in, every one of them is a plain link to /b2cnew (their desk), never a new onboarding.
// Every StartLink is a real <a href> to /b2cnew/join (signed out), so a visitor without the script, or one opening a
// new tab, still gets the same first step there.

export { useSignedIn };

type Place = "hero" | "hero-stu" | "side" | "bar" | "bar-stu" | "footer";

type Agent = {
  signedIn: boolean;
  /** Signed out: /b2cnew/join with the visit's query (the no-script way in). Signed in: /b2cnew. */
  href: string;
  /** The sign-up card's link (agent.ts homeSignIn). */
  signIn: string;
  stage: Stage;
  speaking: boolean;
  level: { agent: number };
  /** Where the visitor started her: the hero in place, or the sheet. */
  from: "hero" | "sheet";
  begin: (where: "hero" | "sheet") => void;
  /** Stop her (the sign-up buttons, closing the sheet). */
  hush: () => void;
  sheetOpen: boolean;
  openSheet: (opener: HTMLElement | null) => void;
  closeSheet: () => void;
};

const AgentCtx = createContext<Agent | null>(null);
/** How far through her words she is (its own context: it changes many times a second while she talks). */
const AtCtx = createContext(0);

export function useAgent(): Agent {
  const a = useContext(AgentCtx);
  if (!a) throw new Error("useAgent outside AgentProvider");
  return a;
}
export const useSaid = () => useContext(AtCtx);

export function AgentProvider({ children }: { children: ReactNode }) {
  const signedIn = useSignedIn();
  const { search } = useLocation();
  const spoken = useSpoken();
  const [stage, setStage] = useState<Stage>("idle");
  const stageRef = useRef<Stage>("idle");
  const [from, setFrom] = useState<"hero" | "sheet">("hero");
  const [sheetOpen, setSheetOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const href = signedIn ? DESK : joinHref(search);
  const signIn = useMemo(() => homeSignIn(search), [search]);

  const go = useCallback((s: Stage) => {
    stageRef.current = s;
    setStage(s);
  }, []);

  // join.tsx begin(): the click lets her speak; she says her line; then the card.
  const { say, stop } = spoken;
  const begin = useCallback(
    (where: "hero" | "sheet") => {
      if (stageRef.current !== "idle") return;
      setFrom(where);
      unlockAudio();
      go("speaking");
      void say().then(() => {
        if (stageRef.current === "speaking") go("signup");
      });
    },
    [go, say],
  );

  const hush = useCallback(() => {
    stop();
  }, [stop]);

  const openSheet = useCallback(
    (el: HTMLElement | null) => {
      opener.current = el;
      setSheetOpen(true);
      begin("sheet");
    },
    [begin],
  );

  // Closing the sheet while she talks stops her; the card is what comes next, wherever she is opened again.
  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    if (stageRef.current === "speaking") {
      stop();
      go("signup");
    }
    // back to the button that opened it, once the floating agent shows again
    const back = opener.current;
    window.setTimeout(() => back?.focus?.({ preventScroll: true }), 60);
  }, [go, stop]);

  const agent = useMemo<Agent>(
    () => ({ signedIn, href, signIn, stage, speaking: spoken.speaking, level: spoken.level, from, begin, hush, sheetOpen, openSheet, closeSheet }),
    [signedIn, href, signIn, stage, spoken.speaking, spoken.level, from, begin, hush, sheetOpen, openSheet, closeSheet],
  );
  return (
    <AgentCtx.Provider value={agent}>
      <AtCtx.Provider value={stage === "idle" ? 0 : stage === "signup" ? JOIN_LINE.length : spoken.at}>{children}</AtCtx.Provider>
    </AgentCtx.Provider>
  );
}

type StartLinkProps = {
  place: Place;
  className?: string;
  id?: string;
  tabIndex?: number;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
  /** In place of the icon and the label (Stu's head, the side pill's two lines). */
  children?: ReactNode;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

/** The label every start shows (the side pill and the bar too). */
export function useStartLabel(): string {
  return useAgent().signedIn ? "open my jobs" : "start the call";
}

/**
 * Every "start the call" on the homepage. A plain <a href> (/b2cnew is another app). Signed out, a plain click starts
 * Stu here (the hero in place; anywhere else, the sheet); a click with a modifier key opens /b2cnew/join in a new
 * tab as before. Signed in, it is "open my jobs" to /b2cnew.
 */
export function StartLink({ place, className, id, tabIndex, children, onPointerEnter, onPointerLeave, onFocus, onBlur, ...aria }: StartLinkProps) {
  const a = useAgent();
  const label = useStartLabel();
  return (
    <a
      href={a.href}
      id={id}
      className={className}
      data-start={place}
      tabIndex={tabIndex}
      aria-hidden={aria["aria-hidden"]}
      aria-label={aria["aria-label"]}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onPointerDown={a.signedIn ? undefined : () => void fetchLine().catch(() => undefined)}
      onClick={
        a.signedIn
          ? undefined
          : (e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              if (place === "hero" || place === "hero-stu") a.begin("hero");
              else a.openSheet(e.currentTarget);
            }
      }
    >
      {children ?? (
        <>
          {a.signedIn ? <Arrow size={20} /> : <Mic size={20} />}
          <span>{label}</span>
        </>
      )}
    </a>
  );
}
