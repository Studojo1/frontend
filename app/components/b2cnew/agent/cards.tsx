// Chat cards: the decision card (with a hold for raising autopilot), the
// memory proposal (Save or Not now; Senpai never writes memory silently)
// and the why card for a person.
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiMapPin, FiUser, FiX } from "react-icons/fi";
import { missionOf, pendingDrafts, personView } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { CITIES, fullName, lineById } from "../data";
import { QUICK, SPRING_SNAP, useSafeReducedMotion } from "../motion";
import type { ChatMsg, MemoryItem, QuickChip } from "../types";
import { Avatar, cx, EvidenceChip, HoldButton, SimNote, StagePill } from "../ui";
import { ChipButton, SenpaiMark } from "./bits";
import { notch3Lock, notchNote } from "./flows/f-coach";
import { andList, ruleActions, ruleTargets } from "./flows/helpers";

type Of<K extends ChatMsg["kind"]> = Extract<ChatMsg, { kind: K }>;

/** A small "you chose" line once a card is answered. */
function Resolved({ text }: { text: string }) {
  return (
    <p className="mt-2 inline-flex items-center gap-1.5 font-satoshi text-xs font-bold text-studojo-muted">
      <FiCheck aria-hidden className="text-[#047857]" /> {text}
    </p>
  );
}

