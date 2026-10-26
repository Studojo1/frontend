import { forwardRef, useMemo, useState } from "react";
import { BACKED, JOIN_LINE, PROOF, wordsOf } from "./agent";
import { Arrow, Check, Mail } from "./icons";
import { useAgent, useSaid } from "./start";

// HOMEPAGE V2: what /b2cnew/join shows around Stu, for the hero and the sheet. Copies of career-agent's
// app/routes/join.tsx and components/voice/SpokenText.tsx:
//   Said      her words, all on screen from the start, faint, each darkening as she says it
//   Talking   while she talks: "turn your sound on"
//   Ticks     /join's three lines beside the card
//   JoinCard  /join's sign-up card: "Create your account", Continue with Google, or with email, Continue, the
//             terms line and "Backed by". Both buttons go where /join's continueIn() sends a signed-out visitor
//             (agent.ts homeSignIn); the email typed is not used there either. Nothing asks for a resume here.

export function Said({ className = "hv-said" }: { className?: string }) {
  const at = useSaid();
  const words = useMemo(() => wordsOf(JOIN_LINE), []);
  return (
    <p className={className} aria-live="polite" data-said>
      {words.map(({ w, start }, i) => (
        <span key={i}>
          <span className={start < at ? "hv-w" : "hv-w hv-ahead"}>{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

export function Talking() {
  return (
    <p className="hv-talking">
      <span className="hv-bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      Stu is talking. Turn your sound on.
    </p>
  );
}

export function Ticks() {
  return (
    <ul className="hv-ticks hv-in">
      {PROOF.map((p) => (
        <li key={p}>
          <span>
            <Check sw={3} />
          </span>
          {p}
        </li>
      ))}
    </ul>
  );
}

/** Google's G, drawn in its colours (join.tsx G). */
function G() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export const JoinCard = forwardRef<HTMLElement, { idPrefix: string }>(function JoinCard({ idPrefix }, ref) {
  const { signIn, hush } = useAgent();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const continueIn = () => {
    setBusy(true);
    hush();
  };
  return (
    <section ref={ref} className="hv-jcard hv-in" aria-labelledby={`${idPrefix}-card-h`} data-join-card>
      <h2 id={`${idPrefix}-card-h`}>Create your account</h2>
      <p className="hv-sub">Free to start. Takes ten seconds.</p>
      <a className="hv-g" href={signIn} onClick={continueIn} aria-disabled={busy || undefined} data-signin="google">
        <G />
        Continue with Google
      </a>
      <div className="hv-or">or with email</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          continueIn();
          window.location.href = signIn;
        }}
      >
        <label htmlFor={`${idPrefix}-email`}>Email address</label>
        <div className="hv-field">
          <Mail />
          <input id={`${idPrefix}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" autoComplete="email" />
        </div>
        <button type="submit" className="hv-cont" disabled={busy} data-signin="email">
          Continue <Arrow sw={2.4} />
        </button>
      </form>
      <p className="hv-terms">By continuing you agree to Studojo&apos;s Terms of Service and Privacy Policy.</p>
      <div className="hv-backed">
        <p>Backed by</p>
        <ul>
          {BACKED.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </section>
  );
});
