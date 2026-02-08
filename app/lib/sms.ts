/**
 * Twilio Verify API helper for OTP delivery.
 * Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.
 * 
 * Uses Twilio Verify API which handles OTP generation, delivery, and verification.
 * This provides better global SMS delivery and built-in fraud protection.
 * 
 * Verification SIDs are stored in Redis for distributed access across multiple pods.
 */

import twilio from "twilio";
import { createClient } from "redis";

const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
const redisUrl = process.env.REDIS_URL?.trim();
// Note: For local Redis (no password), REDIS_PASSWORD should not be set
// For production, password should be in the URL: redis://:password@host:port

// Redis client for distributed verification SID storage
let redisClient: ReturnType<typeof createClient> | null = null;

// Initialize Redis client lazily
async function getRedisClient() {
  if (!redisUrl) {
    return null;
  }
  
  if (!redisClient) {
    try {
      // Build Redis config - don't use password for local Redis (no auth required)
      // For production, password should be in the URL: redis://:password@host:port
      // Local Redis doesn't require authentication, so just use the URL
      // Explicitly don't pass password even if REDIS_PASSWORD env var exists
      redisClient = createClient({ 
        url: redisUrl,
        // Don't set password - local Redis doesn't require it
        // Even if REDIS_PASSWORD env var exists, don't use it for local dev
      });
      redisClient.on("error", (err) => {
        // Only log non-auth errors (auth errors are expected if password is set but not required)
        if (!err.message?.includes("AUTH")) {
          console.error("[sms] Redis client error:", err);
        }
      });
      await redisClient.connect();
    } catch (err) {
      console.error("[sms] Failed to connect to Redis:", err);
      redisClient = null;
      return null;
    }
  }
  
  return redisClient;
}

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

  const twilioClient = twilio(accountSid, authToken);

  // Create verification using Verify API (this sends the code)
  twilioClient.verify.v2
    .services(verifyServiceSid!)
    .verifications.create({
      to,
      channel: "sms",
    })
    .then(async (verification) => {
      // Store verification SID in Redis for distributed access
      const redis = await getRedisClient();
      if (redis) {
        // Store with 10 minute TTL (verification codes expire)
        await redis.setEx(`verification:${to}`, 600, verification.sid);
      } else {
        console.warn("[sms] Redis not configured, verification SID not stored. Verification may fail in multi-pod deployments.");
      }
      
      if (process.env.NODE_ENV !== "production") {
        console.log(`[sms] Verification created: ${verification.sid} for ${to}`);
      }
    })
    .catch((err) => {
      console.error("[sms] Failed to create verification:", err);
    });
}

/**
 * Get the verification SID for a phone number from Redis.
 * Used when verifying the OTP code.
 */
export async function getVerificationSid(phoneNumber: string): Promise<string | undefined> {
  const client = await getRedisClient();
  if (!client) {
    console.warn("[sms] Redis not configured, cannot retrieve verification SID");
    return undefined;
  }
  
  try {
    const sid = await client.get(`verification:${phoneNumber}`);
    return sid || undefined;
  } catch (err) {
    console.error("[sms] Failed to get verification SID from Redis:", err);
    return undefined;
  }
}

/**
 * Clear the verification SID for a phone number from Redis.
 * Call after successful verification or expiration.
 */
export async function clearVerificationSid(phoneNumber: string): Promise<void> {
  const client = await getRedisClient();
  if (!client) {
    return;
  }
  
  try {
    await client.del(`verification:${phoneNumber}`);
  } catch (err) {
    console.error("[sms] Failed to clear verification SID from Redis:", err);
  }
}
