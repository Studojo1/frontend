// Seed text for /b2cnew: memory, prep packs, evidence phrases and reply
// drafts. Fictional throughout. Shared file: owned by the foundation.
// Import through ./data.
import type { MemoryItem, Prep } from "./types";

/** Phrases that, when they appear in an email, are backed by a resume line. Longest first. */
export const EVIDENCE_PHRASES: { phrase: string; lineId: string }[] = [
  { phrase: "React, Node.js and PostgreSQL", lineId: "r-proj-1-b" },
  { phrase: "used by 1,200 students", lineId: "r-proj-1-a" },
  { phrase: "1,200 students", lineId: "r-proj-1-a" },
  { phrase: "final-year CSE student", lineId: "r-edu-year" },
  { phrase: "campus UPI expense tracker", lineId: "r-proj-1-title" },
  { phrase: "cut food waste 18%", lineId: "r-proj-2-a" },
  { phrase: "canteen analysis", lineId: "r-proj-2-title" },
  { phrase: "repeat orders up 11%", lineId: "r-exp-1" },
  { phrase: "cohort dashboard", lineId: "r-exp-2" },
  { phrase: "220-member coding club", lineId: "r-extra" },
  { phrase: "Splitkart", lineId: "r-proj-1-title" },
];

/** Every evidence phrase found in these paragraphs (each phrase once, overlaps skipped). */
export function evidenceIn(paragraphs: string[]): { phrase: string; lineId: string }[] {
  const text = paragraphs.join("\n");
  const out: { phrase: string; lineId: string }[] = [];
  for (const e of EVIDENCE_PHRASES) {
    if (!text.includes(e.phrase)) continue;
    if (out.some((o) => o.phrase.includes(e.phrase))) continue;
    out.push(e);
  }
  return out;
}

/** What Senpai knows on Day 6: 8 backed facts and 1 thing Riya only said. */
export const MEMORY_SEED: MemoryItem[] = [
  { id: "m-degree", kind: "fact", text: "Final-year B.Tech CSE, Class of 2027", scope: "shared", proof: "pinned", useInEmails: true,
    source: { kind: "resume", label: "Resume line", lineId: "r-edu-year" } },
  { id: "m-splitkart", kind: "fact", text: "Built Splitkart, used by 1,200 students across 3 hostels", scope: "shared", proof: "pinned", useInEmails: true,
    source: { kind: "resume", label: "Resume line", lineId: "r-proj-1-a" } },
  { id: "m-stack", kind: "fact", text: "Ships with React, Node.js and PostgreSQL", scope: "shared", proof: "pinned", useInEmails: true,
    source: { kind: "resume", label: "Resume line", lineId: "r-proj-1-b" } },
  { id: "m-canteen", kind: "fact", text: "Cut canteen food waste 18% with Python and pandas", scope: "shared", proof: "pinned", useInEmails: true,
    source: { kind: "resume", label: "Resume line", lineId: "r-proj-2-a" } },
  { id: "m-growth", kind: "fact", text: "Growth intern at a D2C snack brand: repeat orders up 11%", scope: "shared", proof: "pinned", useInEmails: true,
    source: { kind: "resume", label: "Resume line", lineId: "r-exp-1" } },
  { id: "m-club", kind: "fact", text: "Leads a 220-member coding club; ran 2 hackathons", scope: "shared", proof: "pinned", useInEmails: true,
    source: { kind: "resume", label: "Resume line", lineId: "r-extra" } },
  { id: "m-start", kind: "fact", text: "Start Jan 2027, internship", scope: "jan27", proof: "pinned", useInEmails: true,
    source: { kind: "quiz", label: "Quiz answer" } },
  { id: "m-cities", kind: "fact", text: "Pune, Bengaluru or Remote", scope: "jan27", proof: "pinned", useInEmails: true,
    source: { kind: "quiz", label: "Quiz answer" } },
  { id: "m-small", kind: "fact", text: "Prefers small teams", scope: "shared", proof: "your-word", useInEmails: false,
    source: { kind: "chat", label: "Chat on Day 2" } },
];

/** Prep pack text. F4 builds the Kitebase card from it; the Day 13 event offers Quillpay. */
export const PREP_SEED: Record<"kitebase" | "quillpay", Omit<Prep, "id" | "checks">> = {
  kitebase: {
    personId: "kitebase",
    when: "Thursday 15 Oct, 20 minutes",
    brief: "Kitebase builds payments for small shops. Seed stage, Bengaluru. Ananya runs engineering and is hiring a product engineering intern.",
    said: "Your expense tracker is neat. Free for a 20 minute call on Thursday?",
    questions: [
      { q: "Walk me through Splitkart. What did you build yourself?", lineId: "r-proj-1-b" },
      { q: "How did you get 1,200 students to use it?", lineId: "r-proj-1-a" },
      { q: "What would you change about how a shop owner gets paid?", lineId: "r-proj-1-title" },
      { q: "Tell me about a number you moved.", lineId: "r-exp-1" },
      { q: "How do you decide what to build first?", lineId: "r-exp-2" },
    ],
    story: "Splitkart started because my hostel kept a paper ledger for shared bills. I built a UPI tracker in React and Node.js over a month, three hostels took it up, and 1,200 students used it in the first semester. The hard part was trust: people only paid when the app showed who owed what, in one tap.",
    askBack: ["What would an intern build and ship in the first month?", "How do you talk to the shop owners who use Kitebase?"],
  },
  quillpay: {
    personId: "quillpay",
    when: "Tuesday 20 Oct, first round",
    brief: "Quillpay runs payroll for startups. Series B, Bengaluru. Arjun leads product and is hiring an associate product manager.",
    said: "Sending you an invite for a first round. Does next Tuesday work?",
    questions: [
      { q: "Why product, when you can build?", lineId: "r-proj-1-title" },
      { q: "Tell me about a metric you owned.", lineId: "r-exp-1" },
      { q: "How would you measure a payroll feature?", lineId: "r-exp-2" },
      { q: "Pick a decision you made with data.", lineId: "r-proj-2-a" },
      { q: "How do you work with engineers?", lineId: "r-extra" },
    ],
    story: "At the snack brand I ran 14 campaigns, but the useful thing was the cohort dashboard: it showed repeat orders were what mattered, so we moved budget there and repeat orders went up 11% over the quarter.",
    askBack: ["What does a good first quarter look like for this role?", "Which team would I sit closest to?"],
  },
};

/** Reply drafts Senpai writes. Saved to Gmail drafts only; Senpai never sends them. */
export const REPLY_DRAFTS: Record<string, string[]> = {
  "rp-1": ["Hi Karan, thanks for asking.", "It is an internship from January 2027. I can do six months, in Pune or remote."],
  "rp-2": ["Hi Ananya, thank you. Thursday works.", "I am free 11am to 12pm or 4pm to 5pm. Happy to share Splitkart's numbers on the call."],
  "rp-3": ["Hi Tara, thank you for passing it on.", "Could you share your data lead's name, so I can write to them directly?"],
  "rp-4": ["Hi Meera, thank you. That makes sense.", "I will write again in April. Good luck with the summer plans."],
  "rp-5": ["Hi Sana, thanks for asking.", "I am based in Pune. Could the first three months be remote?"],
  "rp-6": ["Hi Arjun, thank you. Tuesday works.", "Morning or afternoon both suit me. Looking forward to it."],
};
