// The student page's data rules (profileView) and the mapper's repairs
// (toProfile), on real and hostile profiles. Run: npx tsx app/components/student-page/profile-view.test.mjs
// Fixtures: __fixtures__/v2-* are what the mapper sends now, v1-* what it sent
// before the repairs (the page must still be honest with those), edge-* are
// hostile and empty cases. Contact details in real fixtures are replaced with
// example values.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { profileView } from "./profile-view.ts";
import { fmtNum, lineRef, readsLikeSentence, txt } from "../../lib/student-page-text.ts";
import { toProfile } from "../../lib/student-page.server.ts";

const here = new URL(".", import.meta.url).pathname;
const load = (f) => JSON.parse(readFileSync(`${here}__fixtures__/${f}`, "utf8"));
const P = (f) => load(f).profile;

let passed = 0;
const test = (name, fn) => {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
};
const strings = (o) => JSON.stringify(o, (k, v) => (k === "photo" ? undefined : v));

// ---------------------------------------------------------------- helpers
test("readsLikeSentence keeps real names and titles", () => {
  for (const s of ["B.Tech. Computer Science", "Managed Services Intern", "Marketing Intern", "St. Thomas Residential School, Trivandrum", "Govt. College of Engineering", "Women at Work Foundation", "Indian Institute of Technology Madras", "B.Sc. Physics", "Growth (Summer intern)"])
    assert.equal(readsLikeSentence(s), false, s);
});
test("readsLikeSentence catches resume sentences", () => {
  for (const s of ["Devised and executed end-to-end strategy in terms of GTM", "Push-pull marketing strategies. Managed product and growth.", " Awarded Selfless service to the school award", "Built a weekly churn dashboard in Tableau used by three teams.", "Responsible for:"])
    assert.equal(readsLikeSentence(s), true, s);
});
test("fmtNum adds separators but leaves years, codes and decimals", () => {
  assert.equal(fmtNum("Curated over 1000 relevant leads"), "Curated over 1,000 relevant leads");
  assert.equal(fmtNum("Raised $100000 in 2023"), "Raised $100,000 in 2023");
  assert.equal(fmtNum("B2B, 2K20, 91.6%, 9,500"), "B2B, 2K20, 91.6%, 9,500");
});
test("lineRef reads like a citation", () => {
  const L = (...ns) => ns.map((n) => ({ n }));
  assert.equal(lineRef(L(20), true), "Resume line 20");
  assert.equal(lineRef(L(30, 31, 32, 33), true), "Resume lines 30 to 33");
  assert.equal(lineRef(L(48, 49), true), "Resume lines 48 and 49");
  assert.equal(lineRef(L(10, 12, 23), true), "Resume lines 10, 12 and 23");
  assert.equal(lineRef(L(5), false), "Line 5");
});

// ---------------------------------------------------------------- Jeremy, as the mapper sends it now
const J = profileView(P("v2-jeremy.json"));
test("Jeremy: real employers with dates, junk pooled below", () => {
  const ex = J.stints.find((s) => s.kind === "experience");
  assert.deepEqual(ex.entries.map((e) => e.org), ["Fitmedik", "Mariana AI", "Mulya", "Learnon"]);
  assert.deepEqual(ex.entries.map((e) => e.dates), ["Present", "Sep 2023 - Nov 2023", "Jun 2023 - Jul 2023", "Jun 2021 - May 2023"]);
  assert.equal(ex.pool.caption, "Also on the resume");
  assert.equal(ex.pool.items.length, 20);
  assert.equal(ex.pool.shown, 5);
  assert.equal(ex.pool.items[1].head, "Push-Pull Marketing");
});
test("Jeremy: education newest first, school anchored with its stream", () => {
  const ed = J.stints.find((s) => s.kind === "education");
  assert.deepEqual(ed.entries.map((e) => [e.mode, e.title]), [["clean", "BBA Finance and International Business"], ["anchored", "St. Thomas Residential School, Trivandrum, ISC"]]);
  assert.equal(ed.entries[0].dates, "Aug 2022 - Present");
  assert.equal(ed.entries[1].sub, "Commerce and Computer Science");
  assert.deepEqual(ed.entries[1].body.map((b) => b.text), ["ISC 12th Grade: 91.6%, ICSE 10th Grade: 86%"]);
  assert.equal(ed.entries[1].span, "");
});
test("Jeremy: highlights headline outcomes with separators", () => {
  assert.deepEqual(J.highlights.map((h) => h.value), ["87%", "$250K", "1,000"]);
  assert.equal(J.highlights[2].label, "Curated over 1,000 relevant leads and onboarded the majority onto the community");
  assert.equal(J.highlights[0].ref.label, "Resume line 20");
});
test("Jeremy: competition wins appear as Awards", () => {
  assert.equal(J.awards.label, "Awards");
  assert.equal(J.awards.groups[0].caption, "Business strategy fests");
  assert.equal(J.awards.count, 9);
  assert.equal(J.awards.shown, 5);
});
test("Jeremy: skills tidy, one group, nothing junk", () => {
  assert.equal(J.skills.length, 1);
  assert.equal(J.skills[0].where, "Listed on the resume");
  assert.ok(J.skills[0].names.includes("Business Partnerships"));
  for (const bad of ["Current", "Business", "Partnerships", "Growth", "Brand"]) assert.ok(!J.skills[0].names.includes(bad), bad);
});
test("Jeremy: the ask, every city, freshness", () => {
  assert.deepEqual(J.looking, {
    main: "Strategy Analyst",
    sub: "Full-time role, starting Jan 2027",
    rows: [
      { k: "Company", v: "Seed-stage startups" },
      { k: "Location", v: "New York, London, California, Singapore, Arizona, Perth, Nairobi" },
      { k: "Remote", v: "Open to remote work" },
    ],
  });
  assert.equal(J.updated, "12 Oct 2026");
  assert.deepEqual(J.proof, { matched: 8, total: 8, all: true, text: "8 of 8 claims matched to Jeremy’s resume" });
});
test("Jeremy: claim 1 opens with its wrapped context line", () => {
  const c = J.sources.groups[0].claims[0];
  assert.equal(J.sources.groups[0].label, "Summary");
  assert.deepEqual(c.ref.lines.map((l) => [l.n, l.ctx]), [[4, true], [5, false]]);
  assert.match(c.ref.lines[0].text, /founders to$/);
  assert.deepEqual(J.sources.groups.map((g) => g.label), ["Summary", "Experience"]);
});

