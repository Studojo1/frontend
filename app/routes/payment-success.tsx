import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { verifyDodoPayment } from "~/lib/payments";
import { outreachFetch } from "~/lib/outreach/api";
import { capturePostHog } from "~/lib/posthog";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id") || localStorage.getItem("dodo_session_id");
  const jobType = localStorage.getItem("dodo_pending_job_type");

  const [status, setStatus] = useState<"polling" | "paid" | "failed" | "error">("polling");
  const [error, setError] = useState("");

  const pollPayment = useCallback(
    async (attempts: number) => {
      if (!sessionId) {
        setStatus("error");
        setError("No session ID found");
        return;
      }

      try {
        // Use outreach API for outreach payments, control-plane for others
        const res = jobType === "outreach"
          ? await outreachFetch<{ status: string }>("/payment/verify-dodo", {
              method: "POST",
              body: JSON.stringify({ session_id: sessionId }),
            })
          : await verifyDodoPayment(sessionId);

        if (res.status === "paid") {
          setStatus("paid");
          capturePostHog("payment_confirmed", {
            job_type: jobType,
            session_id: sessionId,
          });
          return;
        }
        if (res.status === "failed") {
          setStatus("failed");
          return;
        }

        // Still pending — retry up to 30 times (90 seconds)
        if (attempts < 30) {
          setTimeout(() => pollPayment(attempts + 1), 3000);
        } else {
          setStatus("error");
          setError("Payment confirmation timed out. If you were charged, it will be credited automatically.");
        }
      } catch {
        if (attempts < 5) {
          setTimeout(() => pollPayment(attempts + 1), 3000);
        } else {
          setStatus("error");
          setError("Failed to verify payment. Please contact support if you were charged.");
        }
      }
    },
    [sessionId]
  );

  useEffect(() => {
    if (sessionId) {
      pollPayment(0);
    }
  }, [sessionId, pollPayment]);

  const handleContinue = () => {
    const jobType = localStorage.getItem("dodo_pending_job_type");
    localStorage.removeItem("dodo_pending_job_type");
    localStorage.removeItem("dodo_pending_file_url");
    localStorage.removeItem("dodo_pending_file_name");
    localStorage.removeItem("dodo_pending_career_form");
    localStorage.removeItem("dodo_session_id");
    localStorage.removeItem("dodo_pending_tier");

    if (jobType === "outreach") {
      navigate("/outreach/enrichment");
    } else if (jobType === "humanizer") {
      navigate("/dojos/humanizer");
    } else if (jobType === "career") {
      navigate("/careers");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border p-8 text-center">
        {status === "polling" && (
          <>
            <div className="flex justify-center mb-6">
              <Clock className="w-12 h-12 text-violet-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Confirming Payment</h1>
            <p className="text-gray-500 mb-6">Please wait while we confirm your payment...</p>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-violet-500" />
          </>
        )}

        {status === "paid" && (
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
            <p className="text-gray-500 mb-8">Your payment has been confirmed.</p>
            <button
              onClick={handleContinue}
              className="w-full py-3 px-6 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition"
            >
              Continue
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="flex justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-500 mb-8">Your payment could not be processed. Please try again.</p>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
            >
              Go Back
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-6">
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verification Pending</h1>
            <p className="text-gray-500 mb-8">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
