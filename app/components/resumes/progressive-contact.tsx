import { useState, useEffect } from "react";
import { ConversationalPrompt } from "./conversational-prompt";
import {
  formatPhoneNumber,
  parseLinkedInUrl,
  validateAndFormat,
  isInputComplete,
} from "~/lib/resume-intelligence";

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

interface ProgressiveContactProps {
  onComplete: (contactInfo: ContactInfo) => void;
  initialContactInfo?: Partial<ContactInfo>;
}

type PromptType = "name" | "email" | "phone" | "location" | "linkedin" | "website";

const PROMPT_SEQUENCE: PromptType[] = ["name", "email", "phone", "location", "linkedin", "website"];

export function ProgressiveContact({
  onComplete,
  onUpdate,
  initialContactInfo = {},
}: ProgressiveContactProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: initialContactInfo.name || "",
    email: initialContactInfo.email || "",
    phone: initialContactInfo.phone || "",
    location: initialContactInfo.location || "",
    linkedin: initialContactInfo.linkedin || "",
    website: initialContactInfo.website || "",
  });

  const currentPrompt = PROMPT_SEQUENCE[currentPromptIndex];
  const currentValue = contactInfo[currentPrompt];

  const handleNext = () => {
    if (currentPromptIndex < PROMPT_SEQUENCE.length - 1) {
      setCurrentPromptIndex((prev) => prev + 1);
    } else {
      // All prompts completed
      onComplete(contactInfo);
    }
  };

  useEffect(() => {
    // Auto-advance if input is complete, but only for required fields
    // Increase delay to prevent bouncing and allow user to review their input
    const config = getPromptConfig(currentPrompt);
    if (currentPrompt && isInputComplete(currentValue, getInputType(currentPrompt)) && !config.isOptional) {
      const timeoutId = setTimeout(() => {
        handleNext();
      }, 1500); // Increased delay to allow user to read and review their input

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue, currentPrompt]);

  const getInputType = (prompt: PromptType): "email" | "phone" | "url" | "text" => {
    switch (prompt) {
      case "email":
        return "email";
      case "phone":
        return "phone";
      case "linkedin":
      case "website":
        return "url";
      default:
        return "text";
    }
  };

  const getPromptConfig = (prompt: PromptType) => {
    switch (prompt) {
      case "name":
        return {
          question: "What should we call you?",
          placeholder: "Your full name",
          isOptional: false,
        };
      case "email":
        return {
          question: "Where can employers reach you?",
          placeholder: "your.email@example.com",
          isOptional: false,
        };
      case "phone":
        return {
          question: "What's your phone number?",
          placeholder: "+1 (555) 123-4567",
          isOptional: true,
        };
      case "location":
        return {
          question: "Where are you based?",
          placeholder: "City, State or Country",
          isOptional: true,
        };
      case "linkedin":
        return {
          question: "Got a LinkedIn profile?",
          placeholder: "linkedin.com/in/yourprofile",
          isOptional: true,
        };
      case "website":
        return {
          question: "Personal website?",
          placeholder: "yourwebsite.com",
          isOptional: true,
        };
    }
  };

  const handleChange = (value: string) => {
    const updated = {
      ...contactInfo,
      [currentPrompt]: value,
    };
    setContactInfo(updated);
    // Notify parent for live preview updates
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const getAutoFormat = (prompt: PromptType) => {
    switch (prompt) {
      case "phone":
        return formatPhoneNumber;
      case "linkedin":
        return parseLinkedInUrl;
      default:
        return undefined;
    }
  };

  const getValidation = () => {
    const inputType = getInputType(currentPrompt);
    const validation = validateAndFormat(currentValue, inputType);
    return {
      isValid: validation.isValid,
      hint: validation.hint,
    };
  };

  const config = getPromptConfig(currentPrompt);
  const validation = getValidation();
  const autoFormat = getAutoFormat(currentPrompt);

  return (
    <ConversationalPrompt
      question={config.question}
      placeholder={config.placeholder}
      value={currentValue}
      onChange={handleChange}
      onComplete={handleNext}
      onSkip={config.isOptional ? handleSkip : undefined}
      type={currentPrompt === "phone" ? "tel" : currentPrompt === "email" ? "email" : "text"}
      autoFormat={autoFormat}
      isValid={validation.isValid}
      hint={validation.hint}
      isOptional={config.isOptional}
      showCheckmark={true}
    />
  );
}

