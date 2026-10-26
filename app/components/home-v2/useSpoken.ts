// HOMEPAGE V2: Stu saying /b2cnew/join's line on the homepage, in the browser. A copy of career-agent's
// app/lib/voice/spoken.ts (useSpoken) for its one line, so it behaves the same: one speaker for the visit, unlocked
// by the visitor's tap (a browser plays sound only after a click on the page); resume() raced with 300 ms; a browser
// that still will not play shows the words in full at once (blocked); the recording scheduled at currentTime + 0.05;
// the words light up 0.3 s ahead of her voice; her level for the face; done by the audio clock, or by the wall clock
// 1.5 s after it if the audio clock stalls; no voice (a bad fetch or clip) shows the words in full.
// Nothing here runs on the server but the first, silent render.
import { useCallback, useEffect, useRef, useState } from "react";
import { JOIN_AUDIO, JOIN_LINE, saidAt } from "./agent";

let shared: AudioContext | null = null;

/** The visit's one speaker for Stu's line. */
function audioContext(): AudioContext {
  if (!shared || shared.state === "closed") {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    shared = new Ctx();
  }
  return shared;
}

/** Call inside a click: her line can play. */
export function unlockAudio(): void {
  try {
    void audioContext().resume();
  } catch {
    // no audio in this browser: the words still show
  }
}

/** Her words light up this far ahead of her voice (spoken.ts READ_AHEAD_S). */
const READ_AHEAD_S = 0.3;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let bytes: Promise<ArrayBuffer> | null = null;
/** The recording, fetched once per visit (the browser keeps it: its address changes only with its words). */
export function fetchLine(): Promise<ArrayBuffer> {
  if (!bytes) {
    bytes = fetch(JOIN_AUDIO).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.arrayBuffer();
    });
    bytes.catch(() => {
      bytes = null;
    });
  }
  return bytes;
}

export interface Spoken {
  /** Say the line; resolves when she has finished (or could not speak). */
  say: () => Promise<void>;
  stop: () => void;
  speaking: boolean;
  /** How many characters of the line she has said. */
  at: number;
  /** Her level, read every frame by her face. */
  level: { agent: number };
}

export function useSpoken(): Spoken {
  const nodes = useRef<AudioBufferSourceNode[]>([]);
  const raf = useRef(0);
  const run = useRef(0);
  const level = useRef({ agent: 0 });
  const [speaking, setSpeaking] = useState(false);
  const [at, setAt] = useState(0);

  const silence = useCallback(() => {
    cancelAnimationFrame(raf.current);
    for (const n of nodes.current) {
      try {
        n.stop();
      } catch {
        // already stopped
      }
    }
    nodes.current = [];
    level.current.agent = 0;
  }, []);

  const stop = useCallback(() => {
    run.current++;
    silence();
    setSpeaking(false);
  }, [silence]);

  useEffect(() => () => stop(), [stop]);

  const say = useCallback(async () => {
    const my = ++run.current;
    silence();
    const all = JOIN_LINE.length;
    setAt(0);
    const live = () => run.current === my;
    try {
      const c = audioContext();
      await Promise.race([c.resume().catch(() => undefined), sleep(300)]);
      if (!live()) return;
      if (c.state !== "running") {
        setAt(all);
        return;
      }
      const buf = await c.decodeAudioData((await fetchLine()).slice(0));
      if (!live()) return;
      const an = c.createAnalyser();
      an.fftSize = 512;
      an.connect(c.destination);
      const node = c.createBufferSource();
      node.buffer = buf;
      node.connect(an);
      const t = c.currentTime + 0.05;
      node.start(t);
      nodes.current.push(node);
      const end = t + buf.duration;
      setSpeaking(true);
      const data = new Uint8Array(an.fftSize);
      const tick = () => {
        if (!live()) return;
        raf.current = requestAnimationFrame(tick);
        an.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += ((v - 128) / 128) ** 2;
        level.current.agent = level.current.agent * 0.6 + Math.min(1, Math.sqrt(sum / data.length) * 4) * 0.4;
        setAt(saidAt(c.currentTime + READ_AHEAD_S, t, buf.duration, all));
      };
      tick();
      const deadline = performance.now() + (end - c.currentTime) * 1000 + 1500;
      while (live() && c.currentTime < end && performance.now() < deadline) await sleep(100);
      if (live()) setAt(all);
    } catch {
      if (live()) setAt(all);
    } finally {
      if (live()) {
        cancelAnimationFrame(raf.current);
        level.current.agent = 0;
        nodes.current = [];
        setSpeaking(false);
      }
    }
  }, [silence]);

  return { say, stop, speaking, at, level: level.current };
}
