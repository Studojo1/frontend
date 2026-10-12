// Tiny style helpers shared by ui.tsx and ui-controls.tsx. Re-exported from ui.tsx.
// Shared file: owned by the foundation.

/** Join class names, skipping falsy ones. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Focus ring shared by every interactive primitive. */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-studojo-purple/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/** The press: shadow collapses as the element moves 2px into it. */
export const PRESS =
  "transition-[transform,box-shadow] duration-150 ease-out active:translate-x-[2px] active:translate-y-[2px]";

/** Big round thumb for native range inputs (quiz stage slider, mission scrubber). */
export const RANGE_THUMB =
  "[&::-webkit-slider-thumb]:h-9 [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-studojo-ink [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[2px_2px_0_0_#191a23] [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-studojo-ink [&::-moz-range-thumb]:bg-white [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent";

/** Show only on devices with a mouse or trackpad (keyboard hints, key badges). */
export const POINTER_FINE = "hidden [@media(hover:hover)_and_(pointer:fine)]:inline";
