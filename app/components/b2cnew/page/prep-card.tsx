// One prep pack: the brief, what they said, five likely questions each with
// the resume line to use, a 60-second story, two questions to ask back, the
// checklist, Senpai's practice feedback and Log outcome. Group 4.
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiMessageCircle, FiMic } from "react-icons/fi";
import { stageOf } from "../core/derive";
import { chipFor, useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { lineById } from "../data";
import { QUICK, useSafeReducedMotion } from "../motion";
import type { Person, Prep } from "../types";
import { Avatar, Button, Card, cx, FOCUS_RING, IconButton, SimNote, SkillChip } from "../ui";
import { ProofPin } from "./proof-pin";
import { Checklist, OutcomeLogger, ReadinessRing, StoryTimer } from "./prep-parts";

function Block({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-xl border-2 border-studojo-ink/15 bg-white p-3", className)}>
      <h4 className="font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">{title}</h4>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export function PrepCard({ prep, person, open, onToggle }: { prep: Prep; person: Person; open: boolean; onToggle: () => void }) {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const reduced = useSafeReducedMotion();
  const label = `Prep, ${person.company}`;
  const practise = () => {
    dispatch({ type: "FOCUS", item: chipFor.prep(prep.id, label) });
    agent.open({ focus: false });
    agent.start("F12", { prepId: prep.id, personId: person.id });
  };
  const glow = s.highlight?.kind === "landed" && s.highlight.ids.includes(prep.id);
  const bodyId = `prep-body-${prep.id}`;
  return (
    <Card as="article" pad="none" shadow={open ? "md" : "sm"} aria-labelledby={`prep-h-${prep.id}`} className={cx("overflow-hidden transition-shadow", glow && "ring-4 ring-studojo-purple/40")}>
      <div className="flex items-start gap-3 p-3 sm:p-4">
        <Avatar first={person.first} last={person.last} />
        <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={bodyId} className={cx("min-w-0 flex-1 rounded-lg text-left", FOCUS_RING)}>
          <h3 id={`prep-h-${prep.id}`} className="font-clash text-lg font-semibold leading-tight text-studojo-ink">
            Call with {person.first} {person.last}
          </h3>
          <p className="truncate font-satoshi text-sm text-studojo-muted">
            {person.title}, {person.company}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 font-satoshi text-sm font-bold text-studojo-ink">
            {prep.when} <SimNote />
          </p>
        </button>
        <ReadinessRing prep={prep} />
        <div className="flex flex-col items-center gap-1">
          <IconButton size="sm" label={`Ask Senpai about ${label}`} icon={<FiMessageCircle />} onClick={() => agent.open({ attach: chipFor.prep(prep.id, label) })} />
          <IconButton size="sm" label={open ? "Collapse" : "Expand"} aria-expanded={open} aria-controls={bodyId} onClick={onToggle} icon={<FiChevronDown className={cx("transition-transform", open && "rotate-180")} />} />
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={bodyId}
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={QUICK}
            className="overflow-hidden"
          >
            <div className="@container border-t-2 border-studojo-ink/10 bg-studojo-surface-muted/60 p-3 sm:p-4">
              <div className="grid gap-3 @2xl:grid-cols-2">
                <Block title="The brief">
                  <p className="font-satoshi text-sm leading-relaxed">{prep.brief}</p>
                </Block>
                <Block title="What they said" className="bg-studojo-pink-bg">
                  <blockquote className="border-l-4 border-studojo-pink pl-3 font-satoshi text-sm italic leading-relaxed">"{prep.said}"</blockquote>
                </Block>
              </div>

              <Block title="Five likely questions" className="mt-3">
                <ol className="space-y-3">
                  {prep.questions.map((q, i) => (
                    <li key={q.q} className="flex items-start gap-2.5">
                      <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-purple-bg font-satoshi text-[11px] font-bold text-studojo-purple-strong">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-satoshi text-base font-bold leading-snug">{q.q}</p>
                        <p className="mt-0.5 font-satoshi text-xs text-studojo-muted">Answer with: {lineById(q.lineId)?.text ?? "your resume"}</p>
                        <ProofPin lineIds={[q.lineId]} label="Show the line" className="mt-1" />
                      </div>
                    </li>
                  ))}
                </ol>
              </Block>

              <div className="mt-3 grid gap-3 @2xl:grid-cols-2">
                <Block title="Your 60-second story">
                  <p className="font-satoshi text-sm leading-relaxed">{prep.story}</p>
                  <StoryTimer />
                </Block>
                <Block title="Ask them back">
                  <ul className="space-y-2">
                    {prep.askBack.map((a) => (
                      <li key={a} className="rounded-lg bg-studojo-yellow-bg px-2.5 py-2 font-satoshi text-sm font-medium">{a}</li>
                    ))}
                  </ul>
                </Block>
              </div>

              <div className="mt-3 grid gap-3 @2xl:grid-cols-2">
                <Block title="Before the call">
                  <Checklist prep={prep} />
                </Block>
                <Block title="Practice">
                  {prep.feedback ? (
                    <div className="rounded-lg border-2 border-studojo-ink bg-studojo-green-bg p-2.5">
                      <p className="flex flex-wrap items-center gap-2"><SkillChip skill="coach" /> <SimNote /></p>
                      <p className="mt-1.5 font-satoshi text-sm leading-relaxed">{prep.feedback}</p>
                    </div>
                  ) : (
                    <p className="font-satoshi text-sm text-studojo-muted">Senpai asks you three of these, one at a time, and checks your answers against your resume.</p>
                  )}
                  <Button size="sm" className="mt-2" icon={<FiMic />} onClick={practise}>
                    {prep.feedback ? "Practise again" : "Practise 3 questions"}
                  </Button>
                </Block>
              </div>

              <Block title="After the call: log outcome" className="mt-3">
                <OutcomeLogger prep={prep} person={person} stage={stageOf(s, person)} />
              </Block>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}
