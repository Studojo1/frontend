// RECORDINGS (5 Nov 2026): the session recorder, loaded only by recordings/boot.ts (a separate chunk, after the page has
// painted and gone idle) and only when RECORDINGS is on. rrweb's record: the page's DOM and its changes, mouse and
// scroll, never audio, canvas or other sites' frames. Every event goes through the privacy rules
// (recordings/recorder-rules.ts) before it leaves; chunks are gzip, sent every 10 s and when the tab is hidden, to
// the platform's POST api/rec (Studojo1/career-agent app/lib/recordings/ingest.server.ts), cookies included, so the
// website's pages and the platform's are one visit. The same file is career-agent's app/lib/client/recorder.ts.
import { record } from "@rrweb/record";
import {
  BLOCKED, MASKED_AREAS, VISIT_MAX_MS, maskText, newVisit, offCookie, randomId, scrubEvent, visitCookie, visitFromCookie,
  type Visit,
} from "./recorder-rules";

export interface RecorderConfig {
  /** POST address of chunks: "/api/rec" on the platform, the platform's absolute one on the website. */
  endpoint: string;
  /** Pages never recorded (staff pages, addresses carrying a token): recording stops on reaching one. */
  excluded?: (pathname: string, search: string) => boolean;
}

type Ev = { type: number; data: unknown; timestamp: number };

const FLUSH_MS = 10_000;
/** Past this much JSON waiting, send now. */
const FLUSH_CHARS = 400_000;
/** A page load stops after this many chunks (a tab left open for hours). */
const MAX_CHUNKS = 600;

let running = false;

async function gzip(text: string): Promise<ArrayBuffer> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Response(stream).arrayBuffer();
}

export function startRecorder(cfg: RecorderConfig): void {
  if (running || typeof window === "undefined") return;
  running = true;
  const { hostname, protocol } = window.location;
  const secure = protocol === "https:";
  const began = Date.now();
  const visit: Visit = visitFromCookie(document.cookie, began) ?? newVisit(began);
  const pageLoad = randomId(8);
  let seq = 0;
  let buf: Ev[] = [];
  let chars = 0;
  let paths: string[] = [window.location.pathname];
  let lastPath = window.location.pathname;
  let stopped = false;
  let backoffUntil = 0;
  let sending: Promise<void> = Promise.resolve();
  let timer = 0;
  const touch = (navigator.maxTouchPoints ?? 0) > 1 ? "1" : "0";

  const saveVisit = () => {
    visit.last = Date.now();
    try {
      document.cookie = visitCookie(visit, hostname, secure);
    } catch {
      // cookies blocked: this page load keeps its visit
    }
  };

  const end = (silent = false) => {
    if (stopped) return;
    stopped = true;
    try {
      stopRecord?.();
    } catch {
      // already stopped
    }
    window.clearInterval(timer);
    buf = [];
    if (!silent) {
      try {
        document.cookie = offCookie(hostname, secure);
      } catch {
        // nothing to remember it in
      }
    }
  };

  const send = (events: Ev[], sentPaths: string[]) => {
    const n = seq++;
    if (n >= MAX_CHUNKS || Date.now() - visit.start > VISIT_MAX_MS) {
      end(true);
      return;
    }
    const q = new URLSearchParams({ s: visit.id, p: pageLoad, n: String(n), t: String(events[0].timestamp), e: String(events[events.length - 1].timestamp), touch });
    for (const p of sentPaths) q.append("path", p);
    sending = sending
      .then(async () => {
        const body = await gzip(JSON.stringify(events));
        const res = await fetch(`${cfg.endpoint}?${q}`, {
          method: "POST",
          body,
          credentials: "include",
          keepalive: body.byteLength < 60_000,
          headers: { "Content-Type": "text/plain" },
        });
        if (res.status === 429) backoffUntil = Date.now() + 30_000;
        if (res.status === 200) {
          const j = (await res.json().catch(() => null)) as { stop?: boolean } | null;
          if (j?.stop) end();
        }
        saveVisit();
      })
      .catch(() => {
        // a lost chunk costs that part of the replay only
      });
  };

  const flush = () => {
    if (stopped || !buf.length || Date.now() < backoffUntil) return;
    const events = buf;
    const sentPaths = paths;
    buf = [];
    chars = 0;
    paths = [lastPath];
    send(events, sentPaths);
  };

  const onPath = () => {
    const { pathname, search } = window.location;
    if (pathname === lastPath) return;
    if (cfg.excluded?.(pathname, search)) {
      flush();
      end(true);
      return;
    }
    lastPath = pathname;
    if (!paths.includes(pathname)) paths.push(pathname);
    // A marker on the replay's timeline at each page change (the admin's player shows it).
    try {
      record.addCustomEvent("page", { path: pathname });
    } catch {
      // not recording yet
    }
  };

  let stopRecord: (() => void) | undefined;
  try {
    stopRecord = record({
      emit(e: Ev) {
        if (stopped) return;
        const ev = scrubEvent(e);
        buf.push(ev);
        chars += ev.type === 2 ? 200_000 : 300;
        if (ev.type !== 5) onPath();
        if (ev.type === 2 || chars > FLUSH_CHARS) queueMicrotask(flush);
      },
      maskAllInputs: true,
      maskTextSelector: "*",
      maskTextFn: (text: string, el: HTMLElement | null) => maskText(text, el, MASKED_AREAS),
      blockSelector: BLOCKED,
      recordCanvas: false,
      recordCrossOriginIframes: false,
      collectFonts: false,
      inlineImages: false,
      sampling: { mousemove: 100, scroll: 200, media: 1000, input: "last" },
      slimDOMOptions: { script: true, comment: true, headFavicon: true, headWhitespace: true, headMetaSocial: true, headMetaRobots: true, headMetaHttpEquiv: true, headMetaAuthorship: true, headMetaVerification: true },
    }) as (() => void) | undefined;
  } catch {
    stopRecord = undefined;
  }
  if (!stopRecord) {
    running = false;
    return;
  }
  saveVisit();
  timer = window.setInterval(() => {
    onPath();
    flush();
  }, FLUSH_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);
}
