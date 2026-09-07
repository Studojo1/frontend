import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  FiArrowRight, FiCheck, FiPhone, FiSearch, FiClock, FiShield, FiUsers,
} from "react-icons/fi";
import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";
import type { Route } from "./+types/sensei";

const BASE_URL = "https://studojo.com";
const TITLE = "Sensei by Studojo | Hiring intelligence for placement teams";
const DESC =
  "Sensei finds the companies hiring your students right now, the person to speak to, and why they are worth calling this week. Built for placement and T&P teams.";

export function meta({}: Route.MetaArgs) {
  return [
    { title: TITLE },
    { name: "description", content: DESC },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/sensei` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESC },
    { property: "og:url", content: `${BASE_URL}/sensei` },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: TITLE },
    { name: "twitter:description", content: DESC },
  ];
}

const fadeUp = {
  hidden: { opacity: 1, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};
const stagger = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const CAPABILITIES = [
  {
    icon: FiSearch,
    title: "Companies hiring right now",
    body: "Describe the mandate in plain English: the role, the city, the pay band, how fresh the posting has to be. Sensei searches live postings and hiring signals and comes back with companies that are actually recruiting, not a directory scraped last year.",
    iconBg: "bg-violet-200",
  },
  {
    icon: FiUsers,
    title: "The person to actually call",
    body: "Every company arrives with a named hiring-side contact, their role, and a verified number where possible. Not info@ and not a switchboard. If we cannot reach a real person at a company, we say so instead of padding the list.",
    iconBg: "bg-emerald-200",
  },
  {
    icon: FiClock,
    title: "Why this company, this week",
    body: "Each row carries its evidence: the posting, the announcement, the hiring signal it came from. Your team opens a call knowing what changed at that company recently, which is the difference between a cold call and a relevant one.",
    iconBg: "bg-amber-200",
  },
  {
    icon: FiShield,
    title: "Nothing invented",
    body: "A contact only appears if a provider actually returned it. If there is no number, the row says so. A plausible-looking wrong number costs your team a morning, so we would rather hand back an empty cell than a guess.",
    iconBg: "bg-rose-200",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tell it the mandate",
    body: "\"Companies hiring Java developers in Pune, 0 to 2 years, 4 LPA and up, posted in the last two weeks.\" No filters to configure, no boolean strings to learn.",
  },
  {
    n: "02",
    title: "It does the work",
    body: "Sensei searches, verifies each company is genuinely hiring, resolves the right contact and scores how well each one fits what you asked for. You watch it work rather than waiting on a report.",
  },
  {
    n: "03",
    title: "Your team calls",
    body: "You get a table you can sort, filter and export, with the evidence attached to every row. Hand it to the placement team and they start dialling the same afternoon.",
  },
];

const PREVIEW_ROWS = [
  { co: "Torrent Power", role: "Java Developer", city: "Ahmedabad",
    who: "Hiring Manager", why: "12 open roles, posted 3 days ago" },
  { co: "Zluri", role: "Backend Engineer", city: "Bengaluru",
    who: "Talent Acquisition", why: "Series B, hiring across engineering" },
  { co: "Emitrr", role: "Full Stack (0 to 2 yrs)", city: "Remote",
    who: "Co-founder", why: "Posted this week, 4 LPA and up" },
];

/** What a finished search looks like. Deliberately shows the WHY column, since
 *  that is the part a placement team cannot get from a job board. */
function ResultPreview() {
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-neutral-900 bg-white shadow-[8px_8px_0px_0px_rgba(25,26,35,1)]">
      <div className="flex items-center gap-2 border-b-2 border-neutral-900 bg-neutral-100 px-5 py-3">
        <span className="h-3 w-3 rounded-full border border-neutral-900 bg-rose-400" />
        <span className="h-3 w-3 rounded-full border border-neutral-900 bg-amber-400" />
        <span className="h-3 w-3 rounded-full border border-neutral-900 bg-emerald-400" />
        <span className="ml-3 font-['Satoshi'] text-[13px] font-medium text-neutral-600">
          Java developers, Pune and Bengaluru, 0 to 2 years
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left font-['Satoshi']">
          <thead>
            <tr className="border-b border-neutral-200 bg-white">
              {["Company", "Role", "Contact", "Why now"].map((h) => (
                <th key={h} className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-neutral-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PREVIEW_ROWS.map((r) => (
              <tr key={r.co} className="border-b border-neutral-100 last:border-0">
                <td className="px-5 py-4">
                  <div className="text-[15px] font-semibold text-neutral-900">{r.co}</div>
                  <div className="text-[13px] text-neutral-500">{r.city}</div>
                </td>
                <td className="px-5 py-4 text-[14px] text-neutral-700">{r.role}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900 bg-emerald-100 px-2.5 py-1 text-[12px] font-medium text-neutral-800">
                    <FiPhone size={11} /> {r.who}
                  </span>
                </td>
                <td className="px-5 py-4 text-[13.5px] leading-5 text-neutral-600">{r.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t-2 border-neutral-900 bg-violet-50 px-5 py-3 font-['Satoshi'] text-[12.5px] text-neutral-600">
        Illustrative example. Every row in the product carries the evidence it came from.
      </div>
    </div>
  );
}

export default function SenseiPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden border-b border-neutral-900 bg-violet-500 py-12 md:py-16">
          <motion.div
            className="w-full"
            initial={{ opacity: 1, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Section width="narrow" className="mx-auto text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-white/40 bg-white/20 px-4 py-2">
                <span className="font-['Satoshi'] text-sm font-medium text-white">
                  For placement and T&amp;P teams
                </span>
              </div>
              <h1 className="font-['Clash_Display'] text-4xl font-medium leading-tight text-white md:text-6xl">
                Stop hunting for<br />
                <span className="text-yellow-300">who is hiring.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl font-['Satoshi'] text-lg font-normal leading-7 text-violet-100 md:text-xl">
                Sensei finds the companies recruiting for your students right now, the person
                to speak to, and the reason they are worth calling this week. Your team spends
                its time on conversations instead of research.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="#demo"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white px-8 font-['Satoshi'] text-base font-medium text-violet-600 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                >
                  Book a demo
                  <FiArrowRight />
                </a>
              </div>
            </Section>
          </motion.div>
        </section>

        {/* ── What you actually get, shown before it is described ──────── */}
        <section className="border-b border-neutral-900 bg-violet-500 pb-16 md:pb-24">
          <Section width="wide" className="mx-auto">
            <div className="-mt-4 md:-mt-8">
              <ResultPreview />
            </div>
          </Section>
        </section>

        {/* ── The problem ──────────────────────────────────────────────── */}
        <Section className="mx-auto py-20 md:py-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.h2
              variants={fadeUp}
              className="font-['Clash_Display'] text-4xl font-medium leading-[1.15] text-neutral-900 md:text-5xl"
            >
              Placement teams do not have a student problem.
              <br />
              They have a <span className="text-violet-600">company problem.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-7 font-['Satoshi'] text-lg leading-8 text-neutral-600 md:text-xl"
            >
              The batch is trained and ready. What takes the week is working out which companies
              are hiring for those exact skills, finding somebody there who will pick up, and
              getting to them before every other institute does. That research is the job, and
              it is the part nobody has time for.
            </motion.p>
          </motion.div>
        </Section>

        {/* ── Capabilities ─────────────────────────────────────────────── */}
        <section className="border-y border-neutral-900 bg-neutral-50 py-20 md:py-28">
          <Section className="mx-auto">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-6 md:grid-cols-2"
            >
              {CAPABILITIES.map((c) => (
                <motion.div
                  key={c.title}
                  variants={fadeUp}
                  className="rounded-3xl border-2 border-neutral-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] md:p-9"
                >
                  <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-neutral-900 ${c.iconBg}`}>
                    <c.icon className="text-neutral-900" size={24} />
                  </div>
                  <h3 className="font-['Clash_Display'] text-2xl font-medium text-neutral-900">
                    {c.title}
                  </h3>
                  <p className="mt-4 font-['Satoshi'] text-[16px] leading-7 text-neutral-600">
                    {c.body}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <Section className="mx-auto py-20 md:py-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.h2
              variants={fadeUp}
              className="text-center font-['Clash_Display'] text-4xl font-medium text-neutral-900 md:text-5xl"
            >
              Three steps, no training required
            </motion.h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((s) => (
                <motion.div key={s.n} variants={fadeUp} className="relative">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-500 font-['Clash_Display'] text-lg font-medium text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]">
                    {s.n}
                  </div>
                  <h3 className="mt-5 font-['Clash_Display'] text-2xl font-medium text-neutral-900">
                    {s.title}
                  </h3>
                  <p className="mt-3 font-['Satoshi'] text-[16px] leading-7 text-neutral-600">
                    {s.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* ── Pricing honesty ──────────────────────────────────────────── */}
        <section className="border-y border-neutral-900 bg-violet-500 py-20 md:py-28">
          <Section width="narrow" className="mx-auto text-center">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.div variants={fadeUp} className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/20">
                <FiPhone className="text-white" size={22} />
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="font-['Clash_Display'] text-4xl font-medium leading-[1.15] text-white md:text-5xl"
              >
                You only pay for contacts we find
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mx-auto mt-7 max-w-2xl font-['Satoshi'] text-lg leading-8 text-violet-100 md:text-xl"
              >
                Searching is included. A credit is only spent when we hand you a real contact,
                never for a miss, and never for a number that turns out to belong to a
                reception desk. If a list is longer than your balance we tell you exactly how
                many rows we did not touch, so nothing is spent quietly.
              </motion.p>
            </motion.div>
          </Section>
        </section>

        {/* ── Demo form ────────────────────────────────────────────────── */}
        <Section id="demo" className="mx-auto py-20 md:py-28">
          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.h2
                variants={fadeUp}
                className="font-['Clash_Display'] text-4xl font-medium leading-[1.15] text-neutral-900 md:text-5xl"
              >
                See it run on your<br />own mandate
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-6 font-['Satoshi'] text-[17px] leading-8 text-neutral-600"
              >
                Tell us the roles you are placing for and we will run a live search on that
                brief during the call, not a canned demo on somebody else's data. You will see
                the companies, the contacts and the evidence behind each one.
              </motion.p>
              <motion.ul variants={fadeUp} className="mt-7 space-y-3">
                {[
                  "A real search on your own placement brief",
                  "Straight answer on whether we can help you",
                  "No obligation, no credit card",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 border-neutral-900 bg-emerald-200">
                      <FiCheck size={11} className="text-neutral-900" />
                    </span>
                    <span className="font-['Satoshi'] text-[15px] text-neutral-700">{t}</span>
                  </li>
                ))}
              </motion.ul>
              <motion.p variants={fadeUp} className="mt-7 font-['Satoshi'] text-sm text-neutral-500">
                Prefer email? Write to{" "}
                <a href="mailto:admin@studojo.com" className="font-medium text-violet-600 underline">
                  admin@studojo.com
                </a>
                .
              </motion.p>
            </motion.div>

            <DemoForm />
          </div>
        </Section>

        {/* ── Close ────────────────────────────────────────────────────── */}
        <section className="border-t border-neutral-900 bg-neutral-900 py-14">
          <Section width="narrow" className="mx-auto text-center">
            <h2 className="font-['Clash_Display'] text-2xl font-medium text-white md:text-3xl">
              Work on things that matter.
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-['Satoshi'] text-[15px] leading-7 text-neutral-400">
              Sensei is part of Studojo, the platform behind the Internship Dojo, the resume
              builder and the outreach tools students already use.
            </p>
            <Link
              to="/"
              className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-white/30 px-6 font-['Satoshi'] text-[15px] font-medium text-white transition-colors hover:bg-white/10"
            >
              Explore Studojo
              <FiArrowRight />
            </Link>
          </Section>
        </section>
      </main>
      <Footer />
    </>
  );
}

