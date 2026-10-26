import { useEffect, useRef, useState } from "react";
import { Header, Footer } from "~/components";
import { checkEmail } from "~/lib/email-validate";
import { revealResult } from "~/lib/reveal-result";
import {
  CAN_COMMIT,
  CROSSED_1K,
  FIELDS,
  FOLLOWERS,
  LAST_POSTED,
  LIMITS,
  LOOKING_FOR,
  POST_FREQUENCY,
  REFERRAL_SOURCES,
  STEPS,
  STORY_PROMPTS,
  STUDOJO_OK,
  TONES,
  TOPICS,
  YEARS_OF_STUDY,
  stepOf,
  validateUgcApplication,
  type UgcField,
} from "~/lib/ugc-application";

// The Creator Program (LinkedIn UGC) application, shared on LinkedIn.
// Served at /creators and at /ugc (same module, canonical tag on /creators).

const CANONICAL = "https://studojo.com/creators";
const SHARE_IMAGE = "https://studojo.com/og-creators.png";

export function meta() {
  return [
    { title: "Studojo Creator Program | Grow on LinkedIn" },
    {
      name: "description",
      content:
        "Turn your internships, projects and setbacks into LinkedIn posts that get you noticed. Apply to the Studojo Creator Program in about 5 minutes.",
    },
    { property: "og:title", content: "Grow on LinkedIn with the Studojo Creator Program" },
    {
      property: "og:description",
      content: "Your stories, turned into 3 LinkedIn posts a week, plus a profile makeover. Apply in about 5 minutes.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: CANONICAL },
    { property: "og:image", content: SHARE_IMAGE },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: SHARE_IMAGE },
    { tagName: "link", rel: "canonical", href: CANONICAL },
  ];
}

const GRAD_YEARS = (() => {
  const now = new Date().getFullYear();
  const out: string[] = [];
  for (let y = now - 2; y <= now + 6; y++) out.push(String(y));
  return out;
})();

interface FormState {
  fullName: string;
  email: string;
  whatsapp: string;
  college: string;
  course: string;
  yearOfStudy: string;
  graduationYear: string;
  city: string;
  linkedinUrl: string;
  followers: string;
  postFrequency: string;
  lastPosted: string;
  bestPostUrl: string;
  crossed1k: string;
  field: string;
  targetRoles: string;
  dreamCompanies: string;
  lookingFor: string;
  topics: string[];
  avoidTopics: string;
  storyWork: string;
  storySetback: string;
  storyLesson: string;
  tone: string;
  canCommit: string;
  studojoOk: string;
  whyJoin: string;
  referralSource: string;
  referredBy: string;
  consent: boolean;
}

const EMPTY: FormState = {
  fullName: "",
  email: "",
  whatsapp: "",
  college: "",
  course: "",
  yearOfStudy: "",
  graduationYear: "",
  city: "",
  linkedinUrl: "",
  followers: "",
  postFrequency: "",
  lastPosted: "",
  bestPostUrl: "",
  crossed1k: "",
  field: "",
  targetRoles: "",
  dreamCompanies: "",
  lookingFor: "",
  topics: [],
  avoidTopics: "",
  storyWork: "",
  storySetback: "",
  storyLesson: "",
  tone: "",
  canCommit: "",
  studojoOk: "",
  whyJoin: "",
  referralSource: "",
  referredBy: "",
  consent: false,
};

// Answers are kept on the device while someone fills the form, so a closed tab
// or a LinkedIn in-app browser reload does not throw five minutes away.
const DRAFT_KEY = "studojo.creators.draft.v1";

function loadDraft(): { form: FormState; step: number } | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || !saved.form) return null;
    const form = { ...EMPTY };
    for (const k of Object.keys(EMPTY) as (keyof FormState)[]) {
      const v = saved.form[k];
      if (k === "topics") form.topics = Array.isArray(v) ? v.map(String) : [];
      else if (k === "consent") form.consent = v === true;
      else if (typeof v === "string") (form as unknown as Record<string, unknown>)[k] = v;
    }
    const step = Number.isInteger(saved.step) ? Math.min(Math.max(saved.step, 0), STEPS.length - 1) : 0;
    const touched = Object.keys(EMPTY).some((k) => {
      const v = form[k as keyof FormState];
      return Array.isArray(v) ? v.length > 0 : Boolean(v);
    });
    return touched ? { form, step } : null;
  } catch {
    return null;
  }
}

