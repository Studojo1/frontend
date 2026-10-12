// Mission control's reply feed. New simulated replies slide in as toasts
// (announced politely), with "Reply from Gmail" and "Mark as read". Senders
// are fictional. Owned by builder D.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiCornerUpLeft, FiInbox } from "react-icons/fi";
import { REPLY_TAG_STYLE, type SimReply } from "../../data";
import { SPRING, useMotionPresets } from "../../motion";
import { Badge, Button, Card, cx, LiveRegion } from "../../ui";
import { matchById } from "./shared";

export interface RepliesProps {
  replies: SimReply[];
  seen: string[];
  onSeen: (id: string) => void;
  /** Called with the newest reply each time new ones arrive (phones float it as a toast). */
  onArrive?: (r: SimReply, more: number) => void;
}

export function Replies({ replies, seen, onSeen, onArrive }: RepliesProps) {
  const m = useMotionPresets();
  const [say, setSay] = useState("");
  const [opened, setOpened] = useState<string | null>(null);
  const prev = useRef<string[]>(replies.map((r) => r.id));
  const onArriveRef = useRef(onArrive);
  useEffect(() => {
    onArriveRef.current = onArrive;
  });
  const newest = [...replies].reverse();
  const unseen = replies.filter((r) => !seen.includes(r.id)).length;

  // Announce replies that just arrived (scrubbing forward), newest first.
  useEffect(() => {
    const before = new Set(prev.current);
    const arrived = replies.filter((r) => !before.has(r.id));
    prev.current = replies.map((r) => r.id);
    if (!arrived.length) return;
    const r = arrived[arrived.length - 1];
    const who = matchById(r.matchId);
    const more = arrived.length > 1 ? ` and ${arrived.length - 1} more` : "";
    onArriveRef.current?.(r, arrived.length - 1);
    setSay(`Simulated reply from ${who?.manager.first ?? "a hiring manager"} at ${who?.company ?? "a company"}, tagged ${r.tag}${more}.`);
  }, [replies]);

  return (
    <Card shadow="md" className="flex flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 font-clash text-xl font-semibold">
          <FiInbox aria-hidden /> Replies
        </h2>
        {unseen ? (
          <span className="rounded-full border-2 border-studojo-ink bg-studojo-pink px-2 font-satoshi text-xs font-bold text-studojo-ink">
            {unseen} new
          </span>
        ) : null}
        <span className="ml-auto">
          <Badge kind="simulated" />
        </span>
      </div>

      {replies.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-studojo-ink/40 p-4 font-satoshi text-sm text-studojo-muted">
          Nothing yet. Drag the scrubber forward to see how replies would show up here. Replies are not guaranteed.
        </p>
      ) : null}

      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {newest.map((r) => {
            const who = matchById(r.matchId);
            const isNew = !seen.includes(r.id);
            return (
              <motion.li
                key={r.id}
                layout={!m.reduced}
                initial={m.reduced ? { opacity: 0 } : { opacity: 0, x: 48, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={m.reduced ? { opacity: 0 } : { opacity: 0, x: 48 }}
                transition={m.reduced ? { duration: 0.15 } : SPRING}
                className={cx(
                  "rounded-xl border-2 border-studojo-ink p-3 font-satoshi",
                  isNew ? "bg-studojo-pink-bg shadow-brutal" : "bg-white",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-yellow-bg text-sm font-bold">
                    {who?.manager.first[0] ?? "?"}
                  </span>
                  <span className="min-w-0 flex-1 text-sm leading-tight">
                    <span className="block font-bold">
                      {who?.manager.first}, {who?.manager.title}
                    </span>
                    <span className="block text-studojo-muted">
                      {who?.company} · Day {r.day}
                    </span>
                  </span>
                  <span className={cx("rounded-full border-2 border-studojo-ink px-2 text-xs font-bold", REPLY_TAG_STYLE[r.tag])}>{r.tag}</span>
                  {isNew ? <span className="rounded-full bg-studojo-ink px-2 text-[10px] font-bold uppercase text-white">New</span> : null}
                </div>
                <p className={cx("mt-2 text-base leading-snug", !isNew && opened !== r.id && "line-clamp-2 text-studojo-muted")}>&ldquo;{r.text}&rdquo;</p>
                <div className={cx("flex flex-wrap items-center gap-2", isNew ? "mt-3" : "mt-1")}>
                  <Button
                    size="sm"
                    variant={isNew ? "secondary" : "ghost"}
                    icon={<FiCornerUpLeft />}
                    onClick={() => {
                      onSeen(r.id);
                      setOpened(r.id);
                    }}
                  >
                    Reply from Gmail
                  </Button>
                  {isNew ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<FiCheck />}
                      onClick={(e) => {
                        // This button goes away: keep focus on the reply's first action.
                        const first = e.currentTarget.parentElement?.querySelector("button");
                        onSeen(r.id);
                        requestAnimationFrame(() => first?.focus());
                      }}
                    >
                      Mark as read
                    </Button>
                  ) : null}
                </div>
                {opened === r.id ? (
                  <p className="mt-2 text-sm text-studojo-muted">In the real product this opens the thread in your Gmail. Here nothing opens.</p>
                ) : null}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <LiveRegion message={say} />
    </Card>
  );
}
