// The swipe deck must adapt to the person, not replay a script. These run two
// simulated students through the real nextCard loop and check the deck they
// get and what we conclude about them.
import { nextCard, learn, toBrainRole, features, MIN_SWIPES, MAX_SWIPES, focusOf, monthsOf, isBig } from "./swipe-brain.ts";
import { skillsIn } from "./resume-quick-parse.ts";

let pass = 0, fail = 0;
function ok(name, cond, detail = "") { if (cond) pass++; else { fail++; console.error(`FAIL ${name} ${detail}`); } }

const rows = [
  ["Data Analyst Intern", "PhonePe", "Bengaluru", "₹35,000/month", "6 months", "SQL, Excel, Python"],
  ["Business Analyst Intern", "Meesho", "Bengaluru", "₹30k", "3 months", "SQL, Excel"],
  ["Product Analyst Intern", "Groww", "Bengaluru", "₹40k", "6 months", "SQL, Mixpanel"],
  ["Analytics Intern", "Myntra", "Bengaluru", "₹12k", "6 months", "Excel"],
  ["Data Science Intern", "Fractal", "Mumbai", "₹45k", "6 months", "Python, Machine Learning"],
  ["Business Analyst", "Ola", "Pune", "₹30k", "6 months", "SQL, Excel"],
  ["Research Analyst Intern", "Tracxn", "Bengaluru", "Unpaid", "3 months", "Excel"],
  ["Marketing Analytics Intern", "Lenskart", "Delhi", "₹25k", "6 months", "Google Analytics, Excel"],
  ["Data Analyst", "Small Labs", "Mumbai", "₹8k", "2 months", "SQL"],
  ["Associate Product Manager Intern", "Swiggy", "Bengaluru", "₹50k", "6 months", "SQL, Figma"],
  ["SDE Intern", "Atlassian", "Bengaluru", "₹1,00,000/month", "6 months", "Java, Python"],
  ["Backend Developer Intern", "Postman", "Bengaluru", "₹60k", "6 months", "Node.js"],
  ["UI/UX Design Intern", "Zomato", "Gurugram", "₹25k", "3 months", "Figma"],
  ["Product Design Intern", "Tiny Studio", "Bengaluru", "₹10k", "3 months", "Figma, Illustrator"],
  ["Visual Design Intern", "Brandbox", "Remote", "Unpaid", "2 months", "Photoshop, Canva"],
  ["Growth Marketing Intern", "Nykaa", "Mumbai", "₹20k", "3 months", "SEO"],
  ["Content Writer Intern", "Unacademy", "Remote", "₹10k", "3 months", "Content Writing"],
  ["Investment Banking Analyst Intern", "Avendus", "Mumbai", "₹60k", "2 months", "Excel, Valuation"],
  ["Strategy Consulting Intern", "Bain Capability Network", "Gurugram", "₹75k", "2 months", "Excel"],
  ["HR Intern", "Freshworks", "Chennai", "₹15k", "3 months", ""],
  ["Business Development Intern", "Urban Company", "Gurugram", "₹18k", "3 months", ""],
  ["Supply Chain Operations Intern", "Flipkart", "Bengaluru", "₹40k", "6 months", "Excel"],
  ["Financial Analyst Intern", "Razorpay", "Bengaluru", "₹35k", "6 months", "Excel, Financial Modelling"],
  ["Data Analyst Intern", "Careem", "Dubai", "AED 4k", "6 months", "SQL"],
].map(([title, company, loc, stipend, duration, req], i) =>
  toBrainRole({ id: `r${i}`, title, company, location: loc, stipend, duration, slug: `s${i}`, requirements: req }, loc === "Remote" ? null : loc, skillsIn));

function run(ctx, decide) {
  const swipes = [], deck = [], probes = [];
  for (let i = 0; i < 30; i++) {
    const pick = nextCard(rows, swipes, ctx, probes);
    if (!pick) break;
    deck.push(pick);
    probes.push(pick.probe);
    swipes.push({ id: pick.role.id, ...decide(pick.role, features(pick.role, ctx)) });
  }
  return { deck, swipes, learned: learn(rows, swipes, ctx) };
}

