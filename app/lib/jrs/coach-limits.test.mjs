// The resume coach can only edit what is written on the resume. Asked to
// change the format it must say, explicitly, that it cannot. Runs the real
// detector and the real reply enforcement the chat endpoint uses.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  COACH_SCOPE_NOTE,
  COACH_SCOPE_PROMPT,
  FORMAT_LIMIT_REPLY,
  enforceCoachLimits,
  isFormatRequest,
} from "./coach-limits.ts";

const here = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

// The refusal and the always-on note both say "can't" and name the format.
for (const text of [FORMAT_LIMIT_REPLY, COACH_SCOPE_NOTE]) {
  assert.match(text, /can't change (the|its) format/i);
  assert.match(text, /template/i);
  assert.match(text, /Template button/);
}

for (const q of [
  "change the format of my resume",
  "can you change the format",
  "Please reformat this",
  "switch to a different template",
  "make the font bigger",
  "use Times New Roman font",
  "can you change the colour to blue",
  "reduce the margins",
  "I want a two column layout",
  "make the headings bold",
  "fix the spacing",
]) {
  assert.equal(isFormatRequest(q), true, `not caught: "${q}"`);
}

// Ordinary answers and content must not be mistaken for format requests.
for (const q of [
  "Aanya Sharma",
  "Layout Designer",
  "Marketing Analyst",
  "Bengaluru, India",
  "skip",
  "I interned at Blip Store and grew signups 30%",
  "add Python to my skills",
  "rewrite my summary",
]) {
  assert.equal(isFormatRequest(q), false, `false positive: "${q}"`);
}

// Model claims it did it, no flag: the refusal replaces the claim.
assert.equal(
  enforceCoachLimits({
    userText: "change the format of my resume",
    reply: "Done, I've updated the format!",
    limit: null,
    opsCount: 0,
  }),
  FORMAT_LIMIT_REPLY,
);

// Model flags it but waffles: still the explicit refusal.
assert.equal(
  enforceCoachLimits({
    userText: "can it look more modern?",
    reply: "What kind of look are you after?",
    limit: "format",
    opsCount: 0,
  }),
  FORMAT_LIMIT_REPLY,
);

// Model flags it and returns no reply at all.
assert.equal(
  enforceCoachLimits({ userText: "new template pls", reply: "", limit: "format", opsCount: 0 }),
  FORMAT_LIMIT_REPLY,
);

// Mixed request: content change is kept, refusal is added if missing.
const mixed = enforceCoachLimits({
  userText: "add Python to skills and change the font",
  reply: "Added Python to your skills.",
  limit: "format",
  opsCount: 1,
});
assert.match(mixed, /^I can't change the format/);
assert.match(mixed, /Added Python/);

const mixedSaid = "Added Python. I can't change the font, use the Edit tab toolbar.";
assert.equal(
  enforceCoachLimits({ userText: "x", reply: mixedSaid, limit: "format", opsCount: 1 }),
  mixedSaid,
);

// Normal content turns pass through untouched.
assert.equal(
  enforceCoachLimits({
    userText: "I interned at Blip Store",
    reply: "Got it, added Blip Store. What did you build there?",
    limit: null,
    opsCount: 1,
  }),
  "Got it, added Blip Store. What did you build there?",
);

// Wiring: the endpoint uses the prompt section and the enforcement, the
// scripted onboarding refuses instead of saving the request as an answer, and
// the panel shows the note.
const route = here("../../routes/api.resume-maker.chat.tsx");
assert.match(route, /\$\{COACH_SCOPE_PROMPT\}/);
assert.match(route, /enforceCoachLimits\(/);
assert.match(COACH_SCOPE_PROMPT, /CANNOT change how the resume looks/);
const page = here("../../routes/resume-maker.tsx");
assert.match(page, /if \(isFormatRequest\(t\)\)[\s\S]{0,200}FORMAT_LIMIT_REPLY/);
assert.match(here("../../components/jrs/chat-panel.tsx"), /\{COACH_SCOPE_NOTE\}/);

console.log("resume coach states its limits and refuses format changes explicitly");
