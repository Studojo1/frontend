import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiUpload, FiFile, FiX, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import type { ResumeSection } from "~/lib/resume-draft";
import { convertLegacyResumeToSections } from "~/lib/resume-draft";

interface ImportStepProps {
  onImport: (sections: ResumeSection[]) => void;
  onSkip: () => void;
}

export function ImportStep({ onImport, onSkip }: ImportStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Only PDF files are supported");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setIsProcessing(true);
    setImportedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resumes/parse", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to parse PDF" }));
        throw new Error(error.error || "Failed to parse PDF");
      }

      const data = await res.json();
      if (!data.resumeData) {
        throw new Error("No resume data returned");
      }

      // Convert to sections
      const sections = convertLegacyResumeToSections(data.resumeData);
      
      toast.success("Resume imported successfully!");
      onImport(sections);
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import resume");
      setImportedFileName(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Import (Optional)</h2>
      <p className="text-gray-600 mb-6">
        Upload your existing resume PDF and we'll extract the information for you. You can skip this and start from scratch.
      </p>

      {isProcessing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-2 border-emerald-500 rounded-lg p-12 text-center bg-emerald-50"
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-emerald-700 font-medium">Processing PDF with AI...</p>
          <p className="text-sm text-emerald-600 mt-2">This may take a moment</p>
        </motion.div>
      ) : importedFileName ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-emerald-500 rounded-lg p-6 bg-emerald-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 rounded-full p-2">
                <FiCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-emerald-900">Imported successfully!</p>
                <p className="text-sm text-emerald-700">{importedFileName}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setImportedFileName(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-emerald-600 hover:text-emerald-700"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
            isDragging
              ? "border-emerald-500 bg-emerald-50 scale-105"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragging ? "Drop your PDF here" : "Drag & drop your resume PDF"}
            </p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-400 mt-4">PDF files only, max 10MB</p>
          </motion.div>
        </motion.div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={onSkip}
          className="text-gray-600 hover:text-gray-700 font-medium"
        >
          Skip and continue →
        </button>
      </div>
    </div>
  );
}

