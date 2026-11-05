// LAUNCH-COUNTDOWN (the owner, 5 Nov 2026: "on studojo.pro ... a ten-second launch countdown ... every time I refresh
// the page ... the moment the countdown finishes, it opens our actual website"). The timing, pure, for the screen
// (LaunchCountdown.tsx) and the tests (app/lib/home-v3.test.mjs). Every load of the B2C homepage counts down from 10;
// at 0 it says Stu is live, then the screen lifts off the page. ?countdown=0 skips it (the team's own checks).

export const LAUNCH_SECONDS = 10;
/** "Stu is live." holds this long at 0, then the screen lifts off the page in LIFT_MS. */
export const LIVE_HOLD_MS = 700;
export const LIFT_MS = 800;

export type LaunchStage = "count" | "live" | "lift" | "done";

/** Where the countdown is, `ms` after it started: the stage and the number on screen (10 down to 1, then 0). */
export function launchAt(ms: number): { stage: LaunchStage; left: number } {
  const total = LAUNCH_SECONDS * 1000;
  const t = Math.max(0, ms);
  if (t < total) return { stage: "count", left: Math.ceil((total - t) / 1000) };
  if (t < total + LIVE_HOLD_MS) return { stage: "live", left: 0 };
  if (t < total + LIVE_HOLD_MS + LIFT_MS) return { stage: "lift", left: 0 };
  return { stage: "done", left: 0 };
}

/** Whether this load shows it: always, unless the address says ?countdown=0. */
export const countdownOn = (search: string): boolean => new URLSearchParams(search).get("countdown") !== "0";
