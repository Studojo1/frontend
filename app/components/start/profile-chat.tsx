import { useEffect, useRef, useState } from "react";

/**
 * The last /start step: a short chat that learns what a resume and swipes
 * can't tell us (company type, dream companies, work mode, when they can
 * start, one thing they're proud of). Scripted questions with quick replies
 * and free text, so it is instant and costs nothing; questions we already
 * know the answer to are skipped. Answers stream to the parent as they land
 * so the live panel can show them.
 */

export type ChatAnswers = {
  companyStage?: string;
  dreamCompanies?: string[];
  workMode?: string;
  startWhen?: string;
  proud?: string;
};

type Msg = { from: "agent" | "me"; text: string };

type Question = {
  key: keyof ChatAnswers;
  ask: string;
  kind: "chips" | "multi" | "text";
  options?: string[];
  placeholder?: string;
  /** How the agent acknowledges the answer before moving on. */
  ack: (a: string) => string;
};

const splitList = (s: string) =>
  s
    .split(/,|\band\b|\/|;|\n/i)
    .map((x) => x.trim())
    .filter((x) => x.length > 1 && x.length < 40);

export function ProfileChat({
  firstName,
  summary,
  suggestions,
  onAnswer,
  onDone,
}: {
  firstName: string;
  /** One line on what we already know, said up front so they don't repeat it. */
  summary: string;
  /** Companies from the roles they kept, offered as dream-company chips. */
  suggestions: string[];
  onAnswer: (a: ChatAnswers) => void;
  onDone: (a: ChatAnswers) => void;
}) {
  const questions: Question[] = [
    {
      key: "companyStage",
      ask: "First up: what kind of place do you want to work at?",
      kind: "chips",
      options: ["Early-stage startup", "Growing startup", "Big company", "No preference"],
      ack: (a) => (a === "No preference" ? "Open to anything, noted." : `${a}, got it. I'll weight those higher.`),
    },
    {
      key: "dreamCompanies",
      ask: "Any companies you'd love to work at? Tap some, or type your own.",
      kind: "multi",
      options: suggestions.slice(0, 5),
      placeholder: "e.g. Razorpay, Zerodha",
      ack: (a) => (a ? `Nice list. I'll look for people hiring at ${a}.` : "No problem, I'll find good ones for you."),
    },
    {
      key: "workMode",
      ask: "How do you want to work?",
      kind: "chips",
      options: ["In the office", "Hybrid", "Remote", "Any"],
      ack: (a) => (a === "Any" ? "Flexible, that opens up more roles." : `${a} it is.`),
    },
    {
      key: "startWhen",
      ask: "When could you start?",
      kind: "chips",
      options: ["Right away", "Within a month", "Next semester", "Just exploring"],
      ack: (a) => (a === "Just exploring" ? "No rush. I'll keep an eye out." : "Good to know. Timing matters to hiring managers."),
    },
    {
      key: "proud",
      ask: "Last one. Tell me one thing you've built or done that you're proud of. A line or two is plenty. This becomes the opening of your outreach.",
      kind: "text",
      placeholder: "e.g. Built a churn dashboard at Zepto that three teams now use",
      ack: () => "That's a strong opener. Recruiters remember specifics like that.",
    },
  ];

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [qi, setQi] = useState(-1);
  const [typing, setTyping] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");
  const answers = useRef<ChatAnswers>({});
  const scroller = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const say = async (line: string) => {
    setTyping(true);
    await new Promise((r) => setTimeout(r, Math.min(1100, 350 + line.length * 9)));
    setMsgs((m) => [...m, { from: "agent", text: line }]);
    setTyping(false);
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      await say(`Hey ${firstName}! I'm your Studojo agent.`);
      await say(summary);
      await say("A few quick questions so I can find the right people to reach. Takes about a minute.");
      await say(questions[0].ask);
      setQi(0);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, qi]);

  const q = qi >= 0 && qi < questions.length ? questions[qi] : null;

  const answer = async (shown: string, value: string | string[]) => {
    if (!q) return;
    setMsgs((m) => [...m, { from: "me", text: shown || "Skip" }]);
    (answers.current as Record<string, unknown>)[q.key] = value;
    onAnswer({ ...answers.current });
    setPicked([]);
    setText("");
    const next = qi + 1;
    setQi(-1);
    await say(q.ack(Array.isArray(value) ? value.join(", ") : value));
    if (next < questions.length) {
      await say(questions[next].ask);
      setQi(next);
    } else {
      await say("That's everything. Your profile is ready, and I know what to look for.");
      setQi(questions.length);
      onDone({ ...answers.current });
    }
  };

  const submitMulti = () => {
    const all = [...picked, ...splitList(text)].filter((v, i, a) => a.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);
    void answer(all.join(", "), all);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border-2 border-neutral-900 bg-white shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] overflow-hidden" data-tour="chat">
      <div className="flex items-center gap-3 border-b-2 border-neutral-900 bg-violet-50 px-5 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-neutral-900 bg-violet-500 font-['Clash_Display'] text-sm font-bold text-white">AI</span>
        <div className="min-w-0">
          <div className="font-['Clash_Display'] text-base font-bold text-neutral-900">Your Studojo agent</div>
          <div className="font-['Satoshi'] text-xs text-neutral-500">{qi >= questions.length ? "Profile complete" : `Getting to know you · ${Math.max(0, Math.min(qi, questions.length))} of ${questions.length}`}</div>
        </div>
        <div className="ml-auto flex gap-1" aria-hidden="true">
          {questions.map((x, i) => (
            <span key={x.key} className={`h-1.5 w-5 rounded-full ${i < qi || qi >= questions.length ? "bg-violet-500" : i === qi ? "bg-neutral-900" : "bg-neutral-200"}`} />
          ))}
        </div>
      </div>

      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-5 py-5" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #ece8f6 1px, transparent 0)", backgroundSize: "20px 20px" }}>
        {msgs.map((m, i) =>
          m.from === "agent" ? (
            <div key={i} className="flex items-end gap-2 sj-pop">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-neutral-900 bg-violet-500 font-['Clash_Display'] text-[10px] font-bold text-white">AI</span>
              <div className="max-w-[80%] rounded-2xl rounded-bl-md border-2 border-neutral-900 bg-white px-4 py-2.5 font-['Satoshi'] text-[15px] text-neutral-900">{m.text}</div>
            </div>
          ) : (
            <div key={i} className="flex justify-end sj-pop">
              <div className="max-w-[80%] rounded-2xl rounded-br-md border-2 border-neutral-900 bg-neutral-900 px-4 py-2.5 font-['Satoshi'] text-[15px] text-white">{m.text}</div>
            </div>
          ),
        )}
        {typing && (
          <div className="flex items-end gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-neutral-900 bg-violet-500 font-['Clash_Display'] text-[10px] font-bold text-white">AI</span>
            <div className="flex gap-1 rounded-2xl rounded-bl-md border-2 border-neutral-900 bg-white px-4 py-3.5" aria-label="Typing">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: `${d * 120}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      <div className="border-t-2 border-neutral-900 bg-neutral-50 px-4 py-3">
        {q && q.kind === "chips" && (
          <div className="flex flex-wrap gap-2" data-tour="chat-replies">
            {q.options!.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => void answer(o, o)}
                className="rounded-full border-2 border-neutral-900 bg-white px-3.5 py-1.5 font-['Satoshi'] text-sm font-bold text-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all hover:bg-violet-50 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                {o}
              </button>
            ))}
          </div>
        )}
        {q && q.kind === "multi" && (
          <div className="space-y-2" data-tour="chat-replies">
            {q.options!.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {q.options!.map((o) => {
                  const on = picked.includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setPicked((p) => (on ? p.filter((x) => x !== o) : [...p, o]))}
                      className={`rounded-full border-2 border-neutral-900 px-3.5 py-1.5 font-['Satoshi'] text-sm font-bold transition-colors ${on ? "bg-amber-300 text-neutral-900" : "bg-white text-neutral-900 hover:bg-amber-50"}`}
                    >
                      {on ? "✓ " : "+ "}
                      {o}
                    </button>
                  );
                })}
              </div>
            )}
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); submitMulti(); }}>
              <label htmlFor="chat-multi" className="sr-only">Other companies</label>
              <input id="chat-multi" value={text} onChange={(e) => setText(e.target.value)} placeholder={q.placeholder}
                className="min-w-0 flex-1 rounded-xl border-2 border-neutral-300 bg-white px-3 py-2 font-['Satoshi'] text-base focus:border-violet-500 focus:outline-none" />
              <button type="submit" className="rounded-xl border-2 border-neutral-900 bg-violet-500 px-4 font-['Satoshi'] text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
                {picked.length || text.trim() ? "Send" : "Skip"}
              </button>
            </form>
          </div>
        )}
        {q && q.kind === "text" && (
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void answer(text.trim(), text.trim()); }} data-tour="chat-replies">
            <label htmlFor="chat-text" className="sr-only">Your answer</label>
            <input id="chat-text" value={text} onChange={(e) => setText(e.target.value)} placeholder={q.placeholder} autoFocus
              className="min-w-0 flex-1 rounded-xl border-2 border-neutral-300 bg-white px-3 py-2 font-['Satoshi'] text-base focus:border-violet-500 focus:outline-none" />
            <button type="submit" className="rounded-xl border-2 border-neutral-900 bg-violet-500 px-4 font-['Satoshi'] text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
              {text.trim() ? "Send" : "Skip"}
            </button>
          </form>
        )}
        {!q && (
          <p className="py-1 font-['Satoshi'] text-sm text-neutral-500">{qi >= questions.length ? "All done." : "…"}</p>
        )}
      </div>
    </div>
  );
}
