import { useState, useRef } from "react";
import { Header, Footer } from "~/components";
import { checkEmail } from "~/lib/email-validate";
import { WEBINAR } from "~/lib/webinar-event";
import {
  WEBINAR_PRICE_PAISE,
  WEBINAR_PRICE_WITH_REF_PAISE,
  WEBINAR_REF_DISCOUNT_PERCENT,
  formatPaise,
} from "~/lib/webinar-pricing";
import { loadRazorpayScript } from "~/lib/payments";

export function meta() {
  return [
    { title: `${WEBINAR.title} | Studojo Webinar` },
    { name: "description", content: WEBINAR.description },
    // Share previews. This link gets pasted into WhatsApp groups far more than
    // it gets typed, so the card is the first thing most people see of it.
    { property: "og:title", content: WEBINAR.title },
    { property: "og:description", content: WEBINAR.description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: WEBINAR.title },
    { name: "twitter:description", content: WEBINAR.description },
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
  "Campus ambassador",
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
  refCode: string;
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
  refCode: "",
};

/** What the server said about the referral code currently typed in. */
interface RefState {
  checking: boolean;
  valid: boolean | null;
  ambassadorFirstName?: string;
  ambassadorCollege?: string;
  message?: string;
}

export default function Webinar() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A corrected email we can offer when the entered one looks like a typo.
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [ref, setRef] = useState<RefState>({ checking: false, valid: null });
  // Debounce handle for the referral-code check, so typing a code does not fire
  // a request per keystroke.
  const refTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const price = ref.valid ? WEBINAR_PRICE_WITH_REF_PAISE : WEBINAR_PRICE_PAISE;

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  /** Check a referral code shortly after typing stops. */
  function onRefCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toUpperCase();
    setForm((f) => ({ ...f, refCode: value }));
    if (refTimer.current) clearTimeout(refTimer.current);

    if (!value.trim()) {
      setRef({ checking: false, valid: null });
      return;
    }
    setRef((r) => ({ ...r, checking: true }));
    refTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/webinar-ref-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refCode: value }),
        });
        const data = await res.json().catch(() => ({}));
        setRef({
          checking: false,
          valid: Boolean(data.valid),
          ambassadorFirstName: data.ambassadorFirstName,
          ambassadorCollege: data.ambassadorCollege,
          message: data.message,
        });
      } catch {
        // A failed check must not block registration: leave it unresolved and
        // let the server decide for real at submit time.
        setRef({ checking: false, valid: null });
      }
    }, 450);
  }

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
      // Load the checkout script alongside creating the order, so the modal
      // opens the moment the order is ready instead of after a second fetch.
      const scriptReady = loadRazorpayScript();

      const res = await fetch("/api/webinar-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setEmailSuggestion(data.suggestion ?? null);
        if (data.invalidRefCode) {
          setRef({ checking: false, valid: false, message: "We don't recognise that code." });
        }
        setSubmitting(false);
        return;
      }

      // Already registered and paid for this webinar — nothing to charge.
      if (data.alreadyPaid) {
        setAlreadyPaid(true);
        setDone(true);
        return;
      }

      await scriptReady;
      openCheckout(data);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  /** Open Razorpay's modal and confirm the payment when it succeeds. */
  function openCheckout(order: {
    orderId: string;
    amountPaise: number;
    keyId: string;
    prefill?: { name?: string; email?: string; contact?: string };
  }) {
    const Razorpay = (window as any).Razorpay;
    if (!Razorpay) {
      setError("Could not open the payment window. Please refresh and try again.");
      setSubmitting(false);
      return;
    }

    const rzp = new Razorpay({
      key: order.keyId,
      amount: order.amountPaise,
      currency: "INR",
      name: "Studojo",
      description: WEBINAR.title,
      order_id: order.orderId,
      prefill: order.prefill ?? {},
      theme: { color: "#8B5CF6" },
      handler: async (response: any) => {
        try {
          await fetch("/api/webinar-confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
        } catch {
          // The webhook is the authority and will fulfil this regardless, so a
          // failed confirmation call must not tell someone who paid that they
          // did not. Show the success screen either way.
        }
        setDone(true);
      },
      modal: {
        ondismiss: () => {
          // They closed the window without paying. The registration row is
          // saved, so re-submitting the form picks up where they left off.
          setSubmitting(false);
          setError(
            "Payment was not completed, so your seat is not booked yet. Submit again to retry — your details are still filled in."
          );
        },
      },
    });

    rzp.on("payment.failed", (response: any) => {
      setSubmitting(false);
      setError(
        response?.error?.description ||
          "The payment failed. No money was taken — please try again."
      );
    });

    rzp.open();
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] font-['Satoshi']">
            LIVE WEBINAR · {WEBINAR.dateLabel.toUpperCase()}
          </span>
          <h1 className="mt-4 text-3xl md:text-5xl font-bold text-neutral-900 font-['Clash_Display'] leading-tight">
            {WEBINAR.title}
          </h1>
          <p className="mt-3 text-lg font-semibold text-neutral-800 font-['Satoshi']">
            {WEBINAR.subtitle}
          </p>
          <p className="mt-3 text-neutral-600 font-['Satoshi'] max-w-xl mx-auto">
            {WEBINAR.description}
          </p>

          {/* When and how much — the two things people scan for before reading. */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] text-sm font-bold text-neutral-900 font-['Satoshi']">
              {WEBINAR.dateLabel}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] text-sm font-bold text-neutral-900 font-['Satoshi']">
              {WEBINAR.timeLabel}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] text-sm font-bold text-neutral-900 font-['Satoshi']">
              {WEBINAR_REF_DISCOUNT_PERCENT}% off with a campus ambassador code
            </span>
          </div>
        </div>

        {done ? (
          <div className="bg-white border-2 border-neutral-900 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] p-10 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 font-['Clash_Display']">
              {alreadyPaid ? "You already have a seat!" : "Your seat is booked!"}
            </h2>
            <p className="mt-2 text-neutral-600 font-['Satoshi']">
              {alreadyPaid
                ? "This email already has a paid seat for this webinar, so you are all set. Check your inbox for the joining link closer to the date."
                : `See you on ${WEBINAR.dateLabel} at ${WEBINAR.timeLabel}. A confirmation is on its way to your inbox, and we will send the joining link closer to the date.`}
            </p>
            <p className="mt-4 text-sm text-neutral-500 font-['Satoshi']">
              Add the date to your calendar so it does not slip past you.
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

            {/* Campus ambassador code */}
            <h2 className="mt-10 text-lg font-bold text-violet-700 uppercase tracking-wide font-['Clash_Display'] mb-5">
              Campus ambassador code
            </h2>
            <div>
              <label className={LABEL}>
                Have a code?{" "}
                <span className="normal-case text-neutral-400 text-xs font-['Satoshi']">
                  (optional — saves you {WEBINAR_REF_DISCOUNT_PERCENT}%)
                </span>
              </label>
              <input
                className={INPUT}
                placeholder="e.g. PRIYA42"
                value={form.refCode}
                onChange={onRefCodeChange}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
              {ref.checking && (
                <p className="mt-2 text-sm text-neutral-500 font-['Satoshi']">Checking code…</p>
              )}
              {!ref.checking && ref.valid === true && (
                <p className="mt-2 text-sm font-semibold text-green-700 font-['Satoshi']">
                  Code applied{ref.ambassadorFirstName ? ` — ${ref.ambassadorFirstName}` : ""}
                  {ref.ambassadorCollege ? ` from ${ref.ambassadorCollege}` : ""} sent you.
                  You save {WEBINAR_REF_DISCOUNT_PERCENT}%, paying {formatPaise(WEBINAR_PRICE_WITH_REF_PAISE)} instead of {formatPaise(WEBINAR_PRICE_PAISE)}.
                </p>
              )}
              {!ref.checking && ref.valid === false && (
                <p className="mt-2 text-sm font-semibold text-amber-700 font-['Satoshi']">
                  We don't recognise that code. Check the spelling, or clear the field to
                  continue at {formatPaise(WEBINAR_PRICE_PAISE)}.
                </p>
              )}
            </div>

            {/* What they are about to pay */}
            <div className="mt-8 flex items-center justify-between rounded-2xl border-2 border-neutral-900 bg-violet-50 px-5 py-4">
              <span className="text-sm font-semibold text-neutral-700 font-['Satoshi']">
                Your ticket
              </span>
              <span className="text-2xl font-bold text-neutral-900 font-['Clash_Display']">
                {ref.valid && (
                  <span className="mr-2 text-base font-semibold text-neutral-400 line-through">
                    {formatPaise(WEBINAR_PRICE_PAISE)}
                  </span>
                )}
                {formatPaise(price)}
              </span>
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
              {submitting ? "Opening payment…" : `Book my seat · ${formatPaise(price)}`}
            </button>
            <p className="mt-3 text-center text-xs text-neutral-500 font-['Satoshi']">
              Secure payment via Razorpay. Your seat is confirmed once payment goes through.
            </p>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
