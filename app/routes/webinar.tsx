import { useState } from "react";
import { Header, Footer } from "~/components";
import { checkEmail } from "~/lib/email-validate";

export function meta() {
  return [
    { title: "Register for the Webinar | Studojo" },
    { name: "description", content: "Register for the Studojo webinar. Reserve your spot in a minute." },
  ];
}

const LIFE_STAGES = [
  "Just exploring options",
  "Actively job hunting",
  "Have an offer / placed",
  "Switching fields",
  "Planning higher studies",
  "Working professional",
];

const REFERRAL_SOURCES = [
  "Instagram",
  "LinkedIn",
  "WhatsApp",
  "Friend or classmate",
  "College or professor",
  "Email from Studojo",
  "Google search",
  "Other",
];

const YEARS_OF_STUDY = [
  "1st year",
  "2nd year",
  "3rd year",
  "4th year",
  "5th year",
  "Final year",
  "Graduated",
];

const GRAD_YEARS = (() => {
  const now = new Date().getFullYear();
  const out: string[] = [];
  for (let y = now - 2; y <= now + 6; y++) out.push(String(y));
  return out;
})();

const INPUT =
  "w-full bg-white border-2 border-neutral-900 rounded-2xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-400 font-['Satoshi']";
const LABEL = "block text-sm font-semibold text-neutral-900 mb-2 font-['Satoshi']";

interface FormState {
  fullName: string;
  whatsapp: string;
  email: string;
  college: string;
  course: string;
  specialisation: string;
  yearOfStudy: string;
  graduationYear: string;
  lifeStage: string;
  referralSource: string;
}

const EMPTY: FormState = {
  fullName: "",
  whatsapp: "",
  email: "",
  college: "",
  course: "",
  specialisation: "",
  yearOfStudy: "",
  graduationYear: "",
  lifeStage: "",
  referralSource: "",
};

export default function Webinar() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A corrected email we can offer when the entered one looks like a typo.
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEmailSuggestion(null);

    if (!form.fullName.trim() || !form.whatsapp.trim() || !form.email.trim() ||
        !form.college.trim() || !form.course.trim() || !form.yearOfStudy ||
        !form.lifeStage) {
      setError("Please fill in all required fields (marked with *).");
      return;
    }

    // Catch typo'd domains (gmail.cok, gnail.com, ...) before we register them.
    const emailCheck = checkEmail(form.email);
    if (!emailCheck.ok) {
      setError(emailCheck.error ?? "Please enter a valid email address.");
      setEmailSuggestion(emailCheck.suggestion ?? null);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/webinar-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setEmailSuggestion(data.suggestion ?? null);
        setSubmitting(false);
        return;
      }
      setAlreadyRegistered(Boolean(data.alreadyRegistered));
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] font-['Satoshi']">
            FREE WEBINAR
          </span>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold text-neutral-900 font-['Clash_Display']">
            Reserve your spot
          </h1>
          <p className="mt-2 text-neutral-600 font-['Satoshi']">
            Fill this in and we will send you the joining details. Takes under a minute.
          </p>
        </div>

        {done ? (
          <div className="bg-white border-2 border-neutral-900 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] p-10 text-center">
            <div className="text-4xl mb-3">{alreadyRegistered ? "✅" : "🎉"}</div>
            <h2 className="text-2xl font-bold text-neutral-900 font-['Clash_Display']">
              {alreadyRegistered ? "You are already registered!" : "You are registered!"}
            </h2>
            <p className="mt-2 text-neutral-600 font-['Satoshi']">
              {alreadyRegistered
                ? "This email is already on the list, so you are all set. Check your inbox for the joining link closer to the date."
                : "See you at the webinar. Check your email for the joining link closer to the date."}
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="bg-white border-2 border-neutral-900 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] p-6 md:p-10"
          >
            {/* Personal details */}
            <h2 className="text-lg font-bold text-violet-700 uppercase tracking-wide font-['Clash_Display'] mb-5">
              Personal details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={LABEL}>Full name <span className="text-red-500">*</span></label>
                <input className={INPUT} placeholder="Your full name" value={form.fullName} onChange={set("fullName")} />
              </div>
              <div>
                <label className={LABEL}>WhatsApp number <span className="text-red-500">*</span></label>
                <input className={INPUT} placeholder="+91 00000 00000" value={form.whatsapp} onChange={set("whatsapp")} />
              </div>
              <div className="md:col-span-2">
                <label className={LABEL}>Email address <span className="text-red-500">*</span></label>
                <input className={INPUT} type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} />
              </div>
            </div>

            {/* Academic background */}
            <h2 className="mt-10 text-lg font-bold text-violet-700 uppercase tracking-wide font-['Clash_Display'] mb-5">
              Academic background
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={LABEL}>College / University name <span className="text-red-500">*</span></label>
                <input className={INPUT} placeholder="e.g. Christ University, Bangalore" value={form.college} onChange={set("college")} />
              </div>
              <div>
                <label className={LABEL}>Course / Degree <span className="text-red-500">*</span></label>
                <input className={INPUT} placeholder="e.g. BBA, B.Tech, MBA" value={form.course} onChange={set("course")} />
              </div>
              <div>
                <label className={LABEL}>Specialisation / Branch</label>
                <input className={INPUT} placeholder="e.g. Finance, CS, Marketing" value={form.specialisation} onChange={set("specialisation")} />
              </div>
              <div>
                <label className={LABEL}>Year of study <span className="text-red-500">*</span></label>
                <select className={INPUT} value={form.yearOfStudy} onChange={set("yearOfStudy")}>
                  <option value="">Select year</option>
                  {YEARS_OF_STUDY.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Expected graduation year</label>
                <select className={INPUT} value={form.graduationYear} onChange={set("graduationYear")}>
                  <option value="">Select year</option>
                  {GRAD_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* About you */}
            <h2 className="mt-10 text-lg font-bold text-violet-700 uppercase tracking-wide font-['Clash_Display'] mb-5">
              About you
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={LABEL}>What stage are you in your life? <span className="text-red-500">*</span></label>
                <select className={INPUT} value={form.lifeStage} onChange={set("lifeStage")}>
                  <option value="">Select your stage</option>
                  {LIFE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>How did you hear about the webinar? <span className="normal-case text-neutral-400 text-xs font-['Satoshi']">(optional)</span></label>
                <select className={INPUT} value={form.referralSource} onChange={set("referralSource")}>
                  <option value="">Prefer not to say</option>
                  {REFERRAL_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div className="mt-6">
                <p className="text-sm text-red-600 font-semibold font-['Satoshi']">{error}</p>
                {emailSuggestion && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, email: emailSuggestion }));
                      setError(null);
                      setEmailSuggestion(null);
                    }}
                    className="mt-2 text-sm font-bold text-violet-700 underline underline-offset-2 font-['Satoshi']"
                  >
                    Use {emailSuggestion} instead
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 w-full bg-violet-500 text-white text-lg font-bold py-4 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-60 disabled:cursor-not-allowed font-['Clash_Display']"
            >
              {submitting ? "Registering..." : "Register for the webinar"}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
