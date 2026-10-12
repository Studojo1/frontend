// Step 3: quiz. Six question cards, one at a time: orbit role picker, city
// pins, a sliding job-type switch with start month, a growing company-stage
// slider, a project box with a live specificity meter, and three tone
// letters. Number keys pick options; Enter moves on. Owned by builder A (You).
import { useEffect, useRef, type ComponentType } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { FiZap } from "react-icons/fi";
import { isQuestionAnswered, isQuizComplete, QUIZ_QUESTIONS, SAMPLE_PROJECT, type QuestionId } from "../data";
import { useFlow, useStepBar } from "../flow";
import { EASE_OUT, SPRING, useMotionPresets } from "../motion";
import type { QuizAnswers } from "../types";
import { Button, cx, StepHeader } from "../ui";
import { BriefTicket, QuizProgress } from "./you/quiz-progress";
import type { QuizCardProps } from "./you/quiz-keys";
import { ProjectMeter } from "./you/quiz-project";
import { RoleOrbit } from "./you/quiz-role";
import { StageSlider } from "./you/quiz-stage";
import { TonePicker } from "./you/quiz-tone";
import { TypeSwitch } from "./you/quiz-type";
import { WherePins } from "./you/quiz-where";

const CARDS: Record<QuestionId, ComponentType<QuizCardProps>> = {
  role: RoleOrbit,
  where: WherePins,
  type: TypeSwitch,
  stage: StageSlider,
  project: ProjectMeter,
  tone: TonePicker,
};

const NEED: Record<QuestionId, string> = {
  role: "Pick a role to continue.",
  where: "Pick at least one city, or Remote.",
  type: "Pick a kind of role and a start month.",
  stage: "Slide to a company size, or tap one.",
  project: "Write at least 20 characters about your project.",
  tone: "Pick the opener that sounds like you.",
};

const SAMPLE_ANSWERS: Partial<QuizAnswers> = {
  role: "sde",
  cities: ["pune", "bengaluru"],
  remote: true,
  jobType: "internship",
  startMonth: "2027-01",
  stage: 1,
  project: SAMPLE_PROJECT,
  tone: "direct",
};

