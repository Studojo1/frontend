// The Growth Fellowship student page's rules (app/lib/fellow-view.ts).
// Weeks and runs must match the admin panel's creatorStats, and nothing the
// team keeps private may reach a fellow's page.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildFellowView,
  cleanPostUrl,
  LINKEDIN_POST,
  normaliseSlug,
  promptOrder,
  STORY_PROMPTS,
  STORIES_WANTED,
  toMs,
  istDate,
  weekOf,
  wholeNumber,
  cleanText,
  tidyCourse,
  tidyWords,
  toYou,
} from "./fellow-view.ts";

// ---------------------------------------------------------------- dates
// Weeks run Wednesday to Tuesday (the founder, 5 Nov 2026).
// A photo idea is written about the fellow for the reviewer; their page says it to them.
assert.equal(toYou("A photo of her at Christ University in Bangalore, or one with her dad.", "Vanshika"), "A photo of you at Christ University in Bangalore, or one with your dad.");
assert.equal(toYou("A candid photo of her working on her laptop.", ""), "A candid photo of you working on your laptop.");
assert.equal(toYou("Her desk with the notebook she uses.", ""), "Your desk with the notebook you use.");
assert.equal(toYou("A photo of Harsh presenting, or Harsh's team at their table.", "Harsh"), "A photo of you presenting, or your team at their table.");
assert.equal(toYou("A photo of him with his team; he is in the middle.", ""), "A photo of you with your team; you are in the middle.");
assert.equal(toYou("A photo of the stall they set up.", ""), "A photo of the stall they set up.", "they can mean other people");

assert.equal(weekOf("2026-11-06"), "2026-11-04", "Friday belongs to Wednesday's week");
assert.equal(weekOf("2026-11-10"), "2026-11-04", "Tuesday ends the week");
assert.equal(weekOf("2026-11-11"), "2026-11-11", "Wednesday starts a new one");
assert.equal(weekOf("2026-11-04"), "2026-11-04", "week 1 began Wednesday 4 November");
assert.equal(istDate(Date.parse("2026-10-28T18:29:00Z")), "2026-10-28", "before IST midnight");
assert.equal(istDate(Date.parse("2026-10-28T18:30:00Z")), "2026-10-29", "IST midnight is 18:30 UTC");
assert.equal(toMs("2026-10-27 14:10:00+00"), Date.parse("2026-10-27T14:10:00Z"), "Postgres text with a bare hour offset");
assert.equal(toMs("2026-10-27 19:40:00+05:30"), Date.parse("2026-10-27T14:10:00Z"), "Postgres text with an IST offset");
assert.equal(toMs(new Date("2026-10-27T14:10:00Z")), Date.parse("2026-10-27T14:10:00Z"), "Date objects");
assert.equal(toMs("2026-10-29 13:53:39.668614+00"), Date.parse("2026-10-29T13:53:39.668Z"), "Postgres text with microseconds");
assert.ok(Number.isNaN(toMs(null)), "null is not a time");

// ---------------------------------------------------------------- input checks
assert.equal(normaliseSlug("riya-k3m9x2qa"), "riya-k3m9x2qa");
assert.equal(normaliseSlug("Riya-K3M9X2QA"), "riya-k3m9x2qa", "addresses are case-insensitive");
assert.equal(normaliseSlug("fellow-3f9a0c1d"), "fellow-3f9a0c1d", "older hex codes still open");
assert.equal(normaliseSlug("venkataramanasubramaniam-3f9a0c1d"), "venkataramanasubramaniam-3f9a0c1d", "the admin's backfill doesn't cap long first names");
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
assert.equal(cleanPostUrl("https://www.linkedin.com/feed/update/urn:li:activity:7254/"), "https://www.linkedin.com/feed/update/urn:li:activity:7254", "a trailing slash is the same link");
for (const bad of ["https://linkedin.com/in/riya", "https://evil.com/linkedin.com/posts/x", "javascript:alert(1)//linkedin.com/posts/x", "https://linkedin.com.evil.com/posts/x", "linkedin.com/posts/", "linkedin.com/posts/?x=1", "linkedin.com/feed/update//"]) {
  assert.equal(cleanPostUrl(bad), null, `rejects ${bad}`);
}
assert.equal(wholeNumber("1,240", 1e6), 1240);
assert.equal(wholeNumber(" 85 ", 1e6), 85);
assert.equal(wholeNumber("-3", 1e6), null);
assert.equal(wholeNumber("12.5", 1e6), null);
assert.equal(wholeNumber("40000", 30000), null, "above the cap");
assert.equal(cleanText("  one\n two\u0000 ", 100, true), "one two");
// The page checks links with the server's pattern, so it never turns away a link the server takes.
const feedJs = readFileSync(new URL("../../public/fellowship/feed.js", import.meta.url), "utf8");
const linkOk = /const LINK_OK = \/(.+)\/i;\n/.exec(feedJs);
assert.ok(linkOk, "feed.js defines LINK_OK");
assert.equal(linkOk[1], LINKEDIN_POST.source, "feed.js LINK_OK matches the server's LINKEDIN_POST");

