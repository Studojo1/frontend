// Quiz card 2: cities as pin chips on a board, plus Remote. A pin drops on
// each city you pick and a dashed line runs to it from home. Owned by builder A (You).
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiHome, FiMapPin, FiWifi } from "react-icons/fi";
import { CITIES, cityLabel, STUDENT } from "../../data";
import { SPRING_SNAP } from "../../motion";
import type { CityId } from "../../types";
import { Chip, cx, FOCUS_RING, PRESS } from "../../ui";
import { useNumberKeys, type QuizCardProps } from "./quiz-keys";

/**
 * Board positions in percent: [x, y] on the tall phone board, then on the
 * wide board. Stylised, not a map: just roughly where each city sits.
 */
const SPOT: Record<CityId, { x: number; y: number; wx: number; wy: number }> = {
  delhi: { x: 34, y: 14, wx: 42, wy: 18 },
  kolkata: { x: 78, y: 32, wx: 78, wy: 36 },
  mumbai: { x: 17, y: 44, wx: 12, wy: 44 },
  hyderabad: { x: 62, y: 52, wx: 52, wy: 54 },
  pune: { x: 27, y: 61, wx: 24, wy: 68 },
  chennai: { x: 73, y: 80, wx: 68, wy: 82 },
  bengaluru: { x: 36, y: 89, wx: 40, wy: 86 },
};

const HOME: CityId = "pune";

export function WherePins({ q, set, reduced, active }: QuizCardProps) {
  const toggle = (id: CityId) => {
    const has = q.cities.includes(id);
    set({ cities: has ? q.cities.filter((c) => c !== id) : [...q.cities, id] });
  };

  useNumberKeys(active, (n) => {
    if (n <= CITIES.length) toggle(CITIES[n - 1].id);
    else if (n === CITIES.length + 1) set({ remote: !q.remote });
  });

  // Spokes from home to every other city you pick.
  const spokes = CITIES.filter((c) => c.id !== HOME && q.cities.includes(c.id));
  const home = SPOT[HOME];
  const picked = [...q.cities.map(cityLabel), ...(q.remote ? ["Remote"] : [])];

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg sm:aspect-[16/9]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(109,40,217,0.18) 1px, transparent 1.4px)",
          backgroundSize: "18px 18px",
        }}
      >
        {([false, true] as const).map((wide) => (
          <svg
            key={String(wide)}
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className={cx(
              "absolute inset-0 h-full w-full",
              wide ? "hidden sm:block" : "sm:hidden",
            )}
          >
            <AnimatePresence>
              {spokes.map((c) => (
                <motion.line
                  key={c.id}
                  x1={wide ? home.wx : home.x}
                  y1={wide ? home.wy : home.y}
                  x2={wide ? SPOT[c.id].wx : SPOT[c.id].x}
                  y2={wide ? SPOT[c.id].wy : SPOT[c.id].y}
                  stroke="#6d28d9"
                  strokeWidth="0.6"
                  strokeDasharray="1.6 1.4"
                  vectorEffect="non-scaling-stroke"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              ))}
            </AnimatePresence>
          </svg>
        ))}
        <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
          <Chip
            selected={q.remote}
            onClick={() => set({ remote: !q.remote })}
            icon={<FiWifi />}
            kbd={String(CITIES.length + 1)}
            aria-label={`Remote, anywhere in India (${CITIES.length + 1})`}
          >
            Remote
          </Chip>
        </div>

        <div role="group" aria-label="Cities">
          {CITIES.map((c, i) => {
            const on = q.cities.includes(c.id);
            const s = SPOT[c.id];
            return (
              <div
                key={c.id}
                className="absolute left-(--x) top-(--y) -translate-x-1/2 -translate-y-1/2 sm:left-(--wx) sm:top-(--wy)"
                style={
                  {
                    "--x": `${s.x}%`,
                    "--y": `${s.y}%`,
                    "--wx": `${s.wx}%`,
                    "--wy": `${s.wy}%`,
                  } as CSSProperties
                }
              >
                <AnimatePresence>
                  {on ? (
                    <motion.span
                      key="pin"
                      aria-hidden
                      className="absolute -top-7 left-1/2 -ml-3 text-studojo-purple-strong"
                      initial={
                        reduced
                          ? { opacity: 0 }
                          : { opacity: 0, y: -18, scale: 0.6 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={SPRING_SNAP}
                    >
                      <PinGlyph />
                    </motion.span>
                  ) : null}
                </AnimatePresence>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`${c.label}${c.id === HOME ? ", your city" : ""} (${i + 1})`}
                  onClick={() => toggle(c.id)}
                  className={cx(
                    "inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-studojo-ink px-3 font-satoshi text-sm font-bold",
                    PRESS,
                    FOCUS_RING,
                    on
                      ? "bg-studojo-ink text-white shadow-[2px_2px_0_0_#8b5cf6]"
                      : "bg-white text-studojo-ink shadow-[2px_2px_0_0_#191a23] hover:bg-studojo-purple-bg",
                  )}
                >
                  <span aria-hidden>
                    {c.id === HOME ? <FiHome /> : <FiMapPin />}
                  </span>
                  {c.label}
                  <span
                    aria-hidden
                    className={cx(
                      "hidden text-[10px] [@media(hover:hover)_and_(pointer:fine)]:inline",
                      on ? "text-white/70" : "text-studojo-muted",
                    )}
                  >
                    {i + 1}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p
          className="min-w-0 font-satoshi text-sm text-studojo-muted"
          aria-live="polite"
        >
          {picked.length === 0 ? (
            `${STUDENT.city} is home. Pick as many as you like.`
          ) : (
            <>
              <span className="font-bold text-studojo-ink">
                {picked.length} picked:
              </span>{" "}
              {joinList(picked)}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function PinGlyph() {
  return (
    <svg viewBox="0 0 24 28" className="h-7 w-6">
      <path
        d="M12 26s9-8.6 9-15a9 9 0 1 0-18 0c0 6.4 9 15 9 15z"
        fill="#8b5cf6"
        stroke="#171717"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="11"
        r="3.2"
        fill="#fff"
        stroke="#171717"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
