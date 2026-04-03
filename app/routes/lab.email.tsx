/**
 * /lab/email — hidden staging-only test page for the email composer
 * No auth, no nav links, mock templates. Do not link from anywhere.
 */
import { EmailComposer } from "~/components/outreach/EmailComposer";
import type { EmailTemplate } from "~/lib/outreach/types";

const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 1,
    name: "Value Prop",
    subject: "Quick intro — {title} role at {company}",
    body: `Hi {name},

I came across {company} and was genuinely impressed by what you're building.

I'm a [Your Role] with [X years] of experience in [Key Area]. I've [specific achievement relevant to their space].

I'd love to explore if there's a fit — would you be open to a quick 15-minute chat this week?

Best,
[Your Name]`,
  },
  {
    id: 2,
    name: "Direct Ask",
    subject: "Internship enquiry — {company}",
    body: `Hi {name},

I'm reaching out because I'm actively looking for a {title} internship and {company} stood out to me.

My background: [2-3 sentence summary of your experience and key skill].

I'm available [timeframe] and would love to learn more about any openings on your team.

Would a quick call work?

[Your Name]`,
  },
  {
    id: 3,
    name: "Referral Style",
    subject: "Loved your recent [post/product/launch] — {company}",
    body: `Hi {name},

I [read your post about X / saw {company}'s recent launch / came across your work on Y] — really resonated with me.

I'm a [Your Role] with a background in [Key Area] and I've been following {company} for a while. I'd love to contribute to what you're building.

Open to a quick intro call?

[Your Name]`,
  },
  {
    id: 4,
    name: "Warm & Concise",
    subject: "{title} — keen to connect",
    body: `Hi {name},

Short note — I'm looking for a {title} role and {company} is at the top of my list.

I bring [specific skill or experience]. Most recently, [one-line achievement].

Would love 10 minutes if you're open to it.

[Your Name]`,
  },
];

const MOCK_CONTEXT = `Name: Alex Johnson
Target roles: Marketing Intern, Growth Marketing, Brand Strategy
Target industries: Tech startups, SaaS, Consumer apps
Key skills: Content strategy, SEO, social media, data analysis, copywriting
Summary: Final-year business student with 2 internships in digital marketing. Built a newsletter to 3,000 subscribers.`;

export default function EmailLabPage() {
  const handleContinue = (subject: string, body: string, templateId: number | null) => {
    alert(`Subject: ${subject}\n\nBody:\n${body}`);
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Minimal header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-studojo-ink/10 flex-shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <span className="font-clash text-sm font-bold text-studojo-ink">Email Composer</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-satoshi bg-amber-100 text-amber-700 border border-amber-200">
            TEST
          </span>
        </div>
        <p className="text-[11px] text-studojo-muted font-satoshi">
          Pick a template · drag blocks · refine with AI
        </p>
      </div>

      <EmailComposer
        templates={MOCK_TEMPLATES}
        initialTemplate={MOCK_TEMPLATES[0]}
        candidateContext={MOCK_CONTEXT}
        onTemplateChange={() => {}}
        onContinue={handleContinue}
      />
    </div>
  );
}
