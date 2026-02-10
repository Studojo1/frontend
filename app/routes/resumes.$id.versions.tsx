import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { redirect } from "react-router";
import { Header } from "~/components";
import { VersionDiff } from "~/components/resumes/version-diff";
import { ConfirmModal } from "~/components/confirm-modal";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import { toast } from "sonner";
import type { Route } from "./+types/resumes.$id.versions";
import type { ResumeSection } from "~/lib/resume-draft";

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  
  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (!onboardingStatus.complete) {
    throw redirect("/onboarding");
  }

  return null;
}

interface Version {
  id: string;
  version: number;
  resumeData: any;
  templateId: string;
  changeSummary: string | null;
  createdAt: string;
  createdBy: string;
}

export default function VersionHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [compareVersions, setCompareVersions] = useState<{ old: Version | null; new: Version | null }>({
    old: null,
    new: null,
  });
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<Version | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [id]);

  const loadVersions = async () => {
    try {
      // Try v2 API first (for resume_drafts), fallback to v1 (for legacy resumes)
      let response = await fetch(`/api/v2/resumes/${id}/versions`);
      if (!response.ok) {
        response = await fetch(`/api/resumes/${id}/versions`);
        if (!response.ok) {
          throw new Error("Failed to load versions");
        }
      }
      const data = await response.json();
      const versionsData = data.versions || [];
      
      // Normalize version data - ensure sections structure exists
      const normalizedVersions = versionsData.map((v: any) => {
        let resumeData = v.resumeData;
        // If resumeData has sections directly, wrap it
        if (Array.isArray(resumeData)) {
          resumeData = { sections: resumeData };
        } else if (resumeData && !resumeData.sections && typeof resumeData === 'object') {
          // If it's an object but not section-based, try to convert
          resumeData = { sections: [] };
        }
        return {
          ...v,
          resumeData,
        };
      });
      
      setVersions(normalizedVersions);
    } catch (error) {
      console.error("Error loading versions:", error);
      toast.error("Failed to load version history");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (version: Version) => {
    setVersionToRestore(version);
    setRestoreModalOpen(true);
  };

  const handleRestore = async () => {
    if (!versionToRestore || !id) return;

    setIsRestoring(true);
    try {
      const response = await fetch(`/api/resumes/${id}/versions/${versionToRestore.version}/restore`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to restore version");
      }

      toast.success("Version restored successfully");
      setRestoreModalOpen(false);
      setVersionToRestore(null);
      navigate(`/resumes/${id}/edit`);
    } catch (error: any) {
      toast.error(error.message || "Failed to restore version");
    } finally {
      setIsRestoring(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-gray-600">Loading versions...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => navigate(`/resumes/${id}/edit`)}
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back to Editor
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Version History</h1>
            <p className="text-gray-600 mt-2">View and restore previous versions of your resume</p>
          </div>

          {/* Compare Versions */}
          {compareVersions.old && compareVersions.new && (
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Compare Versions</h2>
                <button
                  onClick={() => setCompareVersions({ old: null, new: null })}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Close
                </button>
              </div>
              <VersionDiff
                oldSections={compareVersions.old.resumeData?.sections || []}
                newSections={compareVersions.new.resumeData?.sections || []}
                oldVersion={compareVersions.old.version}
                newVersion={compareVersions.new.version}
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        Version {version.version}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {version.changeSummary || "No description"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(version.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!compareVersions.old) {
                            setCompareVersions({ ...compareVersions, old: version });
                          } else if (!compareVersions.new) {
                            setCompareVersions({ ...compareVersions, new: version });
                          } else {
                            setCompareVersions({ old: version, new: compareVersions.new });
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        Compare
                      </button>
                      <button
                        onClick={() => handleRestoreClick(version)}
                        className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={restoreModalOpen}
        onClose={() => {
          setRestoreModalOpen(false);
          setVersionToRestore(null);
        }}
        onConfirm={handleRestore}
        title="Restore Version"
        message={`Restore version ${versionToRestore?.version}? This will create a new version with the restored data.`}
        confirmText="Restore"
        cancelText="Cancel"
        variant="info"
        isLoading={isRestoring}
      />
    </>
  );
}

