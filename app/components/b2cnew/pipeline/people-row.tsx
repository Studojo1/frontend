// One person in the People list: 64px two-line rows in a narrow container
// (phones, or the list beside an open drawer), 44px single-line rows in a wide
// one. The whole row opens the drawer; Ask Senpai sits on top of it.
// Owned by Group 2.
import { motion } from "framer-motion";
import { FiEye, FiMessageCircle, FiUsers } from "react-icons/fi";
import type { PersonView } from "../core/derive";
import { chipFor, useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { formatCount } from "../data";
import { useSafeReducedMotion } from "../motion";
import { Avatar, cx, IconButton } from "../ui";

export type RowGlow = "scanning" | "landed" | null;

export function PersonRow({ v, glow, selected }: { v: PersonView; glow: RowGlow; selected: boolean }) {
  const { dispatch } = useB2C();
  const agent = useAgent();
  const reduced = useSafeReducedMotion();
  const { p } = v;
  const name = `${p.first} ${p.last}`;
  return (
    <motion.li
      layout={reduced ? false : "position"}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className={cx(
        "group relative flex min-h-16 items-center gap-3 rounded-xl px-2.5 py-2 @2xl:min-h-12 @2xl:py-1",
        "has-[[data-row-main]:focus-visible]:ring-4 has-[[data-row-main]:focus-visible]:ring-studojo-purple/40",
        selected ? "bg-studojo-purple-bg" : glow ? "bg-studojo-purple-bg/70" : "hover:bg-studojo-surface-muted",
      )}
    >
      {selected ? <span aria-hidden className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-studojo-ink" /> : null}
      {glow === "scanning" ? (
        <motion.span
          aria-hidden
          className="absolute inset-y-1 left-0 w-1 rounded-full bg-studojo-purple"
          initial={{ opacity: 0.4 }}
          animate={reduced ? { opacity: 1 } : { opacity: [0.35, 1, 0.35] }}
          transition={reduced ? { duration: 0.18 } : { duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      {glow === "landed" ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          initial={{ boxShadow: "0 0 0 3px rgba(139,92,246,0.85)", opacity: 1 }}
          animate={{ boxShadow: "0 0 0 10px rgba(139,92,246,0)", opacity: reduced ? 0 : 1 }}
          transition={{ duration: reduced ? 1.6 : 1.4, ease: "easeOut" }}
        />
      ) : null}
      <Avatar first={p.first} last={p.last} size="sm" />
      {/* The group header names the stage, so the row spends its room on who they are and what is next. */}
      <div className="min-w-0 flex-1 @2xl:flex @2xl:items-center @2xl:gap-3">
        <button
          type="button"
          data-row-main
          data-person-row={p.id}
          aria-current={selected || undefined}
          aria-label={`${name}, ${p.title} at ${p.company}. ${v.lastTouch}.${v.next ? ` Next: ${v.next}.` : ""}${v.pageOpened ? " Opened your page." : ""}`}
          onClick={() => dispatch({ type: "SELECT", id: selected ? null : p.id })}
          className="block w-full min-w-0 text-left font-satoshi outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] @2xl:w-[34%] @2xl:shrink-0"
        >
          <span className="block truncate text-[15px] font-bold leading-snug text-studojo-ink @2xl:text-sm">{name}</span>
          <span className="block truncate text-sm leading-snug text-studojo-muted @2xl:text-xs">
            {p.title}, {p.company}
          </span>
        </button>
        <p className={cx("truncate font-satoshi text-xs @2xl:hidden", v.next ? "font-bold text-studojo-ink" : "text-studojo-muted")}>{v.next || v.lastTouch}</p>
        <p className="hidden min-w-0 truncate font-satoshi text-sm text-studojo-ink @2xl:block @2xl:w-[22%] @2xl:shrink-0">
          {p.city}
        </p>
        <p className="hidden min-w-0 flex-1 truncate font-satoshi text-xs text-studojo-muted @2xl:block">{v.lastTouch}</p>
        <p className="hidden min-w-0 flex-1 truncate font-satoshi text-xs font-bold text-studojo-ink @2xl:block">{v.next || "Nothing to do"}</p>
      </div>
      <span className="w-11 shrink-0 text-right font-satoshi text-xs tabular-nums text-studojo-muted @2xl:w-12" title="Fit score (Sample)">
        Fit <b className="text-studojo-ink">{p.fit}</b>
      </span>
      <span className="flex w-5 shrink-0 justify-center" title={v.pageOpened ? "Opened your page" : undefined}>
        {v.pageOpened ? <FiEye aria-hidden className="text-studojo-purple-strong" /> : null}
      </span>
      <IconButton
        label={`Ask Senpai about ${p.first}`}
        icon={<FiMessageCircle />}
        size="sm"
        className="relative z-10 -mr-1 h-11 w-11"
        onClick={() => agent.open({ attach: chipFor.person(p) })}
      />
    </motion.li>
  );
}

/** "+ 157 more already contacted (Sample)": the people without a named row here. */
export function MoreRow({ n }: { n: number }) {
  return (
    <li className="flex min-h-12 items-center gap-3 rounded-xl border-2 border-dashed border-studojo-ink/25 px-2.5 py-2 font-satoshi text-sm text-studojo-muted">
      <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-studojo-ink/40">
        <FiUsers />
      </span>
      <span className="min-w-0 flex-1">
        <b className="text-studojo-ink">+ {formatCount(n)} more</b> already contacted. Follow-ups run on schedule. <span className="font-bold text-[#854d0e]">(Sample)</span>
      </span>
    </li>
  );
}
