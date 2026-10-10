// /start reads a resume before the student has an account and learns
// preferences from swipes. These pin both on realistic inputs.
import { quickParseResume, filledCount } from "./resume-quick-parse.ts";
import { clusterOf, parseStipend, inferPrefs, matches, pickDeck } from "./swipe-prefs.ts";
import { signalsFromTalent, mergeSignals, EMPTY_SIGNALS } from "./talent-profile.ts";

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++;
  else { fail++; console.error(`FAIL ${name}\n  got:  ${g}\n  want: ${w}`); }
}

const resume = `ASHA RAO
Bengaluru, India | +91 98450 12345 | asha.rao@gmail.com
linkedin.com/in/asha-rao | github.com/asharao | asharao.dev

EDUCATION
Christ University, Bengaluru
BBA Business Analytics, 2023 - 2027 | CGPA 8.6

EXPERIENCE
Data Intern | Zepto  Jun 2025 - Aug 2025
- Built a churn dashboard used by 3 teams
Analytics Lead at Christ Consulting Club 2024 - Present

SKILLS
Languages: Python, SQL, R
Tools: Excel, Tableau, Power BI | Figma

PROJECTS
Price elasticity model for a D2C brand`;

const r = quickParseResume(resume);
eq("email", r.email, { value: "asha.rao@gmail.com", confidence: "high" });
eq("name from an all-caps first line", r.name, { value: "Asha Rao", confidence: "high" });
eq("phone", r.phone?.value.replace(/\D/g, ""), "919845012345");
eq("college from education section", r.college, { value: "Christ University", confidence: "high" });
eq("course", r.course?.value, "BBA Business Analytics");
eq("graduation year is the latest year", r.gradYear, { value: 2027, confidence: "high" });
eq("city", r.city?.value, "Bengaluru");
eq("skills split across lines and separators, labels dropped", r.skills, ["Python", "SQL", "R", "Excel", "Tableau", "Power BI", "Figma"]);
eq("experience in both shapes", r.experience, [{ title: "Data Intern", company: "Zepto" }, { title: "Analytics Lead", company: "Christ Consulting Club" }]);
eq("links", r.links, { github: "asharao", linkedin: "https://www.linkedin.com/in/asha-rao", portfolio: "https://asharao.dev" });
eq("filled count", filledCount(r), { filled: 7, total: 7 });

const sparse = quickParseResume(`Curriculum Vitae\nrahul.verma@outlook.com\nI am good at python and excel and public speaking.`);
eq("no name line: name from email, low confidence", sparse.name, { value: "Rahul Verma", confidence: "low" });
eq("no skills section: known skills found in text", sparse.skills, ["Python", "Excel", "Public Speaking"]);
eq("nothing invented", [sparse.college, sparse.course, sparse.gradYear, sparse.city], [null, null, null, null]);
eq("C is not found inside other words", quickParseResume("Skills\nCommunication, Canva").skills, ["Communication", "Canva"]);
eq("'Resume' is not a name", quickParseResume("Resume\nPriya Nair\npriya@x.io").name, { value: "Priya Nair", confidence: "low" });
eq("no portfolio invented from an email", quickParseResume("Riya Menon\nriya.menon.demo@gmail.com | github.com/riyamenon").links, { github: "riyamenon" });
eq("empty text", quickParseResume("").email, null);

// ── swipes ──────────────────────────────────────────────────────────────────
eq("cluster: analytics", clusterOf("Business Intelligence Intern"), "Analytics");
eq("cluster: product beats design words", clusterOf("Product Analyst"), "Analytics");
eq("cluster: product", clusterOf("Associate Product Manager"), "Product");
eq("cluster: engineering", clusterOf("SDE Intern"), "Engineering");
eq("cluster: other", clusterOf("Chief Vibes Officer"), "Other");
eq("stipend ₹25,000/month", parseStipend("₹25,000/month"), 25000);
eq("stipend 40k", parseStipend("₹40k"), 40000);
eq("stipend range uses low end with unit", parseStipend("15-20k"), 15000);
eq("stipend LPA to monthly", parseStipend("6 LPA"), 50000);
eq("unpaid", parseStipend("Unpaid"), null);
eq("foreign currency ignored", parseStipend("AED 4k"), null);

const role = (id, title, city, stipend) => ({ id, title, company: `Co${id}`, location: city ?? "Remote", city, stipend, duration: "3 months", slug: `s${id}`, cluster: clusterOf(title), monthly: parseStipend(stipend) });
const pool = [
  role(1, "Data Analyst Intern", "Bengaluru", "₹30k"),
  role(2, "Product Analyst", "Mumbai", "₹40k"),
  role(3, "SDE Intern", "Bengaluru", "₹60k"),
  role(4, "Backend Developer", "Pune", "₹50k"),
  role(5, "Content Writer", "Remote", "₹10k"),
  role(6, "Growth Marketing Intern", "Bengaluru", "₹15k"),
  role(7, "Business Analyst", "Bengaluru", "₹20k"),
];
const p = inferPrefs([pool[0], pool[1]], [pool[2], pool[3], pool[4]]);
eq("liked clusters", p.clusters, ["Analytics"]);
eq("avoid: passed twice, never liked", p.avoid, ["Engineering"]);
eq("cities from likes", p.cities, ["Bengaluru", "Mumbai"]);
eq("stipend floor rounded down to 5k", p.minMonthly, 30000);
eq("live match count", matches(pool, p), 2);
eq("no swipes: everything matches", matches(pool, inferPrefs([], [])), 7);

const deck = pickDeck(pool, ["SQL", "data"], 5);
eq("deck size", deck.length, 5);
eq("deck leads with the resume hint", deck[0].cluster, "Analytics");
eq("deck spreads across clusters", new Set(deck.map((d) => d.cluster)).size >= 4, true);

// ── talent store feeds the profile ──────────────────────────────────────────
const fromStart = signalsFromTalent({ resume: { skills: ["SQL", "Excel"], experience: [{ title: "Data Intern", company: "Zepto" }] }, prefs: { cities: ["Bengaluru"], titles: ["Data Analyst Intern"], clusters: ["Analytics"], minMonthly: 25000 } });
eq("talent: skills, cities, roles, pay", [fromStart.skills, fromStart.locations, fromStart.targetRoles, fromStart.salary], [["SQL", "Excel"], ["Bengaluru"], ["Data Analyst Intern"], "₹25k+/mo"]);
eq("talent: garbage is empty", signalsFromTalent("x"), EMPTY_SIGNALS);
const merged = mergeSignals({ ...EMPTY_SIGNALS, skills: ["Python"] }, fromStart);
eq("merge: outreach wins where it has data, talent fills gaps", [merged.skills, merged.locations], [["Python"], ["Bengaluru"]]);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
