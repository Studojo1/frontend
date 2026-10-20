// A launched project page at /<handle>/<slug>: the "Canvas" look. A header
// (topics, a big title, the summary, then a strip with the student, the
// project kind and the launch date), the student's blocks in one editorial
// column, and Studojo's fixed footer with the report link. Colours and fonts
// come from the page's theme (view.ts themeVars); the data rules live in pageView().
import { useEffect, type CSSProperties } from "react";
import { FiFlag } from "react-icons/fi";
import { Block, gapAbove } from "./blocks";
import type { PageView } from "./view";
import "./project-page.css";

/** One view a browser session, sent after hydration (contract 4). */
function useViewBeacon(id: number, href: string) {
  useEffect(() => {
    const key = `sj_launch_view_${id}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked: count this load; the server limits a visitor anyway.
    }
    try {
      navigator.sendBeacon?.(href);
    } catch {
      // A view count must never break the page.
    }
  }, [id, href]);
}

function Header({ page }: { page: PageView }) {
  const topics = [page.company && `Built for ${page.company}`, ...page.skills].filter(Boolean);
  const s = page.student;
  return (
    <header>
      {topics.length > 0 && <p className="text-[12px] font-bold uppercase leading-relaxed tracking-[0.16em] text-(--pp-accent) sm:text-[13px]">{topics.join("  ·  ")}</p>}
      <h1 className="pp-head mt-4 text-[40px] font-semibold leading-[1.02] tracking-[-0.03em] text-balance break-words sm:mt-5 sm:text-[68px]">{page.title}</h1>
      {page.summary && <p className="mt-5 max-w-[62ch] text-[18px] leading-[1.55] text-(--pp-muted) sm:mt-6 sm:text-[21px]">{page.summary}</p>}
      <div className="mt-8 flex flex-col gap-3 border-y border-(--pp-line) py-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="pp-head flex h-10 w-10 flex-none items-center justify-center rounded-full bg-(--pp-accent-soft) text-[17px] font-semibold text-(--pp-accent)">
            {s.initial}
          </span>
          <div className="min-w-0">
            {s.profileHref ? (
              // A full page load: the student's page has its own headers.
              <a href={s.profileHref} className="text-[16px] font-bold underline decoration-(--pp-line) decoration-2 underline-offset-4 transition-colors hover:decoration-(--pp-accent)">
                {s.name}
              </a>
            ) : (
              <span className="text-[16px] font-bold">{s.name}</span>
            )}
            {s.about && <p className="text-[14px] leading-snug text-(--pp-muted)">{s.about}</p>}
          </div>
        </div>
        <p className="flex flex-none flex-wrap items-center gap-x-2 text-[14px] text-(--pp-muted) sm:justify-end">
          <span className="rounded-full bg-(--pp-accent-soft) px-2.5 py-0.5 text-[12.5px] font-bold text-(--pp-accent)">{page.kind}</span>
          {page.launched && <span>Launched {page.launched}</span>}
        </p>
      </div>
    </header>
  );
}

function Footer({ reportHref }: { reportHref: string }) {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-studojo-ink bg-white font-satoshi text-studojo-ink" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto flex h-14 max-w-[880px] items-center justify-between gap-3 px-4 text-[14px] sm:px-8 sm:text-[15px]">
        <p className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="h-2.5 w-2.5 flex-none rounded-full bg-studojo-purple-strong" />
          <span className="truncate">
            Made by a student on{" "}
            <a href="/" className="font-black tracking-[-0.01em] hover:text-studojo-purple-strong">
              Studojo
            </a>
            .
          </span>
        </p>
        <a href={reportHref} className="inline-flex min-h-[44px] flex-none items-center gap-1.5 font-medium underline decoration-1 underline-offset-4 hover:text-studojo-purple-strong">
          <FiFlag aria-hidden="true" className="h-4 w-4" />
          Report this page
        </a>
      </div>
    </footer>
  );
}

export default function ProjectPage({ page }: { page: PageView }) {
  useViewBeacon(page.id, page.viewHref);
  return (
    <div className="pp min-h-screen" style={page.vars as CSSProperties} data-theme={page.theme} data-fonts={page.fonts}>
      <main id="main" tabIndex={-1} className="mx-auto max-w-[880px] px-4 pt-10 pb-36 focus:outline-none sm:px-8 sm:pt-20 sm:pb-40">
        <Header page={page} />
        {page.cover && <img src={page.cover} alt="" className="mt-10 block h-auto w-full rounded-2xl border border-(--pp-line) bg-(--pp-surface)" />}
        <div className="mt-12 sm:mt-16">
          {page.blocks.map((b, i) => (
            <div key={b.id} className={`min-w-0 ${gapAbove(page.blocks[i - 1], b)}`}>
              <Block b={b} />
            </div>
          ))}
        </div>
      </main>
      <Footer reportHref={page.reportHref} />
    </div>
  );
}
