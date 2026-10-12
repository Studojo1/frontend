// The phone More sheet (Page, Prep, Mission settings, Wallet, Gmail, Pause
// all) and the Gmail sheet. The shell wraps each in a Sheet.
// Shared file: owned by the foundation.
import type { ReactNode } from "react";
import { FiBookOpen, FiCreditCard, FiFileText, FiMail, FiPause, FiPlay, FiSettings, FiSliders } from "react-icons/fi";
import { COPY, notchMeta } from "../config";
import { fuel } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C, useMission } from "../core/store";
import { formatCount } from "../data";
import type { B2Action } from "../types";
import { Button, cx, FOCUS_RING } from "../ui";

function Row({ icon, title, sub, onClick }: { icon: ReactNode; title: string; sub?: string; onClick: () => void }) {
  return (
    <li>
      <button type="button" onClick={onClick} className={cx("flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 border-studojo-ink bg-white px-3 text-left", FOCUS_RING)}>
        <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-studojo-ink bg-studojo-purple-bg text-studojo-purple-strong">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-satoshi text-base font-bold">{title}</span>
          {sub ? <span className="block truncate font-satoshi text-xs text-studojo-muted">{sub}</span> : null}
        </span>
      </button>
    </li>
  );
}

export function MoreSheet() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const m = useMission();
  const f = fuel(s);
  const go = (a: B2Action) => {
    dispatch({ type: "SHEET", sheet: null });
    dispatch(a);
  };
  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        <Row icon={<FiFileText />} title="Page" sub={s.page.live ? "Live, link-only" : "Private"} onClick={() => go({ type: "SET_TAB", tab: "page" })} />
        <Row icon={<FiBookOpen />} title="Prep" sub={s.preps.length ? `${s.preps.length} prep pack${s.preps.length === 1 ? "" : "s"}` : "No calls yet"} onClick={() => go({ type: "SET_TAB", tab: "prep" })} />
        <Row icon={<FiSliders />} title="Autopilot" sub={notchMeta(m.notch).name} onClick={() => dispatch({ type: "SHEET", sheet: "lever" })} />
        <Row icon={<FiSettings />} title="Mission settings" sub={m.short} onClick={() => dispatch({ type: "SHEET", sheet: "mission" })} />
        <Row icon={<FiCreditCard />} title="Wallet" sub={f.total ? `${formatCount(f.left)} of ${formatCount(f.total)} left` : "No pack yet"} onClick={() => dispatch({ type: "SHEET", sheet: "wallet" })} />
        <Row icon={<FiMail />} title="Gmail" sub={s.gmail.connected ? s.gmail.address : "Disconnected"} onClick={() => dispatch({ type: "SHEET", sheet: "gmail" })} />
      </ul>
      {s.gmail.connected ? (
        <Button
          variant={s.gmail.paused ? "green" : "dark"}
          className="w-full"
          icon={s.gmail.paused ? <FiPlay /> : <FiPause />}
          onClick={() => {
            dispatch({ type: "PAUSE_SENDING", paused: !s.gmail.paused });
            agent.note(s.gmail.paused ? "Sending is back on, inside the daily cap." : `${COPY.paused} Drafts and replies still work.`);
          }}
        >
          {s.gmail.paused ? "Resume sending" : "Pause all sending"}
        </Button>
      ) : null}
    </div>
  );
}

export function GmailSheet() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  return (
    <div className="space-y-4 font-satoshi">
      <div className="rounded-2xl border-2 border-studojo-ink bg-white p-4">
        <p className="text-base font-bold">{s.gmail.address}</p>
        <p className="text-sm text-studojo-muted">
          {!s.gmail.connected ? "Disconnected. Nothing sends." : s.gmail.paused ? COPY.paused : "Connected. Sending the emails you approved, a steady trickle, never all at once."}
        </p>
      </div>
      <ul className="space-y-1.5 text-sm text-studojo-ink">
        <li>Sends only what you approved, from your own address.</li>
        <li>Watches for replies and bounce notices on these emails only.</li>
        <li>{COPY.neverReplies}</li>
      </ul>
      {s.gmail.connected ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              dispatch({ type: "PAUSE_SENDING", paused: !s.gmail.paused });
              agent.note(s.gmail.paused ? "Sending is back on, inside the daily cap." : `${COPY.paused} Drafts and replies still work.`);
            }}
          >
            {s.gmail.paused ? "Resume sending" : "Pause all"}
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => {
              dispatch({ type: "DISCONNECT_GMAIL" });
              agent.note("Gmail is disconnected. Nothing sends until you connect again. Your drafts are safe.");
            }}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button className="w-full" onClick={() => dispatch({ type: "CONNECT_GMAIL" })}>
          Connect Gmail again (Simulated)
        </Button>
      )}
    </div>
  );
}