// ---------------------------------------------------------------- the view
const NOW = Date.parse("2026-10-31T08:00:00Z"); // Thu 29 Oct, 1:30 pm IST
const at = (day, hm = "19:40") => `${day} ${hm}:00+05:30`;
const post = (id, due, status, extra = {}) => ({
  id, title: `Post ${id}`, body: `Body ${id}`, kind: "personal", due_date: due, status,
  copied_at: null, own_line: null, posted_at: status === "posted" ? at(due) : null, post_url: status === "posted" ? `https://www.linkedin.com/posts/x-${id}` : null,
  impressions: null, reactions: null, comments: null, metrics_at: null, ...extra,
});
const SECRET = "TEAM-ONLY-NOTE-7741";
const fellow = {
  id: 7, slug: "asha-k3m9x2qa", full_name: "Asha Testfellow", college: "Test College", field: "Marketing", cohort: "A",
  status: "active", connections_at_join: 500, joined_at: "2026-10-14 10:00:00+05:30", linkedin_url: null, application_id: 3,
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
  post(1, "2026-10-15", "posted", { impressions: 900, reactions: 20, comments: 3, metrics_at: at("2026-10-22") }),
  post(2, "2026-10-17", "posted"),
  // week of 19 Oct: complete
  post(3, "2026-10-22", "posted"),
  post(4, "2026-10-24", "posted"),
  // this week: Tue posted, Thu and Sat ready
  post(5, "2026-10-29", "posted", { own_line: "My line" }),
  post(6, "2026-10-31", "ready", { copied_at: at("2026-10-31", "09:00") }),
  post(7, "2026-11-02", "ready", { kind: "studojo" }),
  // a draft must never be shown, even if one slipped into the rows
  post(8, "2026-10-31", "draft", { title: SECRET }),
];
const input = {
  fellow, application: { course: "BBA", year_of_study: "3rd year", city: "Pune" }, posts, stories: [], rules,
  connections: [{ connections: 520, recorded_at: "2026-10-21 09:00:00+05:30" }, { connections: 530, recorded_at: "2026-10-28 09:00:00+05:30" }],
};
const v = buildFellowView(input, NOW);
const json = JSON.stringify(v);
assert.ok(!json.includes(SECRET), "team notes, learnings, tokens and drafts never reach the page");
assert.ok(!json.includes("asha@example.com") && !json.includes("+910000000000"), "no contact details");

assert.equal(v.program.today, "2026-10-31");
assert.equal(v.program.weekStart, "2026-10-28");
assert.equal(v.me.weekNo, 3, "the first post was due in the week of 12 Oct, so this is week 3");
assert.equal(v.me.completedWeeks, 2, "two finished weeks, not counting this one");
assert.equal(v.me.weeklyRun, 2, "two in a row up to last week");
assert.deepEqual(v.me.thisWeek.posts.map((p) => p.id), ["5", "6", "7"], "this week's posts in date order, no draft");
assert.equal(v.me.thisWeek.due, 3);
assert.equal(v.me.thisWeek.posted, 1);
const tue = v.me.thisWeek.posts[0];
assert.equal(tue.postedAt, "2026-10-29T19:40:00+05:30", "posted time in India time");
assert.equal(tue.numbersDue, "2026-11-05", "numbers a week after posting");
assert.equal(tue.ownLine, "My line");
assert.equal(v.me.thisWeek.posts[1].copiedAt, "2026-10-31T09:00:00+05:30");
assert.equal(v.me.thisWeek.posts[2].kind, "studojo");

