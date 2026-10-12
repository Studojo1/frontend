// The student's page as a rich link card, the way it sits inside the day 4
// follow-up. It carries layoutId "jernew-page-card", so it flies from the
// timeline's day 4 stop into the email body (shared layout). Owned by builder C.
import { motion } from "framer-motion";
import { FiCheckCircle, FiExternalLink } from "react-icons/fi";
import { PROFILE_DRAFT } from "../../data";
import { SPRING } from "../../motion";
import type { ProfileState } from "../../types";
import { cx } from "../../ui";

export const PAGE_CARD_LAYOUT_ID = "jernew-page-card";

const PROOF = ["1,200 students use Splitkart", "Food waste down 18%"];

export function PageCard({
  profile,
  compact = false,
  reduced,
  className,
}: {
  profile: ProfileState;
  compact?: boolean;
  reduced: boolean;
  className?: string;
}) {
  return (
    <motion.div
      layoutId={reduced ? undefined : PAGE_CARD_LAYOUT_ID}
      transition={SPRING}
      style={{ borderRadius: 16 }}
      className={cx("overflow-hidden border-2 border-studojo-ink bg-white shadow-[3px_3px_0_0_#191a23]", className)}
    >
      <motion.div layout="position" className="flex items-stretch">
        <span aria-hidden className="w-2 shrink-0 bg-studojo-pink" />
        <div className={cx("min-w-0 flex-1", compact ? "p-2.5" : "p-3 sm:p-4")}>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className={cx(
                "flex shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-pink-bg font-clash font-semibold text-studojo-ink",
                compact ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm",
              )}
            >
              {PROFILE_DRAFT.initials}
            </span>
            <div className="min-w-0">
              <p className={cx("flex flex-wrap items-center gap-x-1.5 font-clash font-semibold text-studojo-ink", compact ? "text-sm" : "text-base")}>
                {PROFILE_DRAFT.name}
                {profile.approved ? (
                  <span className="inline-flex items-center gap-1 font-satoshi text-[11px] font-bold text-[#047857]">
                    <FiCheckCircle aria-hidden /> Reviewed by you
                  </span>
                ) : null}
              </p>
              <p className="truncate font-satoshi text-xs text-studojo-muted">{PROFILE_DRAFT.meta}</p>
            </div>
          </div>
          {!compact ? (
            <>
              <p className="mt-2 font-satoshi text-sm font-medium leading-snug text-studojo-ink">{profile.headline || PROFILE_DRAFT.headline}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PROOF.map((p) => (
                  <span key={p} className="rounded-full border-2 border-studojo-ink bg-studojo-yellow-bg px-2 py-0.5 font-satoshi text-[11px] font-bold text-studojo-ink">
                    {p}
                  </span>
                ))}
              </div>
            </>
          ) : null}
          <p className="mt-2 flex items-center gap-1.5 font-satoshi text-xs font-bold text-[#be185d]">
            <FiExternalLink aria-hidden className="shrink-0" />
            <span className="truncate">{PROFILE_DRAFT.url}</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Dashed spot left behind on the timeline once the card has moved into the email. */
export function PageCardGhost() {
  return (
    <div className="flex min-h-[76px] items-center justify-center rounded-2xl border-2 border-dashed border-studojo-ink/35 bg-white/60 px-3 text-center font-satoshi text-sm text-studojo-muted">
      Your page is inside the follow-up now.
    </div>
  );
}
