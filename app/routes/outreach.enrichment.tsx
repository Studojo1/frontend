import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiCreditCard, FiTag, FiCalendar, FiArrowRight, FiCheck } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { useOrder } from "~/lib/outreach/hooks";
import { outreachFetch } from "~/lib/outreach/api";
import type { TierPricing } from "~/lib/outreach/types";

const CONSULTATION_URL = "https://cal.com/studojo/internship-strategy";

declare global {
  interface Window { Razorpay: any; }
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

const TIERS = [
  { value: 200 as const, label: "Starter", desc: "Focused, targeted outreach" },
  { value: 350 as const, label: "Growth", desc: "Best balance of reach and quality", recommended: true },
  { value: 500 as const, label: "Scale", desc: "Maximum market coverage" },
];

const BULLETS = [
  "We find verified hiring manager emails at companies in your industry",
  "Each email is written personally from your resume — not a template",
  "Sent over 5-7 days automatically. Replies come straight to your Gmail.",
];

export default function EnrichmentPage() {
  const isInIframe = typeof window !== "undefined" && window.self !== window.top;
  if (isInIframe) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center p-8">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Payment Complete</h2>
          <p className="text-sm text-gray-500">Closing...</p>
        </div>
      </div>
    );
  }

  const navigate = useNavigate();
  const { user, loading: authLoading } = useOutreachAuth();
  const { candidateId, selectedTier, setSelectedTier, orderId } = useOutreachStore();
  const { createOrder, updateOrder } = useOrder();

  useEffect(() => { if (!orderId && candidateId) createOrder(candidateId); }, [orderId, candidateId]);

  const [pricing, setPricing] = useState<TierPricing[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [credits, setCredits] = useState<{ total_credits: number; used_credits: number; available_credits: number } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [dodoCheckoutUrl, setDodoCheckoutUrl] = useState<string | null>(null);
  const dodoSessionRef = useRef<string>("");
  const dodoPollingRef = useRef(false);

  const closeDodoModal = () => { setDodoCheckoutUrl(null); dodoPollingRef.current = false; };

  const onPaymentSuccess = async () => {
    try { setCredits(await outreachFetch("/payment/credits")); } catch {}
    updateOrder({ status: "campaign_setup", log_entry: `Payment completed for ${selectedTier} credits (JIT enrichment)` });
    navigate("/outreach/connect/gmail");
  };

  const pollDodoVerify = async (attempt: number) => {
    if (!dodoPollingRef.current) return;
    try {
      const res = await outreachFetch<{ status: string }>("/payment/verify-dodo", {
        method: "POST", body: JSON.stringify({ session_id: dodoSessionRef.current }),
      });
      if (res.status === "paid") { closeDodoModal(); setPaying(false); onPaymentSuccess(); return; }
      if (res.status === "failed") { closeDodoModal(); setError("Payment failed. Please try again."); setPaying(false); return; }
      if (attempt < 60 && dodoPollingRef.current) setTimeout(() => pollDodoVerify(attempt + 1), 3000);
    } catch {
      if (attempt < 60 && dodoPollingRef.current) setTimeout(() => pollDodoVerify(attempt + 1), 5000);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [pricingData, creditsData] = await Promise.all([
          outreachFetch<{ tiers: TierPricing[]; currency: string }>("/payment/pricing"),
          outreachFetch<{ total_credits: number; used_credits: number; available_credits: number }>("/payment/credits"),
        ]);
        setPricing(pricingData.tiers || []);
        if (pricingData.currency) setCurrency(pricingData.currency);
        setCredits(creditsData);
      } catch {}
    };
    load();
  }, []);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError(""); setCouponResult(null);
    try {
      const data = await outreachFetch<CouponResult>("/payment/coupon/validate", {
        method: "POST", body: JSON.stringify({ code: couponCode.trim(), tier: selectedTier, currency }),
      });
      setCouponResult(data);
    } catch (err: any) {
      setCouponError(err?.body?.detail || err.message || "Invalid coupon");
    } finally { setCouponLoading(false); }
  };

  const handlePay = async () => {
    if (!candidateId) return;
    if (credits && credits.available_credits >= selectedTier) { onPaymentSuccess(); return; }
    setPaying(true); setError("");
    try {
      const orderData = await outreachFetch<any>("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({ tier: selectedTier, currency, coupon_code: couponResult?.valid ? couponCode.trim() : undefined }),
      });
      if (orderData.free) {
        setCredits((prev) => prev
          ? { ...prev, total_credits: prev.total_credits + orderData.credits_granted, available_credits: prev.available_credits + orderData.credits_granted }
          : { total_credits: orderData.credits_granted, used_credits: 0, available_credits: orderData.credits_granted });
        setPaying(false); onPaymentSuccess(); return;
      }
      if (orderData.checkout_url) {
        dodoSessionRef.current = orderData.session_id;
        dodoPollingRef.current = true;
        setDodoCheckoutUrl(orderData.checkout_url);
        pollDodoVerify(0); return;
      }
      const options = {
        key: orderData.key_id, amount: orderData.amount, currency: orderData.currency,
        name: "Studojo Outreach", description: `Contact ${selectedTier} Hiring Managers`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            await outreachFetch("/payment/verify", { method: "POST", body: JSON.stringify(response) });
            setPaying(false); onPaymentSuccess();
          } catch (err: any) { setError(err?.body?.detail || err.message || "Verification failed"); setPaying(false); }
        },
        prefill: { email: user?.email || "", name: user?.name || "" },
        theme: { color: "#7C3AED" },
        modal: { ondismiss: () => setPaying(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r: any) => { setError(r.error?.description || "Payment failed"); setPaying(false); });
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

  if (!candidateId) { navigate("/outreach/onboarding/upload"); return null; }

  const selectedPricing = pricing.find((p) => p.tier === selectedTier);
  const currSymbol = currency === "INR" ? "₹" : "$";
  const displayPrice = couponResult?.valid
    ? `${currSymbol}${(couponResult.discounted_amount / 100).toFixed(0)}`
    : selectedPricing?.display_price || (selectedTier === 200 ? "$20" : selectedTier === 350 ? "$27" : "$40");
  const hasEnoughCredits = credits ? credits.available_credits >= selectedTier : false;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">

          {/* Headline */}
          <div>
            <h1 className="font-clash text-3xl font-bold text-studojo-ink leading-tight mb-2">
              Reach hiring managers directly.
            </h1>
            <p className="font-satoshi text-sm text-studojo-muted">
              We do the outreach. You focus on the interviews.
            </p>
          </div>

          {/* 3 bullets */}
          <ul className="space-y-2.5">
            {BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <div className="mt-0.5 w-4 h-4 rounded-full bg-studojo-purple flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="font-satoshi text-sm text-studojo-ink">{b}</span>
              </li>
            ))}
          </ul>

          {/* Tier selector */}
          <div className="grid grid-cols-3 gap-2">
            {TIERS.map((tier) => {
              const livePricing = pricing.find((p) => p.tier === tier.value);
              const price = livePricing?.display_price || (tier.value === 200 ? "$20" : tier.value === 350 ? "$27" : "$40");
              const isSelected = selectedTier === tier.value;
              return (
                <button
                  key={tier.value}
                  onClick={() => { setSelectedTier(tier.value); setCouponResult(null); setCouponError(""); }}
                  className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all text-center ${
                    isSelected
                      ? "border-studojo-ink bg-studojo-purple-bg shadow-brutal"
                      : "border-studojo-ink/20 hover:border-studojo-ink/60"
                  }`}
                >
                  {tier.recommended && (
                    <span className="absolute -top-2.5 text-[10px] font-satoshi font-bold bg-studojo-purple text-white px-2 py-0.5 rounded-full border border-studojo-ink">
                      Best
                    </span>
                  )}
                  <span className="font-clash text-xl font-bold text-studojo-purple">{tier.value}</span>
                  <span className="font-satoshi text-xs font-bold text-studojo-ink mt-0.5">{tier.label}</span>
                  <span className="font-satoshi text-xs text-studojo-muted mt-1">{price}</span>
                </button>
              );
            })}
          </div>
          <p className="font-satoshi text-xs text-studojo-muted text-center -mt-3">
            contacts — pick how many hiring managers to reach
          </p>

          {/* Credits notice */}
          {credits && credits.available_credits > 0 && (
            <div className="rounded-xl border-2 border-studojo-ink/20 bg-studojo-green-bg/40 px-4 py-2.5 flex items-center justify-between">
              <span className="font-satoshi text-xs text-studojo-ink font-bold">Your credits</span>
              <span className="font-satoshi text-xs text-studojo-green font-bold">{credits.available_credits} available</span>
            </div>
          )}

          {/* Coupon toggle */}
          {!hasEnoughCredits && (
            <div>
              <button
                onClick={() => setShowCoupon(!showCoupon)}
                className="flex items-center gap-1.5 text-xs font-satoshi text-studojo-muted hover:text-studojo-ink transition-colors"
              >
                <FiTag className="w-3.5 h-3.5" />
                {showCoupon ? "Hide coupon" : "Have a coupon code?"}
              </button>
              {showCoupon && (
                <div className="mt-2 flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(""); }}
                    placeholder="Enter code"
                    className="flex-1 h-9 px-3 rounded-xl border-2 border-studojo-ink/20 text-xs font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
                  />
                  <button
                    onClick={validateCoupon}
                    disabled={couponLoading}
                    className="h-9 px-4 rounded-xl bg-white text-studojo-ink text-xs font-satoshi font-bold border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-600 text-xs mt-1.5 font-satoshi">{couponError}</p>}
              {couponResult?.valid && (
                <div className="mt-2 px-3 py-2 bg-studojo-green-bg rounded-xl border border-studojo-ink/20 flex items-center justify-between">
                  <span className="text-xs text-studojo-green font-bold font-satoshi">
                    {couponResult.discount_type === "percent" ? `${couponResult.discount_value}% off` : `${currSymbol}${(couponResult.discount_value / 100).toFixed(0)} off`}
                  </span>
                  <span className="text-xs text-studojo-muted font-satoshi">
                    <span className="line-through">{currSymbol}{(couponResult.original_amount / 100).toFixed(0)}</span>
                    {" "}<span className="text-studojo-green font-bold">{currSymbol}{(couponResult.discounted_amount / 100).toFixed(0)}</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-600 text-xs font-satoshi">{error}</p>}

          {/* Primary CTA */}
          {hasEnoughCredits ? (
            <button
              onClick={onPaymentSuccess}
              className="w-full h-12 rounded-2xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center gap-2"
            >
              Use my credits <FiArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full h-12 rounded-2xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <FiCreditCard className="w-4 h-4" />
              {paying ? "Processing..." : `Pay ${displayPrice} and start outreach`}
            </button>
          )}

          {/* Divider + secondary CTA */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-studojo-ink/10" />
            <span className="text-xs text-studojo-muted font-satoshi">not ready?</span>
            <div className="flex-1 h-px bg-studojo-ink/10" />
          </div>

          <a
            href={CONSULTATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 rounded-2xl bg-white text-studojo-ink font-satoshi font-bold text-sm border-2 border-studojo-ink/40 hover:border-studojo-ink transition-colors flex items-center justify-center gap-2"
          >
            <FiCalendar className="w-4 h-4 text-studojo-purple" />
            Book a free 15-min strategy call
          </a>

        </div>
      </div>

      {/* Dodo modal */}
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
            <iframe src={dodoCheckoutUrl} className="w-full h-full border-0" allow="payment" />
          </div>
        </div>
      )}
    </div>
  );
}