function saveDraft(form: FormState, step: number) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step }));
  } catch {
    // Private mode or blocked storage: the form still works, it just won't remember.
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clear.
  }
}

/** The element to focus when an answer needs attention. */
function focusField(field: UgcField) {
  const id = field === "stories" ? "ugc-storyWork" : `ugc-${field}`;
  const el = document.getElementById(id) ?? document.getElementById(`${id}-0`);
  if (!el) return;
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  el.focus({ preventScroll: true });
}

const INPUT =
  "w-full min-h-12 bg-white border-2 border-neutral-900 rounded-2xl px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-400 aria-[invalid=true]:border-red-500 font-satoshi";
const LABEL = "block text-base font-semibold text-neutral-900 mb-1 font-satoshi";
const HINT = "text-sm text-neutral-500 mb-2 font-satoshi";
const OPTIONAL = <span className="font-normal text-neutral-400"> (optional)</span>;
const REQUIRED = <span className="text-red-500" aria-hidden="true"> *</span>;

const PERKS = [
  {
    icon: "✍️",
    title: "Posts written with you, every week",
    body: "Each week you get 3 ready-to-post drafts built from your own experiences: 2 about your journey and 1 about how you use Studojo. Change anything you like before you post.",
  },
  {
    icon: "🪪",
    title: "A LinkedIn profile makeover",
    body: "We review your headline, About section and experience, and rewrite them for the roles you want next.",
  },
  {
    icon: "📬",
    title: "Free Studojo outreach access",
    body: "Use Studojo's outreach tool to reach hiring managers directly, free while you're in the program.",
  },
  {
    icon: "🎓",
    title: "A certificate for showing up",
    body: "Post consistently for 4 weeks and you get a Studojo Creator Program certificate.",
  },
];

const HOW = [
  { title: "Apply", body: "Tell us about you, your LinkedIn and one or two of your stories. About 5 minutes." },
  { title: "Hear from us", body: "We read every application. If you're selected, we message you on WhatsApp." },
  { title: "Get your posts", body: "Every week, 3 drafts written from your stories, ready to copy." },
  { title: "Post and grow", body: "Post them, share the links with us, and see what's working for you." },
];

const FOR_YOU = [
  "You're in college or graduated recently",
  "You can post 3 times a week for at least 4 weeks",
  "You're happy for 1 in 3 posts to be about how you use Studojo",
  "You have stories: internships, projects, setbacks, lessons",
];

const FAQ = [
  {
    q: "Do I need a lot of followers?",
    a: "No. Real stories and posting consistently matter more to us than follower count. Tell us where you're starting from, small numbers are completely fine.",
  },
  {
    q: "Who writes the posts?",
    a: "We write the drafts from the stories you share with us. You read them, change anything you want, and post them from your own account. Nothing goes out without you.",
  },
  {
    q: "What does a Studojo post look like?",
    a: "It's about your real experience using Studojo, for example reaching a hiring manager directly instead of applying on a portal. We never ask you to say anything that isn't true.",
  },
  {
    q: "How much time does it take?",
    a: "A few minutes per post: read the draft, tweak it if you like, post it, and paste the link back to us.",
  },
  {
    q: "What happens to my answers?",
    a: "We use them only to select creators and to write your posts. You can read more in our Privacy Policy.",
  },
];

