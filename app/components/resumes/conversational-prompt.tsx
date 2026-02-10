import { motion, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { PhoneInput } from "~/components/phone-input";

interface ConversationalPromptProps {
  question: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onComplete: () => void;
  onSkip?: () => void;
  type?: "text" | "email" | "tel" | "url";
  autoFormat?: (value: string) => string;
  isValid?: boolean;
  hint?: string;
  isOptional?: boolean;
  showCheckmark?: boolean;
}

export function ConversationalPrompt({
  question,
  placeholder,
  value,
  onChange,
  onComplete,
  onSkip,
  type = "text",
  autoFormat,
  isValid = false,
  hint,
  isOptional = false,
  showCheckmark = false,
}: ConversationalPromptProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = autoFormat ? autoFormat(e.target.value) : e.target.value;
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValid) {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="mb-4">
          <h3 className="text-xl font-medium text-gray-900 mb-1">{question}</h3>
          {hint && (
            <p className="text-sm text-emerald-600 mt-1">{hint}</p>
          )}
        </div>

        <div className="relative">
          {type === "tel" ? (
            <div className="relative">
              <PhoneInput
                value={value.startsWith("+") ? value.replace(/^\+\d+\s*/, "").trim() : value}
                onChange={(newValue) => {
                  // PhoneInput gives us just the number part, combine with country code
                  // Extract country code from current value or use default +91
                  const currentCountryCode = value.match(/^\+\d+/)?.[0] || "+91";
                  const fullValue = `${currentCountryCode} ${newValue}`.trim();
                  const formatted = autoFormat ? autoFormat(fullValue) : fullValue;
                  onChange(formatted);
                }}
                onCountryChange={(dialCode) => {
                  // When country changes, update the value with new country code
                  const currentNumber = value.startsWith("+") ? value.replace(/^\+\d+\s*/, "").trim() : value;
                  const fullValue = `${dialCode} ${currentNumber}`.trim();
                  const formatted = autoFormat ? autoFormat(fullValue) : fullValue;
                  onChange(formatted);
                }}
                defaultCountry="+91"
                placeholder={placeholder}
                className="px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 outline-none transition-all"
              />
              {showCheckmark && isValid && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                >
                  <div className="bg-emerald-500 rounded-full p-1">
                    <FiCheck className="h-4 w-4 text-white" />
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <>
          <input
            type={type}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          />
          {showCheckmark && isValid && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <div className="bg-emerald-500 rounded-full p-1">
                <FiCheck className="h-4 w-4 text-white" />
              </div>
            </motion.div>
              )}
            </>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          {isOptional && (
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          )}
          {isValid && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onComplete}
              className="ml-auto px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
            >
              Continue →
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

