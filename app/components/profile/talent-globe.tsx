import { useEffect, useRef } from "react";

/**
 * The profile globe: a dotted WebGL globe (cobe) with the student's home,
 * the cities they want to work in, arcs between them, and the places they
 * applied. HTML labels ride on the markers ("Razorpay is hiring") and fade
 * as they turn away.
 *
 * cobe wraps the canvas in its own div, which React would trip over on
 * unmount, so the canvas is created here imperatively inside an empty
 * React-owned container.
 */

export type GlobePin = {
  id: string;
  lat: number;
  lng: number;
  kind: "home" | "target" | "applied" | "hub";
  /** Small caps line on the label, e.g. "RAZORPAY IS HIRING". Omit for no label. */
  kicker?: string;
  /** Main line on the label, e.g. "Product Intern". */
  text?: string;
};

type RGB = [number, number, number];
const PALETTES: Record<"light" | "dark", { pins: Record<GlobePin["kind"], RGB>; globe: Record<string, unknown>; arc: RGB }> = {
  light: {
    pins: {
      home: [0.43, 0.16, 0.85], // studojo purple-strong
      target: [0.96, 0.62, 0.04], // amber
      applied: [0.06, 0.73, 0.51], // emerald
      hub: [0.96, 0.62, 0.04],
    },
    globe: { dark: 0, diffuse: 1.15, mapBrightness: 5, mapBaseBrightness: 0.02, baseColor: [1, 1, 1], glowColor: [0.94, 0.91, 1], opacity: 0.95 },
    arc: [0.55, 0.36, 0.96],
  },
  // Night globe for the Sensei-style panels: indigo glow, bright pins.
  dark: {
    pins: {
      home: [0.62, 0.66, 1], // indigo, light
      target: [1, 0.72, 0.25], // amber
      applied: [0.2, 0.86, 0.6], // emerald
      hub: [0.5, 0.55, 0.85], // muted indigo: where roles are, not chosen
    },
    globe: { dark: 1, diffuse: 1.6, mapBrightness: 7, mapBaseBrightness: 0.04, baseColor: [0.3, 0.32, 0.5], glowColor: [0.3, 0.33, 0.85], opacity: 0.92 },
    arc: [1, 0.72, 0.25],
  },
};
const SIZES: Record<GlobePin["kind"], number> = { home: 0.09, target: 0.07, applied: 0.045, hub: 0.045 };
const RADIUS = 0.8; // cobe's globe radius in clip space

const rad = (d: number) => (d * Math.PI) / 180;

/** cobe's lat/lng -> unit vector (from its source, so labels land on the dots). */
function toVec(lat: number, lng: number): [number, number, number] {
  const a = rad(lat);
  const b = rad(lng) - Math.PI;
  return [-Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b)];
}

/** Screen position (0-1 of the square) and facing (z > 0 is the near side). */
function project(v: [number, number, number], phi: number, theta: number) {
  const ct = Math.cos(theta), cp = Math.cos(phi), st = Math.sin(theta), sp = Math.sin(phi);
  const x = (cp * v[0] + sp * v[2]) * RADIUS;
  const y = (sp * st * v[0] + ct * v[1] - cp * st * v[2]) * RADIUS;
  const z = -sp * ct * v[0] + st * v[1] + cp * ct * v[2];
  return { x: (x + 1) / 2, y: (-y + 1) / 2, z };
}

/** The phi/theta that turn [lat, lng] to face the viewer. */
export function facing(lat: number, lng: number): { phi: number; theta: number } {
  return { phi: -Math.PI / 2 - rad(lng), theta: rad(Math.max(-60, Math.min(60, lat))) * 0.85 };
}

function shortestAngle(from: number, to: number): number {
  const d = (to - from) % (2 * Math.PI);
  return from + (d > Math.PI ? d - 2 * Math.PI : d < -Math.PI ? d + 2 * Math.PI : d);
}

