import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSignedIn } from "../home-b2c/cta";
import { DESK, homeSignIn, JOIN_LINE, joinHref, type Stage } from "./agent";
import { Arrow, Mic } from "./icons";
import { CALL_HASH, lockScroll, unlockScroll, type ScrollLock } from "./call-lock";
import { fetchLine, unlockAudio, useSpoken } from "./useSpoken";

// HOMEPAGE V2: the homepage's one agent, Stu, shared by every start: the hero (Stu and its button), the floating
// agent (side pill, phone bar) and the footer's "ready when you are" button.
//
// Signed out, a tap on any of them opens the call takeover (Takeover.tsx: a full-screen call screen over the locked
// page, owner 27 Oct) and starts the first step of the owner's flow there, instead of on /b2cnew/join and in the
// same order: Stu says /join's line (useSpoken), then /join's sign-up card (JoinCard), whose Google and email
// buttons go where /join's do (agent.ts homeSignIn: /auth, then /b2cnew/start?fresh with the visit's keys). One
// stage for the visit (idle, speaking, signup), so the line plays once; opened again, the takeover shows the card.
// Never a resume before sign-up: the resume is asked for in the call.
// The takeover gets a history entry of its own (#stu, navigated before the page is locked so the router keeps the
// scroll position for the page's own entry): Back closes it, and so do its x and Escape (which also step back off
// that entry); either way the page is unlocked at the same scroll position.
// Signed in, every start is a plain link to /b2cnew (their desk), never a new onboarding.
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
  /** Stop her (the sign-up buttons). */
  hush: () => void;
  /** The call takeover is open. */
  callOpen: boolean;
  openCall: (opener: HTMLElement | null) => void;
  closeCall: () => void;
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
  const [callOpen, setCallOpen] = useState(false);
  const open = useRef(false);
  const lock = useRef<ScrollLock | null>(null);
  const pushed = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const href = signedIn ? DESK : joinHref(search);
  const signIn = useMemo(() => homeSignIn(search), [search]);

  const go = useCallback((s: Stage) => {
    stageRef.current = s;
    setStage(s);
  }, []);

  // join.tsx begin(): the click lets her speak; she says her line; then the card.
  const { say, stop } = spoken;
  const begin = useCallback(() => {
    if (stageRef.current !== "idle") return;
    unlockAudio();
    go("speaking");
    void say().then(() => {
      if (stageRef.current === "speaking") go("signup");
    });
  }, [go, say]);

  const hush = useCallback(() => {
    stop();
  }, [stop]);

  // Off the takeover: the page unlocked where it was, her line stopped if she was mid-way (the card is what comes
  // next, wherever she is opened again), and focus back on the button that opened it.
  const shut = useCallback(() => {
    if (!open.current) return;
    open.current = false;
    if (lock.current) unlockScroll(window, lock.current);
    lock.current = null;
    setCallOpen(false);
    if (stageRef.current === "speaking") {
      stop();
      go("signup");
    }
    const back = opener.current;
    window.setTimeout(() => back?.focus?.({ preventScroll: true }), 60);
  }, [go, stop]);

  const openCall = useCallback(
    (el: HTMLElement | null) => {
      opener.current = el;
      if (!open.current) {
        open.current = true;
        // the history entry first (the router keeps this scroll position for the page's entry), then the lock
        pushed.current = location.hash !== CALL_HASH;
        if (pushed.current) navigate({ pathname: location.pathname, search: location.search, hash: CALL_HASH }, { preventScrollReset: true });
        lock.current = lockScroll(window);
        setCallOpen(true);
      }
      begin();
    },
    [begin, location.hash, location.pathname, location.search, navigate],
  );

  // The x and Escape: close, and step back off the takeover's own entry.
  const closeCall = useCallback(() => {
    const was = pushed.current;
    pushed.current = false;
    shut();
    if (was) navigate(-1);
  }, [navigate, shut]);

  // Back (or anything else that leaves #stu) closes it.
  useEffect(() => {
    if (!callOpen) return;
    const onPop = () => {
      pushed.current = false;
      shut();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [callOpen, shut]);
  useEffect(() => {
    if (callOpen && location.hash !== CALL_HASH && !pushed.current) shut();
  }, [callOpen, location.hash, shut]);

  // A visit that lands on #stu (a reload, a shared link) starts on the page itself: the entry is dropped.
  const landed = useRef(location.hash === CALL_HASH);
  useEffect(() => {
    if (!landed.current) return;
    landed.current = false;
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, preventScrollReset: true });
  }, [location.pathname, location.search, navigate]);

  // Never leave the page locked behind (a navigation away while it is open).
  useEffect(
    () => () => {
      if (lock.current) unlockScroll(window, lock.current);
    },
    [],
  );

  const agent = useMemo<Agent>(
    () => ({ signedIn, href, signIn, stage, speaking: spoken.speaking, level: spoken.level, hush, callOpen, openCall, closeCall }),
    [signedIn, href, signIn, stage, spoken.speaking, spoken.level, hush, callOpen, openCall, closeCall],
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
  return useAgent().signedIn ? "Open my jobs" : "Start the call";
}

/**
 * Every "start the call" on the homepage. A plain <a href> (/b2cnew is another app). Signed out, a plain click opens
 * the call takeover and starts Stu there; a click with a modifier key opens /b2cnew/join in a new tab as before.
 * Signed in, it is "open my jobs" to /b2cnew.
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
              a.openCall(e.currentTarget);
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