export function SenpaiShell({ children, tone = "white", dashed }: { children: ReactNode; tone?: "white" | "purple" | "yellow"; dashed?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <SenpaiMark size="sm" className="mt-1" />
      <div
        className={cx(
          "min-w-0 flex-1 rounded-2xl rounded-tl-md border-2 px-3 py-2.5",
          dashed ? "border-dashed border-studojo-purple-strong" : "border-studojo-ink",
          tone === "purple" ? "bg-studojo-purple-bg" : tone === "yellow" ? "bg-studojo-yellow-bg" : "bg-white",
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ── Decision ────────────────────────────────────────────────────────────────

/** The FOLDED note the reducer writes when a newer review card replaces this one. */
const FOLDED = "Folded into the newer card below";

/**
 * A "Review now?" card settles itself once the drafts it was about are all
 * handled in Approvals (the same way the diff card does), and its count
 * stays live while some are still waiting.
 */
function reviewState(s: ReturnType<typeof useB2C>["s"], m: Of<"decision">) {
  if (!m.actions.some((c) => c.flow === "F2")) return null;
  const ds = m.drafts ? s.drafts.filter((d) => m.drafts?.includes(d.id)) : pendingDrafts(s, m.missionId);
  const total = m.drafts?.length ?? ds.length;
  const waiting = ds.filter((d) => d.status === "pending").length;
  const approved = ds.filter((d) => d.status === "approved").length;
  const other = total - waiting - approved;
  const parts = [`${approved} approved`, ...(other > 0 ? [`${other} skipped or dropped`] : [])];
  const done = m.drafts ? `Settled in Approvals: ${parts.join(", ")}` : "Settled in Approvals";
  return { total, waiting, settled: waiting === 0 ? done : null };
}

export function DecisionCard({ m }: { m: Of<"decision"> }) {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const review = m.resolved ? null : reviewState(s, m);
  const pick = (c: QuickChip) => {
    dispatch({ type: "CHAT_UPDATE", id: m.id, patch: { resolved: c.label } });
    const a = c.action;
    if (a?.type === "SET_NOTCH") {
      const lock = a.notch === 3 ? notch3Lock(s, a.missionId) : null;
      if (lock) return agent.note(lock);
      dispatch(a);
      agent.note(notchNote(a.notch));
      return;
    }
    agent.chip(c);
  };
  return (
    <SenpaiShell tone="purple">
      <p className="font-satoshi text-sm leading-relaxed text-studojo-ink">
        {review && !review.settled && review.waiting < review.total
          ? `${review.waiting} of ${review.total} drafts still waiting. Nothing is sent until you approve. Review now?`
          : m.text}
      </p>
      {m.resolved ? (
        <Resolved text={m.resolved === FOLDED ? FOLDED : `You chose: ${m.resolved}`} />
      ) : review?.settled ? (
        <Resolved text={review.settled} />
      ) : (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {m.actions.map((c) => {
            const a = c.action;
            const raise = a?.type === "SET_NOTCH" && a.notch > missionOf(s, a.missionId).notch;
            return raise ? (
              <HoldButton key={c.label} size="sm" onConfirm={() => pick(c)} label={`Hold to ${c.label.toLowerCase()}`}>
                Hold: {c.label}
              </HoldButton>
            ) : (
              <ChipButton key={c.label} tone={c.tone === "primary" ? "primary" : "plain"} onClick={() => pick(c)}>
                {c.label}
              </ChipButton>
            );
          })}
        </div>
      )}
    </SenpaiShell>
  );
}

// ── Memory proposal ─────────────────────────────────────────────────────────

const scopeLabel = (s: ReturnType<typeof useB2C>["s"], item: MemoryItem) =>
  item.scope === "shared" ? "All missions" : (s.missions.find((x) => x.id === item.scope)?.short ?? item.scope);

export function MemoryProposal({ m }: { m: Of<"memory"> }) {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const reduced = useSafeReducedMotion();
  const item = m.item;
  const targets = m.status === "proposed" ? ruleTargets(s, item) : [];
  const save = () => {
    const acts = ruleActions(s, item);
    dispatch({ type: "ADD_MEMORY", item, by: "you" });
    for (const a of acts) dispatch(a);
    dispatch({ type: "CHAT_UPDATE", id: m.id, patch: { status: "saved" } });
    agent.note(
      targets.length
        ? `Saved. ${andList(targets.map((p) => p.company))} moved to Closed and their unsent emails dropped. It is in Memory under Rules.`
        : "Saved. It is in Memory. Nothing in your queue changed.",
    );
  };
  const decline = () => dispatch({ type: "CHAT_UPDATE", id: m.id, patch: { status: "declined" } });
  return (
    <SenpaiShell dashed={m.status === "proposed"}>
      <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-purple-strong">Remember this?</p>
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -1.5, y: 6 }}
        animate={{ opacity: 1, rotate: 0, y: 0 }}
        transition={reduced ? QUICK : SPRING_SNAP}
        className={cx(
          "mt-1.5 rounded-xl border-2 px-3 py-2",
          item.proof === "your-word" ? "border-dashed border-studojo-ink/60 bg-white" : "border-studojo-ink bg-white",
        )}
      >
        <p className="font-satoshi text-[11px] font-bold uppercase tracking-wide text-studojo-muted">
          {item.kind === "rule" ? "Rule" : "Fact"} · {scopeLabel(s, item)}
        </p>
        <p className="font-clash text-base font-semibold text-studojo-ink">{item.text}</p>
        <p className="mt-0.5 font-satoshi text-xs text-studojo-muted">
          From: {item.source.label}
          {item.proof === "your-word" ? " · Your word, stays out of emails" : ""}
        </p>
      </motion.div>
      {m.status === "proposed" ? (
        <>
          {targets.length ? (
            <p className="mt-2 font-satoshi text-xs text-studojo-ink">
              Moves {andList(targets.map((p) => `${p.first} at ${p.company}`))} to Closed. Their unsent emails drop.
            </p>
          ) : null}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <ChipButton tone="primary" icon={<FiCheck />} onClick={save}>
              Save
            </ChipButton>
            <ChipButton icon={<FiX />} onClick={decline}>
              Not now
            </ChipButton>
          </div>
        </>
      ) : m.status === "saved" ? (
        <div className="flex flex-wrap items-center gap-2">
          <Resolved text="Saved to Memory" />
          <button type="button" onClick={() => dispatch({ type: "DOCK", seg: "memory" })} className="mt-2 font-satoshi text-xs font-bold text-studojo-purple-strong underline underline-offset-2">
            Open Memory
          </button>
        </div>
      ) : (
        <Resolved text="Not saved. Nothing changed." />
      )}
    </SenpaiShell>
  );
}

// ── Why card ────────────────────────────────────────────────────────────────

const lineLabel = (id: string) => {
  const t = lineById(id)?.text ?? "Resume line";
  const head = t.split(/[;:(]/)[0].trim();
  return head.length > 34 ? `${head.slice(0, 32).trimEnd()}...` : head;
};

export function WhyCard({ m }: { m: Of<"why"> }) {
  const { s, dispatch, viewport } = useB2C();
  const agent = useAgent();
  const p = s.people.find((x) => x.id === m.personId);
  if (!p) return null;
  const v = personView(s, p);
  const mission = missionOf(s, p.missionId);
  const t = mission.target;
  const places = [...t.cities.map((c) => CITIES.find((x) => x.id === c)?.label ?? c), ...(t.remote ? ["Remote"] : [])];
  const cityOk = places.some((c) => p.city.toLowerCase().startsWith(c.toLowerCase().split(" ")[0]));
  const removed = !v.pendingDraft && s.drafts.some((d) => d.personId === p.id && d.status === "dropped");
  const open = () => {
    dispatch({ type: "SET_TAB", tab: "people" });
    dispatch({ type: "SELECT", id: p.id });
    if (viewport !== "wide") agent.close();
  };
  return (
    <SenpaiShell>
      <div className="flex items-center gap-2.5">
        <Avatar first={p.first} last={p.last} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-satoshi text-sm font-bold text-studojo-ink">{fullName(p)}</p>
          <p className="truncate font-satoshi text-xs text-studojo-muted">
            {p.title}, {p.company}
          </p>
        </div>
        <StagePill stage={v.stage} />
      </div>
      <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-satoshi text-xs">
        <dt className="font-bold text-studojo-muted">Role</dt>
        <dd className="text-studojo-ink">{p.hiringFor}</dd>
        <dt className="font-bold text-studojo-muted">City</dt>
        <dd className="inline-flex items-center gap-1 text-studojo-ink">
          <FiMapPin aria-hidden /> {p.city} <span className={cityOk ? "text-[#047857]" : "text-[#92400e]"}>· {cityOk ? "in your list" : "outside your list"}</span>
        </dd>
        <dt className="font-bold text-studojo-muted">Stage</dt>
        <dd className="text-studojo-ink">
          {p.stageLabel}, {p.sector.toLowerCase()}
        </dd>
        <dt className="font-bold text-studojo-muted">Fit</dt>
        <dd className="flex items-center gap-2">
          <span aria-hidden className="h-2 w-20 overflow-hidden rounded-full border border-studojo-ink bg-white">
            <span className="block h-full bg-studojo-purple" style={{ width: `${p.fit}%` }} />
          </span>
          <span className="font-bold tabular-nums text-studojo-ink">{p.fit}</span>
          <SimNote kind="sample" />
        </dd>
      </dl>
      <p className="mt-2 rounded-lg bg-studojo-surface-muted px-2 py-1.5 font-satoshi text-sm text-studojo-ink">{p.why}</p>
      {p.evidence.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {p.evidence.map((id) => (
            <EvidenceChip key={id} lineId={id} label={lineLabel(id)} />
          ))}
        </div>
      ) : null}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <ChipButton icon={<FiUser />} onClick={open}>
          Open in People
        </ChipButton>
        {v.pendingDraft ? (
          <ChipButton
            onClick={() => {
              dispatch({ type: "DROP_FROM_QUEUE", personIds: [p.id], reason: "you asked", by: "you" });
              agent.note(`Removed ${p.first} from the queue. Their draft is dropped and no credit was used.`);
            }}
          >
            Remove from queue
          </ChipButton>
        ) : null}
      </div>
      {removed ? <Resolved text="Removed from the queue" /> : null}
    </SenpaiShell>
  );
}
