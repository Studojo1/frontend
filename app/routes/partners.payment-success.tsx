import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { partnersPost } from "~/lib/partners/api";
import type { Route } from "./+types/partners.payment-success";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Payment Complete | Studojo Partners" }];
}

export default function PartnersPaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "pending" | "error">("verifying");
  const [candidates, setCandidates] = useState<number | null>(null);

  useEffect(() => {
    const checkoutId = localStorage.getItem("partner_checkout_id");
    if (!checkoutId) {
      navigate("/partners/dashboard");
      return;
    }
    (async () => {
      try {
        const res = await partnersPost<{
          payment_status: string;
          db_status: string;
          candidates_purchased: number | null;
        }>(`/partners/payment/verify?checkout_id=${encodeURIComponent(checkoutId)}`, {});
        if (res.db_status === "completed" || res.payment_status === "succeeded") {
          setCandidates(res.candidates_purchased);
          setStatus("success");
          localStorage.removeItem("partner_checkout_id");
        } else {
          setStatus("pending");
        }
      } catch {
        setStatus("error");
      }
    })();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 font-['Satoshi'] px-4">
      <div className="w-full max-w-md text-center">
        {status === "verifying" && (
          <div className="rounded-2xl border-2 border-neutral-900 bg-white p-10 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
            <div className="mb-4 text-5xl">⏳</div>
            <h1 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900">Verifying payment...</h1>
            <p className="mt-2 text-sm text-neutral-500">This takes a second.</p>
          </div>
        )}

        {status === "success" && (
          <div className="rounded-2xl border-2 border-neutral-900 bg-white p-10 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
            <div className="mb-4 text-5xl">🎉</div>
            <h1 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900">Credits added.</h1>
            {candidates && (
              <p className="mt-2 text-neutral-600">
                <strong>{candidates.toLocaleString("en-IN")} candidate credits</strong> have been added to your account.
                That's <strong>{(candidates * 215).toLocaleString("en-IN")} leads</strong> to deliver.
              </p>
            )}
            <Link
              to="/partners/dashboard"
              className="mt-8 inline-block w-full rounded-xl border-2 border-neutral-900 bg-violet-500 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
            >
              Go to dashboard →
            </Link>
          </div>
        )}

        {status === "pending" && (
          <div className="rounded-2xl border-2 border-neutral-900 bg-white p-10 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
            <div className="mb-4 text-5xl">🕐</div>
            <h1 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900">Payment processing</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Your payment is being confirmed. Credits will appear in your dashboard within a few minutes.
            </p>
            <Link
              to="/partners/dashboard"
              className="mt-8 inline-block w-full rounded-xl border-2 border-neutral-900 bg-neutral-900 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
            >
              Go to dashboard
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border-2 border-red-400 bg-white p-10 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
            <div className="mb-4 text-5xl">⚠️</div>
            <h1 className="font-['Clash_Display'] text-2xl font-bold text-neutral-900">Verification failed</h1>
            <p className="mt-2 text-sm text-neutral-500">
              We could not verify your payment. If you were charged, your credits will be added shortly. Contact support if this persists.
            </p>
            <Link
              to="/partners/dashboard"
              className="mt-8 inline-block w-full rounded-xl border-2 border-neutral-900 bg-neutral-900 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
            >
              Go to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
