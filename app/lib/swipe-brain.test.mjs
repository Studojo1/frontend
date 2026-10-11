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
ok("role cards never probe pay (stipends aren't shown)", ![...asha.deck, ...dev.deck].some((p) => p.probe === "pay" || p.probe === "gain:pay"));
ok("every card says why it's shown", [...asha.deck, ...dev.deck].every((p) => p.reason && p.reason.length > 10));
ok("no company twice in a row", asha.deck.every((p, i) => i === 0 || p.role.company !== asha.deck[i - 1].role.company));
ok("stops between min and max", asha.swipes.length >= MIN_SWIPES && asha.swipes.length <= MAX_SWIPES, String(asha.swipes.length));

const say = (x) => x.learned.insights.map((i) => i.text).join(" | ");
ok("Asha: drawn to analytics", asha.learned.clusters[0] === "Analytics", say(asha));
ok("Asha: would move", /move for the right role/.test(say(asha)), say(asha));
ok("Asha: no pay claims from role swipes alone", !/Pay matters|Pay isn't/.test(say(asha)) && asha.learned.minMonthly === null, say(asha));
ok("no kind of check more than twice", ["gain:place", "gain:company", "gain:length"].every((g) => asha.deck.filter((p) => p.probe === g).length <= 2), JSON.stringify(asha.deck.map((p) => p.probe)));
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

// ── Mixed deck: role cards plus quick cards, chat questions folded in ────────
{
  const { nextItem, learn: learn2 } = await import("./swipe-brain.ts");
  const ctx = { homeCity: "Bengaluru", skills: ["SQL", "Excel", "Python"] };
  const swipes = [], answers = {}, probes = [], kinds = [];
  let lastQuick = false, since = 0;
  for (let i = 0; i < 60; i++) {
    const it = nextItem(rows, swipes, answers, ctx, probes, lastQuick, since);
    if (!it) break;
    kinds.push(it.kind === "role" ? "R" : it.quick.kind[0].toUpperCase());
    if (it.kind === "role") {
      probes.push(it.pick.probe);
      swipes.push({ id: it.pick.role.id, verdict: it.pick.role.cluster === "Analytics" ? "like" : "pass", ms: 1500 });
      lastQuick = false; since++;
    } else {
      answers[it.quick.id] = it.quick.kind === "city" ? (it.quick.city === "Mumbai" ? "right" : "left") : it.quick.id === "mode" ? "either" : "right";
      lastQuick = true; since = 0;
    }
  }
  const total = kinds.length;
  const l = learn2(rows, swipes, ctx, answers);
  ok("mixed deck is long", total >= 22, `${total}: ${kinds.join("")}`);
  ok("quick cards are mixed in, never three in a row (a follow-up may come straight after)", /RRQ|RRC|RRD/.test(kinds.join("")) && !/[QCD]{3}/.test(kinds.join("").slice(0, swipes.length + 6)), kinds.join(""));
  ok("chat questions answered by the deck", l.workMode === "Hybrid" && l.startWhen && l.companyStage, JSON.stringify([l.workMode, l.startWhen, l.companyStage]));
  ok("dream companies asked about kept roles", l.dreamCompanies.length >= 1, JSON.stringify(l.dreamCompanies));
  ok("city card answers shape the cities", l.cities.includes("Mumbai"), JSON.stringify(l.cities));
  console.log("Mixed deck:", kinds.join(""), "→", l.insights.filter((i) => ["values", "plan"].includes(i.kind)).map((i) => i.text).join(" | "));
}
// ── Hidden facts teach nothing ──────────────────────────────────────────────
{
  const { learn: learn4 } = await import("./swipe-brain.ts");
  const ctx = { homeCity: "Bengaluru", skills: ["SQL", "Excel"] };
  const mumbai = rows.filter((r) => r.city === "Mumbai");
  const blind = mumbai.map((r) => ({ id: r.id, verdict: "like", ms: 1500, shows: [] }));
  const seen = mumbai.map((r) => ({ id: r.id, verdict: "like", ms: 1500, shows: ["place"] }));
  const tb = learn4(rows, blind, ctx).insights.map((i) => i.text).join(" | ");
  const ts = learn4(rows, seen, ctx).insights.map((i) => i.text).join(" | ");
  ok("location not shown: no moving claim, no cities", !/move/.test(tb) && learn4(rows, blind, ctx).cities.every((c) => c === "Bengaluru"), tb);
  ok("location shown: the same swipes do count", /move for the right role/.test(ts), ts);
  ok("company type not shown: no company claim", !/Big names|startups/.test(tb), tb);
}

// ── Branching: no repeats, follow-ups on topic ──────────────────────────────
{
  const { nextItem, learn: learn3 } = await import("./swipe-brain.ts");
  const ctx = { homeCity: "Bengaluru", skills: ["SQL", "Excel", "Python"] };
  const play = (answerFor) => {
    const swipes = [], answers = {}, probes = [], seq = [];
    let lastQuick = false, since = 0;
    for (let i = 0; i < 80; i++) {
      const it = nextItem(rows, swipes, answers, ctx, probes, lastQuick, since);
      if (!it) break;
      if (it.kind === "role") {
        seq.push(`R:${it.pick.role.city ?? "remote"}`);
        probes.push(it.pick.probe);
        swipes.push({ id: it.pick.role.id, verdict: it.pick.role.cluster === "Analytics" ? "like" : "pass", ms: 1500 });
        lastQuick = false; since++;
      } else {
        seq.push(`Q:${it.quick.id}`);
        answers[it.quick.id] = answerFor(it.quick.id);
        lastQuick = true; since = 0;
      }
    }
    return { seq, answers, l: learn3(rows, swipes, ctx, answers) };
  };
  // Stays home: no to the first city, then no to moving at all.
  const home = play((id) => (id.startsWith("city:") ? "left" : id === "move_any" ? "left" : id === "pay_matters" ? "right" : id === "pay_floor" ? "right" : "right"));
  const firstCity = home.seq.findIndex((x) => x.startsWith("Q:city:"));
  ok("a 'no' to a city is followed straight away by 'move at all?'", firstCity >= 0 && home.seq[firstCity + 1] === "Q:move_any", home.seq.join(" "));
  ok("only one city question once they said no", home.seq.filter((x) => x.startsWith("Q:city:")).length === 1, home.seq.join(" "));
  ok("won't move: no roles in other cities after that", home.seq.slice(firstCity + 2).filter((x) => x.startsWith("R:") && x !== "R:Bengaluru" && x !== "R:remote").length === 0, home.seq.join(" "));
  ok("won't move: says so, with the answer as evidence", /rather stay in Bengaluru/.test(home.l.insights.map((i) => i.text).join(" ")));
  const payQs = home.seq.filter((x) => /pay/.test(x));
  ok("pay: one question and one follow-up, right after", payQs.length === 2 && home.seq.indexOf("Q:pay_floor") === home.seq.indexOf("Q:pay_matters") + 1, payQs.join(" "));
  ok("pay floor from their answer", home.l.minMonthly === 30000);
  // Pay doesn't matter: no follow-up at all.
  const free = play((id) => (id === "pay_matters" ? "left" : "right"));
  ok("pay doesn't matter: no pay follow-ups", !free.seq.some((x) => x === "Q:pay_floor" || x === "Q:learn_pay"), free.seq.join(" "));
  // It depends: the trade-off, once.
  const dep = play((id) => (id === "pay_matters" ? "either" : "right"));
  ok("pay depends: one trade-off follow-up", dep.seq.filter((x) => x === "Q:learn_pay").length === 1 && !dep.seq.includes("Q:pay_floor"));
  ok("no question asked twice", [home, free, dep].every((r) => { const qs = r.seq.filter((x) => x.startsWith("Q:")); return new Set(qs).size === qs.length; }));
}
console.log(`${pass} passed, ${fail} failed (after mixed deck)`);
if (fail) process.exit(1);

// ── v2: what the work is, industry, why, clashes, answers that count ────────
{
  const { nextItem, nextCard: nc, learn: learn5, believe, predict, taskOf, doesOf, domainOf } = await import("./swipe-brain.ts");
  const ctx = { homeCity: "Bengaluru", skills: ["SQL", "Excel", "Python"] };

  // Every card can say what the work is.
  ok("every role has a task line", rows.every((r) => r.task.length > 20), rows.find((r) => r.task.length <= 20)?.title);
  ok("task from the listing when it says enough", !taskOf("Data analytics", "Analytics", "Responsibilities: Build weekly dashboards for the city ops team. Work with SQL.").typical);
  ok("typical task when the listing is empty", taskOf("Data analytics", "Analytics", "d").typical);
  ok("kind of task crosses kinds of work", doesOf("Growth Analyst") === "numbers" && doesOf("Data Analyst Intern") === "numbers" && doesOf("Business Development Intern") === "people");
  ok("industry from the company", domainOf("Zerodha") === "Fintech" && domainOf("Swiggy") === "Food & delivery" && domainOf("Tiny Studio") === "other");

  const play = (verdictFor, answerFor, max = 90) => {
    const swipes = [], answers = {}, probes = [], seq = [];
    let lastQuick = false, since = 0;
    for (let i = 0; i < max; i++) {
      const it = nextItem(rows, swipes, answers, ctx, probes, lastQuick, since);
      if (!it) break;
      if (it.kind === "role") {
        seq.push(`R:${it.pick.probe}`);
        probes.push(it.pick.probe);
        swipes.push({ id: it.pick.role.id, verdict: verdictFor(it.pick.role, swipes.length), ms: 1500, shows: it.pick.shows });
        lastQuick = false; since++;
      } else {
        seq.push(`Q:${it.quick.id}`);
        answers[it.quick.id] = answerFor(it.quick, answers);
        lastQuick = true; since = 0;
      }
    }
    return { seq, swipes, answers, probes, l: learn5(rows, swipes, ctx, answers) };
  };

  // Analytics person who loves product analytics and passes on PhonePe for the company.
  const a = play(
    (r) => (r.company === "PhonePe" ? "pass" : r.cluster === "Analytics" ? (r.focus === "Product analytics" ? "love" : "like") : "pass"),
    (q) => (q.id.startsWith("why:") ? "right" : q.id.startsWith("wow:") ? "right" : q.id === "stage" ? "right" : q.id.startsWith("city:") ? "left" : "either"),
  );
  ok("digs into a specialty of their kind of work", a.probes.includes("specialty"), a.seq.join(" "));
  ok("a love asks what did it, once", a.seq.filter((x) => x.startsWith("Q:wow:")).length === 1, a.seq.join(" "));
  ok("'the company' after a love makes it a dream company", a.l.dreamCompanies.length >= 1, JSON.stringify(a.l.dreamCompanies));
  ok("no dream question about a company already loved", a.seq.filter((x) => x.startsWith("Q:dream:")).every((x) => !a.l.dreamCompanies.slice(0, 1).some((c) => x === `Q:dream:${c}`) || !a.answers[`wow:${a.swipes.find((s) => rows.find((r) => r.id === s.id).company === c)?.id}`]));
  ok("follow-ups come straight after the swipe that opened them", a.seq.every((x, i) => !x.startsWith("Q:wow:") || a.seq[i - 1].startsWith("R:")), a.seq.join(" "));
  ok("no question asked twice (v2)", (() => { const qs = a.seq.filter((x) => x.startsWith("Q:")); return new Set(qs).size === qs.length; })());
  ok("said startup: no company check cards after that", a.seq.slice(a.seq.indexOf("Q:stage") + 1).every((x) => x !== "R:company" && x !== "R:gain:company"), a.seq.join(" "));
  ok("said startup: no 'famous name vs the work' repeat", !a.seq.includes("Q:brand_work"), a.seq.join(" "));
  ok("kind-of-task insight", /happiest working with numbers/.test(a.l.insights.map((i) => i.text).join(" | ")), a.l.insights.map((i) => i.text).join(" | "));

  // A surprise pass gets "what put you off?", and "the company" keeps the work in.
  const swipes = [];
  const analytics = rows.filter((r) => r.cluster === "Analytics");
  for (const r of analytics.slice(0, 5)) swipes.push({ id: r.id, verdict: "like", ms: 1200, shows: [] });
  const target = analytics[5];
  swipes.push({ id: target.id, verdict: "pass", ms: 1500, shows: [] });
  const it = nextItem(rows, swipes, {}, ctx, ["open"], false, 0);
  ok("surprise pass: 'what put you off?' comes next", it?.kind === "quick" && it.quick.id === `why:${target.id}`, JSON.stringify(it?.quick ?? it?.pick?.probe));
  const blamed = predict(analytics[6], believe(rows, swipes, ctx, {}), ctx);
  const shielded = predict(analytics[6], believe(rows, swipes, ctx, { [`why:${target.id}`]: "right" }), ctx);
  ok("'the company' shields the work from the pass", shielded > blamed, `${blamed} vs ${shielded}`);
  const l2 = learn5(rows, swipes, ctx, { [`why:${target.id}`]: "right" });
  ok("company that put them off is out of the best matches", !l2.best.some((b) => b.role.company === target.company));

  // Said startups, kept two big names: ask once which is right.
  const big = rows.filter((r) => r.big && r.cluster === "Analytics").slice(0, 2);
  const s3 = [...rows.filter((r) => r.cluster === "Analytics" && !r.big).slice(0, 2).map((r) => ({ id: r.id, verdict: "like", ms: 1200, shows: [] })), ...big.map((r) => ({ id: r.id, verdict: "like", ms: 1200, shows: ["company"] }))];
  const clash = nextItem(rows, s3, { stage: "right" }, ctx, ["open"], false, 0);
  ok("answer vs swipes clash: asks which is right", clash?.kind === "quick" && clash.quick.id === "check:company", JSON.stringify(clash?.quick?.id ?? clash?.pick?.probe));
  ok("the check answer replaces the first one", learn5(rows, s3, ctx, { stage: "right", "check:company": "left" }).companyStage === "Big company");

  // Answers count: "won't move" and a "no" city never show up in best matches.
  const stay = learn5(rows, swipes, ctx, { "city:Mumbai": "left", move_any: "left" });
  ok("best matches respect 'won't move'", stay.best.every((b) => !b.role.city || b.role.city === "Bengaluru"), JSON.stringify(stay.best.map((b) => b.role.city)));
  const floor = learn5(rows, swipes, ctx, { pay_matters: "right", pay_floor: "right" });
  ok("best matches respect the pay floor", floor.best.every((b) => b.role.monthly === null || b.role.monthly >= 30000), JSON.stringify(floor.best.map((b) => b.role.stipend)));
  ok("an answer seeds the beliefs", predict(rows.find((r) => r.big), believe(rows, [], ctx, { stage: "left" }), ctx) > predict(rows.find((r) => r.big), believe(rows, [], ctx, {}), ctx));

  console.log("v2 deck:", a.seq.join(" "));
  console.log("v2 learned:", a.l.insights.map((i) => i.text).join(" | "));
}
console.log(`${pass} passed, ${fail} failed (after v2)`);
if (fail) process.exit(1);
