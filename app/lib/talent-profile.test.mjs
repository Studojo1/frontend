// The profile page reads LLM output (parsed resume, profiling chat) and
// public HTML (GitHub). These cases pin what it must keep, what it must drop
// and what it must refuse, using the shapes the services really return.
import { signalsFromCandidate, normalizeLinks, githubHandle, profileStrength, headline, EMPTY_SIGNALS } from "./talent-profile.ts";
import { parseContributions } from "./github-contributions.ts";
import { findPlace, distanceKm } from "./geo.ts";

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++;
  else { fail++; console.error(`FAIL ${name}\n  got:  ${g}\n  want: ${w}`); }
}

// ── signalsFromCandidate ────────────────────────────────────────────────────
const real = {
  candidate_id: 41,
  target_roles: ["Product Analyst", "product analyst", ""],
  target_industries: ["Fintech"],
  dream_companies: ["Razorpay", "CRED"],
  resume_profile: {
    name: "Asha Rao",
    skills: ["SQL", "Python", "Excel", "sql", "Tableau", "A/B testing"],
    key_strengths: ["Turns messy data into decisions"],
    experience: [{ title: "Data Intern", company: "Zepto", duration: "Jun 2025 - Aug 2025", description: "..." }],
    summary_text: "Analytics-minded BBA student.",
  },
  parsed_json: {
    profile_summary: "Profile generated from conversation.",
    personal_info: { skills_detected: ["Python", "Power BI"] },
    preferences: {
      locations: ["bengaluru", "Remote", "any"],
      work_mode: "hybrid",
      timeline: "flexible",
      salary_expectations: { min_annual_ctc: 600000, max_annual_ctc: 1000000, currency: "INR" },
      industry_interests: ["fintech", "SaaS"],
    },
    career_analysis: {
      primary_cluster: "Analytics",
      recommended_roles: [
        { title: "Business Analyst", fit_score: 0.72, reasoning: "SQL + internship" },
        { title: "Product Analyst", fit_score: 0.81, reasoning: "Product sense" },
        { title: "Bad", fit_score: 7 },
      ],
    },
  },
};
const s = signalsFromCandidate(real);
eq("skills merged, deduped case-insensitively", s.skills, ["SQL", "Python", "Excel", "Tableau", "A/B testing", "Power BI"]);
eq("target roles deduped, blanks dropped", s.targetRoles, ["Product Analyst"]);
eq("role fits sorted by fit, bad score kept without a fit", s.roleFits.map((r) => [r.title, r.fit]), [["Product Analyst", 0.81], ["Business Analyst", 0.72], ["Bad", null]]);
eq("locations: placeholders dropped, lowercase title-cased", s.locations, ["Bengaluru", "Remote"]);
eq("work mode kept", s.workMode, "hybrid");
eq("'flexible' timeline is a placeholder", s.timeline, null);
eq("salary in lakhs", s.salary, "₹6–10 L");
eq("industries merged across sources", s.industries, ["Fintech", "SaaS"]);
eq("resume summary preferred", s.summary, "Analytics-minded BBA student.");
eq("experience kept", s.experience, [{ title: "Data Intern", company: "Zepto", duration: "Jun 2025 - Aug 2025" }]);

const defaults = signalsFromCandidate({
  parsed_json: {
    profile_summary: "Profile generated from conversation.",
    career_analysis: { primary_cluster: "General", recommended_roles: [{ title: "Associate", fit_score: 0.5 }] },
    preferences: { salary_expectations: { min_annual_ctc: 0, max_annual_ctc: 0 } },
  },
});
eq("payload-builder defaults are not shown as facts", [defaults.summary, defaults.cluster, defaults.roleFits, defaults.salary], [null, null, [], null]);
eq("garbage input gives empty signals", signalsFromCandidate("nope"), EMPTY_SIGNALS);
eq("null input gives empty signals", signalsFromCandidate(null), EMPTY_SIGNALS);
eq("USD salary", signalsFromCandidate({ parsed_json: { preferences: { salary_expectations: { min_annual_ctc: 90000, max_annual_ctc: 120000, currency: "usd" } } } }).salary, "$90k–120k");
eq("salary already in lakhs", signalsFromCandidate({ parsed_json: { preferences: { salary_expectations: { min_annual_ctc: 8, max_annual_ctc: 8 } } } }).salary, "₹8 L");

