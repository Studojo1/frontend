import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { lockScroll, unlockScroll } from "./call-lock";
import { LAUNCH_SECONDS, countdownOn, launchAt, type LaunchStage } from "./launch";
import { faceSrc, type Face } from "./StuArt";

// LAUNCH-COUNTDOWN (the owner, 5 Nov 2026: "on studojo.pro ... a ten-second launch countdown ... every time I refresh
// the page ... the moment the countdown finishes, it opens our actual website"). A full-screen purple sheet over the
// homepage on every load: Stu, "Launching in" and 10 down to 1 with a bar filling under it; at 0, "Stu is live." and
// a burst of confetti, then the sheet lifts off the page and the homepage is there, scrolled to the top. HomeV3
// renders it, and only a B2C host renders HomeV3 (app/lib/b2c-home.ts), so studojo.com never shows it. It is in the
// server's HTML, so the page never shows before it; the count starts once the page is live in the browser. While it
// counts the page under it is inert and does not scroll. ?countdown=0 skips it. Timing: launch.ts.

/** Stu's face while it counts, one a second; he laughs once it is live. */
const COUNT_FACES: readonly Face[] = ["happy", "curious", "sparkle", "grin"];
const CONFETTI = Array.from({ length: 28 }, (_, i) => i);
const CONFETTI_COLORS = ["#ffffff", "#dab2ff", "#191a23", "#10b981"] as const;

export function LaunchCountdown() {
  const { search } = useLocation();
  const on = countdownOn(search);
  const [stage, setStage] = useState<LaunchStage>("count");
  const [left, setLeft] = useState(LAUNCH_SECONDS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!on) return;
    const page = document.querySelector<HTMLElement>(".hv-pagewrap");
    page?.setAttribute("inert", "");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const lock = lockScroll(window);
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      unlockScroll(window, lock);
      page?.removeAttribute("inert");
    };
    const start = performance.now();
    setRunning(true);
    const timer = window.setInterval(() => {
      const now = launchAt(performance.now() - start);
      setLeft(now.left);
      setStage(now.stage);
      // The page is usable from the moment the sheet starts to lift.
      if (now.stage === "lift" || now.stage === "done") release();
      if (now.stage === "done") window.clearInterval(timer);
    }, 50);
    return () => {
      window.clearInterval(timer);
      release();
    };
  }, [on]);

  if (!on || stage === "done") return null;
  const live = stage === "live" || stage === "lift";
  const face: Face = live ? "laugh" : COUNT_FACES[(LAUNCH_SECONDS - left) % COUNT_FACES.length];
  const cls = ["hv-lc", running && "hv-lc-run", live && "hv-lc-live", stage === "lift" && "hv-lc-lift"].filter(Boolean).join(" ");
  return (
    <div className={cls} role="dialog" aria-modal="true" aria-label="Studojo launch countdown">
      <div className="hv-lc-in">
        <img className="hv-lc-stu" src={faceSrc(face)} width={256} height={256} alt="" />
        <p className="hv-lc-kicker">Stu, your career agent</p>
        <p className="hv-lc-h">{live ? "Stu is" : "Launching in"}</p>
        <p className="hv-lc-n" role="timer" aria-live="off">
          <span key={live ? "live" : left}>{live ? "live." : left}</span>
        </p>
        <div className="hv-lc-bar" aria-hidden="true">
          <i />
        </div>
      </div>
      {live && (
        <div className="hv-lc-confetti" aria-hidden="true">
          {CONFETTI.map((i) => (
            <i
              key={i}
              style={{
                ["--dx" as string]: `${Math.round(Math.cos((i / CONFETTI.length) * Math.PI * 2) * (34 + (i % 4) * 9))}vw`,
                ["--dy" as string]: `${Math.round(Math.sin((i / CONFETTI.length) * Math.PI * 2) * (26 + (i % 3) * 10))}vh`,
                ["--r" as string]: `${(i * 47) % 360}deg`,
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                animationDelay: `${(i % 5) * 30}ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
