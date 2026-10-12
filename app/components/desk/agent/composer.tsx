// The composer: what the agent can see (the screen, plus any people or
// emails attached), the input, and Send or Stop. Enter sends, Shift+Enter
// adds a line. The page context goes with every message.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FiArrowUp, FiEye, FiSquare, FiX } from "react-icons/fi";
import type { DeskRoute, PageContext } from "~/lib/desk/types";
import { cx, FOCUS_RING, PRESS } from "./bits";
import { isBusy } from "./live";
import { send, stop } from "./runner";
import { detachFromAgent, MAIN, patchSlot, useAgentStore } from "./store";
import { useSlot } from "./use-agent";
import { isStatusWord, labelFor } from "../tabs/status";

const ROUTE_LABEL: Record<DeskRoute, string> = {
  home: "Home",
  people: "People",
  inbox: "Inbox",
  profile: "Profile",
  settings: "Settings",
  outreach: "This email",
};

function contextLabel(ctx: PageContext | null, scope: string): string {
  if (!ctx) return scope === MAIN ? "Your workspace" : "This email";
  const base = ROUTE_LABEL[ctx.route] ?? "Your workspace";
  if (ctx.route === "home" && ctx.filter) return `${base}, ${isStatusWord(ctx.filter) ? labelFor(ctx.filter) : ctx.filter === "all" ? "All" : ctx.filter}`;
  if (ctx.route === "people" && ctx.query) return `${base}, "${ctx.query.slice(0, 24)}"`;
  return base;
}

export function Composer({ scope, variant }: { scope: string; variant: "panel" | "sheet" }) {
  const slot = useSlot(scope);
  const ctx = useAgentStore((s) => s.pageContext);
  const selected = useAgentStore((s) => s.selected);
  const maxChars = useAgentStore((s) => s.maxChars);
  const usage = useAgentStore((s) => s.usage);
  const busy = isBusy(slot.live);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const id = `desk-agent-input-${variant}-${scope.replace(/[^a-z0-9]/gi, "-")}`;

  // A send that could not start hands its words back.
  useEffect(() => {
    if (slot.restoreText === null) return;
    const text = slot.restoreText;
    setDraft((d) => (d.trim() ? d : text));
    patchSlot(scope, () => ({ restoreText: null }));
  }, [slot.restoreText, scope]);

  // Grow with the text, up to about six lines.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 156)}px`;
  }, [draft]);

  const tooLong = draft.length > maxChars;
  const left = usage ? Math.max(0, usage.messages_cap - usage.messages_today) : null;
  const submit = () => {
    if (busy || !draft.trim() || tooLong || !slot.thread) return;
    if (send(scope, draft)) setDraft("");
  };

  return (
    <div className={cx("shrink-0 border-t-2 border-studojo-ink bg-white px-3 pt-2", variant === "sheet" ? "pb-[max(0.75rem,env(safe-area-inset-bottom))]" : "pb-3")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (busy) stop(scope);
          else submit();
        }}
        className="rounded-2xl border-2 border-studojo-ink bg-white transition-shadow focus-within:shadow-[3px_3px_0_0_#8b5cf6]"
      >
        <ul aria-label="What I can see" className="flex flex-wrap items-center gap-1 px-2 pt-2">
          <li className="inline-flex max-w-full items-center gap-1 rounded-full border border-studojo-ink/20 bg-studojo-surface-muted px-2 py-0.5 font-satoshi text-[11px] font-bold text-studojo-muted">
            <FiEye aria-hidden />
            <span className="truncate">{contextLabel(ctx, scope)}</span>
          </li>
          {selected.map((c) => (
            <li
              key={`${c.kind}-${c.id}`}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-studojo-purple-strong bg-studojo-purple-bg px-2 py-0.5 font-satoshi text-[11px] font-bold text-studojo-purple-strong"
            >
              <span className="truncate">{c.label}</span>
              <button
                type="button"
                onClick={() => detachFromAgent(c)}
                aria-label={`Remove ${c.label}`}
                className={cx("-mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-white", FOCUS_RING)}
              >
                <FiX aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-end gap-2 p-2">
          <label htmlFor={id} className="sr-only">
            Message
          </label>
          <textarea
            id={id}
            ref={ref}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={scope === MAIN ? "Ask about your matches or emails" : "Ask me to change this email"}
            className="min-h-11 flex-1 resize-none bg-transparent px-1 py-2 font-satoshi text-base leading-snug text-studojo-ink placeholder:text-studojo-muted focus:outline-none"
          />
          <button
            type="submit"
            aria-label={busy ? "Stop" : "Send"}
            disabled={!busy && (!draft.trim() || tooLong || !slot.thread)}
            className={cx(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-studojo-ink text-lg",
              busy ? "bg-white text-studojo-ink" : "bg-studojo-purple-strong text-white shadow-[2px_2px_0_0_#191a23]",
              "disabled:bg-studojo-surface-muted disabled:text-studojo-muted disabled:shadow-none",
              PRESS,
              FOCUS_RING,
            )}
          >
            {busy ? <FiSquare aria-hidden className="fill-current text-sm" /> : <FiArrowUp aria-hidden />}
          </button>
        </div>
      </form>
      <p className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 px-1 font-satoshi text-[11px] text-studojo-muted">
        <span>Nothing is sent until you approve it.</span>
        {tooLong ? (
          <span className="font-bold text-[#be185d]">
            {draft.length} of {maxChars} characters. Shorten it to send.
          </span>
        ) : left !== null && left <= 10 ? (
          <span className="font-bold">{left === 1 ? "1 message left today" : `${left} messages left today`}</span>
        ) : (
          <span className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline">Enter to send, Shift+Enter for a new line</span>
        )}
      </p>
    </div>
  );
}
