// The agent stream client: frame parsing, a full turn, refusals, a dropped
// body and resume by polling. Frames are the contract section 4 examples.
import assert from "node:assert/strict";
import { cancelRun, followRun, parseSse, sendTurn } from "./stream.ts";
import { applyEvent, isBusy, newLive, toMessage } from "../../components/desk/agent/live.ts";

const FRAMES = [
  { seq: 1, type: "run_start", run_id: 88, thread_id: 31, user_message_id: 501 },
  { seq: 2, type: "text", delta: "Looking at your top matches" },
  { seq: 3, type: "tool_start", call_id: "c1", tool: "draft_emails", label: "Writing 5 emails" },
  { seq: 4, type: "tool_end", call_id: "c1", tool: "draft_emails", ok: true, summary: "5 drafts ready", invalidate: ["outreach", "matches", "status"] },
  { seq: 5, type: "navigate", to: "home", id: null, filter: "needs_you" },
  { seq: 6, type: "suggestions", items: [{ label: "Make it shorter", prompt: "Make the last draft shorter." }] },
  { seq: 7, type: "message_end", message_id: 502, content: "5 drafts are in Home under Needs you." },
  { seq: 8, type: "done", run_id: 88, status: "done", invalidate: ["outreach", "matches", "status"], usage: { messages_today: 4, messages_cap: 60 } },
];
const sse = (frames) => frames.map((f) => `data: ${JSON.stringify(f)}\n\n`).join("");

// ---- parseSse: whole text, split at every byte, CRLF, pings, junk
{
  const whole = parseSse(`: ping\n\n${sse(FRAMES)}`, "");
  assert.deepEqual(whole.events, FRAMES);
  assert.equal(whole.buffer, "");

  const text = sse(FRAMES);
  let buf = "";
  const got = [];
  for (const ch of text) {
    const r = parseSse(ch, buf);
    buf = r.buffer;
    got.push(...r.events);
  }
  assert.deepEqual(got, FRAMES, "byte by byte");

  const crlf = parseSse(text.replace(/\n/g, "\r\n"), "");
  assert.equal(crlf.events.length, FRAMES.length, "CRLF frames");

  const junk = parseSse("data: {not json\n\ndata: 7\n\n: ping\n\nevent: x\n\n", "");
  assert.equal(junk.events.length, 0, "junk and comments are dropped");

  const partial = parseSse('data: {"seq":1,"type":"te', "");
  assert.equal(partial.events.length, 0);
  assert.equal(partial.buffer, 'data: {"seq":1,"type":"te');
}

// ---- fetch stubs
function streamOf(chunks, { failAfter = false } = {}) {
  const enc = new TextEncoder();
  let i = 0;
  return new ReadableStream({
    pull(c) {
      if (i < chunks.length) c.enqueue(enc.encode(chunks[i++]));
      else if (failAfter) c.error(new TypeError("network lost"));
      else c.close();
    },
  });
}
const calls = [];
function stub(handler) {
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url, init });
    return handler(url, init);
  };
}
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const BODY = { content: "Write to my top 5", client_turn_id: "t-1", page_context: { route: "home" } };

// ---- a full turn
{
  stub(() => new Response(streamOf([sse(FRAMES.slice(0, 3)), sse(FRAMES.slice(3))]), { status: 200 }));
  const seen = [];
  const out = await sendTurn(31, BODY, { signal: new AbortController().signal, onEvent: (e) => seen.push(e.type) });
  assert.equal(out.kind, "finished");
  assert.equal(out.runId, 88);
  assert.equal(out.lastSeq, 8);
  assert.equal(out.terminal.type, "done");
  assert.deepEqual(seen, FRAMES.map((f) => f.type));
  const req = calls.at(-1);
  assert.equal(req.url, "/api/v1/outreach/agent/threads/31/messages");
  assert.equal(req.init.method, "POST");
  assert.equal(req.init.credentials, "include");
  assert.deepEqual(JSON.parse(req.init.body), BODY, "page context and turn id go with the message");
}

// ---- refusals read detail
{
  stub(() => json(409, { detail: { code: "duplicate_turn", message: "Already working on that.", run_id: 88 } }));
  const out = await sendTurn(31, BODY, { signal: new AbortController().signal, onEvent: () => {} });
  assert.equal(out.kind, "refused");
  assert.equal(out.failure.status, 409);
  assert.equal(out.failure.detail.code, "duplicate_turn");
  assert.equal(out.failure.detail.run_id, 88);

  stub(() => new Response("<html>bad gateway</html>", { status: 502 }));
  const html = await sendTurn(31, BODY, { signal: new AbortController().signal, onEvent: () => {} });
  assert.equal(html.kind, "refused");
  assert.equal(html.failure.detail, null);
  assert.match(html.failure.message, /Please try again/);

  stub(() => {
    throw new TypeError("Failed to fetch");
  });
  const net = await sendTurn(31, BODY, { signal: new AbortController().signal, onEvent: () => {} });
  assert.equal(net.kind, "network");
}

