// The Growth Fellowship student page's rules (app/lib/fellow-view.ts).
// Weeks and runs must match the admin panel's creatorStats, and nothing the
// team keeps private may reach a fellow's page.
import assert from "node:assert/strict";
import {
  buildFellowView,
  cleanPostUrl,
  normaliseSlug,
  toMs,
  istDate,
  weekOf,
  wholeNumber,
  cleanText,
} from "./fellow-view.ts";

// ---------------------------------------------------------------- dates
assert.equal(weekOf("2026-10-29"), "2026-10-26", "Thursday belongs to Monday's week");
assert.equal(weekOf("2026-11-01"), "2026-10-26", "Sunday ends the week");
assert.equal(weekOf("2026-11-02"), "2026-11-02", "Monday starts a new one");
assert.equal(istDate(Date.parse("2026-10-28T18:29:00Z")), "2026-10-28", "before IST midnight");
assert.equal(istDate(Date.parse("2026-10-28T18:30:00Z")), "2026-10-29", "IST midnight is 18:30 UTC");
assert.equal(toMs("2026-10-27 14:10:00+00"), Date.parse("2026-10-27T14:10:00Z"), "Postgres text with a bare hour offset");
assert.equal(toMs("2026-10-27 19:40:00+05:30"), Date.parse("2026-10-27T14:10:00Z"), "Postgres text with an IST offset");
assert.equal(toMs(new Date("2026-10-27T14:10:00Z")), Date.parse("2026-10-27T14:10:00Z"), "Date objects");
assert.ok(Number.isNaN(toMs(null)), "null is not a time");

// ---------------------------------------------------------------- input checks
assert.equal(normaliseSlug("riya-k3m9x2qa"), "riya-k3m9x2qa");
assert.equal(normaliseSlug("Riya-K3M9X2QA"), "riya-k3m9x2qa", "addresses are case-insensitive");
assert.equal(normaliseSlug("fellow-3f9a0c1d"), "fellow-3f9a0c1d", "older hex codes still open");
for (const bad of ["riya", "riya-k3m9", "riya-k3m9x2qa1", "../etc-passwd12", "riya-k3m9x2q!", "", undefined]) {
  assert.equal(normaliseSlug(bad), null, `rejects ${bad}`);
}
assert.equal(cleanPostUrl("linkedin.com/posts/riya_internships-activity-1"), "https://www.linkedin.com/posts/riya_internships-activity-1");
assert.equal(
  cleanPostUrl("https://www.linkedin.com/feed/update/urn:li:activity:7254?utm_source=share&utm_medium=member_android"),
  "https://www.linkedin.com/feed/update/urn:li:activity:7254",
  "tracking parameters are dropped",
);
assert.equal(cleanPostUrl("https://in.linkedin.com/posts/x-1"), "https://www.linkedin.com/posts/x-1", "country subdomains");
for (const bad of ["https://linkedin.com/in/riya", "https://evil.com/linkedin.com/posts/x", "javascript:alert(1)//linkedin.com/posts/x", "https://linkedin.com.evil.com/posts/x", "linkedin.com/posts/"]) {
  assert.equal(cleanPostUrl(bad), null, `rejects ${bad}`);
}
assert.equal(wholeNumber("1,240", 1e6), 1240);
assert.equal(wholeNumber(" 85 ", 1e6), 85);
assert.equal(wholeNumber("-3", 1e6), null);
assert.equal(wholeNumber("12.5", 1e6), null);
assert.equal(wholeNumber("40000", 30000), null, "above the cap");
assert.equal(cleanText("  one\n two\u0000 ", 100, true), "one two");

