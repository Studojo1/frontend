import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { redirect } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiArrowLeft, FiCheck, FiUpload } from "react-icons/fi";
import { Header } from "~/components";
import { ImportStep } from "~/components/resumes/import-step";
import { ResumeIdentityStep } from "~/components/resumes/resume-identity-step";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import { toast } from "sonner";
import type { Route } from "./+types/resumes.new";
import type { ResumeSection } from "~/lib/resume-draft";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  
  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (!onboardingStatus.complete) {
    throw redirect("/onboarding");
  }
  
  return null;
}

type WizardStep = 1 | 2 | 3;

export default function ResumeOnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [templateId, setTemplateId] = useState<string>("modern");
  const [availableTemplateIds, setAvailableTemplateIds] = useState<string[]>([]);
  const [resumeName, setResumeName] = useState<string>("");
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  });
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [creating, setCreating] = useState(false);

  // Load available template IDs once for random selection
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch("/api/resumes/templates");
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          const ids = data
            .map((t: any) => (t && typeof t.id === "string" ? t.id.trim() : ""))
            .filter((id: string) => id.length > 0);
          if (ids.length > 0) {
            setAvailableTemplateIds(ids);
          }
        }
      } catch (error) {
        console.error("Failed to load templates for resume wizard:", error);
      }
    };

    loadTemplates();
  }, []);

  const getRandomTemplateId = (fallback?: string) => {
    if (availableTemplateIds.length === 0) {
      return fallback || "modern";
    }
    const index = Math.floor(Math.random() * availableTemplateIds.length);
    return availableTemplateIds[index] || fallback || "modern";
  };

  const handleNext = () => {
    const hasImported = sections.length > 0;
    if (currentStep === 1) {
      // From import to next logical step (basic info or review)
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2 && !hasImported) {
      // From basic info to review (only when not imported)
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (currentStep === 2) {
        setCurrentStep(1);
      } else if (currentStep === 3) {
        setCurrentStep(2);
      }
    }
  };

  const handleTemplateSelect = (id: string) => {
    setTemplateId(id);
  };

  const handleCreateDraft = async () => {
    if (!resumeName.trim()) {
      toast.error("Please enter a resume name");
      return;
    }

    setCreating(true);
    try {
      // Build initial sections from wizard data or imported data
      let initialSections: ResumeSection[] = [];
      
      if (sections.length > 0) {
        // Use imported sections if available
        initialSections = sections;
      } else {
        // Otherwise build from wizard data
        let order = 0;

        // Contact section
        if (contactInfo.name || contactInfo.email) {
          initialSections.push({
            id: `contact-${Date.now()}`,
            type: "contact",
            order: order++,
            content: {
              contact: contactInfo,
            },
          });
        }

        // Summary section (empty, user will fill later)
        initialSections.push({
          id: `summary-${Date.now()}`,
          type: "summary",
          order: order++,
          content: {
            summary: "",
          },
        });
      }

      // Create draft
      const response = await fetch("/api/v2/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: resumeName,
          templateId,
          sections: initialSections,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create resume");
      }

      const { draft } = await response.json();
      toast.success("Resume created successfully!");
      navigate(`/resumes/${draft.id}/edit`);
    } catch (error: any) {
      console.error("Error creating resume:", error);
      toast.error(error.message || "Failed to create resume");
    } finally {
      setCreating(false);
    }
  };

  // Determine steps based on whether data was imported
  const hasImportedData = sections.length > 0;
  const steps = hasImportedData
    ? [
        { number: 1, title: "Import Resume", description: "Upload your existing resume PDF" },
        { number: 2, title: "Review & Create", description: "Review your selections" },
      ]
    : [
        { number: 1, title: "Import Resume", description: "Upload your existing resume PDF (optional)" },
        { number: 2, title: "Basic Information", description: "Tell us about yourself" },
        { number: 3, title: "Review & Create", description: "Review your selections" },
      ];

  const isReviewStep =
    (hasImportedData && currentStep === 2) ||
    (!hasImportedData && currentStep === 3);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, idx) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        currentStep >= step.number
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <FiCheck className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="mt-2 text-xs text-center max-w-[100px]">
                      <div className="font-medium">{step.title}</div>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition-all ${
                        currentStep > step.number ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-8"
            >
              {currentStep === 1 && (
                <ImportStep
                  onImport={(importedSections) => {
                    // Extract contact info from imported sections before setting state
                    const contactSection = importedSections.find(s => s.type === "contact");
                    if (contactSection?.content?.contact) {
                      const importedContact = contactSection.content.contact;
                      setContactInfo({
                        name: importedContact.name || "",
                        email: importedContact.email || "",
                        phone: importedContact.phone || "",
                        location: importedContact.location || "",
                        linkedin: importedContact.linkedin || "",
                        website: importedContact.website || "",
                      });
                      
                      // Auto-generate resume name from imported data
                      const workExpSection = importedSections.find(s => s.type === "experience");
                      const firstRole = workExpSection?.content?.experience?.[0]?.role;
                      if (importedContact.name && firstRole) {
                        setResumeName(`${firstRole} : ${importedContact.name}`);
                      } else if (importedContact.name) {
                        setResumeName(`${importedContact.name}'s Resume`);
                      }
                    }
                    
                    setSections(importedSections);
                    // Jump directly to review step after successful import
                    setCurrentStep(2);
                  }}
                  onSkip={() => {
                    // If skipping import, go to basic info step
                    setCurrentStep(2);
                  }}
                />
              )}

              {currentStep === 2 && !hasImportedData && (
                <ResumeIdentityStep
                  templateId={templateId}
                  onComplete={(contactInfo, role) => {
                    setContactInfo(contactInfo);
                    // Auto-generate resume name from name + role
                    if (contactInfo.name && role) {
                      setResumeName(`${contactInfo.name} - ${role} Resume`);
                    } else if (contactInfo.name) {
                      setResumeName(`${contactInfo.name}'s Resume`);
                    }
                    // Don't auto-advance - let user click Next to proceed to review
                  }}
                />
              )}

              {isReviewStep && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Create</h2>
                  <p className="text-gray-600 mb-6">
                    Review your selections and create your resume.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Resume Name</div>
                      <div className="font-semibold">{resumeName || "Untitled Resume"}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Template</div>
                      <div className="font-semibold">
                        {templateId && templateId.length > 0
                          ? templateId.charAt(0).toUpperCase() + templateId.slice(1)
                          : "Modern"}
                      </div>
                    </div>
                    {contactInfo.name && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Contact Information</div>
                        <div className="font-semibold">{contactInfo.name}</div>
                        {contactInfo.email && <div className="text-sm text-gray-600">{contactInfo.email}</div>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <FiArrowLeft className="h-5 w-5" />
              Back
            </button>
            {!isReviewStep ? (
              <button
                onClick={handleNext}
                disabled={
                  !hasImportedData &&
                  currentStep === 2 &&
                  (!contactInfo.name || !contactInfo.email)
                }
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  !hasImportedData &&
                  currentStep === 2 &&
                  (!contactInfo.name || !contactInfo.email)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                }`}
              >
                Next
                <FiArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleCreateDraft}
                disabled={creating || !resumeName.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  creating || !resumeName.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                }`}
              >
                {creating ? "Creating..." : "Create Resume"}
                <FiArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


