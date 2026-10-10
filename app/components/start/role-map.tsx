import { useEffect, useRef, useState } from "react";

/**
 * A dotted map that zooms to where the student's roles actually are.
 *
 * A globe made no sense when every role sat in one country, so this fits a
 * flat map to the places that matter (home, cities with open roles, cities
 * they picked): all-India roles give an India map; roles in Dubai and London
 * widen it to fit. Land is drawn as a dot matrix from Natural Earth outlines
 * (public/geo), the country with most of the roles in indigo. Cities are sized
 * by open roles; picked cities are filled, with an arc from home.
 */

export type MapPlace = { name: string; lat: number; lng: number; count: number; picked?: boolean };

type Country = { c: string; n: string; r: number[][]; box: [number, number, number, number] };

let countriesPromise: Promise<Country[]> | null = null;
function loadCountries(): Promise<Country[]> {
  countriesPromise ??= fetch("/geo/countries-50m.json")
    .then((r) => r.json())
    .then((list: { c: string; n: string; r: number[][] }[]) =>
      list.map((k) => {
        let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
        for (const ring of k.r)
          for (let i = 0; i < ring.length; i += 2) {
            x0 = Math.min(x0, ring[i]); x1 = Math.max(x1, ring[i]);
            y0 = Math.min(y0, ring[i + 1]); y1 = Math.max(y1, ring[i + 1]);
          }
        return { ...k, box: [x0, y0, x1, y1] as [number, number, number, number] };
      }),
    )
    .catch(() => []);
  return countriesPromise;
}

