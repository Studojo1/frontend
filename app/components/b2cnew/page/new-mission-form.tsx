// The new-mission form in the mission sheet: role, cities and start month,
// prefilled from what Senpai knows. Submitting hands it to Senpai (F14),
// which asks the rest and matches people. Disabled at three missions. Group 4.
import { useId, useState } from "react";
import { FiCheck, FiPlus } from "react-icons/fi";
import { MAX_MISSIONS } from "../config";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { CITIES, ROLES, START_MONTHS } from "../data";
import type { QuizAnswers } from "../types";
import { Button, cx, FOCUS_RING } from "../ui";

type CityId = QuizAnswers["cities"][number];
type RoleId = NonNullable<QuizAnswers["role"]>;

export function NewMissionForm({ onStart }: { onStart: () => void }) {
  const { s } = useB2C();
  const agent = useAgent();
  const roleId = useId();
  const startId = useId();
  const used = new Set(s.missions.map((m) => m.target.role));
  const remembered = s.memory.some((x) => x.id === "m-cities");
  const [role, setRole] = useState<RoleId>(ROLES.find((r) => !used.has(r.id))?.id ?? "product");
  const [cities, setCities] = useState<CityId[]>(remembered ? ["pune", "bengaluru"] : []);
  const [start, setStart] = useState("2027-07");
  const full = s.missions.length >= MAX_MISSIONS;

  if (full) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-studojo-ink/40 p-3 font-satoshi text-sm text-studojo-muted">
        You have {MAX_MISSIONS} missions, the most at once. Archive one to start another.
      </p>
    );
  }

  const toggle = (c: CityId) => setCities((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));
  const roleLabel = ROLES.find((r) => r.id === role)?.label ?? role;

  return (
    <form
      className="space-y-3 rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg/50 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        onStart();
        agent.open({ focus: false });
        agent.start("F14", { choice: "new", value: `${role}|${cities.join(",")}|${start}` });
      }}
    >
      <p className="font-satoshi text-sm text-studojo-muted">
        {remembered ? "Prefilled from what Senpai knows about you. " : ""}Senpai asks the rest, then matches people. Two missions never email the same person.
      </p>
      <div>
        <label htmlFor={roleId} className="font-satoshi text-sm font-bold">Role</label>
        <select id={roleId} value={role} onChange={(e) => setRole(e.target.value as RoleId)} className={cx("mt-1 block min-h-11 w-full rounded-xl border-2 border-studojo-ink bg-white px-3 font-satoshi text-base", FOCUS_RING)}>
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
              {used.has(r.id) ? " (has a mission)" : ""}
            </option>
          ))}
        </select>
      </div>
      <fieldset>
        <legend className="font-satoshi text-sm font-bold">Cities</legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {CITIES.map((c) => {
            const on = cities.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(c.id)}
                className={cx("inline-flex min-h-10 items-center gap-1 rounded-full border-2 border-studojo-ink px-3 font-satoshi text-sm font-bold", on ? "bg-studojo-ink text-white" : "bg-white", FOCUS_RING)}
              >
                {on ? <FiCheck aria-hidden /> : null}
                {c.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div>
        <label htmlFor={startId} className="font-satoshi text-sm font-bold">Start</label>
        <select id={startId} value={start} onChange={(e) => setStart(e.target.value)} className={cx("mt-1 block min-h-11 w-full rounded-xl border-2 border-studojo-ink bg-white px-3 font-satoshi text-base", FOCUS_RING)}>
          {START_MONTHS.map((mo) => (
            <option key={mo.id} value={mo.id}>{mo.label}</option>
          ))}
        </select>
      </div>
      <Button type="submit" icon={<FiPlus />} className="w-full" disabled={!cities.length}>
        Start a {roleLabel} mission with Senpai
      </Button>
    </form>
  );
}
