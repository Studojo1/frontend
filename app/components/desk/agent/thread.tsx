// The thread: earlier messages on demand, every message, the live turn, and
// the empty state. Scrolling sticks to the newest line unless the student
// scrolls up to read; a "Latest" button brings them back. Completed replies
// are announced once to screen readers, never token by token.
import { useEffect, useRef, useState, type RefObject } from "react";
import { FiArrowDown } from "react-icons/fi";
import { stripDashes } from "~/lib/strip-dashes";
import { getStatus } from "~/lib/desk/api";
import { useDeskResource } from "~/lib/desk/cache";
import type { Message, Status, Suggestion } from "~/lib/desk/types";
import { labelFor } from "../tabs/status";
import { cx, FOCUS_RING, PlainText, Spinner } from "./bits";
import { isBusy } from "./live";
import { AssistantMessage, LiveAssistant, Suggestions, UserBubble } from "./message";
import { loadEarlier } from "./runner";
import { MAIN } from "./store";
import { useSlot } from "./use-agent";

/** Starters on an outreach page; the label is what shows, the prompt is what is sent. */
export const OUTREACH_STARTERS: Suggestion[] = [
  { label: "Make it shorter", prompt: "Make this email shorter and keep what matters." },
  { label: "More direct", prompt: "Make this email more direct about what I am asking for." },
  { label: "Why this person?", prompt: "Why is this person a good fit for me?" },
];

/**
 * The greeting from the live status, so it moves when the workspace writes
 * drafts (bootstrap's copy is only a first paint). The empty state already
 * says nothing is sent, so this line does not repeat it.
 */
function liveGreeting(st: Status): string {
  const hi = st.first_name ? `Hi ${st.first_name}.` : "Hi.";
  if (st.state === "needs_resume") return `${hi} Upload your resume and I can start on the people to write to.`;
  if (st.matches.total === 0) return `${hi} Your matches are not ready yet. Check back once your search finishes.`;
  const n = st.counts.needs_you;
  const waiting = n ? ` and ${n} ${n === 1 ? "draft" : "drafts"} waiting for you in ${labelFor("needs_you")}` : "";
  return `${hi} You have ${st.matches.new} people you have not written to yet${waiting}.`;
}

function Empty({ scope, defaults, greeting }: { scope: string; defaults: Suggestion[]; greeting: string | null }) {
  const status = useDeskResource<Status>("status", getStatus, { enabled: scope === MAIN }).data;
  if (scope === MAIN && status) greeting = liveGreeting(status);
  const items = scope === MAIN ? defaults : defaults.length ? defaults : OUTREACH_STARTERS;
  return (
    <div className="flex min-h-full flex-col justify-center py-6">
      <h2 className="font-clash text-2xl font-semibold text-studojo-ink">How can I help?</h2>
      <p className="mt-1 font-satoshi text-sm text-studojo-muted">
        {scope === MAIN ? "Ask about your matches, your emails or replies." : "Ask me to change this email, or about this person."}
      </p>
      <p className="mt-1 font-satoshi text-sm font-bold text-studojo-ink">Nothing is sent until you approve it.</p>
      {greeting ? (
        <div className="mt-4 rounded-2xl rounded-tl-md border-2 border-studojo-ink bg-studojo-purple-bg px-3 py-2">
          <PlainText text={greeting} />
        </div>
      ) : null}
      <div className="mt-4">
        <Suggestions items={items} scope={scope} busy={false} />
      </div>
    </div>
  );
}

