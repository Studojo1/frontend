// One component per block type of a launched project page (contract section 3).
// Every string arrives already checked and cleaned by pageView() (./view.ts) and
// is drawn as React text: no HTML, no markdown, nothing parsed.
import type { ReactNode } from "react";
import { FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { Chart } from "./chart";
import { Model, Table } from "./data";
import { Embed, FileLink, Image, WebBuild } from "./media";
import { LINK_REL, type BlockView, type ParaView, type SpanView } from "./view";

type Of<T extends BlockView["type"]> = Extract<BlockView, { type: T }>;

function Span({ s }: { s: SpanView }) {
  let el: ReactNode = s.t;
  if (s.i) el = <em>{el}</em>;
  if (s.b) el = <strong className="font-bold">{el}</strong>;
  if (s.href)
    el = (
      <a href={s.href} rel={LINK_REL} target="_blank" className="pp-link">
        {el}
      </a>
    );
  return <>{el}</>;
}

const spans = (list: SpanView[]) => list.map((s, i) => <Span key={i} s={s} />);

export function Rich({ rich }: { rich: ParaView[] }) {
  return (
    <div className="pp-rich space-y-4">
      {rich.map((p, i) => {
        if (p.kind === "p") return <p key={i}>{spans(p.spans)}</p>;
        const items = p.items.map((it, j) => <li key={j}>{spans(it)}</li>);
        return p.kind === "ul" ? (
          <ul key={i} className="space-y-2.5">
            {items}
          </ul>
        ) : (
          <ol key={i} className="space-y-3">
            {items}
          </ol>
        );
      })}
    </div>
  );
}

// The page title is the only h1, so a level 1 heading block is an h2.
export function Heading({ b }: { b: Of<"heading"> }) {
  if (b.level === 1) return <h2 className="pp-head text-[30px] font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-[42px]">{b.text}</h2>;
  if (b.level === 2) return <h3 className="pp-head text-[24px] font-semibold leading-[1.15] tracking-[-0.015em] text-balance sm:text-[30px]">{b.text}</h3>;
  return <h4 className="pp-head text-[19px] font-semibold leading-[1.25] sm:text-[22px]">{b.text}</h4>;
}

export function Text({ b }: { b: Of<"text"> }) {
  return (
    <div className="max-w-[66ch] text-[17px] leading-[1.7] sm:text-[18px]">
      <Rich rich={b.rich} />
    </div>
  );
}

const METRIC_COLS: Record<number, string> = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-3", 6: "sm:grid-cols-3" };

export function Metrics({ b }: { b: Of<"metrics"> }) {
  return (
    <dl className={`grid grid-cols-2 gap-x-5 gap-y-7 sm:gap-x-8 ${METRIC_COLS[b.items.length]}`}>
      {b.items.map((m, i) => (
        <div key={i} className="min-w-0 border-t-2 border-(--pp-ink) pt-3 last:odd:col-span-2 sm:last:odd:col-span-1">
          <dt className="text-[12px] font-bold uppercase leading-snug tracking-[0.1em] text-(--pp-muted)">{m.label}</dt>
          <dd className="pp-head mt-2 text-[34px] font-semibold leading-none tracking-[-0.02em] break-words sm:text-[46px]">{m.value}</dd>
          {m.note && <dd className="mt-2.5 text-[13px] leading-snug text-(--pp-muted)">{m.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function Quote({ b }: { b: Of<"quote"> }) {
  return (
    <figure className="max-w-[46ch] border-l-[3px] border-(--pp-accent) py-1 pl-5 sm:pl-8">
      <blockquote className="pp-head text-[25px] font-semibold leading-[1.18] tracking-[-0.015em] sm:text-[34px]">
        <p>
          {"“"}
          {b.text}
          {"”"}
        </p>
      </blockquote>
      {b.by && <figcaption className="mt-4 text-[14px] text-(--pp-muted)">{b.by}</figcaption>}
    </figure>
  );
}

const TONE = {
  note: { box: "bg-(--pp-surface) border border-(--pp-line)", icon: "text-(--pp-muted)", Icon: FiInfo },
  result: { box: "bg-(--pp-accent-soft)", icon: "text-(--pp-accent)", Icon: FiCheckCircle },
  caution: { box: "bg-(--pp-warn-soft)", icon: "text-(--pp-warn)", Icon: FiAlertTriangle },
} as const;

export function Callout({ b }: { b: Of<"callout"> }) {
  const t = TONE[b.tone];
  return (
    <aside className={`flex max-w-[70ch] gap-3.5 rounded-2xl px-5 py-5 sm:gap-4 sm:px-6 sm:py-6 ${t.box}`}>
      <t.Icon aria-hidden="true" className={`mt-[5px] h-5 w-5 flex-none ${t.icon}`} />
      <div className="min-w-0 text-[17px] leading-[1.6] sm:text-[18px]">
        <span className="sr-only">{b.label}: </span>
        <Rich rich={b.rich} />
      </div>
    </aside>
  );
}

export function Timeline({ b }: { b: Of<"timeline"> }) {
  return (
    <ol className="ml-1.5 max-w-[66ch] border-l-2 border-(--pp-line)">
      {b.items.map((it, i) => (
        <li key={i} className="relative pb-7 pl-7 last:pb-0">
          <span aria-hidden="true" className="absolute top-[5px] -left-[8px] h-3.5 w-3.5 rounded-full border-[3px] border-(--pp-bg) bg-(--pp-accent)" />
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-(--pp-accent)">{it.when}</p>
          <p className="mt-1 text-[17px] leading-[1.55]">{it.what}</p>
        </li>
      ))}
    </ol>
  );
}

export function Divider() {
  return <hr className="mx-auto w-20 border-0 border-t-2 border-(--pp-accent)" />;
}

/** The space above a block: wide before a section heading, tight under one. */
export function gapAbove(prev: BlockView | undefined, cur: BlockView): string {
  if (!prev) return "";
  if (cur.type === "heading") return cur.level === 1 ? "mt-16 sm:mt-24" : cur.level === 2 ? "mt-12 sm:mt-16" : "mt-10 sm:mt-12";
  if (prev.type === "heading") return "mt-4 sm:mt-5";
  if (cur.type === "divider" || prev.type === "divider") return "mt-14 sm:mt-20";
  return "mt-10 sm:mt-14";
}

export function Block({ b }: { b: BlockView }) {
  switch (b.type) {
    case "heading":
      return <Heading b={b} />;
    case "text":
      return <Text b={b} />;
    case "image":
      return <Image b={b} />;
    case "table":
      return <Table b={b} />;
    case "chart":
      return <Chart b={b} />;
    case "metrics":
      return <Metrics b={b} />;
    case "model":
      return <Model b={b} />;
    case "quote":
      return <Quote b={b} />;
    case "callout":
      return <Callout b={b} />;
    case "timeline":
      return <Timeline b={b} />;
    case "file":
      return <FileLink b={b} />;
    case "embed":
      return <Embed b={b} />;
    case "web":
      return <WebBuild b={b} />;
    case "divider":
      return <Divider />;
    default:
      return null;
  }
}
