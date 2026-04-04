/**
 * /lab/email — hidden test page for the email composer
 * No auth required. Not linked from anywhere on the site.
 */
import { useState, useEffect } from "react";
import { EmailComposer, type StyleProfile } from "~/components/outreach/EmailComposer";
import type { EmailTemplate } from "~/lib/outreach/types";

const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 1,
    name: "Value Prop",
    subject: "Quick intro — {title} role at {company}",
    body: `Hi {name},

I came across {company} and was genuinely impressed by what you're building.

I'm a [Your Role] with [X years] of experience in [Key Area]. I've [specific achievement].

Would you be open to a quick 15-minute chat this week?

Best,
[Your Name]`,
  },
  {
    id: 2,
    name: "Direct Ask",
    subject: "Internship enquiry — {company}",
    body: `Hi {name},

I'm actively looking for a {title} role and {company} stood out to me immediately.

My background: [2-3 sentence summary of your key experience and skills].

I'm available [timeframe] — would a quick call work?

[Your Name]`,
  },
  {
    id: 3,
    name: "Warm Intro",
    subject: "Loved your work on [specific thing]",
    body: `Hi {name},

[Specific thing you noticed about their work at {company}] — genuinely impressive.

I'm a [Your Role] with a background in [Key Area] and I've been keen to connect with teams working on this kind of problem.

Open to a quick intro call?

[Your Name]`,
  },
  {
    id: 4,
    name: "Short & Punchy",
    subject: "{title} — keen to connect",
    body: `Hi {name},

{company} is at the top of my list right now.

I bring [specific skill or experience]. Most recently, [one-line achievement with a number].

10 minutes if you're open?

[Your Name]`,
  },
];

const PROFILE_STORAGE_KEY = "studojo_email_style_profile";

export default function EmailLabPage() {
  const [savedProfile, setSavedProfile] = useState<StyleProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load saved profile from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) setSavedProfile(JSON.parse(raw));
    } catch {
      // ignore
    }
    setProfileLoaded(true);
  }, []);

  const handleSaveProfile = (profile: StyleProfile) => {
    setSavedProfile(profile);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  };

  const handleContinue = (subject: string, body: string, templateId: number | null) => {
    // In the live app this navigates to setup — here just show the output
    alert(`✓ Email ready!\n\nSubject: ${subject}\n\n${body}`);
  };

  if (!profileLoaded) return null;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-studojo-ink/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-clash text-sm font-bold text-studojo-ink">Email Composer</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-satoshi bg-amber-100 text-amber-700 border border-amber-200">
            STAGING TEST
          </span>
        </div>
        {savedProfile && (
          <button
            onClick={() => {
              localStorage.removeItem(PROFILE_STORAGE_KEY);
              setSavedProfile(null);
              window.location.reload();
            }}
            className="text-[11px] text-studojo-muted font-satoshi hover:text-studojo-ink transition-colors"
          >
            Reset style profile
          </button>
        )}
      </div>

      <EmailComposer
        templates={MOCK_TEMPLATES}
        initialTemplate={null}
        savedProfile={savedProfile}
        onTemplateChange={() => {}}
        onContinue={handleContinue}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
