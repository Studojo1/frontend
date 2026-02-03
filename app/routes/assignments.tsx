import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { redirect } from "react-router";
import { FiDownload, FiFileText, FiClock, FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import { Footer, Header } from "~/components";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import { getJobs, type JobResponse } from "~/lib/control-plane";
import { toast } from "sonner";
import type { Route } from "./+types/assignments";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (!onboardingStatus.complete) {
    throw redirect("/onboarding");
  }
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Orders – Studojo" },
    {
      name: "description",
      content: "View your assignment generation and document humanization history and download completed orders.",
    },
  ];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function getStatusBadge(status: string) {
  const baseClasses = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-['Satoshi'] text-xs font-medium leading-4";
  
  switch (status) {
    case "COMPLETED":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-700`}>
          <FiCheckCircle className="h-3.5 w-3.5" />
          Completed
        </span>
      );
    case "FAILED":
      return (
        <span className={`${baseClasses} bg-red-100 text-red-700`}>
          <FiXCircle className="h-3.5 w-3.5" />
          Failed
        </span>
      );
    case "QUEUED":
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>
          <FiClock className="h-3.5 w-3.5" />
          Queued
        </span>
      );
    case "RUNNING":
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-700`}>
          <FiLoader className="h-3.5 w-3.5 animate-spin" />
          Running
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-700`}>
          {status}
        </span>
      );
  }
}

function getJobTypeLabel(type: string): string {
  switch (type) {
    case "assignment-gen":
      return "Assignment";
    case "humanizer":
      return "Document Humanization";
    case "outline-gen":
      return "Outline";
    case "outline-edit":
      return "Outline Edit";
    default:
      return type;
  }
}

function getJobMetadata(job: JobResponse) {
  const result = job.result as any;
  if (job.type === "humanizer") {
    return {
      downloadUrl: result?.download_url,
      stats: result ? {
        processed: result.paragraphs_processed,
        humanized: result.paragraphs_humanized,
        reverted: result.paragraphs_reverted,
      } : null,
    };
  }
  // assignment-gen and other types
  return {
    downloadUrl: result?.download_url,
    stats: null,
  };
}

export default function Assignments() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // Fetch all job types (no type filter)
      const data = await getJobs(undefined, 50, 0);
      setJobs(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (job: JobResponse) => {
    try {
      const metadata = getJobMetadata(job);
      const downloadUrl = metadata.downloadUrl;
      
      if (!downloadUrl) {
        toast.error("Download URL not available");
        return;
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      // Use appropriate filename based on job type
      const filename = job.type === "humanizer" 
        ? `humanized-${job.job_id}.docx`
        : `assignment-${job.job_id}.docx`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    } catch (error: any) {
      toast.error(error.message || "Failed to download");
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <section className="w-full bg-white">
          <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-10 md:px-8 md:py-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-['Clash_Display'] text-3xl font-medium leading-tight tracking-tight text-neutral-950 md:text-4xl">
                My Orders
              </h1>
              <p className="mt-2 font-['Satoshi'] text-sm font-normal leading-6 text-gray-600">
                View your assignment generation and document humanization history and download completed orders
              </p>
            </div>

            {/* Jobs List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="font-['Satoshi'] text-sm font-normal text-gray-600">
                  Loading orders...
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-6 rounded-2xl bg-gray-50 py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                  <FiFileText className="h-8 w-8 text-violet-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-['Clash_Display'] text-xl font-medium leading-7 text-neutral-950">
                    No orders yet
                  </h3>
                  <p className="mt-2 font-['Satoshi'] text-sm font-normal leading-5 text-gray-600">
                    Generate your first assignment or humanize a document to see it here
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="/dojos/assignment"
                    className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 font-['Satoshi'] text-sm font-medium leading-5 text-white"
                  >
                    Go to Assignment Dojo
                  </a>
                  <span
                    className="flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-violet-500/50 px-6 font-['Satoshi'] text-sm font-medium leading-5 text-white/70 opacity-75"
                    title="Coming soon"
                  >
                    Coming soon
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const metadata = getJobMetadata(job);
                  const downloadUrl = metadata.downloadUrl;
                  const canDownload = job.status === "COMPLETED" && downloadUrl;
                  const jobTypeLabel = getJobTypeLabel(job.type);

                  return (
                    <motion.div
                      key={job.job_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] outline outline-2 outline-offset-[-2px] outline-black md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-['Clash_Display'] text-lg font-medium leading-7 text-neutral-950">
                            {jobTypeLabel}
                          </h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <p className="font-['Satoshi'] text-xs font-normal leading-4 text-gray-500">
                          Created {formatDate(job.created_at)}
                        </p>
                        {metadata.stats && job.status === "COMPLETED" && (
                          <p className="mt-2 font-['Satoshi'] text-xs font-normal leading-4 text-gray-600">
                            {metadata.stats.processed} paragraph{metadata.stats.processed !== 1 ? "s" : ""} processed, {metadata.stats.humanized} humanized
                            {metadata.stats.reverted > 0 && `, ${metadata.stats.reverted} reverted`}
                          </p>
                        )}
                        {job.error && (
                          <p className="mt-2 font-['Satoshi'] text-xs font-normal leading-4 text-red-600">
                            Error: {job.error}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {canDownload ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(job)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2 font-['Satoshi'] text-sm font-medium leading-4 text-white hover:bg-violet-600"
                          >
                            <FiDownload className="h-4 w-4" />
                            Download
                          </button>
                        ) : job.status === "QUEUED" || job.status === "RUNNING" ? (
                          <span className="font-['Satoshi'] text-sm font-normal text-gray-500">
                            Processing...
                          </span>
                        ) : null}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </motion.main>
    </>
  );
}
