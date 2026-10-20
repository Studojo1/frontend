/**
 * Chart geometry for the launched project page: pure numbers in, SVG
 * coordinates out, so a test can check that every chart is drawn to scale.
 * Bars always start at zero; a line's axis covers its values (and zero when
 * the values cross it or sit close to it). Nulls are gaps.
 */
import { fmt, fmtTick, type Unit } from "./view";

export type Size = { W: number; H: number; f: number };
export type Scale = { min: number; max: number; step: number; ticks: number[] };
export type Tick = { v: number; y: number; label: string };
export type XLabel = { x: number; text: string; full: string };

/** A rough text width: Satoshi digits and letters average a little over half the font size. */
export const textWidth = (s: string, f: number) => s.length * f * 0.58;

const round = (v: number) => Math.round(v * 1e9) / 1e9;

/** Round numbers from lo to hi in about `count` steps of 1, 2 or 5 times a power of ten. */
export function niceScale(lo: number, hi: number, count = 5): Scale {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { min: 0, max: 1, step: 1, ticks: [0, 1] };
  if (lo > hi) [lo, hi] = [hi, lo];
  if (lo === hi) {
    const pad = lo === 0 ? 1 : Math.abs(lo) * 0.1;
    lo -= pad;
    hi += pad;
  }
  const rough = (hi - lo) / count;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  const step = round((norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag);
  const min = round(Math.floor(round(lo / step)) * step);
  const max = round(Math.ceil(round(hi / step)) * step);
  const ticks: number[] = [];
  for (let v = min; v <= max + step / 2; v = round(v + step)) ticks.push(round(v));
  return { min, max, step, ticks };
}

/** The value axis for a bar or line chart. */
export function valueScale(values: (number | null)[], kind: "bar" | "line"): Scale {
  const vs = values.filter((v): v is number => v !== null);
  let lo = Math.min(...vs);
  let hi = Math.max(...vs);
  if (kind === "bar") {
    lo = Math.min(0, lo);
    hi = Math.max(0, hi);
  } else if (lo > 0 && lo < hi * 0.5) lo = 0;
  else if (hi < 0 && hi > lo * 0.5) hi = 0;
  return niceScale(lo, hi);
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

type Frame = { left: number; right: number; top: number; bottom: number; ticks: Tick[]; x: XLabel[]; rotate: boolean; band: number; zeroY: number; y: (v: number) => number };

/** The plot area, the y ticks and the x labels shared by bar and line charts. */
function frame(labels: string[], scale: Scale, unit: Unit, { W, H, f }: Size): Frame {
  const tickLabels = scale.ticks.map((v) => fmtTick(v, unit, scale.step));
  const left = Math.ceil(Math.max(...tickLabels.map((t) => textWidth(t, f)))) + 12;
  const right = 8;
  const band = (W - left - right) / labels.length;
  const short = labels.map((l) => clip(l, 18));
  const widest = Math.max(...short.map((l) => textWidth(l, f)));
  const rotate = widest > band - 6;
  const bottom = rotate ? Math.ceil(Math.min(widest, 120) * 0.64) + f + 10 : f + 14;
  const top = f + 8;
  const plotH = H - top - bottom;
  const y = (v: number) => top + ((scale.max - v) / (scale.max - scale.min)) * plotH;
  return {
    left,
    right,
    top,
    bottom,
    band,
    rotate,
    zeroY: y(Math.min(Math.max(0, scale.min), scale.max)),
    y,
    ticks: scale.ticks.map((v, i) => ({ v, y: y(v), label: tickLabels[i] })),
    x: labels.map((l, i) => ({ x: left + band * (i + 0.5), text: rotate ? clip(l, 16) : short[i], full: l })),
  };
}

export type Bar = { series: number; x: number; y: number; w: number; h: number; value: number; text: string; textY: number; showText: boolean };
export type BarLayout = Frame & { size: Size; scale: Scale; bars: Bar[] };

/** Grouped bars from zero: each bar's height is its value over the axis span, times the plot height. */
export function layoutBars(labels: string[], series: { values: (number | null)[]; shown: string[] }[], unit: Unit, size: Size): BarLayout {
  const scale = valueScale(series.flatMap((s) => s.values), "bar");
  const fr = frame(labels, scale, unit, size);
  const groupW = fr.band * 0.72;
  const barW = Math.min(56, groupW / series.length);
  const gap = series.length > 1 ? Math.min(4, barW * 0.12) : 0;
  const bars: Bar[] = [];
  labels.forEach((_, i) => {
    const start = fr.x[i].x - (barW * series.length) / 2;
    series.forEach((s, k) => {
      const v = s.values[i];
      if (v === null) return;
      const yv = fr.y(v);
      const top = Math.min(yv, fr.zeroY);
      const h = Math.abs(fr.zeroY - yv);
      const text = s.shown[i];
      const w = barW - gap;
      bars.push({
        series: k,
        x: start + k * barW + gap / 2,
        y: top,
        w,
        h,
        value: v,
        text,
        textY: v >= 0 ? top - 5 : top + h + size.f + 2,
        showText: textWidth(text, size.f * 0.92) <= barW + gap,
      });
    });
  });
  return { ...fr, size, scale, bars };
}

export type LinePoint = { x: number; y: number; value: number; text: string };
export type LineLayout = Frame & { size: Size; scale: Scale; lines: { series: number; d: string; points: LinePoint[]; end: LinePoint | null; endY: number }[] };

/** One path per series through band centres, broken at nulls, with the last value labelled. */
export function layoutLines(labels: string[], series: { values: (number | null)[]; shown: string[] }[], unit: Unit, size: Size): LineLayout {
  const scale = valueScale(series.flatMap((s) => s.values), "line");
  const fr = frame(labels, scale, unit, size);
  const lines = series.map((s, k) => {
    const points: LinePoint[] = [];
    let d = "";
    let pen = false;
    s.values.forEach((v, i) => {
      if (v === null) {
        pen = false;
        return;
      }
      const p = { x: fr.x[i].x, y: fr.y(v), value: v, text: s.shown[i] };
      points.push(p);
      d += `${pen ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
      pen = true;
    });
    const end = points.length ? points[points.length - 1] : null;
    return { series: k, d: d.trim(), points, end, endY: end ? end.y : 0 };
  });
  // End labels sit just above their point, pushed apart so they never overlap.
  const placed = lines.filter((l) => l.end).sort((a, b) => a.endY - b.endY);
  let last = -Infinity;
  for (const l of placed) {
    const want = Math.max(l.endY - 8, last + size.f + 2);
    l.endY = Math.min(want, size.H - fr.bottom - 2);
    last = l.endY;
  }
  return { ...fr, size, scale, lines };
}

export type Slice = { index: number; label: string; value: number; text: string; share: number; d: string; rest: boolean };

const polar = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

/** One donut segment from angle a0 to a1 (radians, clockwise from 12 o'clock). */
function arc(cx: number, cy: number, r: number, r0: number, a0: number, a1: number): string {
  const s = a0 - Math.PI / 2;
  const e = a1 - Math.PI / 2;
  if (a1 - a0 >= Math.PI * 2 - 1e-9) {
    // A whole ring: two halves, since one arc cannot end where it starts.
    const m = s + Math.PI;
    const [x0, y0] = polar(cx, cy, r, s);
    const [x1, y1] = polar(cx, cy, r, m);
    const [i0, j0] = polar(cx, cy, r0, s);
    const [i1, j1] = polar(cx, cy, r0, m);
    return `M${x0} ${y0}A${r} ${r} 0 1 1 ${x1} ${y1}A${r} ${r} 0 1 1 ${x0} ${y0}ZM${i0} ${j0}A${r0} ${r0} 0 1 0 ${i1} ${j1}A${r0} ${r0} 0 1 0 ${i0} ${j0}Z`;
  }
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r, s);
  const [x1, y1] = polar(cx, cy, r, e);
  const [i1, j1] = polar(cx, cy, r0, e);
  const [i0, j0] = polar(cx, cy, r0, s);
  const n = (v: number) => v.toFixed(3);
  return `M${n(x0)} ${n(y0)}A${r} ${r} 0 ${large} 1 ${n(x1)} ${n(y1)}L${n(i1)} ${n(j1)}A${r0} ${r0} 0 ${large} 0 ${n(i0)} ${n(j0)}Z`;
}

/**
 * Donut slices. Each slice's angle is its value over the whole. Percentages
 * that add up to less than 100 are drawn as parts of 100, with the rest left
 * as a plain "Rest" slice, so 8.7% is always 8.7% of the ring.
 */
export function layoutPie(labels: string[], values: (number | null)[], shown: string[], unit: Unit, d = 200): Slice[] {
  const parts = labels.map((label, i) => ({ index: i, label, value: values[i] ?? 0, text: shown[i] })).filter((p) => p.value > 0);
  const sum = parts.reduce((a, p) => a + p.value, 0);
  const whole = unit === "pct" && sum <= 100.05 ? 100 : sum;
  const restValue = whole - sum;
  const cx = d / 2;
  const r = d / 2 - 2;
  const r0 = r * 0.58;
  const slices: Slice[] = [];
  let a = 0;
  for (const p of parts) {
    const span = (p.value / whole) * Math.PI * 2;
    slices.push({ ...p, share: p.value / whole, d: arc(cx, cx, r, r0, a, a + span), rest: false });
    a += span;
  }
  if (restValue > whole * 0.0005) {
    slices.push({ index: -1, label: "Rest", value: restValue, text: fmt(restValue, "pct"), share: restValue / whole, d: arc(cx, cx, r, r0, a, Math.PI * 2), rest: true });
  }
  return slices;
}
