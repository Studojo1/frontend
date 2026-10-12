// People for /b2cnew beyond the twelve jernew matches. All FICTIONAL: made-up
// names at invented companies. Shown with a "Sample" label.
// Shared file: owned by the foundation. Import through ./data.

/** Full surnames, unlocked after payment. Match the jernew masked initials. */
export const SURNAMES: Record<string, string> = {
  Ananya: "Rao",
  Karan: "Mehta",
  Meera: "Shah",
  Arjun: "Kapoor",
  Neha: "Desai",
  Vikram: "Patil",
  Sana: "Ali",
  Rohan: "Gupta",
  Ishita: "Nair",
  Aditya: "Verma",
  Tara: "Joshi",
  Dev: "Chawla",
};

/** Which resume lines back each jernew match's "why". */
export const MATCH_EVIDENCE: Record<string, string[]> = {
  kitebase: ["r-proj-1-title", "r-proj-1-a"],
  paperplane: ["r-proj-1-b", "r-skills"],
  tandem: ["r-proj-1-a", "r-exp-1"],
  quillpay: ["r-proj-1-title", "r-exp-2"],
  loomwell: ["r-exp-title", "r-exp-2"],
  seedline: ["r-proj-2-title", "r-proj-2-a"],
  brightfold: ["r-proj-1-a"],
  monsoon: ["r-exp-1"],
  orbitly: ["r-skills", "r-proj-2-a"],
  fable: ["r-proj-1-b"],
  northstar: ["r-exp-2"],
  cobalt: ["r-skills"],
};

/**
 * Simulated history of the eight jan27 matches: the day the first email went
 * and the day the page was opened from the follow-up. Replies come from
 * SIM_REPLIES and are filtered by the day.
 */
export const MATCH_HISTORY: Record<string, { firstDay: number; pageOpenedDay?: number }> = {
  kitebase: { firstDay: 0, pageOpenedDay: 4 },
  paperplane: { firstDay: 0, pageOpenedDay: 5 },
  tandem: { firstDay: 1, pageOpenedDay: 7 },
  northstar: { firstDay: 1, pageOpenedDay: 5 },
  quillpay: { firstDay: 2, pageOpenedDay: 9 },
  brightfold: { firstDay: 3, pageOpenedDay: 8 },
  fable: { firstDay: 3, pageOpenedDay: 7 },
  cobalt: { firstDay: 4 },
};

/** jan27 holds these MATCHES; ft27 holds the rest. */
export const JAN27_MATCH_IDS = ["kitebase", "paperplane", "tandem", "quillpay", "brightfold", "fable", "northstar", "cobalt"];
export const FT27_MATCH_IDS = ["loomwell", "seedline", "monsoon", "orbitly"];

export interface ExtraPerson {
  id: string;
  first: string;
  last: string;
  title: string;
  company: string;
  hook: string;
  sector: string;
  city: string;
  stageLabel: string;
  fit: number;
  why: string;
  evidence: string[];
  /** contacted: already emailed. pending: matched with a draft waiting (the 12). held: found by F6. */
  group: "contacted" | "pending" | "held";
  firstDay?: number;
  pageOpenedDay?: number;
  hiringFor: string;
}

type Row = [id: string, first: string, last: string, title: string, company: string, hook: string, sector: string, city: string, stage: string, fit: number, lineId: string, why: string, firstDay?: number, opened?: number];

