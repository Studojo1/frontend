import { useState, useEffect } from "react";
import { FiClock, FiRotateCcw } from "react-icons/fi";
import { toast } from "sonner";
import { getResumeVersions, restoreResumeVersion } from "~/lib/resume-api";

interface ResumeVersion {
  id: string;
  resumeId: string;
  version: number;
  resumeData: any;
  templateId: string | null;
  changeSummary: string | null;
  createdAt: Date;
  createdBy: string;
}

interface VersionHistoryProps {
  resumeId: string;
  onVersionRestored?: () => void;
}

export function VersionHistory({ resumeId, onVersionRestored }: VersionHistoryProps) {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resumeId) {
      loadVersions();
    }
  }, [resumeId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const data = await getResumeVersions(resumeId);
      setVersions(data);
    } catch (error: any) {
      toast.error("Failed to load version history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: number) => {
    if (!confirm(`Restore version ${version}? This will create a new version with the restored data.`)) {
      return;
    }

    try {
      await restoreResumeVersion(resumeId, version);
      toast.success(`Version ${version} restored successfully`);
      onVersionRestored?.();
      loadVersions();
    } catch (error: any) {
      toast.error("Failed to restore version");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading version history...</div>;
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No version history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {versions.map((version) => (
        <div
          key={version.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <FiClock className="h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">
                Version {version.version}
              </div>
              <div className="text-sm text-gray-600">
                {version.changeSummary || "No description"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(version.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleRestore(version.version)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <FiRotateCcw className="h-4 w-4" />
            Restore
          </button>
        </div>
      ))}
    </div>
  );
}

