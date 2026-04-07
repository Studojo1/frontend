"use client";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { FiZap, FiArrowLeft, FiDownload, FiTrash2, FiExternalLink } from "react-icons/fi";
import { toast } from "sonner";

export function meta() {
  return [{ title: "My Pipeline - Career Ops Dojo | Studojo" }];
}

const STATUSES = [
  { value: "evaluating", label: "Evaluating", color: "bg-neutral-100 text-neutral-600" },
  { value: "evaluated", label: "Evaluated", color: "bg-blue-50 text-blue-700" },
  { value: "to_apply", label: "To Apply", color: "bg-amber-50 text-amber-700" },
  { value: "applied", label: "Applied", color: "bg-violet-50 text-violet-700" },
  { value: "interview", label: "Interview", color: "bg-emerald-50 text-emerald-700" },
  { value: "offer", label: "Offer", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-50 text-red-600" },
  { value: "ghosted", label: "Ghosted", color: "bg-neutral-100 text-neutral-500" },
  { value: "withdrawn", label: "Withdrawn", color: "bg-neutral-100 text-neutral-400" },
];

function statusStyle(value: string) {
  return STATUSES.find((s) => s.value === value)?.color || "bg-neutral-100 text-neutral-600";
}

function statusLabel(value: string) {
  return STATUSES.find((s) => s.value === value)?.label || value;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (!score) return null;
  const color = score >= 4 ? "text-emerald-600" : score >= 3 ? "text-amber-500" : "text-red-500";
  return <span className={`font-['Clash_Display'] text-lg font-bold ${color}`}>{score}/5</span>;
}

export default function PipelinePage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadPipeline();
  }, []);

  const loadPipeline = async () => {
    try {
      const res = await fetch("/api/career-ops/pipeline");
      const data = await res.json();
      setApps(data.applications || []);
    } catch {
      toast.error("Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId: number, status: string) => {
    setUpdatingStatus(appId);
    try {
      const res = await fetch(`/api/career-ops/pipeline/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
      if (selectedApp?.id === appId) setSelectedApp((a: any) => ({ ...a, status }));
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteApp = async (appId: number) => {
    if (!confirm("Remove this application from your pipeline?")) return;
    await fetch(`/api/career-ops/pipeline/${appId}`, { method: "DELETE" });
    setApps((prev) => prev.filter((a) => a.id !== appId));
    if (selectedApp?.id === appId) setSelectedApp(null);
  };

  const downloadPDF = async (app: any) => {
    setGeneratingPDF(app.id);
    try {
      const res = await fetch("/api/career-ops/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: app.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "PDF failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-${app.company?.toLowerCase().replace(/\s+/g, "-") || "career-ops"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGeneratingPDF(null);
    }
  };

  const filtered = filterStatus === "all" ? apps : apps.filter((a) => a.status === filterStatus);

  const metrics = {
    total: apps.length,
    applied: apps.filter((a) => ["applied", "interview", "offer"].includes(a.status)).length,
    interview: apps.filter((a) => a.status === "interview").length,
    offer: apps.filter((a) => a.status === "offer").length,
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dojos/career-ops" className="inline-flex items-center gap-1.5 font-['Satoshi'] text-sm text-neutral-500 hover:text-neutral-900">
                <FiArrowLeft className="h-3 w-3" /> Career Ops
              </Link>
              <h1 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900">My Pipeline</h1>
            </div>
            <Link
              to="/dojos/career-ops/evaluate"
              className="flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-neutral-900 px-4 py-2 font-['Satoshi'] text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              <FiZap className="h-3.5 w-3.5" />
              Evaluate job
            </Link>
          </div>

          {/* Metrics */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            {[
              { label: "Total evaluated", value: metrics.total },
              { label: "Applied", value: metrics.applied },
              { label: "Interviews", value: metrics.interview },
              { label: "Offers", value: metrics.offer },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl border-2 border-neutral-900 bg-white p-4 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
                <div className="font-['Clash_Display'] text-3xl font-bold text-neutral-900">{m.value}</div>
                <div className="font-['Satoshi'] text-xs text-neutral-500 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-6">
            {/* List */}
            <div className="flex-1">
              {/* Filter */}
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`rounded-lg border px-3 py-1.5 font-['Satoshi'] text-xs font-semibold transition ${filterStatus === "all" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"}`}
                >
                  All ({apps.length})
                </button>
                {STATUSES.filter((s) => apps.some((a) => a.status === s.value)).map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setFilterStatus(s.value)}
                    className={`rounded-lg border px-3 py-1.5 font-['Satoshi'] text-xs font-semibold transition ${filterStatus === s.value ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"}`}
                  >
                    {s.label} ({apps.filter((a) => a.status === s.value).length})
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="font-['Satoshi'] text-sm text-neutral-400 py-8 text-center">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-neutral-300 p-12 text-center">
                  <div className="font-['Clash_Display'] text-lg font-bold text-neutral-400">No applications yet</div>
                  <p className="mt-2 font-['Satoshi'] text-sm text-neutral-400">Every job you evaluate is automatically added here.</p>
                  <Link to="/dojos/career-ops/evaluate" className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-neutral-900 px-5 py-2.5 font-['Satoshi'] text-sm font-bold text-white">
                    <FiZap className="h-3.5 w-3.5" /> Evaluate your first job
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                      className={`cursor-pointer rounded-2xl border-2 bg-white p-4 transition-all ${selectedApp?.id === app.id ? "border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]" : "border-neutral-200 hover:border-neutral-400"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-['Satoshi'] text-sm font-bold text-neutral-900 truncate">{app.company}</div>
                          <div className="font-['Satoshi'] text-xs text-neutral-500 truncate">{app.role}</div>
                          <div className="mt-1 font-['Satoshi'] text-xs text-neutral-400">{new Date(app.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <ScoreBadge score={app.score} />
                          <span className={`rounded-full px-2 py-0.5 font-['Satoshi'] text-xs font-semibold ${statusStyle(app.status)}`}>
                            {statusLabel(app.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selectedApp && (
              <div className="w-80 flex-shrink-0">
                <div className="sticky top-4 rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="font-['Satoshi'] text-sm font-bold text-neutral-900">{selectedApp.company}</div>
                      <div className="font-['Satoshi'] text-xs text-neutral-500">{selectedApp.role}</div>
                    </div>
                    <ScoreBadge score={selectedApp.score} />
                  </div>

                  {/* Status selector */}
                  <div className="mb-4">
                    <div className="mb-1.5 font-['Satoshi'] text-xs font-semibold text-neutral-500">Status</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {STATUSES.map((s) => (
                        <button
                          key={s.value}
                          onClick={(e) => { e.stopPropagation(); updateStatus(selectedApp.id, s.value); }}
                          disabled={updatingStatus === selectedApp.id}
                          className={`rounded-lg border px-2 py-1.5 font-['Satoshi'] text-xs font-semibold transition ${
                            selectedApp.status === s.value
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {selectedApp.job_url && (
                      <a
                        href={selectedApp.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-neutral-200 bg-white px-3 py-2 font-['Satoshi'] text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <FiExternalLink className="h-3 w-3" /> View job posting
                      </a>
                    )}
                    <button
                      onClick={() => downloadPDF(selectedApp)}
                      disabled={generatingPDF === selectedApp.id}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-neutral-900 bg-neutral-900 px-3 py-2 font-['Satoshi'] text-xs font-bold text-white disabled:opacity-50"
                    >
                      <FiDownload className="h-3 w-3" />
                      {generatingPDF === selectedApp.id ? "Generating..." : "Download tailored CV"}
                    </button>
                    <button
                      onClick={() => deleteApp(selectedApp.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-['Satoshi'] text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      <FiTrash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>

                  {/* Report preview */}
                  {selectedApp.report_content && (
                    <div className="mt-4 border-t border-neutral-100 pt-4">
                      <div className="font-['Satoshi'] text-xs font-semibold text-neutral-500 mb-2">Evaluation summary</div>
                      <div className="font-['Satoshi'] text-xs text-neutral-600 line-clamp-6 leading-relaxed">
                        {selectedApp.report_content.slice(0, 400)}...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
