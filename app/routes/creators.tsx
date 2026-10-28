import { useEffect, useRef, useState } from "react";
import { useActionData, useLocation } from "react-router";
import { FiAlertCircle, FiAward, FiCheck, FiCheckCircle, FiEdit3, FiSend, FiUserCheck, FiX } from "react-icons/fi";
import { Header, Footer } from "~/components";
import db from "~/lib/db";
import { checkEmail } from "~/lib/email-validate";
import { logFunnelStep } from "~/lib/funnel";
import { guardPublicForm } from "~/lib/ratelimit.server";
import { revealResult } from "~/lib/reveal-result";
import { saveUgcApplication } from "~/lib/ugc-application.server";
import {
  CAN_COMMIT,
  CONNECTIONS,
  CROSSED_1K,
  FELLOWSHIP_GOALS,
  FIELDS,
  INTERN_INTEREST,
  LAST_POSTED,
  LIMITS,
  LOOKING_FOR,
  NETWORK_SHARE,
  POST_FREQUENCY,
  REFERRAL_SOURCES,
  SHARE_CODE,
  STEPS,
  STUDOJO_OK,
  TOPICS,
  YEARS_OF_STUDY,
  stepOf,
  validateUgcApplication,
  type UgcField,
} from "~/lib/ugc-application";
import { systemEvents } from "../../auth-schema";

// The Studojo Growth Fellowship application (the LinkedIn UGC programme),
// shared on LinkedIn. Served at /fellowship-growth (canonical), and at
// /creators and /ugc so earlier links keep working (same module).

const CANONICAL = "https://studojo.com/fellowship-growth";
const SHARE_IMAGE = "https://studojo.com/og-growth-fellowship.png";

