import { useState } from "react";
import { ConversationalPrompt } from "./conversational-prompt";

interface IdentityQuestionProps {
  onComplete: (role: string) => void;
}

export function IdentityQuestion({ onComplete }: IdentityQuestionProps) {
  const [role, setRole] = useState("");

  const handleComplete = () => {
    if (role.trim()) {
      onComplete(role.trim());
    }
  };

  return (
    <ConversationalPrompt
      question="What role are you targeting?"
      placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
      value={role}
      onChange={setRole}
      onComplete={handleComplete}
      type="text"
      isValid={role.trim().length > 0}
    />
  );
}

