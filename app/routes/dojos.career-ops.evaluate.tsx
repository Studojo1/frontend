"use client";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Header, Footer } from "~/components";
import { FiZap, FiLink, FiFileText, FiArrowLeft, FiDownload } from "react-icons/fi";
import { toast } from "sonner";

export function meta() {
  return [{ title: "Evaluate a Job - Career Ops Dojo | Studojo" }];
}

type Stage = "input" | "evaluating" | "result";

export default function EvaluatePage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("input");
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [jobUrl, setJobUrl] = useState("");
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<{ app: any; report: any; score: number | null } | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const evaluate = async () => {
    const body: any = {};
    if (inputMode === "url") {
      if (!jobUrl.trim()) return toast.error("Enter a job URL");
      body.job_url = jobUrl.trim();
    } else {
      if (!jdText.trim()) return toast.error("Paste the job description");
      body.jd_text = jdText.trim();
    }

    setStage("evaluating");
    try {
      const res = await fetch("/api/career-ops/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      setResult(data);
      setStage("result");
    } catch (e: any) {
      toast.error(e.message || "Evaluation failed");
      setStage("input");
    }
  };

  const downloadPDF = async () => {
    if (!result) return;
    setGeneratingPDF(true);
    try {
      const res = await fetch("/api/career-ops/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: result.app.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "PDF generation failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-${result.app.company?.toLowerCase().replace(/\s+/g, "-") || "career-ops"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (e: any) {
      toast.error(e.message || "PDF generation failed");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const scoreColor = (s: number | null) => {
    if (!s) return "text-neutral-400";
    if (s >= 4) return "text-emerald-600";
    if (s >= 3) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">

          {/* Back */}
          <Link to="/dojos/career-ops" className="mb-6 inline-flex items-center gap-1.5 font-['Satoshi'] text-sm text-neutral-500 hover:text-neutral-900">
            <FiArrowLeft className="h-3 w-3" /> Career Ops
          </Link>

          {stage === "input" && (
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              <h1 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900">Evaluate a job</h1>
              <p className="mt-1 font-['Satoshi'] text-sm text-neutral-500">Paste a URL or the full job description. Career Ops will produce a 6-block evaluation matched against your CV.</p>

              {/* Mode toggle */}
              <div className="mt-6 flex gap-2">
                {(["url", "text"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setInputMode(m)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 font-['Satoshi'] text-sm font-semibold transition ${
                      inputMode === m
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {m === "url" ? <FiLink className="h-3.5 w-3.5" /> : <FiFileText className="h-3.5 w-3.5" />}
                    {m === "url" ? "Job URL" : "Paste JD"}
                  </button>
                ))}
              </div>

              {inputMode === "url" ? (
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://jobs.lever.co/company/role-id"
                  className="mt-4 w-full rounded-xl border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-['Satoshi'] text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                />
              ) : (
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={12}
                  className="mt-4 w-full resize-none rounded-xl border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-['Satoshi'] text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                />
              )}

              <button
                onClick={evaluate}
                className="mt-4 flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-neutral-900 px-6 py-3 font-['Satoshi'] text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
              >
                <FiZap className="h-4 w-4" />
                Evaluate
              </button>
            </div>
          )}

          {stage === "evaluating" && (
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-10 text-center shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-neutral-900">
                <FiZap className="h-7 w-7 animate-pulse text-white" />
              </div>
              <div className="font-['Clash_Display'] text-xl font-bold text-neutral-900">Evaluating...</div>
              <p className="mt-2 font-['Satoshi'] text-sm text-neutral-500">Reading the JD, matching against your CV, researching comp data. Usually under 30 seconds.</p>
              <div className="mt-6 space-y-2 text-left">
                {["Extracting job requirements", "Matching against your CV", "Detecting role archetype", "Running compensation research", "Writing 6-block report"].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 font-['Satoshi'] text-sm text-neutral-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-300 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {stage === "result" && result && (
            <div>
              {/* Score card */}
              <div className="mb-6 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-500">Evaluation complete</div>
                    <h2 className="mt-1 font-['Clash_Display'] text-xl font-bold text-neutral-900">
                      {result.app.company} — {result.app.role}
                    </h2>
                    {result.app.archetype && (
                      <div className="mt-1 font-['Satoshi'] text-sm text-neutral-500">{result.app.archetype}</div>
                    )}
                  </div>
                  {result.score && (
                    <div className="text-right">
                      <div className={`font-['Clash_Display'] text-4xl font-bold ${scoreColor(result.score)}`}>
                        {result.score}/5
                      </div>
                      <div className="font-['Satoshi'] text-xs text-neutral-400">match score</div>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={downloadPDF}
                    disabled={generatingPDF}
                    className="flex items-center gap-2 rounded-lg border-2 border-neutral-900 bg-neutral-900 px-4 py-2 font-['Satoshi'] text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <FiDownload className="h-3.5 w-3.5" />
                    {generatingPDF ? "Generating..." : "Download tailored CV"}
                  </button>
                  <Link
                    to="/dojos/career-ops/pipeline"
                    className="flex items-center gap-2 rounded-lg border-2 border-neutral-200 bg-white px-4 py-2 font-['Satoshi'] text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    View in pipeline
                  </Link>
                  <button
                    onClick={() => { setStage("input"); setJobUrl(""); setJdText(""); setResult(null); }}
                    className="flex items-center gap-2 rounded-lg border-2 border-neutral-200 bg-white px-4 py-2 font-['Satoshi'] text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Evaluate another
                  </button>
                </div>
              </div>

              {/* Report */}
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Full evaluation report</div>
                <div
                  className="prose prose-sm max-w-none font-['Satoshi'] prose-headings:font-['Clash_Display'] prose-headings:text-neutral-900 prose-strong:text-neutral-900 prose-table:text-sm"
                  dangerouslySetInnerHTML={{ __html: markdownToHTML(result.report.content) }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// Minimal markdown to HTML converter for report display
function markdownToHTML(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\| (.+) \|$/gm, (line) => {
      const cells = line.split('|').slice(1, -1).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .replace(/(<tr>.*<\/tr>\n?)+/gs, (rows) => `<table class="w-full border-collapse text-sm">${rows}</table>`)
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, (items) => `<ul>${items}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[htupl])/gm, '')
    .replace(/(<\/h[123]>|<\/table>|<\/ul>)/g, '$1\n');
}