export function meta() {
  return [
    { title: "Studojo Growth Fellowship | Learn growth by doing it, get hired for it" },
    {
      name: "description",
      content:
        "A fellowship for students who want to work in growth: learn distribution hands-on, get a shot at a Studojo growth internship, and get referred to people hiring. Apply in about 5 minutes.",
    },
    { property: "og:title", content: "Studojo Growth Fellowship: learn growth by doing it, get hired for it" },
    {
      property: "og:description",
      content: "Learn distribution hands-on, get a shot at a Studojo growth internship, and get referred to people in our network who are hiring.",
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
  noLinkedin: boolean;
  linkedinUrl: string;
  connections: string;
  postFrequency: string;
  lastPosted: string;
  bestPostUrl: string;
  crossed1k: string;
  field: string;
  targetRoles: string;
  dreamCompanies: string;
  lookingFor: string;
  fellowshipGoals: string[];
  internInterest: string;
  networkShare: string;
  topics: string[];
  avoidTopics: string;
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
  noLinkedin: false,
  linkedinUrl: "",
  connections: "",
  postFrequency: "",
  lastPosted: "",
  bestPostUrl: "",
  crossed1k: "",
  field: "",
  targetRoles: "",
  dreamCompanies: "",
  lookingFor: "",
  fellowshipGoals: [],
  internInterest: "",
  networkShare: "",
  topics: [],
  avoidTopics: "",
  canCommit: "",
  studojoOk: "",
  whyJoin: "",
  referralSource: "",
  referredBy: "",
  consent: false,
};

// ---------------------------------------------------------------------------
// The form without its script. Some visitors' browsers show this page but never
// run its JavaScript, so pressing Next used to reload the page and wipe what
// they had typed. The form now posts here instead: the first step's answers
// come back as the whole application on one page with their answers filled
// in, and that page is checked and saved here, the same way /api/ugc-apply
// saves the scripted form.
// ---------------------------------------------------------------------------

type ActionResult =
  | { mode: "full"; values: FormState; errors: Partial<Record<UgcField, string>>; formError?: string; nojsId: string }
  | { done: true; shareCode: string | null; alreadyApplied: boolean; firstName: string };

// A real application is a few KB.
const MAX_POST = 64 * 1024;

// Why the page's code didn't run. A plain inline script (it runs even when the
// app's modules fail) notes load and runtime errors, and when the browser posts
// the form itself it writes them, with what did and didn't start, into
// sj_diag. Nothing is sent unless the form is posted without the app.
// Written as old-style JavaScript on purpose, so the oldest browsers run it.
const DIAG_SCRIPT = `(function(){try{
var d={e:[],r:[]};
addEventListener("error",function(ev){try{var t=ev.target,m;
if(t&&t!==window&&t.tagName){m="el:"+t.tagName+":"+String(t.src||t.href||"inline").split("/").pop();}
else{m=String(ev.message||"error")+"@"+String(ev.filename||"").split("/").pop()+":"+(ev.lineno||0);}
if(d.e.length<6)d.e.push(m.slice(0,160));}catch(x){}},true);
addEventListener("unhandledrejection",function(ev){try{var r=ev.reason;if(d.r.length<3)d.r.push(String(r&&(r.message||r)).slice(0,160));}catch(x){}});
document.addEventListener("submit",function(ev){try{var f=ev.target,i=f&&f.querySelector&&f.querySelector('input[name="sj_diag"]');if(!i)return;
var js=0,bad=[];try{performance.getEntriesByType("resource").forEach(function(p){if(/\\/assets\\/[^?]*\\.js/.test(p.name)){js++;
if((p.responseStatus&&p.responseStatus!==200)||(p.transferSize===0&&p.decodedBodySize===0))bad.push(p.name.split("/").pop());}});}catch(x){}
var h=false;for(var k in f){if(k.indexOf("__react")===0){h=true;break;}}
i.value=JSON.stringify({h:h,m:!!window.__reactRouterRouteModules,c:!!window.__reactRouterContext,t:Math.round(performance.now()),js:js,bad:bad.slice(0,5),e:d.e,r:d.r,
lang:document.documentElement.lang,tr:/translated/.test(document.documentElement.className),w:innerWidth}).slice(0,1000);}catch(x){}},true);
}catch(x){}})();`;

function formValues(fd: FormData): FormState {
  const form = { ...EMPTY };
  for (const k of Object.keys(EMPTY) as (keyof FormState)[]) {
    if (k === "topics" || k === "fellowshipGoals") {
      form[k] = fd
        .getAll(k)
        .filter((v): v is string => typeof v === "string")
        .slice(0, 20)
        .map((v) => v.slice(0, 200));
    } else if (k === "noLinkedin" || k === "consent") {
      form[k] = fd.has(k);
    } else {
      const v = fd.get(k);
      (form as unknown as Record<string, unknown>)[k] = typeof v === "string" ? v.slice(0, 2000) : "";
    }
  }
  return form;
}

/** Records the scriptless path in the funnel, with the browser, so it can be traced. */
async function logScriptless(request: Request, nojsId: string, event: "creators_nojs" | "creators_submit", info: string, diag = "") {
  try {
    const url = new URL(request.url);
    await db.insert(systemEvents).values({
      eventType: `funnel_${event}`,
      userId: null,
      metadata: {
        anon_id: `nojs-${nojsId}`,
        path: (url.pathname + url.search).slice(0, 300),
        in_app: null,
        info: info.slice(0, 64),
        no_js: true,
        ua: (request.headers.get("user-agent") ?? "").slice(0, 200),
        // Empty when the browser ran no script at all.
        diag: diag.slice(0, 1000) || null,
      },
    });
  } catch {
    // Tracking must never stop an application.
  }
}

export async function action({ request }: { request: Request }): Promise<ActionResult> {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_POST) {
    throw new Response("That's too long to send. Please shorten your answers.", { status: 413 });
  }
  const fd = await request.formData();
  const values = formValues(fd);
  const url = new URL(request.url);
  const rawId = fd.get("sj_nojs");
  const nojsId = typeof rawId === "string" && /^[a-f0-9]{12}$/.test(rawId) ? rawId : crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const ref = (url.searchParams.get("ref") ?? "").toLowerCase();
  const trap = fd.get("sj_trap");
  const body: Record<string, unknown> = {
    ...values,
    sj_trap: typeof trap === "string" ? trap : "",
    cameFromCode: SHARE_CODE.test(ref) ? ref : "",
  };
  const rawDiag = fd.get("sj_diag");
  const diag = typeof rawDiag === "string" ? rawDiag : "";
  const emailError = (email: string) => {
    const c = checkEmail(email);
    return c.ok ? null : (c.error ?? "Please enter a valid email address.");
  };

  // The first step, from a page whose script did not run: show the whole form.
  if (fd.get("sj_mode") !== "full") {
    const first = validateUgcApplication(body, emailError);
    const errors = !first.ok && stepOf(first.field) === 0 ? { [first.field]: first.error } : {};
    await logScriptless(request, nojsId, "creators_nojs", "continue", diag);
    return { mode: "full", values, errors, nojsId };
  }

  // The whole form: the same checks and save as /api/ugc-apply.
  const blocked = await guardPublicForm(request, body);
  if (blocked) {
    if (blocked.status === 200) return { done: true, shareCode: null, alreadyApplied: false, firstName: "" };
    return { mode: "full", values, errors: {}, formError: "Too many tries from your network just now. Please wait a few minutes and submit again.", nojsId };
  }
  const result = validateUgcApplication(body, emailError);
  if (!result.ok) {
    await logScriptless(request, nojsId, "creators_nojs", `error:${result.field}`, diag);
    return { mode: "full", values, errors: { [result.field]: result.error }, nojsId };
  }
  let saved: { isNew: boolean; shareCode: string };
  try {
    saved = await saveUgcApplication(result.value, {
      sourcePath: url.pathname.slice(0, 120),
      utmSource: (url.searchParams.get("utm_source") ?? "").slice(0, 80),
      utmMedium: (url.searchParams.get("utm_medium") ?? "").slice(0, 80),
      utmCampaign: (url.searchParams.get("utm_campaign") ?? "").slice(0, 120),
    });
  } catch (e) {
    // Never log the error itself: the driver puts every bound value in its message.
    const code = (e as { cause?: { code?: string }; code?: string })?.cause?.code ?? (e as { code?: string })?.code;
    console.error("[creators] scriptless save failed", code ?? (e as Error)?.name ?? "unknown");
    return { mode: "full", values, errors: {}, formError: "We couldn't save your application just now. Please try again in a minute.", nojsId };
  }
  await logScriptless(request, nojsId, "creators_submit", saved.shareCode);
  await logScriptless(request, nojsId, "creators_nojs", "submit", diag);
  return { done: true, shareCode: saved.shareCode, alreadyApplied: !saved.isNew, firstName: result.value.fullName.split(/\s+/)[0] ?? "" };
}

// Answers are kept on the device while someone fills the form, so a closed tab
// or a LinkedIn in-app browser reload does not throw the work away. Drafts
// expire after a day (shared and lab computers), and the consent tick is never
// kept: whoever submits must tick it themselves.
const DRAFT_KEY = "studojo.creators.draft.v2";
// The share code of whoever's link brought this visitor here, for this session.
const REF_KEY = "studojo.creators.ref";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

function loadDraft(): { form: FormState; step: number } | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || !saved.form) return null;
    if (typeof saved.savedAt !== "number" || Date.now() - saved.savedAt > DRAFT_TTL_MS) {
      clearDraft();
      return null;
    }
    const form = { ...EMPTY };
    for (const k of Object.keys(EMPTY) as (keyof FormState)[]) {
      const v = saved.form[k];
      if (k === "topics") form.topics = Array.isArray(v) ? v.map(String) : [];
      else if (k === "fellowshipGoals") form.fellowshipGoals = Array.isArray(v) ? v.map(String) : [];
      else if (k === "consent") form.consent = false;
      else if (k === "noLinkedin") form.noLinkedin = v === true;
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
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ form: { ...form, consent: false }, step, savedAt: Date.now() }));
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
  const id = `ugc-${field}`;
  const el = document.getElementById(id) ?? document.getElementById(`${id}-0`);
  if (!el) return;
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  el.focus({ preventScroll: true });
}

