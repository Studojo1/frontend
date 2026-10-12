// The composer: context chips (mission, tab, what you are looking at,
// anything attached), the tab's quick chips, and the textarea. Enter sends,
// Shift+Enter adds a line. While a run waits for you, typing answers it;
// while a run works, the send button becomes Stop.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FiArrowUp, FiAtSign, FiSquare, FiX } from "react-icons/fi";
import { MISSION_ACCENT } from "../config";
import { composerContext, missionOf } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import type { ContextChip, QuickChip } from "../types";
import { cx, FOCUS_RING, Kbd, POINTER_FINE, PRESS } from "../ui";
import { ChipButton } from "./bits";

/** Extra chips that make sense for what is in focus (on top of the tab's). */
function focusChips(focus: ContextChip | null): QuickChip[] {
  if (!focus) return [];
  const name = focus.label.split(",")[0];
  if (focus.kind === "person") return [{ label: `Why ${name}?`, flow: "F5", input: { personId: focus.id } }];
  if (focus.kind === "draft") return [{ label: "Make it shorter", flow: "F7", input: { draftId: focus.id, choice: "shorter" } }];
  return [];
}

export function Composer({ variant }: { variant: "dock" | "sheet" }) {
  const { s, dispatch, composerRef } = useB2C();
  const agent = useAgent();
  const chips = composerContext(s);
  const m = missionOf(s);
  const accent = MISSION_ACCENT[m.accent];
  const waiting = !!agent.liveStep?.needsYou;
  const working = agent.busy && !waiting;
  // The draft lives here while you type, so a keystroke re-renders only the
  // composer. It goes to the store (and storage) on blur, send and unmount.
  const [draft, setDraft] = useState(s.composer.draft);
  const latest = useRef({ draft, stored: s.composer.draft });
  useLayoutEffect(() => {
    latest.current = { draft, stored: s.composer.draft };
  });
  const flush = () => {
    if (draft !== s.composer.draft) dispatch({ type: "COMPOSER", draft });
  };
  useEffect(
    () => () => {
      const { draft: d, stored } = latest.current;
      if (d !== stored) dispatch({ type: "COMPOSER", draft: d });
    },
    [],
  );
  // A chip or flow that clears the store draft clears it here too.
  useEffect(() => {
    if (s.composer.draft === "" && document.activeElement !== composerRef.current) setDraft("");
  }, [s.composer.draft]);
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), []);
  const quick = [...agent.quickChips(), ...focusChips(s.focus)].filter((c, i, all) => all.findIndex((x) => x.label === c.label) === i);

  // Grow the textarea with its content, up to about five lines.
  useLayoutEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [draft, composerRef]);

  const send = () => {
    if (!draft.trim()) return;
    agent.ask(draft);
    setDraft("");
  };
  const remove = (c: ContextChip) => {
    if (s.focus && s.focus.kind === c.kind && s.focus.id === c.id) dispatch({ type: "FOCUS", item: null });
    dispatch({ type: "COMPOSER", context: s.composer.context.filter((x) => !(x.kind === c.kind && x.id === c.id)) });
  };

  return (
    <div className={cx("shrink-0 border-t-2 border-studojo-ink bg-white px-3 pt-2", variant === "sheet" ? "pb-[max(0.75rem,env(safe-area-inset-bottom))]" : "pb-3")}>
      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]" role="group" aria-label="Quick asks">
        {quick.map((c) => (
          <ChipButton key={c.label} tone={c.tone === "primary" ? "primary" : "soft"} onClick={() => agent.chip(c)}>
            {c.label}
          </ChipButton>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (working && !draft.trim()) agent.stop();
          else send();
        }}
        className={cx(
          "rounded-2xl border-2 bg-white transition-colors focus-within:shadow-[3px_3px_0_0_#8b5cf6]",
          waiting ? "border-studojo-orange" : "border-studojo-ink",
        )}
      >
        <ul aria-label="Senpai can see" className="flex flex-wrap items-center gap-1 px-2 pt-2">
          <li aria-hidden className="text-xs text-studojo-muted">
            <FiAtSign />
          </li>
          {chips.map((c) => {
            const removable = c.kind !== "mission" && c.kind !== "tab";
            return (
              <li
                key={`${c.kind}-${c.id}`}
                className={cx(
                  "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 font-satoshi text-[11px] font-bold",
                  c.kind === "mission" ? cx(accent.tint, accent.text, "border-studojo-ink/30") : removable ? "border-studojo-purple-strong bg-studojo-purple-bg text-studojo-purple-strong" : "border-studojo-ink/20 bg-studojo-surface-muted text-studojo-muted",
                )}
              >
                {c.kind === "mission" ? <span aria-hidden className={cx("h-1.5 w-1.5 rounded-full", accent.solid)} /> : null}
                <span className="truncate">{c.label}</span>
                {removable ? (
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    aria-label={`Remove ${c.label} from what Senpai sees`}
                    className={cx("-mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-white", FOCUS_RING)}
                  >
                    <FiX aria-hidden />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div className="flex items-end gap-2 p-2">
          <label htmlFor="b2c-composer" className="sr-only">
            {waiting ? "Answer Senpai" : "Ask Senpai"}
          </label>
          <textarea
            id="b2c-composer"
            ref={composerRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={flush}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
              if (e.key === "Escape" && draft) {
                e.stopPropagation();
                setDraft("");
              }
            }}
            placeholder={waiting ? "Type your answer, or tap a chip above" : "Ask Senpai about this mission"}
            className="min-h-11 flex-1 resize-none bg-transparent px-1 py-2 font-satoshi text-base leading-snug text-studojo-ink placeholder:text-studojo-muted focus:outline-none"
          />
          <button
            type="submit"
            aria-label={working && !draft.trim() ? "Stop the run" : waiting ? "Send your answer" : "Send to Senpai"}
            disabled={!working && !draft.trim()}
            className={cx(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-studojo-ink text-lg",
              working && !draft.trim() ? "bg-white text-studojo-ink" : "bg-studojo-purple-strong text-white shadow-[2px_2px_0_0_#191a23]",
              "disabled:bg-studojo-surface-muted disabled:text-studojo-muted disabled:shadow-none",
              PRESS,
              FOCUS_RING,
            )}
          >
            {working && !draft.trim() ? <FiSquare aria-hidden className="fill-current text-sm" /> : <FiArrowUp aria-hidden />}
          </button>
        </div>
      </form>
      <p className={cx("mt-1.5 px-1 font-satoshi text-[11px] text-studojo-muted", variant === "sheet" && "hidden sm:block")}>
        Scripted concept: nothing is sent. <span className={POINTER_FINE}><Kbd>{mac ? "\u2318K" : "Ctrl K"}</Kbd> to focus, <Kbd>Enter</Kbd> to send.</span>
      </p>
    </div>
  );
}