export function Thread({ scope, scrollRef }: { scope: string; scrollRef: RefObject<HTMLDivElement | null> }) {
  const slot = useSlot(scope);
  const { messages, live } = slot;
  const busy = isBusy(live);
  const listRef = useRef<HTMLOListElement>(null);
  const stick = useRef(true);
  const [stuck, setStuck] = useState(true);
  const [announce, setAnnounce] = useState("");
  const last = messages[messages.length - 1];
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  // A newly finished reply is read out once.
  // A turn that starts is announced once too, so a screen reader is not left
  // in silence while tools run.
  const started = useRef<string | null>(null);
  const liveKey = live ? `${live.phase === "failed" ? "x" : "w"}:${messages.length}` : null;
  useEffect(() => {
    if (!liveKey || liveKey.startsWith("x") || started.current === liveKey) return;
    started.current = liveKey;
    setAnnounce("Working on it.");
  }, [liveKey]);

  const said = useRef<number | null>(null);
  useEffect(() => {
    const id = lastAssistant?.id ?? null;
    if (said.current === null) {
      said.current = id ?? 0;
      return;
    }
    if (id !== null && id !== said.current) {
      said.current = id;
      setAnnounce(stripDashes(lastAssistant?.content ?? "").slice(0, 300));
    }
  }, [lastAssistant?.id, lastAssistant?.content]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let lastTop = el.scrollTop;
    const onScroll = () => {
      const near = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      if (near) stick.current = true;
      else if (el.scrollTop < lastTop - 4) stick.current = false;
      lastTop = el.scrollTop;
      setStuck(stick.current);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => {
      if (stick.current) el.scrollTop = el.scrollHeight;
    }) : null;
    if (ro && listRef.current) ro.observe(listRef.current);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro?.disconnect();
    };
  }, [scrollRef, messages.length > 0 || !!live]);

  // Sending always brings the view back down.
  useEffect(() => {
    if (last?.role === "user") stick.current = true;
    const el = scrollRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [last?.id, scrollRef]);

  const jump = () => {
    const el = scrollRef.current;
    if (!el) return;
    stick.current = true;
    el.scrollTop = el.scrollHeight;
    setStuck(true);
  };

  if (slot.loadError) {
    return <p className="py-6 font-satoshi text-sm text-studojo-muted">{slot.loadError}</p>;
  }
  if (!slot.thread || (slot.loading && !messages.length)) {
    return (
      <p className="flex items-center gap-2 py-6 font-satoshi text-sm text-studojo-muted">
        <Spinner /> Opening your chat
      </p>
    );
  }
  // One polite region for the whole thread, mounted before the first turn so
  // its first announcement is heard.
  const region = (
    <div aria-live="polite" role="status" className="sr-only">
      {announce}
    </div>
  );
  if (!messages.length && !live) {
    return (
      <>
        {region}
        <Empty scope={scope} defaults={slot.defaults} greeting={slot.greeting} />
      </>
    );
  }

  return (
    <div className="relative">
      {region}
      {slot.hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => void loadEarlier(scope)}
            disabled={slot.loadingEarlier}
            className={cx("min-h-9 rounded-full px-3 font-satoshi text-xs font-bold text-studojo-purple-strong underline underline-offset-2", FOCUS_RING)}
          >
            {slot.loadingEarlier ? "Loading" : "Show earlier messages"}
          </button>
        </div>
      ) : null}
      <ol ref={listRef} aria-label="Conversation" className="space-y-3 pb-3 pt-2">
        {firstShown(messages).map((m) => (
          <li key={m.id}>
            {m.role === "user" ? (
              <UserBubble m={m} />
            ) : (
              <AssistantMessage m={m} scope={scope} latest={m.id === lastAssistant?.id && m === last && !live} busy={busy} />
            )}
          </li>
        ))}
        {live ? (
          <li>
            <LiveAssistant live={live} scope={scope} hideTickets={ticketIds(messages)} />
          </li>
        ) : null}
      </ol>
      {!stuck ? (
        <button
          type="button"
          onClick={jump}
          className={cx(
            "sticky bottom-2 left-full z-10 ml-auto flex min-h-9 items-center gap-1 rounded-full border-2 border-studojo-ink bg-white px-3 font-satoshi text-xs font-bold shadow-[2px_2px_0_0_#191a23]",
            FOCUS_RING,
          )}
        >
          <FiArrowDown aria-hidden /> Latest
        </button>
      ) : null}
    </div>
  );
}

function ticketIds(messages: Message[]): Set<string> {
  const ids = new Set<string>();
  for (const m of messages) for (const c of m.confirmations) ids.add(c.id);
  return ids;
}

/**
 * A ticket shows once, in the message that raised it. The Confirm turn that
 * follows carries the same ticket with its new status; the card above already
 * reads the latest status from the slot, so the repeat is dropped.
 */
function firstShown(messages: Message[]): Message[] {
  const seen = new Set<string>();
  return messages.map((m) => {
    if (!m.confirmations.length) return m;
    const fresh = m.confirmations.filter((c) => !seen.has(c.id));
    for (const c of m.confirmations) seen.add(c.id);
    return fresh.length === m.confirmations.length ? m : { ...m, confirmations: fresh };
  });
}