export function Quiz() {
  const f = useFlow();
  const m = useMotionPresets();
  const q = f.data.quiz;
  const last = QUIZ_QUESTIONS.length - 1;
  const card = Math.max(0, Math.min(last, q.card));
  const question = QUIZ_QUESTIONS[card];
  const answered = isQuestionAnswered(q, question.id);
  const complete = isQuizComplete(q);

  // Direction of the last card change, for the slide.
  const prevCard = useRef(card);
  const dir = card >= prevCard.current ? 1 : -1;
  useEffect(() => {
    prevCard.current = card;
  }, [card]);

  // Card headings take focus only after a card change, never on the step's first paint.
  const navigated = useRef(false);
  const deck = useRef<HTMLDivElement>(null);
  // A new card that does not fit above the action bar scrolls up under the header.
  useEffect(() => {
    const el = deck.current;
    if (!navigated.current || !el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight - 96) {
      el.scrollIntoView({ block: "start", behavior: m.reduced ? "auto" : "smooth" });
    }
  }, [card, m.reduced]);
  const set = (patch: Partial<QuizAnswers>) => {
    if (patch.card !== undefined && patch.card !== card) navigated.current = true;
    f.update("quiz", patch);
  };
  const go = (i: number) => set({ card: Math.max(0, Math.min(last, i)) });
  const firstMissing = QUIZ_QUESTIONS.findIndex((qq) => !isQuestionAnswered(q, qq.id));

  const advance = () => {
    if (!isQuestionAnswered(q, question.id)) return;
    if (card < last) go(card + 1);
    else if (complete) f.next();
    else if (firstMissing >= 0) go(firstMissing);
  };

  // On the last card with an earlier answer missing, the button takes you to it.
  const missingKicker = QUIZ_QUESTIONS[Math.max(0, firstMissing)].kicker;
  useStepBar({
    label: card < last ? "Next" : complete || !answered ? "See my page" : `Answer ${missingKicker}`,
    disabled: !answered,
    disabledHint: NEED[question.id],
    onPrimary: advance,
    hideBack: card > 0,
    secondary: card > 0 ? { label: "Previous", onClick: () => go(card - 1) } : undefined,
    hint: answered ? (card < last ? "Press Enter for the next question." : "Last one. Next you review your page.") : "Number keys pick options.",
  });

  const Body = CARDS[question.id];

  return (
    <div>
      <StepHeader title="Six quick questions" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-8">
        <div ref={deck} className="min-w-0 scroll-mt-28 lg:scroll-mt-40">
          <div className="overflow-hidden rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal">
            <QuizProgress q={q} card={card} onJump={go} reduced={m.reduced} />
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.section
                key={question.id}
                custom={dir}
                variants={cardVariants(m.reduced)}
                initial="enter"
                animate="center"
                exit="exit"
                aria-labelledby={`jn-q-${question.id}`}
                className={cx(
                  "p-4 sm:p-6",
                  SIDE_BY_SIDE.has(question.id) && "lg:grid lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:items-start lg:gap-6",
                )}
              >
                <CardHeading
                  id={`jn-q-${question.id}`}
                  focusOnMount={navigated.current}
                  side={SIDE_BY_SIDE.has(question.id)}
                  kicker={question.kicker}
                  index={card}
                  title={question.title}
                  help={question.help}
                />
                <div className="min-w-0">
                  <Body q={q} set={set} reduced={m.reduced} active advance={advance} />
                </div>
              </motion.section>
            </AnimatePresence>
          </div>

          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" icon={<FiZap />} data-jernew-sample onClick={() => set({ ...SAMPLE_ANSWERS, card: last })}>
              Fill sample answers
            </Button>
          </div>
        </div>

        <div className="hidden lg:block">
          <BriefTicket q={q} card={card} onJump={go} reduced={m.reduced} />
        </div>
      </div>
    </div>
  );
}

/** Cards with a compact control sit beside their question on desktop. */
const SIDE_BY_SIDE = new Set<QuestionId>(["role", "where", "type", "stage"]);

/** Card slide: in from the side you are heading to, out the other way. */
function cardVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      enter: { opacity: 0 },
      center: { opacity: 1, transition: { duration: 0.15 } },
      exit: { opacity: 0, transition: { duration: 0.12 } },
    };
  }
  return {
    enter: (d: number) => ({ opacity: 0, x: d * 40, rotate: d * 1.2 }),
    center: { opacity: 1, x: 0, rotate: 0, transition: { ...SPRING, opacity: { duration: 0.18 } } },
    exit: (d: number) => ({ opacity: 0, x: d * -30, rotate: d * -0.8, transition: { duration: 0.16, ease: EASE_OUT } }),
  };
}

/** The question title. It takes focus when a new card arrives (StepHeader owns the first focus). */
function CardHeading({
  id,
  focusOnMount,
  side,
  kicker,
  index,
  title,
  help,
}: {
  id: string;
  focusOnMount: boolean;
  side: boolean;
  kicker: string;
  index: number;
  title: string;
  help: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const shouldFocus = useRef(focusOnMount);
  useEffect(() => {
    if (shouldFocus.current) ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div className={cx("mb-4 sm:mb-5", side && "lg:mb-0")}>
      <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-purple-strong">
        {index + 1}. {kicker}
      </p>
      <h2 ref={ref} id={id} tabIndex={-1} className="mt-1 font-clash text-2xl font-semibold leading-tight text-studojo-ink outline-none sm:text-[1.75rem]">
        {title}
      </h2>
      <p className={cx("mt-1 font-satoshi text-sm text-studojo-muted sm:block sm:text-base", id === "jn-q-role" && "hidden")}>{help}</p>
    </div>
  );
}
