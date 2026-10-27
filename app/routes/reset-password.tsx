import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { Footer, Header } from "~/components";
import { useSiteB2c } from "~/components/site-b2c/host";
import { AuthTop } from "~/components/site-b2c/auth-top";
import { PasswordInput } from "~/components/password-input";
import { resetPassword } from "~/lib/emailer";
import { toast } from "sonner";
import type { Route } from "./+types/reset-password";

const BTN_PRIMARY =
  "rounded-2xl border-2 border-neutral-900 bg-purple-500 px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Reset Password | Studojo" },
    {
      name: "description",
      content: "Reset your Studojo account password.",
    },
  ];
}

export default function ResetPassword() {
  // SITE-V2 (27 Oct 2026): on B2C hosts (studojo.pro, site-b2c/host.tsx) the page wears the site's calm white-card
  // look, visual only: the root gets "sv2-auth", the card and a few boxes a data-b2c mark (site-b2c/site-pages.css,
  // html[data-sv2="auth"]), Stu's head and a kicker top the card, the buttons gain .sv-btn and the compact site
  // footer follows. Fields, handlers, links and text are the same on both hosts (app/lib/auth-b2c.test.mjs).
  const b2c = useSiteB2c();
  const b2cMark = (part: string) => (b2c ? { "data-b2c": part } : {});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordCreated, setPasswordCreated] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await resetPassword(token, password);
      setSuccess(true);
      const isCreated = result.password_created === "true";
      setPasswordCreated(isCreated);
      
      if (isCreated) {
        toast.success("Password created successfully! You can now sign in with email and password or continue using Google.");
      } else {
        toast.success("Password reset successfully! You can now sign in.");
      }
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to reset password. The link may have expired.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={b2c ? "sv2-auth" : "min-h-screen bg-white"}>
        <Header />
        <div className="mx-auto max-w-md px-4 py-16">
          <div {...b2cMark("shell")} className="rounded-2xl border-2 border-neutral-900 bg-green-50 p-8 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            {b2c && <AuthTop kicker="your studojo account" size={56} />}
            <h1 className="mb-4 font-['Clash_Display'] text-2xl font-medium text-neutral-900">
              {passwordCreated ? "Password Created Successfully!" : "Password Reset Successful!"}
            </h1>
            <p className="mb-6 font-['Satoshi'] text-base text-neutral-700">
              {passwordCreated 
                ? "Your password has been created successfully! You can now sign in with either your email and password or continue using Google."
                : "Your password has been reset successfully. You can now sign in with your new password."}
            </p>
            <Link
              to="/auth"
              className={(b2c ? "sv-btn sv-btn-wide " : "") + BTN_PRIMARY + " block text-center"}
            >
              Go to Sign In
            </Link>
          </div>
        </div>
        {b2c && <Footer compact />}
      </div>
    );
  }

  return (
    <div className={b2c ? "sv2-auth" : "min-h-screen bg-white"}>
      <Header />
      <div className="mx-auto max-w-md px-4 py-16">
        <div {...b2cMark("shell")} className="rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
          {b2c && <AuthTop kicker="your studojo account" size={56} />}
          <h1 className="mb-2 font-['Clash_Display'] text-2xl font-medium text-neutral-900">
            Reset Your Password
          </h1>
          <p className="mb-6 font-['Satoshi'] text-base text-neutral-700">
            Enter your new password below.
          </p>

          {error && (
            <div {...b2cMark("error")} className="mb-4 rounded-xl border-2 border-red-500 bg-red-50 p-3">
              <p className="font-['Satoshi'] text-sm text-red-700">{error}</p>
            </div>
          )}

          {!token && (
            <div {...b2cMark("warn")} className="mb-4 rounded-xl border-2 border-yellow-500 bg-yellow-50 p-3">
              <p className="font-['Satoshi'] text-sm text-yellow-700">
                No reset token found. Please use the link from your email or request a new one.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              disabled={submitting || !token}
              minLength={8}
              showStrength={true}
              label="New Password"
            />

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              disabled={submitting || !token}
              minLength={8}
              label="Confirm Password"
            />

            <button
              type="submit"
              disabled={submitting || !token || !password || !confirmPassword}
              className={(b2c ? "sv-btn sv-btn-wide " : "") + BTN_PRIMARY + " w-full"}
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div {...b2cMark("switch")} className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="font-['Satoshi'] text-sm text-purple-600 hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
      {b2c && <Footer compact />}
    </div>
  );
}

