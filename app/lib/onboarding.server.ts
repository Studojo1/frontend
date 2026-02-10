// Server-only file for onboarding utilities that need auth or database
// This file should NEVER be imported in client-side code

import { eq } from "drizzle-orm";
import { auth } from "~/lib/auth";
import db from "./db";
import { userProfile, user, newsletterSubscriptions } from "../../auth-schema";

export async function getSessionFromRequest(request: { headers: Headers }) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function getProfileStatus(userId: string) {
  const rows = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);
  const profile = rows[0] ?? null;
  return {
    completed: !!profile,
    profile: profile
      ? {
          id: profile.id,
          userId: profile.userId,
          fullName: profile.fullName,
          college: profile.college,
          yearOfStudy: profile.yearOfStudy,
          course: profile.course,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        }
      : null,
  };
}

/**
 * Check if user has completed profile (phone is optional)
 * Returns an object indicating what's missing
 * UX improvement: Phone verification is now optional to reduce friction
 */
export async function requireOnboardingComplete(userId: string) {
  // Get user to check phone number (optional)
  const [userRecord] = await db
    .select({
      phoneNumber: user.phoneNumber,
      phoneNumberVerified: user.phoneNumberVerified,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userRecord) {
    return {
      complete: false,
      hasPhone: false,
      hasProfile: false,
      missing: ["profile"] as const,
    };
  }

  // Check phone number (optional - for informational purposes only)
  const hasPhone = !!(
    userRecord.phoneNumber &&
    userRecord.phoneNumberVerified
  );

  // Check profile (required)
  const profileStatus = await getProfileStatus(userId);
  const hasProfile = profileStatus.completed;

  const missing: Array<"phone" | "profile"> = [];
  // Phone is optional, so don't add to missing
  if (!hasProfile) missing.push("profile");

  // UX improvement: Only profile is required, phone is optional
  return {
    complete: hasProfile, // Only require profile, phone is optional
    hasPhone,
    hasProfile,
    missing: missing as readonly ("phone" | "profile")[],
  };
}

export async function createProfile(
  userId: string,
  data: { fullName: string; college: string; yearOfStudy: string; course: string }
) {
  const id = crypto.randomUUID();
  // UX improvement: Use default values for optional fields to satisfy database notNull constraint
  // This allows users to skip optional fields without friction
  await db.insert(userProfile).values({
    id,
    userId,
    fullName: data.fullName,
    college: data.college || "Not specified",
    yearOfStudy: data.yearOfStudy || "Not specified",
    course: data.course || "Not specified",
  });
  const [row] = await db.select().from(userProfile).where(eq(userProfile.id, id)).limit(1);
  return row!;
}

/**
 * Check if user has admin role by calling control plane API
 * Returns true if user is admin, false otherwise
 */
export async function checkAdminAccess(request: { headers: Headers }): Promise<boolean> {
  try {
    // Get session to verify user is authenticated
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return false;
    }

    // Get JWT token for control plane API
    const authResponse = await auth.api.getAccessToken({
      headers: request.headers,
    });
    
    const token = (authResponse as any)?.token || (authResponse as any)?.accessToken || null;
    if (!token) {
      return false;
    }

    // Get control plane URL
    const controlPlaneUrl = process.env.CONTROL_PLANE_URL || 
      (process.env.NODE_ENV === "production" ? "https://api.studojo.com" : "http://localhost:8080");

    // Check admin access by calling admin API endpoint
    const response = await fetch(`${controlPlaneUrl}/v1/admin/users?limit=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("[checkAdminAccess] Error checking admin access:", error);
    return false;
  }
}

/**
 * Subscribe an email to the newsletter
 * Handles duplicate subscriptions gracefully by updating existing record if unsubscribed
 */
export async function subscribeToNewsletter(
  email: string,
  userId?: string,
  source?: string
) {
  // Check if subscription already exists
  const [existing] = await db
    .select()
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.email, email))
    .limit(1);

  if (existing) {
    // If already subscribed, return success
    if (!existing.unsubscribedAt) {
      // Update userId and source if provided and different
      if (userId && existing.userId !== userId) {
        await db
          .update(newsletterSubscriptions)
          .set({
            userId,
            source: source || existing.source,
          })
          .where(eq(newsletterSubscriptions.id, existing.id));
      }
      return { success: true, alreadySubscribed: true };
    }
    // If unsubscribed, resubscribe
    await db
      .update(newsletterSubscriptions)
      .set({
        userId: userId || existing.userId,
        unsubscribedAt: null,
        source: source || existing.source,
      })
      .where(eq(newsletterSubscriptions.id, existing.id));
    return { success: true, resubscribed: true };
  }

  // Create new subscription
  await db.insert(newsletterSubscriptions).values({
    email,
    userId: userId || null,
    source: source || null,
  });

  return { success: true, newSubscription: true };
}

/**
 * Unsubscribe an email from the newsletter
 */
export async function unsubscribeFromNewsletter(email: string) {
  const [existing] = await db
    .select()
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.email, email))
    .limit(1);

  if (!existing) {
    return { success: false, error: "Email not found in newsletter subscriptions" };
  }

  if (existing.unsubscribedAt) {
    return { success: true, alreadyUnsubscribed: true };
  }

  await db
    .update(newsletterSubscriptions)
    .set({
      unsubscribedAt: new Date(),
    })
    .where(eq(newsletterSubscriptions.id, existing.id));

  return { success: true };
}

