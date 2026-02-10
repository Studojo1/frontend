import { useState } from "react";
import { FiDownload, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { submitResumeJob } from "~/lib/control-plane";
import { convertSectionsToLegacyResume } from "~/lib/resume-draft";

interface ExportDialogProps {
  draftId: string;
  sections: any[];
  templateId: string;
  onClose: () => void;
}

export function ExportDialog({ draftId, sections, templateId, onClose }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<"pdf" | "zip">("pdf");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Convert sections to legacy format
      const legacyResume = convertSectionsToLegacyResume(sections, templateId);

      if (exportFormat === "zip") {
        // Export as package (resume + cover letter + CV)
        const { res } = await submitResumeJob({
          resume: legacyResume,
          job_title: jobTitle || undefined,
          company: company || undefined,
          job_description: jobDescription || undefined,
        });

        toast.success("Export started! You'll be notified when it's ready.");
        onClose();
      } else {
        // Export as PDF only
        // TODO: Implement PDF-only export
        toast.success("PDF export started!");
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start export");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Export Resume</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setExportFormat("pdf")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  exportFormat === "pdf"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-900">PDF Only</div>
                <div className="text-sm text-gray-600 mt-1">
                  Export resume as a single PDF file
                </div>
              </button>
              <button
                onClick={() => setExportFormat("zip")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  exportFormat === "zip"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-900">Complete Package</div>
                <div className="text-sm text-gray-600 mt-1">
                  Resume + Cover Letter + CV in a ZIP file
                </div>
              </button>
            </div>
          </div>

          {/* Job Information (for cover letter) */}
          {exportFormat === "zip" && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Job Information (for Cover Letter)</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Tech Corp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description (Optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description for better cover letter customization..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || (exportFormat === "zip" && !jobTitle.trim())}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
          >
            <FiDownload className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}