const ms = Object.fromEntries(v.me.milestones.map((m) => [m.id, m]));
assert.equal(ms.trial.status, "earned");
assert.equal(ms.trial.earnedOn, "2026-10-24", "earned the day the second week's last post went up");
assert.equal(ms.month.status, "next");
assert.equal(ms.month.weeksToGo, 2);
assert.equal(ms.pipeline.weeks, null, "the hiring pipeline has no week count");

assert.deepEqual(v.me.history.map((w) => [w.week, w.complete, w.due, w.posts.length, w.missed.length]), [["2026-10-21", true, 2, 2, 0], ["2026-10-14", true, 2, 2, 0]]);
assert.deepEqual(v.me.history[1].posts[0].metrics, { impressions: 900, reactions: 20, comments: 3 });

assert.deepEqual(v.me.connections, {
  now: 530, atJoin: 500,
  history: [{ date: "2026-10-14", n: 500 }, { date: "2026-10-21", n: 520 }, { date: "2026-10-28", n: 530 }],
});
assert.equal(v.me.headline, "BBA student at Test College | Growth Fellow at Studojo | Marketing");
assert.equal(v.me.course, "BBA, 3rd year");
assert.equal(v.me.cohort, "Cohort A");

// Nothing about other fellows reaches a fellow's page: no counts, rankings or news (the founder, 8 Nov 2026).
assert.deepEqual(Object.keys(v.me).filter((k) => /cohort/i.test(k)), ["cohort"], "only their own cohort's label");
assert.ok(!/fellows have posted|your cohort|a fellow/i.test(json), "no line about how other fellows are doing");

// The headline leaves out what isn't known instead of guessing.
const headlineOf = (college, course) => buildFellowView({ ...input, fellow: { ...fellow, college, field: null }, application: course ? { course, year_of_study: null, city: null } : null }, NOW).me.headline;
assert.equal(headlineOf(null, "BBA"), "BBA student | Growth Fellow at Studojo", "no college: not 'Student at BBA'");
assert.equal(headlineOf("Test College", null), "Student at Test College | Growth Fellow at Studojo");
assert.equal(headlineOf(null, null), "Student | Growth Fellow at Studojo");

// A graduate is never called a student, and details typed in lower case read as LinkedIn would show them.
const meOf = (fellowBits, application) => buildFellowView({ ...input, fellow: { ...fellow, ...fellowBits }, application }, NOW).me;
const harsh = meOf({ college: "amity university", field: "Sales / Business development" }, { course: "BSC", year_of_study: "Graduated", city: "gurugram" });
assert.equal(harsh.headline, "B.Sc. graduate from Amity University | Growth Fellow at Studojo | Sales / Business development");
assert.equal(harsh.course, "B.Sc. graduate");
assert.equal(harsh.city, "Gurugram");
assert.ok(!/student/i.test(JSON.stringify(harsh)), "a graduate's page never says student");
assert.equal(meOf({ college: "Christ university", field: "Finance" }, { course: "Bcom financial analytics", year_of_study: "Graduated", city: "Pune" }).headline,
  "B.Com Financial Analytics graduate from Christ University | Growth Fellow at Studojo | Finance");
assert.equal(meOf({ college: "National institute of technology Calicut", field: "Other" }, { course: "B. Tech", year_of_study: "4th year", city: "Kozhikode" }).headline,
  "B.Tech student at National Institute of Technology Calicut | Growth Fellow at Studojo", "'Other' isn't shown as a field");
for (const [typed, shown] of [["Bsc", "B.Sc."], ["b.sc", "B.Sc."], ["BTech", "B.Tech"], ["B.Tech Cse", "B.Tech CSE"], ["B.E", "B.E."], ["BE", "B.E."],
  ["BA", "BA"], ["BBA", "BBA"], ["BBA-CA", "BBA-CA"], ["MBA", "MBA"], ["M.Tech", "M.Tech"], ["BTech Electronics & Telecommunication", "B.Tech Electronics & Telecommunication"],
  ["Bachelor of Arts", "Bachelor of Arts"], ["bachelor of arts", "Bachelor of Arts"]]) {
  assert.equal(tidyCourse(typed), shown, typed);
}
assert.equal(tidyWords("KJ Somaiya Institute of Technology"), "KJ Somaiya Institute of Technology", "typed capitals stay");
assert.equal(tidyWords("jain university banglore"), "Jain University Banglore");

