// Micro-intelligence utilities for resume building
// Auto-formatting, validation, and smart parsing

/**
 * Formats a phone number as user types
 * Examples:
 * - "1234567890" → "+1 (123) 456-7890"
 * - "12345678901" → "+1 (234) 567-8901"
 * - "+11234567890" → "+1 (123) 456-7890"
 */
export function formatPhoneNumber(input: string): string {
  // Remove all non-digit characters except +
  const cleaned = input.replace(/[^\d+]/g, "");
  
  // If starts with +, keep it
  const hasPlus = cleaned.startsWith("+");
  const digits = cleaned.replace(/\+/g, "");
  
  // If no digits, return empty
  if (!digits) return input;
  
  // Handle US numbers (10 digits) or international with country code
  if (hasPlus && digits.length > 10) {
    // International format: +[country][number]
    const countryCode = digits.slice(0, digits.length - 10);
    const number = digits.slice(digits.length - 10);
    return `+${countryCode} (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  } else if (digits.length === 10) {
    // US format: (123) 456-7890
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length > 10) {
    // Assume US with country code
    const number = digits.slice(-10);
    return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  } else if (digits.length >= 7) {
    // Partial formatting
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length >= 4) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else if (digits.length > 0) {
    return `(${digits}`;
  }
  
  return input;
}

/**
 * Detects email domain and returns it
 * Returns null if invalid email
 */
export function detectEmailDomain(email: string): string | null {
  const emailRegex = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;
  const match = email.match(emailRegex);
  return match ? match[1] : null;
}

/**
 * Normalizes LinkedIn URLs
 * Examples:
 * - "john-doe" → "linkedin.com/in/john-doe"
 * - "linkedin.com/in/john-doe" → "linkedin.com/in/john-doe"
 * - "https://www.linkedin.com/in/john-doe" → "linkedin.com/in/john-doe"
 */
export function parseLinkedInUrl(input: string): string {
  if (!input.trim()) return "";
  
  // Remove protocol and www
  let cleaned = input.replace(/^https?:\/\//, "").replace(/^www\./, "");
  
  // If it's already in the right format, return as is
  if (cleaned.startsWith("linkedin.com/in/")) {
    return cleaned;
  }
  
  // If it's just a username, add the prefix
  if (!cleaned.includes("/")) {
    return `linkedin.com/in/${cleaned}`;
  }
  
  // Extract username from full URL
  const match = cleaned.match(/linkedin\.com\/in\/([^\/\?]+)/);
  if (match) {
    return `linkedin.com/in/${match[1]}`;
  }
  
  return cleaned;
}

/**
 * Validates and formats input based on type
 * Returns formatted string or original if invalid
 */
export function validateAndFormat(
  input: string,
  type: "email" | "phone" | "url" | "text"
): { value: string; isValid: boolean; hint?: string } {
  switch (type) {
    case "email": {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(input);
      const domain = detectEmailDomain(input);
      const hint = domain && isValid ? `${domain.split(".")[0]} detected` : undefined;
      return { value: input, isValid, hint };
    }
    
    case "phone": {
      const digits = input.replace(/\D/g, "");
      const isValid = digits.length >= 10;
      const formatted = formatPhoneNumber(input);
      return { value: formatted, isValid, hint: isValid ? undefined : "Enter at least 10 digits" };
    }
    
    case "url": {
      // Basic URL validation
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      const isValid = urlRegex.test(input) || input.startsWith("linkedin.com") || input.startsWith("github.com");
      return { value: input, isValid };
    }
    
    case "text":
    default:
      return { value: input, isValid: input.trim().length > 0 };
  }
}

/**
 * Checks if input is complete enough to advance to next prompt
 */
export function isInputComplete(input: string, type: "email" | "phone" | "url" | "text"): boolean {
  const { isValid } = validateAndFormat(input, type);
  return isValid;
}

