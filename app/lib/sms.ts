/**
 * Twilio Verify API helper for OTP delivery.
 * Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.
 * 
 * Uses Twilio Verify API which handles OTP generation, delivery, and verification.
 * This provides better global SMS delivery and built-in fraud protection.
 */

import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();

// In-memory store for verification SIDs (phone number -> verification SID)
// In production, consider using Redis or database for distributed systems
const verificationSidStore = new Map<string, string>();

function isConfigured(): boolean {
  return !!(accountSid && authToken && verifyServiceSid);
}

/**
 * Send OTP via Twilio Verify API. Fire-and-forget; do not await in the better-auth sendOTP handler.
 * Creates a verification which sends the code via SMS. The verification SID is stored for later verification.
 * No-ops if Twilio env vars are missing (logs a warning).
 * 
 * Note: The `code` parameter is ignored as Twilio Verify API generates the code itself.
 */
export function sendOtpSms(to: string, code: string): void {
  // Always log in dev environments for testing (even if Twilio is not configured)
  if (process.env.NODE_ENV !== "production") {
    console.log(`[sms] 📱 Creating verification for ${to} (code will be sent by Twilio)`);
  }

  if (!isConfigured()) {
    console.warn(
      "[sms] Twilio Verify API not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and " +
        "TWILIO_VERIFY_SERVICE_SID. Skipping verification creation. " +
        `OTP code: ${code} (logged above for dev)`
    );
    return;
  }

  const client = twilio(accountSid, authToken);

  // Create verification using Verify API (this sends the code)
  client.verify.v2
    .services(verifyServiceSid!)
    .verifications.create({
      to,
      channel: "sms",
    })
    .then((verification) => {
      // Store verification SID for later verification check
      verificationSidStore.set(to, verification.sid);
      
      if (process.env.NODE_ENV !== "production") {
        console.log(`[sms] Verification created: ${verification.sid} for ${to}`);
      }
    })
    .catch((err) => {
      console.error("[sms] Failed to create verification:", err);
    });
}

/**
 * Get the verification SID for a phone number.
 * Used when verifying the OTP code.
 */
export function getVerificationSid(phoneNumber: string): string | undefined {
  return verificationSidStore.get(phoneNumber);
}

/**
 * Clear the verification SID for a phone number.
 * Call after successful verification or expiration.
 */
export function clearVerificationSid(phoneNumber: string): void {
  verificationSidStore.delete(phoneNumber);
}