const INPUT =
  "w-full min-h-12 bg-white border-2 border-neutral-900 rounded-2xl px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-400 aria-[invalid=true]:border-red-500 font-satoshi";
const LABEL = "block text-base font-semibold text-neutral-900 mb-1 font-satoshi";
const HINT = "text-sm text-neutral-500 mb-2 font-satoshi";
const OPTIONAL = <span className="font-normal text-neutral-500"> (optional)</span>;
const REQUIRED = <span className="text-red-500" aria-hidden="true"> *</span>;

const PERKS = [
  {
    icon: FiAward,
    title: "A path to a growth internship at Studojo",
    body: "Studojo hires its growth interns from the fellowship. Fellows who show up and do really well get first preference.",
  },
  {
    icon: FiSend,
    title: "Opportunities beyond Studojo",
    body: "If Studojo isn't the right fit, we share strong fellows' profiles with people in our network who are hiring.",
  },
  {
    icon: FiEdit3,
    title: "Learn distribution by doing it",
    body: "Learn what makes content travel and how an audience grows, hands-on, on your own LinkedIn. We help you write every post.",
  },
  {
    icon: FiUserCheck,
    title: "A LinkedIn profile that keeps working",
    body: "Recruiters love a strong LinkedIn profile. Whatever happens next, you leave with one, and an audience you can keep growing.",
  },
];

const HOW = [
  { title: "Apply", body: "Tell us about you, your LinkedIn and where you're headed. About 5 minutes." },
  { title: "Join the fellowship", body: "We read every application. If you're selected, we message you on WhatsApp." },
  { title: "Write and post with us", body: "Share your experiences. We help you shape them into posts and show you what works." },
  { title: "Get hired", body: "The best fellows become Studojo growth interns or get referred to people hiring in our network." },
];

const FOR_YOU = [
  "You're in college or graduated recently",
  "You want to work in growth, or learn how distribution works",
  "You can post 3 times a week",
  "You're happy for some posts to be about how you use Studojo, labelled as a partnership",
];

