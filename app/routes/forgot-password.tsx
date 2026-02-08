import { useState } from "react";
import { Link } from "react-router";
import { Header } from "~/components";
import { requestPasswordReset } from "~/lib/emailer";
import { toast } from "sonner";
import type { Route } from "./+types/forgot-password";

const INPUT_CLASS =
  "w-full rounded-xl border-2 border-neutral-900 bg-white px-4 py-3 font-['Satoshi'] text-base font-normal leading-6 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2";
const LABEL_CLASS = "mb-2 block font-['Satoshi'] text-sm font-medium leading-5 text-neutral-900";
const BTN_PRIMARY =
  "rounded-2xl border-2 border-neutral-900 bg-purple-500 px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Forgot Password – Studojo" },
    {
      name: "description",
      content: "Reset your Studojo account password.",
    },
  ];
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
      toast.success("Password reset link sent! Check your email.");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send reset link. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-md px-4 py-16">
          <div className="rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <h1 className="mb-4 font-['Clash_Display'] text-2xl font-medium text-neutral-900">
              Check Your Email
            </h1>
            <p className="mb-6 font-['Satoshi'] text-base text-neutral-700">
              If an account exists with that email, we've sent a password reset link. Please check your inbox and follow the instructions.
            </p>
            <p className="mb-6 font-['Satoshi'] text-sm text-neutral-500">
              The link will expire in 1 hour. If you don't see the email, check your spam folder.
            </p>
            <Link
              to="/auth"
              className={BTN_PRIMARY + " block text-center"}
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
          <h1 className="mb-2 font-['Clash_Display'] text-2xl font-medium text-neutral-900">
            Forgot Password?
          </h1>
          <p className="mb-6 font-['Satoshi'] text-base text-neutral-700">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <div className="mb-4 rounded-xl border-2 border-purple-200 bg-purple-50 p-3">
            <p className="font-['Satoshi'] text-sm text-purple-900">
              <strong>Note:</strong> If you signed up with Google, you can use this to create a password for your account.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-50 p-3">
              <p className="font-['Satoshi'] text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className={LABEL_CLASS}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={INPUT_CLASS}
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !email}
              className={BTN_PRIMARY + " w-full"}
            >
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/auth"
              className="font-['Satoshi'] text-sm text-purple-600 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

