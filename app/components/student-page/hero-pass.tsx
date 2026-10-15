// Copied from Studojo1/outreach-flow (app/components/profile-ideas/v2/hero-pass.tsx), which
// drafts the page in its onboarding flow; keep the two in step.
// "Boarding pass", the public student page at /profile/:slug: the name, then one
// ticket from their city to the role they want, drawn in the onboarding's language (ink borders, offset shadows,
// the brief's ink header and numbered rows). Every field shows its source.
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FiArrowLeft, FiCheck, FiLink, FiMail, FiRotateCw } from "react-icons/fi";
import { Badge, Button, Card, cx, FOCUS_RING, PRESS } from "./ui";
import { cityCode, linesFor, SECTION_LABEL, slugCode, type HeroProps, type Profile } from "./types";
import { Barcode, Jet, Mark, Num, Portrait, useMedia } from "./hero-pass-parts";

const R = 14; // notch radius
const STUB_W = 268; // desktop stub width
const STUB_H = 132; // phone stub height

const DOTS: CSSProperties = {
  backgroundColor: "#fcfbff",
  backgroundImage: "radial-gradient(circle, rgba(23,23,23,0.13) 1px, transparent 1.3px)",
  backgroundSize: "22px 22px",
};

const LABEL = "block font-satoshi text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-studojo-muted";

type Source = { kind: "resume"; ids: string[] } | { kind: "answer"; text: string } | { kind: "profile" };
type Field = { id: string; n?: number; label: string; value: ReactNode; src: Source };

const SMALL = new Set(["of", "and", "the", "in", "at", "for", "&", "to", "a", "an"]);
const roleCode = (role: string) =>
  /software eng/i.test(role)
    ? "SWE"
    : role
        .split(/\s+/)
        .filter((w) => w && !SMALL.has(w.toLowerCase()))
        .map((w) => w[0])
        .join("")
        .slice(0, 3)
        .toUpperCase();
const src = (ids: string[]): Source => (ids.length ? { kind: "resume", ids } : { kind: "profile" });

