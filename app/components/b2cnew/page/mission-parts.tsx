// Mission sheet sections: the target, the guardrails summary (with the fit
// floor) and the never-contact list. Group 4.
import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMinus, FiPlus, FiShield, FiSliders, FiSlash, FiX } from "react-icons/fi";
import { COPY, GUARDRAILS, NOTCH3_UNLOCK, notchMeta } from "../config";
import { capFor, personById } from "../core/derive";
import { useB2C } from "../core/store";
import { CITIES, monthLabel, roleById } from "../data";
import { useMotionPresets } from "../motion";
import type { Mission } from "../types";
import { Button, cx, FOCUS_RING, IconButton, SectionHeader, SimNote } from "../ui";

const STAGE_LABEL = ["Tiny startups", "Seed", "Series A to B", "Growth stage", "Large companies"];

export function TargetBlock({ m }: { m: Mission }) {
  const t = m.target;
  const role = roleById(t.role);
  const rows: [string, string][] = [
    ["Role", t.jobType === "fulltime" ? `${role.label}, full-time` : `${role.label}, internship`],
    ["Where", [...t.cities.map((c) => CITIES.find((x) => x.id === c)?.label ?? c), ...(t.remote ? ["Remote"] : [])].join(", ") || "Anywhere"],
    ["Start", monthLabel(t.startMonth)],
    ["Company size", t.stage !== null ? STAGE_LABEL[t.stage] : "Any"],
    ["Tone", t.tone ? `${t.tone.charAt(0).toUpperCase()}${t.tone.slice(1)}` : "Direct"],
  ];
  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 rounded-2xl border-2 border-studojo-ink bg-white p-3 font-satoshi text-sm sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-3 sm:block">
          <dt className="text-xs text-studojo-muted">{k}</dt>
          <dd className="text-right font-bold sm:text-left">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function GuardrailsBlock({ m, onLever }: { m: Mission; onLever: () => void }) {
  const { s, dispatch } = useB2C();
  const mp = useMotionPresets();
  const [showAll, setShowAll] = useState(m.notch === 3);
  const listId = useId();
  const setFloor = (n: number) => {
    const v = Math.max(60, Math.min(90, n));
    if (v !== m.fitFloor) dispatch({ type: "UPDATE_MISSION", id: m.id, patch: { fitFloor: v }, note: `Fit floor for ${m.short} set to ${v}` });
  };
  const meta = notchMeta(m.notch);
  return (
    <section aria-labelledby="ms-guard">
      <SectionHeader as="h3" id="ms-guard" title="Guardrails" action={<Button size="sm" variant="secondary" icon={<FiSliders />} onClick={onLever}>Autopilot</Button>} />
      <div className="space-y-3 rounded-2xl border-2 border-studojo-ink bg-white p-3">
        <p className="font-satoshi text-sm">
          <b>{meta.name}.</b> {meta.may}
        </p>
        {m.notch < 3 ? (
          <p className="font-satoshi text-xs text-studojo-muted">
            Guardrailed autopilot unlocks after {NOTCH3_UNLOCK} approvals here. You are at {Math.min(m.approvals, NOTCH3_UNLOCK)}.
          </p>
        ) : null}
        <div className="flex items-center gap-3 rounded-xl bg-studojo-surface-muted px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="font-satoshi text-sm font-bold">Fit floor</p>
            <p className="font-satoshi text-xs text-studojo-muted">Autopilot only writes to people above this fit. <SimNote kind="sample" /></p>
          </div>
          <IconButton size="sm" label="Lower the fit floor by 5" icon={<FiMinus />} tone="purple" disabled={m.fitFloor <= 60} onClick={() => setFloor(m.fitFloor - 5)} />
          <output aria-live="polite" className="w-9 text-center font-clash text-xl font-semibold tabular-nums">{m.fitFloor}</output>
          <IconButton size="sm" label="Raise the fit floor by 5" icon={<FiPlus />} tone="purple" disabled={m.fitFloor >= 90} onClick={() => setFloor(m.fitFloor + 5)} />
        </div>
        <p className="font-satoshi text-sm">Never more than the daily cap: up to {capFor(s.day)} today, from your own Gmail.</p>
        <button type="button" aria-expanded={showAll} aria-controls={listId} onClick={() => setShowAll((v) => !v)} className={cx("min-h-10 rounded-lg font-satoshi text-sm font-bold text-studojo-purple-strong underline underline-offset-4", FOCUS_RING)}>
          {showAll ? "Hide the full list" : `All ${GUARDRAILS.length} guardrails`}
        </button>
        <AnimatePresence initial={false}>
          {showAll ? (
            <motion.ol id={listId} variants={mp.list} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-1.5">
              {GUARDRAILS.map((g) => (
                <motion.li key={g} variants={mp.item} className="flex items-start gap-2 font-satoshi text-sm">
                  <FiShield aria-hidden className="mt-0.5 shrink-0 text-[#047857]" />
                  {g}
                </motion.li>
              ))}
            </motion.ol>
          ) : null}
        </AnimatePresence>
        <p className="rounded-lg bg-studojo-green-bg px-2.5 py-1.5 font-satoshi text-sm font-bold text-[#047857]">{COPY.neverReplies}</p>
      </div>
    </section>
  );
}

export function NeverContactBlock({ m }: { m: Mission }) {
  const { s, dispatch } = useB2C();
  const inputId = useId();
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const label = (entry: string) => {
    const p = personById(s, entry);
    return p ? { name: `${p.first} ${p.last}`, sub: p.company } : { name: entry, sub: "Whole company" };
  };
  const add = () => {
    const name = text.trim();
    if (name.length < 2) return;
    if (m.neverContact.some((x) => x.toLowerCase() === name.toLowerCase())) {
      setMsg(`${name} is already on the list.`);
      return;
    }
    const hit = s.people.filter((p) => p.missionId === m.id && p.company.toLowerCase() === name.toLowerCase()).map((p) => p.id);
    dispatch({ type: "UPDATE_MISSION", id: m.id, patch: { neverContact: [...m.neverContact, name] }, note: `Never contact ${name} in ${m.short}` });
    if (hit.length) dispatch({ type: "DROP_FROM_QUEUE", personIds: hit, close: true, reason: "on your never-contact list", by: "you" });
    setText("");
    setMsg(hit.length ? `Added. ${hit.length} ${hit.length === 1 ? "person" : "people"} there moved to Closed; their unsent emails dropped.` : `Added. Senpai will skip ${name} from now on.`);
  };
  const remove = (entry: string) => {
    dispatch({ type: "UPDATE_MISSION", id: m.id, patch: { neverContact: m.neverContact.filter((x) => x !== entry) }, note: `Took ${label(entry).name} off the never-contact list` });
    setMsg(`${label(entry).name} is off the list. Nobody is emailed until you approve a draft.`);
  };
  return (
    <section aria-labelledby="ms-never">
      <SectionHeader as="h3" id="ms-never" title="Never contact" kicker={`${m.neverContact.length} on the list`} />
      {m.neverContact.length ? (
        <ul className="mb-3 divide-y-2 divide-studojo-ink/10 rounded-2xl border-2 border-studojo-ink bg-white">
          {m.neverContact.map((e) => {
            const l = label(e);
            return (
              <li key={e} className="flex min-h-12 items-center gap-3 px-3 py-1.5 font-satoshi text-sm">
                <FiSlash aria-hidden className="shrink-0 text-studojo-muted" />
                <span className="min-w-0 flex-1">
                  <b>{l.name}</b>
                  <span className="block text-xs text-studojo-muted">{l.sub}</span>
                </span>
                <IconButton size="sm" label={`Take ${l.name} off the list`} icon={<FiX />} onClick={() => remove(e)} />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mb-3 font-satoshi text-sm text-studojo-muted">Nobody yet. Add a company you never want emailed, like a current employer.</p>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <label htmlFor={inputId} className="sr-only">Company to never contact</label>
        <input
          id={inputId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Company name"
          autoComplete="off"
          className={cx("min-h-11 min-w-0 flex-1 rounded-xl border-2 border-studojo-ink bg-white px-3 font-satoshi text-base", FOCUS_RING)}
        />
        <Button type="submit" variant="secondary" disabled={text.trim().length < 2}>Add</Button>
      </form>
      <p aria-live="polite" className="mt-1.5 min-h-5 font-satoshi text-xs text-studojo-muted">{msg}</p>
    </section>
  );
}
