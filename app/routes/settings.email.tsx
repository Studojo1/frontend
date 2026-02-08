import { useEffect, useState } from "react";
import { Link, redirect } from "react-router";
import { Header } from "~/components";
import { authClient } from "~/lib/auth-client";
import { getEmailPreferences, updateEmailPreferences, type EmailPreferences } from "~/lib/emailer";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import { toast } from "sonner";
import type { Route } from "./+types/settings.email";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  
  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (!onboardingStatus.complete) {
    throw redirect("/onboarding");
  }
  
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Email Preferences – Studojo" },
    {
      name: "description",
      content: "Manage your email notification preferences.",
    },
  ];
}

export default function EmailSettings() {
  const { data: session } = authClient.useSession();
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      loadPreferences();
    }
  }, [session]);

  const loadPreferences = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const prefs = await getEmailPreferences(session.user.id);
      setPreferences(prefs);
    } catch (err: any) {
      setError(err.message || "Failed to load email preferences");
      toast.error("Failed to load email preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (field: keyof EmailPreferences, value: boolean) => {
    if (!session?.user?.id || !preferences) return;
    
    // Security emails cannot be disabled
    if (field === "security_emails" && !value) {
      toast.error("Security emails cannot be disabled for your account safety");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateEmailPreferences(session.user.id, {
        [field]: value,
      });
      setPreferences(updated);
      setSuccess("Email preferences updated successfully");
      toast.success("Preferences saved");
    } catch (err: any) {
      setError(err.message || "Failed to update preferences");
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!session?.user?.id || !preferences) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateEmailPreferences(session.user.id, {
        product_emails: preferences.product_emails,
        resume_emails: preferences.resume_emails,
        internship_emails: preferences.internship_emails,
        security_emails: true, // Always true
      });
      setPreferences(updated);
      setSuccess("Email preferences updated successfully");
      toast.success("Preferences saved");
    } catch (err: any) {
      setError(err.message || "Failed to update preferences");
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-purple-50">
          <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-20">
            <p className="font-['Satoshi'] text-base text-neutral-700">Loading preferences...</p>
          </div>
        </main>
      </>
    );
  }

  if (!preferences) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-purple-50">
          <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-20">
            <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-6">
              <p className="font-['Satoshi'] text-base text-red-700">
                Failed to load email preferences. Please try again.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-purple-50">
        <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-20">
          <div className="mb-6">
            <Link
              to="/settings"
              className="font-['Satoshi'] text-sm text-purple-600 hover:underline"
            >
              ← Back to Settings
            </Link>
          </div>

          <h1 className="mb-8 font-['Clash_Display'] text-4xl font-medium leading-tight tracking-tight text-neutral-900 md:text-5xl">
            Email Preferences
          </h1>

          <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="mb-6 font-['Satoshi'] text-base font-normal leading-6 text-neutral-700">
              Choose which types of emails you'd like to receive from Studojo.
            </p>

            {error && (
              <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3">
                <p className="font-['Satoshi'] text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl border-2 border-green-500 bg-green-50 px-4 py-3">
                <p className="font-['Satoshi'] text-sm font-medium text-green-700">{success}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Product Emails */}
              <div className="flex items-start justify-between border-b border-neutral-200 pb-6">
                <div className="flex-1">
                  <h3 className="mb-2 font-['Clash_Display'] text-lg font-medium text-neutral-900">
                    Product Updates
                  </h3>
                  <p className="font-['Satoshi'] text-sm text-neutral-600">
                    Receive emails about new features, tips, and product updates.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={preferences.product_emails}
                    onChange={(e) => handleToggle("product_emails", e.target.checked)}
                    disabled={saving}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-neutral-300 transition-colors peer-checked:bg-purple-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>

              {/* Resume Emails */}
              <div className="flex items-start justify-between border-b border-neutral-200 pb-6">
                <div className="flex-1">
                  <h3 className="mb-2 font-['Clash_Display'] text-lg font-medium text-neutral-900">
                    Resume Updates
                  </h3>
                  <p className="font-['Satoshi'] text-sm text-neutral-600">
                    Get notified when your resume optimization is complete.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={preferences.resume_emails}
                    onChange={(e) => handleToggle("resume_emails", e.target.checked)}
                    disabled={saving}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-neutral-300 transition-colors peer-checked:bg-purple-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>

              {/* Internship Emails */}
              <div className="flex items-start justify-between border-b border-neutral-200 pb-6">
                <div className="flex-1">
                  <h3 className="mb-2 font-['Clash_Display'] text-lg font-medium text-neutral-900">
                    Internship Updates
                  </h3>
                  <p className="font-['Satoshi'] text-sm text-neutral-600">
                    Receive confirmation emails when you apply to internships.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={preferences.internship_emails}
                    onChange={(e) => handleToggle("internship_emails", e.target.checked)}
                    disabled={saving}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-neutral-300 transition-colors peer-checked:bg-purple-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>

              {/* Security Emails */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 font-['Clash_Display'] text-lg font-medium text-neutral-900">
                    Security Emails
                  </h3>
                  <p className="font-['Satoshi'] text-sm text-neutral-600">
                    Important security notifications, password resets, and account alerts. These cannot be disabled.
                  </p>
                </div>
                <label className="relative inline-flex cursor-not-allowed items-center opacity-60">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-purple-500"></div>
                  <div className="absolute left-1 top-1 h-4 w-4 translate-x-5 rounded-full bg-white"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