// ---------------------------------------------------------------- the view
const NOW = Date.parse("2026-10-29T08:00:00Z"); // Thu 29 Oct, 1:30 pm IST
const at = (day, hm = "19:40") => `${day} ${hm}:00+05:30`;
const post = (id, due, status, extra = {}) => ({
  id, title: `Post ${id}`, body: `Body ${id}`, kind: "personal", due_date: due, status,
  copied_at: null, own_line: null, posted_at: status === "posted" ? at(due) : null, post_url: status === "posted" ? `https://www.linkedin.com/posts/x-${id}` : null,
  impressions: null, reactions: null, comments: null, metrics_at: null, ...extra,
});
const SECRET = "TEAM-ONLY-NOTE-7741";
const fellow = {
  id: 7, slug: "asha-k3m9x2qa", full_name: "Asha Testfellow", college: "Test College", field: "Marketing", cohort: "A",
  status: "active", connections_at_join: 500, joined_at: "2026-10-12 10:00:00+05:30", linkedin_url: null, application_id: 3,
  // A careless SELECT * would bring these along; the view must never pass them on.
  team_notes: SECRET, learnings: SECRET, email: "asha@example.com", whatsapp: "+910000000000", nudged_at: SECRET, token: SECRET,
};
const rules = {
  postingDays: ["Tue", "Thu", "Sat"], postsPerWeek: 3, partnershipLabel: "In partnership with Studojo",
  milestones: [
    { id: "trial", weeks: 2, name: "2-week certificate", detail: "A certificate for completing the 2-week trial." },
    { id: "month", weeks: 4, name: "1-month intern certificate", detail: "d" },
  ],
  hiringPipeline: { id: "pipeline", name: "Hiring pipeline", detail: "High performers are considered." },
};
const posts = [
  // week of 12 Oct: complete
  post(1, "2026-10-13", "posted", { impressions: 900, reactions: 20, comments: 3, metrics_at: at("2026-10-20") }),
  post(2, "2026-10-15", "posted"),
  // week of 19 Oct: complete
  post(3, "2026-10-20", "posted"),
  post(4, "2026-10-22", "posted"),
  // this week: Tue posted, Thu and Sat ready
  post(5, "2026-10-27", "posted", { own_line: "My line" }),
  post(6, "2026-10-29", "ready", { copied_at: at("2026-10-29", "09:00") }),
  post(7, "2026-10-31", "ready", { kind: "studojo" }),
  // a draft must never be shown, even if one slipped into the rows
  post(8, "2026-10-29", "draft", { title: SECRET }),
];
const input = {
  fellow, application: { course: "BBA", year_of_study: "3rd year", city: "Pune" }, posts, stories: [], rules,
  connections: [{ connections: 520, recorded_at: "2026-10-19 09:00:00+05:30" }, { connections: 530, recorded_at: "2026-10-26 09:00:00+05:30" }],
  cohortFellows: [{ id: 8, first_name: "Kiran" }, { id: 9, first_name: "Meera" }, { id: 10, first_name: "Ravi" }],
  cohortPosts: [
    { creator_id: 8, status: "posted", due_date: "2026-10-27", posted_at: at("2026-10-28", "10:00"), impressions: 2300, metrics_at: at("2026-10-28", "11:00") },
    { creator_id: 9, status: "ready", due_date: "2026-10-27", posted_at: null, impressions: null, metrics_at: null },
    { creator_id: 7, status: "posted", due_date: "2026-10-27", posted_at: at("2026-10-27"), impressions: null, metrics_at: null },
  ],
};
const v = buildFellowView(input, NOW);
const json = JSON.stringify(v);
assert.ok(!json.includes(SECRET), "team notes, learnings, tokens and drafts never reach the page");
assert.ok(!json.includes("asha@example.com") && !json.includes("+910000000000"), "no contact details");

assert.equal(v.program.today, "2026-10-29");
assert.equal(v.program.weekStart, "2026-10-26");
assert.equal(v.me.weekNo, 3, "joined in the week of 12 Oct, so this is week 3");
assert.equal(v.me.completedWeeks, 2, "two finished weeks, not counting this one");
assert.equal(v.me.weeklyRun, 2, "two in a row up to last week");
assert.deepEqual(v.me.thisWeek.posts.map((p) => p.id), ["5", "6", "7"], "this week's posts in date order, no draft");
assert.equal(v.me.thisWeek.due, 3);
assert.equal(v.me.thisWeek.posted, 1);
const tue = v.me.thisWeek.posts[0];
assert.equal(tue.postedAt, "2026-10-27T19:40:00+05:30", "posted time in India time");
assert.equal(tue.numbersDue, "2026-11-03", "numbers a week after posting");
assert.equal(tue.ownLine, "My line");
assert.equal(v.me.thisWeek.posts[1].copiedAt, "2026-10-29T09:00:00+05:30");
assert.equal(v.me.thisWeek.posts[2].kind, "studojo");

