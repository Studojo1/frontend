// Quick chips as they stand now, for the engine. Pure: reads the state and
// the flow list, never the window. Shared file: owned by the foundation.
import { QUICK_CHIPS, TAB_IDS as TAB_ORDER } from "../config";
import type { AppState, QuickChip, TabId } from "../types";
import { composerContext, pendingDrafts } from "./derive";
import type { FlowCtx, FlowSpec } from "./flow-types";
import { inputFrom } from "./router";

type FindFlow = (id: string) => FlowSpec | undefined;

/**
 * The tab's quick chips as they stand now: a flow that would only refuse
 * here is left out (F5 stays, its refusal says to pick someone), the
 * refused flow is never offered straight back, and "Review N drafts"
 * carries the live count.
 */
export function chipsFor(findFlow: FindFlow, now: AppState, tab: TabId, except?: string): QuickChip[] {
  const context = composerContext(now);
  const ctx: FlowCtx = { missionId: now.env, input: inputFrom(now, context), context, answers: [] };
  return QUICK_CHIPS[tab].flatMap((c) => {
    if (!c.flow) return [c];
    if (c.flow === except) return [];
    const spec = findFlow(c.flow);
    if (spec?.available && c.flow !== "F5" && spec.available(now, ctx) !== true) return [];
    if (c.flow === "F2") {
      const n = pendingDrafts(now).length;
      return [{ ...c, label: n === 1 ? "Review 1 draft" : `Review ${n} drafts` }];
    }
    return [c];
  });
}

/** This tab's chips, or when none fit here, up to four from any tab. */
export function chipsAnywhere(findFlow: FindFlow, now: AppState, except?: string): QuickChip[] {
  const here = chipsFor(findFlow, now, now.tab, except);
  if (here.length) return here;
  const all = TAB_ORDER.flatMap((t) => chipsFor(findFlow, now, t, except));
  return all.filter((c, i) => all.findIndex((x) => x.label === c.label) === i).slice(0, 4);
}