// ── links ───────────────────────────────────────────────────────────────────
eq("github: bare", githubHandle("octocat"), "octocat");
eq("github: @handle", githubHandle("@octo-cat"), "octo-cat");
eq("github: url", githubHandle("https://github.com/octocat/"), "octocat");
eq("github: repo url is not a profile", githubHandle("github.com/octocat/hello-world"), null);
eq("github: double hyphen", githubHandle("a--b"), null);
eq("github: path injection", githubHandle("../../x"), null);
eq("links: all valid", normalizeLinks({ github: "github.com/octocat", linkedin: "linkedin.com/in/asha-rao/", portfolio: "asha.dev" }),
  { links: { github: "octocat", linkedin: "https://www.linkedin.com/in/asha-rao", portfolio: "https://asha.dev/" } });
eq("links: empty clears", normalizeLinks({ github: "", linkedin: " ", portfolio: "" }), { links: {} });
eq("links: linkedin company page refused", "error" in normalizeLinks({ linkedin: "linkedin.com/company/x" }), true);
eq("links: fake linkedin host refused", "error" in normalizeLinks({ linkedin: "https://linkedin.com.evil.io/in/x" }), true);
eq("links: javascript url refused", "error" in normalizeLinks({ portfolio: "javascript:alert(1)" }), true);
eq("links: non-object", normalizeLinks("x"), { links: {} });

// ── strength ────────────────────────────────────────────────────────────────
const none = profileStrength({ basics: { name: false, college: false, course: false, year: false }, resumeCanFill: false, hasResume: false, hasCareerDna: false, signals: EMPTY_SIGNALS, links: null, hasApplied: false });
eq("weights add to 100", none.items.reduce((n, i) => n + i.weight, 0), 100);
eq("empty profile scores 0", none.score, 0);
const half = profileStrength({ basics: { name: true, college: true, course: false, year: false }, resumeCanFill: true, hasResume: true, hasCareerDna: false, signals: s, links: { github: "octocat" }, hasApplied: false });
eq("partial basics get partial credit", half.score, 8 + 20 + 15 + 10 + 10 + 10);
eq("autofill offered when the resume can fill", half.items.find((i) => i.key === "basics").action.kind, "autofill");
const full = profileStrength({ basics: { name: true, college: true, course: true, year: true }, resumeCanFill: false, hasResume: true, hasCareerDna: true, signals: s, links: { linkedin: "x" }, hasApplied: true });
eq("complete profile scores 100", full.score, 100);

eq("headline: coach role wins", headline(s, "Data Analyst"), "Aspiring Data Analyst");
eq("headline: target role next", headline(s, null), "Aspiring Product Analyst");
eq("headline: none", headline(EMPTY_SIGNALS, null), null);

// ── GitHub calendar ─────────────────────────────────────────────────────────
const cell = (d, w, date, lvl) =>
  `<td tabindex="0" data-ix="${w}" style="width: 10px" data-date="${date}" id="contribution-day-component-${d}-${w}" data-level="${lvl}" role="gridcell" class="ContributionCalendar-day"></td>`;
const tip = (d, w, text) =>
  `<tool-tip id="t-${d}-${w}" for="contribution-day-component-${d}-${w}" popover="manual" class="sr-only">${text}</tool-tip>`;
const html =
  cell(0, 0, "2025-10-05", 1) + cell(1, 0, "2025-10-06", 4) + cell(0, 1, "2025-10-12", 0) +
  tip(0, 0, "10 contributions on October 5th.") + tip(1, 0, "1,204 contributions on October 6th.") + tip(0, 1, "No contributions on October 12th.") +
  tip(9, 9, "999 contributions on a cell that does not exist.");
const gh = parseContributions(html);
eq("github: total counts only real cells, with thousands separators", gh.total, 1214);
eq("github: grid shape and padding", gh.weeks, [[1, 4, -1, -1, -1, -1, -1], [0, -1, -1, -1, -1, -1, -1]]);
eq("github: start date", gh.start, "2025-10-05");
eq("github: page without a calendar", parseContributions("<html>rate limited</html>"), null);

// ── places ──────────────────────────────────────────────────────────────────
eq("place in college name", findPlace("Christ University, Bengaluru")?.name, "Bengaluru");
eq("'University' is not the US", findPlace("Christ University"), null);
eq("longest match wins", findPlace("IIT Delhi, New Delhi")?.name, "New Delhi");
eq("distance Bengaluru-Mumbai about 845 km", Math.round(distanceKm([12.9716, 77.5946], [19.076, 72.8777]) / 5) * 5, 845);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