export default function PassHero({ p, reduced }: HeroProps) {
  const wide = useMedia("(min-width: 768px)", true);
  const words = p.name.trim().split(/\s+/);
  const last = words.length > 1 ? words[words.length - 1] : p.name;
  const given = words.length > 1 ? words.slice(0, -1).join(" ") : "";
  const t = p.target;
  const from = p.city ? cityCode(p.city) : roleCode(p.college) || "STU";
  const fromCap = p.city || p.college;
  const to = t.role ? roleCode(t.role) : t.cities[0]?.code ?? "JOB";
  const toCap = t.role ? t.role.replace(/^Software engineering\b/i, wide ? "Software engineering" : "Software eng.") : t.cities[0]?.label ?? "Next role";
  const flight = `SJ ${slugCode(p.slug)}`;
  const places = t.cities.length > 0 || t.remote;
  const toWords = [t.role, t.type.toLowerCase(), t.stage && `at ${t.stage.toLowerCase()}`].filter(Boolean).join(", ");
  const passenger = given ? `${last.toUpperCase()} / ${given.split(" ")[0].toUpperCase()}` : last.toUpperCase();

  // Numbered in the order they show; a field with nothing behind it is left out.
  let n = 0;
  const num = (ok: unknown) => (ok ? ++n : undefined);
  const F: Record<string, Field | null> = {
    passenger: { id: "passenger", label: "Passenger", value: passenger, src: src(p.src.name) },
    from: p.college ? { id: "from", n: num(1), label: "From", value: p.college, src: src(p.src.college) } : null,
    to: t.role ? { id: "to", n: num(1), label: "To", value: t.role, src: { kind: "answer", text: `${toWords}.` } } : null,
    boarding: t.start ? { id: "boarding", n: num(1), label: "Boarding", value: t.start, src: { kind: "answer", text: `Free to start from ${t.start}.` } } : null,
    class: p.classOf ? { id: "class", n: num(1), label: "Class", value: p.classOf, src: src(p.src.classOf) } : null,
    dest: !places ? null : {
      id: "dest",
      n: num(1),
      label: "Destinations",
      value: (
        <span className="mt-0.5 flex flex-wrap gap-1.5">
          {t.cities.map((c) => (
            <span key={c.code} title={c.label} className="rounded-full border-2 border-studojo-ink bg-white px-2 py-px text-[12px] font-bold tracking-[0.04em]">
              {c.code}
            </span>
          ))}
          {t.remote && (
            <span className="rounded-full border-2 border-dashed border-studojo-ink bg-studojo-purple-bg px-2 py-px text-[12px] font-bold">{t.cities.length ? "+ Remote" : "Remote"}</span>
          )}
        </span>
      ),
      src: { kind: "answer", text: t.cities.length ? `${t.cities.map((c) => c.label).join(", ")}${t.remote ? ", or remote" : ""}.` : "Remote." },
    },
  };

  return (
    <section aria-label={`${p.name}'s boarding pass`} className="relative px-4 pb-12 pt-8 font-satoshi text-studojo-ink sm:px-6 md:pb-20 md:pt-14" style={DOTS}>
      <motion.header
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="mx-auto max-w-4xl text-center"
      >
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-studojo-purple-strong">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full border-2 border-studojo-ink bg-studojo-purple" />
          {p.classOf ? `Studojo profile · Class of ${p.classOf}` : "Studojo profile"}
        </span>
        <h1 className="mt-3 font-clash text-[54px] font-semibold leading-[1] tracking-[-0.01em] sm:text-[72px] lg:text-[92px]" style={{ textWrap: "balance" } as CSSProperties}>
          {given && `${given} `}<Mark color="#fde68a" reduced={reduced}>{last}</Mark>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-studojo-muted sm:text-lg" style={{ textWrap: "balance" } as CSSProperties}>
          {wide ? p.headline : [p.degreeShort, p.classOf && `Class of ${p.classOf}`, p.city].filter(Boolean).join(" · ") || p.headline}
        </p>
      </motion.header>

      <div className="mt-8 md:mt-12">
        <Pass p={p} F={F} from={from} to={to} fromCap={fromCap} toCap={toCap} flight={flight} wide={wide} reduced={reduced} />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------

type Open = { f: Field; x: number; y: number; w: number; below: boolean };

function Pass({ p, F, from, to, fromCap, toCap, flight, wide, reduced }: { p: Profile; F: Record<string, Field | null>; from: string; to: string; fromCap: string; toCap: string; flight: string; wide: boolean; reduced: boolean }) {
  const plane = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Open | null>(null);
  const [flipped, setFlipped] = useState(false);

  const show = useCallback((f: Field, el: HTMLElement) => {
    const box = plane.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (!box) return;
    const w = Math.min(320, box.width - 16);
    const x = Math.max(8, Math.min(r.left - box.left - 6, box.width - w - 8));
    const below = r.top - box.top < 170;
    setOpen({ f, x, y: below ? r.bottom - box.top + 10 : r.top - box.top - 10, w, below });
  }, []);
  const hide = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setFlipped(false); } };
    // Touch: tapping anywhere off a field closes its source.
    const down = (e: PointerEvent) => { if (!(e.target as Element | null)?.closest?.("[data-pass-field]")) setOpen(null); };
    window.addEventListener("keydown", k);
    window.addEventListener("pointerdown", down);
    return () => { window.removeEventListener("keydown", k); window.removeEventListener("pointerdown", down); };
  }, []);

  const field = (f: Field | null, cls = "", big = false) =>
    f ? <FieldButton f={f} active={open?.f.id === f.id} onShow={show} onHide={hide} className={cls} big={big} /> : null;
  const lower = F.boarding || F.class || F.dest;

  // Notch centres, on the tear line.
  const notches: [string, string][] = wide
    ? [[`calc(100% - ${STUB_W}px)`, "0px"], [`calc(100% - ${STUB_W}px)`, "100%"]]
    : [["0px", `calc(100% - ${STUB_H}px)`], ["100%", `calc(100% - ${STUB_H}px)`]];
  const hole = ([x, y]: [string, string]) => `radial-gradient(circle ${R}px at ${x} ${y}, transparent ${R - 0.5}px, #000 ${R}px)`;
  const mask = notches.map(hole).join(", ");
  const tilt = wide ? -1.4 : -1;

  return (
    <div className="mx-auto w-full" style={{ maxWidth: wide ? 940 : 400 }}>
      <motion.div
        ref={plane}
        className="relative"
        initial={reduced ? false : { opacity: 0, y: 56, rotate: -7, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
        whileHover={reduced || !wide ? undefined : { rotate: 0, y: -3 }}
        transition={{ type: "spring", stiffness: 210, damping: 15, mass: 0.9, delay: reduced ? 0 : 0.12 }}
      >
        {/* The paper: one card, two real notches; the offset ink shadow follows the cut. */}
        <div style={{ filter: "drop-shadow(6px 6px 0 #191a23)" }}>
          <div
            className={cx("relative flex rounded-2xl border-2 border-studojo-ink bg-white", wide ? "flex-row" : "flex-col")}
            style={{ maskImage: mask, WebkitMaskImage: mask, maskComposite: "intersect", WebkitMaskComposite: "source-in", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" } as CSSProperties}
          >
            {/* Main part */}
            <div className="flex min-w-0 flex-1 flex-col">
              <Band flight={flight} wide={wide} />
              {wide ? (
                <div className="flex flex-1 flex-col">
                  <div className="px-7 pt-5 lg:px-8">
                    <div className="flex items-start justify-between gap-6">
                      {field(F.passenger, "", true)}
                      <Badge kind="success" icon={<FiCheck strokeWidth={4} />} className="mt-1">Checked</Badge>
                    </div>
                    <Route from={from} to={to} fromCap={fromCap} toCap={toCap} reduced={reduced} wide />
                  </div>
                  <div className="mx-7 mt-5 border-t-2 border-dashed border-studojo-ink/20 lg:mx-8" />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-5 py-4 lg:px-6">
                    {field(F.from, F.to ? "" : "col-span-2")}
                    {field(F.to, F.from ? "" : "col-span-2")}
                    {lower && (
                      <div className="col-span-2 flex gap-x-4">
                        {field(F.boarding, "shrink-0")}
                        {field(F.class, "shrink-0")}
                        {field(F.dest, "flex-1")}
                      </div>
                    )}
                  </div>
                  <p className="mt-auto flex items-center gap-2 rounded-bl-[14px] border-t-2 border-dashed border-studojo-ink bg-studojo-purple-bg px-7 py-2.5 text-xs text-studojo-muted lg:px-8">
                    <FiCheck aria-hidden strokeWidth={3} className="shrink-0 text-studojo-purple-strong" />
                    <span>Every line checked against {p.first}'s resume</span>
                    <span className="ml-auto hidden lg:inline">Hover a field to see where it came from</span>
                  </p>
                </div>
              ) : (
                <div className="px-4 pb-4 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    {field(F.passenger, "", true)}
                    <Badge kind="success" icon={<FiCheck strokeWidth={4} />} className="mt-0.5">Checked</Badge>
                  </div>
                  <Route from={from} to={to} fromCap={fromCap} toCap={toCap} reduced={reduced} wide={false} />
                  <div className="mt-4 border-t-2 border-dashed border-studojo-ink/20" />
                  <div className="-mx-2 mt-2.5 grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {field(F.from, "col-span-2")}
                    {field(F.to, "col-span-2")}
                    {field(F.boarding, F.class ? "" : "col-span-2")}
                    {field(F.class, F.boarding ? "" : "col-span-2")}
                    {field(F.dest, "col-span-2")}
                  </div>
                </div>
              )}
            </div>

            {/* Stub: the tear line is its dashed edge. */}
            <div
              className={cx(
                "relative shrink-0 border-dashed border-studojo-ink bg-studojo-yellow-bg",
                wide ? "rounded-r-[14px] border-l-2" : "rounded-b-[14px] border-t-2",
              )}
              style={wide ? { width: STUB_W } : { height: STUB_H }}
            >
              <Stub p={p} flight={flight} wide={wide} flipped={flipped} setFlipped={setFlipped} reduced={reduced} />
            </div>
          </div>
        </div>

        {/* Ink rims on the notches (outside the shadow so they stay crisp). */}
        {notches.map((at, i) => (
          <NotchRim key={i} at={at} side={wide ? (i === 0 ? "top" : "bottom") : i === 0 ? "left" : "right"} />
        ))}

        {/* Source popover lives outside the masked paper so it never clips. */}
        <AnimatePresence>
          {open && (
            <motion.div
              key={open.f.id}
              role="tooltip"
              id={`src-${open.f.id}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, rotate: -2, y: open.below ? -6 : 6 }}
              animate={{ opacity: 1, scale: 1, rotate: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={reduced ? { duration: 0.12 } : { type: "spring", stiffness: 520, damping: 26 }}
              className="pointer-events-none absolute z-30"
              style={{ left: open.x, top: open.y, width: open.w, transformOrigin: open.below ? "20% 0%" : "20% 100%" }}
            >
              <div className={open.below ? "" : "-translate-y-full"}>
                <Card shadow="md" pad="none" className="px-4 py-3.5">
                  <SourceBody src={open.f.src} p={p} />
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** Half an ink ring drawn inside the card at a notch. */
function NotchRim({ at: [x, y], side }: { at: [string, string]; side: "top" | "bottom" | "left" | "right" }) {
  const clip = { top: "inset(50% 0 0 0)", bottom: "inset(0 0 50% 0)", left: "inset(0 0 0 50%)", right: "inset(0 50% 0 0)" }[side];
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute rounded-full border-2 border-studojo-ink"
      style={{ width: R * 2, height: R * 2, left: `calc(${x} - ${R}px)`, top: `calc(${y} - ${R}px)`, clipPath: clip }}
    />
  );
}

// ---- Main-part pieces -------------------------------------------------------------

function Band({ flight, wide }: { flight: string; wide: boolean }) {
  return (
    <div className={cx("flex items-center justify-between gap-3 border-b-2 border-dashed border-studojo-ink bg-studojo-ink text-white", wide ? "rounded-tl-[14px] px-7 py-3 lg:px-8" : "rounded-t-[14px] px-4 py-3")}>
      <span className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/80 bg-studojo-purple">
          <Jet size={15} fill="#ffffff" />
        </span>
        <span className="font-clash text-lg font-semibold">Boarding pass</span>
      </span>
      <span className="font-satoshi text-xs font-bold uppercase tracking-[0.14em] text-white/80">
        <span className="hidden sm:inline">Studojo · </span>Flight {flight.replace("SJ ", "SJ ")}
      </span>
    </div>
  );
}

function FieldButton({ f, active, onShow, onHide, className, big }: { f: Field; active: boolean; onShow: (f: Field, el: HTMLElement) => void; onHide: () => void; className: string; big: boolean }) {
  return (
    <button
      type="button"
      data-pass-field
      aria-describedby={active ? `src-${f.id}` : undefined}
      onMouseEnter={(e) => onShow(f, e.currentTarget)}
      onMouseLeave={onHide}
      onFocus={(e) => onShow(f, e.currentTarget)}
      onBlur={onHide}
      onClick={(e) => onShow(f, e.currentTarget)}
      className={cx(
        "group flex min-w-0 cursor-help items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors duration-150 hover:bg-studojo-purple-bg",
        FOCUS_RING,
        active && "bg-studojo-purple-bg",
        big && "-mx-2 -my-1.5",
        className,
      )}
    >
      {f.n ? <Num n={f.n} on={active} className="mt-[-2px]" /> : null}
      <span className="min-w-0 flex-1">
        <span className={LABEL}>{f.label}</span>
        <span
          className={cx(
            "mt-1.5 block leading-snug text-studojo-ink",
            big ? "font-clash text-[22px] font-semibold tracking-[0.02em] md:text-[26px]" : "font-satoshi text-[14px] font-bold md:text-[15px]",
          )}
        >
          {f.value}
        </span>
      </span>
    </button>
  );
}

function SourceBody({ src, p }: { src: Source; p: Profile }) {
  if (src.kind === "profile")
    return (
      <>
        <Badge kind="accent">From {p.first}’s profile</Badge>
        <p className="mt-2.5 font-satoshi text-[15px] font-medium leading-snug text-studojo-ink">As {p.first} filled it in on Studojo.</p>
      </>
    );
  if (src.kind === "answer")
    return (
      <>
        <Badge kind="accent">In {p.first}’s own words</Badge>
        <p className="mt-2.5 font-satoshi text-[15px] font-medium leading-snug text-studojo-ink">“{src.text}”</p>
      </>
    );
  const lines = linesFor(p.lines, src.ids);
  const section = (SECTION_LABEL[lines[0]?.section ?? "header"] ?? lines[0]?.section) || "Header";
  return (
    <>
      <span className="flex items-center justify-between gap-2">
        <Badge kind="success" icon={<FiCheck strokeWidth={4} />}>From the resume</Badge>
        <span className={LABEL}>{section}</span>
      </span>
      {lines.map((l) => (
        <p key={l.id} className="mt-2.5 border-l-[3px] border-studojo-purple pl-2.5 font-satoshi text-[13px] leading-snug text-studojo-ink">
          {l.text}
        </p>
      ))}
    </>
  );
}

function Route({ from, to, fromCap, toCap, reduced, wide }: { from: string; to: string; fromCap: string; toCap: string; reduced: boolean; wide: boolean }) {
  const code = cx("font-clash font-semibold leading-[0.9] tracking-[-0.01em]", wide ? "text-[60px] lg:text-[76px]" : "text-[42px]");
  return (
    <div className={cx("flex items-end", wide ? "mt-4 gap-5" : "mt-3 gap-3")}>
      <div className="shrink-0">
        <div className={code}>{from}</div>
        <div className="mt-1.5 text-[13px] font-medium text-studojo-muted">{fromCap}</div>
      </div>
      <div className={cx("relative flex-1", wide ? "mb-[38px]" : "mb-[31px]")} aria-hidden>
        <div className="flex items-center">
          <span className="h-3 w-3 shrink-0 rounded-full border-2 border-studojo-ink bg-white" />
          <span className="flex-1 border-t-[3px] border-dotted border-studojo-ink" />
          <span className="h-3 w-3 shrink-0 rounded-full border-2 border-studojo-ink bg-studojo-purple" />
        </div>
        <motion.div
          className="absolute top-1/2"
          initial={reduced ? false : { left: "6%", opacity: 0 }}
          animate={{ left: "50%", opacity: 1 }}
          transition={{ left: { duration: 2.2, delay: 0.6, ease: [0.45, 0, 0.2, 1] }, opacity: { duration: 0.3, delay: 0.6 } }}
        >
          <motion.span
            className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-yellow-bg shadow-[2px_2px_0_0_#191a23]"
            style={{ width: wide ? 38 : 28, height: wide ? 38 : 28 }}
            initial={reduced ? false : { rotate: -18 }}
            animate={reduced ? undefined : { rotate: [-18, 0, 0], y: [0, 0, -3, 0] }}
            transition={reduced ? undefined : { rotate: { duration: 2.2, delay: 0.6, ease: "easeOut" }, y: { duration: 2.4, delay: 3, repeat: Infinity, ease: "easeInOut" } }}
          >
            <Jet size={wide ? 20 : 15} />
          </motion.span>
        </motion.div>
      </div>
      <div className="shrink-0 text-right">
        <div className={code}>{to}</div>
        <div className="mt-1.5 text-[13px] font-medium text-studojo-muted">{toCap}</div>
      </div>
    </div>
  );
}

// ---- Stub ------------------------------------------------------------------------

function Stub({ p, flight, wide, flipped, setFlipped, reduced }: { p: Profile; flight: string; wide: boolean; flipped: boolean; setFlipped: (v: boolean) => void; reduced: boolean }) {
  const [copied, setCopied] = useState(false);
  const backRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLButtonElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = setTimeout(() => (flipped ? backRef.current?.querySelector<HTMLElement>("a, button") : frontRef.current)?.focus({ preventScroll: true }), reduced ? 0 : 280);
    return () => clearTimeout(id);
  }, [flipped, reduced]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(`https://${p.url}`); } catch { /* clipboard blocked: still show the link */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const axis = wide ? "rotateY" : "rotateX";
  const face = "[backface-visibility:hidden] [-webkit-backface-visibility:hidden]";
  const round = wide ? "rounded-r-[14px]" : "rounded-b-[14px]";
  const seatValue = [p.degreeShort, p.classOf].filter(Boolean).join(" · ");
  const seat = [["Seat", seatValue], ["Boards", p.target.start], ["Group", p.target.stage]].filter(([, v]) => v);

  return (
    <div className="relative h-full" style={{ perspective: 900 }}>
      <motion.div
        className="relative h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ [axis]: flipped ? 180 : 0 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 15 }}
      >
        {/* Front */}
        <button
          ref={frontRef}
          type="button"
          data-pass-stub
          onClick={() => setFlipped(true)}
          aria-label={p.email ? `Contact ${p.first}: show email and link` : `Share ${p.first}'s page: show the link`}
          tabIndex={flipped ? -1 : 0}
          className={cx("group relative block h-full w-full cursor-pointer text-left", round, face, FOCUS_RING)}
        >
          {wide ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b-2 border-dashed border-studojo-ink px-5 py-3">
                <span className="font-clash text-lg font-semibold">Stub</span>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-studojo-muted">{flight}</span>
              </div>
              <div className="flex flex-1 flex-col px-5 pb-4 pt-6">
                <div className="flex items-center gap-4">
                  <Portrait photo={p.photo} initials={p.initials} name={p.name} size={80} />
                  <div className="min-w-0">
                    <span className={LABEL}>Passenger</span>
                    <span className="mt-1.5 block font-clash text-lg font-semibold leading-tight">{p.name}</span>
                  </div>
                </div>
                <dl className="mt-6 space-y-2.5 text-[13px]">
                  {seat.map(([k, v]) => (
                    <div key={k} className="flex items-baseline gap-2">
                      <dt className="shrink-0 font-bold uppercase tracking-[0.1em] text-[11px] text-studojo-muted">{k}</dt>
                      <span aria-hidden className="min-w-3 flex-1 translate-y-[-3px] border-b-2 border-dotted border-studojo-ink/30" />
                      <dd className="min-w-0 truncate text-right font-bold">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-auto pt-4">
                  <Barcode slug={p.slug} rows={11} className="block h-[68px] w-full" />
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-[11px] text-studojo-muted">{p.slug}</span>
                    <ContactPill label={p.email ? "Contact" : "Share"} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center gap-4 px-4">
              <Portrait photo={p.photo} initials={p.initials} name={p.name} size={70} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-[13px] font-bold">
                    {seatValue ? (
                      <>
                        <span className="text-[11px] uppercase tracking-[0.12em] text-studojo-muted">Seat </span>
                        {seatValue}
                      </>
                    ) : (
                      p.name
                    )}
                  </span>
                  <ContactPill label={p.email ? "Contact" : "Share"} />
                </div>
                <Barcode slug={p.slug} rows={7} className="mt-2.5 block h-[34px] w-full" />
                <span className="mt-1.5 block truncate font-mono text-[10px] text-studojo-muted">{flight} · {p.slug}</span>
              </div>
            </div>
          )}
        </button>

        {/* Back */}
        <div
          ref={backRef}
          className={cx("absolute inset-0 flex flex-col justify-center bg-studojo-yellow-bg", round, face, wide ? "px-5" : "px-4")}
          style={{ transform: `${axis}(180deg)` }}
          aria-hidden={!flipped}
        >
          {wide && (
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-studojo-purple-strong">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full border-2 border-studojo-ink bg-studojo-purple" />
              {p.email ? `Reach ${p.first}` : `Share ${p.first}’s page`}
            </span>
          )}
          {wide && <span className="mt-2 font-clash text-2xl font-semibold leading-tight">Get to {p.first} first.</span>}
          <div className={wide ? "mt-5 flex flex-col gap-3" : "flex items-center gap-2.5 [&>*]:flex-1"}>
            {p.email ? (
            <a
              href={`mailto:${p.email}?subject=${encodeURIComponent(`Saw your Studojo profile, ${p.first}`)}`}
              tabIndex={flipped ? 0 : -1}
              className={cx(
                "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-purple-strong font-satoshi font-bold text-white",
                wide ? "min-h-12 px-4 text-base" : "min-h-11 px-3 text-sm",
                "shadow-brutal hover:bg-[#5b21b6] active:shadow-[2px_2px_0_0_#191a23]",
                PRESS,
                FOCUS_RING,
              )}
            >
              <FiMail aria-hidden /> Email {p.first}
            </a>
            ) : null}
            <Button
              variant={p.email ? "secondary" : "primary"}
              size={wide ? "md" : "sm"}
              onClick={copy}
              tabIndex={flipped ? 0 : -1}
              aria-live="polite"
              icon={copied ? <FiCheck /> : <FiLink />}
            >
              {copied ? "Copied" : p.email ? "Copy link" : "Copy profile link"}
            </Button>
          </div>
          {wide && <span className="mt-3 truncate text-center font-mono text-[11px] text-studojo-muted">{p.url}</span>}
          <button
            type="button"
            onClick={() => setFlipped(false)}
            tabIndex={flipped ? 0 : -1}
            aria-label="Back to pass"
            className={cx(
              "flex items-center gap-1.5 rounded-lg text-xs font-bold text-studojo-muted hover:text-studojo-ink",
              FOCUS_RING,
              wide ? "mt-4 self-start" : "mt-3 self-center",
            )}
          >
            <FiArrowLeft aria-hidden /> Back to pass
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ContactPill({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-studojo-ink bg-white px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-[2px_2px_0_0_#191a23] transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:bg-studojo-purple-bg">
      {label} <FiRotateCw aria-hidden className="transition-transform duration-300 group-hover:rotate-180" />
    </span>
  );
}
