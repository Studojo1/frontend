// The rail: missions, the fuel gauge, Gmail and the page. 240px from 1280px,
// 72px icons from 1024px, hidden on phones (the More sheet and the top bar
// carry the same things). Pause all, Disconnect and Unpublish act at once;
// Senpai posts a note after. Shared file: owned by the foundation.
import { Link } from "react-router";
import { motion } from "framer-motion";
import { FiArrowLeft, FiFileText, FiMail, FiPause, FiPlay, FiPlus, FiRefreshCw } from "react-icons/fi";
import { COPY, MAX_MISSIONS, MISSION_ACCENT, MISSION_STATUS_LABEL } from "../config";
import { fuel, unseenReplies } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { formatCount } from "../data";
import { LAYOUT, SPRING_SNAP } from "../motion";
import type { Mission } from "../types";
import { Button, cx, FOCUS_RING } from "../ui";
import { FuelGauge } from "../widgets/fuel-gauge";

export function Rail() {
  return (
    <nav aria-label="Missions and settings" className="hidden w-[72px] shrink-0 flex-col overflow-y-auto border-r-2 border-studojo-ink bg-white lg:flex xl:w-60">
      <div className="flex flex-col gap-4 p-3 xl:p-4">
        <MissionList />
        <div className="hidden xl:block">
          <RailHeading>Fuel</RailHeading>
          <FuelGauge />
        </div>
        <div className="flex justify-center xl:hidden">
          <FuelGauge variant="ring" />
        </div>
        <GmailCard />
        <PageCard />
        <Link
          to="/jernew?step=mission"
          className={cx("mt-auto inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl font-satoshi text-xs font-bold text-studojo-muted hover:text-studojo-ink xl:justify-start", FOCUS_RING)}
        >
          <FiArrowLeft aria-hidden />
          <span className="hidden xl:inline">Back to onboarding</span>
          <span className="sr-only xl:hidden">Back to onboarding</span>
        </Link>
      </div>
    </nav>
  );
}

function RailHeading({ children }: { children: string }) {
  return <h2 className="mb-2 hidden font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-muted xl:block">{children}</h2>;
}

function MissionList() {
  const { s } = useB2C();
  const agent = useAgent();
  const full = s.missions.length >= MAX_MISSIONS;
  return (
    <div>
      <RailHeading>Missions</RailHeading>
      <ul className="space-y-1.5">
        {s.missions.map((m) => (
          <MissionRow key={m.id} m={m} />
        ))}
      </ul>
      <button
        type="button"
        disabled={full}
        title={full ? "Three missions is the most at once" : "New mission"}
        onClick={() => {
          agent.open({ focus: false });
          agent.start("F14", { choice: "new" });
        }}
        className={cx(
          "mt-1.5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-studojo-ink/40 font-satoshi text-sm font-bold text-studojo-muted hover:border-studojo-ink hover:text-studojo-ink disabled:cursor-not-allowed disabled:opacity-40 xl:justify-start xl:px-3",
          FOCUS_RING,
        )}
      >
        <FiPlus aria-hidden />
        <span className="hidden xl:inline">New mission</span>
        <span className="sr-only xl:hidden">New mission</span>
      </button>
    </div>
  );
}

