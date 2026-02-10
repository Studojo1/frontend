import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveResumeCanvas } from "./live-resume-canvas";
import { IdentityQuestion } from "./identity-question";
import { ProgressiveContact } from "./progressive-contact";

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

interface ResumeIdentityStepProps {
  templateId: string;
  onComplete: (contactInfo: ContactInfo, targetRole: string) => void;
}

type StepState = "identity" | "contact" | "complete";

export function ResumeIdentityStep({
  templateId,
  onComplete,
}: ResumeIdentityStepProps) {
  const [step, setStep] = useState<StepState>("identity");
  const [targetRole, setTargetRole] = useState("");
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [nameJustEntered, setNameJustEntered] = useState(false);

  const handleIdentityComplete = (role: string) => {
    setTargetRole(role);
    setStep("contact");
  };

  const handleContactUpdate = (newContactInfo: ContactInfo) => {
    // Check if name was just entered for celebration
    if (!contactInfo.name && newContactInfo.name) {
      setNameJustEntered(true);
      setShowCelebration(true);
      // Reset celebration after animation
      setTimeout(() => {
        setShowCelebration(false);
        setNameJustEntered(false);
      }, 1000);
    }
    setContactInfo(newContactInfo);
  };

  const handleContactComplete = (finalContactInfo: ContactInfo) => {
    setContactInfo(finalContactInfo);
    setStep("complete");
    // Small delay before calling onComplete for smooth transition
    setTimeout(() => {
      onComplete(finalContactInfo, targetRole);
    }, 300);
  };

  return (
    <div className="w-full">
      {/* Safety Indicator */}
      <div className="flex items-center justify-end mb-4 text-sm text-gray-500">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Changes auto-saved
        </span>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Canvas - Primary (60% on desktop) */}
        <div className="lg:col-span-2 order-1 lg:order-1">
          <div className="sticky top-6">
            <LiveResumeCanvas
              contactInfo={contactInfo}
              targetRole={targetRole}
              templateId={templateId}
              showCelebration={showCelebration}
            />
          </div>
        </div>

        {/* Prompts - Secondary (40% on desktop) */}
        <div className="lg:col-span-1 order-2 lg:order-2 flex items-center">
          <div className="w-full">
            <AnimatePresence mode="wait">
              {step === "identity" && (
                <motion.div
                  key="identity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <IdentityQuestion onComplete={handleIdentityComplete} />
                </motion.div>
              )}

              {step === "contact" && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProgressiveContact
                    onComplete={handleContactComplete}
                    onUpdate={handleContactUpdate}
                    initialContactInfo={contactInfo}
                  />
                </motion.div>
              )}

              {step === "complete" && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="text-2xl mb-2">✨</div>
                  <p className="text-gray-600">Great! Let's continue...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

