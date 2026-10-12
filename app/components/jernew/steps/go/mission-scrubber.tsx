// Mission control's time scrubber: Day 0 to Day 14, with reply markers on
// the days a simulated reply lands. A native range input (keyboard and screen
// readers work as usual) over a drawn track, plus Play. Owned by builder D.
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiPause, FiPlay } from "react-icons/fi";
import { MISSION_DAYS, type ReplyTag } from "../../data";
import { SPRING, useSafeReducedMotion } from "../../motion";
import { Button, cx, RANGE_THUMB } from "../../ui";

const MARK: Record<ReplyTag, string> = {
  Positive: "bg-studojo-green",
  Question: "bg-studojo-purple",
  "Not now": "bg-studojo-surface-muted",
};

export interface ScrubberProps {
  day: number;
  onChange: (day: number) => void;
  /** Reply markers: which day, and its tag colour. */
  marks: { day: number; tag: ReplyTag; id: string }[];
  /** Day the follow-ups start (shown on the track). */
  followDay?: number;
  /** Play Day 0 to the end once on arrival (about 6s). Any touch on the scrubber stops it. */
  autoPlay?: boolean;
}

const STEP_MS = 750;
const AUTO_STEP_MS = 430;

export function Scrubber({ day, onChange, marks, followDay = 4, autoPlay = false }: ScrubberProps) {
  const id = useId();
  const reduced = useSafeReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [auto, setAuto] = useState(false);
  const dayRef = useRef(day);
  const changeRef = useRef(onChange);
  useEffect(() => {
    dayRef.current = day;
    changeRef.current = onChange;
  });

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      const next = dayRef.current + 1;
      if (next > MISSION_DAYS) {
        setPlaying(false);
        return;
      }
      changeRef.current(next);
      if (next === MISSION_DAYS) setPlaying(false);
    }, auto ? AUTO_STEP_MS : STEP_MS);
    return () => window.clearInterval(t);
  }, [playing, auto]);

  // The first visit plays the two weeks once, so the screen shows what the scrubber does.
  useEffect(() => {
    if (!autoPlay || reduced || dayRef.current !== 0) return;
    const t = window.setTimeout(() => {
      setAuto(true);
      setPlaying(true);
    }, 700);
    return () => window.clearTimeout(t);
  }, [autoPlay, reduced]);

  const stopAuto = () => {
    if (!auto) return;
    setAuto(false);
    setPlaying(false);
  };

  const togglePlay = () => {
    setAuto(false);
    if (playing) return setPlaying(false);
    if (dayRef.current >= MISSION_DAYS) onChange(0);
    setPlaying(true);
  };

  const pct = (d: number) => `calc(18px + (100% - 36px) * ${d / MISSION_DAYS})`;

  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4" onPointerDown={stopAuto}>
      <div className="flex items-center gap-3 md:w-40 md:flex-col md:items-start md:gap-1">
        <div className="flex min-w-0 items-baseline gap-2 whitespace-nowrap md:flex-col md:gap-1">
          <label htmlFor={id} className="font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">
            Time scrubber
          </label>
          <p className="font-clash text-2xl font-semibold leading-none tabular-nums md:text-3xl" aria-hidden>
            Day {day}
          </p>
        </div>
        <span className="ml-auto shrink-0 md:ml-0">
          <Button variant="secondary" size="sm" onClick={togglePlay} icon={playing ? <FiPause /> : <FiPlay />} aria-pressed={playing} className="whitespace-nowrap">
            {playing ? "Pause" : day >= MISSION_DAYS ? "Replay" : "Play"}
          </Button>
        </span>
      </div>

      <div className="relative min-w-0 flex-1 pt-5">
        {/* Reply markers above the track */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-4">
          {marks.map((mk) => (
            <span
              key={mk.id}
              title={`Reply on day ${mk.day}`}
              className={cx(
                "absolute top-0 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[3px] border-2 border-studojo-ink",
                MARK[mk.tag],
                mk.day > day && "opacity-35",
              )}
              style={{ left: pct(mk.day) }}
            />
          ))}
          <span
            className="absolute top-0 -translate-x-1/2 rounded-full border-2 border-studojo-ink bg-studojo-yellow-bg px-1.5 font-satoshi text-[10px] font-bold leading-[14px]"
            style={{ left: pct(followDay) }}
          >
            F
          </span>
        </div>

        {/* Drawn track */}
        <div aria-hidden className="pointer-events-none absolute inset-x-[18px] top-[calc(1.25rem+16px)] h-3 overflow-hidden rounded-full border-2 border-studojo-ink bg-white">
          <motion.span
            className="absolute inset-0 origin-left bg-studojo-green"
            initial={false}
            animate={{ scaleX: day / MISSION_DAYS }}
            transition={SPRING}
          />
        </div>

        <input
          id={id}
          type="range"
          min={0}
          max={MISSION_DAYS}
          step={1}
          value={day}
          data-no-enter
          aria-valuetext={`Day ${day} of ${MISSION_DAYS}`}
          onChange={(e) => {
            setAuto(false);
            setPlaying(false);
            onChange(Number(e.target.value));
          }}
          className={cx(
            "relative block h-11 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none",
            "[&:focus-visible::-webkit-slider-thumb]:ring-4 [&:focus-visible::-webkit-slider-thumb]:ring-studojo-purple/50",
            RANGE_THUMB,
          )}
        />

        {/* Day ticks */}
        <div aria-hidden className="relative mt-0.5 h-4">
          {Array.from({ length: MISSION_DAYS + 1 }, (_, d) => (
            <span
              key={d}
              className={cx(
                "absolute -translate-x-1/2 font-satoshi text-[10px] font-bold tabular-nums",
                d === day ? "text-studojo-ink" : "text-studojo-muted",
                d % 2 === 1 && "hidden sm:block",
              )}
              style={{ left: pct(d) }}
            >
              {d}
            </span>
          ))}
        </div>
        <p className="mt-2 hidden flex-wrap gap-x-4 gap-y-1 font-satoshi text-xs text-studojo-muted md:flex">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rotate-45 rounded-[2px] border-2 border-studojo-ink bg-studojo-green" /> Reply
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="rounded-full border-2 border-studojo-ink bg-studojo-yellow-bg px-1 text-[9px] font-bold leading-3">F</span> Follow-ups start
          </span>
        </p>
      </div>
    </div>
  );
}
