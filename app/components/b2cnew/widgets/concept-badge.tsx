// "Concept preview: nothing is sent". On every screen. Shared file: owned by the foundation.
import { FiEyeOff } from "react-icons/fi";
import { COPY } from "../config";
import { cx } from "../ui";

export function ConceptBadge({ short = false, className }: { short?: boolean; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-studojo-ink bg-studojo-purple-bg px-2.5 py-0.5 font-satoshi text-[11px] font-bold text-studojo-purple-strong",
        className,
      )}
    >
      <FiEyeOff aria-hidden />
      {short ? "Concept: nothing is sent" : COPY.concept}
    </span>
  );
}
