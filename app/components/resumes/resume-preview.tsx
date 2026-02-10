import { useEffect, useState, useRef } from "react";
import { getJob } from "~/lib/control-plane";
import { FiRefreshCw } from "react-icons/fi";

interface ResumePreviewProps {
  resumeId: string;
  resumeData: any;
  templateId?: string;
  onPreviewReady?: (url: string) => void;
}

export function ResumePreview({
  resumeId,
  resumeData,
  templateId = "modern",
  onPreviewReady,
}: ResumePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastResumeDataRef = useRef<string | null>(null);

  // Debounce preview generation
  useEffect(() => {
    const currentData = JSON.stringify(resumeData);
    
    // Only regenerate if data actually changed
    if (currentData === lastResumeDataRef.current) {
      return;
    }
    
    lastResumeDataRef.current = currentData;

    // Clear existing timeout
    const timeoutId = setTimeout(() => {
      generatePreview();
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [resumeData, templateId, resumeId]);

  const generatePreview = async () => {
    if (!resumeId || !resumeData) return;

    setLoading(true);
    setError(null);

    try {
      // Submit preview job
      const response = await fetch(`/api/resumes/${resumeId}/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: templateId || "modern",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start preview generation");
      }

      const { job_id } = await response.json();

      // Poll for job completion
      pollPreviewJob(job_id);
    } catch (err: any) {
      setError(err.message || "Failed to generate preview");
      setLoading(false);
    }
  };

  const pollPreviewJob = async (jobId: string) => {
    // Clear existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const poll = async () => {
      try {
        const job = await getJob(jobId);
        
        if (job.status === "COMPLETED") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          const result = job.result as any;
          if (result?.preview_url) {
            // Use proxy endpoint to ensure PDF displays inline instead of downloading
            const proxyUrl = `/api/v2/resumes/preview-proxy?url=${encodeURIComponent(result.preview_url)}`;
            setPreviewUrl(proxyUrl);
            setLoading(false);
            onPreviewReady?.(proxyUrl);
          } else {
            setError("Preview URL not found in result");
            setLoading(false);
          }
        } else if (job.status === "FAILED") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setError(job.error || "Preview generation failed");
          setLoading(false);
        }
        // Continue polling if still running
      } catch (err: any) {
        console.error("Preview polling error:", err);
        // Continue polling on error
      }
    };

    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(poll, 2000);
    poll(); // Initial poll
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button
          onClick={generatePreview}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-lg border border-gray-200 bg-gray-50">
        <FiRefreshCw className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm text-gray-600">Generating preview...</p>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600 mb-4">Preview will appear here</p>
        <button
          onClick={generatePreview}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Generate Preview
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] rounded-lg border border-gray-200 bg-white overflow-hidden">
      <iframe
        src={previewUrl}
        className="w-full h-full border-0"
        title="Resume Preview"
      />
    </div>
  );
}

