// List view: dense rows of every pending draft with checkboxes, for
// keyboard users. J and K move, Enter opens a row, A approves, S skips.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiChevronDown, FiSkipForward } from "react-icons/fi";
import { personById } from "../core/derive";
import { chipFor } from "../core/engine";
import { useB2C } from "../core/store";
import { fullName } from "../data";
import { QUICK } from "../motion";
import { useHotkeys } from "../shell/keys";
import type { Draft } from "../types";
import { Avatar, Button, cx, FOCUS_RING, Kbd, POINTER_FINE, SimNote } from "../ui";
import { ApprovalCardBody, draftLabel } from "./approval-card";
import { KIND_LABEL } from "./helpers";

export function ApprovalList({ drafts }: { drafts: Draft[] }) {
  const { s, dispatch } = useB2C();
  const [picked, setPicked] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const ids = drafts.map((d) => d.id);
  const sel = picked.filter((id) => ids.includes(id));
  const all = sel.length === drafts.length && drafts.length > 0;
  const cur = drafts[Math.min(active, drafts.length - 1)];

  useEffect(() => {
    if (cur) dispatch({ type: "FOCUS", item: chipFor.draft(cur, draftLabel(cur, personById(s, cur.personId))) });
  }, [cur?.id]);

  const move = (by: number) => {
    const n = Math.max(0, Math.min(drafts.length - 1, active + by));
    setActive(n);
    rows.current[n]?.querySelector<HTMLElement>("input")?.focus();
  };
  const approve = (d: Draft) => dispatch({ type: "APPROVE_DRAFT", id: d.id });
  const skip = (d: Draft) => dispatch({ type: "SKIP_DRAFT", id: d.id });
  useHotkeys(
    {
      j: () => move(1),
      arrowdown: () => move(1),
      k: () => move(-1),
      arrowup: () => move(-1),
      enter: () => cur && setOpen((v) => (v === cur.id ? null : cur.id)),
      a: () => cur && approve(cur),
      s: () => cur && skip(cur),
    },
    !!cur && !editing && s.tab === "approvals",
  );

  const approveSel = () => {
    dispatch({ type: "APPROVE_MANY", ids: sel });
    setPicked([]);
  };
  const skipSel = () => {
    sel.forEach((id) => dispatch({ type: "SKIP_DRAFT", id }));
    dispatch({ type: "TOAST", text: `Skipped ${sel.length}. No credits used.` });
    setPicked([]);
  };

  return (
    <div className="@container rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal">
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-studojo-ink/10 px-3 py-2">
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-satoshi text-sm font-bold">
          <input
            type="checkbox"
            checked={all}
            onChange={() => setPicked(all ? [] : ids)}
            className="h-5 w-5 accent-studojo-purple-strong"
          />
          {sel.length ? `${sel.length} selected` : "Select all"}
        </label>
        <div className="flex-1" />
        <Button size="sm" variant="secondary" icon={<FiSkipForward />} disabled={!sel.length} onClick={skipSel}>
          Skip
        </Button>
        <Button size="sm" icon={<FiCheck />} disabled={!sel.length} onClick={approveSel}>
          Approve {sel.length || ""}
        </Button>
      </div>
      <ul aria-label="Drafts waiting" className="divide-y-2 divide-studojo-ink/10">
        {drafts.map((d, i) => {
          const p = personById(s, d.personId);
          if (!p) return null;
          const isOpen = open === d.id;
          const on = cur?.id === d.id;
          return (
            <li
              key={d.id}
              ref={(el) => {
                rows.current[i] = el;
              }}
              className={cx("relative", on && "bg-studojo-purple-bg/40")}
            >
              {on ? <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-studojo-purple" /> : null}
              <div className="flex items-center gap-2 px-3 py-2 @md:gap-3">
                <input
                  type="checkbox"
                  aria-label={`Select the ${draftLabel(d, p)}`}
                  checked={sel.includes(d.id)}
                  onFocus={() => setActive(i)}
                  onChange={() => setPicked((xs) => (xs.includes(d.id) ? xs.filter((x) => x !== d.id) : [...xs, d.id]))}
                  className="h-5 w-5 shrink-0 accent-studojo-purple-strong"
                />
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => {
                    setActive(i);
                    setOpen(isOpen ? null : d.id);
                  }}
                  className={cx("flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg text-left", FOCUS_RING)}
                >
                  <span className="hidden shrink-0 @md:block"><Avatar first={p.first} last={p.last} size="sm" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-satoshi text-sm font-bold">
                      {fullName(p)} <span className="font-normal text-studojo-muted">· {p.company}</span>
                    </span>
                    <span className="block truncate font-satoshi text-xs text-studojo-muted">
                      {KIND_LABEL[d.kind]}: {d.subject}
                      {d.diff ? " · Rewrite waiting" : ""}
                    </span>
                  </span>
                  <span className="hidden shrink-0 font-satoshi text-xs text-studojo-muted @xl:inline">
                    Fit {p.fit} <SimNote kind="sample" />
                  </span>
                  <span className="shrink-0 font-satoshi text-xs font-bold">{d.kind === "first" ? "1 credit" : "Free"}</span>
                  <FiChevronDown aria-hidden className={cx("shrink-0 transition-transform", isOpen && "rotate-180")} />
                </button>
                <div className="hidden shrink-0 gap-1 @sm:flex">
                  <RowButton label={`Skip the ${draftLabel(d, p)}`} onClick={() => skip(d)}>
                    <FiSkipForward />
                  </RowButton>
                  <RowButton label={`Approve the ${draftLabel(d, p)}`} onClick={() => approve(d)} primary>
                    <FiCheck />
                  </RowButton>
                </div>
              </div>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={QUICK} className="overflow-hidden">
                    <div className="px-3 pb-4 @md:pl-12">
                      <ApprovalCardBody d={d} onApprove={() => approve(d)} onSkip={() => skip(d)} editing={editing} setEditing={setEditing} />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      <p className={cx(POINTER_FINE, "px-3 py-2 font-satoshi text-xs text-studojo-muted")}>
        <Kbd>J</Kbd> <Kbd>K</Kbd> move · <Kbd>Enter</Kbd> open · <Kbd>A</Kbd> approve · <Kbd>S</Kbd> skip
      </p>
    </div>
  );
}

function RowButton({ label, onClick, primary, children }: { label: string; onClick: () => void; primary?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-studojo-ink",
        primary ? "bg-studojo-purple-strong text-white" : "bg-white",
        FOCUS_RING,
      )}
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}
