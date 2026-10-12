// Pre-flight checklist for the launch step: each item ticks into place in
// turn. Each row can jump back to its step to change it. Owned by builder D.
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle, FiCheck } from "react-icons/fi";
import { DAILY_SEND_CAP, packById } from "../../data";
import { useFlow } from "../../flow";
import { SPRING_SNAP, useMotionPresets } from "../../motion";
import type { StepId } from "../../types";
import { cx, FOCUS_RING } from "../../ui";
import { pageIsPublic, sendsEmail, visibilitySummary } from "./shared";

export interface PreflightItem {
  id: string;
  label: string;
  detail: string;
  step: StepId | null;
}

export function usePreflightItems(): PreflightItem[] {
  const d = useFlow().data;
  const pack = packById(d.pack);
  const paid = sendsEmail(d.pack);
  const privateWithEmails = paid && !pageIsPublic(d.visibility);
  const items: PreflightItem[] = [
    { id: "page", label: "Page reviewed", detail: d.profile.approved ? "Reviewed by you" : "Not reviewed yet", step: "profile" },
    {
      id: "vis",
      label: "Visibility set",
      detail: privateWithEmails ? "Private: follow-ups go without your page" : visibilitySummary(d.visibility),
      step: "visibility",
    },
    {
      id: "pack",
      label: "Pack",
      detail: !pack ? "Not chosen" : paid ? `${pack.name}: ${pack.outreaches} emails, paid (mock)` : "Free: your page only",
      step: "pack",
    },
    { id: "gmail", label: "Gmail", detail: paid ? `Connected as ${d.gmail.address}` : "Not needed on Free", step: "connect" },
  ];
  if (paid) {
    items.push({
      id: "pace",
      label: "Send pace",
      detail: `Starts at ${DAILY_SEND_CAP[0]} a day and builds slowly. Simulated plan.`,
      step: null,
    });
  }
  return items;
}

export function Preflight({ items, ticked }: { items: PreflightItem[]; ticked: number }) {
  const f = useFlow();
  const m = useMotionPresets();
  const privateWithEmails = sendsEmail(f.data.pack) && !pageIsPublic(f.data.visibility);
  return (
    <div>
      <ol className="space-y-2.5" aria-label="Pre-flight checklist">
        {items.map((it, i) => {
          const done = i < ticked;
          return (
            <li key={it.id} className="flex items-center gap-3 rounded-xl border-2 border-studojo-ink bg-white px-3 py-2.5">
              <span
                aria-hidden
                className={cx(
                  "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-studojo-ink",
                  done ? "bg-studojo-green" : "bg-white",
                )}
              >
                <AnimatePresence initial={false}>
                  {done ? (
                    <motion.span
                      key="tick"
                      initial={m.reduced ? { opacity: 0 } : { scale: 0, rotate: -30 }}
                      animate={m.reduced ? { opacity: 1 } : { scale: 1, rotate: 0 }}
                      transition={m.reduced ? { duration: 0.12 } : SPRING_SNAP}
                    >
                      <FiCheck strokeWidth={4} />
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </span>
              <span className="min-w-0 flex-1 font-satoshi">
                <span className="block text-base font-bold leading-tight">{it.label}</span>
                <span className="block break-words text-sm text-studojo-muted">{it.detail}</span>
              </span>
              <span className="sr-only">{done ? "checked" : "checking"}</span>
              {it.step ? (
                <button
                  type="button"
                  onClick={() => it.step && f.goTo(it.step)}
                  className={cx(
                    "min-h-11 shrink-0 rounded-lg px-2 font-satoshi text-sm font-bold text-studojo-purple-strong underline-offset-4 hover:underline",
                    FOCUS_RING,
                  )}
                >
                  Change<span className="sr-only"> {it.label.toLowerCase()}</span>
                </button>
              ) : null}
            </li>
          );
        })}
      </ol>
      {privateWithEmails ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-yellow-bg px-3 py-2 font-satoshi text-sm">
          <FiAlertTriangle aria-hidden className="mt-0.5 shrink-0" />
          Your page is private, so the follow-ups will go without your page card. Turn the link on in Visibility to include it.
        </p>
      ) : null}
    </div>
  );
}
