import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { FiX, FiUpload, FiFileText } from "react-icons/fi";
import { toast } from "sonner";

type ImportResumeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (resumeData: any) => void;
};

export function ImportResumeModal({
  isOpen,
  onClose,
  onImport,
}: ImportResumeModalProps) {
  const [importMethod, setImportMethod] = useState<"pdf" | "json">("pdf");
  const [jsonText, setJsonText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        // Upload PDF and parse with OpenAI
        const formData = new FormData();
        formData.append("file", file);

        toast.info("Uploading and parsing PDF with AI...");
        const res = await fetch("/api/resumes/parse", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          let errorMessage = "Failed to parse PDF";
          try {
            const error = await res.json();
            errorMessage = error.error || errorMessage;
          } catch {
            // If response isn't JSON, use status text
            errorMessage = res.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await res.json();
        if (!data.resumeData) {
          throw new Error("No resume data returned from server");
        }
        handleImport(data.resumeData);
      } else if (file.type === "application/json" || file.name.endsWith(".json")) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        handleImport(parsed);
      } else {
        toast.error("Only PDF and JSON files are supported");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to parse file");
      console.error("File parse error:", error);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImport = (resumeData: any) => {
    // Basic validation
    if (!resumeData || typeof resumeData !== "object") {
      toast.error("Invalid resume data");
      return;
    }

    // Validate required fields
    if (!resumeData.title && !resumeData.contact_info) {
      toast.error("Resume must have at least a title or contact_info");
      return;
    }

    try {
      onImport(resumeData);
      toast.success("Resume imported successfully");
      onClose();
      setJsonText("");
    } catch (error) {
      toast.error("Failed to import resume");
      console.error("Import error:", error);
    }
  };

  const handleJsonImport = () => {
    if (!jsonText.trim()) {
      toast.error("Please enter or paste resume JSON");
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      handleImport(parsed);
    } catch (error) {
      toast.error("Invalid JSON. Please check your input.");
      console.error("JSON parse error:", error);
    }
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] outline outline-2 outline-offset-[-2px] outline-black"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-black px-6 py-4">
                <h2 className="font-['Clash_Display'] text-2xl font-medium leading-8 tracking-tight text-neutral-950">
                  Import Resume
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
                >
                  <FiX className="h-5 w-5 text-neutral-950" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Method Selection */}
                <div className="mb-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setImportMethod("pdf")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-['Satoshi'] text-sm font-medium leading-5 outline outline-2 outline-offset-[-2px] ${
                      importMethod === "pdf"
                        ? "bg-emerald-500 text-white outline-neutral-900"
                        : "bg-white text-neutral-950 outline-black"
                    }`}
                  >
                    <FiUpload className="h-4 w-4" />
                    PDF Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMethod("json")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-['Satoshi'] text-sm font-medium leading-5 outline outline-2 outline-offset-[-2px] ${
                      importMethod === "json"
                        ? "bg-emerald-500 text-white outline-neutral-900"
                        : "bg-white text-neutral-950 outline-black"
                    }`}
                  >
                    <FiFileText className="h-4 w-4" />
                    JSON File
                  </button>
                </div>

                {/* PDF Import */}
                {importMethod === "pdf" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="mb-2 block font-['Satoshi'] text-xs font-medium uppercase leading-4 tracking-tight text-gray-600">
                        Upload PDF Resume
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileUpload}
                        disabled={isProcessing}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-gray-50 py-8 font-['Satoshi'] text-sm font-medium leading-5 transition-colors ${
                          isProcessing
                            ? "border-gray-300 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
                        }`}
                      >
                        <FiUpload className="h-5 w-5" />
                        {isProcessing
                          ? "Processing PDF with AI..."
                          : "Click to upload PDF resume"}
                      </label>
                      <p className="mt-2 text-center font-['Satoshi'] text-xs font-normal leading-4 text-gray-500">
                        We'll use AI to extract and structure your resume data
                      </p>
                    </div>
                  </div>
                )}

                {/* JSON Import */}
                {importMethod === "json" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="mb-2 block font-['Satoshi'] text-xs font-medium uppercase leading-4 tracking-tight text-gray-600">
                        Upload JSON File
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileUpload}
                        disabled={isProcessing}
                        className="hidden"
                        id="json-file-upload"
                      />
                      <label
                        htmlFor="json-file-upload"
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-gray-50 py-8 font-['Satoshi'] text-sm font-medium leading-5 transition-colors ${
                          isProcessing
                            ? "border-gray-300 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
                        }`}
                      >
                        <FiUpload className="h-5 w-5" />
                        {isProcessing ? "Processing..." : "Click to upload JSON file"}
                      </label>
                    </div>

                    <div className="relative">
                      <div className="absolute left-0 top-0 flex items-center gap-2 px-3 py-2">
                        <span className="font-['Satoshi'] text-xs font-normal text-gray-500">
                          OR
                        </span>
                      </div>
                      <label className="mb-2 block font-['Satoshi'] text-xs font-medium uppercase leading-4 tracking-tight text-gray-600">
                        Paste JSON
                      </label>
                      <textarea
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        placeholder='{"title": "My Resume", "summary": "...", "contact_info": {...}}'
                        rows={10}
                        className="w-full resize-none rounded-lg border-2 border-gray-200 bg-white px-3 py-2 font-['Satoshi'] text-sm font-normal leading-5 text-neutral-950 placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleJsonImport}
                      disabled={isProcessing || !jsonText.trim()}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 font-['Clash_Display'] text-base font-medium leading-5 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] outline outline-2 outline-offset-[-2px] outline-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Import JSON
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
