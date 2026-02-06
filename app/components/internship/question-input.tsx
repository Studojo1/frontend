import { useState, useEffect } from "react";

export type QuestionType = "text" | "textarea" | "multiple_choice" | "checkbox" | "file_upload" | "date" | "number" | "rating" | "yes_no";

export interface Question {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options?: string[] | null;
  required: boolean;
  order: number;
  tag_id?: string | null;
}

interface QuestionInputProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  autofilled?: boolean;
}

export function QuestionInput({ question, value, onChange, autofilled = false }: QuestionInputProps) {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (question.question_type === "file_upload" && value && typeof value === "string") {
      // If value is a file URL or file name, we can't set it back to a File object
      // This would typically be handled server-side
    }
  }, [question.question_type, value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onChange(selectedFile.name); // Store file name, actual upload handled separately
    }
  };

  const renderInput = () => {
    switch (question.question_type) {
      case "text":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            className={`w-full rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] focus:outline-none focus:ring-2 focus:ring-violet-500 ${autofilled ? "bg-yellow-50 border-yellow-300" : ""}`}
            placeholder="Enter your answer..."
          />
        );

      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            rows={4}
            className={`w-full rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] focus:outline-none focus:ring-2 focus:ring-violet-500 ${autofilled ? "bg-yellow-50 border-yellow-300" : ""}`}
            placeholder="Enter your answer..."
          />
        );

      case "multiple_choice":
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-neutral-900 p-3 transition-colors hover:bg-violet-50"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  required={question.required}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                />
                <span className="font-['Satoshi'] text-neutral-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-neutral-900 p-3 transition-colors hover:bg-violet-50"
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v) => v !== option);
                    onChange(newValues);
                  }}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                />
                <span className="font-['Satoshi'] text-neutral-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case "file_upload":
        return (
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              required={question.required && !value}
              className="w-full rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {value && (
              <p className="mt-2 font-['Satoshi'] text-sm text-gray-600">
                Selected: {typeof value === "string" ? value : file?.name}
              </p>
            )}
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            className={`w-full rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] focus:outline-none focus:ring-2 focus:ring-violet-500 ${autofilled ? "bg-yellow-50 border-yellow-300" : ""}`}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
            required={question.required}
            className={`w-full rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] focus:outline-none focus:ring-2 focus:ring-violet-500 ${autofilled ? "bg-yellow-50 border-yellow-300" : ""}`}
            placeholder="Enter a number..."
          />
        );

      case "rating":
        const maxRating = question.options?.[0] ? parseInt(question.options[0]) : 5;
        return (
          <div className="flex gap-2">
            {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => onChange(rating)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-['Satoshi'] font-bold transition-colors ${
                  value === rating
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-neutral-900 bg-white text-neutral-900 hover:bg-violet-50"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case "yes_no":
        return (
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-neutral-900 p-3 transition-colors hover:bg-violet-50">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="yes"
                checked={value === "yes"}
                onChange={(e) => onChange(e.target.value)}
                required={question.required}
                className="h-4 w-4 text-violet-600 focus:ring-violet-500"
              />
              <span className="font-['Satoshi'] text-neutral-900">Yes</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-neutral-900 p-3 transition-colors hover:bg-violet-50">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="no"
                checked={value === "no"}
                onChange={(e) => onChange(e.target.value)}
                required={question.required}
                className="h-4 w-4 text-violet-600 focus:ring-violet-500"
              />
              <span className="font-['Satoshi'] text-neutral-900">No</span>
            </label>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            className="w-full rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {renderInput()}
      {autofilled && (
        <p className="font-['Satoshi'] text-xs text-yellow-600">
          ✓ Previously answered similar question
        </p>
      )}
    </div>
  );
}

