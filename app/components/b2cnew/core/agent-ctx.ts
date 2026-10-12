// The agent context, the useAgent() hook and chipFor helpers. The engine
// (core/engine.ts) provides the value. Shared file: owned by the foundation.
import { createContext, useContext } from "react";
import type { ContextChip } from "../types";
import type { AgentApi } from "./flow-types";

export const AgentCtx = createContext<AgentApi | null>(null);

/** The agent: ask, start flows, handle chips, open the panel, live status. */
export function useAgent(): AgentApi {
  const v = useContext(AgentCtx);
  if (!v) throw new Error("useAgent must be used inside <B2CProvider>");
  return v;
}

/** A context chip for "Ask Senpai" buttons: agent.open({ attach: chipFor.person(p) }). */
export const chipFor = {
  person: (p: { id: string; first: string; company: string }): ContextChip => ({ kind: "person", id: p.id, label: `${p.first}, ${p.company}` }),
  draft: (d: { id: string }, label: string): ContextChip => ({ kind: "draft", id: d.id, label }),
  reply: (r: { id: string }, label: string): ContextChip => ({ kind: "reply", id: r.id, label }),
  claim: (id: string, label: string): ContextChip => ({ kind: "claim", id, label }),
  prep: (id: string, label: string): ContextChip => ({ kind: "prep", id, label }),
};
