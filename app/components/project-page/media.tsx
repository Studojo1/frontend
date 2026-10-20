// Images, PDFs, embeds and web builds. Every src was checked by pageView()
// (contract 3.2); the iframe attributes are the contract's, section 4.
import { FiArrowUpRight } from "react-icons/fi";
import { LINK_REL, type BlockView } from "./view";

type Of<T extends BlockView["type"]> = Extract<BlockView, { type: T }>;

const label = "text-[12px] font-bold uppercase tracking-[0.12em] text-(--pp-accent)";

export function Image({ b }: { b: Of<"image"> }) {
  return (
    <figure>
      <img
        src={b.src}
        alt={b.alt}
        width={b.width}
        height={b.height}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full rounded-xl border border-(--pp-line) bg-(--pp-surface)"
        style={{ aspectRatio: `${b.width} / ${b.height}` }}
      />
      {b.caption && <figcaption className="mt-3 text-[14px] leading-snug text-(--pp-muted)">{b.caption}</figcaption>}
    </figure>
  );
}

export function FileLink({ b }: { b: Of<"file"> }) {
  return (
    <a
      href={b.href}
      target="_blank"
      rel={LINK_REL}
      className="group flex max-w-[640px] items-center gap-4 rounded-2xl border border-(--pp-line) bg-(--pp-surface) p-4 transition-colors hover:border-(--pp-ink) sm:p-5"
    >
      <span aria-hidden="true" className="flex h-12 w-10 flex-none items-end justify-center rounded-[6px] bg-(--pp-accent) pb-1.5 text-[10px] font-black tracking-[0.06em] text-(--pp-on-accent)">
        PDF
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold leading-snug break-words">{b.name}</span>
        <span className="mt-0.5 block text-[13.5px] text-(--pp-muted)">{b.size ? `PDF, ${b.size}` : "PDF"}</span>
      </span>
      <span className="flex flex-none items-center gap-1 text-[14px] font-bold">
        Open
        <FiArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </a>
  );
}

const ASPECT = { "16:9": "16 / 9", "4:3": "4 / 3", "1:1": "1 / 1", "3:4": "3 / 4" } as const;
// Square and portrait embeds would be taller than a screen at full width.
const ASPECT_WIDTH = { "16:9": "", "4:3": "", "1:1": "max-w-[560px]", "3:4": "max-w-[460px]" } as const;

export function Embed({ b }: { b: Of<"embed"> }) {
  return (
    <figure className={ASPECT_WIDTH[b.aspect]}>
      <figcaption className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={label}>{b.providerName}</span>
        <span className="text-[15px] font-bold leading-snug">{b.title}</span>
      </figcaption>
      <div className="overflow-hidden rounded-xl border border-(--pp-line) bg-(--pp-surface)" style={{ aspectRatio: ASPECT[b.aspect] }}>
        <iframe
          src={b.src}
          title={b.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
          className="block h-full w-full border-0"
        />
      </div>
    </figure>
  );
}

export function WebBuild({ b }: { b: Of<"web"> }) {
  return (
    <figure>
      <figcaption className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={label}>Live build</span>
        <span className="text-[15px] font-bold leading-snug">{b.title}</span>
      </figcaption>
      <div className="overflow-hidden rounded-xl border border-(--pp-line) bg-white">
        {/* allow-forms: without it a browser stops a form before its submit event, so the build's own JavaScript never
            sees it; career-agent's CSP on these files has form-action 'none', so nothing is ever submitted. */}
        <iframe src={b.src} title={b.title} sandbox="allow-scripts allow-forms" referrerPolicy="no-referrer" className="block w-full border-0" style={{ height: b.height }} />
      </div>
    </figure>
  );
}