test("highlights: the figure column fits the widest figure and stacks on phones when it must", () => {
  // Short figures keep the usual 92px / 112px grid.
  assert.deepEqual(J.figCol, { phone: 92, desktop: 112, stack: "none" });
  const base = P("v2-sample.json");
  assert.deepEqual(profileView(base).figCol, { phone: 92, desktop: 112, stack: "none" });
  const withFigures = (...values) => profileView({ ...base, numbers: values.map((value) => ({ value, label: "things counted", evidence: [] })) }).figCol;
  // "2,50,000" widens the column but still sits beside its label.
  const wide = withFigures("2,50,000", "87%");
  assert.equal(wide.stack, "none");
  assert.ok(wide.phone > 92 && wide.phone <= 118 && wide.desktop > 112, JSON.stringify(wide));
  // Lakh and crore figures go above their labels below 640px, beside them from 640px.
  const lakh = withFigures("1,00,000+", "\u20b912,00,000");
  assert.equal(lakh.stack, "phone");
  assert.ok(lakh.desktop >= 158 && lakh.desktop <= 200, JSON.stringify(lakh));
  assert.equal(withFigures("$1,250,000,000,000").stack, "all");
  assert.deepEqual(profileView({ name: "No Figures" }).figCol, { phone: 92, desktop: 112, stack: "none" });
});

// ---------------------------------------------------------------- Jeremy, as the mapper sent it before the repairs
const J1 = profileView(P("v1-jeremy.json"));
test("Jeremy before the repairs: the page heuristics still give an honest page", () => {
  const ex = J1.stints.find((s) => s.kind === "experience");
  assert.equal(ex.entries.length, 0);
  assert.equal(ex.pool.caption, "From the resume");
  assert.deepEqual(J1.highlights.map((h) => h.value), ["87%", "$250K", "1,000"]);
  const names = J1.skills.flatMap((g) => g.names);
  for (const bad of ["Current", "Partnerships", "Growth", "Brand"]) assert.ok(!names.includes(bad), bad);
  assert.equal(J1.updated, "");
});

