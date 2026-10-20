// Bar, line and pie charts as inline SVG, drawn to scale from the block's own
// numbers (geometry in ./chart-scale.ts). Bar and line charts are laid out
// twice, once for a phone and once for wider screens, so their labels stay
// readable at both sizes; CSS shows one. Screen readers get the numbers as a
// table instead of the drawing.
import { layoutBars, layoutLines, layoutPie, type Size } from "./chart-scale";
import { fmt, type BlockView } from "./view";

type ChartBlock = Extract<BlockView, { type: "chart" }>;

const NARROW: Size = { W: 340, H: 250, f: 11 };
const WIDE: Size = { W: 720, H: 300, f: 12 };

/** Series and slice colours: six per theme, then the same six lighter. */
const colour = (i: number) => `var(--pp-s${(i % 6) + 1})`;
const fade = (i: number) => (i < 6 ? 1 : i < 12 ? 0.6 : i < 18 ? 0.38 : 0.22);

function Axes({ L, f }: { L: ReturnType<typeof layoutBars> | ReturnType<typeof layoutLines>; f: number }) {
  const { W, H } = L.size;
  const labelY = H - L.bottom + f + 6;
  return (
    <>
      {L.ticks.map((t) => (
        <g key={t.v}>
          <line x1={L.left} x2={W - L.right} y1={t.y} y2={t.y} style={{ stroke: t.v === 0 ? "var(--pp-ink)" : "var(--pp-line)" }} strokeWidth={t.v === 0 ? 1.25 : 1} />
          <text x={L.left - 8} y={t.y} dy="0.34em" textAnchor="end" fontSize={f} style={{ fill: "var(--pp-muted)" }}>
            {t.label}
          </text>
        </g>
      ))}
      {L.x.map((x, i) =>
        L.rotate ? (
          <text key={i} x={x.x} y={labelY - 4} fontSize={f} textAnchor="end" transform={`rotate(-40 ${x.x} ${labelY - 4})`} style={{ fill: "var(--pp-muted)" }}>
            {x.text}
          </text>
        ) : (
          <text key={i} x={x.x} y={labelY} fontSize={f} textAnchor="middle" style={{ fill: "var(--pp-muted)" }}>
            {x.text}
          </text>
        ),
      )}
    </>
  );
}

function BarSvg({ b, size, className }: { b: ChartBlock; size: Size; className: string }) {
  const L = layoutBars(b.labels, b.series, b.unit, size);
  const vf = size.f * 0.92;
  return (
    <svg viewBox={`0 0 ${size.W} ${size.H}`} className={className} aria-hidden="true" focusable="false">
      <Axes L={L} f={size.f} />
      {L.bars.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={Math.max(r.h, 0.5)} rx={Math.min(2, r.w / 4)} style={{ fill: colour(r.series) }} />
      ))}
      <line x1={L.left} x2={size.W - L.right} y1={L.zeroY} y2={L.zeroY} style={{ stroke: "var(--pp-ink)" }} strokeWidth={1.25} />
      {L.bars
        .filter((r) => r.showText)
        .map((r, i) => (
          <text key={i} x={r.x + r.w / 2} y={r.textY} fontSize={vf} fontWeight={700} textAnchor="middle" style={{ fill: "var(--pp-ink)" }}>
            {r.text}
          </text>
        ))}
    </svg>
  );
}

function LineSvg({ b, size, className }: { b: ChartBlock; size: Size; className: string }) {
  const L = layoutLines(b.labels, b.series, b.unit, size);
  return (
    <svg viewBox={`0 0 ${size.W} ${size.H}`} className={className} aria-hidden="true" focusable="false">
      <Axes L={L} f={size.f} />
      {L.lines.map((l) => (
        <g key={l.series} style={{ color: colour(l.series) }}>
          <path d={l.d} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {l.points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3.6} fill="currentColor" style={{ stroke: "var(--pp-surface)" }} strokeWidth={1.5} />
          ))}
          {l.end && (
            <text x={l.end.x} y={l.endY} fontSize={size.f * 0.92} fontWeight={700} textAnchor="middle" fill="currentColor">
              {l.end.text}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function Pie({ b }: { b: ChartBlock }) {
  const s = b.series[0];
  const slices = layoutPie(b.labels, s.values, s.shown, b.unit);
  const showShare = b.unit !== "pct";
  return (
    <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
      <svg viewBox="0 0 200 200" className="block h-auto w-full max-w-[210px] flex-none" aria-hidden="true" focusable="false">
        {slices.map((sl, i) => (
          <path key={i} d={sl.d} style={{ fill: sl.rest ? "var(--pp-line)" : colour(sl.index), opacity: sl.rest ? 1 : fade(sl.index), stroke: "var(--pp-surface)" }} strokeWidth={1.5} />
        ))}
      </svg>
      <ul className="w-full min-w-0 text-[15px]" aria-hidden="true">
        {slices.map((sl, i) => (
          <li key={i} className="flex items-center gap-3 border-b border-(--pp-line) py-2.5 last:border-b-0">
            <span className="h-3 w-3 flex-none rounded-[3px]" style={{ background: sl.rest ? "var(--pp-line)" : colour(sl.index), opacity: sl.rest ? 1 : fade(sl.index) }} />
            <span className={`min-w-0 flex-1 ${sl.rest ? "text-(--pp-muted)" : ""}`}>{sl.label}</span>
            <span className="pp-data font-bold">{sl.text}</span>
            {showShare && <span className="pp-data w-14 text-right text-(--pp-muted)">{fmt(sl.share * 100, "pct")}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Chart({ b }: { b: ChartBlock }) {
  const legend = b.kind !== "pie" && b.series.length > 1;
  return (
    <figure className="min-w-0 rounded-2xl border border-(--pp-line) bg-(--pp-surface) px-4 py-5 sm:px-7 sm:py-6">
      {(b.title || legend) && (
        <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          {b.title && <span className="pp-head text-[19px] font-semibold leading-tight sm:text-[21px]">{b.title}</span>}
          {legend && (
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-(--pp-muted)" aria-hidden="true">
              {b.series.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <span className={`inline-block flex-none ${b.kind === "line" ? "h-[3px] w-3.5 rounded-full" : "h-2.5 w-2.5 rounded-[2px]"}`} style={{ background: colour(i) }} />
                  {s.name}
                </span>
              ))}
            </span>
          )}
        </figcaption>
      )}
      {b.kind === "pie" ? (
        <Pie b={b} />
      ) : (
        <div className="mt-4">
          {b.kind === "bar" ? (
            <>
              <BarSvg b={b} size={NARROW} className="pp-chart-narrow h-auto w-full" />
              <BarSvg b={b} size={WIDE} className="pp-chart-wide h-auto w-full" />
            </>
          ) : (
            <>
              <LineSvg b={b} size={NARROW} className="pp-chart-narrow h-auto w-full" />
              <LineSvg b={b} size={WIDE} className="pp-chart-wide h-auto w-full" />
            </>
          )}
        </div>
      )}
      {b.source && <p className="mt-3 text-[13px] leading-snug text-(--pp-muted)">{b.source}</p>}
      <table className="sr-only">
        <caption>{b.title || "Chart"}</caption>
        <thead>
          <tr>
            <td />
            {b.series.map((s, i) => (
              <th key={i} scope="col">
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {b.labels.map((l, i) => (
            <tr key={i}>
              <th scope="row">{l}</th>
              {b.series.map((s, k) => (
                <td key={k}>{s.shown[i] || "No value"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
