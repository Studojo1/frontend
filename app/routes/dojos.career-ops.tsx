"use client";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Header, Footer } from "~/components";
import { FiZap, FiFileText, FiTrendingUp, FiUpload, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";

export function meta() {
  const BASE_URL = "https://studojo.com";
  return [
    { title: "Career Ops Dojo - AI Job Search Command Center | Studojo" },
    { name: "description", content: "Evaluate job offers with AI, generate tailored ATS-optimised CVs, and track your application pipeline. Built on career-ops." },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/dojos/career-ops` },
    { property: "og:title", content: "Career Ops Dojo - AI Job Search Command Center | Studojo" },
    { property: "og:description", content: "AI-powered job evaluation, tailored CV generation, and pipeline tracking. Free for students." },
  ];
}

export default function CareerOpsDojo() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cvText, setCvText] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [step, setStep] = useState<"check" | "setup" | "ready">("check");

  useEffect(() => {
    fetch("/api/career-ops/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile?.cv_markdown) {
          setProfile(d.profile);
          setStep("ready");
        } else {
          setStep("setup");
        }
      })
      .catch(() => setStep("setup"))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    if (!cvText.trim()) return toast.error("Paste your CV first");
    setSavingProfile(true);
    try {
      const res = await fetch("/api/career-ops/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_markdown: cvText }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfile(data.profile);
      setStep("ready");
      toast.success("Profile saved. You're ready.");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-neutral-400 text-sm">Loading...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50">
        {/* Hero */}
        <section className="border-b-2 border-neutral-900 bg-white px-4 py-16 md:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-neutral-900 bg-neutral-900 px-4 py-1.5 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
              Career Ops Dojo
            </div>
            <h1 className="font-['Clash_Display'] text-4xl font-bold leading-tight text-neutral-900 md:text-5xl">
              Your AI job search<br />command center.
            </h1>
            <p className="mt-4 max-w-2xl font-['Satoshi'] text-lg text-neutral-600">
              Paste a job URL. Get a structured A-F evaluation, a tailored ATS CV, and interview prep in under 60 seconds. Track everything in one place.
            </p>

            {step === "ready" && (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/dojos/career-ops/evaluate"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-neutral-900 px-6 py-3 font-['Satoshi'] text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                >
                  <FiZap className="h-4 w-4" />
                  Evaluate a Job
                </Link>
                <Link
                  to="/dojos/career-ops/pipeline"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-white px-6 py-3 font-['Satoshi'] text-sm font-bold text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                >
                  <FiTrendingUp className="h-4 w-4" />
                  My Pipeline
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Setup flow */}
        {step === "setup" && (
          <section className="mx-auto max-w-3xl px-4 py-12 md:px-8">
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              <div className="mb-2 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-500">Step 1 of 1</div>
              <h2 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900">Paste your CV</h2>
              <p className="mt-2 font-['Satoshi'] text-sm text-neutral-500">
                Career Ops reads your CV every time it evaluates a role. Paste it as plain text or markdown below. You can update it anytime.
              </p>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder={`Full Name\nEmail | LinkedIn | Location\n\nWork Experience\n...\n\nEducation\n...\n\nSkills\n...`}
                rows={16}
                className="mt-4 w-full resize-none rounded-xl border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-['Satoshi'] text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
              />
              <button
                onClick={saveProfile}
                disabled={savingProfile || !cvText.trim()}
                className="mt-4 flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-neutral-900 px-6 py-3 font-['Satoshi'] text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] disabled:opacity-50 disabled:pointer-events-none"
              >
                <FiCheckCircle className="h-4 w-4" />
                {savingProfile ? "Saving..." : "Save and continue"}
              </button>
            </div>
          </section>
        )}

        {/* Features grid */}
        {step === "ready" && (
          <section className="mx-auto max-w-4xl px-4 py-12 md:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: <FiZap className="h-6 w-6" />,
                  title: "6-Block Evaluation",
                  desc: "Role summary, CV match, level strategy, comp research, personalisation plan, interview prep. Every time.",
                  href: "/dojos/career-ops/evaluate",
                  cta: "Evaluate a role",
                },
                {
                  icon: <FiFileText className="h-6 w-6" />,
                  title: "Tailored ATS CV",
                  desc: "Keyword-injected, single-column PDF. Generated per job description. Takes 30 seconds.",
                  href: "/dojos/career-ops/evaluate",
                  cta: "Generate CV",
                },
                {
                  icon: <FiTrendingUp className="h-6 w-6" />,
                  title: "Pipeline Tracker",
                  desc: "Every evaluated role is automatically logged. Track status from evaluated to offer.",
                  href: "/dojos/career-ops/pipeline",
                  cta: "View pipeline",
                },
              ].map((f) => (
                <Link
                  key={f.title}
                  to={f.href}
                  className="group flex flex-col rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-900 bg-neutral-900 text-white">
                    {f.icon}
                  </div>
                  <h3 className="font-['Clash_Display'] text-lg font-bold text-neutral-900">{f.title}</h3>
                  <p className="mt-2 flex-1 font-['Satoshi'] text-sm text-neutral-600">{f.desc}</p>
                  <div className="mt-4 flex items-center gap-1 font-['Satoshi'] text-sm font-semibold text-neutral-900 group-hover:underline">
                    {f.cta} <FiArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Update CV */}
            <div className="mt-6 rounded-2xl border-2 border-dashed border-neutral-300 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-['Satoshi'] text-sm font-semibold text-neutral-700">Your CV is saved</div>
                  <div className="font-['Satoshi'] text-xs text-neutral-400 mt-0.5">Last updated: {new Date(profile?.updated_at).toLocaleDateString()}</div>
                </div>
                <button
                  onClick={() => setStep("setup")}
                  className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 font-['Satoshi'] text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  <FiUpload className="h-3 w-3" />
                  Update CV
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
