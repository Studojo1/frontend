import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * "Getting to know you": the first conversation in /app, right after signup.
 * It learns what a resume and swipes can't tell us (company type, dream
 * companies, work mode, start date, one thing they're proud of). Scripted
 * questions with quick replies and free text, so it is instant and costs
 * nothing. It opens with what we already know so it never re-asks. Answers
 * stream to the parent as they land so the side panel can show them.
 *
 * Styled for the app shell (CSS variables and ap-* classes from /app).
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
  ack: (a: string) => string;
};

const splitList = (s: string) =>
  s
    .split(/,|\band\b|\/|;|\n/i)
    .map((x) => x.trim())
    .filter((x) => x.length > 1 && x.length < 40);

export const CHAT_QUESTIONS = 5;

export function ProfileChat({
  firstName,
  summary,
  suggestions,
  onAnswer,
  onDone,
  doneActions,
}: {
  firstName: string;
  summary: string;
  suggestions: string[];
  onAnswer: (a: ChatAnswers) => void;
  onDone: (a: ChatAnswers) => void;
  /** Shown under the last message once the chat is finished. */
  doneActions?: ReactNode;
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
      ask: "Any companies you'd love to work at? Tap some from the roles you kept, or type your own.",
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
      ask: "Last one. Tell me one thing you've built or done that you're proud of. A line or two is plenty; it becomes the opening line of your outreach.",
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
  const finished = qi >= questions.length;

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
      await say(`Welcome in, ${firstName}. Your account's set up.`);
      await say(summary);
      await say("A few quick questions so I can find the right people to reach. About a minute.");
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
      await say("That's everything. Your profile is complete, and I know what to look for.");
      setQi(questions.length);
      onDone({ ...answers.current });
    }
  };

  const submit = () => {
    if (!q) return;
    if (q.kind === "multi") {
      const all = [...picked, ...splitList(text)].filter((v, i, a) => a.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);
      void answer(all.join(", "), all);
    } else if (q.kind === "text" || text.trim()) {
      void answer(text.trim(), text.trim());
    }
  };

  const avatar = (
    <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--ink)", color: "#fff", fontWeight: 700, fontSize: 12 }}>S</span>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }} data-tour="chat">
      <div ref={scroller} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "28px 28px 12px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "grid", gap: 14 }}>
          {msgs.map((m, i) =>
            m.from === "agent" ? (
              <div key={i} className="ap-pop" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                {avatar}
                <div className="ap-bubble">{m.text}</div>
              </div>
            ) : (
              <div key={i} className="ap-pop" style={{ display: "flex", justifyContent: "flex-end" }}>
                <div className="ap-bubble me">{m.text}</div>
              </div>
            ),
          )}
          {typing && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              {avatar}
              <div className="ap-bubble" aria-label="Typing" style={{ display: "flex", gap: 4, padding: "14px 16px" }}>
                {[0, 1, 2].map((d) => (
                  <span key={d} className="ap-dot" style={{ animationDelay: `${d * 140}ms` }} />
                ))}
              </div>
            </div>
          )}
          {finished && doneActions && <div className="ap-pop" style={{ paddingLeft: 40 }}>{doneActions}</div>}
        </div>
      </div>

      {/* Composer: quick replies above an input, like the rest of the app */}
      <div style={{ padding: "8px 28px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {q?.options && q.options.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }} data-tour="chat-replies">
              {q.options.map((o) => {
                const on = picked.includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    className={`ap-reply${on ? " on" : ""}`}
                    onClick={() => (q.kind === "multi" ? setPicked((p) => (on ? p.filter((x) => x !== o) : [...p, o])) : void answer(o, o))}
                  >
                    {q.kind === "multi" ? (on ? "✓ " : "+ ") : ""}
                    {o}
                  </button>
                );
              })}
            </div>
          )}
          <form
            className="ap-composer"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label htmlFor="chat-input" className="sr-only">Your answer</label>
            <input
              id="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!q}
              placeholder={finished ? "All done. Pick what's next above." : q?.placeholder ?? (q ? "Or type your own answer" : "…")}
              autoComplete="off"
            />
            <button type="submit" disabled={!q || (q.kind === "chips" && !text.trim())} aria-label="Send" data-tour="chat-send">
              {q && q.kind !== "chips" && !text.trim() && !picked.length ? "Skip" : "→"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
