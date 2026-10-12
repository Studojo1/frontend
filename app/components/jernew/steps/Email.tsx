// Step 7: email. An envelope opens and the drafted first email to the chosen
// match grows out of it, personalised with the student's project and tone.
// Beside it, the day 0 / 4 / 9 send timeline; opening the follow-up flies the
// page card into the email (shared layout). Owned by builder C.
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiEyeOff, FiRotateCcw } from "react-icons/fi";
import { useFlow, useStepBar } from "../flow";
import { buildEmailSequence, PROFILE_DRAFT, projectLine, projectSentence, rankMatches, SEND_PACE, TONES, type RankedMatch } from "../data";
import { SPRING, useMotionPresets } from "../motion";
import type { Tone } from "../types";
import { Badge, Button, Card, Chip, cx, FOCUS_RING, LiveRegion, StepHeader } from "../ui";
import { pageIsPublic } from "./go/shared";
import { ManagerAvatar, MiniLabel, pickRecipient } from "./people/bits";
import { Envelope } from "./people/envelope";
import { Letter } from "./people/letter";
import { SendTimeline } from "./people/timeline";

export function Email() {
  const f = useFlow();
  const m = useMotionPresets();
  const q = f.data.quiz;
  const ranked = useMemo(() => rankMatches(q), [q]);
  const match = pickRecipient(ranked, f.data.people.recipientId);
  const pageLive = pageIsPublic(f.data.visibility);
  const drafts = useMemo(() => buildEmailSequence(q, match, PROFILE_DRAFT.url, pageLive), [q, match, pageLive]);
  const [index, setIndex] = useState(0);
  // The envelope opens the first time only; coming back shows the email straight away.
  const [phase, setPhase] = useState<"envelope" | "letter">(() => (f.data.people.envelopeOpened ? "letter" : "envelope"));
  const [shared, setShared] = useState(false);
  const [round, setRound] = useState(0);
  const letterRef = useRef<HTMLDivElement>(null);

  // Reduced motion: no envelope, just the email.
  useEffect(() => {
    if (m.reduced) setPhase("letter");
  }, [m.reduced]);

  // The shared-layout link only matters for the flight out of the envelope.
  useEffect(() => {
    if (!shared) return;
    const t = window.setTimeout(() => setShared(false), 700);
    return () => window.clearTimeout(t);
  }, [shared]);

  // On phones the controls sit below the email: bring the email back into view after a change.
  const revealLetter = () => {
    const el = letterRef.current;
    if (el && el.getBoundingClientRect().top < 64) el.scrollIntoView({ block: "start", behavior: m.reduced ? "auto" : "smooth" });
  };

  const pick = (i: number) => {
    setIndex(i);
    revealLetter();
  };

  const choose = (id: string) => {
    f.update("people", { recipientId: id });
    revealLetter();
  };
  const setTone = (tone: Tone) => {
    f.update("quiz", { tone });
    revealLetter();
  };

  useStepBar({
    label: "Looks good",
    hint: "Nothing sends until you pick a pack, connect Gmail and press Start sending.",
  });

  const options = ranked.slice(0, 3).some((x) => x.id === match.id) ? ranked.slice(0, 3) : [...ranked.slice(0, 2), match];
  const status =
    phase === "envelope"
      ? `Opening your email to ${match.manager.first} at ${match.company}`
      : `${drafts[index].label} to ${match.manager.first} at ${match.company}, sends on day ${drafts[index].day}`;

  return (
    <div>
      <StepHeader
        title="Your first email, drafted"
        description={
          pageLive
            ? "Short, plain and from your own Gmail. No links in the first one, so it reads like a real note. Your page rides along in the follow-up."
            : "Short, plain and from your own Gmail. No links in the first one, so it reads like a real note."
        }
        aside={<Badge kind="sample" />}
      />

      <motion.div variants={m.list} initial="hidden" animate="show" className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-8">
          {/* Phones: the controls sit above the email, so a change rewrites it on the same screen. */}
          <motion.div variants={m.item} className="min-w-0 lg:hidden">
            <Controls options={options} match={match} tone={q.tone} onChoose={choose} onTone={setTone} compact />
          </motion.div>
          <motion.div variants={m.item} ref={letterRef} className="min-w-0 scroll-mt-48">
            <LiveRegion message={status} />
            {phase === "envelope" ? (
              <Envelope
                key={round}
                match={match}
                onOpened={() => {
                  f.update("people", { envelopeOpened: true });
                  setShared(true);
                  setPhase("letter");
                }}
              />
            ) : (
              <Letter
                drafts={drafts}
                index={index}
                onPick={pick}
                match={match}
                project={projectSentence(projectLine(q)).clause}
                profile={f.data.profile}
                shared={shared}
                panelId="jernew-email-panel"
              />
            )}
            <AnimatePresence>
              {phase === "letter" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: shared ? 0.35 : 0, duration: 0.2 }}
                  className="mt-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <Legend />
                  {!m.reduced ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<FiRotateCcw />}
                      onClick={() => {
                        setIndex(0);
                        setRound((r) => r + 1);
                        setPhase("envelope");
                      }}
                    >
                      Replay
                    </Button>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={m.item} className="min-w-0 space-y-6">
            <div className="hidden lg:block">
              <Controls options={options} match={match} tone={q.tone} onChoose={choose} onTone={setTone} />
            </div>
            {!pageLive ? (
              <div className="flex items-start gap-3 rounded-xl border-2 border-studojo-ink bg-studojo-pink-bg px-3 py-2.5 font-satoshi text-sm">
                <FiEyeOff aria-hidden className="mt-0.5 shrink-0" />
                <p className="min-w-0">
                  Your page is private, so follow-ups go without it.{" "}
                  <button
                    type="button"
                    onClick={() => f.goTo("visibility")}
                    className={cx("font-bold text-[#be185d] underline underline-offset-4", FOCUS_RING)}
                  >
                    Turn your link on
                  </button>
                </p>
              </div>
            ) : null}
            <SendTimeline drafts={drafts} index={index} onPick={pick} profile={f.data.profile} pageLive={pageLive} />
            <Card tone="orange" shadow="sm" pad="sm">
              <MiniLabel className="mb-2 text-[#b45309]">What you are approving</MiniLabel>
              <ul className="space-y-2 font-satoshi text-sm text-studojo-ink">
                {[
                  "This sequence, once. Each person gets their own version, written to them.",
                  `Sent from your Gmail, ${SEND_PACE}, so your inbox stays healthy.`,
                  "Nothing goes out until you press Start sending.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <FiCheck aria-hidden className="mt-0.5 shrink-0 text-[#047857]" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

interface ControlsProps {
  options: RankedMatch[];
  match: RankedMatch;
  tone: Tone | null;
  onChoose: (id: string) => void;
  onTone: (t: Tone) => void;
  /** Phone layout: one scrolling row of people, tone beside its label. */
  compact?: boolean;
}

function Controls({ options, match, tone, onChoose, onTone, compact }: ControlsProps) {
  return (
    <Card shadow="sm" pad="sm" className={compact ? "space-y-3" : "space-y-4"}>
      <div className="min-w-0">
        <MiniLabel className="mb-2">Writing to</MiniLabel>
        <div
          role="group"
          aria-label="Choose who the sample email goes to"
          className={cx("flex gap-2", compact ? "-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" : "flex-wrap")}
        >
          {options.map((x) => (
            <Chip key={x.id} tone="people" selected={x.id === match.id} onClick={() => onChoose(x.id)} icon={<ManagerAvatar match={x} size="sm" className="-ml-2" />} className="shrink-0">
              {x.manager.first}, {x.company}
            </Chip>
          ))}
        </div>
      </div>
      <ToneSwitch value={tone} onChange={onTone} pillId={compact ? "email-tone-pill-sm" : "email-tone-pill"} inline={compact} />
    </Card>
  );
}

function ToneSwitch({ value, onChange, pillId, inline }: { value: Tone | null; onChange: (t: Tone) => void; pillId: string; inline?: boolean }) {
  const m = useMotionPresets();
  return (
    <div className={inline ? "flex items-center justify-between gap-3" : undefined}>
      <MiniLabel className={inline ? undefined : "mb-2"}>Tone</MiniLabel>
      <div role="group" aria-label="Email tone" className="inline-flex rounded-xl border-2 border-studojo-ink bg-studojo-surface-muted p-1">
        {TONES.map((t) => {
          const on = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(t.id)}
              title={t.blurb}
              className={cx("relative min-h-11 min-w-[4.5rem] rounded-lg px-3 font-satoshi text-sm font-bold text-studojo-ink", FOCUS_RING)}
            >
              {on ? (
                <motion.span
                  layoutId={m.reduced ? undefined : pillId}
                  transition={SPRING}
                  className="absolute inset-0 rounded-lg border-2 border-studojo-ink bg-white shadow-[2px_2px_0_0_#191a23]"
                />
              ) : null}
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { label: "From your answers", cls: "bg-[#ddd6fe]" },
    { label: "About them", cls: "bg-[#fde68a]" },
    { label: "Your page", cls: "bg-[#fbcfe8]" },
  ];
  return (
    <ul aria-label="Highlight key" className="flex flex-wrap gap-x-4 gap-y-1 font-satoshi text-xs font-bold text-studojo-muted">
      {items.map((i) => (
        <li key={i.label} className="inline-flex items-center gap-1.5">
          <span aria-hidden className={cx("h-3 w-5 rounded-sm border-2 border-studojo-ink", i.cls)} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
