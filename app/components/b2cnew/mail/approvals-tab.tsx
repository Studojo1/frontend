// ApprovalsTab: nothing leaves without you, unless you raised the lever.
// Header (count, compact lever, Approve all from this run, Stack or List),
// the approval stack or the list, and the seven-day send schedule.
import { useEffect, useState } from "react";
import { FiCheckSquare, FiCoffee, FiLayers, FiList, FiMessageCircle, FiSearch, FiZap } from "react-icons/fi";
import { COPY, notchMeta } from "../config";
import { fuel } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C, useMission } from "../core/store";
import { dayDate } from "../data";
import type { QuickChip } from "../types";
import { Button, Card, cx, EmptyState, FOCUS_RING, HoldButton, LiveRegion, Segmented } from "../ui";
import { ApprovalList } from "./approval-list";
import { ApprovalStack } from "./approval-stack";
import { latestRunBatch, stackOrder } from "./helpers";
import { AutopilotLever } from "./lever";
import { SendSchedule } from "./send-schedule";

export function ApprovalsTab() {
  const { s, dispatch } = useB2C();
  const m = useMission();
  const drafts = stackOrder(s);
  const f = fuel(s);
  const queued = s.drafts.filter((d) => d.missionId === m.id && d.status === "approved" && (d.slotDay ?? 0) > s.day);
  const view = s.approvalsView;
  // A draft that left the queue should not stay attached to the composer.
  const stale = s.focus?.kind === "draft" && !drafts.some((d) => d.id === s.focus?.id);
  useEffect(() => {
    if (stale) dispatch({ type: "FOCUS", item: null });
  }, [stale]);

  return (
    <div className="@container space-y-5">
      <ApprovalsHeader count={drafts.length} />
      {f.left === 0 && f.waiting ? (
        <Card tone="yellow" pad="sm" shadow="none" className="flex flex-wrap items-center gap-3">
          <p className="min-w-0 flex-1 font-satoshi text-sm">
            {m.total === 0
              ? "This mission has no credits yet. Fund it to approve first emails. Follow-ups stay free."
              : `No credits left in this pack. ${f.waiting} first ${f.waiting === 1 ? "email waits" : "emails wait"} for a top-up. Skipping costs nothing.`}
          </p>
          <Button size="sm" variant="secondary" onClick={() => dispatch({ type: "SHEET", sheet: "wallet" })}>
            {m.total === 0 ? "Fund this mission" : "Top up"}
          </Button>
        </Card>
      ) : null}
      <div className="grid gap-6 @[720px]:grid-cols-[minmax(0,1fr)_280px] @[960px]:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {drafts.length === 0 ? (
            <AllClear approved={queued.length} firstDay={queued.reduce((d, x) => Math.min(d, x.slotDay ?? d), Infinity)} />
          ) : view === "list" ? (
            <ApprovalList drafts={drafts} />
          ) : (
            <ApprovalStack drafts={drafts} />
          )}
        </div>
        <div className="min-w-0 space-y-5">
          <SendSchedule />
          <AskStrip hasDrafts={drafts.length > 0} draftMission={m.status === "draft"} />
        </div>
      </div>
    </div>
  );
}

