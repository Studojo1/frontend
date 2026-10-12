// The workspace header: mission name and target, the autopilot chip, the
// tab strip with counts (desktop), and the amber strip when sending is
// paused or the page is private. Shared file: owned by the foundation.
import { motion } from "framer-motion";
import { FiAlertTriangle, FiSettings } from "react-icons/fi";
import { COPY, MISSION_ACCENT, MISSION_STATUS_LABEL, notchMeta, TABS } from "../config";
import { tabCounts, unseenReplies } from "../core/derive";
import { useB2C, useMission } from "../core/store";
import { CITIES, monthLabel, roleById } from "../data";
import { AutopilotLever } from "../mail/lever";
import { LAYOUT, useSafeReducedMotion } from "../motion";
import type { Mission } from "../types";
import { cx, FOCUS_RING, IconButton, TabStrip } from "../ui";

const STAGE_SHORT = ["Tiny startups", "Seed", "Series A to B", "Growth stage", "Large companies"];

/** "SDE intern · Pune, Bengaluru, Remote · Seed · from Jan 2027 · Direct tone" */
export function targetSummary(m: Mission): string {
  const t = m.target;
  const role = roleById(t.role);
  const places = [...t.cities.map((c) => CITIES.find((x) => x.id === c)?.label ?? c), ...(t.remote ? ["Remote"] : [])].join(", ");
  const kind = t.jobType === "fulltime" ? role.fulltime : role.intern;
  const tone = t.tone ? `${t.tone.charAt(0).toUpperCase()}${t.tone.slice(1)} tone` : "";
  return [kind.charAt(0).toUpperCase() + kind.slice(1), places, t.stage !== null ? STAGE_SHORT[t.stage] : "", `from ${monthLabel(t.startMonth)}`, tone]
    .filter(Boolean)
    .join(" · ");
}

export function MissionHeader() {
  const { s, dispatch } = useB2C();
  const m = useMission();
  const accent = MISSION_ACCENT[m.accent];
  const counts = tabCounts(s);
  const unseen = unseenReplies(s);
  const reduced = useSafeReducedMotion();
  const items = TABS.map((t) => ({
    id: t.id,
    label: t.label,
    count: counts[t.id],
    dot: t.id === "replies" && unseen > 0,
    icon: <t.icon />,
  }));

  return (
    <div className="shrink-0 border-b-2 border-studojo-ink bg-white">
      <motion.div key={m.id} aria-hidden className={cx("h-1.5 origin-left", accent.solid)} initial={reduced ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.35 }} />
      {/* Phones: the mission name is already in the top bar, so one short line instead. */}
      <div className="flex h-10 items-center gap-2 px-4 font-satoshi text-xs font-bold lg:hidden">
        <span className={cx("uppercase tracking-[0.12em]", accent.text)}>{MISSION_STATUS_LABEL[m.status]}</span>
        <span aria-hidden className="text-studojo-muted">·</span>
        <button
          type="button"
          onClick={() => dispatch({ type: "SHEET", sheet: "lever" })}
          className={cx("inline-flex min-h-9 items-center gap-1 rounded-lg px-1 text-studojo-ink underline decoration-studojo-ink/30 underline-offset-4", FOCUS_RING)}
        >
          Autopilot: {notchMeta(m.notch).name}
        </button>
        <span className="flex-1" />
        <IconButton label="Mission settings" icon={<FiSettings />} size="sm" onClick={() => dispatch({ type: "SHEET", sheet: "mission" })} />
      </div>
      <h1 className="sr-only lg:hidden">{m.name}</h1>
      <div className="hidden items-start gap-3 px-4 pb-2 pt-3 lg:flex lg:px-6">
        <div className="min-w-0 flex-1">
          <p className={cx("font-satoshi text-[11px] font-bold uppercase tracking-[0.14em]", accent.text)}>
            Mission · {MISSION_STATUS_LABEL[m.status]}
          </p>
          <h1 className="truncate font-clash text-xl font-semibold leading-tight text-studojo-ink lg:text-2xl">{m.name}</h1>
          <p className="mt-0.5 hidden truncate font-satoshi text-sm text-studojo-muted sm:block">{targetSummary(m)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="hidden sm:inline-flex">
            <AutopilotLever compact />
          </span>
          <IconButton label="Mission settings" icon={<FiSettings />} onClick={() => dispatch({ type: "SHEET", sheet: "mission" })} />
        </div>
      </div>
      <div className="hidden overflow-x-auto px-4 lg:block lg:px-6">
        <TabStrip
          items={items}
          value={s.tab}
          onChange={(tab) => dispatch({ type: "SET_TAB", tab })}
          label="Workspace"
          layoutId={LAYOUT.tabPill}
          idPrefix="b2c-ws"
          bump={s.bump ? { id: s.bump.tab, key: s.bump.key } : null}
        />
      </div>
      <NoticeStrip />
    </div>
  );
}

function NoticeStrip() {
  const { s, dispatch } = useB2C();
  const lines: { text: string; action: string; onClick: () => void }[] = [];
  if (s.gmail.paused) lines.push({ text: s.gmail.connected ? COPY.paused : "Gmail is disconnected. Nothing sends.", action: s.gmail.connected ? "Resume" : "Connect", onClick: () => dispatch(s.gmail.connected ? { type: "PAUSE_SENDING", paused: false } : { type: "CONNECT_GMAIL" }) });
  if (!s.page.live) lines.push({ text: COPY.privatePage, action: "Open Page", onClick: () => dispatch({ type: "SET_TAB", tab: "page" }) });
  if (!lines.length) return null;
  return (
    <div role="status" className="border-t-2 border-studojo-ink bg-studojo-orange-bg">
      {lines.map((l) => (
        <div key={l.text} className="flex items-center gap-2 px-4 py-1.5 font-satoshi text-sm text-[#92400e] lg:px-6">
          <FiAlertTriangle aria-hidden className="shrink-0" />
          <span className="min-w-0 flex-1">{l.text}</span>
          <button type="button" onClick={l.onClick} className="min-h-9 shrink-0 rounded-lg px-2 font-bold underline underline-offset-2">
            {l.action}
          </button>
        </div>
      ))}
    </div>
  );
}
