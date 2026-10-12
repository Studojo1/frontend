// MissionSheet: this mission's target, guardrails, never-contact list,
// pause or archive, and a short form that starts a new mission with Senpai.
// Group 4.
import { useState } from "react";
import { FiArchive, FiMessageCircle, FiPause, FiPlay } from "react-icons/fi";
import { MAX_MISSIONS, MISSION_ACCENT, MISSION_STATUS_LABEL } from "../config";
import { useAgent } from "../core/engine";
import { useB2C, useMission } from "../core/store";
import { targetSummary } from "../shell/mission-header";
import { Button, cx, HoldButton, SectionHeader, Sheet } from "../ui";
import { GuardrailsBlock, NeverContactBlock, TargetBlock } from "./mission-parts";
import { NewMissionForm } from "./new-mission-form";

export function MissionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const m = useMission();
  const accent = MISSION_ACCENT[m.accent];
  const [archiving, setArchiving] = useState(false);
  const unsent = s.drafts.filter((d) => d.missionId === m.id && d.status === "pending");

  const pause = () => {
    dispatch({ type: "UPDATE_MISSION", id: m.id, patch: { status: "paused" }, note: `Paused ${m.short}` });
    agent.note(`${m.short} is paused. Nothing sends for it until you resume. Replies still land, and your other missions keep going.`);
  };
  const resume = () => {
    dispatch({ type: "UPDATE_MISSION", id: m.id, patch: { status: m.total > 0 ? "running" : "draft" }, note: `Resumed ${m.short}` });
    agent.note(`${m.short} is back on, inside the daily cap.`);
  };
  const archive = () => {
    if (unsent.length) dispatch({ type: "DROP_FROM_QUEUE", personIds: Array.from(new Set(unsent.map((d) => d.personId))), reason: "mission archived", by: "you" });
    dispatch({ type: "UPDATE_MISSION", id: m.id, patch: { status: "paused" }, note: `Archived ${m.short}: paused, unsent drafts dropped` });
    agent.note(`Archived ${m.short}. ${unsent.length} unsent drafts dropped, no credits used for them. Sent threads, replies and your page stay as they are.`);
    setArchiving(false);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Mission settings" description={m.name} size="lg">
      <div className="space-y-6">
        <section aria-labelledby="ms-target">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span aria-hidden className={cx("h-3 w-3 rounded-full border-2 border-studojo-ink", accent.solid)} />
            <h3 id="ms-target" className="font-clash text-base font-semibold">Target</h3>
            <span className={cx("rounded-full border-2 border-studojo-ink px-2 py-0.5 font-satoshi text-[11px] font-bold", accent.tint, accent.text)}>{MISSION_STATUS_LABEL[m.status]}</span>
          </div>
          <p className="mb-2 font-satoshi text-sm text-studojo-muted">{targetSummary(m)}</p>
          <TargetBlock m={m} />
          <Button
            size="sm"
            variant="ghost"
            icon={<FiMessageCircle />}
            className="mt-2"
            onClick={() => {
              onClose();
              agent.open({ attach: { kind: "mission", id: m.id, label: m.short } });
            }}
          >
            Change the target with Senpai
          </Button>
        </section>

        <GuardrailsBlock m={m} onLever={() => dispatch({ type: "SHEET", sheet: "lever" })} />

        <NeverContactBlock m={m} />

        <section aria-labelledby="ms-state">
          <SectionHeader as="h3" id="ms-state" title="Pause or archive" />
          <div className="space-y-3 rounded-2xl border-2 border-studojo-ink bg-white p-3">
            {m.status === "paused" ? (
              <Button variant="green" icon={<FiPlay />} onClick={resume} className="w-full sm:w-auto">
                Resume {m.short}
              </Button>
            ) : m.status === "running" ? (
              <Button variant="dark" icon={<FiPause />} onClick={pause} className="w-full sm:w-auto">
                Pause this mission
              </Button>
            ) : (
              <p className="font-satoshi text-sm text-studojo-muted">Nothing is sending here yet, so there is nothing to pause.</p>
            )}
            <p className="font-satoshi text-xs text-studojo-muted">Pausing is instant. Replies still land in Replies.</p>
            {archiving ? (
              <div className="rounded-xl border-2 border-dashed border-studojo-ink/40 p-3">
                <p className="font-satoshi text-sm">
                  Archiving pauses {m.short} and drops {unsent.length} unsent drafts. No credit is used for them. Sent threads, replies and your page stay.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <HoldButton tone="dark" size="sm" onConfirm={archive} label={`Hold to archive ${m.short}`}>
                    <FiArchive aria-hidden /> Hold to archive
                  </HoldButton>
                  <Button size="sm" variant="ghost" onClick={() => setArchiving(false)}>
                    Keep it
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="ghost" icon={<FiArchive />} onClick={() => setArchiving(true)}>
                Archive this mission
              </Button>
            )}
          </div>
        </section>

        <section aria-labelledby="ms-new">
          <SectionHeader as="h3" id="ms-new" title="New mission" kicker={`${s.missions.length} of ${MAX_MISSIONS}`} />
          <NewMissionForm onStart={onClose} />
        </section>
      </div>
    </Sheet>
  );
}