function inRing(ring: number[], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const xi = ring[i], yi = ring[i + 1], xj = ring[j], yj = ring[j + 1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function countryAt(list: Country[], lng: number, lat: number): Country | null {
  for (const k of list) {
    if (lng < k.box[0] || lng > k.box[2] || lat < k.box[1] || lat > k.box[3]) continue;
    if (k.r.some((ring) => inRing(ring, lng, lat))) return k;
  }
  return null;
}

export function RoleMap({
  home,
  places,
  onToggle,
  height = 320,
  compact = false,
  tone = "light",
}: {
  home?: { name: string; lat: number; lng: number } | null;
  places: MapPlace[];
  /** Clicking a city calls this; omit for a read-only map. */
  onToggle?: (name: string) => void;
  height?: number;
  compact?: boolean;
  tone?: "light" | "dark";
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [width, setWidth] = useState(0);
  const [labels, setLabels] = useState<{ name: string; x: number; y: number; count: number; picked: boolean; home?: boolean }[]>([]);
  const hits = useRef<{ name: string; x: number; y: number; r: number }[]>([]);
  const [away, setAway] = useState<MapPlace[]>([]);

  useEffect(() => {
    let live = true;
    loadCountries().then((c) => live && setCountries(c));
    return () => { live = false; };
  }, []);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const key = JSON.stringify([home, places, width, height, tone, !!countries]);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !width || !countries) return;
    const W = width, H = height, dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Fit to where most of the roles are, plus home and picked cities. A lone
    // role far away (London when the rest are in India) is listed beside the
    // map instead of zooming the whole map out to fit it.
    const anchor = home ?? [...places].sort((a, b) => b.count - a.count)[0];
    const near = (p: MapPlace) => !anchor || Math.hypot(p.lat - anchor.lat, (p.lng - anchor.lng) * Math.cos((anchor.lat * Math.PI) / 180)) < 22;
    const pts = [...places.filter((p) => p.picked || (p.count > 0 && near(p))), ...(home ? [{ ...home, count: 0 }] : [])];
    if (pts.length === 0) pts.push({ name: "", lat: 20.6, lng: 79, count: 0 }); // India by default
    let lat0 = Math.min(...pts.map((p) => p.lat)), lat1 = Math.max(...pts.map((p) => p.lat));
    let lng0 = Math.min(...pts.map((p) => p.lng)), lng1 = Math.max(...pts.map((p) => p.lng));
    const cLat = (lat0 + lat1) / 2, cLng = (lng0 + lng1) / 2;
    const k = Math.cos((cLat * Math.PI) / 180);
    let spanY = Math.max(14, (lat1 - lat0) * 1.5), spanX = Math.max(14, (lng1 - lng0) * 1.5) * k;
    // Match the box's aspect ratio.
    if (spanX / spanY < W / H) spanX = (spanY * W) / H; else spanY = (spanX * H) / W;
    lat0 = cLat - spanY / 2; lat1 = cLat + spanY / 2;
    lng0 = cLng - spanX / k / 2; lng1 = cLng + spanX / k / 2;
    const px = (lng: number) => ((lng - lng0) / (lng1 - lng0)) * W;
    const py = (lat: number) => ((lat1 - lat) / (lat1 - lat0)) * H;

    // Country holding most of the roles is the "home" country of the map.
    const tally = new Map<string, number>();
    for (const p of places) {
      const c = countryAt(countries, p.lng, p.lat);
      if (c) tally.set(c.c, (tally.get(c.c) ?? 0) + Math.max(1, p.count));
    }
    const focusCountry = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

    // Dot-matrix land.
    const step = compact ? 5 : 6.5;
    const dark = tone === "dark";
    const visible = countries.filter((c) => c.box[2] >= lng0 && c.box[0] <= lng1 && c.box[3] >= lat0 && c.box[1] <= lat1);
    for (let y = step / 2; y < H; y += step) {
      const lat = lat1 - (y / H) * (lat1 - lat0);
      for (let x = step / 2; x < W; x += step) {
        const lng = lng0 + (x / W) * (lng1 - lng0);
        const c = countryAt(visible, lng, lat);
        if (!c) continue;
        const focus = c.c === focusCountry;
        ctx.fillStyle = focus ? (dark ? "rgba(155,163,255,.75)" : "rgba(91,99,232,.55)") : dark ? "rgba(255,255,255,.18)" : "rgba(120,114,160,.28)";
        ctx.beginPath();
        ctx.arc(x, y, focus ? 1.45 : 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Arcs from home to picked cities.
    const homeXY = home ? { x: px(home.lng), y: py(home.lat) } : null;
    if (homeXY) {
      ctx.strokeStyle = dark ? "rgba(255,196,80,.85)" : "rgba(91,99,232,.8)";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 4]);
      for (const p of places) {
        if (!p.picked) continue;
        const x = px(p.lng), y = py(p.lat);
        if (Math.hypot(x - homeXY.x, y - homeXY.y) < 8) continue;
        const mx = (x + homeXY.x) / 2, my = (y + homeXY.y) / 2 - Math.hypot(x - homeXY.x, y - homeXY.y) * 0.25;
        ctx.beginPath();
        ctx.moveTo(homeXY.x, homeXY.y);
        ctx.quadraticCurveTo(mx, my, x, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // City markers, biggest first so small ones stay on top.
    const hitList: typeof hits.current = [];
    const lab: typeof labels = [];
    const maxCount = Math.max(1, ...places.map((p) => p.count));
    for (const p of [...places].sort((a, b) => b.count - a.count)) {
      const x = px(p.lng), y = py(p.lat);
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
      const r = (compact ? 3 : 4.5) + Math.sqrt(p.count / maxCount) * (compact ? 6 : 11);
      ctx.beginPath();
      ctx.arc(x, y, r + (p.picked ? 5 : 0), 0, Math.PI * 2);
      ctx.fillStyle = p.picked ? (dark ? "rgba(255,196,80,.22)" : "rgba(91,99,232,.16)") : "transparent";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = p.picked ? (dark ? "#FFC450" : "#5B63E8") : dark ? "rgba(13,14,36,.85)" : "#FFFFFF";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = p.picked ? (dark ? "#fff" : "#fff") : dark ? "#9EA8FF" : "#5B63E8";
      ctx.stroke();
      hitList.push({ name: p.name, x, y, r: Math.max(r, 10) });
      lab.push({ name: p.name, x, y: y - r - 4, count: p.count, picked: !!p.picked });
    }
    if (homeXY) {
      ctx.save();
      ctx.translate(homeXY.x, homeXY.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = dark ? "#fff" : "#16161E";
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();
      lab.push({ name: home!.name, x: homeXY.x, y: homeXY.y - 10, count: 0, picked: false, home: true });
    }
    hits.current = hitList;
    setAway(places.filter((p) => { const x = px(p.lng), y = py(p.lat); return x < 0 || x > W || y < 0 || y > H; }));

    // Drop labels that would overlap a bigger one.
    const kept: typeof labels = [];
    for (const l of lab.sort((a, b) => Number(!!b.home) - Number(!!a.home) || Number(b.picked) - Number(a.picked) || b.count - a.count)) {
      const w = l.name.length * 6.5 + 34, h = 18;
      if (kept.some((o) => Math.abs(o.x - l.x) < (w + o.name.length * 6.5 + 34) / 2 && Math.abs(o.y - l.y) < h)) continue;
      kept.push(l);
      if (compact && kept.length >= 4) break;
    }
    setLabels(kept);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const click = (e: React.MouseEvent) => {
    if (!onToggle) return;
    const r = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = hits.current.find((h) => Math.hypot(h.x - x, h.y - y) <= h.r);
    if (hit) onToggle(hit.name);
  };

  const dark = tone === "dark";
  return (
    <div ref={boxRef} className="relative w-full overflow-hidden" style={{ height }} data-tour="map">
      <canvas
        ref={canvasRef}
        onClick={click}
        style={{ width: "100%", height, cursor: onToggle ? "pointer" : "default", opacity: countries ? 1 : 0, transition: "opacity .5s" }}
        aria-label={`Map of ${places.length} cities with open roles`}
        role="img"
      />
      {!countries && <div className="absolute inset-0 animate-pulse rounded-xl bg-neutral-100/60" />}
      {away.length > 0 && !compact && (
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center gap-1.5 font-['Satoshi'] text-[11px]">
          <span className={`font-bold ${dark ? "text-white/70" : "text-neutral-500"}`}>Also hiring further away:</span>
          {away.map((p) => (
            <button key={p.name} type="button" onClick={() => onToggle?.(p.name)} disabled={!onToggle}
              className="rounded-md px-1.5 py-0.5 font-bold"
              style={{ background: p.picked ? "#5B63E8" : "rgba(255,255,255,.92)", color: p.picked ? "#fff" : "#16161E", border: p.picked ? "1px solid transparent" : "1px solid rgba(22,22,40,.15)" }}>
              {p.picked ? "✓ " : ""}{p.name} · {p.count}
            </button>
          ))}
        </div>
      )}
      {labels.map((l) => (
        <button
          key={`${l.name}-${l.home ? "h" : ""}`}
          type="button"
          tabIndex={onToggle && !l.home ? 0 : -1}
          onClick={() => onToggle && !l.home && onToggle(l.name)}
          className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md px-1.5 py-0.5 font-['Satoshi'] text-[11px] font-bold leading-tight transition-colors"
          style={{
            left: l.x,
            top: l.y,
            pointerEvents: onToggle && !l.home ? "auto" : "none",
            background: l.home ? (dark ? "#fff" : "#16161E") : l.picked ? (dark ? "#FFC450" : "#5B63E8") : dark ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.92)",
            color: l.home ? (dark ? "#16161E" : "#fff") : l.picked ? (dark ? "#16161E" : "#fff") : dark ? "#fff" : "#16161E",
            border: l.picked || l.home ? "1px solid transparent" : `1px solid ${dark ? "rgba(255,255,255,.2)" : "rgba(22,22,40,.15)"}`,
          }}
        >
          {l.home ? `You · ${l.name}` : `${l.name}${l.count ? ` · ${l.count}` : ""}`}
        </button>
      ))}
    </div>
  );
}
