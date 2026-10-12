// The panel header: the thread title (a list of recent chats on the main
// thread, a plain disclosure), "+" for a new chat, and close. No persona name.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FiChevronDown, FiChevronsLeft, FiPlus, FiX } from "react-icons/fi";
import { stripDashes } from "~/lib/strip-dashes";
import { cx, FOCUS_RING, Spinner } from "./bits";
import { isBusy, serverDate } from "./live";
import { newChat, openThread } from "./runner";
import { MAIN, setOpen, useAgentStore } from "./store";
import { useSlot } from "./use-agent";
import { SHOW_AGENT_ID } from "../shell/top-bar";

function IconButton({ label, onClick, children, disabled }: { label: string; onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-transparent text-lg text-studojo-ink hover:border-studojo-ink hover:bg-studojo-surface-muted disabled:opacity-40",
        FOCUS_RING,
      )}
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}

function when(iso: string): string {
  const d = serverDate(iso);
  if (!d) return "";
  const same = new Date().toDateString() === d.toDateString();
  return same ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : d.toLocaleDateString([], { day: "numeric", month: "short" });
}

/**
 * Hide the panel. On desktop the panel (and this button) unmounts, so focus
 * goes to the top bar's "Show assistant", which appears in its place. The
 * phone sheet hands focus back to the Ask button itself.
 */
function hide(variant: "panel" | "sheet") {
  setOpen(false);
  if (variant !== "panel") return;
  let tries = 10;
  const step = () => {
    const el = document.getElementById(SHOW_AGENT_ID);
    if (el) el.focus({ preventScroll: true });
    else if (--tries > 0) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

export function PanelHeader({ scope, variant }: { scope: string; variant: "panel" | "sheet" }) {
  const slot = useSlot(scope);
  const threads = useAgentStore((s) => s.mainThreads);
  const [menu, setMenu] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const busy = isBusy(slot.live);
  const main = scope === MAIN;
  // Titles start as the first prompt; one trailing full stop reads oddly in a header.
  const title = stripDashes(slot.thread?.title || (main ? "New chat" : "This email")).replace(/(?<!\.)\.$/, "");

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const run = async (fn: () => Promise<string | null>) => {
    setMenu(false);
    setWorking(true);
    setNote(await fn());
    setWorking(false);
  };

  return (
    <div className="shrink-0 border-b-2 border-studojo-ink">
      <div className="flex items-center gap-1 px-2 py-1.5">
        <div ref={box} className="relative min-w-0 flex-1">
          {main && threads.length > 1 ? (
            <button
              type="button"
              aria-expanded={menu}
              aria-controls="desk-recent-chats"
              onClick={() => setMenu(!menu)}
              disabled={busy}
              className={cx("flex min-h-10 max-w-full items-center gap-1 rounded-lg px-2 text-left disabled:opacity-60", FOCUS_RING)}
            >
              <span className="truncate font-clash text-lg font-semibold text-studojo-ink">{title}</span>
              <FiChevronDown aria-hidden className={cx("shrink-0 text-studojo-muted transition-transform", menu && "rotate-180")} />
            </button>
          ) : (
            <p className="truncate px-2 font-clash text-lg font-semibold text-studojo-ink">{title}</p>
          )}
          {menu ? (
            <ul id="desk-recent-chats" aria-label="Recent chats" className="absolute left-0 top-full z-30 mt-1 max-h-80 w-72 max-w-[85vw] overflow-y-auto rounded-xl border-2 border-studojo-ink bg-white p-1 shadow-[3px_3px_0_0_#191a23]">
              {threads.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-current={t.id === slot.thread?.id ? "true" : undefined}
                    onClick={() => void run(() => openThread(t.id))}
                    className={cx(
                      "flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left font-satoshi text-sm hover:bg-studojo-purple-bg",
                      t.id === slot.thread?.id && "bg-studojo-surface-muted font-bold",
                      FOCUS_RING,
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-studojo-ink">{stripDashes(t.title || "New chat")}</span>
                    <span className="shrink-0 text-xs text-studojo-muted">{when(t.updated_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {working ? <Spinner className="mx-2" /> : null}
        {main ? (
          <IconButton label="New chat" onClick={() => void run(newChat)} disabled={busy || working}>
            <FiPlus />
          </IconButton>
        ) : null}
        <IconButton label={variant === "sheet" ? "Close" : "Hide assistant"} onClick={() => hide(variant)}>
          {variant === "sheet" ? <FiX /> : <FiChevronsLeft />}
        </IconButton>
      </div>
      {note ? (
        <p role="alert" className="px-3 pb-1.5 font-satoshi text-xs font-bold text-[#be185d]">
          {note}
        </p>
      ) : null}
    </div>
  );
}
