// Step 5: visibility. The consent step as concentric rings: You, people with
// your link, search engines, hiring managers. Each switch lights its ring.
// Search stays locked until the page is approved; a public link needs the
// 18+ confirmation. Owned by builder B (Your page). Helpers live in ./page/.
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFlow, useStepBar } from "../flow";
import { useMotionPresets } from "../motion";
import type { VisibilityState } from "../types";
import { Card, LiveRegion, StepHeader } from "../ui";
import { AdultCheck, PlainNotice, SwitchList } from "./page/consent";
import { Receipt } from "./page/receipt";
import { Rings } from "./page/rings";
import { lockReason, reachSentence, reachShort, RINGS, type RingId } from "./page/visibility-logic";

export function Visibility() {
  const f = useFlow();
  const m = useMotionPresets();
  const v = f.data.visibility;
  const approved = f.data.profile.approved;
  const [hot, setHot] = useState<RingId | null>(null);
  const [announce, setAnnounce] = useState("");

  const locks = {
    link: lockReason(v, approved, "link"),
    search: lockReason(v, approved, "search"),
    managers: lockReason(v, approved, "managers"),
  } as Record<RingId, string | null>;

  // Guard: a switch that is locked can never be stored as on (for example a
  // save from before the page was un-approved).
  useEffect(() => {
    const patch: Partial<VisibilityState> = {};
    if (v.search && (!approved || !v.link)) patch.search = false;
    if (v.managers && !v.link) patch.managers = false;
    if (Object.keys(patch).length) f.update("visibility", patch);
  }, [v.search, v.managers, v.link, approved]);

  const apply = (patch: Partial<VisibilityState>, message: string) => {
    const next = { ...v, ...patch };
    // Going private or withdrawing the age confirmation switches off everything wider.
    if (!next.link || !next.adult) {
      next.search = false;
      next.managers = false;
    }
    f.update("visibility", next);
    setAnnounce(`${message} Who can open your page: ${reachSentence(next)}`);
  };

  const toggle = (id: RingId, on: boolean) => {
    const label = RINGS.find((r) => r.id === id)!.label;
    apply({ [id]: on }, `${label}: ${on ? "on" : "off"}.`);
  };

  const needsAge = v.link && !v.adult;

  useStepBar({
    label: v.link ? "Save and continue" : "Continue privately",
    disabled: needsAge,
    disabledHint: "Tick \"I am 18 or older\", or keep your page private.",
    hint: needsAge ? "A public link needs your 18+ confirmation." : `Visible to: ${reachShort(v)}. You can change this any time.`,
  });

  return (
    <div>
      <StepHeader
        title="Who can see your page"
        description="Link-only by default. Nothing goes wider unless you switch it on, and you can take it all offline in one tap."
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Rings */}
        <Card tone="white" shadow="lg" pad="sm" className="lg:col-start-1 lg:row-start-1">
          <Rings v={v} hot={hot} locked={{ link: false, search: Boolean(locks.search), managers: Boolean(locks.managers) }} />
          <div className="mt-2 rounded-xl border-2 border-studojo-ink bg-studojo-pink-bg px-3 py-2.5">
            <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-[#be185d]">Who can open your page now</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={reachSentence(v)}
                initial={{ opacity: 0, y: m.reduced ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="mt-0.5 font-satoshi text-base font-bold text-studojo-ink"
              >
                {reachSentence(v)}
              </motion.p>
            </AnimatePresence>
          </div>
        </Card>

        {/* Controls. On phones they come first: each switch lights its own mini ring. */}
        <motion.div
          variants={m.list}
          initial="hidden"
          animate="show"
          className="order-first space-y-4 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <motion.div variants={m.item}>
            <AdultCheck
              v={v}
              onChange={(adult) => apply({ adult }, adult ? "Confirmed: 18 or older." : "Age confirmation removed.")}
              onPrivate={() => apply({ link: false }, "Link off. Your page is private.")}
            />
          </motion.div>
          <motion.div variants={m.item}>
            <SwitchList v={v} locks={locks} onHot={setHot} onToggle={toggle} />
          </motion.div>
          <motion.div variants={m.item}>
            <PlainNotice />
          </motion.div>
        </motion.div>

        {/* Receipt */}
        <div className="lg:col-start-1 lg:row-start-2">
          <Receipt v={v} approved={approved} />
        </div>
      </div>

      <LiveRegion message={announce} />
    </div>
  );
}
