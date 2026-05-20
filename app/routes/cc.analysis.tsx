import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router";
import { motion } from "framer-motion";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";

const CC_API = "/api/v1/cc";

type PriorityAction = {
  action: string;
  skill?: string;
  why_it_matters?: string;
  priority?: string;
  linked_tool?: string | null;
};

type DnaCard = {
  readiness_score: number;
  clarity_score?: number;
  reply_probability?: number;
  emotional_state?: string;
  priority_actions?: PriorityAction[];
  skills_to_build?: { skill: string; why_it_matters?: string; how_to_close?: string }[];
  target_companies?: { name: string; fit_reason?: string }[];
  skills_gap_score?: number;
  industry_gap_score?: number;
  experience_gap_score?: number;
};

type Dashboard = {
  student_id: string;
  student_name?: string;
  career_dna?: DnaCard;
  primary_path?: { path_name: string };
  priority_actions?: PriorityAction[];
  journey_stage?: string;
};

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x="44" y="49" textAnchor="middle" className="font-bold" fontSize="18" fill="#111">
          {score}
        </text>
      </svg>
      <span className="font-['Satoshi'] text-xs font-semibold text-neutral-500">{label}</span>
    </div>
  );
}

function GapBar({ label, score }: { label: string; score: number }) {
  const color =
    score < 30 ? "#10b981" : score < 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-['Satoshi'] text-sm text-neutral-700">{label}</span>
        <span
          className="font-['Satoshi'] text-xs font-bold"
          style={{ color }}
        >
          {score < 30 ? "Low gap" : score < 60 ? "Medium gap" : "High gap"}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function meta() {
  return [
    { title: "Your Career DNA | studojo" },
    { name: "description", content: "Your personalised career readiness report." },
  ];
}

export default function CcAnalysisPage() {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get("id");
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const sid =
      studentId ||
      (typeof window !== "undefined"
        ? localStorage.getItem("studojo_cc_student_id")
        : null);

    if (!sid) {
      setError("No student ID found. Please complete the chat first.");
      setLoading(false);
      return;
    }

    fetch(`${CC_API}/dashboard/${sid}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(
          "Could not load your analysis. Your profile may still be generating — please wait a moment and refresh."
        );
        setLoading(false);
      });
  }, [studentId]);

  const dna = data?.career_dna;
  const actions =
    dna?.priority_actions?.length
      ? dna.priority_actions
      : data?.priority_actions ?? [];
  const skillsGap = dna?.skills_gap_score ?? 0;
  const industryGap = dna?.industry_gap_score ?? 0;
  const expGap = dna?.experience_gap_score ?? 0;

  const readinessColor =
    (dna?.readiness_score ?? 0) >= 60
      ? "#10b981"
      : (dna?.readiness_score ?? 0) >= 35
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="w-full bg-white">
      <Header />

      <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-12 md:px-8 md:py-16">
        {loading && (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-violet-500" />
            <p className="font-['Satoshi'] text-sm text-neutral-500">
              Loading your Career DNA...
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-6 py-24 text-center">
            <p className="max-w-md font-['Satoshi'] text-base text-neutral-600">{error}</p>
            <Link
              to="/cc/chat"
              className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-500 px-8 font-['Satoshi'] text-sm font-semibold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              Go back to chat
            </Link>
          </div>
        )}

        {!loading && !error && data && (
          <div className="flex flex-col gap-8">
            {/* Header row */}
            <motion.div
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                <span className="font-['Satoshi'] text-xs font-semibold uppercase tracking-widest text-violet-600">
                  Career DNA Report
                </span>
              </div>
              <h1 className="font-['Clash_Display'] text-2xl font-semibold text-neutral-900 md:text-3xl">
                {data.student_name
                  ? `${data.student_name}'s Career DNA`
                  : "Your Career DNA"}
              </h1>
              {data.primary_path?.path_name && (
                <p className="font-['Satoshi'] text-sm text-neutral-500">
                  Target role: {data.primary_path.path_name}
                </p>
              )}
            </motion.div>

            {dna ? (
              <>
                {/* DNA card */}
                <motion.div
                  className="rounded-2xl border-2 border-neutral-900 bg-gradient-to-br from-violet-700 via-purple-700 to-violet-800 p-6 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] md:p-8"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-3">
                      <p className="font-['Satoshi'] text-xs font-semibold uppercase tracking-widest text-white/70">
                        Readiness Score
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="font-['Clash_Display'] text-7xl font-bold"
                          style={{ color: readinessColor }}
                        >
                          {dna.readiness_score}
                        </span>
                        <span className="font-['Satoshi'] text-xl text-white/50">/100</span>
                      </div>
                      {dna.emotional_state && (
                        <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 font-['Satoshi'] text-xs font-medium text-white">
                          {dna.emotional_state}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-6">
                      {dna.clarity_score != null && (
                        <ScoreRing
                          score={dna.clarity_score}
                          label="Clarity"
                          color="#a78bfa"
                        />
                      )}
                      {dna.reply_probability != null && (
                        <ScoreRing
                          score={dna.reply_probability}
                          label="Reply chance"
                          color="#34d399"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Gap analysis */}
                {(skillsGap > 0 || industryGap > 0 || expGap > 0) && (
                  <motion.div
                    className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <h2 className="mb-5 font-['Clash_Display'] text-lg font-semibold text-neutral-900">
                      Gap Analysis
                    </h2>
                    <div className="flex flex-col gap-4">
                      <GapBar label="Skills gap" score={skillsGap} />
                      <GapBar label="Industry knowledge gap" score={industryGap} />
                      <GapBar label="Experience gap" score={expGap} />
                    </div>
                  </motion.div>
                )}

                {/* Priority actions */}
                {actions.length > 0 && (
                  <motion.div
                    className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <h2 className="mb-5 font-['Clash_Display'] text-lg font-semibold text-neutral-900">
                      Your Roadmap
                    </h2>
                    <div className="flex flex-col gap-3">
                      {actions.slice(0, 6).map((a, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 rounded-xl border-2 border-neutral-100 bg-neutral-50 p-4"
                        >
                          <div
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                              a.priority === "high"
                                ? "border-red-300 bg-red-50 text-red-600"
                                : a.priority === "medium"
                                ? "border-amber-300 bg-amber-50 text-amber-600"
                                : "border-neutral-300 bg-white text-neutral-500"
                            }`}
                          >
                            {i + 1}
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="font-['Satoshi'] text-sm font-semibold text-neutral-900">
                              {a.action || a.skill}
                            </p>
                            {a.why_it_matters && (
                              <p className="font-['Satoshi'] text-xs leading-5 text-neutral-500">
                                {a.why_it_matters}
                              </p>
                            )}
                            {a.linked_tool === "resume_maker" && (
                              <Link
                                to="/dojos/careers"
                                className="mt-1 inline-flex w-fit items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 font-['Satoshi'] text-xs font-semibold text-violet-700 hover:bg-violet-100"
                              >
                                Open Resume Maker
                              </Link>
                            )}
                            {a.linked_tool === "outreach_dojo" && (
                              <Link
                                to="/outreach"
                                className="mt-1 inline-flex w-fit items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 font-['Satoshi'] text-xs font-semibold text-violet-700 hover:bg-violet-100"
                              >
                                Open Outreach Dojo
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Target companies */}
                {dna.target_companies && dna.target_companies.length > 0 && (
                  <motion.div
                    className="rounded-2xl border-2 border-neutral-900 bg-purple-50 p-6"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <h2 className="mb-4 font-['Clash_Display'] text-lg font-semibold text-neutral-900">
                      Target Companies
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {dna.target_companies.slice(0, 8).map((c, i) => (
                        <span
                          key={i}
                          className="rounded-xl border-2 border-neutral-900 bg-white px-3 py-1.5 font-['Satoshi'] text-sm font-semibold text-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-6 rounded-2xl border-2 border-neutral-900 bg-neutral-50 py-16 text-center">
                <p className="max-w-sm font-['Satoshi'] text-base text-neutral-600">
                  Your Career DNA is still generating. Keep chatting with the coach to
                  complete your profile.
                </p>
                <Link
                  to="/cc/chat"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-500 px-8 font-['Satoshi'] text-sm font-semibold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  Continue chatting
                </Link>
              </div>
            )}

            {/* Back to chat */}
            <div className="flex justify-center gap-4">
              <Link
                to="/cc/chat"
                className="inline-flex h-11 items-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white px-6 font-['Satoshi'] text-sm font-semibold text-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                Back to chat
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