const CONTACTED: Row[] = [
  ["ledgerleaf", "Farhan", "Qureshi", "Engineering Lead", "Ledgerleaf", "expense cards for startups", "Fintech", "Bengaluru", "Seed", 82, "r-proj-1-a", "Splitkart settles shared bills. Ledgerleaf settles company ones.", 0, 4],
  ["tiffinly", "Pooja", "Iyer", "CTO", "Tiffinly", "lunch subscriptions for offices", "Food tech", "Pune", "Seed", 78, "r-proj-2-a", "Your canteen analysis is their menu planning problem.", 1, 5],
  ["gridlane", "Nikhil", "Bose", "Founder", "Gridlane", "EV charger booking", "Climate tech", "Bengaluru", "Seed", 75, "r-proj-1-b", "A booking product on React and Node.js, the stack you shipped.", 1],
  ["parcelpath", "Zoya", "Merchant", "Engineering Lead", "Parcelpath", "last-mile delivery tracking", "Logistics", "Pune", "Series A", 77, "r-exp-2", "They live on dashboards. You built one used every week.", 2, 6],
  ["coinnest", "Kabir", "Sethi", "Engineering Manager", "Coinnest", "savings goals for young earners", "Fintech", "Remote", "Seed", 80, "r-proj-1-a", "Their users are your 1,200 hostel users, two years older.", 2, 6],
  ["shelfwise", "Lavanya", "Pillai", "Head of Engineering", "Shelfwise", "inventory apps for kirana stores", "Retail tech", "Bengaluru", "Series A", 79, "r-proj-1-b", "Small shops, simple flows, PostgreSQL underneath.", 3],
  ["busbay", "Omkar", "Kulkarni", "Tech Lead", "Busbay", "college bus passes", "Mobility", "Pune", "Seed", 74, "r-proj-1-a", "Campus product, campus users. You have done this.", 3],
  ["notebloom", "Rhea", "Fernandes", "Founder", "Notebloom", "a study notes marketplace", "Edtech", "Remote", "Seed", 73, "r-extra", "You run a 220-member club. That is their community playbook.", 4],
  ["tallyhive", "Yash", "Agarwal", "Engineering Manager", "Tallyhive", "GST invoicing for freelancers", "Fintech", "Bengaluru", "Series A", 76, "r-skills", "TypeScript and SQL on money flows.", 4],
  ["dosewise", "Mitali", "Ghosh", "Software Lead", "Dosewise", "medicine reminders for families", "Health tech", "Pune", "Seed", 72, "r-proj-1-b", "A reminders product in your stack, in your city.", 5],
];

const PENDING: Row[] = [
  ["payroute", "Aarav", "Bhatt", "Engineering Manager", "Payroute", "UPI collections for tuition centres", "Fintech", "Pune", "Seed", 84, "r-proj-1-a", "UPI, small payers, one-tap settle. Splitkart in a different coat."],
  ["hostelhub", "Kavya", "Reddy", "Founder", "Hostelhub", "rent and mess payments for hostels", "Proptech", "Bengaluru", "Seed", 86, "r-proj-1-a", "You already have 3 hostels using your app."],
  ["swapsy", "Ishaan", "Malhotra", "Head of Product Engineering", "Swapsy", "textbook swaps between students", "Marketplace", "Remote", "Seed", 81, "r-proj-1-a", "Students trading with students, the crowd you built for."],
  ["billbird", "Nandini", "Rao", "Engineering Manager", "Billbird", "shared bills for flatmates", "Fintech", "Bengaluru", "Seed", 85, "r-proj-1-b", "Shared bills is literally your project."],
  ["queuecut", "Varun", "Chopra", "CTO", "Queuecut", "clinic queue apps", "Health tech", "Pune", "Series A", 79, "r-proj-1-b", "React and Node.js on a product people use daily."],
  ["ticketnook", "Sneha", "Pandey", "Engineering Lead", "Ticketnook", "event tickets for college fests", "Events", "Bengaluru", "Seed", 80, "r-extra", "You ran 2 hackathons. You know the fest crowd."],
  ["cartcraft", "Rahul", "Bhatia", "Engineering Manager", "Cartcraft", "storefronts for home bakers", "Commerce", "Remote", "Seed", 77, "r-exp-1", "14 campaigns at a D2C brand means you know their sellers."],
  ["rupeeloop", "Aisha", "Khan", "Engineering Manager", "Rupeeloop", "split payments for group trips", "Fintech", "Pune", "Seed", 83, "r-proj-1-a", "Group money between friends. Same problem, bigger trips."],
  ["metricmint", "Manav", "Shetty", "Founding Engineer", "Metricmint", "dashboards for small D2C brands", "B2B SaaS", "Bengaluru", "Seed", 78, "r-exp-2", "You built the cohort dashboard their customers want."],
  ["campuscart", "Priyanka", "Das", "Head of Engineering", "Campuscart", "campus delivery for students", "Commerce", "Pune", "Series A", 82, "r-proj-1-a", "1,200 students is a campus they would love to launch in."],
  ["fixkit", "Harsh", "Vora", "Engineering Manager", "Fixkit", "repair bookings for phones", "Services", "Bengaluru", "Seed", 74, "r-proj-1-b", "Bookings and payments on PostgreSQL, like your tracker."],
  ["studypod", "Divya", "Saxena", "CTO", "Studypod", "group study rooms", "Edtech", "Remote", "Seed", 76, "r-extra", "A club lead who ships. Their first users are clubs."],
];

