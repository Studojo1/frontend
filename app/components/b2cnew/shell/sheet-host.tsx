// Every sheet in one place, driven by s.sheet (and ?sheet=), plus the agent
// overlay: a full-height bottom sheet on phones, a slide-over from 1024 to
// 1279px. Shared file: owned by the foundation.
import { AgentPanel } from "../agent/panel";
import { useB2C } from "../core/store";
import { AutopilotLever } from "../mail/lever";
import { MissionSheet } from "../page/mission-sheet";
import { WalletSheet } from "../page/wallet-sheet";
import { Sheet } from "../ui";
import { GmailSheet, MoreSheet } from "./more-sheet";
import { Switcher } from "./switcher";

export function SheetHost() {
  const { s, dispatch, viewport } = useB2C();
  const close = () => dispatch({ type: "SHEET", sheet: null });
  return (
    <>
      <Sheet open={s.sheet === "switcher"} onClose={close} title="Your missions" description="Up to three at once. Two missions never email the same person.">
        <Switcher />
      </Sheet>
      <Sheet open={s.sheet === "more"} onClose={close} title="More">
        <MoreSheet />
      </Sheet>
      <Sheet open={s.sheet === "gmail"} onClose={close} title="Gmail" size="sm">
        <GmailSheet />
      </Sheet>
      <Sheet open={s.sheet === "lever"} onClose={close} title="Autopilot" description="What Senpai may do without asking">
        <AutopilotLever />
      </Sheet>
      <WalletSheet open={s.sheet === "wallet"} onClose={close} />
      <MissionSheet open={s.sheet === "mission"} onClose={close} />
      <Sheet
        open={s.dock.overlay && viewport !== "wide"}
        onClose={() => dispatch({ type: "DOCK", overlay: false })}
        title="Senpai"
        side={viewport === "phone" ? "bottom" : "right"}
        size="full"
        bare
      >
        <AgentPanel variant={viewport === "phone" ? "sheet" : "dock"} />
      </Sheet>
    </>
  );
}