// ---- a dropped body, then resume by polling
{
  stub(() => new Response(streamOf([sse(FRAMES.slice(0, 4))], { failAfter: true }), { status: 200 }));
  const out = await sendTurn(31, BODY, { signal: new AbortController().signal, onEvent: () => {} });
  assert.equal(out.kind, "dropped");
  assert.equal(out.runId, 88);
  assert.equal(out.lastSeq, 4);

  let polls = 0;
  stub((url) => {
    polls += 1;
    const after = Number(new URL(url, "http://x").searchParams.get("after_seq"));
    if (polls === 1) {
      assert.equal(after, 4, "resume asks only for what was missed");
      return json(200, { run: { id: 88, status: "running" }, events: FRAMES.slice(4, 6).concat([FRAMES[1]]), message: null });
    }
    assert.equal(after, 6);
    return json(200, { run: { id: 88, status: "done" }, events: FRAMES.slice(6), message: { id: 502, content: "5 drafts are in Home under Needs you." } });
  });
  const replayed = [];
  const poll = await followRun(88, out.lastSeq, { intervalMs: 1, onEvent: (e) => replayed.push(e.seq) });
  assert.deepEqual(replayed, [5, 6, 7, 8], "in order, no repeats");
  assert.equal(poll.message.id, 502);

  stub(() => json(404, { detail: { code: "not_found", message: "Not found." } }));
  await assert.rejects(followRun(99, 0, { intervalMs: 1, onEvent: () => {} }), /Not found/);
}

// ---- abort and cancel
{
  const ctl = new AbortController();
  stub((_u, init) => new Promise((_r, reject) => init.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })))));
  const p = sendTurn(31, BODY, { signal: ctl.signal, onEvent: () => {} });
  ctl.abort();
  assert.equal((await p).kind, "aborted");

  stub(() => json(200, { ok: true, status: "cancelled" }));
  const c = await cancelRun(88);
  assert.equal(c.status, "cancelled");
  assert.equal(calls.at(-1).url, "/api/v1/outreach/agent/runs/88/cancel");
  assert.equal(calls.at(-1).init.method, "POST");
}

// ---- the panel's live turn reducer over the same frames
{
  let live = newLive({ clientTurnId: "t-1", content: "Write to my top 5", localUserId: -1 });
  assert.equal(isBusy(live), true);
  for (const f of FRAMES) live = applyEvent(live, f);
  assert.equal(live.runId, 88);
  assert.equal(live.lastSeq, 8);
  assert.equal(live.phase, "streaming");
  assert.deepEqual(live.steps, [{ call_id: "c1", tool: "draft_emails", label: "Writing 5 emails", ok: true, summary: "5 drafts ready" }]);
  assert.deepEqual(live.invalidate.sort(), ["matches", "outreach", "status"]);
  assert.deepEqual(live.navigate, { to: "home", id: null, filter: "needs_you" });
  assert.equal(live.status, "done");
  const msg = toMessage(live);
  assert.equal(msg.id, 502);
  assert.equal(msg.content, "5 drafts are in Home under Needs you.", "message_end replaces the streamed text");
  assert.equal(msg.suggestions[0].label, "Make it shorter");

  const failed = applyEvent(newLive({ clientTurnId: "t-2", content: "x", localUserId: -2 }), {
    seq: 2, type: "error", code: "model_unavailable", message: "I couldn't reach my model just now. Please try again.", retryable: true,
  });
  assert.equal(failed.phase, "failed");
  assert.equal(isBusy(failed), false);
  assert.equal(failed.error.retryable, true);
  assert.equal(failed.error.sameTurn, false, "a turn the server failed is asked again as a new turn");

  const t = { seq: 3, type: "confirmation", confirmation: { id: "c_9f2e41aa07b3", tool: "update_profile_notes", summary: "Save it.", status: "pending", expires_at: "2026-10-12T11:32:10" } };
  let c = applyEvent(newLive({ clientTurnId: "t-3", content: "", localUserId: null }), t);
  c = applyEvent(c, { ...t, seq: 4, confirmation: { ...t.confirmation, status: "approved" } });
  assert.equal(c.confirmations.length, 1, "tickets upsert by id");
  assert.equal(c.confirmations[0].status, "approved");
}

console.log("desk stream: parser, turn, refusals, drop and resume, abort, live reducer all pass");