// Milestones the team saved in the wrong shape are skipped, never fatal.
for (const bad of [{ trial: { weeks: 2, name: "x" } }, "2 weeks", 7, null]) {
  const view = buildFellowView({ ...input, rules: { ...rules, milestones: bad } }, NOW);
  assert.deepEqual(view.me.milestones.map((m) => m.id), ["pipeline"], `milestones: ${JSON.stringify(bad)}`);
}
const odd = buildFellowView({ ...input, rules: { ...rules, milestones: [{ id: "a", weeks: 2.5, name: "Half" }, { id: "b", weeks: 400, name: "Far" }, { id: "c", weeks: 0, name: "None" }, { id: "d", weeks: "4", name: "Text" }, { id: "ok", weeks: 3, name: "Fine" }] } }, NOW);
assert.deepEqual(odd.me.milestones.map((m) => m.id), ["ok", "pipeline"], "only whole weeks from 1 to 52");

// A milestone's date is when that many weeks were done, even when a late post finished an earlier week last.
const late = buildFellowView({ ...input, posts: posts.map((p) => (p.id === 2 ? post(2, "2026-10-17", "posted", { posted_at: at("2026-10-27") }) : p)) }, NOW);
assert.equal(late.me.milestones.find((m) => m.id === "trial").earnedOn, "2026-10-27", "the second week was done on 25 Oct, not 22 Oct");

// A fellow who joined mid-week, with nothing yet.
const fresh = buildFellowView({
  ...input, fellow: { ...fellow, joined_at: "2026-10-31 10:00:00+05:30", connections_at_join: null },
  posts: [], connections: [],
}, NOW);
assert.equal(fresh.me.weekNo, 1, "the week they join is week 1");

// Week 1 starts with the first approved post, not the day they joined (the founder, 3 Nov 2026).
const early = { ...fellow, joined_at: "2026-10-07 10:00:00+05:30" };
assert.equal(buildFellowView({ ...input, fellow: early, posts: [] }, NOW).me.weekNo, 1, "joined three weeks ago with no posts yet: still week 1");
assert.equal(buildFellowView({ ...input, fellow: early, posts: [post(20, "2026-10-31", "ready")] }, NOW).me.weekNo, 1, "the first post is this week: week 1");
assert.equal(buildFellowView({ ...input, fellow: early, posts: [post(20, "2026-11-05", "ready")] }, NOW).me.weekNo, 1, "the first post is next week: still week 1");
assert.equal(buildFellowView({ ...input, fellow: early, posts: [post(20, "2026-10-23", "posted"), post(21, "2026-10-31", "ready")] }, NOW).me.weekNo, 2, "the first post was last week: week 2");
assert.equal(buildFellowView({ ...input, fellow: early, posts: [post(20, "2026-10-23", "draft")] }, NOW).me.weekNo, 1, "a draft doesn't start the clock");
assert.equal(fresh.me.thisWeek.due, 0);
assert.equal(fresh.me.weeklyRun, 0);
assert.equal(fresh.me.completedWeeks, 0);
assert.equal(fresh.me.milestones.find((m) => m.status === "next")?.id, "trial");
assert.deepEqual(fresh.me.connections, { now: null, atJoin: null, history: [] }, "an unknown count stays unknown, not 0");
const firstCount = buildFellowView({
  ...input, fellow: { ...fellow, connections_at_join: null }, connections: [{ connections: 610, recorded_at: "2026-10-30 09:00:00+05:30" }],
}, NOW);
assert.deepEqual(firstCount.me.connections, { now: 610, atJoin: null, history: [{ date: "2026-10-30", n: 610 }] }, "a first count isn't backdated to the join date");