// ---------------------------------------------------------------- the mapper's repairs on Jeremy's saved page
test("toProfile: role lines become employers, numbers headline outcomes, skills tidy, updated set", () => {
  const raw = load("v1-jeremy.json").raw;
  const row = {
    fullName: "Jeremy Zechariah Abraham",
    college: "Christ University",
    course: "BBA Finance and International Business",
    yearOfStudy: "Class of 2025",
    talent: {
      page: { slug: "jeremy-zechariah-abraham", meta: "", headline: raw.headline, about: raw.about, claims: raw.claims, lines: raw.lines, visibility: raw.visibility, approvedAt: "2026-10-12T09:30:00.000Z" },
      prefs: { titles: ["Strategy Analyst"], cities: ["New York", "London"] },
    },
  };
  const p = toProfile(row, { origin: "https://studojo.pro", email: null, now: new Date("2026-10-15T12:00:00Z") });
  const recovered = p.experience.filter((s) => s.parse === "clean").map((s) => [s.title, s.org.name, s.from ?? "", s.to ?? ""]);
  assert.deepEqual(recovered, [
    ["Brand and Growth Strategy Intern", "Fitmedik", "", "Now"],
    ["Growth and Strategy Intern", "Mariana AI", "Sep 2023", "Nov 2023"],
    ["Growth (Summer intern)", "Mulya", "Jun 2023", "Jul 2023"],
    ["Founders Office", "Learnon", "Jun 2021", "May 2023"],
  ]);
  assert.equal(p.experience.find((s) => s.org.name === "Fitmedik").span, "9 mos");
  assert.deepEqual(p.numbers.map((n) => n.value), ["87%", "$250K", "1,000"]);
  const names = p.skills.map((s) => s.name);
  assert.equal(names.length, 12);
  assert.ok(names.includes("Business Partnerships"));
  assert.ok(!names.includes("Current"));
  assert.equal(p.updated, "2026-10-12T09:30:00.000Z");
  assert.equal(p.feature, undefined);
  assert.equal(p.url, "studojo.pro/profile/jeremy-zechariah-abraham");
  for (const s of [...p.experience, ...p.projects, ...p.education]) assert.ok(["clean", "anchored", "loose"].includes(s.parse), s.title);
  // Contact details never leave the server: the page source carries this whole object, not only what is drawn.
  const all = JSON.stringify(p);
  assert.ok(!/student@example\.com|90000 00000/.test(all), "contact details in the profile");
  assert.equal(p.lines.length, raw.lines.length, "lines keep their place, so line numbers still match the resume");
  // The contact band line is hidden whole (city, links and all), not only its email and phone.
  assert.equal(p.lines.find((l) => l.section === "header" && /hidden/.test(l.text)).text, "[contact details hidden]");
  // ...and the page still never shows or quotes that line.
  const v = profileView(p);
  assert.ok(!/\[(?:email|phone|contact details|personal details) hidden\]/.test(JSON.stringify(v)), "a hidden header line reached the view");
});

test("toProfile: the student's checked skills are what the page shows, an empty check included", () => {
  const lines = [
    { id: "r1", section: "header", text: "Aanya Kapoor" },
    { id: "r2", section: "experience", text: "Growth Marketing Intern, Leafline Foods | May 2025 - Jul 2025" },
    { id: "r3", section: "experience", text: "Ran 4 influencer campaigns using Canva that reached 2 lakh people" },
    { id: "r4", section: "skills", text: "Canva" },
    { id: "r5", section: "skills", text: "Copywriting" },
    { id: "r6", section: "skills", text: "Market Research" },
  ];
  const page = (skills, skillsChecked) => ({ fullName: "Aanya Kapoor", college: "", course: "", yearOfStudy: "", talent: { page: { slug: "aanya-kapoor", meta: "", headline: "h", about: "a", claims: [], lines, skills, skillsChecked, visibility: { link: true, search: false, managers: false, adult: true }, approvedAt: "2026-10-18T00:00:00Z" } } });
  const now = { origin: "https://studojo.pro", email: null, now: new Date("2026-10-19T00:00:00Z") };
  // every skill taken off: none come back
  assert.deepEqual(toProfile(page([], true), now).skills, []);
  // one skill per line, kept: none thinned out by the view; an added one-word skill stays beside a longer one
  const kept = toProfile(page([{ name: "Copywriting", evidence: ["r5"], by: "resume" }, { name: "Market Research", evidence: ["r6"], by: "resume" }, { name: "Research", evidence: [], by: "you" }], true), now);
  const shown = profileView(kept).skills.flatMap((g) => g.names);
  assert.deepEqual(shown.sort(), ["Copywriting", "Market Research", "Research"]);
  // a page with no check keeps the resume's skills section
  assert.deepEqual(toProfile(page(undefined, undefined), now).skills.map((s) => s.name), ["Canva", "Copywriting", "Market Research"]);
});