function MissionRow({ m }: { m: Mission }) {
  const { s, dispatch } = useB2C();
  const on = s.env === m.id;
  const accent = MISSION_ACCENT[m.accent];
  const f = fuel(s, m.id);
  const unseen = unseenReplies(s, m.id);
  return (
    <li>
      <button
        type="button"
        onClick={() => dispatch({ type: "SET_ENV", env: m.id })}
        aria-current={on ? "true" : undefined}
        aria-label={`${m.name}, ${MISSION_STATUS_LABEL[m.status]}${unseen ? `, ${unseen} new replies` : ""}`}
        className={cx("relative flex min-h-11 w-full items-center justify-center gap-2 rounded-xl p-2 text-left xl:justify-start", FOCUS_RING)}
      >
        {on ? (
          <motion.span layoutId={LAYOUT.missionRow} transition={SPRING_SNAP} aria-hidden className={cx("absolute inset-0 rounded-xl border-2 border-studojo-ink", accent.tint)} />
        ) : null}
        <span aria-hidden className={cx("relative h-3 w-3 shrink-0 rounded-full border-2 border-studojo-ink", accent.solid)} />
        <span className="relative hidden min-w-0 flex-1 xl:block">
          <span className="block truncate font-satoshi text-sm font-bold text-studojo-ink">{m.short}</span>
          <span className="mt-1 flex items-center gap-2">
            <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full border border-studojo-ink/30 bg-white">
              <span className={cx("block h-full", accent.solid)} style={{ width: `${f.total ? Math.round((f.sent / f.total) * 100) : 0}%` }} />
            </span>
            <span className="font-satoshi text-[11px] text-studojo-muted">{f.total ? `${formatCount(f.left)} left` : MISSION_STATUS_LABEL[m.status]}</span>
          </span>
        </span>
        {unseen ? <span aria-hidden className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-studojo-ink bg-studojo-pink xl:static" /> : null}
      </button>
    </li>
  );
}

function GmailCard() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const status = !s.gmail.connected ? "Disconnected" : s.gmail.paused ? "Paused" : "Sending, inside the cap";
  const pause = () => {
    dispatch({ type: "PAUSE_SENDING", paused: !s.gmail.paused });
    agent.note(s.gmail.paused ? "Sending is back on, inside the daily cap." : `${COPY.paused} Drafts and replies still work.`);
  };
  return (
    <section aria-label="Gmail" className="rounded-2xl border-2 border-studojo-ink bg-white p-2 xl:p-3">
      <div className="flex items-center justify-center gap-2 xl:justify-start">
        <FiMail aria-hidden className="shrink-0" />
        <span className="hidden min-w-0 flex-1 xl:block">
          <span className="block truncate font-satoshi text-sm font-bold">{s.gmail.address}</span>
          <span className={cx("block font-satoshi text-[11px]", s.gmail.paused ? "font-bold text-[#b45309]" : "text-studojo-muted")}>{status}</span>
        </span>
      </div>
      {s.gmail.connected ? (
        <div className="mt-2 flex flex-col gap-1.5">
          <Button size="sm" variant="secondary" onClick={pause} icon={s.gmail.paused ? <FiPlay /> : <FiPause />} aria-label={s.gmail.paused ? "Resume sending" : "Pause all sending"} className="min-h-9 px-2 text-xs">
            <span className="hidden xl:inline">{s.gmail.paused ? "Resume" : "Pause all"}</span>
          </Button>
          {/* A wrapper hides it in the 72px rail: Button's own inline-flex would beat a bare "hidden". */}
          <div className="hidden xl:block">
            <Button
              size="sm"
              variant="ghost"
              className="min-h-9 w-full px-2 text-xs text-studojo-muted"
              onClick={() => {
                dispatch({ type: "DISCONNECT_GMAIL" });
                agent.note("Gmail is disconnected. Nothing sends until you connect again. Your drafts are safe.");
              }}
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="secondary" icon={<FiRefreshCw />} aria-label="Connect Gmail again" className="mt-2 min-h-9 w-full px-2 text-xs" onClick={() => dispatch({ type: "CONNECT_GMAIL" })}>
          <span className="hidden xl:inline">Connect again</span>
        </Button>
      )}
    </section>
  );
}

function PageCard() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  return (
    <section aria-label="Your page" className="rounded-2xl border-2 border-studojo-ink bg-white p-2 xl:p-3">
      <button
        type="button"
        onClick={() => dispatch({ type: "SET_TAB", tab: "page" })}
        className={cx("flex w-full items-center justify-center gap-2 rounded-lg text-left xl:justify-start", FOCUS_RING)}
      >
        <FiFileText aria-hidden className="shrink-0" />
        <span className="hidden min-w-0 flex-1 xl:block">
          <span className="block font-satoshi text-sm font-bold">Your page</span>
          <span className={cx("block font-satoshi text-[11px]", s.page.live ? "text-[#047857]" : "font-bold text-[#be185d]")}>
            {s.page.live ? "Live, link-only" : "Private"}
          </span>
        </span>
        <span className="sr-only xl:hidden">Your page, {s.page.live ? "live, link-only" : "private"}</span>
      </button>
      <div className="mt-2 hidden xl:block">
        {s.page.live ? (
          <Button
            size="sm"
            variant="secondary"
            className="min-h-9 w-full text-xs"
            onClick={() => {
              dispatch({ type: "UNPUBLISH" });
              agent.note("Your page is private. Queued follow-ups now go without the link. Undo is in the toast for 10 seconds.");
            }}
          >
            Unpublish now
          </Button>
        ) : (
          <Button size="sm" variant="secondary" className="min-h-9 w-full text-xs" disabled={!s.page.visibility.adult} onClick={() => dispatch({ type: "REPUBLISH" })}>
            Publish again
          </Button>
        )}
      </div>
    </section>
  );
}
