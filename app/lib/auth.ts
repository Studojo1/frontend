import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  haveIBeenPwned,
  jwt,
  lastLoginMethod,
  phoneNumber,
  twoFactor,
} from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { eq } from "drizzle-orm";
import * as schema from "../../auth-schema";
import db from "./db";
import { sendOtpSms, getVerificationSid, clearVerificationSid } from "./sms";
import { verifyOtpCode } from "./verify";

// Helper to generate IDs similar to better-auth (base64url encoded random bytes)
function generateId(): string {
  // This should only run server-side, but handle both cases for safety
  if (typeof window === "undefined" && typeof require !== "undefined") {
    // Server-side: use Node.js crypto
    const crypto = require("crypto");
    return crypto.randomBytes(16).toString("base64url");
  } else {
    // Browser fallback: use Web Crypto API and manual base64url encoding
    const array = new Uint8Array(16);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Fallback for very old browsers
      for (let i = 0; i < 16; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    // Convert to base64url manually (browser-compatible)
    const base64 = btoa(String.fromCharCode(...array));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
}

const baseURL =
  process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!googleClientId?.trim() || !googleClientSecret?.trim()) {
  console.error(
    "[auth] Google OAuth: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing or empty. " +
      "Set them in frontend/.env.local (local) or ensure Docker Compose env_file (./frontend/.env.local) is used. " +
      "401 invalid_client often means these are not loaded."
  );
}

const adminUserIds = process.env.ADMIN_USER_IDS
  ? process.env.ADMIN_USER_IDS.split(",").map((id) => id.trim()).filter(Boolean)
  : [];

export const auth = betterAuth({
  appName: "Studojo",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      twoFactor: schema.twoFactor,
      passkey: schema.passkey,
      jwks: schema.jwks,
    },
  }),
  baseURL,
  trustedOrigins: [
    baseURL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    // Allow admin panel to use the same auth
    ...(process.env.ADMIN_PANEL_URL ? [process.env.ADMIN_PANEL_URL] : []),
  ],
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
  
  // Enable CORS for admin panel
  cors: {
    enabled: true,
    origin: [
      baseURL,
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ],
    credentials: true,
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Intercept phone number send OTP endpoint to check uniqueness
      if (ctx.path === "/phone-number/send-otp") {
        const phoneNumberValue = ctx.body?.phoneNumber as string | undefined;
        
        if (phoneNumberValue) {
          // Check if phone number is already registered
          const existingUser = await db
            .select()
            .from(schema.user)
            .where(eq(schema.user.phoneNumber, phoneNumberValue))
            .limit(1)
            .then((users) => users[0]);

          // If phone number exists and user is trying to sign up (not updating), warn them
          // Note: We allow OTP to be sent even if phone exists, as they might be signing in
          // The actual uniqueness check happens during verification/registration
        }
      }

      // Intercept phone number verification endpoint to use Twilio Verify API
      if (ctx.path === "/phone-number/verify") {
        const phoneNumberValue = ctx.body?.phoneNumber as string | undefined;
        const code = ctx.body?.code as string | undefined;
        const updatePhoneNumber = ctx.body?.updatePhoneNumber as boolean | undefined;
        const disableSession = ctx.body?.disableSession as boolean | undefined;

        if (!phoneNumberValue || !code) {
          throw new APIError("BAD_REQUEST", {
            message: "Phone number and code are required",
          });
        }

        // Get verification SID from Redis
        const verificationSid = await getVerificationSid(phoneNumberValue);
        
        if (!verificationSid) {
          throw new APIError("BAD_REQUEST", {
            message: "Verification not found. Please request a new code.",
          });
        }

        // Verify using Twilio Verify API
        const result = await verifyOtpCode(phoneNumberValue, code, verificationSid);

        if (!result.valid) {
          // Clear verification SID on failure
          await clearVerificationSid(phoneNumberValue);
          throw new APIError("BAD_REQUEST", {
            message: result.error || "Invalid verification code",
          });
        }

        // Verification successful - clear the SID
        await clearVerificationSid(phoneNumberValue);

        // Get the current session if available
        let session = ctx.context?.session;
        let userId: string | undefined = session?.userId;

        // If updatePhoneNumber is true, we need a session - try to get it manually if not in context
        if (updatePhoneNumber) {
          // If no session in context, try to retrieve it from headers
          if (!session && ctx.headers) {
            try {
              // Convert headers to Headers object if needed
              let headersObj: Headers;
              if (typeof ctx.headers.get === "function") {
                headersObj = ctx.headers as Headers;
              } else {
                // Convert plain object to Headers
                headersObj = new Headers();
                for (const [key, value] of Object.entries(ctx.headers)) {
                  if (typeof value === "string") {
                    headersObj.set(key, value);
                  } else if (Array.isArray(value)) {
                    value.forEach((v) => headersObj.append(key, String(v)));
                  }
                }
              }
              
              // Try to get session from cookies
              // better-auth stores session token in cookies, try common cookie name patterns
              const cookieHeader = headersObj.get("cookie") || "";
              
              // Try different cookie name patterns (better-auth might use different names)
              const cookiePatterns = [
                /better-auth\.session_token=([^;]+)/,
                /better-auth_session_token=([^;]+)/,
                /session_token=([^;]+)/,
              ];
              
              let sessionToken: string | null = null;
              for (const pattern of cookiePatterns) {
                const match = cookieHeader.match(pattern);
                if (match) {
                  sessionToken = decodeURIComponent(match[1].trim());
                  break;
                }
              }
              
              if (sessionToken) {
                const [sessionRecord] = await db
                  .select()
                  .from(schema.session)
                  .where(eq(schema.session.token, sessionToken))
                  .limit(1);
                
                if (sessionRecord && sessionRecord.expiresAt > new Date()) {
                  // Session is valid, get the user
                  const [userRecord] = await db
                    .select()
                    .from(schema.user)
                    .where(eq(schema.user.id, sessionRecord.userId))
                    .limit(1);
                  
                  if (userRecord) {
                    userId = userRecord.id;
                    session = {
                      id: sessionRecord.id,
                      userId: sessionRecord.userId,
                      expiresAt: sessionRecord.expiresAt,
                      token: sessionRecord.token,
                    } as any;
                  }
                }
              }
            } catch (error) {
              // If session retrieval fails, we'll handle it below
              console.error("[auth] Failed to retrieve session from headers:", error);
            }
          }

          // If still no session when updatePhoneNumber is true, throw error
          if (!userId) {
            throw new APIError("UNAUTHORIZED", {
              message: "You must be logged in to add a phone number. Please sign in first.",
            });
          }
        }

        // If updatePhoneNumber is true and we have a session, update the existing user
        if (updatePhoneNumber && userId) {
          // Check if phone number is already taken by another user
          const existingUserWithPhone = await db
            .select()
            .from(schema.user)
            .where(eq(schema.user.phoneNumber, phoneNumberValue))
            .limit(1)
            .then((users) => users[0]);

          if (existingUserWithPhone && existingUserWithPhone.id !== userId) {
            throw new APIError("BAD_REQUEST", {
              message: "This phone number is already registered to another account",
            });
          }

          // Update existing user's phone number
          try {
          await db
            .update(schema.user)
            .set({
              phoneNumber: phoneNumberValue,
              phoneNumberVerified: true,
              lastLoginMethod: "phone",
              updatedAt: new Date(),
            })
            .where(eq(schema.user.id, userId));
          } catch (error: any) {
            // Handle unique constraint violation
            if (error?.code === "23505" && error?.constraint?.includes("phone_number")) {
              throw new APIError("BAD_REQUEST", {
                message: "This phone number is already registered to another account",
              });
            }
            throw error;
          }

          // Delete the verification record
          await db
            .delete(schema.verification)
            .where(eq(schema.verification.identifier, phoneNumberValue));

          // Get updated user
          const [updatedUser] = await db
            .select()
            .from(schema.user)
            .where(eq(schema.user.id, userId))
            .limit(1);

          if (!updatedUser) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "User not found",
            });
          }

          // Return success response with user and session
          return ctx.json({
            data: {
              user: updatedUser,
              session: session || null,
            },
          });
        }

        // If updatePhoneNumber was true but we didn't handle it above, something went wrong
        if (updatePhoneNumber) {
          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Failed to update phone number. Please try again.",
          });
        }

        // Otherwise, find existing user by phone number (login flow)
        // We no longer allow creating new users with phone-only authentication
        // Users must sign up with email first, then can add phone number
        let user = await db
          .select()
          .from(schema.user)
          .where(eq(schema.user.phoneNumber, phoneNumberValue))
          .limit(1)
          .then((users) => users[0]);

        if (!user) {
          // Phone number not found - user must sign up with email first
          throw new APIError("BAD_REQUEST", {
            message: "No account found with this phone number. Please sign up with email first, then add your phone number.",
          });
        }

        // Check if user has a valid email (not a placeholder)
        if (user.email && user.email.endsWith("@phone.studojo.local")) {
          throw new APIError("BAD_REQUEST", {
            message: "Please sign up with email first, then add your phone number.",
          });
        }

        // Update existing user's verification status
        await db
          .update(schema.user)
          .set({
            phoneNumberVerified: true,
            lastLoginMethod: "phone",
            updatedAt: new Date(),
          })
          .where(eq(schema.user.id, user.id));
        
        user.phoneNumberVerified = true;
        user.lastLoginMethod = "phone";

        // Delete the verification record
        await db
          .delete(schema.verification)
          .where(eq(schema.verification.identifier, phoneNumberValue));

        // Create session if not disabled
        let sessionData = null;
        if (!disableSession) {
          const sessionToken = generateId();
          const expiresAt = new Date();
          expiresAt.setTime(expiresAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

          // Get IP address and user agent from headers
          let ipAddress = "unknown";
          let userAgent = "unknown";
          
          if (ctx.headers) {
            if (typeof ctx.headers.get === "function") {
              // Headers object
              ipAddress = ctx.headers.get("x-forwarded-for") || 
                         ctx.headers.get("x-real-ip") || 
                         "unknown";
              userAgent = ctx.headers.get("user-agent") || "unknown";
            } else if (typeof ctx.headers === "object") {
              // Plain object
              ipAddress = (ctx.headers["x-forwarded-for"] as string) || 
                         (ctx.headers["x-real-ip"] as string) || 
                         "unknown";
              userAgent = (ctx.headers["user-agent"] as string) || "unknown";
            }
          }

          // Handle comma-separated IP addresses (take first one)
          if (typeof ipAddress === "string" && ipAddress.includes(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
          }

          [sessionData] = await db
            .insert(schema.session)
            .values({
              id: generateId(),
              token: sessionToken,
              userId: user.id,
              expiresAt,
              ipAddress,
              userAgent,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();
        }

        // Return success response
        return ctx.json({
          data: {
            user,
            session: sessionData,
          },
        });
      }
    }),
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "compact",
    },
    storeSessionInDatabase: true,
  },

  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: (googleClientId ?? "") as string,
      clientSecret: (googleClientSecret ?? "") as string,
    },
  },

  plugins: [
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        "This password has been found in a data breach. Please choose a different password.",
    }),
    lastLoginMethod({ storeInDatabase: true }),
    jwt(),
    admin(adminUserIds.length > 0 ? { adminUserIds } : {}),
    passkey({
      rpName: "Studojo",
    }),
    twoFactor(),
    phoneNumber({
      sendOTP: ({ phoneNumber: to, code }) => {
        sendOtpSms(to, code);
      },
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
      phoneNumberValidator: (value) => {
        const s = typeof value === "string" ? value.trim() : "";
        return s.length >= 10 && s.length <= 20 && /^\+?[0-9\s-]+$/.test(s);
      },
    }),
  ],
});
