// The person drawer (?p=<id>): the right half of the workspace on desktop, a
// full sheet on phones. Header, address, why them, thread, actions.
// Owned by Group 2.
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import { personById, personView, type PersonView } from "../core/derive";
import { useB2C, useViewport } from "../core/store";
import { fullName } from "../data";
import { SPRING_SOFT, useSafeReducedMotion } from "../motion";
import { Avatar, IconButton, Sheet, StagePill } from "../ui";
import { OutcomeStamp, PendingDraftCard, PersonActions } from "./person-actions";
import { AddressStatus, ThreadTimeline, WhyThem } from "./person-thread";

/** Ids of the rows in list order, so the drawer can step to the previous or next person. */
export function PersonDrawer({ order }: { order: string[] }) {
  const { s, dispatch } = useB2C();
  const vp = useViewport();
  const p = personById(s, s.selected);
  const v = p && p.missionId === s.env ? personView(s, p) : undefined;
  const close = () => dispatch({ type: "SELECT", id: null });
  if (vp === "phone") {
    return (
      <Sheet open={!!v} onClose={close} title={v ? fullName(v.p) : "Person"} description={v ? `${v.p.title}, ${v.p.company}` : undefined} size="lg">
        {v ? (
          <>
            <div className="-mt-1 mb-4 flex flex-wrap items-center gap-2">
              <StagePill stage={v.stage} />
              <span className="font-satoshi text-xs text-studojo-muted">
                {v.p.city} · {v.p.stageLabel}
              </span>
            </div>
            <DrawerBody v={v} />
          </>
        ) : null}
      </Sheet>
    );
  }
  return (
    <AnimatePresence>
      {v ? <DesktopDrawer key="drawer" v={v} order={order} onClose={close} /> : null}
    </AnimatePresence>
  );
}

function DesktopDrawer({ v, order, onClose }: { v: PersonView; order: string[]; onClose: () => void }) {
  const { dispatch } = useB2C();
  const reduced = useSafeReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<string | null>(null);
  const { p } = v;
  const i = order.indexOf(p.id);
  const step = (d: number) => {
    const next = order[i + d];
    if (next) dispatch({ type: "SELECT", id: next });
  };

  // Focus the heading when a person opens; give focus back to their row on close.
  useEffect(() => {
    opener.current = p.id;
    heading.current?.focus({ preventScroll: true });
  }, [p.id]);
  useEffect(
    () => () => {
      const id = opener.current;
      window.setTimeout(() => {
        const row = id ? document.querySelector<HTMLElement>(`[data-person-row="${id}"]`) : null;
        row?.focus({ preventScroll: true });
      }, 0);
    },
    [],
  );

  return (
    <motion.aside
      aria-label={`${fullName(p)}, details`}
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
      transition={reduced ? { duration: 0.18 } : SPRING_SOFT}
      className="sticky top-4 flex max-h-[calc(100dvh-14.5rem)] min-h-0 flex-col self-start overflow-hidden rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal-lg"
    >
      <div className="flex shrink-0 items-start gap-3 border-b-2 border-studojo-ink/10 p-4">
        <Avatar first={p.first} last={p.last} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 ref={heading} tabIndex={-1} className="font-clash text-xl font-semibold leading-tight outline-none">
            {fullName(p)}
          </h2>
          <p className="font-satoshi text-sm text-studojo-muted">
            {p.title}, <b className="text-studojo-ink">{p.company}</b>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <StagePill stage={v.stage} />
            <span className="font-satoshi text-xs text-studojo-muted">
              {p.city} · {p.stageLabel}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <IconButton label="Previous person" icon={<FiChevronUp />} size="sm" disabled={i <= 0} onClick={() => step(-1)} />
          <IconButton label="Next person" icon={<FiChevronDown />} size="sm" disabled={i < 0 || i >= order.length - 1} onClick={() => step(1)} />
          <IconButton label="Close details" icon={<FiX />} size="sm" onClick={onClose} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        <DrawerBody v={v} />
      </div>
    </motion.aside>
  );
}

function DrawerBody({ v }: { v: PersonView }) {
  return (
    <div className="space-y-5">
      <OutcomeStamp v={v} />
      <PendingDraftCard v={v} />
      <AddressStatus v={v} />
      <WhyThem v={v} />
      <ThreadTimeline v={v} />
      <PersonActions v={v} />
    </div>
  );
}