const FAQ = [
  {
    q: "Do I need a lot of followers?",
    a: "No. Real stories and posting consistently matter more to us than follower count. Tell us where you're starting from. Small numbers are completely fine.",
  },
  {
    q: "Who writes the posts?",
    a: "You and us, together. You share your experiences, we help you shape them into posts, and you post from your own account. Nothing goes out without you.",
  },
  {
    q: "How do I get a growth internship at Studojo?",
    a: "Studojo hires its growth interns from the fellowship. Fellows who post consistently and do really well get first preference.",
  },
  {
    q: "What if I don't get an internship at Studojo?",
    a: "We share strong fellows' profiles with people in our network who are hiring. And either way, you leave with a LinkedIn profile that keeps bringing you opportunities.",
  },
  {
    q: "What does a Studojo post look like?",
    a: "It's about your real experience using Studojo, for example reaching a hiring manager directly instead of applying on a portal. Because you get free Studojo access, these posts say so at the top (for example \"In partnership with Studojo\"), as Indian advertising rules require. We never ask you to say anything that isn't true.",
  },
  {
    q: "How much time does it take?",
    a: "A few minutes per post: read the draft, tweak it if you like, post it and paste the link back to us. A week later, send us a screenshot of how it did.",
  },
  {
    q: "What happens to my answers?",
    a: "We use them only to select fellows and to help write your posts.",
  },
];