// A missed post breaks the run but not the completed count of other weeks.
const missed = buildFellowView({ ...input, posts: posts.map((p) => (p.id === 3 ? post(3, "2026-10-22", "ready") : p)) }, NOW);
assert.equal(missed.me.weeklyRun, 0, "last week isn't complete, so no run");
assert.equal(missed.me.completedWeeks, 1);
assert.equal(missed.me.history[0].complete, false);
assert.equal(missed.me.history[0].posts.length, 1, "only posted posts are listed");
assert.deepEqual(missed.me.history[0].missed.map((m) => [m.id, m.day, m.date, m.body]), [["3", "Thu", "2026-10-22", "Body 3"]], "the missed post can still be copied and marked");

// A post the team put on hold ('blocked') shows as a notice: no text, not due, not missed, not next.
const held = buildFellowView({ ...input, posts: [...posts, post(11, "2026-11-01", "blocked", { body: `HELD-${SECRET}`, own_line: SECRET }), post(12, "2026-10-23", "blocked")] }, NOW);
const h = held.me.thisWeek.posts.find((p) => p.id === "11");
assert.ok(h && h.status === "blocked", "the held post is on the page as a notice");
assert.equal(h.body, "", "never its text");
assert.equal(h.ownLine, null);
assert.ok(!JSON.stringify(held).includes(SECRET), "nothing of a held post's content reaches the page");
assert.equal(held.me.thisWeek.due, 3, "a held post isn't due");
assert.ok(!held.me.history.some((w) => w.missed.some((m) => m.id === "12")), "a held post is never missed");
assert.equal(held.me.weeklyRun, v.me.weeklyRun, "a held post doesn't break a week");
assert.equal(held.me.completedWeeks, v.me.completedWeeks);
// The programme's numbers come from the rules row, with five a week (two Studojo) as the default.
assert.deepEqual([v.program.postsPerWeek, v.program.studojoPerWeek, v.program.postingDays.join()], [3, 2, "Tue,Thu,Sat"]);
const noRules = buildFellowView({ ...input, rules: null }, NOW);
assert.deepEqual([noRules.program.postsPerWeek, noRules.program.studojoPerWeek, noRules.program.postingDays.join()], [5, 2, "Mon,Tue,Wed,Thu,Fri"]);

// Story questions: recent, specific moments first for someone new (the call covered the basics), unanswered
// ones before answered, and a new order each day.
const order0 = promptOrder([], "2026-11-03");
assert.equal(order0.length, STORY_PROMPTS.length);
assert.equal(order0[0], "Something that happened this week that taught you something", "a new fellow starts with something recent");
assert.equal(order0[1], "A time something didn't go to plan, and what you did next");
assert.ok(order0.indexOf("Why you chose your course, and whether you'd choose it again") > 5, "what the call covered comes later");
const done = promptOrder(["Something that happened this week that taught you something", null, "A time something didn't go to plan, and what you did next"], "2026-11-03");
assert.equal(done[0], "A conversation that changed how you think about your career", "answered questions aren't asked first again");
assert.deepEqual(done.slice(-2).sort(), ["A time something didn't go to plan, and what you did next", "Something that happened this week that taught you something"].sort(), "answered ones go last");
assert.equal(new Set(done).size, STORY_PROMPTS.length, "every question appears once");
const allCore = STORY_PROMPTS.slice(0, 6);
assert.notEqual(promptOrder(allCore, "2026-11-03")[0], promptOrder(allCore, "2026-11-04")[0], "returning fellows get a different first question the next day");
assert.equal(STORIES_WANTED, 3);
assert.equal(v.me.storiesWanted, 3);
assert.equal(v.me.storyPrompts[0], "Something that happened this week that taught you something");

// The page's columns never grow past the screen: one long unbroken line (a saved post link) once
// widened every post card on phones, and the phone zoomed the whole page out to fit it.
const css = readFileSync(new URL("../../public/fellowship/feed.css", import.meta.url), "utf8");
for (const rule of [".feed", ".post-list"]) {
  const body = new RegExp(`^\\${rule} \\{([^}]*)\\}`, "m").exec(css)?.[1] ?? "";
  assert.match(body, /grid-template-columns: minmax\(0, 1fr\)/, `${rule} keeps its column within the screen`);
}

console.log("fellow-view: ok");