function DemoForm() {
  const [form, setForm] = useState({
    name: "", workEmail: "", organisation: "", phone: "", cohortSize: "", note: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [allowPersonal, setAllowPersonal] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/sensei-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, allowPersonalEmail: allowPersonal }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        // A personal address is a nudge, not a rejection: let the next submit through.
        if (d?.needsConfirm) setAllowPersonal(true);
        throw new Error(d?.error || "Could not send that. Please try again.");
      }
      setDone(true);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl border-2 border-neutral-900 bg-emerald-50 p-8 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-emerald-200">
          <FiCheck className="text-neutral-900" size={20} />
        </div>
        <h3 className="font-['Clash_Display'] text-xl font-medium text-neutral-900">
          Got it, thank you.
        </h3>
        <p className="mt-3 font-['Satoshi'] text-[15px] leading-7 text-neutral-600">
          We will be in touch within one working day to set up a time. If it is urgent,
          write to{" "}
          <a href="mailto:admin@studojo.com" className="font-medium text-violet-600 underline">
            admin@studojo.com
          </a>{" "}
          and we will move faster.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border-2 border-neutral-900 px-4 py-3 font-['Satoshi'] text-[15px] focus:outline-none focus:ring-2 focus:ring-violet-500";

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border-2 border-neutral-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] md:p-9"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="sd-name" className="mb-1.5 block font-['Satoshi'] text-sm font-medium text-neutral-700">
            Your name
          </label>
          <input id="sd-name" required value={form.name} onChange={set("name")} className={field} />
        </div>
        <div>
          <label htmlFor="sd-org" className="mb-1.5 block font-['Satoshi'] text-sm font-medium text-neutral-700">
            Institute or company
          </label>
          <input id="sd-org" required value={form.organisation} onChange={set("organisation")} className={field} />
        </div>
        <div>
          <label htmlFor="sd-email" className="mb-1.5 block font-['Satoshi'] text-sm font-medium text-neutral-700">
            Work email
          </label>
          <input id="sd-email" type="email" required value={form.workEmail} onChange={set("workEmail")} className={field} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sd-phone" className="mb-1.5 block font-['Satoshi'] text-sm font-medium text-neutral-700">
              Phone <span className="text-neutral-400">(optional)</span>
            </label>
            <input id="sd-phone" value={form.phone} onChange={set("phone")} className={field} />
          </div>
          <div>
            <label htmlFor="sd-cohort" className="mb-1.5 block font-['Satoshi'] text-sm font-medium text-neutral-700">
              Batch size <span className="text-neutral-400">(optional)</span>
            </label>
            <input id="sd-cohort" placeholder="e.g. 60 per quarter" value={form.cohortSize} onChange={set("cohortSize")} className={field} />
          </div>
        </div>
        <div>
          <label htmlFor="sd-note" className="mb-1.5 block font-['Satoshi'] text-sm font-medium text-neutral-700">
            What are you placing for? <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea id="sd-note" rows={3} placeholder="Roles, cities, anything that would make the demo useful."
            value={form.note} onChange={set("note")}
            className={`${field} resize-none`} />
        </div>
      </div>

      {err && (
        <p className="mt-4 font-['Satoshi'] text-sm text-red-600">
          {err}
          {allowPersonal && " Press the button again to use it anyway."}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-violet-600 px-6 py-3.5 font-['Satoshi'] text-base font-medium text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] disabled:opacity-50"
      >
        {busy ? "Sending..." : "Request a demo"}
        {!busy && <FiArrowRight />}
      </button>
      <p className="mt-3 text-center font-['Satoshi'] text-xs text-neutral-500">
        We use this to contact you about Sensei. Nothing else.
      </p>
    </form>
  );
}
