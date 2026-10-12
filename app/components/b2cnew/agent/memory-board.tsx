// Memory: what Senpai knows, in three groups (Facts, Rules, This mission).
// Senpai never writes here silently; it proposes in chat. You can add a
// note yourself, and it lands as "Your word".
import { useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { missionOf } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import type { MemoryItem } from "../types";
import { cx, FOCUS_RING } from "../ui";
import { ChipButton } from "./bits";
import { MemoryCard } from "./memory-card";

function Group({ title, hint, items, empty }: { title: string; hint: string; items: MemoryItem[]; empty: ReactNode }) {
  return (
    <section aria-label={title} className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-clash text-base font-semibold text-studojo-ink">
          {title} <span className="font-satoshi text-xs font-bold text-studojo-muted tabular-nums">{items.length}</span>
        </h3>
        <p className="truncate font-satoshi text-[11px] text-studojo-muted">{hint}</p>
      </div>
      {items.length ? (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map((m) => (
              <MemoryCard key={m.id} item={m} />
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-studojo-ink/30 px-3 py-3 font-satoshi text-sm text-studojo-muted">{empty}</div>
      )}
    </section>
  );
}

export function MemoryBoard() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const m = missionOf(s);
  const [note, setNote] = useState("");
  const inScope = (x: MemoryItem) => x.scope === "shared" || x.scope === s.env;
  const facts = s.memory.filter((x) => x.kind === "fact" && x.scope === "shared");
  const rules = s.memory.filter((x) => x.kind === "rule" && inScope(x));
  const mission = s.memory.filter((x) => x.kind === "fact" && x.scope === s.env);
  const pinned = s.memory.filter((x) => inScope(x) && x.proof === "pinned").length;

  const tryRule = () => {
    dispatch({ type: "DOCK", seg: "chat" });
    dispatch({ type: "COMPOSER", draft: "No Hyderabad roles" });
    agent.focusComposer();
  };
  const add = () => {
    const t = note.trim();
    if (!t) return;
    // Ids are made here, in the handler, never during render.
    const id = `m-note-${Date.now().toString(36)}`;
    dispatch({
      type: "ADD_MEMORY",
      by: "you",
      item: { id, kind: "fact", text: t, scope: "shared", source: { kind: "chat", label: `Added on Day ${s.day}` }, proof: "your-word", useInEmails: false },
    });
    setNote("");
  };

  return (
    <div className="space-y-5 pb-4 pt-1">
      <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg px-3 py-2.5">
        <p className="font-satoshi text-sm text-studojo-ink">
          What I know, with receipts. <span className="font-bold">{pinned} backed</span> by your resume or quiz.
        </p>
        <div className="mt-2 flex flex-wrap gap-3 font-satoshi text-[11px] font-bold text-studojo-muted">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-3 w-5 rounded border-2 border-studojo-ink bg-white" /> Backed, can go in emails
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-3 w-5 rounded border-2 border-dashed border-studojo-ink/60 bg-white" /> Your word, stays out
          </span>
        </div>
      </div>

      <Group title="Facts" hint="Shared by every mission" items={facts} empty="Nothing yet." />
      <Group
        title="Rules"
        hint="Checked on every match"
        items={rules}
        empty={
          <span className="flex flex-wrap items-center gap-2">
            No rules yet. Tell me what to avoid.
            <ChipButton tone="soft" onClick={tryRule}>
              Try "No Hyderabad roles"
            </ChipButton>
          </span>
        }
      />
      <Group title="This mission" hint={m.short} items={mission} empty="Nothing just for this mission yet." />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="rounded-2xl border-2 border-dashed border-studojo-ink/40 p-2.5"
      >
        <label htmlFor="b2c-mem-note" className="font-satoshi text-xs font-bold text-studojo-ink">
          Tell Senpai something
        </label>
        <p className="font-satoshi text-[11px] text-studojo-muted">It is saved as your word: I use it to pick people, never in emails.</p>
        <div className="mt-1.5 flex gap-2">
          <input
            id="b2c-mem-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="For example: I want a team that ships weekly"
            className={cx("min-h-11 min-w-0 flex-1 rounded-xl border-2 border-studojo-ink bg-white px-2.5 font-satoshi text-base", FOCUS_RING)}
          />
          <ChipButton type="submit" tone="primary" size="md" icon={<FiPlus />} disabled={!note.trim()}>
            Add
          </ChipButton>
        </div>
      </form>
    </div>
  );
}