export default function Creators() {
  // Set when the form was posted without its script (see action above).
  const posted = useActionData<typeof action>();
  const full = posted && "mode" in posted ? posted : null;
  const sent = posted && "done" in posted ? posted : null;
  const location = useLocation();
  const [form, setForm] = useState<FormState>(() => (full ? full.values : sent ? { ...EMPTY, fullName: sent.firstName } : EMPTY));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<UgcField, string>>>(() => full?.errors ?? {});
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(() => full?.formError ?? null);
  const [restored, setRestored] = useState(false);
  const [trap, setTrap] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(() => Boolean(sent));
  const [alreadyApplied, setAlreadyApplied] = useState(() => Boolean(sent?.alreadyApplied));
  // After a scriptless submit the link is shown to copy by hand.
  const [copied, setCopied] = useState<"no" | "yes" | "failed">(() => (sent ? "failed" : "no"));
  const [shareCode, setShareCode] = useState<string | null>(() => sent?.shareCode ?? null);
  const [noLinkedinOpen, setNoLinkedinOpen] = useState(false);
  const loaded = useRef(false);
  const fromPost = useRef(Boolean(posted));
  const started = useRef(false);
  const cameFrom = useRef<string | null>(null);
  const dialogPrimaryRef = useRef<HTMLAnchorElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<UgcField | null>(null);

  // Bring back a half-finished application (client only, after hydration),
  // count the visit, and remember whose share link brought them here.
  useEffect(() => {
    // A page answering a scriptless post: its answers came with it, and the visit was counted already.
    if (fromPost.current) return;
    logFunnelStep("creators_view");
    try {
      const ref = (new URLSearchParams(window.location.search).get("ref") ?? "").toLowerCase();
      if (SHARE_CODE.test(ref)) window.sessionStorage.setItem(REF_KEY, ref);
      const kept = window.sessionStorage.getItem(REF_KEY);
      cameFrom.current = kept && SHARE_CODE.test(kept) ? kept : null;
    } catch {
      // Storage blocked: attribution is best effort.
    }
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

  // The no-LinkedIn warning: focus its main action, Escape closes it.
  useEffect(() => {
    if (!noLinkedinOpen) return;
    dialogPrimaryRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNoLinkedin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [noLinkedinOpen]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    if (!started.current) {
      started.current = true;
      logFunnelStep("creators_start");
    }
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key as UgcField]) return e;
      const next = { ...e };
      delete next[key as UgcField];
      return next;
    });
    if (key === "email") setEmailSuggestion(null);
    setFormError(null);
  }

  function toggleGoal(goal: string) {
    const has = form.fellowshipGoals.includes(goal);
    update("fellowshipGoals", has ? form.fellowshipGoals.filter((g) => g !== goal) : [...form.fellowshipGoals, goal]);
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
    if (s > step) logFunnelStep("creators_step", { info: String(s + 1) });
    setRestored(false);
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

  function openNoLinkedin() {
    setNoLinkedinOpen(true);
    logFunnelStep("creators_no_linkedin");
  }

  function closeNoLinkedin() {
    setNoLinkedinOpen(false);
    window.requestAnimationFrame(() => document.getElementById("ugc-linkedinUrl")?.focus());
  }

  function continueWithoutLinkedin() {
    setNoLinkedinOpen(false);
    // Clear the LinkedIn answers so nothing half-filled goes with the application.
    setForm((f) => ({ ...f, noLinkedin: true, linkedinUrl: "", connections: "", postFrequency: "", lastPosted: "", bestPostUrl: "", crossed1k: "" }));
    setErrors({});
    logFunnelStep("creators_no_linkedin_continue");
  }

  function addLinkedinAfterAll() {
    update("noLinkedin", false);
    window.requestAnimationFrame(() => document.getElementById("ugc-linkedinUrl")?.focus());
  }

  function startOver() {
    if (!window.confirm("Clear all your answers and start again?")) return;
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
          cameFromCode: cameFrom.current ?? "",
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
      const code = typeof data.shareCode === "string" && SHARE_CODE.test(data.shareCode) ? data.shareCode : null;
      setShareCode(code);
      logFunnelStep("creators_submit", { info: code ?? "" });
      setAlreadyApplied(Boolean(data.alreadyApplied));
      setDone(true);
    } catch {
      setFormError("We couldn't reach Studojo. Check your connection and try again. Your answers are saved on this device.");
      setSubmitting(false);
    }
  }

  // Every share link carries the applicant's code, so visits and applications
  // that come through it are credited to them in the admin panel.
  const shareLink = (source: string) =>
    `https://studojo.com/fellowship-growth?${shareCode ? `ref=${shareCode}&` : ""}utm_source=${source}&utm_medium=share&utm_campaign=growth_fellowship`;
  const trackShare = (channel: "linkedin" | "whatsapp" | "copy") =>
    logFunnelStep("creators_share", { info: `${channel}:${shareCode ?? ""}` });
  const whatsappText = `I just applied to the Studojo Growth Fellowship. They help students build a LinkedIn that brings opportunities. Apply here: ${shareLink("whatsapp")}`;
  async function copyLink() {
    trackShare("copy");
    const url = shareLink("copy");
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      const t = document.createElement("textarea");
      t.value = url;
      document.body.appendChild(t);
      t.select();
      ok = document.execCommand("copy");
      t.remove();
    }
    setCopied(ok ? "yes" : "failed");
    if (ok) window.setTimeout(() => setCopied("no"), 2500);
  }

  const err = (f: UgcField) => errors[f];
  const a11y = (f: UgcField) => ({
    id: `ugc-${f}`,
    name: f,
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
            <span className="inline-flex min-h-11 select-none items-center rounded-full border-2 border-neutral-900 bg-white px-4 py-2 text-base font-medium text-neutral-900 transition-colors hover:bg-violet-50 peer-checked:bg-violet-600 peer-checked:hover:bg-violet-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 font-satoshi">
              {o}
            </span>
          </label>
        ))}
      </div>
      {errorText(f)}
    </fieldset>
  );

  const firstName = form.fullName.trim().split(/\s+/)[0] || "";

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Header landing />
      {/* Runs during page load, before the app's modules (see DIAG_SCRIPT). */}
      <script dangerouslySetInnerHTML={{ __html: DIAG_SCRIPT }} />

      {/* After a scriptless post the browser opens at the top of the page, so the form comes first. */}
      {!posted && (
        <>
      {/* Hero */}
      <section className="border-b-2 border-neutral-900 bg-studojo-purple-bg">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.15fr_1fr] md:px-8 md:py-16">
          <div>
            <span className="inline-block rounded-full border-2 border-neutral-900 bg-white px-3 py-1 text-xs font-bold tracking-wide text-violet-700 shadow-brutal font-satoshi">
              STUDOJO GROWTH FELLOWSHIP
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] text-neutral-900 md:text-5xl font-clash">
              Learn growth by doing it. Get hired for it.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-neutral-700 font-satoshi">
              A fellowship for students who want to work in growth. You learn distribution hands-on by growing your own
              presence with us. Studojo hires its growth interns from the fellows, and we refer strong fellows to people in
              our network who are hiring.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href="#apply"
                className="inline-flex min-h-12 items-center rounded-2xl border-2 border-neutral-900 bg-violet-600 px-7 py-3 text-lg font-bold text-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-clash"
              >
                Apply to the fellowship
              </a>
              <p className="text-neutral-600 font-satoshi">About 5 minutes. Free to join.</p>
            </div>
            <p className="mt-4 text-sm text-neutral-600 font-satoshi">For college students and recent graduates.</p>
          </div>

          {/* What the fellowship gives you: an illustration, not data. */}
          <div aria-hidden="true" className="rounded-[28px] border-2 border-neutral-900 bg-white p-6 shadow-brutal-lg">
            <p className="text-xs font-bold tracking-widest text-neutral-500 font-satoshi">WHAT THE FELLOWSHIP GIVES YOU</p>
            <ul className="mt-4 space-y-3">
              {[
                { day: "01", text: "A shot at a growth internship at Studojo", tag: "Studojo", color: "bg-amber-100 text-amber-800" },
                { day: "02", text: "Referrals to people hiring in our network", tag: "Network", color: "bg-emerald-100 text-emerald-800" },
                { day: "03", text: "Hands-on distribution skills", tag: "Skill", color: "bg-violet-100 text-violet-800" },
                { day: "04", text: "Posts you're proud of, written with us", tag: "Your work", color: "bg-violet-100 text-violet-800" },
                { day: "05", text: "A profile recruiters notice", tag: "Profile", color: "bg-emerald-100 text-emerald-800" },
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
              <span
                aria-hidden="true"
                className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-neutral-900 bg-violet-100 text-violet-700"
              >
                <p.icon className="h-6 w-6" />
              </span>
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
                  <FiCheck aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-violet-700" />
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

        </>
      )}

      {/* The application */}
      <section id="apply" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-14 md:px-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl font-clash">Apply to the Growth Fellowship</h2>
          <p className="mt-2 text-neutral-600 font-satoshi">
            Tell us where you're starting from and where you're headed. If you're selected, we'll ask for your stories next.
          </p>
        </div>

        {done ? (
          <div
            ref={resultRef}
            tabIndex={-1}
            role="status"
            data-testid="apply-result"
            className="ph-no-capture scroll-mt-24 rounded-[32px] border-2 border-neutral-900 bg-white p-8 text-center shadow-brutal-lg outline-none md:p-10"
          >
            <FiCheckCircle aria-hidden="true" className="mx-auto h-12 w-12 text-violet-600" />
            <h3 className="mt-3 text-2xl font-bold text-neutral-900 font-clash">
              {alreadyApplied ? "You've already applied" : `Application received${firstName ? `, ${firstName}` : ""}!`}
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-neutral-600 font-satoshi">
              {alreadyApplied
                ? "We already have an application with this email, so you're all set. We'll message you on WhatsApp if you're selected. Need to change something? Write to us through the Contact page and we'll update it."
                : "We read every application ourselves. If you're selected for the fellowship, we'll message you on WhatsApp with what happens next. Fellows who do well get first preference when Studojo hires growth interns."}
            </p>
            <div className="mx-auto mt-8 max-w-md rounded-2xl bg-studojo-purple-bg p-5">
              <p className="font-semibold text-neutral-900 font-satoshi">Know someone with great stories?</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink("linkedin"))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackShare("linkedin")}
                  className="inline-flex min-h-11 items-center rounded-xl border-2 border-neutral-900 bg-violet-600 px-5 py-2 font-bold text-white font-satoshi"
                >
                  Share on LinkedIn
                </a>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex min-h-11 items-center rounded-xl border-2 border-neutral-900 bg-white px-5 py-2 font-bold text-neutral-900 font-satoshi"
                >
                  {copied === "yes" ? "Link copied" : "Copy link"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackShare("whatsapp")}
                  className="inline-flex min-h-11 items-center rounded-xl border-2 border-neutral-900 bg-white px-5 py-2 font-bold text-neutral-900 font-satoshi"
                >
                  Share on WhatsApp
                </a>
              </div>
              {copied === "failed" && (
                <input
                  readOnly
                  aria-label="Link to share"
                  value={shareLink("copy")}
                  onFocus={(e) => e.currentTarget.select()}
                  className={`${INPUT} mt-4 text-center`}
                />
              )}
            </div>
          </div>
        ) : (
          <form
            method="post"
            action={`${location.pathname}${location.search}#apply`}
            onSubmit={full ? undefined : onSubmit}
            noValidate
            className="ph-no-capture rounded-[32px] border-2 border-neutral-900 bg-white p-5 shadow-brutal-lg md:p-10"
          >
            {/* Used only when the browser posts the form itself (no script): which form this is, and whose. */}
            <input type="hidden" name="sj_mode" value={full ? "full" : "step"} />
            <input type="hidden" name="sj_diag" defaultValue="" />
            {full && <input type="hidden" name="sj_nojs" value={full.nojsId} />}
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

            {full ? (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 outline-none font-clash">Your application</h3>
                <p className="mt-2 text-neutral-600 font-satoshi">
                  All the questions are on this page now. What you already filled in is kept.
                </p>
                {Object.keys(errors).length > 0 && (
                  <p role="alert" className="mt-4 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 font-satoshi">
                    One answer needs a fix:{" "}
                    {Object.entries(errors).map(([f, msg]) => (
                      <a key={f} href={`#ugc-${f}-error`} className="underline underline-offset-2">
                        {msg}
                      </a>
                    ))}
                  </p>
                )}
              </div>
            ) : (
            /* Progress */
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
            )}

            {(full || step === 0) && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {full && <h4 className="text-xl font-bold text-neutral-900 md:col-span-2 font-clash">{STEPS[0].title}</h4>}
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
                    name="graduationYear"
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
                    City{REQUIRED}
                  </label>
                  <input
                    {...a11y("city")}
                    className={INPUT}
                    autoComplete="address-level2"
                    maxLength={LIMITS.city}
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                  {errorText("city")}
                </div>
              </div>
            )}

            {(full || step === 1) && (
              <div className={`grid gap-7${full ? " mt-12 border-t-2 border-neutral-200 pt-10" : ""}`}>
                {full && <h4 className="text-xl font-bold text-neutral-900 font-clash">{STEPS[1].title}</h4>}
                {form.noLinkedin && !full ? (
                  <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 font-satoshi">
                    <p className="font-semibold text-amber-950">You said you don't have LinkedIn.</p>
                    <p className="mt-1 text-amber-950">
                      Your chances of being selected are much lower without it, because everything in the program happens on
                      LinkedIn. You can still apply.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href="https://www.linkedin.com/signup"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => logFunnelStep("creators_no_linkedin_create")}
                        className="inline-flex min-h-11 items-center rounded-xl border-2 border-neutral-900 bg-violet-600 px-4 py-2 font-bold text-white"
                      >
                        Create a LinkedIn profile
                      </a>
                      <button
                        type="button"
                        onClick={addLinkedinAfterAll}
                        className="inline-flex min-h-11 items-center rounded-xl border-2 border-neutral-900 bg-white px-4 py-2 font-bold text-neutral-900"
                      >
                        I have LinkedIn after all
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-neutral-600 font-satoshi">
                      This is where you're starting from. The fellowship is about growing it, so small numbers are completely fine.
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
                      {full ? (
                        <label className="mt-3 flex cursor-pointer items-start gap-3 font-satoshi">
                          <input
                            type="checkbox"
                            name="noLinkedin"
                            value="yes"
                            checked={form.noLinkedin}
                            onChange={(e) => update("noLinkedin", e.target.checked)}
                            className="mt-1 h-5 w-5 shrink-0 accent-violet-600"
                          />
                          <span className="text-neutral-800">
                            I don't have LinkedIn.{" "}
                            <span className="text-neutral-600">
                              The chance of you getting selected for the fellowship drastically decreases without it, but you
                              can still apply. Leave the LinkedIn questions empty.
                            </span>
                          </span>
                        </label>
                      ) : (
                        <button
                          type="button"
                          onClick={openNoLinkedin}
                          className="mt-2 min-h-11 text-sm font-semibold text-violet-700 underline underline-offset-2 font-satoshi"
                        >
                          I don't have LinkedIn
                        </button>
                      )}
                    </div>
                    {choices({ f: "connections", options: CONNECTIONS, legend: "About how many connections do you have?", required: true })}
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
                    {choices({ f: "crossed1k", options: CROSSED_1K, legend: "Has any of your posts crossed 1,000 impressions?", required: true })}
                  </>
                )}
              </div>
            )}

            {(full || step === 2) && (
              <div className={`grid gap-7${full ? " mt-12 border-t-2 border-neutral-200 pt-10" : ""}`}>
                {full && <h4 className="text-xl font-bold text-neutral-900 font-clash">{STEPS[2].title}</h4>}
                <p className="text-neutral-600 font-satoshi">
                  The fellowship helps you learn distribution, opens a path to a growth internship at Studojo, and puts your
                  profile in front of people hiring. Tell us what matters to you.
                </p>
                <fieldset aria-describedby={err("fellowshipGoals") ? "ugc-fellowshipGoals-error" : undefined}>
                  <legend className={LABEL}>
                    What do you want from the fellowship?{REQUIRED}
                  </legend>
                  <p className={HINT}>Pick all that apply.</p>
                  <div className="flex flex-wrap gap-2">
                    {FELLOWSHIP_GOALS.map((g, i) => {
                      const on = form.fellowshipGoals.includes(g);
                      return (
                        <label key={g} className="cursor-pointer">
                          <input
                            type="checkbox"
                            id={`ugc-fellowshipGoals-${i}`}
                            name="fellowshipGoals"
                            value={g}
                            checked={on}
                            onChange={() => toggleGoal(g)}
                            className="peer sr-only"
                          />
                          <span className="inline-flex min-h-11 select-none items-center rounded-full border-2 border-neutral-900 bg-white px-4 py-2 text-base font-medium text-neutral-900 transition-colors hover:bg-violet-50 peer-checked:bg-violet-600 peer-checked:hover:bg-violet-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 font-satoshi">
                            {on && <FiCheck aria-hidden="true" className="mr-1.5 h-4 w-4" />}
                            {g}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errorText("fellowshipGoals")}
                </fieldset>
                {choices({
                  f: "internInterest",
                  options: INTERN_INTEREST,
                  legend: "Would you like to be considered for a growth internship at Studojo?",
                  hint: "Studojo hires its growth interns from the fellowship. Fellows who do well get first preference.",
                  required: true,
                })}
                {choices({
                  f: "networkShare",
                  options: NETWORK_SHARE,
                  legend: "Can we share your profile with people in our network who are hiring?",
                  hint: "If Studojo isn't the right fit, this is how strong fellows find other opportunities.",
                  required: true,
                })}
                <p className="text-neutral-600 font-satoshi">And where are you headed next?</p>
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
                    name="dreamCompanies"
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
                      // Without a script the limit can't be kept live, so the server checks it instead.
                      const atMax = !on && form.topics.length >= LIMITS.topicsMax && !full;
                      return (
                        <label key={t} className={atMax ? "cursor-not-allowed opacity-40" : "cursor-pointer"}>
                          <input
                            type="checkbox"
                            id={`ugc-topics-${i}`}
                            name="topics"
                            value={t}
                            checked={on}
                            disabled={atMax}
                            onChange={() => toggleTopic(t)}
                            className="peer sr-only"
                          />
                          <span className="inline-flex min-h-11 select-none items-center rounded-full border-2 border-neutral-900 bg-white px-4 py-2 text-base font-medium text-neutral-900 transition-colors hover:bg-violet-50 peer-checked:bg-violet-600 peer-checked:hover:bg-violet-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 font-satoshi">
                            {on && <FiCheck aria-hidden="true" className="mr-1.5 h-4 w-4" />}
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
                    name="avoidTopics"
                    className={INPUT}
                    maxLength={LIMITS.avoid}
                    value={form.avoidTopics}
                    onChange={(e) => update("avoidTopics", e.target.value)}
                  />
                </div>
              </div>
            )}

            {(full || step === 3) && (
              <div className={`grid gap-7${full ? " mt-12 border-t-2 border-neutral-200 pt-10" : ""}`}>
                {full && <h4 className="text-xl font-bold text-neutral-900 font-clash">{STEPS[3].title}</h4>}
                <p className="text-neutral-600 font-satoshi">Almost done.</p>
                {choices({ f: "canCommit", options: CAN_COMMIT, legend: "Fellows post 3 times a week. Can you do that for at least 4 weeks?", required: true })}
                {choices({
                  f: "studojoOk",
                  options: STUDOJO_OK,
                  legend: "Some of your posts will be about how you use Studojo. Is that okay?",
                  hint: "It's always about your real experience, and labelled as a partnership. We never ask you to say something that isn't true.",
                  required: true,
                })}
                <div>
                  <label htmlFor="ugc-whyJoin" className={LABEL}>
                    Why do you want to join the fellowship?{REQUIRED}
                  </label>
                  <textarea
                    {...a11y("whyJoin")}
                    className={`${INPUT} min-h-[110px] resize-y`}
                    placeholder="A line or two is plenty."
                    maxLength={LIMITS.why}
                    value={form.whyJoin}
                    onChange={(e) => update("whyJoin", e.target.value)}
                  />
                  <div className="mt-1 flex justify-between text-sm text-neutral-500 font-satoshi">
                    <span>
                      {form.whyJoin.trim().length > 0 && form.whyJoin.trim().length < LIMITS.whyMin
                        ? `${LIMITS.whyMin - form.whyJoin.trim().length} more characters`
                        : ""}
                    </span>
                    <span>
                      {form.whyJoin.length}/{LIMITS.why}
                    </span>
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
                      name="referralSource"
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
                      name="referredBy"
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
                      value="yes"
                      checked={form.consent}
                      onChange={(e) => update("consent", e.target.checked)}
                      className="mt-1 h-5 w-5 shrink-0 accent-violet-600"
                    />
                    <span className="text-neutral-800">
                      Studojo can contact me on WhatsApp and email about the Growth Fellowship, and I agree to the{" "}
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
                {full ? "Submit application" : step < STEPS.length - 1 ? "Next" : submitting ? "Sending..." : "Submit application"}
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
                    .
                  </>
                )}
              </p>
            </details>
          ))}
        </div>
      </section>

      {noLinkedinOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeNoLinkedin();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ugc-no-linkedin-title"
            aria-describedby="ugc-no-linkedin-body"
            className="w-full max-w-md rounded-[28px] border-2 border-neutral-900 bg-white p-6 shadow-brutal-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                aria-hidden="true"
                className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-neutral-900 bg-amber-100 text-amber-700"
              >
                <FiAlertCircle className="h-6 w-6" />
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={closeNoLinkedin}
                className="grid h-11 w-11 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100"
              >
                <FiX aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <h3 id="ugc-no-linkedin-title" className="mt-4 text-2xl font-bold text-neutral-900 font-clash">
              Oops!
            </h3>
            <p id="ugc-no-linkedin-body" className="mt-2 text-neutral-700 font-satoshi">
              The chance of you getting selected for the fellowship drastically decreases if you don't have LinkedIn.
              Everything in the program happens there.
            </p>
            <p className="mt-2 text-neutral-700 font-satoshi">
              You can set up a profile now and come back. Your answers stay saved on this device for a day.
            </p>
            <div className="mt-6 grid gap-3">
              <a
                ref={dialogPrimaryRef}
                href="https://www.linkedin.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  logFunnelStep("creators_no_linkedin_create");
                  setNoLinkedinOpen(false);
                }}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-600 px-5 py-3 text-lg font-bold text-white shadow-brutal font-clash"
              >
                Create a LinkedIn profile
              </a>
              <button
                type="button"
                onClick={closeNoLinkedin}
                className="min-h-12 rounded-2xl border-2 border-neutral-900 bg-white px-5 py-3 text-lg font-bold text-neutral-900 font-clash"
              >
                I have LinkedIn, go back
              </button>
              <button
                type="button"
                onClick={continueWithoutLinkedin}
                className="min-h-11 font-semibold text-neutral-600 underline underline-offset-2 font-satoshi"
              >
                Continue without LinkedIn
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