const ms = Object.fromEntries(v.me.milestones.map((m) => [m.id, m]));
assert.equal(ms.trial.status, "earned");
assert.equal(ms.trial.earnedOn, "2026-10-22", "earned the day the second week's last post went up");
assert.equal(ms.month.status, "next");
assert.equal(ms.month.weeksToGo, 2);
assert.equal(ms.pipeline.weeks, null, "the hiring pipeline has no week count");

assert.deepEqual(v.me.history.map((w) => [w.week, w.complete, w.due, w.posts.length]), [["2026-10-19", true, 2, 2], ["2026-10-12", true, 2, 2]]);
assert.deepEqual(v.me.history[1].posts[0].metrics, { impressions: 900, reactions: 20, comments: 3 });

assert.deepEqual(v.me.connections, {
  now: 530, atJoin: 500,
  history: [{ date: "2026-10-12", n: 500 }, { date: "2026-10-19", n: 520 }, { date: "2026-10-26", n: 530 }],
});
assert.equal(v.me.headline, "BBA student at Test College | Growth Fellow at Studojo | Marketing");
assert.equal(v.me.course, "BBA, 3rd year");
assert.equal(v.me.cohort, "Cohort A");

// The cohort: counts and anonymous news by default.
assert.equal(v.me.cohortSize, 4);
assert.equal(v.me.cohortPostedThisWeek, 2, "Kiran and Asha have posted this week");
assert.equal(v.me.cohortPosition, "You're among the most active in your cohort this week");
assert.deepEqual(v.me.cohortFeed.map((e) => e.text), ["A fellow's post crossed 2k", "A fellow posted"], "no names unless the team turns them on");
assert.ok(!json.includes("Kiran"), "other fellows' names stay off the page");
const named = buildFellowView({ ...input, rules: { ...rules, cohortNames: true } }, NOW);
assert.deepEqual(named.me.cohortFeed.map((e) => e.text), ["Kiran's post crossed 2k", "Kiran posted"]);

// A small cohort gets counts but no position line.
const small = buildFellowView({ ...input, cohortFellows: [{ id: 8, first_name: "Kiran" }] }, NOW);
assert.equal(small.me.cohortPosition, null);

// A fellow who joined mid-week, with nothing yet.
const fresh = buildFellowView({
  ...input, fellow: { ...fellow, joined_at: "2026-10-29 10:00:00+05:30", connections_at_join: null },
  posts: [], connections: [], cohortFellows: [], cohortPosts: [],
}, NOW);
assert.equal(fresh.me.weekNo, 1, "the week they join is week 1");
assert.equal(fresh.me.thisWeek.due, 0);
assert.equal(fresh.me.weeklyRun, 0);
assert.equal(fresh.me.completedWeeks, 0);
assert.equal(fresh.me.milestones.find((m) => m.status === "next")?.id, "trial");
assert.deepEqual(fresh.me.connections, { now: 0, atJoin: 0, history: [{ date: "2026-10-29", n: 0 }] });
assert.equal(fresh.me.cohortSize, 1);

// A missed post breaks the run but not the completed count of other weeks.
const missed = buildFellowView({ ...input, posts: posts.map((p) => (p.id === 3 ? post(3, "2026-10-20", "ready") : p)) }, NOW);
assert.equal(missed.me.weeklyRun, 0, "last week isn't complete, so no run");
assert.equal(missed.me.completedWeeks, 1);
assert.equal(missed.me.history[0].complete, false);
assert.equal(missed.me.history[0].posts.length, 1, "only posted posts are listed");

console.log("fellow-view: ok");
