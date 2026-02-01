import { useState, useRef, useEffect } from "react";
import { FiUpload, FiDownload, FiFile, FiX, FiShield, FiCheckCircle, FiZap } from "react-icons/fi";
import { LuUsersRound } from "react-icons/lu";
import { toast } from "sonner";
import {
  submitHumanizerJob,
  getJob,
  calculateHumanizerPrice,
  type JobResponse,
} from "~/lib/control-plane";
import {
  createPaymentOrder,
  openRazorpayCheckout,
  verifyPayment,
} from "~/lib/payments";
import { authClient } from "~/lib/auth-client";
import { FloatingCardA, FloatingCardB } from "./floating-cards";

type ViewState = "upload" | "processing" | "completed" | "error";

export function HumanizerDojoPage() {
  const [view, setView] = useState<ViewState>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobResponse | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [paragraphsReverted, setParagraphsReverted] = useState<number>(0);
  const [price, setPrice] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState<number | null>(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for job status
  useEffect(() => {
    if (!jobId || view !== "processing") {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const pollJob = async () => {
      try {
        const jobStatus = await getJob(jobId);
        setJob(jobStatus);

        if (jobStatus.status === "COMPLETED") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          const result = jobStatus.result as any;
          if (result?.download_url) {
            setDownloadUrl(result.download_url);
            setParagraphsReverted(result.paragraphs_reverted || 0);
            setView("completed");
            toast.success("Document humanized successfully!");
          }
        } else if (jobStatus.status === "FAILED") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setView("error");
          toast.error(jobStatus.error || "Humanization failed");
        }
      } catch (error: any) {
        console.error("Job polling error:", error);
        if (error.status === 401) {
          toast.error("Please sign in again");
          setView("upload");
        }
      }
    };

    pollingIntervalRef.current = setInterval(pollJob, 2000);
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [jobId, view]);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".docx")) {
      toast.error("Please upload a .docx file");
      return;
    }
    setFile(selectedFile);
    
    // Calculate price
    setCalculatingPrice(true);
    try {
      const priceData = await calculateHumanizerPrice(selectedFile);
      setPrice(priceData.amount);
      setWordCount(priceData.word_count);
    } catch (error: any) {
      console.error("Price calculation error:", error);
      toast.error("Failed to calculate price. Please try again.");
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!price) {
      toast.error("Please wait for price calculation");
      return;
    }

    try {
      // Create payment order
      const orderRes = await createPaymentOrder(price);
      
      // Open Razorpay checkout
      await openRazorpayCheckout({
        key: orderRes.key_id,
        amount: orderRes.amount,
        currency: "INR",
        name: "Studojo",
        description: "Document Humanization",
        order_id: orderRes.order_id,
        handler: async (response) => {
          try {
            // Verify payment
            await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            
            // Submit job
            setView("processing");
            const result = await submitHumanizerJob(file, response.razorpay_order_id);
            setJobId(result.job_id);
            toast.success("Payment verified! Humanization started...");
          } catch (error: any) {
            console.error("Payment/job submission error:", error);
            setView("error");
            toast.error(error.message || "Payment verification or job submission failed");
          }
        },
        onDismiss: () => {
          toast.info("Payment cancelled");
        },
        onPaymentFailed: (response: any) => {
          toast.error("Payment failed. Please try again.");
        },
      });
    } catch (error: any) {
      console.error("Submit error:", error);
      setView("error");
      toast.error(error.message || "Failed to start payment");
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file?.name.replace(".docx", "_humanized.docx") || "humanized.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobId(null);
    setJob(null);
    setDownloadUrl(null);
    setParagraphsReverted(0);
    setPrice(null);
    setWordCount(null);
    setView("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full bg-white">
      {/* Hero – full width, below header, rounded corners, floating cards */}
      <section className="w-full">
        <div className="relative flex min-h-[420px] w-full flex-col items-center justify-center gap-6 rounded-b-2xl bg-amber-500 px-4 py-16 md:min-h-[400px] md:gap-8 md:py-20">
          {/* Floating cards – left & right, animate across, opacity 0.2 */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between overflow-visible px-4 md:px-12 lg:px-16">
            <div className="hidden opacity-20 md:block">
              <FloatingCardA />
            </div>
            <div className="hidden opacity-20 md:block">
              <FloatingCardB />
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6 text-center md:gap-8">
            {/* Badge */}
            <div className="rounded-full bg-white/20 px-5 py-2 shadow-sm">
              <span className="font-['Satoshi'] text-sm font-normal leading-5 text-white">
                Structure-Preserving Document Humanization
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-xl font-['Clash_Display'] text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              Humanize AI Content While Preserving Structure
            </h1>

            {/* Description */}
            <p className="max-w-2xl font-['Satoshi'] text-sm font-normal leading-6 text-white/90 md:text-base md:leading-7">
              Transform AI-generated documents into human-like content. Preserves headings, tables, 
              figures, and formatting while humanizing paragraph content. AI detection proof.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full bg-white">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-12 md:px-8 md:py-16">
          {/* Feature Cards */}
          {view === "upload" && (
            <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-neutral-900 bg-amber-100">
                  <FiShield className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="mb-2 font-['Clash_Display'] text-xl font-medium text-neutral-900">
                  Structure Preserved
                </h3>
                <p className="font-['Satoshi'] text-sm text-neutral-600">
                  Headings, tables, figures, and formatting remain untouched. Only paragraphs are humanized.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-neutral-900 bg-amber-100">
                  <FiCheckCircle className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="mb-2 font-['Clash_Display'] text-xl font-medium text-neutral-900">
                  Verified Output
                </h3>
                <p className="font-['Satoshi'] text-sm text-neutral-600">
                  Every paragraph is verified before inclusion. Failed verifications are automatically reverted.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-neutral-900 bg-amber-100">
                  <FiZap className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="mb-2 font-['Clash_Display'] text-xl font-medium text-neutral-900">
                  AI Detection Proof
                </h3>
                <p className="font-['Satoshi'] text-sm text-neutral-600">
                  Humanized content passes all AI detection tools. Untrackable and undetectable.
                </p>
              </div>
            </div>
          )}

          {/* Warning Banner */}
          <div className="mb-8 rounded-2xl border-2 border-amber-500 bg-amber-50 p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <FiShield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-['Satoshi'] text-base font-medium text-amber-900">
                  Structure Preservation Guarantee
                </p>
                <p className="mt-1 font-['Satoshi'] text-sm text-amber-800">
                  Tables, headings, figures, references, and formatting will NOT be changed. Only paragraph bodies are humanized.
                </p>
              </div>
            </div>
          </div>

          {view === "upload" && (
            <div className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
                  dragOver
                    ? "border-amber-500 bg-amber-50 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
                    : "border-neutral-300 bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-4">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl border-2 border-neutral-900 bg-amber-100">
                        <FiFile className="h-8 w-8 text-amber-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-['Clash_Display'] text-lg font-medium text-neutral-900">
                          {file.name}
                        </p>
                        <p className="font-['Satoshi'] text-sm text-neutral-600">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setPrice(null);
                          setWordCount(null);
                        }}
                        className="ml-4 rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                    {calculatingPrice ? (
                      <div className="text-center">
                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600"></div>
                        <p className="font-['Satoshi'] text-sm font-medium text-neutral-600">
                          Calculating price...
                        </p>
                      </div>
                    ) : price ? (
                      <div className="space-y-4">
                        <div className="rounded-xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                          <div className="text-center">
                            <p className="font-['Satoshi'] text-sm text-neutral-600">
                              Estimated {wordCount?.toLocaleString()} words
                            </p>
                            <p className="mt-2 font-['Clash_Display'] text-3xl font-semibold text-neutral-900">
                              ₹{(price / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleSubmit}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-900 bg-amber-500 px-8 py-4 font-['Satoshi'] text-base font-medium leading-5 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                        >
                          <FiUpload className="h-5 w-5" />
                          Pay & Humanize Document
                        </button>
                      </div>
                    ) : (
                      <p className="font-['Satoshi'] text-sm text-neutral-500">
                        Calculating price...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-amber-100">
                      <FiUpload className="h-10 w-10 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-['Clash_Display'] text-xl font-medium text-neutral-900">
                        Drag and drop your .docx file here
                      </p>
                      <p className="mt-2 font-['Satoshi'] text-base text-neutral-600">
                        or click to browse
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx"
                      onChange={handleFileInputChange}
                      className="hidden"
                      id="file-input"
                    />
                    <label
                      htmlFor="file-input"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-neutral-900 bg-white px-8 py-3 font-['Satoshi'] text-base font-medium leading-5 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                    >
                      <FiUpload className="h-5 w-5" />
                      Select File
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "processing" && (
            <div className="space-y-6 text-center">
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-16 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="mx-auto mb-6 h-20 w-20 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600"></div>
                <h2 className="mb-3 font-['Clash_Display'] text-2xl font-medium text-neutral-900">
                  Processing your document...
                </h2>
                <p className="font-['Satoshi'] text-base text-neutral-600">
                  This may take a few minutes. We're humanizing your content while preserving all structure.
                </p>
                {job && (
                  <div className="mt-6 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-4">
                    <p className="font-['Satoshi'] text-sm font-medium text-neutral-700">
                      Status: <span className="text-amber-600">{job.status}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "completed" && (
            <div className="space-y-6">
              <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-8 text-center shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-500 bg-white">
                  <FiCheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mb-2 font-['Clash_Display'] text-2xl font-medium text-green-900">
                  Document Humanized Successfully!
                </h2>
                {paragraphsReverted > 0 && (
                  <p className="mt-2 font-['Satoshi'] text-sm text-amber-700">
                    ⚠️ {paragraphsReverted} paragraph(s) were reverted to original content due to verification failures.
                  </p>
                )}
              </div>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-900 bg-amber-500 px-8 py-4 font-['Satoshi'] text-base font-medium leading-5 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                >
                  <FiDownload className="h-5 w-5" />
                  Download Humanized Document
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-300 bg-white px-8 py-4 font-['Satoshi'] text-base font-medium leading-5 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                >
                  Humanize Another
                </button>
              </div>
            </div>
          )}

          {view === "error" && (
            <div className="space-y-6">
              <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-8 text-center shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <h2 className="mb-2 font-['Clash_Display'] text-2xl font-medium text-red-900">
                  Humanization Failed
                </h2>
                {job?.error && (
                  <p className="mt-2 font-['Satoshi'] text-sm text-red-700">
                    {job.error}
                  </p>
                )}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-300 bg-white px-8 py-4 font-['Satoshi'] text-base font-medium leading-5 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