const HELD: Row[] = [
  ["paybridge", "Arnav", "Jain", "Engineering Manager", "Paybridge", "vendor payouts for marketplaces", "Fintech", "Bengaluru", "Seed", 84, "r-proj-1-a", "Money moving between people who trust each other, like Splitkart."],
  ["autodue", "Meghna", "Batra", "Payments Lead", "Autodue", "UPI autopay for subscriptions", "Fintech", "Pune", "Series A", 82, "r-proj-1-b", "UPI flows in your stack, in Pune."],
  ["khatabox", "Tanmay", "Bhave", "Founder", "Khatabox", "credit ledgers for corner shops", "Fintech", "Pune", "Seed", 86, "r-proj-1-a", "A ledger between people who know each other. Kitebase's cousin."],
  ["fundflow", "Ritika", "Anand", "Engineering Lead", "Fundflow", "fee collection for coaching classes", "Fintech", "Bengaluru", "Seed", 83, "r-proj-1-a", "Students paying, small teams collecting."],
  ["walletwise", "Sameer", "Kapadia", "CTO", "Walletwise", "spend tracking for college students", "Fintech", "Bengaluru", "Seed", 85, "r-proj-1-a", "You already built this for 1,200 students."],
  ["tipjar", "Jahnavi", "Krishnan", "Engineering Manager", "Tipjar", "tips and payouts for gig workers", "Fintech", "Pune", "Seed", 80, "r-proj-1-b", "Fast payouts on a Node.js backend."],
  ["ruprail", "Kunal", "Mehra", "Head of Engineering", "Ruprail", "payouts for freelancers abroad", "Fintech", "Bengaluru", "Series A", 79, "r-skills", "TypeScript and PostgreSQL on money flows."],
  ["duesday", "Anjali", "Nambiar", "Founding Engineer", "Duesday", "rent reminders and UPI collection", "Proptech", "Pune", "Seed", 81, "r-proj-1-a", "Reminders plus UPI, two things you have shipped."],
  ["ledgerpine", "Pranav", "Hegde", "Engineering Manager", "Ledgerpine", "bookkeeping for small shops", "Fintech", "Bengaluru", "Seed", 78, "r-proj-2-a", "You turn till data into decisions."],
  ["coinbloom", "Sanya", "Kohli", "Engineering Lead", "Coinbloom", "micro-savings for students", "Fintech", "Pune", "Seed", 82, "r-proj-1-a", "Students and money. You have the users to prove it."],
];

const HIRING_FOR: Record<string, string> = {
  CTO: "Software engineering intern",
  Founder: "Product engineering intern",
  "Payments Lead": "Payments engineering intern",
};

function toPerson(group: ExtraPerson["group"]) {
  return ([id, first, last, title, company, hook, sector, city, stageLabel, fit, lineId, why, firstDay, opened]: Row): ExtraPerson => ({
    id: `x-${id}`,
    first,
    last,
    title,
    company,
    hook,
    sector,
    city,
    stageLabel,
    fit,
    why,
    evidence: [lineId],
    group,
    firstDay,
    pageOpenedDay: opened,
    hiringFor: HIRING_FOR[title] ?? "Software engineering intern",
  });
}

/** 32 fictional people: 10 contacted, 12 pending (the "12 drafts"), 10 held for F6. All jan27. */
export const EXTRA_PEOPLE: ExtraPerson[] = [
  ...CONTACTED.map(toPerson("contacted")),
  ...PENDING.map(toPerson("pending")),
  ...HELD.map(toPerson("held")),
];