function markersAndArcs(list: GlobePin[], arcsFrom: string | undefined, tone: "light" | "dark") {
  const pal = PALETTES[tone];
  const from = list.find((p) => p.id === arcsFrom);
  return {
    markers: list.map((p) => ({ location: [p.lat, p.lng] as [number, number], size: SIZES[p.kind], color: pal.pins[p.kind] })),
    arcs: from
      ? list
          .filter((p) => p.kind === "target" && Math.abs(p.lat - from.lat) + Math.abs(p.lng - from.lng) > 0.5)
          .map((p) => ({ from: [from.lat, from.lng] as [number, number], to: [p.lat, p.lng] as [number, number] }))
      : [],
  };
}

export function TalentGlobe({
  pins,
  arcsFrom,
  focus,
  tone = "light",
  className = "",
}: {
  pins: GlobePin[];
  /** Draw arcs from this pin to every "target" pin. */
  arcsFrom?: string;
  /** Pin id to turn towards; changes animate. */
  focus?: string | null;
  /** "dark" for the night globe used on dark panels. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef(pins);
  const globeRef = useRef<{ destroy: () => void; update: (s: Record<string, unknown>) => void } | null>(null);
  const focusRef = useRef<string | null | undefined>(focus);
  pinsRef.current = pins;
  focusRef.current = focus;

  // Stable key: rebuild the globe only when the set of markers changes.
  const pinKey = pins.map((p) => `${p.id}:${p.kind}:${p.lat.toFixed(2)},${p.lng.toFixed(2)}`).join("|") + `>${arcsFrom ?? ""}`;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let destroyed = false;
    let globe: { destroy: () => void; update: (s: Record<string, unknown>) => void } | null = null;
    let raf = 0;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;height:100%;contain:layout paint size;opacity:0;transition:opacity .8s ease;cursor:grab;touch-action:pan-y";
    host.appendChild(canvas);

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const start = pinsRef.current.find((p) => p.id === focusRef.current) ?? pinsRef.current[0];
    let { phi, theta } = start ? facing(start.lat, start.lng) : { phi: -Math.PI / 2 - rad(78), theta: 0.25 };
    let target: { phi: number; theta: number } | null = null;
    let lastFocus = focusRef.current;
    let drag: { x: number; y: number; phi: number; theta: number } | null = null;
    let idleSince = performance.now();

    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, phi, theta };
      target = null;
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      phi = drag.phi + (e.clientX - drag.x) / 160;
      theta = Math.max(-1, Math.min(1, drag.theta + (e.clientY - drag.y) / 300));
    };
    const onUp = () => {
      drag = null;
      idleSince = performance.now();
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const size = () => {
      const w = host.clientWidth || 320;
      return { w, dpr: Math.min(window.devicePixelRatio || 1, 2) };
    };

    const positionLabels = () => {
      const box = labelsRef.current;
      if (!box) return;
      const W = box.clientWidth || 1;
      // Focused pin first, then home, then whatever faces us most; a label
      // that would overlap one already placed is hidden.
      const rows = (Array.from(box.children) as HTMLElement[])
        .map((el) => {
          const p = pinsRef.current.find((x) => x.id === el.dataset.pin);
          return p ? { el, p, s: project(toVec(p.lat, p.lng), phi, theta) } : null;
        })
        .filter((r): r is NonNullable<typeof r> => !!r)
        .sort((a, b) => {
          const rank = (r: typeof a) => (r.p.id === focusRef.current ? 2 : r.p.kind === "home" ? 1 : 0);
          return rank(b) - rank(a) || b.s.z - a.s.z;
        });
      const placed: { l: number; r: number; t: number; b: number }[] = [];
      for (const { el, s } of rows) {
        const w = el.offsetWidth, h = el.offsetHeight;
        const rect = { l: s.x * W - w / 2, r: s.x * W + w / 2, t: s.y * W - h - 10, b: s.y * W - 10 };
        const clash = placed.some((o) => rect.l < o.r && rect.r > o.l && rect.t < o.b && rect.b > o.t);
        const vis = clash ? 0 : Math.max(0, Math.min(1, s.z * 4));
        if (vis > 0.3) placed.push(rect);
        el.style.left = `${s.x * 100}%`;
        el.style.top = `${s.y * 100}%`;
        el.style.opacity = String(vis);
        el.style.filter = vis < 1 ? `blur(${(1 - vis) * 6}px)` : "";
        el.style.pointerEvents = vis > 0.5 ? "auto" : "none";
        el.style.zIndex = String(Math.round(s.z * 100) + 100);
      }
    };

    const tick = () => {
      if (destroyed) return;
      if (focusRef.current !== lastFocus) {
        lastFocus = focusRef.current;
        const p = pinsRef.current.find((x) => x.id === lastFocus);
        if (p) {
          const f = facing(p.lat, p.lng);
          target = { phi: shortestAngle(phi, f.phi), theta: f.theta };
        }
      }
      if (target && !drag) {
        phi += (target.phi - phi) * 0.08;
        theta += (target.theta - theta) * 0.08;
        if (Math.abs(target.phi - phi) < 0.002 && Math.abs(target.theta - theta) < 0.002) {
          target = null;
          idleSince = performance.now();
        }
      } else if (!drag && !reduced && performance.now() - idleSince > 4000) {
        phi += 0.0016; // slow drift once the student stops interacting
      }
      globe?.update({ phi, theta });
      positionLabels();
      raf = requestAnimationFrame(tick);
    };

    import("cobe").then(({ default: createGlobe }) => {
      if (destroyed) return;
      const { w, dpr } = size();
      const pal = PALETTES[tone];
      globe = createGlobe(canvas, {
        // cobe multiplies width and height by devicePixelRatio itself, so these are CSS pixels.
        devicePixelRatio: dpr,
        width: w,
        height: w,
        phi,
        theta,
        ...pal.globe,
        mapSamples: tone === "dark" ? 24000 : 16000,
        markerColor: pal.pins.home,
        markerElevation: 0.01,
        ...markersAndArcs(pinsRef.current, arcsFrom, tone),
        arcColor: pal.arc,
        arcWidth: 0.8,
        arcHeight: 0.28,
      } as Parameters<typeof createGlobe>[1]) as typeof globe;
      globeRef.current = globe;
      canvas.style.opacity = "1";
      raf = requestAnimationFrame(tick);
    });

    const ro = new ResizeObserver(() => {
      // update() multiplies by devicePixelRatio itself; passing w * dpr rendered 4x the pixels on retina.
      const { w } = size();
      globe?.update({ width: w, height: w });
    });
    ro.observe(host);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      globe?.destroy();
      globeRef.current = null;
      host.replaceChildren();
    };
    // Built once per mount; pin changes are applied by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tone]);

  // New or changed pins update the running globe in place (no rebuild, no flicker).
  useEffect(() => {
    globeRef.current?.update(markersAndArcs(pins, arcsFrom, tone));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinKey]);

  return (
    <div className={`relative aspect-square w-full ${className}`}>
      <div ref={hostRef} className="absolute inset-0" />
      <div ref={labelsRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
        {pins
          .filter((p) => p.text)
          .map((p) => (
            <div
              key={p.id}
              data-pin={p.id}
              className={`absolute -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap px-2.5 py-1.5 transition-[opacity,filter] duration-200 ${
                tone === "dark"
                  ? "rounded-lg border border-white/15 bg-white/95 shadow-[0_6px_20px_rgba(0,0,0,.35)] backdrop-blur"
                  : "rounded-xl border-2 border-neutral-900 bg-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
              }`}
              style={{ opacity: 0 }}
            >
              {p.kicker && (
                <div className="font-['Satoshi'] text-[9px] font-bold uppercase tracking-wider text-neutral-500">{p.kicker}</div>
              )}
              <div className="max-w-[11rem] truncate font-['Satoshi'] text-xs font-bold text-neutral-900">{p.text}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
