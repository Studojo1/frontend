import type { GradeRequest, GradeResponse, MeResponse, ResumeResponse, ShareResponse, WriteRequest, WriteResponse } from "./contract";
import { hasNumber } from "./contract";

// EMAILER, DEV ONLY: a stand-in for the engine (career-agent /api/emailer/*), loaded by api.ts only when
// import.meta.env.DEV is true and the tab has ?mock=<mode>. It answers with real Response objects in the contract's
// shapes, so the page's own status handling runs exactly as against the engine. Every name and line here is made up
// (RULE B: no real person's data in git).
//
// Modes (comma separated, kept for the tab in sessionStorage; ?mock=off clears it):
//   1 or anon   anonymous: the first action is free and locked, the next one is the sign-in wall
//   signed      signed in: follow-ups, the rewrite and regenerate unlocked, 5 a day
//   wall        the sign-in wall at once (429, signIn: true)
//   limit       the signed-in daily limit at once (429, signIn: false)
//   busy        the day's total reached (429, error: "busy")
//   off         the kill switch (503)
//   field       a 400 on the role field
//   fast        no pretend wait

const STATE_KEY = "stu_emailer_mock_state";

type State = { used: number };

function load(): State {
  try {
    const v = JSON.parse(sessionStorage.getItem(STATE_KEY) ?? "null");
    if (v && typeof v.used === "number") return v;
  } catch {
    // fall through
  }
  return { used: 0 };
}
function save(s: State) {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function id(): string {
  return `mock${Math.random().toString(36).slice(2, 10)}`;
}

function firstName(full: string | undefined): string {
  return (full ?? "").trim().split(/\s+/)[0] ?? "";
}

function lowerFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

function sentence(s: string): string {
  const t = s.trim().replace(/[.!\s]+$/, "");
  return t ? `${t.charAt(0).toUpperCase()}${t.slice(1)}.` : "";
}

function writeOne(req: WriteRequest, signedIn: boolean, used: number, limit: number): WriteResponse {
  const runId = id();
  const company = req.company.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const to = firstName(req.to?.name) || "there";
  const lead = sentence(req.you.results[0] ?? "");
  const second = req.you.results[1] ? ` I also ${lowerFirst(req.you.results[1].trim().replace(/[.!\s]+$/, ""))}.` : "";
  const companyLine = req.you.why?.trim()
    ? `I really love what you're doing at ${company}: ${lowerFirst(req.you.why.trim().replace(/[.!\s]+$/, ""))}.`
    : `I really love what you're building at ${company}, and I want to help build it.`;
  const ask = "Could we grab 15 minutes to discuss the role, or could you point me to the right person?";
  const kind = req.jobType === "internship" ? "internship" : "role";
  const body = [
    `Hi ${to},`,
    "",
    `${lead}${second} I'm ${req.you.name.trim()}, ${lowerFirst(req.you.now.trim().replace(/[.!\s]+$/, ""))}, and I'd love to join ${company} for the ${req.role.trim()} ${kind}.`,
    "",
    companyLine,
    "",
    ask,
    "",
    firstName(req.you.name) || req.you.name.trim(),
  ].join("\n");
  const numbers = req.you.results.filter(hasNumber).length;
  const value = Math.min(9, 5 + numbers + (req.jobPost || req.jobUrl ? 1 : 0) + (req.to?.name ? 1 : 0));
  const fixes = [
    ...(numbers < req.you.results.length ? ["Add a number to each result: how many, how much, what changed."] : []),
    ...(req.jobPost || req.jobUrl ? [] : ["Paste the job post so the email can say where you come in."]),
    ...(req.to?.name ? [] : ["Write to the hiring manager by name, not to HR."]),
  ].slice(0, 3);
  return {
    id: runId,
    subject: `${req.role.trim()} at ${company}`,
    body,
    followups: signedIn
      ? [
          { day: 3, body: `Hi ${to},\n\nJust bringing this back to the top of your inbox. Still keen on the ${req.role.trim()} ${kind} at ${company}.\n\n${firstName(req.you.name)}` },
          { day: 7, body: `Hi ${to},\n\nOne last note on the ${req.role.trim()} ${kind}. If the timing isn't right, no worries. Happy to send anything that helps.\n\n${firstName(req.you.name)}` },
        ]
      : null,
    score: {
      value,
      verdict: value >= 8 ? "Short, specific and easy to say yes to." : "Clear ask, but the results need more proof.",
      fixes,
    },
    highlights: { result: lead || null, company: companyLine, ask },
    company: { name: company, domain: company.includes(".") ? company : null, logo: null, what: null },
    locked: { followups: !signedIn, regenerate: !signedIn, more: !signedIn },
    usage: { used, limit, signedIn },
    shareUrl: `${window.location.origin}/tools/emailer/s/${runId}`,
  };
}

function gradeOne(req: GradeRequest, signedIn: boolean, used: number, limit: number): GradeResponse {
  const words = req.email.trim().split(/\s+/).length;
  const numbers = (req.email.match(/\d+/g) ?? []).length;
  const value = Math.max(2, Math.min(8, 3 + Math.min(numbers, 3) + (words < 140 ? 1 : 0) + (/15 minutes|quick call/i.test(req.email) ? 1 : 0)));
  const runId = id();
  return {
    id: runId,
    score: {
      value,
      verdict: value >= 7 ? "Good bones. A sharper first line would lift it." : "Reads like a template. Lead with what you've done.",
      fixes: [
        "Open with your best result, not your name or your degree.",
        "Cut it under 120 words. Busy people skim.",
        "End with one easy ask: 15 minutes, or the right person.",
      ],
    },
    rewrite: signedIn
      ? {
          subject: req.role ? `${req.role} at ${req.company || "your team"}` : "Quick question about the role",
          body: "Hi there,\n\nI built a dashboard my team used every week to cut report time by 6 hours. I'd love to bring that to your team.\n\nCould we grab 15 minutes to discuss the role, or could you point me to the right person?\n\nSam",
          score: Math.min(10, value + 3),
        }
      : null,
    locked: { rewrite: !signedIn },
    usage: { used, limit, signedIn },
    shareUrl: `${window.location.origin}/tools/emailer/s/${runId}`,
  };
}

const RESUME: ResumeResponse = {
  name: "Sam Rivera",
  now: "Final-year computer science, interning at a payments startup",
  results: [
    "Cut the checkout page's load time from 4.1s to 1.3s",
    "Built an internal dashboard that 40 people use every week",
    "Grew a campus club's newsletter from 300 to 2,100 readers in one semester",
    "Wrote the test suite that took coverage from 35% to 80%",
    "Led a team of 4 in a 36-hour hackathon and placed second",
    "Mentored 12 first-years in Python",
  ],
  links: ["github.com/sam-rivera-dev"],
};

async function readJson(init?: RequestInit): Promise<any> {
  try {
    return JSON.parse(String(init?.body ?? "{}"));
  } catch {
    return {};
  }
}

export async function mockFetch(path: string, init: RequestInit | undefined, rawMode: string): Promise<Response> {
  const modes = new Set(rawMode.split(",").map((m) => m.trim()));
  const signedIn = modes.has("signed");
  const limit = signedIn ? 5 : 1;
  const s = load();
  const slow = !modes.has("fast");
  const method = (init?.method ?? "GET").toUpperCase();

  if (path === "/api/emailer/me") {
    const me: MeResponse = { signedIn, firstName: signedIn ? "Sam" : null, used: s.used, limit };
    return reply(200, me);
  }
  if (path.startsWith("/api/emailer/share/")) {
    const shareId = decodeURIComponent(path.split("/").pop() ?? "");
    if (shareId === "missing") return reply(404, { error: "not_found", message: "No such card." });
    const grade = shareId.startsWith("g");
    const share: ShareResponse = {
      kind: grade ? "grade" : "write",
      score: grade ? 8 : 8,
      before: grade ? 4 : null,
      after: grade ? 8 : null,
      role: "Product Analyst",
      company: "Acme Robotics",
      companyLogo: null,
      firstName: "Sam",
      createdAt: new Date().toISOString(),
    };
    return reply(200, share);
  }
  if (method !== "POST") return reply(404, { error: "not_found", message: "Not here." });
  if (slow) await wait(path === "/api/emailer/resume" ? 900 : 1600);
  if (modes.has("off")) return reply(503, { error: "off", message: "The email writer is off for a moment." });

  if (path === "/api/emailer/resume") {
    return reply(200, RESUME);
  }
  if (modes.has("busy")) return reply(429, { error: "busy", message: "Lots of people today." });
  if (modes.has("wall")) return reply(429, { error: "limit", message: "That was your free one today.", signIn: true });
  if (modes.has("limit")) return reply(429, { error: "limit", message: "That's 5 for today.", signIn: false });
  if (s.used >= limit) return reply(429, { error: "limit", message: signedIn ? "That's 5 for today." : "That was your free one today.", signIn: !signedIn });

  if (path === "/api/emailer/write") {
    const req = (await readJson(init)) as WriteRequest;
    if (modes.has("field")) return reply(400, { error: "invalid", message: "Tell us the role you're writing about.", field: "role" });
    if (req.regenerateOf && !signedIn) return reply(429, { error: "limit", message: "Sign in to regenerate.", signIn: true });
    const used = s.used + 1;
    save({ used });
    return reply(200, writeOne(req, signedIn, used, limit));
  }
  if (path === "/api/emailer/grade") {
    const req = (await readJson(init)) as GradeRequest;
    const used = s.used + 1;
    save({ used });
    return reply(200, gradeOne(req, signedIn, used, limit));
  }
  return reply(404, { error: "not_found", message: "Not here." });
}
