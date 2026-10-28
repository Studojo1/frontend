import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { Cross, LuClockIcon, LuFileTextIcon, LuTargetIcon, LuVolume2Icon } from "./icons";
import { JoinCard, Said, Talking } from "./JoinCard";
import { useAgent } from "./start";
import { StuArt } from "./StuArt";
import { CALL_FACTS_LEFT, CALL_FACTS_RIGHT } from "./call-lock";

// HOMEPAGE V2 TAKEOVER: the call screen every start opens (start.tsx openCall). A full-screen layer over the locked
// page, a slim header (the logo, a close x), and in it: Stu big, speaking, her line lighting up as she says it, then
// /join's sign-up card; with Pranav's four lobby facts as small tiles from the first moment (two each side of Stu on
// a desktop, as his lobby has them; a 2 by 2 grid under her words or the card on a phone). It all fits one screen,
// no scrolling, from 375 by 667 up (home-v3.css .hv-call). The same order and links as before: tap, her line, the
// card, /auth, /b2cnew/start?fresh with the visit's keys. Closed by the x, Escape or Back; the page is where it was.

const ICONS: Record<(typeof CALL_FACTS_LEFT)[number]["icon"] | (typeof CALL_FACTS_RIGHT)[number]["icon"], ComponentType> = {
  clock: LuClockIcon,
  target: LuTargetIcon,
  file: LuFileTextIcon,
  volume: LuVolume2Icon,
};

function CallFacts({ side }: { side: "left" | "right" | "below" }) {
  const facts = side === "left" ? CALL_FACTS_LEFT : side === "right" ? CALL_FACTS_RIGHT : [...CALL_FACTS_LEFT, ...CALL_FACTS_RIGHT];
  return (
    <ul className={`hv-cfacts hv-cfacts-${side}`} aria-label={side === "right" ? "Have ready" : "About the call"} data-facts={side}>
      {facts.map((f) => {
        const Icon = ICONS[f.icon];
        return (
          <li key={f.title} className="hv-cfact">
            <span className="hv-cfact-ico" aria-hidden="true">
              <Icon />
            </span>
            <span className="hv-cfact-txt">
              <b>{f.title}</b>
              <small>{f.sub}</small>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function CallTakeover() {
  const a = useAgent();
  const { callOpen, closeCall } = a;
  const [shown, setShown] = useState(false);
  const x = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!callOpen) {
      setShown(false);
      return;
    }
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, [callOpen]);

  useEffect(() => {
    if (shown) x.current?.focus({ preventScroll: true });
  }, [shown]);

  useEffect(() => {
    if (!callOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCall();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [callOpen, closeCall]);

  if (!callOpen || a.signedIn) return null;
  const stage = a.stage === "idle" ? "speaking" : a.stage;
  return (
    <div className={`hv-call${shown ? " hv-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="call-kicker" data-stage={stage} data-call>
      <div className="hv-call-hdr">
        <span className="hv-brand">
          <img src="/stu/logo-doodle.png" width={24} height={30} alt="" />
          <b>studojo</b>
        </span>
        <button ref={x} type="button" className="hv-call-x" aria-label="close" onClick={closeCall} data-call-close>
          <Cross size={16} sw={2.6} />
        </button>
      </div>
      <div className="hv-call-body">
        <CallFacts side="left" />
        <div className="hv-call-main">
          <div className="hv-call-lead">
            <StuArt live={a.speaking ? a.level : null} />
            <div className="hv-call-words">
              <p className="hv-kicker" id="call-kicker">
                Stu, your career agent
              </p>
              <Said />
            </div>
          </div>
          {stage === "speaking" && <Talking />}
          {stage === "signup" && <JoinCard idPrefix="call" />}
        </div>
        <CallFacts side="right" />
        <CallFacts side="below" />
      </div>
    </div>
  );
}
