import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { redirect, useSearchParams } from "react-router";
import { FiDownload, FiEdit, FiTrash2, FiPlus, FiFileText } from "react-icons/fi";
import { Footer, Header } from "~/components";
import { ImportResumeModal, RenameResumeModal, InternshipReturnCard } from "~/components/resumes";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import { toast } from "sonner";
import type { Route } from "./+types/resumes";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  
  // Check if onboarding is complete (both phone and profile)
  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (!onboardingStatus.complete) {
    throw redirect("/onboarding");
  }
  
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Resumes – Studojo" },
    {
      name: "description",
      content: "Manage your saved resumes and optimize them for job applications.",
    },
  ];
}

type Resume = {
  id: string;
  name: string;
  resumeData: any;
  createdAt: string;
  updatedAt: string;
};

export default function Resumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [resumeToRename, setResumeToRename] = useState<Resume | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error("Failed to load resumes");
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch (error) {
      toast.error("Failed to load resumes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete resume");
      toast.success("Resume deleted successfully");
      loadResumes();
    } catch (error) {
      toast.error("Failed to delete resume");
      console.error(error);
    }
  };

  const handleRenameClick = (resume: Resume) => {
    setResumeToRename(resume);
    setRenameModalOpen(true);
  };

  const handleRename = async (newName: string) => {
    if (!resumeToRename) return;

    try {
      const res = await fetch(`/api/resumes/${resumeToRename.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to rename resume");
      }
      toast.success("Resume renamed successfully");
      loadResumes();
    } catch (error: any) {
      toast.error(error.message || "Failed to rename resume");
      throw error;
    }
  };

  const generateSmartResumeName = (resumeData: any, existingResumes: Resume[]): string => {
    let baseName = "";

    const contactName = resumeData.contact_info?.name?.trim();
    const title = resumeData.title?.trim();
    const workExps = resumeData.work_experiences || [];
    const educations = resumeData.educations || [];

    // Priority 1: current role : contact_info.name
    if (contactName && workExps.length > 0) {
      const currentRole = workExps[0]?.role?.trim();
      if (currentRole) {
        baseName = `${currentRole} : ${contactName}`;
      }
    }

    // Priority 2: contact_info.name + company
    if (!baseName && contactName && workExps.length > 0) {
      const company = workExps[0]?.company?.trim();
      if (company) {
        baseName = `${company} : ${contactName}`;
      }
    }

    // Priority 3: contact_info.name + degree
    if (!baseName && contactName && educations.length > 0) {
      const degree = educations[0]?.degree?.trim();
      if (degree) {
        baseName = `${degree} : ${contactName}`;
      }
    }

    // Priority 4: contact_info.name alone
    if (!baseName && contactName) {
      baseName = contactName;
    }

    // Priority 5: title field
    if (!baseName && title) {
      baseName = title;
    }

    // Priority 6: Role + Company (if no name)
    if (!baseName && workExps.length > 0) {
      const role = workExps[0]?.role?.trim();
      const company = workExps[0]?.company?.trim();
      if (role && company) {
        baseName = `${role} at ${company}`;
      } else if (role) {
        baseName = role;
      } else if (company) {
        baseName = company;
      }
    }

    // Priority 7: Degree + Institution (if no name)
    if (!baseName && educations.length > 0) {
      const degree = educations[0]?.degree?.trim();
      const institution = educations[0]?.institution?.trim();
      if (degree && institution) {
        baseName = `${degree} at ${institution}`;
      } else if (degree) {
        baseName = degree;
      } else if (institution) {
        baseName = institution;
      }
    }

    // Priority 8: Fallback
    if (!baseName) {
      baseName = "Imported Resume";
    }

    // Check for duplicates and append number if needed
    const existingNames = existingResumes.map((r) => r.name.toLowerCase().trim());
    let finalName = baseName;
    let counter = 2;

    while (existingNames.includes(finalName.toLowerCase().trim())) {
      finalName = `${baseName} (${counter})`;
      counter++;
    }

    return finalName;
  };

  const handleImport = async (resumeData: any) => {
    const name = generateSmartResumeName(resumeData, resumes);
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, resumeData }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = "Failed to save resume";
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    toast.success("Resume imported and saved");
    loadResumes();
    // Note: We no longer auto-redirect. The internship return card will be shown at the top.
  };

  const handleDismissReturnCard = () => {
    // Remove returnTo from URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("returnTo");
    setSearchParams(newParams, { replace: true });
  };

  const handleDownload = async (resume: Resume) => {
    try {
      toast.info("Generating resume package...");
      const { submitResumeJob, getJob } = await import("~/lib/control-plane");
      
      // Submit job to generate package
      const { res } = await submitResumeJob({
        resume: resume.resumeData,
      });
      
      // Poll for completion
      const pollJob = async (jobId: string): Promise<string | null> => {
        for (let i = 0; i < 30; i++) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const job = await getJob(jobId);
          if (job.status === "COMPLETED") {
            const result = job.result as any;
            return result?.download_url || null;
          } else if (job.status === "FAILED") {
            throw new Error(job.error || "Generation failed");
          }
        }
        throw new Error("Generation timed out");
      };
      
      const url = await pollJob(res.job_id);
      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.download = "resume-package.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate resume package");
      console.error(error);
    }
  };

  const handleUseForOptimization = (resume: Resume) => {
    // Navigate to careers dojo with this resume loaded
    window.location.href = `/dojos/careers?resume=${resume.id}`;
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
            {/* Internship Return Card */}
            {searchParams.get("returnTo") && (
              <InternshipReturnCard
                returnTo={searchParams.get("returnTo")!}
                onDismiss={handleDismissReturnCard}
              />
            )}

            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="font-['Clash_Display'] text-3xl font-medium leading-tight tracking-tight text-neutral-950 md:text-4xl">
                  My Resumes
                </h1>
                <p className="mt-2 font-['Satoshi'] text-sm font-normal leading-6 text-gray-600">
                  Manage your saved resumes and optimize them for job applications
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 font-['Clash_Display'] text-base font-medium leading-5 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] outline outline-2 outline-offset-[-2px] outline-neutral-900"
              >
                <FiPlus className="h-5 w-5" />
                Import Resume
              </button>
            </div>

            {/* Resumes List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="font-['Satoshi'] text-sm font-normal text-gray-600">
                  Loading resumes...
                </div>
              </div>
            ) : resumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-6 rounded-2xl bg-gray-50 py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <FiFileText className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-['Clash_Display'] text-xl font-medium leading-7 text-neutral-950">
                    No resumes yet
                  </h3>
                  <p className="mt-2 font-['Satoshi'] text-sm font-normal leading-5 text-gray-600">
                    Import your first resume to get started
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setImportModalOpen(true)}
                  className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 font-['Satoshi'] text-sm font-medium leading-5 text-white"
                >
                  <FiPlus className="h-4 w-4" />
                  Import Resume
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {resumes.map((resume) => (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] outline outline-2 outline-offset-[-2px] outline-black"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-['Clash_Display'] text-lg font-medium leading-7 text-neutral-950">
                            {resume.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleRenameClick(resume)}
                            className="flex items-center justify-center rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-emerald-600 transition-colors"
                            title="Rename resume"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 font-['Satoshi'] text-xs font-normal leading-4 text-gray-500">
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleUseForOptimization(resume)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 font-['Satoshi'] text-xs font-medium leading-4 text-white"
                      >
                        Optimize
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(resume)}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 font-['Satoshi'] text-xs font-medium leading-4 text-neutral-950 hover:bg-gray-50"
                      >
                        <FiDownload className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(resume.id)}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-white px-3 py-2 font-['Satoshi'] text-xs font-medium leading-4 text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </motion.main>

      <ImportResumeModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />

      {resumeToRename && (
        <RenameResumeModal
          isOpen={renameModalOpen}
          onClose={() => {
            setRenameModalOpen(false);
            setResumeToRename(null);
          }}
          currentName={resumeToRename.name}
          onRename={handleRename}
        />
      )}
    </>
  );
}
