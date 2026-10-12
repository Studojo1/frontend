// Sheet: a modal panel. Bottom sheet on phones (drag down to close), a
// right-hand drawer or a centred dialog on desktop. Traps focus, closes on
// Esc, returns focus to what opened it. Shared file: owned by the foundation.
import { useEffect, useId, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useViewport } from "./core/store";
import { sheetVariants, useSafeReducedMotion } from "./motion";
import { cx, FOCUS_RING } from "../jernew/ui-base";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** Visible title; also the dialog's accessible name. */
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Sticky footer (actions). */
  footer?: ReactNode;
  /** auto: bottom on phones, right on wider screens. */
  side?: "auto" | "bottom" | "right" | "center";
  /** Desktop width. full = the whole height on phones too (the agent sheet). */
  size?: "sm" | "md" | "lg" | "full";
  /**
   * No title row and no padding: the content draws its own header (with its
   * own close control) and scrolls itself. The title still names the dialog.
   */
  bare?: boolean;
  className?: string;
}

const WIDTH = { sm: "sm:w-[380px]", md: "sm:w-[440px]", lg: "sm:w-[560px]", full: "sm:w-[480px]" };
const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Open sheets, newest last. Only the top one handles Escape and Tab, and the
// page scroll lock is held until the last one closes (module scope: client only).
const stack: symbol[] = [];
let savedOverflow = "";
function pushSheet(key: symbol) {
  if (!stack.length) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  stack.push(key);
}
function popSheet(key: symbol) {
  const i = stack.indexOf(key);
  if (i >= 0) stack.splice(i, 1);
  if (!stack.length) document.body.style.overflow = savedOverflow;
}
const isTop = (key: symbol) => stack[stack.length - 1] === key;

/** Escape in a text field with something typed clears or cancels there first (the composer, editors). */
function typingWithText(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLTextAreaElement || t instanceof HTMLInputElement)) return false;
  return t.value.trim().length > 0 || !!t.closest("[data-escape-local]");
}

export function Sheet({ open, onClose, title, description, children, footer, side = "auto", size = "md", bare, className }: SheetProps) {
  const viewport = useViewport();
  const reduced = useSafeReducedMotion();
  const from = side === "auto" ? (viewport === "phone" ? "bottom" : "right") : side;
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const drag = useDragControls();
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    const key = Symbol("sheet");
    pushSheet(key);
    const t = window.setTimeout(() => {
      const el = panel.current;
      const first = el?.querySelector<HTMLElement>("[data-autofocus]") ?? el?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? el)?.focus({ preventScroll: true });
    }, 40);
    const onKey = (e: KeyboardEvent) => {
      if (!isTop(key)) return;
      if (e.key === "Escape") {
        if (typingWithText(e.target)) return;
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey, true);
      popSheet(key);
      const back = opener.current;
      if (back && document.contains(back)) window.setTimeout(() => back.focus({ preventScroll: true }), 0);
    };
  }, [open]);

  const pos =
    from === "bottom"
      ? cx(
          "absolute inset-x-0 bottom-0 flex flex-col rounded-t-3xl border-t-2",
          size === "full" ? "h-[calc(100dvh-1.5rem-var(--sj-notice-h,0px))]" : "max-h-[calc(90dvh-var(--sj-notice-h,0px))]",
        )
      : from === "right"
        ? cx("absolute inset-y-0 right-0 flex w-full flex-col border-l-2", WIDTH[size])
        : cx("relative m-auto flex max-h-[85dvh] w-[calc(100%-2rem)] flex-col rounded-2xl border-2 shadow-brutal-lg", WIDTH[size]);

  return (
    <AnimatePresence>
      {open ? (
        <div className={cx("fixed inset-0 z-50 flex", from === "center" && "items-center justify-center")}>
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-studojo-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-t`}
            aria-describedby={description ? `${id}-d` : undefined}
            tabIndex={-1}
            variants={sheetVariants(reduced, from)}
            initial="hidden"
            animate="show"
            exit="exit"
            drag={from === "bottom" && !reduced ? "y" : false}
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
            // A bottom sheet lifts above the cookie notice like other floating UI (app.css).
            data-floating-cta={from === "bottom" ? "" : undefined}
            className={cx("border-studojo-ink bg-white outline-none", pos, className)}
          >
            {from === "bottom" ? (
              <div
                className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-2.5"
                onPointerDown={(e) => drag.start(e)}
              >
                <span aria-hidden className="h-1.5 w-10 rounded-full bg-studojo-ink/25" />
              </div>
            ) : null}
            {bare ? (
              <h2 id={`${id}-t`} className="sr-only">
                {title}
              </h2>
            ) : (
              <div className={cx("flex shrink-0 items-start gap-3 border-b-2 border-studojo-ink/10 px-4 pb-3 sm:px-5", from !== "bottom" && "pt-4")}>
                <div className="min-w-0 flex-1">
                  <h2 id={`${id}-t`} className="font-clash text-xl font-semibold text-studojo-ink">
                    {title}
                  </h2>
                  {description ? (
                    <p id={`${id}-d`} className="mt-0.5 font-satoshi text-sm text-studojo-muted">
                      {description}
                    </p>
                  ) : null}
                </div>
                <CloseButton onClose={onClose} />
              </div>
            )}
            {bare ? (
              <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">{children}</div>
            )}
            {footer ? <div className="shrink-0 border-t-2 border-studojo-ink/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">{footer}</div> : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function CloseButton({ onClose, className }: { onClose: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className={cx("-mr-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg hover:bg-studojo-surface-muted", FOCUS_RING, className)}
    >
      <FiX aria-hidden />
    </button>
  );
}
