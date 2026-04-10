import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiMail, FiCheckCircle, FiTag, FiCreditCard } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { TierSelector } from "~/components/outreach/TierSelector";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { useOrder } from "~/lib/outreach/hooks";
import { outreachFetch } from "~/lib/outreach/api";
import type { TierPricing } from "~/lib/outreach/types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CouponResult {
  valid: boolean;
  coupon_id: number;
  discount_type: string;
  discount_value: number;
  original_amount: number;
  discounted_amount: number;
  currency: string;
  distributor: string | null;
}

export default function EnrichmentPage() {
  // If rendered inside the Dodo modal iframe after payment redirect, show minimal UI
  const isInIframe = typeof window !== "undefined" && window.self !== window.top;
  if (isInIframe) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center p-8">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Payment Complete</h2>
          <p className="text-sm text-gray-500">This window will close automatically...</p>
        </div>
      </div>
    );
  }

  const navigate = useNavigate();
  const { user, loading: authLoading } = useOutreachAuth();
  const { candidateId, selectedTier, setSelectedTier, orderId } = useOutreachStore();
  const { createOrder, updateOrder } = useOrder();

  // Ensure an order record exists — create one if this is a fresh user
  useEffect(() => {
    if (!orderId && candidateId) {
      createOrder(candidateId);
    }
  }, [orderId, candidateId]);

  const [pricing, setPricing] = useState<TierPricing[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [credits, setCredits] = useState<{ total_credits: number; used_credits: number; available_credits: number } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [dodoCheckoutUrl, setDodoCheckoutUrl] = useState<string | null>(null);
  const dodoSessionRef = useRef<string>("");
  const dodoTierRef = useRef<number>(0);
  const dodoPollingRef = useRef(false);

  const closeDodoModal = () => {
    setDodoCheckoutUrl(null);
    dodoPollingRef.current = false;
  };

  // After payment succeeds, advance order and navigate to campaign setup
  const onPaymentSuccess = async () => {
    try {
      setCredits(await outreachFetch("/payment/credits"));
    } catch {}
    // JIT: skip enrichment, go directly to Gmail connect / campaign setup
    updateOrder({ status: "campaign_setup", log_entry: `Payment completed for ${selectedTier} credits (JIT enrichment)` });
    navigate("/outreach/connect/gmail");
  };

  // Poll verify-dodo while modal is open
  const pollDodoVerify = async (attempt: number) => {
    if (!dodoPollingRef.current) return;
    try {
      const res = await outreachFetch<{ status: string }>("/payment/verify-dodo", {
        method: "POST",
        body: JSON.stringify({ session_id: dodoSessionRef.current }),
      });
      if (res.status === "paid") {
        closeDodoModal();
        setPaying(false);
        onPaymentSuccess();
        return;
      }
      if (res.status === "failed") {
        closeDodoModal();
        setError("Payment failed. Please try again.");
        setPaying(false);
        return;
      }
      if (attempt < 60 && dodoPollingRef.current) {
        setTimeout(() => pollDodoVerify(attempt + 1), 3000);
      }
    } catch {
      if (attempt < 60 && dodoPollingRef.current) {
        setTimeout(() => pollDodoVerify(attempt + 1), 5000);
      }
    }
  };

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pricingData, creditsData] = await Promise.all([
          outreachFetch<{ tiers: TierPricing[]; currency: string }>("/payment/pricing"),
          outreachFetch<{ total_credits: number; used_credits: number; available_credits: number }>("/payment/credits"),
        ]);
        setPricing(pricingData.tiers || []);
        if (pricingData.currency) setCurrency(pricingData.currency);
        setCredits(creditsData);
      } catch {
        // fallback tiers
      }
    };
    loadData();
  }, []);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponResult(null);
    try {
      const data = await outreachFetch<CouponResult>("/payment/coupon/validate", {
        method: "POST",
        body: JSON.stringify({ code: couponCode.trim(), tier: selectedTier, currency }),
      });
      setCouponResult(data);
    } catch (err: any) {
      setCouponError(err?.body?.detail || err.message || "Invalid coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePayAndContinue = async () => {
    if (!candidateId) return;

    // If user already has enough credits, skip payment
    if (credits && credits.available_credits >= selectedTier) {
      onPaymentSuccess();
      return;
    }

    setPaying(true);
    setError("");
    try {
      const orderData = await outreachFetch<any>("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({ tier: selectedTier, currency, coupon_code: couponResult?.valid ? couponCode.trim() : undefined }),
      });

      if (orderData.free) {
        setCredits((prev) => prev
          ? { ...prev, total_credits: prev.total_credits + orderData.credits_granted, available_credits: prev.available_credits + orderData.credits_granted }
          : { total_credits: orderData.credits_granted, used_credits: 0, available_credits: orderData.credits_granted }
        );
        setPaying(false);
        onPaymentSuccess();
        return;
      }

      // Dodo Payments modal checkout (international users)
      if (orderData.checkout_url) {
        dodoSessionRef.current = orderData.session_id;
        dodoTierRef.current = selectedTier;
        dodoPollingRef.current = true;
        setDodoCheckoutUrl(orderData.checkout_url);
        pollDodoVerify(0);
        return;
      }

      // Razorpay modal checkout (India)
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Outreach",
        description: `Contact ${selectedTier} Hiring Managers`,
        order_id: orderData.order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await outreachFetch("/payment/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            setPaying(false);
            onPaymentSuccess();
          } catch (err: any) {
            setError(err?.body?.detail || err.message || "Payment verification failed");
            setPaying(false);
          }
        },
        prefill: { email: user?.email || "", name: user?.name || "" },
        theme: { color: "#7C3AED" },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setError(response.error?.description || "Payment failed");
        setPaying(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err?.body?.detail || err.message || "Failed to create payment order");
      setPaying(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!candidateId) {
    navigate("/outreach/onboarding/upload");
    return null;
  }

  const selectedPricing = pricing.find((p) => p.tier === selectedTier);
  const displayPrice = couponResult?.valid
    ? `${currency === "INR" ? "₹" : "$"}${(couponResult.discounted_amount / 100).toFixed(0)}`
    : selectedPricing?.display_price || (selectedTier === 200 ? "$20" : selectedTier === 350 ? "$27" : "$40");

  const hasEnoughCredits = credits ? credits.available_credits >= selectedTier : false;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center mx-auto text-studojo-purple mb-6">
            <FiMail className="w-7 h-7" />
          </div>
          <h1 className="font-clash text-2xl font-bold text-studojo-ink">Contact Your Hiring Managers</h1>
          <p className="text-sm text-studojo-muted mt-2 font-satoshi">Choose how many to reach out to — we'll handle everything else.</p>
        </div>

        {/* Value checklist — what they're getting */}
        <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg/30 p-5 mb-8">
          <p className="font-clash text-sm font-bold text-studojo-ink mb-3">Here's what you get:</p>
          <ul className="space-y-2">
            {[
              "Verified email addresses for your hiring managers",
              "A personalised email written for each one (based on your resume)",
              "Emails sent gradually over several days — protects your Gmail reputation",
              "Replies land straight in your inbox",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm font-satoshi text-studojo-ink">
                <FiCheckCircle className="w-4 h-4 text-studojo-green mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {credits && credits.total_credits > 0 && (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-studojo-green-bg border-2 border-studojo-ink flex items-center justify-center">
                <span className="text-studojo-green text-sm font-bold">$</span>
              </div>
              <div>
                <p className="text-sm font-bold font-satoshi text-studojo-ink">Your Credits</p>
                <p className="text-xs text-studojo-muted font-satoshi">{credits.available_credits} available / {credits.total_credits} total</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium bg-studojo-green-bg text-studojo-green border border-studojo-green/30">
              {credits.available_credits} credits
            </span>
          </div>
        )}

        <TierSelector
          selected={selectedTier}
          onSelect={(tier) => { setSelectedTier(tier); setCouponResult(null); setCouponError(""); }}
          pricing={pricing}
        />

        {!hasEnoughCredits && (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <FiTag className="w-5 h-5 text-studojo-purple" />
              <h3 className="font-clash text-base font-bold text-studojo-ink">Have a coupon?</h3>
            </div>
            <div className="flex gap-3">
              <input
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(""); }}
                placeholder="Enter coupon code"
                className="flex-1 h-10 px-4 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
              />
              <button
                onClick={validateCoupon}
                disabled={couponLoading}
                className="h-10 px-4 rounded-xl bg-white text-studojo-ink text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50"
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            </div>
            {couponError && <p className="text-red-600 text-xs mt-2 font-satoshi">{couponError}</p>}
            {couponResult?.valid && (
              <div className="mt-3 p-3 bg-studojo-green-bg rounded-xl border-2 border-studojo-ink/20">
                <p className="text-sm text-studojo-green font-bold font-satoshi">
                  {couponResult.discount_type === "percent"
                    ? `${couponResult.discount_value}% off`
                    : `${currency === "INR" ? "₹" : "$"}${(couponResult.discount_value / 100).toFixed(0)} off`}
                  {couponResult.distributor && <span className="text-studojo-muted font-normal"> via {couponResult.distributor}</span>}
                </p>
                <p className="text-xs text-studojo-muted font-satoshi mt-1">
                  <span className="line-through">{currency === "INR" ? "₹" : "$"}{(couponResult.original_amount / 100).toFixed(0)}</span>
                  {" → "}
                  <span className="text-studojo-green font-bold">{currency === "INR" ? "₹" : "$"}{(couponResult.discounted_amount / 100).toFixed(0)}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-600 text-sm text-center mt-6 font-satoshi">{error}</p>}

        <div className="flex flex-col items-center gap-3 mt-10">
          {hasEnoughCredits ? (
            <button
              onClick={() => onPaymentSuccess()}
              className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
            >
              Contact {selectedTier} Hiring Managers (Use Credits)
            </button>
          ) : (
            <button
              onClick={handlePayAndContinue}
              disabled={paying}
              className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center disabled:opacity-50 disabled:pointer-events-none"
            >
              <FiCreditCard className="w-5 h-5 mr-2" /> {paying ? "Processing..." : `Pay ${displayPrice} — Contact ${selectedTier} Hiring Managers`}
            </button>
          )}
          <p className="text-xs text-studojo-muted font-satoshi text-center max-w-md">
            Your emails go out automatically over several days. Most students get their first reply within a week.
          </p>
        </div>
      </div>
      <Footer />

      {/* Dodo Payments checkout modal */}
      {dodoCheckoutUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => { closeDodoModal(); setPaying(false); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ width: "min(480px, 95vw)", height: "min(640px, 90vh)" }}>
            <button
              onClick={() => { closeDodoModal(); setPaying(false); }}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg font-bold"
            >
              &times;
            </button>
            <iframe
              src={dodoCheckoutUrl}
              className="w-full h-full border-0"
              allow="payment"
            />
          </div>
        </div>
      )}
    </div>
  );
}
