// PrepTab: turn a yes into a good conversation. One card per call, a live
// card while Senpai writes a pack, and an empty state that offers a prep
// pack as soon as someone says yes. Group 4.
import { useState } from "react";
import { motion } from "framer-motion";
import { FiBookOpen, FiMic, FiPhoneCall } from "react-icons/fi";
import { liveRun, personById, visibleReplies } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { PREP_SEED } from "../data";
import { useMotionPresets } from "../motion";
import type { Person } from "../types";
import { Avatar, Button, Card, EmptyState, SectionHeader, SkillChip } from "../ui";
import { PrepCard } from "./prep-card";

export function PrepTab() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const m = useMotionPresets();
  const preps = s.preps.filter((p) => personById(s, p.personId)?.missionId === s.env);
  const [openId, setOpenId] = useState<string | null>(null);
  const shownOpen = openId ?? preps[preps.length - 1]?.id ?? null;
  const run = liveRun(s);
  const building = run?.flowId === "F4" || (run?.flowId === "event" && run.steps.some((st) => st.skill === "coach"));
  const waiting = visibleReplies(s)
    .filter((r) => r.state.tag === "Positive" && !s.preps.some((p) => p.personId === r.person.id))
    .map((r) => r.person);

  const makePack = (p: Person) => {
    if (p.id === "kitebase") {
      agent.open({ focus: false });
      agent.start("F4", { personId: p.id, replyId: "rp-2" });
      return;
    }
    const seed = p.id in PREP_SEED ? PREP_SEED[p.id as keyof typeof PREP_SEED] : null;
    if (!seed) {
      agent.open({ focus: false });
      agent.start("F4", { personId: p.id });
      return;
    }
    const id = `prep-${p.id}`;
    dispatch({ type: "ADD_PREP", prep: { id, checks: {}, ...seed } });
    dispatch({ type: "LOG", entry: { actor: "senpai", skill: "coach", missionId: p.missionId, text: `Made a prep pack for ${p.first} at ${p.company}` } });
    setOpenId(id);
    agent.note(`Prep pack for ${p.company} is in Prep: the brief, five likely questions and your story. Nothing is promised; it just helps you walk in ready.`);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Prep"
        kicker={preps.length ? `${preps.length} call${preps.length === 1 ? "" : "s"} to prepare` : "Turn a yes into a good conversation"}
        action={
          preps.length ? (
            <Button
              size="sm"
              variant="secondary"
              icon={<FiMic />}
              onClick={() => {
                agent.open({ focus: false });
                agent.start("F12", { prepId: shownOpen ?? undefined, personId: preps.find((p) => p.id === shownOpen)?.personId });
              }}
            >
              Practise 3 questions
            </Button>
          ) : null
        }
      />

      {building ? <BuildingCard label={agent.liveStep?.label} /> : null}

      {waiting.length && preps.length ? (
        <ul className="space-y-2">
          {waiting.map((p) => (
            <li key={p.id}>
              <WaitingRow person={p} busy={building} onMake={() => makePack(p)} />
            </li>
          ))}
        </ul>
      ) : null}

      {preps.length ? (
        <motion.ul variants={m.list} initial="hidden" animate="show" className="space-y-4">
          {[...preps].reverse().map((prep) => {
            const person = personById(s, prep.personId);
            if (!person) return null;
            return (
              <motion.li key={prep.id} variants={m.item}>
                <PrepCard prep={prep} person={person} open={shownOpen === prep.id} onToggle={() => setOpenId(shownOpen === prep.id ? "" : prep.id)} />
              </motion.li>
            );
          })}
        </motion.ul>
      ) : building ? null : (
        <EmptyState
          icon={<FiBookOpen />}
          title="No calls yet"
          body="When someone says yes, prep lands here: a brief, the questions they will likely ask, and the resume line to answer each with."
          action={
            waiting.length ? (
              <div className="flex flex-col items-center gap-2">
                {waiting.map((p) => (
                  <Button key={p.id} icon={<FiPhoneCall />} onClick={() => makePack(p)}>
                    Make a prep pack for {p.company}
                  </Button>
                ))}
              </div>
            ) : undefined
          }
        />
      )}
    </div>
  );
}

function WaitingRow({ person, busy, onMake }: { person: Person; busy: boolean; onMake: () => void }) {
  return (
    <Card pad="sm" shadow="sm" tone="green" className="flex flex-wrap items-center gap-3">
      <Avatar first={person.first} last={person.last} size="sm" />
      <p className="min-w-0 flex-1 font-satoshi text-sm">
        <b>{person.first} at {person.company}</b> said yes. No prep pack yet.
      </p>
      <Button size="sm" variant="secondary" icon={<FiPhoneCall />} onClick={onMake} disabled={busy}>
        Make a prep pack
      </Button>
    </Card>
  );
}

/** While Senpai writes a pack: a skeleton card that shows the live step. */
function BuildingCard({ label }: { label?: string }) {
  const m = useMotionPresets();
  return (
    <Card shadow="md" aria-busy="true" className="relative overflow-hidden">
      <p className="flex flex-wrap items-center gap-2 font-satoshi text-sm font-bold" aria-live="polite">
        <SkillChip skill="coach" /> {label ? `Senpai: ${label}` : "Senpai is writing your prep pack"}
      </p>
      <div className="mt-4 space-y-2.5" aria-hidden>
        {[70, 92, 84, 60].map((w, i) => (
          <motion.div
            key={w}
            className="h-3.5 rounded-full bg-studojo-purple-bg"
            style={{ width: `${w}%` }}
            {...m.loop({ opacity: [0.5, 1, 0.5] }, 1.4 + i * 0.1)}
          />
        ))}
      </div>
    </Card>
  );
}
