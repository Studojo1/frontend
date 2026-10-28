// HOMEPAGE V2: Stu saying /b2cnew/join's line on the homepage, in the browser. A copy of career-agent's
// app/lib/voice/spoken.ts (useSpoken) for its one line, so it behaves the same: one speaker for the visit, unlocked
// by the visitor's tap (a browser plays sound only after a click on the page); resume() raced with 300 ms; a browser
// that still will not play shows the words in full at once (blocked); the recording scheduled at currentTime + 0.05;
// the words light up 0.3 s ahead of her voice; her level for the face; done by the audio clock, or by the wall clock
// 1.5 s after it if the audio clock stalls; no voice (a bad fetch or clip) shows the words in full.
// AUDIO-FIX (27 Oct 2026, the owner: "the agent's audio doesn't work on phone"), as career-agent's audio-unlock.ts:
// on an iPhone, sound from Web Audio alone is ambient sound (WebKit MediaSessionManagerCocoa picks AmbientSound when
// only Web Audio plays), which the ring/silent switch silences, so a phone on silent showed her words and played
// nothing. While she talks her line is media playback instead: the page's audio session (navigator.audioSession,
// Safari 17 and later) is "playback", and on an iPhone or iPad a silent <audio> plays beside her (a playing media
// element makes the session MediaPlayback on any iOS version, in any app's browser). Both stop when she does. The
// tap also plays one silent sample through the speaker, which older iPhones need to start it.
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

interface AudioSessionLike {
  type: string;
}

/** The page's audio session (Safari 17 and later); elsewhere nothing happens. */
export function setAudioSession(type: "auto" | "playback"): void {
  try {
    const s = (navigator as Navigator & { audioSession?: AudioSessionLike }).audioSession;
    if (s && s.type !== type) s.type = type;
  } catch {
    // refused: the browser's own choice stands
  }
}

function sessionType(): string | null {
  try {
    return (navigator as Navigator & { audioSession?: AudioSessionLike }).audioSession?.type ?? null;
  } catch {
    return null;
  }
}

/** An iPhone or iPad (an iPad says it is a Mac, but has a touch screen). */
export function appleTouch(): boolean {
  try {
    const ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  } catch {
    return false;
  }
}

/** Half a second of silence, as a WAV. */
function silentWav(): string {
  const rate = 8000;
  const n = rate / 2;
  const v = new DataView(new ArrayBuffer(44 + n * 2));
  const tag = (at: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(at + i, s.charCodeAt(i));
  };
  tag(0, "RIFF");
  v.setUint32(4, 36 + n * 2, true);
  tag(8, "WAVE");
  tag(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  tag(36, "data");
  v.setUint32(40, n * 2, true);
  const bytes = new Uint8Array(v.buffer);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(s)}`;
}

let keeper: HTMLAudioElement | null = null;

/** iPhone: the silent <audio> beside her (its first play must be in a tap; later ones may start from her line). */
function keep(): void {
  if (!appleTouch()) return;
  try {
    if (!keeper) {
      keeper = new Audio(silentWav());
      keeper.loop = true;
      keeper.preload = "auto";
      keeper.setAttribute("playsinline", "");
      keeper.setAttribute("x-webkit-airplay", "deny");
      keeper.disableRemotePlayback = true;
    }
    void keeper.play().catch(() => undefined);
  } catch {
    // no media element here: the session alone
  }
}

/** Her line playing now (say runs), and the wait for one after a tap. */
let talking = 0;
let idle: ReturnType<typeof setTimeout> | null = null;

function settle(): void {
  try {
    keeper?.pause();
  } catch {
    // already stopped
  }
  if (sessionType() === "playback") setAudioSession("auto");
}

function lineStarts(): void {
  talking++;
  if (idle) {
    clearTimeout(idle);
    idle = null;
  }
  setAudioSession("playback");
  keep();
}

function lineEnds(): void {
  talking = Math.max(0, talking - 1);
  if (!talking) settle();
}

/** Call inside a click: her line can play (past an iPhone's silent switch too). */
export function unlockAudio(): void {
  setAudioSession("playback");
  keep();
  if (idle) clearTimeout(idle);
  idle = setTimeout(() => {
    idle = null;
    if (!talking) settle();
  }, 5000);
  try {
    const c = audioContext();
    void c.resume().catch(() => undefined);
    // one silent sample: older iPhones start the speaker only once something has played through it in a tap
    const s = c.createBufferSource();
    s.buffer = c.createBuffer(1, 1, c.sampleRate);
    s.connect(c.destination);
    s.start(0);
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
    lineStarts();
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
      lineEnds();
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
