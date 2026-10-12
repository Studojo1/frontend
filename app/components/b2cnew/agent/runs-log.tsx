// Runs: the activity log for this mission. Every run, approval, send batch
// and setting change, with who did it (you, Senpai, Gmail) and the day.
// Filter by actor or skill; Undo on anything still unsent.
import { useState } from "react";
import { FiCornerUpLeft, FiFilter, FiMail, FiUser } from "react-icons/fi";
import { SKILL_STYLE, SKILLS } from "../config";
import { liveRun } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { dayDate } from "../data";
import type { Actor, AppState, LogEntry, Skill } from "../types";
import { cx, EmptyState, FOCUS_RING, SkillChip } from "../ui";
import { ChipButton, lowerFirst, SenpaiMark } from "./bits";

const ACTORS: { id: Actor | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "you", label: "You" },
  { id: "senpai", label: "Senpai" },
  { id: "gmail", label: "Gmail" },
];

/** Undo only while it still means something (an approved email not yet sent, a skip, a setting). */
export function canUndo(s: AppState, e: LogEntry): boolean {
  const u = e.undo;
  if (!u) return false;
  if (u.type === "UNAPPROVE_DRAFT") {
    const d = s.drafts.find((x) => x.id === u.id);
    return !!d && d.status === "approved" && (d.slotDay ?? s.day + 1) > s.day;
  }
  if (u.type === "UNAPPROVE_MANY") return s.drafts.some((d) => u.ids.includes(d.id) && d.status === "approved" && (d.slotDay ?? s.day + 1) > s.day);
  if (u.type === "RESTORE_DRAFT") return s.drafts.find((x) => x.id === u.id)?.status === "skipped";
  if (u.type === "SET_NOTCH") return s.missions.find((m) => m.id === u.missionId)?.notch !== u.notch;
  if (u.type === "REPUBLISH") return !s.page.live;
  return true;
}

function ActorMark({ actor }: { actor: Actor }) {
  if (actor === "senpai") return <SenpaiMark size="sm" />;
  return (
    <span
      aria-hidden
      className={cx(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink text-xs",
        actor === "you" ? "bg-studojo-yellow-bg" : "bg-[#ccfbf1] text-[#0f766e]",
      )}
    >
      {actor === "you" ? <FiUser /> : <FiMail />}
    </span>
  );
}

export function RunsLog() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const [actor, setActor] = useState<Actor | "all">("all");
  const [skill, setSkill] = useState<Skill | "all">("all");
  const all = s.log.filter((l) => l.missionId === s.env);
  const shown = all.filter((l) => (actor === "all" || l.actor === actor) && (skill === "all" || l.skill === skill)).reverse();
  const days = Array.from(new Set(shown.map((l) => l.day)));
  const live = liveRun(s);
  const step = agent.liveStep;
  const filtered = actor !== "all" || skill !== "all";

  return (
    <div className="space-y-3 pb-3 pt-1">
      {live && step ? (
        <button
          type="button"
          onClick={() => dispatch({ type: "DOCK", seg: "chat" })}
          className={cx("flex w-full items-center gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-purple-bg px-3 py-2 text-left font-satoshi text-sm", FOCUS_RING)}
        >
          <span aria-hidden className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-studojo-purple motion-reduce:animate-none" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold">{live.title}</span>
            <span className="block truncate text-xs text-studojo-muted">
              {SKILL_STYLE[step.skill].label}: {lowerFirst(step.label)}, {step.index + 1} of {step.total}
            </span>
          </span>
          <span className="shrink-0 text-xs font-bold text-studojo-purple-strong">See in Chat</span>
        </button>
      ) : null}

      <div className="space-y-2">
        <div role="group" aria-label="Who did it" className="flex flex-wrap gap-1.5">
          {ACTORS.map((a) => {
            const n = a.id === "all" ? all.length : all.filter((l) => l.actor === a.id).length;
            return (
              <ChipButton key={a.id} aria-pressed={actor === a.id} tone={actor === a.id ? "primary" : "plain"} onClick={() => setActor(a.id)}>
                {a.label} <span className="tabular-nums opacity-70">{n}</span>
              </ChipButton>
            );
          })}
        </div>
        <div role="group" aria-label="Skill" className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none]">
          <button
            type="button"
            aria-pressed={skill === "all"}
            onClick={() => setSkill("all")}
            className={cx("inline-flex min-h-8 shrink-0 items-center gap-1 rounded-md border-2 px-2 font-satoshi text-[11px] font-bold", skill === "all" ? "border-studojo-ink bg-studojo-ink text-white" : "border-studojo-ink/20 bg-white text-studojo-muted", FOCUS_RING)}
          >
            <FiFilter aria-hidden /> Any skill
          </button>
          {SKILLS.map((sk) => (
            <button
              key={sk}
              type="button"
              aria-pressed={skill === sk}
              onClick={() => setSkill(skill === sk ? "all" : sk)}
              className={cx("shrink-0 rounded-lg p-0.5", skill === sk ? "ring-2 ring-studojo-ink ring-offset-1" : "opacity-70 hover:opacity-100", FOCUS_RING)}
            >
              <SkillChip skill={sk} />
            </button>
          ))}
        </div>
      </div>

      {!shown.length ? (
        <EmptyState
          title={filtered ? "Nothing matches" : "Nothing here yet"}
          body={filtered ? "Try another filter." : "Every run, approval and setting change in this mission lands here."}
          action={filtered ? <ChipButton onClick={() => { setActor("all"); setSkill("all"); }}>Clear filters</ChipButton> : undefined}
          className="py-8"
        />
      ) : (
        days.map((day) => (
          <section key={day} aria-label={`Day ${day}`}>
            <h3 className="sticky top-0 z-[1] bg-white/95 py-1 font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-muted">
              Day {day} · {dayDate(day).label}
            </h3>
            <ul className="space-y-1">
              {shown.filter((l) => l.day === day).map((l) => (
                <Entry key={l.id} e={l} undoable={canUndo(s, l)} onUndo={() => l.undo && dispatch(l.undo)} />
              ))}
            </ul>
          </section>
        ))
      )}
      <p className="font-satoshi text-[11px] text-studojo-muted">Concept preview: every entry is Simulated. Nothing was sent.</p>
    </div>
  );
}

function Entry({ e, undoable, onUndo }: { e: LogEntry; undoable: boolean; onUndo: () => void }) {
  return (
    <li className="flex items-start gap-2 rounded-xl px-1.5 py-1.5 hover:bg-studojo-surface-muted/60">
      <ActorMark actor={e.actor} />
      <div className="min-w-0 flex-1">
        <p className="font-satoshi text-[13px] leading-snug text-studojo-ink">
          <span className="sr-only">{e.actor === "you" ? "You" : e.actor === "senpai" ? "Senpai" : "Gmail"}: </span>
          {e.text}
        </p>
        {e.skill ? <SkillChip skill={e.skill} className="mt-1" /> : null}
      </div>
      {undoable ? (
        <button
          type="button"
          onClick={onUndo}
          className={cx("inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg border-2 border-studojo-ink bg-white px-2.5 font-satoshi text-xs font-bold", FOCUS_RING)}
        >
          <FiCornerUpLeft aria-hidden /> Undo
        </button>
      ) : null}
    </li>
  );
}