// Asha: analytics, would move for it, but won't take low or unstated pay.
const asha = run({ homeCity: "Bengaluru", skills: ["SQL", "Excel", "Python", "Tableau"] }, (r, f) => {
  const yes = r.cluster === "Analytics" && f.pay !== "low" && f.pay !== "unstated";
  return { verdict: yes ? (r.focus === "Product analytics" ? "love" : "like") : "pass", ms: yes ? 1100 : 2600 };
});
// Dev: design only, stays in Bengaluru, doesn't care about pay.
const dev = run({ homeCity: "Bengaluru", skills: ["Figma", "Illustrator", "Canva"] }, (r, f) => {
  const yes = r.cluster === "Design" && f.place !== "move";
  return { verdict: yes ? "like" : "pass", ms: yes ? 1300 : 2200 };
});

const titles = (x) => x.deck.map((p) => p.role.title);
ok("first card follows the resume (Asha)", asha.deck[0].role.cluster === "Analytics", titles(asha)[0]);
ok("first card follows the resume (Dev)", dev.deck[0].role.cluster === "Design", titles(dev)[0]);
ok("decks differ between people", JSON.stringify(titles(asha)) !== JSON.stringify(titles(dev)));
ok("early cards explore other kinds of work", new Set(asha.deck.slice(0, 4).map((p) => p.role.cluster)).size >= 3);
ok("deck probes relocation for Asha", asha.deck.some((p) => p.probe === "relocate"), JSON.stringify(asha.deck.map((p) => p.probe)));
ok("deck probes pay for Asha", asha.deck.some((p) => p.probe === "pay"));
ok("every card says why it's shown", [...asha.deck, ...dev.deck].every((p) => p.reason && p.reason.length > 10));
ok("no company twice in a row", asha.deck.every((p, i) => i === 0 || p.role.company !== asha.deck[i - 1].role.company));
ok("stops between min and max", asha.swipes.length >= MIN_SWIPES && asha.swipes.length <= MAX_SWIPES, String(asha.swipes.length));

const say = (x) => x.learned.insights.map((i) => i.text).join(" | ");
ok("Asha: drawn to analytics", asha.learned.clusters[0] === "Analytics", say(asha));
ok("Asha: would move", /move for the right role/.test(say(asha)), say(asha));
ok("Asha: pay matters, floor only as high as the evidence", /Pay matters/.test(say(asha)) && asha.learned.minMonthly > 8000 && asha.learned.minMonthly <= 30000, `${say(asha)} floor=${asha.learned.minMonthly}`);
ok("Asha: every insight has evidence", asha.learned.insights.every((i) => i.evidence));
ok("Asha: best matches are analytics she hasn't seen", asha.learned.best.length === 0 || asha.learned.best[0].role.cluster === "Analytics", JSON.stringify(asha.learned.best.map((b) => b.role.title)));
ok("Dev: drawn to design", dev.learned.clusters[0] === "Design", say(dev));
ok("Dev: not Asha's conclusions", !/move for the right role/.test(say(dev)), say(dev));

// Features.
ok("focus", focusOf("Product Analyst Intern") === "Product analytics");
ok("months", monthsOf("6 months") === 6 && monthsOf("8 weeks") === 2 && monthsOf("flexible") === null);
ok("big company", isBig("Atlassian") && !isBig("Tiny Studio"));
ok("skills from requirements", skillsIn("Must know SQL, Excel and Power BI").join() === "SQL,Excel,Power BI");

console.log(`${pass} passed, ${fail} failed`);
console.log("Asha deck:", asha.deck.map((p) => `${p.role.title} [${p.probe}]`).join(" → "));
console.log("Asha learned:", say(asha));
console.log("Dev deck:", dev.deck.map((p) => `${p.role.title} [${p.probe}]`).join(" → "));
console.log("Dev learned:", say(dev));
if (fail) process.exit(1);
