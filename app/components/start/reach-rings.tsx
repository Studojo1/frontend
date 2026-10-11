import { distanceKm } from "~/lib/geo";

/**
 * "How far would you go": the student at the centre, cities on rings by how
 * far they are (your city, a short trip, a flight away, abroad), each in its
 * real compass direction from home, sized by open roles. Picked cities are
 * filled; tap to toggle. No map data needed, and it answers the question the
 * signup asks ("would you move?") better than geography does.
 */

export type ReachPlace = { name: string; lat: number; lng: number; count: number; picked?: boolean };

const RINGS = [
  { max: 40, label: "your city" },
  { max: 600, label: "a short trip" },
  { max: 2500, label: "a flight away" },
  { max: Infinity, label: "abroad" },
];

export function ReachRings({
  home,
  places,
  remote = 0,
  onToggle,
  compact = false,
}: {
  home: { name: string; lat: number; lng: number } | null;
  places: ReachPlace[];
  /** Open remote roles, shown at the centre. */
  remote?: number;
  onToggle?: (name: string) => void;
  compact?: boolean;
}) {
  const W = compact ? 300 : 680, H = compact ? 150 : 420;
  const cx = W / 2, cy = H / 2;
  // Wide ellipses that use the whole box: ring i has radii (rx, ry) * i / 3.
  const RX = W / 2 - (compact ? 28 : 70), RY = H / 2 - (compact ? 14 : 34);
  const maxCount = Math.max(1, ...places.map((p) => p.count));
  const origin = home ?? places.slice().sort((a, b) => b.count - a.count)[0] ?? { name: "", lat: 20.6, lng: 79 };
  const mono = '"JetBrains Mono", ui-monospace, Menlo, monospace';
  const labelW = (p: { name: string; count: number }) => p.name.length * (compact ? 6 : 6.6) + (p.count ? 26 : 10);

  // Ring by distance, angle by compass bearing from home (north is up).
  const all = places.map((p) => {
    const km = distanceKm([origin.lat, origin.lng], [p.lat, p.lng]);
    const ring = RINGS.findIndex((r) => km <= r.max);
    const bearing = Math.atan2((p.lng - origin.lng) * Math.cos((origin.lat * Math.PI) / 180), p.lat - origin.lat);
    return { ...p, ring, bearing };
  });
  // Their own city is the centre, not a dot on top of it.
  const self = all.filter((p) => p.ring === 0).sort((a, b) => b.count - a.count)[0];
  const placed = all.filter((p) => p !== self && !(p.ring === 0));
  // Spread each ring: keep the rough direction, push neighbours apart until labels fit.
  for (const ring of [1, 2, 3]) {
    const onRing = placed.filter((p) => p.ring === ring).sort((a, b) => a.bearing - b.bearing);
    const rLen = ((RX + RY) / 2) * (ring / 3);
    for (let pass = 0; pass < 40; pass++) {
      let moved = false;
      for (let i = 1; i < onRing.length; i++) {
        const a = onRing[i - 1], b = onRing[i];
        const need = ((labelW(a) + labelW(b)) / 2 + 8) / rLen;
        if (b.bearing - a.bearing < need) {
          const push = (need - (b.bearing - a.bearing)) / 2;
          a.bearing -= push; b.bearing += push; moved = true;
        }
      }
      if (!moved) break;
    }
  }
  const pos = (ring: number, bearing: number) => ({ x: cx + RX * (ring / 3) * Math.sin(bearing), y: cy - RY * (ring / 3) * Math.cos(bearing) });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Cities with open roles, by distance from you" data-tour="map">
      {/* Rings, named at the lower left where cities rarely sit */}
      {[1, 2, 3].map((i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={RX * (i / 3)} ry={RY * (i / 3)} fill="none" stroke="rgba(91,99,232,.22)" strokeDasharray={i === 3 ? "3 5" : undefined} />
          {!compact && (
            <text x={cx - RX * (i / 3) * 0.72 - 4} y={cy + RY * (i / 3) * 0.72 + 14} textAnchor="end" style={{ font: `10px ${mono}`, letterSpacing: ".06em", textTransform: "uppercase" }} fill="#AAADBC">
              {RINGS[i].label}
            </text>
          )}
        </g>
      ))}

      {/* Lines from home to picked cities */}
      {placed.filter((p) => p.picked).map((p) => {
        const q = pos(p.ring, p.bearing);
        return <line key={`l-${p.name}`} x1={cx} y1={cy} x2={q.x} y2={q.y} stroke="rgba(91,99,232,.45)" strokeWidth={1.2} />;
      })}

      {/* You, merged with their own city */}
      <g style={{ cursor: self && onToggle ? "pointer" : "default" }} onClick={() => self && onToggle?.(self.name)}>
        {self?.picked && <circle cx={cx} cy={cy} r={compact ? 9 : 15} fill="rgba(91,99,232,.12)" />}
        <circle cx={cx} cy={cy} r={compact ? 4 : 7} fill="#16161E" stroke="#fff" strokeWidth={2} />
      </g>
      {!compact && (() => {
        const t = `you · ${origin.name.toLowerCase()}${self ? ` · ${self.count}` : ""}`;
        const w = t.length * 6.6 + 14;
        return (
          <g>
            <rect x={cx - w / 2} y={cy + 13} width={w} height={18} fill="#16161E" />
            <text x={cx} y={cy + 25.5} textAnchor="middle" style={{ font: `10.5px ${mono}` }} fill="#fff">{t}</text>
            {remote > 0 && (
              <g>
                <rect x={cx - 40} y={cy + 35} width={80} height={17} fill="#fff" stroke="rgba(22,22,40,.16)" />
                <text x={cx} y={cy + 47} textAnchor="middle" style={{ font: `10px ${mono}` }} fill="#585B6C">remote · {remote}</text>
              </g>
            )}
          </g>
        );
      })()}

      {/* Cities */}
      {placed.map((p) => {
        const q = pos(p.ring, p.bearing);
        const r = (compact ? 3 : 4.5) + Math.sqrt(p.count / maxCount) * (compact ? 4 : 9);
        const lw = labelW(p);
        const above = q.y < cy;
        return (
          <g key={p.name} style={{ cursor: onToggle ? "pointer" : "default" }} onClick={() => onToggle?.(p.name)} role={onToggle ? "button" : undefined} aria-label={onToggle ? `${p.picked ? "Remove" : "Add"} ${p.name}` : undefined} tabIndex={onToggle ? 0 : undefined}
            onKeyDown={(e) => { if (onToggle && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onToggle(p.name); } }}>
            {p.picked && <circle cx={q.x} cy={q.y} r={r + 6} fill="rgba(91,99,232,.12)" />}
            <circle cx={q.x} cy={q.y} r={r} fill={p.picked ? "#5B63E8" : "#fff"} stroke={p.picked ? "#fff" : "rgba(91,99,232,.6)"} strokeWidth={1.5} />
            {(!compact || p.picked) && (
              <g>
                <rect x={q.x - lw / 2} y={above ? q.y - r - 21 : q.y + r + 4} width={lw} height={17} fill={p.picked ? "#F3F3FE" : "rgba(255,255,255,.95)"} stroke={p.picked ? "rgba(91,99,232,.4)" : "rgba(22,22,40,.16)"} />
                <text x={q.x} y={above ? q.y - r - 9 : q.y + r + 16} textAnchor="middle" style={{ font: `${compact ? 9.5 : 10.5}px ${mono}` }} fill={p.picked ? "#4148C6" : "#585B6C"}>
                  {p.name.toLowerCase()}{p.count ? ` · ${p.count}` : ""}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