function ApprovalsHeader({ count }: { count: number }) {
  const { s, dispatch } = useB2C();
  const m = useMission();
  const batch = latestRunBatch(s);
  const [said, setSaid] = useState("");
  // With an empty pack, only free follow-ups in the batch could go: approve all is off until a top-up.
  const f = fuel(s);
  const noCredit = f.left === 0 && batch.ids.every((id) => s.drafts.find((d) => d.id === id)?.kind === "first");
  const canBatch = m.notch >= 2 && !noCredit;
  const approveRun = () => {
    // The reducer approves what the pack can cover and sets the toast (with Undo).
    dispatch({ type: "APPROVE_MANY", ids: batch.ids });
    setSaid(`Approved the drafts from this run that your credits cover.`);
  };
  return (
    <section aria-labelledby="ap-title" className="space-y-2">
      <LiveRegion message={said} />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 id="ap-title" className="font-clash text-2xl font-semibold text-studojo-ink">
          {count ? `${count} draft${count === 1 ? "" : "s"} waiting` : "Nothing waiting"}
        </h2>
        <AutopilotLever compact />
        <div className="flex-1" />
        {count ? (
          <Segmented
            items={[
              { id: "stack", label: "Stack", icon: <FiLayers /> },
              { id: "list", label: "List", icon: <FiList /> },
            ]}
            value={s.approvalsView}
            onChange={(view) => dispatch({ type: "SET_APPROVALS_VIEW", view })}
            label="Approvals view"
            layoutId="b2c-ap-view"
            idPrefix="b2c-ap-view"
            size="sm"
          />
        ) : null}
      </div>
      <p className="max-w-2xl font-satoshi text-sm text-studojo-muted">{COPY.approvalCost}</p>
      {count > 1 && batch.ids.length > 1 ? (
        <div className="flex flex-wrap items-center gap-3">
          <HoldButton
            onConfirm={approveRun}
            size="sm"
            disabled={!canBatch}
            label={canBatch ? `Hold to approve all ${batch.ids.length} from this run` : noCredit ? "Approve all needs credits" : "Approve all needs the lever on Batch"}
          >
            <FiCheckSquare aria-hidden />
            Approve all {batch.ids.length} from this run
            <span className="font-normal opacity-80">(hold)</span>
          </HoldButton>
          {canBatch ? (
            <span className="font-satoshi text-xs text-studojo-muted">Hold for a moment. {notchMeta(2).name} lets you approve a run in one go.</span>
          ) : noCredit ? (
            <span className="font-satoshi text-xs text-studojo-muted">No credits left. Top up first, then approve the run in one go.</span>
          ) : (
            <button
              type="button"
              onClick={() => dispatch({ type: "SHEET", sheet: "lever" })}
              className={cx("min-h-11 rounded-lg px-1 font-satoshi text-sm font-bold text-studojo-purple-strong underline underline-offset-4", FOCUS_RING)}
            >
              On Ask me, you approve one at a time. Raise the lever to Batch
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}

function AllClear({ approved, firstDay }: { approved: number; firstDay: number }) {
  const { s } = useB2C();
  const agent = useAgent();
  const m = useMission();
  const go = (flow: "F6" | "F14") => {
    agent.open({ focus: false });
    agent.start(flow);
  };
  if (approved > 0) {
    return (
      <EmptyState
        icon={<FiCheckSquare />}
        title="All caught up"
        body={`You approved ${approved} that ${approved === 1 ? "has" : "have"} not gone yet. The first goes ${dayDate(Number.isFinite(firstDay) ? firstDay : s.day + 1).label}, inside the cap. Senpai drafts more when you ask.`}
        action={
          m.status === "draft" ? null : (
            <Button variant="secondary" size="sm" icon={<FiSearch />} onClick={() => go("F6")}>
              Find 10 more like Kitebase
            </Button>
          )
        }
      />
    );
  }
  return (
    <EmptyState
      icon={<FiCoffee />}
      title="Nothing waiting."
      body="Senpai drafts more when you ask. Nothing is sent until you approve."
      action={
        m.status === "draft" ? (
          <Button variant="secondary" size="sm" icon={<FiZap />} onClick={() => go("F14")}>
            Launch this mission
          </Button>
        ) : (
          <Button variant="secondary" size="sm" icon={<FiSearch />} onClick={() => go("F6")}>
            Find 10 more like Kitebase
          </Button>
        )
      }
    />
  );
}

/** Ask the agent from here: the tab's quick chips. */
function AskStrip({ hasDrafts, draftMission }: { hasDrafts: boolean; draftMission: boolean }) {
  const agent = useAgent();
  const chips: QuickChip[] = hasDrafts
    ? agent.quickChips("approvals")
    : draftMission
      ? [{ label: "Launch this mission", flow: "F14" }]
      : [{ label: "Find 10 more like Kitebase", flow: "F6" }];
  const run = (c: QuickChip) => {
    agent.open({ focus: false });
    agent.chip(c);
  };
  return (
    <section aria-labelledby="ap-ask" className="rounded-2xl border-2 border-dashed border-studojo-ink/40 bg-white/70 p-3">
      <h3 id="ap-ask" className="flex items-center gap-1.5 font-satoshi text-xs font-bold uppercase tracking-[0.14em] text-studojo-muted">
        <FiMessageCircle aria-hidden />
        Ask Senpai
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => run(c)}
            className={cx("inline-flex min-h-11 items-center rounded-full border-2 border-studojo-ink bg-studojo-purple-bg px-3 font-satoshi text-sm font-bold text-studojo-purple-strong", FOCUS_RING)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="mt-2 font-satoshi text-xs text-studojo-muted">
        {hasDrafts ? "\"Make this warmer\" works on the card on top. Every fact stays; you see the change word by word." : "New drafts land here. No credit is used until you approve."}
      </p>
    </section>
  );
}