test("toProfile: personal details never reach the page, in any section", () => {
  const lines = [
    { id: "r1", section: "header", text: "Riya Menon" },
    { id: "r2", section: "header", text: "Flat 4B, Sai Residency, 12th Main Road, Indiranagar, Bengaluru" },
    { id: "r3", section: "header", text: "Commerce student at St. Xavier's College (2022 - 2025) building fintech side projects" },
    { id: "r4", section: "extra", text: "Date of Birth: 14/03/2004" },
    { id: "r5", section: "extra", text: "Mobile (SG): 9123 4567" },
    { id: "r6", section: "extra", text: "Won the inter-college quiz in 2024" },
  ];
  const claims = [
    { id: "c1", section: "intro", text: "Commerce student at St. Xavier's College (2022 - 2025) building fintech side projects", evidence: ["r3"] },
    { id: "c2", section: "more", text: "Date of Birth: 14/03/2004", evidence: ["r4"] },
    { id: "c3", section: "more", text: "Won the inter-college quiz in 2024", evidence: ["r6"] },
  ];
  const row = { fullName: "Riya Menon", college: "", course: "", yearOfStudy: "", talent: { page: { slug: "riya-menon", meta: "", headline: "h", about: "a", claims, lines, visibility: { link: true, search: false, managers: false, adult: true }, approvedAt: "2026-10-18T00:00:00Z" } } };
  const p = toProfile(row, { origin: "https://studojo.pro", email: null, now: new Date("2026-10-19T00:00:00Z") });
  const all = JSON.stringify(p);
  assert.ok(!/Indiranagar|14\/03\/2004|9123 4567/.test(all), "personal details in the profile");
  assert.deepEqual(p.claims.map((c) => c.id), ["c1", "c3"], "the personal claim is left off; the summary claim still matches its line");
  assert.equal(p.lines.find((l) => l.id === "r3").text, lines[2].text, "a summary sentence keeps its words");
  const v = profileView(p);
  assert.ok(!/\[(?:contact|personal) details hidden\]/.test(JSON.stringify(v)), "a hidden line is never quoted");
});

// ---------------------------------------------------------------- hostile and edge cases
const S = profileView(P("edge-stress.json"));
test("stress: titles survive abbreviations, verbs and ' at '", () => {
  const ex = S.stints.find((s) => s.kind === "experience");
  assert.deepEqual(ex.entries.map((e) => [e.mode, e.title, e.org]), [["clean", "Managed Services Intern", "Accenture"], ["clean", "Marketing Intern", "Women at Work Foundation"]]);
  const ed = S.stints.find((s) => s.kind === "education");
  assert.equal(ed.entries[0].title, "B.Tech. Computer Science");
  assert.deepEqual(S.skills[0].names, ["Marketing", "Sales", "Strategy", "Excel", "Python", "Leadership"]);
});
test("stress: a partial match is never shown as complete", () => {
  assert.deepEqual(S.proof, { matched: 3, total: 4, all: false, text: "3 of 4 claims matched to Venkatasubramanian’s resume" });
  const all = S.sources.groups.flatMap((g) => g.claims);
  assert.equal(all.filter((c) => !c.matched).length, 1);
  assert.equal(S.looking.rows.find((r) => r.k === "Location").v.split(", ").length, 12);
  assert.deepEqual(S.highlights.map((h) => h.value), ["9,500"]);
  assert.equal(S.nameSize, "xl");
});
test("stress: contact details never reach the view", () => {
  assert.ok(!/@gmail|9845012345|98450 12345/.test(strings(S)));
  const e5 = P("edge-stress.json").lines.find((l) => l.id === "e5");
  assert.match(txt(e5.text), /\[phone hidden\].*\[email hidden\]/);
});
test("edge: bare profiles render without throwing and drop empty sections", () => {
  for (const f of ["edge-name-only.json", "edge-missing-keys.json", "edge-email-no-target.json"]) {
    const v = profileView(P(f));
    assert.ok(v.name);
    if (f !== "edge-email-no-target.json") assert.deepEqual([v.looking, v.about, v.proof, v.sources, v.awards, v.stints.length, v.skills.length, v.highlights.length], [null, null, null, null, null, 0, 0, 0]);
    else assert.equal(v.looking, null);
  }
  assert.equal(profileView(null).name, "Student");
  assert.equal(profileView(undefined).stints.length, 0);
});
test("Riya Menon: city folded into the college, sparse page complete", () => {
  const R = profileView(P("v2-riya-menon.json"));
  assert.equal(R.city, "");
  assert.deepEqual(R.highlights.map((h) => h.value), ["8.4"]);
  assert.deepEqual(R.stints.map((s) => s.kind), ["experience", "projects", "education"]);
  assert.equal(R.email, null);
});
test("no dash, no private-use glyph, no undefined anywhere in any view", () => {
  const files = ["v2-jeremy.json", "v2-riya-menon.json", "v2-sample.json", "v1-jeremy.json", "v1-riya-menon-6dt.json", "v1-riya-menon-951.json", "v1-riya-menon-mss.json", "edge-stress.json", "edge-name-only.json", "edge-missing-keys.json", "edge-unmatched-claim.json", "edge-worst-first-screen.json", "edge-long-values.json"];
  for (const f of files) {
    const s = strings(profileView(P(f)));
    assert.ok(!/[\u2013\u2014]/.test(s), `${f} has a dash`);
    assert.ok(!/[-]/.test(s), `${f} has a glyph`);
    assert.ok(!/undefined|NaN/.test(s), `${f} has undefined`);
  }
});

console.log(`\nprofile-view: ${passed} passed`);
