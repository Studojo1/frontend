import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

interface PasswordInputProps {
  id: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  autoComplete?: string;
  showStrength?: boolean;
  label?: string;
  className?: string;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return "weak";
  if (password.length < 8) return "weak";
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1; // lowercase
  if (/[A-Z]/.test(password)) score += 1; // uppercase
  if (/[0-9]/.test(password)) score += 1; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) score += 1; // special chars
  
  if (score <= 2) return "weak";
  if (score <= 4) return "fair";
  if (score <= 6) return "good";
  return "strong";
}

export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case "weak":
      return "bg-red-500";
    case "fair":
      return "bg-orange-500";
    case "good":
      return "bg-yellow-500";
    case "strong":
      return "bg-green-500";
  }
}

export function getPasswordStrengthText(strength: PasswordStrength): string {
  switch (strength) {
    case "weak":
      return "Weak";
    case "fair":
      return "Fair";
    case "good":
      return "Good";
    case "strong":
      return "Strong";
  }
}

const INPUT_CLASS =
  "w-full rounded-xl border-2 border-neutral-900 bg-white px-4 py-3 pr-12 font-['Satoshi'] text-base font-normal leading-6 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2";

export function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  disabled = false,
  minLength,
  autoComplete,
  showStrength = false,
  label,
  className = "",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const strength = calculatePasswordStrength(value);
  const strengthColor = getPasswordStrengthColor(strength);
  const strengthText = getPasswordStrengthText(strength);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-2 block font-['Satoshi'] text-sm font-medium leading-5 text-neutral-900">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          minLength={minLength}
          autoComplete={autoComplete}
          className={INPUT_CLASS}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <AiOutlineEyeInvisible className="h-5 w-5" />
          ) : (
            <AiOutlineEye className="h-5 w-5" />
          )}
        </button>
      </div>
      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strengthColor}`}
                style={{
                  width: strength === "weak" ? "25%" : strength === "fair" ? "50%" : strength === "good" ? "75%" : "100%",
                }}
              />
            </div>
            <span className={`text-xs font-['Satoshi'] font-medium ${
              strength === "weak" ? "text-red-600" :
              strength === "fair" ? "text-orange-600" :
              strength === "good" ? "text-yellow-600" :
              "text-green-600"
            }`}>
              {strengthText}
            </span>
          </div>
          <div className="mt-1 text-xs font-['Satoshi'] text-neutral-500">
            {strength === "weak" && "Use at least 8 characters with a mix of letters, numbers, and symbols"}
            {strength === "fair" && "Add uppercase letters, numbers, or symbols to strengthen"}
            {strength === "good" && "Good password! Consider adding more characters or symbols"}
            {strength === "strong" && "Excellent password strength!"}
          </div>
        </div>
      )}
    </div>
  );
}

