import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiDownload, FiFilter } from "react-icons/fi";
import { toast } from "sonner";
import type { ResumeSection } from "~/lib/resume-draft";

interface ExampleResume {
  id: string;
  jobType: string;
  jobTypeLabel: string;
  templateId: string;
  name: string;
  description?: string;
  resumeData: ResumeSection[];
  previewUrl?: string;
}

interface JobTypeExamplesProps {
  selectedJobType?: string;
  onSelectExample?: (example: ExampleResume) => void;
  showFilters?: boolean;
}

const JOB_TYPES = [
  { value: "software-engineer", label: "Software Engineer" },
  { value: "marketing-manager", label: "Marketing Manager" },
  { value: "data-scientist", label: "Data Scientist" },
  { value: "product-manager", label: "Product Manager" },
  { value: "ux-designer", label: "UX Designer" },
  { value: "financial-analyst", label: "Financial Analyst" },
  { value: "sales-representative", label: "Sales Representative" },
  { value: "project-manager", label: "Project Manager" },
  { value: "business-analyst", label: "Business Analyst" },
  { value: "operations-manager", label: "Operations Manager" },
  { value: "account-executive", label: "Account Executive" },
  { value: "management-consultant", label: "Management Consultant" },
  { value: "customer-success-manager", label: "Customer Success Manager" },
];

export function JobTypeExamples({
  selectedJobType,
  onSelectExample,
  showFilters = true,
}: JobTypeExamplesProps) {
  const [examples, setExamples] = useState<ExampleResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterJobType, setFilterJobType] = useState<string>(selectedJobType || "");
  const [filterTemplate, setFilterTemplate] = useState<string>("");
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [usingExample, setUsingExample] = useState<string | null>(null);

  useEffect(() => {
    loadExamples();
  }, [filterJobType, filterTemplate]);

  const loadExamples = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterJobType) params.append("jobType", filterJobType);
      if (filterTemplate) params.append("templateId", filterTemplate);

      const res = await fetch(`/api/resumes/examples?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load examples");

      const data = await res.json();
      setExamples(data.examples || []);
    } catch (error: any) {
      toast.error("Failed to load example resumes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseExample = async (example: ExampleResume) => {
    if (onSelectExample) {
      onSelectExample(example);
      return;
    }

    try {
      setUsingExample(example.id);
      const res = await fetch(`/api/resumes/examples/${example.id}/use`, {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create draft");
      }

      const data = await res.json();
      toast.success("Resume created from example!");
      
      // Redirect to edit page
      window.location.href = `/resumes/${data.draft.id}/edit`;
    } catch (error: any) {
      toast.error(error.message || "Failed to create resume from example");
      console.error(error);
    } finally {
      setUsingExample(null);
    }
  };

  const uniqueTemplates = Array.from(new Set(examples.map((e) => e.templateId)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading examples...</div>
      </div>
    );
  }

  if (examples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-600 mb-2">No examples found</div>
        <div className="text-sm text-gray-500">
          {filterJobType || filterTemplate
            ? "Try adjusting your filters"
            : "Examples will appear here once they're added"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <FiFilter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={filterJobType}
            onChange={(e) => setFilterJobType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Job Types</option>
            {JOB_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={filterTemplate}
            onChange={(e) => setFilterTemplate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Templates</option>
            {uniqueTemplates.map((templateId) => (
              <option key={templateId} value={templateId}>
                {templateId.charAt(0).toUpperCase() + templateId.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Examples Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {examples.map((example) => (
          <motion.div
            key={example.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative flex flex-col rounded-xl border-2 bg-white p-6 transition-all ${
              selectedExample === example.id
                ? "border-emerald-500 shadow-lg"
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
            }`}
          >
            {/* Example Info */}
            <div className="flex-1">
              <div className="mb-2">
                <div className="text-xs font-medium text-emerald-600 uppercase">
                  {example.jobTypeLabel}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{example.name}</h3>
                {example.description && (
                  <p className="mt-1 text-sm text-gray-600">{example.description}</p>
                )}
              </div>
            </div>

            {/* Actions (only show when selection callback is provided) */}
            {onSelectExample && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleUseExample(example)}
                disabled={usingExample === example.id}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {usingExample === example.id ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FiCheck className="h-4 w-4" />
                    Use This Example
                  </>
                )}
              </button>
            </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}


