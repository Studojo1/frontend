import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError, getSessionFromCtx } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
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
import { sendTemplateEmail } from "./events";
import { welcomeAfterCommit } from "./welcome-after-commit";

// Helper to generate IDs similar to better-auth (base64url encoded random bytes)
// Browser-compatible implementation that works in both server and client
function generateId(): string {
  // Always use browser-compatible approach to avoid bundling Node.js crypto
  const array = new Uint8Array(16);
  
  // Use Web Crypto API if available (works in both browser and Node.js 15+)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else if (typeof window === "undefined" && typeof require !== "undefined") {
    // Server-side fallback: use Node.js crypto only if Web Crypto not available
    try {
      const nodeCrypto = require("crypto");
      const randomBytes = nodeCrypto.randomBytes(16);
      for (let i = 0; i < 16; i++) {
        array[i] = randomBytes[i];
      }
    } catch {
      // Fallback to Math.random if crypto not available
      for (let i = 0; i < 16; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
  } else {
    // Browser fallback: use Math.random (less secure but works)
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // Convert to base64url manually (browser-compatible, no Buffer needed)
  // Convert Uint8Array to string for btoa
  let binary = "";
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
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

// Welcome only once the sign-up has committed a login (see welcome-after-commit).
async function userHasLoginAccount(userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: schema.account.id })
    .from(schema.account)
    .where(eq(schema.account.userId, userId))
    .limit(1);
  return rows.length > 0;
}

async function publishWelcome(payload: { user_id: string; email: string; name?: string | null }) {
  const { publishEmailEvent } = await import("./events");
  // ONLY the new flow welcome fires on signup. The old transactional
  // event.user.signup ("welcome" template) is retired: it produced a
  // duplicate second welcome. cc-welcome-new-user is the single welcome and
  // also starts the Outreach not-used gate/chase.
  await publishEmailEvent("event.cc.welcome_new_user", payload);
}

export const auth = betterAuth({
  // Failed OAuth callbacks (bad or missing state) used to land on the homepage
  // with ?error=... that nothing reads. /auth shows a message (audit ST-N08).
  onAPIError: { errorURL: "/auth" },
  appName: "Studojo",
  database: drizzleAdapter(db, {
    provider: "pg",
    // Sign-up writes the user row and the credential (password) row separately.
    // better-auth wraps them in runWithTransaction, but the Drizzle adapter
    // ignores that unless this is on, so a failure between the two writes
    // left a user row with no way to log in: the email was "taken" and there
    // was no password to sign in with. 7 real students were locked out that way
    // (signup audit Q06/Q21). With this on, both rows commit or neither does.
    // Google sign-up (createOAuthUser) is covered by the same wrapper.
    transaction: true,
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
    // Add production origins from environment variable
    ...(process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) || []),
    // Add maverick URL if specified
    ...(process.env.MAVERICK_URL ? [process.env.MAVERICK_URL] : []),
    // API subdomain: needed for cross-origin cookie access from outreach and other services
    "https://api.studojo.com",
  ],
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
  
  // Enable CORS for admin panel, maverick, and dev panel
  cors: {
    enabled: true,
    origin: [
      baseURL,
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      // Add production origins from environment variable
      ...(process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) || []),
      // Add maverick URL if specified
      ...(process.env.MAVERICK_URL ? [process.env.MAVERICK_URL] : []),
      // Explicitly add dev.studojo.com if not already in CORS_ORIGINS
      ...(process.env.CORS_ORIGINS?.includes("dev.studojo.com") ? [] : ["https://dev.studojo.com"]),
      // API subdomain: needed for cross-origin requests from outreach and other services
      "https://api.studojo.com",
    ],
    credentials: true,
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // /phone-number/send-otp is not intercepted: OTP is sent even if the
      // phone is already registered (they may be signing in), and uniqueness
      // is enforced at /phone-number/verify below. A lookup used to run here
      // and discard its result.

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

        // Get verification SID from Redis (or try direct verification if Redis unavailable)
        let verificationSid = await getVerificationSid(phoneNumberValue);
        
        // If Redis is unavailable (local dev), try direct verification without SID
        // Twilio Verify API can verify without SID if the code is still valid
        if (!verificationSid) {
          console.warn("[auth] Verification SID not found in Redis, attempting direct verification without SID");
        }

        // Verify using Twilio Verify API (works with or without SID)
        const result = await verifyOtpCode(phoneNumberValue, code, verificationSid);
        
        // Log verification result for debugging
        console.log("[auth] Verification result:", { 
          valid: result.valid, 
          status: result.status, 
          error: result.error,
          hasSid: !!verificationSid 
        });

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
        // ctx.context.session is { session, user }. This read session.userId,
        // which does not exist, so it was always undefined and every call fell
        // through to a second session lookup below.
        let session = ctx.context?.session;
        let userId: string | undefined = session?.user?.id;

        // If updatePhoneNumber is true, we need a session - try to get it using better-auth's API
        if (updatePhoneNumber && !userId) {
          try {
            // Read the session from the request. getSessionFromCtx rather than
            // auth.api.getSession: this runs inside auth's own definition, and
            // referring to `auth` here made TypeScript give up on its type.
            const sessionResult = await getSessionFromCtx(ctx);

            if (sessionResult?.user) {
              userId = sessionResult.user.id;
              session = sessionResult;
            }
          } catch (error) {
            console.error("[auth] Failed to retrieve session:", error);
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
              const h = ctx.headers as unknown as Record<string, string | undefined>;
              ipAddress = h["x-forwarded-for"] || h["x-real-ip"] || "unknown";
              userAgent = h["user-agent"] || "unknown";
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

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Fire for ALL signup methods (email/password, Google OAuth, etc.)
          //
          // This hook runs INSIDE the sign-up transaction (see `transaction:
          // true` above), before the credential row is written and before
          // commit. Publishing here would welcome a user whose sign-up can
          // still roll back. So the welcome is sent only once the user AND a
          // login account are visible outside the transaction.
          void welcomeAfterCommit(user, {
            isCommitted: userHasLoginAccount,
            publish: publishWelcome,
          });
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 60, // 60 days, so day-10/21/30 emails land on a logged-in user
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "compact",
    },
    storeSessionInDatabase: true,
  },
  
  // Advanced cookie configuration for subdomain sharing
  advanced: {
    cookiePrefix: "better-auth",
    // Set cookie domain to .studojo.com so cookies are accessible across all subdomains
    // This allows admin.studojo.com and maverick.studojo.com to access cookies set by studojo.com
    cookieOptions: baseURL.includes("studojo.com") ? {
      domain: ".studojo.com",
      sameSite: "lax",
      secure: true,
    } : baseURL.includes("studojo.pro") ? {
      domain: ".studojo.pro",
      sameSite: "lax",
      secure: true,
    } : undefined,
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  // Email signups get a confirm link so email_verified means something (it was
  // false for every one of them). Sign-in is deliberately NOT gated on it:
  // requireEmailVerification stays off so nobody is blocked mid-funnel.
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Not awaited: signup must not wait on (or fail with) the emailer.
      void sendTemplateEmail(user.email, "verify-email", { user_name: user.name, action_url: url });
    },
  },
  socialProviders: {
    google: {
      clientId: (googleClientId ?? "") as string,
      clientSecret: (googleClientSecret ?? "") as string,
    },
  },

  plugins: [
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