export default function Creators() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<UgcField, string>>>({});
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [trap, setTrap] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [copied, setCopied] = useState(false);
  const loaded = useRef(false);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<UgcField | null>(null);

  // Bring back a half-finished application (client only, after hydration).
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setForm(draft.form);
      setStep(draft.step);
      setRestored(true);
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current || done) return;
    const t = window.setTimeout(() => saveDraft(form, step), 300);
    return () => window.clearTimeout(t);
  }, [form, step, done]);

  // After a step change, focus the field that needs attention, or the step title.
  useEffect(() => {
    if (pendingFocus.current) {
      focusField(pendingFocus.current);
      pendingFocus.current = null;
    }
  }, [step, errors]);

  useEffect(() => {
    if (done) revealResult(resultRef.current);
  }, [done]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key as UgcField] && !(key.startsWith("story") && e.stories)) return e;
      const next = { ...e };
      delete next[key as UgcField];
      if (key.startsWith("story")) delete next.stories;
      return next;
    });
    if (key === "email") setEmailSuggestion(null);
    setFormError(null);
  }

  function toggleTopic(topic: string) {
    const has = form.topics.includes(topic);
    if (!has && form.topics.length >= LIMITS.topicsMax) return;
    update("topics", has ? form.topics.filter((t) => t !== topic) : [...form.topics, topic]);
  }

  /** The first answer that needs attention on this step or an earlier one. */
  function firstProblem(upTo: number) {
    let suggestion: string | null = null;
    const result = validateUgcApplication(form as unknown as Record<string, unknown>, (email) => {
      const c = checkEmail(email);
      if (c.ok) return null;
      suggestion = c.suggestion ?? null;
      return c.error ?? "Please enter a valid email address.";
    });
    if (result.ok || stepOf(result.field) > upTo) return null;
    return { field: result.field, error: result.error, suggestion };
  }

  function showProblem(p: { field: UgcField; error: string; suggestion: string | null }) {
    setErrors({ [p.field]: p.error } as Partial<Record<UgcField, string>>);
    setEmailSuggestion(p.field === "email" ? p.suggestion : null);
    pendingFocus.current = p.field;
    const s = stepOf(p.field);
    if (s !== step) setStep(s);
  }

  function goTo(s: number) {
    setErrors({});
    setFormError(null);
    setStep(s);
    window.requestAnimationFrame(() => {
      stepHeadingRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      stepHeadingRef.current?.focus({ preventScroll: true });
    });
  }

  function next() {
    const p = firstProblem(step);
    if (p) return showProblem(p);
    goTo(step + 1);
  }

  function startOver() {
    clearDraft();
    setForm(EMPTY);
    setRestored(false);
    goTo(0);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (step < STEPS.length - 1) return next();
    const p = firstProblem(STEPS.length - 1);
    if (p) return showProblem(p);

    setSubmitting(true);
    setFormError(null);
    try {
      const qs = new URLSearchParams(window.location.search);
      const res = await fetch("/api/ugc-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sj_trap: trap,
          sourcePath: window.location.pathname,
          utmSource: qs.get("utm_source") || "",
          utmMedium: qs.get("utm_medium") || "",
          utmCampaign: qs.get("utm_campaign") || "",
          referrer: document.referrer || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data.field) showProblem({ field: data.field, error: data.error, suggestion: data.suggestion ?? null });
        else setFormError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      clearDraft();
      setAlreadyApplied(Boolean(data.alreadyApplied));
      setDone(true);
    } catch {
      setFormError("We couldn't reach Studojo. Check your connection and try again. Your answers are saved on this device.");
      setSubmitting(false);
    }
  }

  const shareUrl = "https://studojo.com/creators?utm_source=linkedin&utm_medium=share&utm_campaign=creator_program";
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const t = document.createElement("textarea");
      t.value = shareUrl;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  const err = (f: UgcField) => errors[f];
  const a11y = (f: UgcField) => ({
    id: `ugc-${f}`,
    "aria-invalid": err(f) ? true : undefined,
    "aria-describedby": err(f) ? `ugc-${f}-error` : undefined,
  });
  const errorText = (f: UgcField) =>
    err(f) ? (
      <p id={`ugc-${f}-error`} role="alert" className="mt-2 text-sm font-semibold text-red-600 font-satoshi">
        {err(f)}
      </p>
    ) : null;

  // Plain render helpers, not components: a component defined inside render is
  // a new type every render, so React would remount it and drop keyboard focus.
  /** A row of answer pills backed by real radio buttons. */
  const choices = ({
    f,
    options,
    legend,
    hint,
    required,
  }: {
    f: keyof FormState & UgcField;
    options: readonly string[];
    legend: string;
    hint?: string;
    required?: boolean;
  }) => (
    <fieldset aria-describedby={err(f) ? `ugc-${f}-error` : undefined}>
      <legend className={LABEL}>
        {legend}
        {required ? REQUIRED : OPTIONAL}
      </legend>
      {hint && <p className={HINT}>{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => (
          <label key={o} className="cursor-pointer">
            <input
              type="radio"
              id={`ugc-${f}-${i}`}
              name={f}
              value={o}
              checked={form[f] === o}
              onChange={() => update(f, o as FormState[typeof f])}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-11 select-none items-center rounded-full border-2 border-neutral-900 bg-white px-4 py-2 text-base font-medium text-neutral-900 transition-colors hover:bg-violet-50 peer-checked:bg-violet-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 font-satoshi">
              {o}
            </span>
          </label>
        ))}
      </div>
      {errorText(f)}
    </fieldset>
  );

  const firstName = form.fullName.trim().split(/\s+/)[0] || "";
  const storyCount = STORY_PROMPTS.filter((p) => form[p.key].trim()).length;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Header />

      {/* Hero */}
      <section className="border-b-2 border-neutral-900 bg-studojo-purple-bg">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.15fr_1fr] md:px-8 md:py-16">
          <div>
            <span className="inline-block rounded-full border-2 border-neutral-900 bg-white px-3 py-1 text-xs font-bold tracking-wide text-violet-700 shadow-brutal font-satoshi">
              STUDOJO CREATOR PROGRAM
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] text-neutral-900 md:text-5xl font-clash">
              Turn your story into LinkedIn posts that get you noticed
            </h1>
            <p className="mt-5 max-w-xl text-lg text-neutral-700 font-satoshi">
              Your internships, projects and even your rejections are exactly what recruiters want to read. Tell us your
              stories, we turn them into 3 posts a week with you, and you build a LinkedIn presence that works for you.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href="#apply"
                className="inline-flex min-h-12 items-center rounded-2xl border-2 border-neutral-900 bg-violet-600 px-7 py-3 text-lg font-bold text-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-clash"
              >
                Apply now
              </a>
              <p className="text-neutral-600 font-satoshi">About 5 minutes. Free to join.</p>
            </div>
            <p className="mt-4 text-sm text-neutral-500 font-satoshi">For college students and recent graduates.</p>
          </div>

          {/* What a week looks like: an illustration of the routine, not data. */}
          <div aria-hidden="true" className="rounded-[28px] border-2 border-neutral-900 bg-white p-6 shadow-brutal-lg">
            <p className="text-xs font-bold tracking-widest text-neutral-500 font-satoshi">WHAT A WEEK LOOKS LIKE</p>
            <ul className="mt-4 space-y-3">
              {[
                { day: "Mon", text: "Your 3 drafts arrive", tag: "From your stories", color: "bg-violet-100 text-violet-800" },
                { day: "Tue", text: "Post about your internship", tag: "Your story", color: "bg-violet-100 text-violet-800" },
                { day: "Thu", text: "Post about a lesson you learned", tag: "Your story", color: "bg-violet-100 text-violet-800" },
                { day: "Sat", text: "Post how you used Studojo", tag: "Studojo", color: "bg-amber-100 text-amber-800" },
                { day: "Sun", text: "See what worked this week", tag: "Your growth", color: "bg-emerald-100 text-emerald-800" },
              ].map((r) => (
                <li key={r.day} className="flex items-center gap-3 rounded-2xl border-2 border-neutral-900 px-3 py-3">
                  <span className="grid h-10 w-12 shrink-0 place-items-center rounded-xl bg-neutral-900 text-sm font-bold text-white font-satoshi">
                    {r.day}
                  </span>
                  <span className="min-w-0 flex-1 font-semibold text-neutral-900 font-satoshi">{r.text}</span>
                  <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-bold sm:inline ${r.color} font-satoshi`}>
                    {r.tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl font-clash">What you get</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {PERKS.map((p) => (
            <div key={p.title} className="rounded-3xl border-2 border-neutral-900 bg-white p-6 shadow-brutal">
              <div className="text-3xl" aria-hidden="true">
                {p.icon}
              </div>
              <h3 className="mt-3 text-xl font-bold text-neutral-900 font-clash">{p.title}</h3>
              <p className="mt-2 text-neutral-600 font-satoshi">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works + is it for you */}
      <section className="border-y-2 border-neutral-900 bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-[1.4fr_1fr] md:px-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl font-clash">How it works</h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-2">
              {HOW.map((h, i) => (
                <li key={h.title} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-neutral-900 bg-violet-600 text-lg font-bold text-white font-clash">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 font-clash">{h.title}</h3>
                    <p className="mt-1 text-neutral-600 font-satoshi">{h.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl border-2 border-neutral-900 bg-studojo-purple-bg p-6">
            <h2 className="text-2xl font-bold text-neutral-900 font-clash">Is this for you?</h2>
            <ul className="mt-5 space-y-3">
              {FOR_YOU.map((t) => (
                <li key={t} className="flex gap-3 font-satoshi text-neutral-800">
                  <span aria-hidden="true" className="mt-0.5 font-bold text-violet-700">
                    ✓
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-neutral-600 font-satoshi">
              You don't need a big following. Real stories and showing up every week matter more.
            </p>
          </div>
        </div>
      </section>

      {/* The application */}
      <section id="apply" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-14 md:px-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl font-clash">Apply to the Creator Program</h2>
          <p className="mt-2 text-neutral-600 font-satoshi">
            We write your posts from your answers, so the more real detail you share, the better your posts will be.
          </p>
        </div>

        {done ? (
          <div
            ref={resultRef}
            tabIndex={-1}
            role="status"
            data-testid="apply-result"
            className="scroll-mt-24 rounded-[32px] border-2 border-neutral-900 bg-white p-8 text-center shadow-brutal-lg outline-none md:p-10"
          >
            <div className="text-4xl" aria-hidden="true">
              {alreadyApplied ? "✅" : "🎉"}
            </div>
            <h3 className="mt-3 text-2xl font-bold text-neutral-900 font-clash">
              {alreadyApplied ? "You've already applied" : `Application received${firstName ? `, ${firstName}` : ""}!`}
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-neutral-600 font-satoshi">
              {alreadyApplied
                ? "We already have an application with this email, so you're all set. We'll message you on WhatsApp if you're selected."
                : "We read every application ourselves. If you're selected, we'll message you on WhatsApp with what happens next."}
            </p>
            <div className="mx-auto mt-8 max-w-md rounded-2xl bg-studojo-purple-bg p-5">
              <p className="font-semibold text-neutral-900 font-satoshi">Know someone with great stories?</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-xl border-2 border-neutral-900 bg-violet-600 px-5 py-2 font-bold text-white font-satoshi"
                >
                  Share on LinkedIn
                </a>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex min-h-11 items-center rounded-xl border-2 border-neutral-900 bg-white px-5 py-2 font-bold text-neutral-900 font-satoshi"
                >
                  {copied ? "Link copied" : "Copy link"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            noValidate
            className="rounded-[32px] border-2 border-neutral-900 bg-white p-5 shadow-brutal-lg md:p-10"
          >
            {/* Bots fill every field; people never see this one. */}
            <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
              <label htmlFor="sj_trap">Leave this empty</label>
              <input
                id="sj_trap"
                name="sj_trap"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
              />
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex gap-2" aria-hidden="true">
                {STEPS.map((s, i) => (
                  <div
                    key={s.title}
                    className={`h-2 flex-1 rounded-full ${i < step ? "bg-violet-600" : i === step ? "bg-violet-400" : "bg-neutral-200"}`}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-neutral-500 font-satoshi">
                  Step {step + 1} of {STEPS.length}
                </p>
                {step > 0 && (
                  <nav aria-label="Steps you've done" className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-satoshi">
                    {STEPS.slice(0, step).map((s, i) => (
                      <button
                        key={s.title}
                        type="button"
                        onClick={() => goTo(i)}
                        className="min-h-11 font-semibold text-violet-700 underline underline-offset-2 sm:min-h-0"
                      >
                        {s.title}
                      </button>
                    ))}
                  </nav>
                )}
              </div>
              <h3
                ref={stepHeadingRef}
                tabIndex={-1}
                className="mt-2 scroll-mt-24 text-2xl font-bold text-neutral-900 outline-none font-clash"
              >
                {STEPS[step].title}
              </h3>
              {restored && (
                <p className="mt-3 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-900 font-satoshi">
                  We kept your answers from last time.{" "}
                  <button type="button" onClick={startOver} className="font-bold underline underline-offset-2">
                    Start over
                  </button>
                </p>
              )}
            </div>

            {step === 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <p className="text-neutral-600 md:col-span-2 font-satoshi">The basics, so we can reach you.</p>
                <div className="md:col-span-2">
                  <label htmlFor="ugc-fullName" className={LABEL}>
                    Full name{REQUIRED}
                  </label>
                  <input
                    {...a11y("fullName")}
                    className={INPUT}
                    autoComplete="name"
                    maxLength={LIMITS.name}
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                  />
                  {errorText("fullName")}
                </div>
                <div>
                  <label htmlFor="ugc-email" className={LABEL}>
                    Email{REQUIRED}
                  </label>
                  <input
                    {...a11y("email")}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className={INPUT}
                    placeholder="you@email.com"
                    maxLength={LIMITS.email}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  {errorText("email")}
                  {emailSuggestion && (
                    <button
                      type="button"
                      onClick={() => update("email", emailSuggestion)}
                      className="mt-2 min-h-11 text-sm font-bold text-violet-700 underline underline-offset-2 font-satoshi"
                    >
                      Use {emailSuggestion} instead
                    </button>
                  )}
                </div>
                <div>
                  <label htmlFor="ugc-whatsapp" className={LABEL}>
                    WhatsApp number{REQUIRED}
                  </label>
                  <input
                    {...a11y("whatsapp")}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className={INPUT}
                    placeholder="98765 43210"
                    maxLength={LIMITS.whatsapp}
                    value={form.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                  />
                  {errorText("whatsapp")}
                  {!err("whatsapp") && <p className="mt-2 text-sm text-neutral-500 font-satoshi">We'll message you here if you're selected.</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="ugc-college" className={LABEL}>
                    College or university{REQUIRED}
                  </label>
                  <input
                    {...a11y("college")}
                    className={INPUT}
                    placeholder="e.g. Christ University, Bengaluru"
                    maxLength={LIMITS.college}
                    value={form.college}
                    onChange={(e) => update("college", e.target.value)}
                  />
                  {errorText("college")}
                </div>
                <div>
                  <label htmlFor="ugc-course" className={LABEL}>
                    Course or degree{REQUIRED}
                  </label>
                  <input
                    {...a11y("course")}
                    className={INPUT}
                    placeholder="e.g. B.Tech CSE, BBA, MBA"
                    maxLength={LIMITS.course}
                    value={form.course}
                    onChange={(e) => update("course", e.target.value)}
                  />
                  {errorText("course")}
                </div>
                <div>
                  <label htmlFor="ugc-yearOfStudy" className={LABEL}>
                    Year of study{REQUIRED}
                  </label>
                  <select
                    {...a11y("yearOfStudy")}
                    className={INPUT}
                    value={form.yearOfStudy}
                    onChange={(e) => update("yearOfStudy", e.target.value)}
                  >
                    <option value="">Select year</option>
                    {YEARS_OF_STUDY.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  {errorText("yearOfStudy")}
                </div>
                <div>
                  <label htmlFor="ugc-graduationYear" className={LABEL}>
                    Graduation year{OPTIONAL}
                  </label>
                  <select
                    id="ugc-graduationYear"
                    className={INPUT}
                    value={form.graduationYear}
                    onChange={(e) => update("graduationYear", e.target.value)}
                  >
                    <option value="">Select year</option>
                    {GRAD_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ugc-city" className={LABEL}>
                    City{OPTIONAL}
                  </label>
                  <input
                    id="ugc-city"
                    className={INPUT}
                    autoComplete="address-level2"
                    maxLength={LIMITS.city}
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-7">
                <p className="text-neutral-600 font-satoshi">
                  This tells us where you're starting from. Small numbers are completely fine.
                </p>
                <div>
                  <label htmlFor="ugc-linkedinUrl" className={LABEL}>
                    Your LinkedIn profile link{REQUIRED}
                  </label>
                  <p className={HINT}>On LinkedIn, open your profile, tap the three dots or Share, and copy the link.</p>
                  <input
                    {...a11y("linkedinUrl")}
                    type="url"
                    inputMode="url"
                    autoCapitalize="none"
                    className={INPUT}
                    placeholder="linkedin.com/in/your-name"
                    maxLength={LIMITS.url}
                    value={form.linkedinUrl}
                    onChange={(e) => update("linkedinUrl", e.target.value)}
                  />
                  {errorText("linkedinUrl")}
                </div>
                {choices({ f: "followers", options: FOLLOWERS, legend: "About how many followers do you have?", required: true })}
                {choices({ f: "postFrequency", options: POST_FREQUENCY, legend: "How often do you post?", required: true })}
                {choices({ f: "lastPosted", options: LAST_POSTED, legend: "When did you last post?", required: true })}
                <div>
                  <label htmlFor="ugc-bestPostUrl" className={LABEL}>
                    A post of yours you're proud of{OPTIONAL}
                  </label>
                  <p className={HINT}>Paste the link to the post. It helps us see how you write.</p>
                  <input
                    {...a11y("bestPostUrl")}
                    type="url"
                    inputMode="url"
                    autoCapitalize="none"
                    className={INPUT}
                    placeholder="linkedin.com/posts/..."
                    maxLength={LIMITS.url}
                    value={form.bestPostUrl}
                    onChange={(e) => update("bestPostUrl", e.target.value)}
                  />
                  {errorText("bestPostUrl")}
                </div>
                {choices({ f: "crossed1k", options: CROSSED_1K, legend: "Has any of your posts crossed 1,000 impressions?" })}
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-7">
                <p className="text-neutral-600 font-satoshi">So your posts point where you want to go next.</p>
                <div>
                  <label htmlFor="ugc-field" className={LABEL}>
                    Your field{REQUIRED}
                  </label>
                  <select {...a11y("field")} className={INPUT} value={form.field} onChange={(e) => update("field", e.target.value)}>
                    <option value="">Select your field</option>
                    {FIELDS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  {errorText("field")}
                </div>
                <div>
                  <label htmlFor="ugc-targetRoles" className={LABEL}>
                    Roles you're aiming for{REQUIRED}
                  </label>
                  <input
                    {...a11y("targetRoles")}
                    className={INPUT}
                    placeholder="e.g. Product analyst, investment banking intern"
                    maxLength={LIMITS.roles}
                    value={form.targetRoles}
                    onChange={(e) => update("targetRoles", e.target.value)}
                  />
                  {errorText("targetRoles")}
                </div>
                {choices({ f: "lookingFor", options: LOOKING_FOR, legend: "What are you looking for right now?", required: true })}
                <div>
                  <label htmlFor="ugc-dreamCompanies" className={LABEL}>
                    Companies you'd love to work at{OPTIONAL}
                  </label>
                  <input
                    id="ugc-dreamCompanies"
                    className={INPUT}
                    placeholder="e.g. Zepto, Deloitte, Google"
                    maxLength={LIMITS.companies}
                    value={form.dreamCompanies}
                    onChange={(e) => update("dreamCompanies", e.target.value)}
                  />
                </div>
                <fieldset aria-describedby={err("topics") ? "ugc-topics-error" : undefined}>
                  <legend className={LABEL}>
                    Topics you'd enjoy posting about{REQUIRED}
                  </legend>
                  <p className={HINT}>
                    Pick up to {LIMITS.topicsMax}. {form.topics.length} picked.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((t, i) => {
                      const on = form.topics.includes(t);
                      const full = !on && form.topics.length >= LIMITS.topicsMax;
                      return (
                        <label key={t} className={full ? "cursor-not-allowed opacity-40" : "cursor-pointer"}>
                          <input
                            type="checkbox"
                            id={`ugc-topics-${i}`}
                            checked={on}
                            disabled={full}
                            onChange={() => toggleTopic(t)}
                            className="peer sr-only"
                          />
                          <span className="inline-flex min-h-11 select-none items-center rounded-full border-2 border-neutral-900 bg-white px-4 py-2 text-base font-medium text-neutral-900 transition-colors hover:bg-violet-50 peer-checked:bg-violet-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 font-satoshi">
                            {on ? "✓ " : ""}
                            {t}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errorText("topics")}
                </fieldset>
                <div>
                  <label htmlFor="ugc-avoidTopics" className={LABEL}>
                    Anything you'd rather not post about?{OPTIONAL}
                  </label>
                  <input
                    id="ugc-avoidTopics"
                    className={INPUT}
                    maxLength={LIMITS.avoid}
                    value={form.avoidTopics}
                    onChange={(e) => update("avoidTopics", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-7">
                <div className="rounded-2xl bg-violet-50 p-4 text-violet-950 font-satoshi">
                  <p className="font-semibold">This is the most important part.</p>
                  <p className="mt-1">
                    We write your posts from these. Tell us at least one story; a few honest lines are enough. More stories
                    means better posts.
                  </p>
                </div>
                {STORY_PROMPTS.map((p, i) => {
                  const value = form[p.key];
                  const ready = value.trim().length >= LIMITS.storyMin;
                  const invalid = i === 0 && Boolean(err("stories"));
                  return (
                    <div key={p.key}>
                      <label htmlFor={`ugc-${p.key}`} className={LABEL}>
                        {p.title}
                        {i === 0 ? null : OPTIONAL}
                      </label>
                      <p className={HINT}>{p.hint}</p>
                      <textarea
                        id={`ugc-${p.key}`}
                        aria-invalid={invalid ? true : undefined}
                        aria-describedby={invalid ? "ugc-stories-error" : undefined}
                        className={`${INPUT} min-h-[140px] resize-y`}
                        placeholder={p.placeholder}
                        maxLength={LIMITS.story}
                        value={value}
                        onChange={(e) => update(p.key, e.target.value)}
                      />
                      <div className="mt-1 flex justify-between text-sm font-satoshi">
                        <span className={ready ? "font-semibold text-emerald-700" : "text-neutral-400"}>
                          {ready ? "✓ Enough for us to write from" : value.trim() ? "Keep going, a little more detail helps" : ""}
                        </span>
                        <span className="text-neutral-400">
                          {value.length}/{LIMITS.story}
                        </span>
                      </div>
                      {i === 0 && errorText("stories")}
                    </div>
                  );
                })}
                <p className="text-sm text-neutral-500 font-satoshi">
                  {storyCount === 0
                    ? "Tip: the first one is usually the easiest."
                    : `${storyCount} ${storyCount === 1 ? "story" : "stories"} so far.`}
                </p>
                {choices({ f: "tone", options: TONES, legend: "How do you want to sound?" })}
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-7">
                <p className="text-neutral-600 font-satoshi">Almost done.</p>
                {choices({ f: "canCommit", options: CAN_COMMIT, legend: "Can you post 3 times a week for 4 weeks?", required: true })}
                {choices({
                  f: "studojoOk",
                  options: STUDOJO_OK,
                  legend: "1 in 3 of your posts will be about how you use Studojo. Is that okay?",
                  hint: "It's always about your real experience. We never ask you to say something that isn't true.",
                  required: true,
                })}
                <div>
                  <label htmlFor="ugc-whyJoin" className={LABEL}>
                    Why do you want to join?{REQUIRED}
                  </label>
                  <textarea
                    {...a11y("whyJoin")}
                    className={`${INPUT} min-h-[110px] resize-y`}
                    placeholder="A line or two is plenty."
                    maxLength={LIMITS.why}
                    value={form.whyJoin}
                    onChange={(e) => update("whyJoin", e.target.value)}
                  />
                  <div className="mt-1 text-right text-sm text-neutral-400 font-satoshi">
                    {form.whyJoin.length}/{LIMITS.why}
                  </div>
                  {errorText("whyJoin")}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="ugc-referralSource" className={LABEL}>
                      How did you hear about this?{OPTIONAL}
                    </label>
                    <select
                      id="ugc-referralSource"
                      className={INPUT}
                      value={form.referralSource}
                      onChange={(e) => update("referralSource", e.target.value)}
                    >
                      <option value="">Prefer not to say</option>
                      {REFERRAL_SOURCES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ugc-referredBy" className={LABEL}>
                      Who told you about it?{OPTIONAL}
                    </label>
                    <input
                      id="ugc-referredBy"
                      className={INPUT}
                      placeholder="Their name"
                      maxLength={LIMITS.referredBy}
                      value={form.referredBy}
                      onChange={(e) => update("referredBy", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="flex cursor-pointer items-start gap-3 font-satoshi">
                    <input
                      {...a11y("consent")}
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => update("consent", e.target.checked)}
                      className="mt-1 h-5 w-5 shrink-0 accent-violet-600"
                    />
                    <span className="text-neutral-800">
                      Studojo can contact me on WhatsApp and email about the Creator Program, and I agree to the{" "}
                      <a href="/privacy" target="_blank" rel="noopener" className="font-semibold text-violet-700 underline underline-offset-2">
                        Privacy Policy
                      </a>
                      .{REQUIRED}
                    </span>
                  </label>
                  {errorText("consent")}
                </div>
              </div>
            )}

            {formError && (
              <p role="alert" className="mt-6 text-sm font-semibold text-red-600 font-satoshi">
                {formError}
              </p>
            )}

            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  className="min-h-12 rounded-2xl border-2 border-neutral-900 bg-white px-6 py-3 text-lg font-bold text-neutral-900 font-clash"
                >
                  Back
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={submitting}
                className="min-h-12 rounded-2xl border-2 border-neutral-900 bg-violet-600 px-8 py-3 text-lg font-bold text-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60 font-clash"
              >
                {step < STEPS.length - 1 ? "Next" : submitting ? "Sending..." : "Submit application"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-20 md:px-8">
        <h2 className="text-3xl font-bold text-neutral-900 font-clash">Questions</h2>
        <div className="mt-6 divide-y-2 divide-neutral-200 rounded-3xl border-2 border-neutral-900 bg-white">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-6">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-bold text-neutral-900 font-satoshi">
                {f.q}
                <span aria-hidden="true" className="text-2xl text-violet-700 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-neutral-600 font-satoshi">
                {f.a}
                {f.q === "What happens to my answers?" && (
                  <>
                    {" "}
                    <a href="/privacy" className="font-semibold text-violet-700 underline underline-offset-2">
                      Read the Privacy Policy
                    </a>
                  </>
                )}
              </p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
