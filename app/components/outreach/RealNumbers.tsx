// Outcome figures shown on the outreach landing, pricing and discovery pages.
//
// Every number here must be measurable in the production database. They
// replaced a "Wall of Love" of invented testimonials that were labelled "Real
// messages from students" (audit HP-N04 / OP-N02, 29 Sep 2026). Do not add
// quotes, names, placement counts or brand outcomes unless they are real and
// the student has given written permission to publish them.
//
// Source queries (prod, 29 Sep 2026):
//   students     count(*) from "user"                                 -> 8,531
//   matched      distinct users with at least one lead               -> 4,266
//   emailsSent   emails_sent with status sent or replied              -> 28,169
//   weekOne      users whose first send is 7+ days old and who got any
//                reply within 7 days: 29 of 73                       -> 4 in 10
export const REAL_NUMBERS = {
  asOf: "September 2026",
  students: "8,500+",
  matched: "4,000+",
  emailsSent: "28,000+",
  weekOne: "4 in 10",
} as const;

export const WEEK_ONE_LINE = `About ${REAL_NUMBERS.weekOne} students hear back in their first week.`;

const ITEMS = [
  { value: REAL_NUMBERS.students, label: "students signed up" },
  { value: REAL_NUMBERS.matched, label: "matched with hiring managers" },
  { value: REAL_NUMBERS.emailsSent, label: "personal emails sent from students' own Gmail" },
  { value: REAL_NUMBERS.weekOne, label: "students hear back in their first week" },
];

export function RealNumbers({ title = "What happens when students use it" }: { title?: string }) {
  return (
    <div>
      <h2 className="font-clash text-2xl md:text-3xl font-bold text-center text-studojo-ink mb-6">{title}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {ITEMS.map((it) => (
          <div key={it.label} className="rounded-2xl border-2 border-studojo-ink bg-white p-4 text-center">
            <p className="font-clash text-2xl font-bold text-studojo-ink md:text-3xl">{it.value}</p>
            <p className="mt-1 font-satoshi text-sm text-studojo-muted">{it.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center font-satoshi text-xs text-studojo-muted">
        From Studojo's own records, {REAL_NUMBERS.asOf}. Replies are not guaranteed.
      </p>
    </div>
  );
}
