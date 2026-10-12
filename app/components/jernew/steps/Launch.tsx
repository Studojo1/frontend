// Step 10: launch. A pre-flight checklist ticks into place, then "Start
// sending" flies one envelope per send day onto a calendar: a steady trickle,
// so the inbox stays healthy. Free publishes the page instead. Owned by builder D.
import { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { formatCount, SEND_PACE } from "../data";
import { useFlow, useStepBar } from "../flow";
import { useMotionPresets } from "../motion";
import { Badge, Card, LiveRegion, StepHeader } from "../ui";
import {
  flightSeconds,
  PageBoard,
  SendBoard,
  type BoardPhase,
} from "./go/launch-board";
import { Preflight, usePreflightItems } from "./go/preflight";
import { pageIsPublic, sendsEmail, totalOutreaches } from "./go/shared";

export function Launch() {
  const f = useFlow();
  const m = useMotionPresets();
  const items = usePreflightItems();
  const paid = sendsEmail(f.data.pack);
  const isPublic = pageIsPublic(f.data.visibility);
  const total = totalOutreaches(f.data);
  const already = f.data.launched;
  const [phase, setPhase] = useState<BoardPhase>(already ? "done" : "ready");
  const [ticked, setTicked] = useState(already ? items.length : 0);
  const [say, setSay] = useState("");
  const timers = useRef<number[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  const later = (fn: () => void, ms: number) =>
    timers.current.push(window.setTimeout(fn, ms));

  useEffect(
    () => () => timers.current.forEach((t) => window.clearTimeout(t)),
    [],
  );

  // Tick the checklist in turn on arrival. Reduced motion: all at once.
  useEffect(() => {
    if (ticked >= items.length) return;
    if (m.reduced) {
      setTicked(items.length);
      return;
    }
    const t = window.setTimeout(
      () => setTicked((n) => n + 1),
      ticked === 0 ? 260 : 170,
    );
    return () => window.clearTimeout(t);
  }, [ticked, items.length, m.reduced]);

  useEffect(() => {
    if (ticked === items.length && !already)
      setSay("Pre-flight check complete. Everything is in place.");
  }, [ticked, items.length, already]);

  const finish = () => {
    setPhase("done");
    f.set({ launched: true });
  };

  const launch = () => {
    if (already || phase === "done") return f.next();
    if (phase === "flying") {
      // Second press while envelopes fly: skip ahead.
      finish();
      return f.next();
    }
    setTicked(items.length);
    setPhase("flying");
    // On phones the board sits below the checklist: bring it into view so the flight is seen.
    const box = boardRef.current?.getBoundingClientRect();
    if (box && (box.top < 64 || box.bottom > window.innerHeight - 96)) {
      boardRef.current?.scrollIntoView({
        behavior: m.reduced ? "auto" : "smooth",
        block: "center",
      });
    }
    const flight =
      paid && !m.reduced
        ? flightSeconds(total) * 1000 + 250
        : m.reduced
          ? 250
          : 700;
    setSay(
      paid
        ? `Sending started. ${formatCount(total)} emails, ${SEND_PACE}.`
        : isPublic
          ? "Publishing your page."
          : "Saving your page.",
    );
    later(() => {
      finish();
      setSay(
        paid
          ? "Sending started. Opening mission control."
          : isPublic
            ? "Your page is live."
            : "Your page is saved and private.",
      );
    }, flight);
    later(() => f.next(), flight + (m.reduced ? 600 : 1100));
  };

  const label =
    already || phase === "done"
      ? "Open mission control"
      : phase === "flying"
        ? "Skip ahead"
        : paid
          ? "Start sending"
          : isPublic
            ? "Publish my page"
            : "Save my page";

  useStepBar({
    label,
    tone: "green",
    onPrimary: launch,
    hint: paid
      ? "Sending is simulated in this preview. Nothing is sent."
      : "Free sends nothing. Your page is the whole thing.",
    hintOnPhone: true,
    // Starting a send needs an explicit tap: Enter never launches.
    enterToContinue: already || phase !== "ready",
  });

  return (
    <div>
      <StepHeader
        title={paid ? "Pre-flight check" : isPublic ? "Ready to go live" : "Ready to save your page"}
        description={
          paid
            ? `Everything in place? Then start sending. Emails go out as ${SEND_PACE}.`
            : isPublic
              ? "Free keeps your page only. Check it over, then put it live."
              : "Free keeps your page only, and it stays private. Check it over, then save it."
        }
        aside={paid ? <Badge kind="simulated" /> : null}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
        <Card shadow="md">
          <h2 className="mb-4 font-clash text-xl font-semibold">Checklist</h2>
          <Preflight items={items} ticked={ticked} />
        </Card>

        <div ref={boardRef}>
          <Card shadow="lg" tone={phase === "done" ? "green" : "white"}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-clash text-xl font-semibold">
                <FiSend aria-hidden /> {paid ? "Your send plan" : "Your page"}
              </h2>
              {paid ? <Badge kind="simulated">Simulated plan</Badge> : null}
            </div>
            {paid ? (
              <SendBoard total={total} phase={phase} />
            ) : (
              <PageBoard phase={phase} isPublic={isPublic} />
            )}
            {phase === "done" ? (
              <p className="mt-3 font-satoshi text-base font-bold">
                {paid
                  ? "Launched. You will see replies in mission control."
                  : isPublic
                    ? "Your page is live at its link."
                    : "Your page is saved and private."}
              </p>
            ) : null}
          </Card>
        </div>
      </div>

      <LiveRegion message={say} />
    </div>
  );
}
