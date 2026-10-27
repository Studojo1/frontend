// AUDIO-FIX (27 Oct 2026, the owner: "the agent's audio doesn't work on phone"): the homepage's Stu on an iPhone.
// What it guards, with a stand-in browser: the tap that opens the call screen starts the speaker inside the tap (made,
// resume() called and one silent sample played before the tap's handler returns); her line is media playback while
// she talks (navigator.audioSession "playback", and on an iPhone a silent <audio> playing beside her), so the ring/
// silent switch does not silence it; both are let go when she stops; and no part of that is needed (a browser without
// an audio session, a computer) for the words to show.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const log = [];
const session = { type: "auto" };
const audios = [];

class FakeContext {
  constructor() {
    this.state = "suspended";
    this.sampleRate = 48000;
    this.currentTime = 0;
    this.destination = {};
    log.push("new AudioContext");
  }
  resume() {
    log.push("resume");
    this.state = "running";
    return Promise.resolve();
  }
  createBuffer(ch, n, rate) {
    return { ch, n, rate, duration: n / rate };
  }
  createBufferSource() {
    return { connect() {}, start: () => log.push("silent sample") };
  }
}
class FakeAudio {
  constructor(src) {
    this.src = src;
    this.paused = true;
    this.attrs = {};
    audios.push(this);
  }
  setAttribute(k, v) {
    this.attrs[k] = v;
  }
  play() {
    this.paused = false;
    log.push("audio play");
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
    log.push("audio pause");
  }
}

globalThis.window = globalThis;
globalThis.AudioContext = FakeContext;
globalThis.Audio = FakeAudio;
Object.defineProperty(globalThis, "navigator", { value: { userAgent: IPHONE, maxTouchPoints: 5, audioSession: session }, configurable: true });

const { unlockAudio, appleTouch } = await import("../components/home-v2/useSpoken.ts");

// ---------- 1. the tap: everything happens before the handler returns ----------
assert.equal(appleTouch(), true, "an iPhone");
unlockAudio();
assert.deepEqual(log, ["audio play", "new AudioContext", "resume", "silent sample"], "in the tap: the silent <audio>, then the speaker made, started and played through");
assert.equal(session.type, "playback", "her line is media playback (the silent switch lets it through)");
assert.equal(audios.length, 1);
assert.equal(audios[0].loop, true);
assert.match(audios[0].src, /^data:audio\/wav;base64,/, "a silent WAV, no request");
assert.equal(audios[0].attrs.playsinline, "");
assert.equal(audios[0].attrs["x-webkit-airplay"], "deny");

// a second tap keeps the one element and the one speaker
log.length = 0;
unlockAudio();
assert.deepEqual(log, ["audio play", "resume", "silent sample"], "the same element and speaker");
assert.equal(audios.length, 1);

// the silent WAV is a real WAV: RIFF, PCM, mono, 8 kHz, 16-bit, half a second of zeros
const wav = Buffer.from(audios[0].src.split(",")[1], "base64");
assert.equal(wav.toString("ascii", 0, 4), "RIFF");
assert.equal(wav.toString("ascii", 8, 12), "WAVE");
assert.equal(wav.readUInt16LE(20), 1);
assert.equal(wav.readUInt16LE(22), 1);
assert.equal(wav.readUInt32LE(24), 8000);
assert.equal(wav.readUInt16LE(34), 16);
assert.equal(wav.readUInt32LE(40), 8000);
assert.equal(wav.length, 44 + 8000);
assert.ok(wav.subarray(44).every((b) => b === 0));

// ---------- 2. the hook: playback while she talks, let go when she stops ----------
const src = readFileSync(new URL("../components/home-v2/useSpoken.ts", import.meta.url), "utf8");
const say = src.slice(src.indexOf("const say = useCallback("), src.indexOf("return { say, stop"));
assert.ok(say.indexOf("lineStarts();") > 0 && say.indexOf("lineStarts();") < say.indexOf("try {"), "her line holds playback from its start");
assert.match(say, /\} finally \{\s*lineEnds\(\);/, "and lets go once, however it ends (said, stopped, blocked, no voice)");
const settle = src.slice(src.indexOf("function settle()"), src.indexOf("function lineStarts()"));
assert.match(settle, /keeper\?\.pause\(\)/);
assert.match(settle, /if \(sessionType\(\) === "playback"\) setAudioSession\("auto"\);/, "the session back to the browser's choice");
// the tap is what opens the call screen (start.tsx begin, in the click): unlockAudio there, before her line
const start = readFileSync(new URL("../components/home-v2/start.tsx", import.meta.url), "utf8");
const begin = start.slice(start.indexOf("const begin = useCallback("), start.indexOf("const hush"));
assert.ok(begin.indexOf("unlockAudio();") >= 0 && begin.indexOf("unlockAudio();") < begin.indexOf("say()"), "unlocked in the tap, then her line");
const openCall = start.slice(start.indexOf("const openCall = useCallback("), start.indexOf("const closeCall"));
assert.doesNotMatch(openCall.slice(0, openCall.indexOf("begin();")), /await|setTimeout|then\(/, "nothing async between the tap and the unlock");

// ---------- 3. a computer, a browser without an audio session: nothing breaks ----------
Object.defineProperty(globalThis, "navigator", { value: { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/155.0.0.0 Safari/537.36", maxTouchPoints: 0 }, configurable: true });
assert.equal(appleTouch(), false, "a laptop is not an iPhone");
log.length = 0;
unlockAudio();
assert.deepEqual(log, ["resume", "silent sample"], "a laptop: no silent <audio>, the speaker started as before");

console.log("home-v2-audio: ok");
process.exit(0);
