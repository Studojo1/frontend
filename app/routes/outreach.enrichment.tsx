import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiMail, FiCheckCircle, FiTag, FiCreditCard, FiArrowRight, FiCalendar, FiUsers, FiSend, FiInbox, FiZap } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { TierSelector } from "~/components/outreach/TierSelector";
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

const STEPS = [
  { icon: FiUsers, title: "We find hiring managers", body: "Verified email addresses at companies in your target industry, within 24 hours." },
  { icon: FiMail, title: "We write each email", body: "Personalised using your resume and the company's context. Not a template blast." },
  { icon: FiSend, title: "Emails go out over 5-7 days", body: "Spaced gradually to protect your Gmail sender score and maximise delivery." },
  { icon: FiInbox, title: "Replies land in your Gmail", body: "You take it from there. Most students hear back within a week." },
];

const INCLUDED = [
  "Verified emails - no bounces",
  "One personalised cold email per manager",
  "Automated send schedule (protects Gmail)",
  "Open and click tracking",
  "All replies to your Gmail inbox",
  "Full campaign dashboard",
];

export default function EnrichmentPage() {
  const isInIframe = typeof window !== "undefined" && window.self !== window.top;
  if (isInIframe) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center p-8">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
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
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
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

  const handlePayAndContinue = async () => {
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
  const displayPrice = couponResult?.valid
    ? `${currency === "INR" ? "₹" : "$"}${(couponResult.discounted_amount / 100).toFixed(0)}`
    : selectedPricing?.display_price || (selectedTier === 200 ? "$20" : selectedTier === 350 ? "$27" : "$40");
  const hasEnoughCredits = credits ? credits.available_credits >= selectedTier : false;
  const currSymbol = currency === "INR" ? "₹" : "$";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 md:px-8">
        {/* Two-column layout on desktop */}
        <div className="grid md:grid-cols-[1fr_380px] gap-6 items-start">

          {/* LEFT: value prop */}
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-studojo-purple-bg border-2 border-studojo-ink text-xs font-satoshi font-bold text-studojo-purple mb-3">
                <FiZap className="w-3 h-3" /> Done-for-you hiring manager outreach
              </div>
              <h1 className="font-clash text-2xl md:text-3xl font-bold text-studojo-ink leading-tight mb-2">
                Get your resume in front of hiring managers directly.
              </h1>
              <p className="font-satoshi text-sm text-studojo-muted">
                We find emails, write personalised cold emails from your resume, and send them automatically. You wait for replies.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { stat: "300+", label: "students launched" },
                { stat: "~8%", label: "reply rate" },
                { stat: "7 days", label: "to first reply" },
              ].map(({ stat, label }) => (
                <div key={label} className="rounded-xl border-2 border-studojo-ink bg-studojo-purple-bg/30 p-3 text-center">
                  <div className="font-clash text-xl font-bold text-studojo-purple">{stat}</div>
                  <div className="font-satoshi text-xs text-studojo-muted mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div>
              <p className="font-clash text-sm font-bold text-studojo-ink mb-2">What happens after you pay</p>
              <div className="space-y-2">
                {STEPS.map((step, i) => (
                  <div key={step.title} className="flex gap-3 p-3 rounded-xl border-2 border-studojo-ink/15 hover:border-studojo-ink/40 transition-colors">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple text-xs font-bold font-clash">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-satoshi font-bold text-xs text-studojo-ink">{step.title}</p>
                      <p className="font-satoshi text-xs text-studojo-muted mt-0.5">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Included */}
            <div className="rounded-xl border-2 border-studojo-ink/20 p-4">
              <p className="font-clash text-xs font-bold text-studojo-ink mb-2">Everything included</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {INCLUDED.map((item) => (
                  <div key={item} className="flex items-start gap-1.5">
                    <FiCheckCircle className="w-3.5 h-3.5 text-studojo-green mt-0.5 flex-shrink-0" />
                    <span className="font-satoshi text-xs text-studojo-ink">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: "Secure payment", sub: "Razorpay and Dodo" },
                { label: "No spam risk", sub: "Gradual send schedule" },
                { label: "Cancel anytime", sub: "Before campaign starts" },
                { label: "Real emails only", sub: "Verified before sending" },
              ].map(({ label, sub }) => (
                <div key={label} className="flex items-start gap-1.5">
                  <FiCheckCircle className="w-3.5 h-3.5 text-studojo-green mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-satoshi font-bold text-xs text-studojo-ink">{label}</p>
                    <p className="font-satoshi text-xs text-studojo-muted">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: pricing + payment */}
          <div className="space-y-4">
            {/* Credits */}
            {credits && credits.total_credits > 0 && (
              <div className="rounded-xl border-2 border-studojo-ink bg-studojo-green-bg/30 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold font-satoshi text-studojo-ink">Your credits</p>
                  <p className="text-xs text-studojo-muted font-satoshi">{credits.available_credits} available</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-satoshi font-bold bg-studojo-green-bg text-studojo-green border border-studojo-green/30">
                  {credits.available_credits} left
                </span>
              </div>
            )}

            {/* Tier selector */}
            <div>
              <p className="font-clash text-sm font-bold text-studojo-ink mb-1">Choose your tier</p>
              <p className="font-satoshi text-xs text-studojo-muted mb-3">More contacts = more chances at a reply.</p>
              <TierSelector
                selected={selectedTier}
                onSelect={(tier) => { setSelectedTier(tier); setCouponResult(null); setCouponError(""); }}
                pricing={pricing}
              />
            </div>

            {/* Coupon */}
            {!hasEnoughCredits && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <FiTag className="w-3.5 h-3.5 text-studojo-purple" />
                  <span className="font-satoshi text-xs font-bold text-studojo-ink">Have a coupon?</span>
                </div>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(""); }}
                    placeholder="Coupon code"
                    className="flex-1 h-9 px-3 rounded-xl border-2 border-studojo-ink/20 text-xs font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
                  />
                  <button
                    onClick={validateCoupon}
                    disabled={couponLoading}
                    className="h-9 px-3 rounded-xl bg-white text-studojo-ink text-xs font-satoshi font-bold border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
                {couponError && <p className="text-red-600 text-xs mt-1.5 font-satoshi">{couponError}</p>}
                {couponResult?.valid && (
                  <div className="mt-2 p-2.5 bg-studojo-green-bg rounded-xl border border-studojo-ink/20">
                    <p className="text-xs text-studojo-green font-bold font-satoshi">
                      {couponResult.discount_type === "percent"
                        ? `${couponResult.discount_value}% off`
                        : `${currSymbol}${(couponResult.discount_value / 100).toFixed(0)} off`}
                    </p>
                    <p className="text-xs text-studojo-muted font-satoshi mt-0.5">
                      <span className="line-through">{currSymbol}{(couponResult.original_amount / 100).toFixed(0)}</span>
                      {" to "}
                      <span className="text-studojo-green font-bold">{currSymbol}{(couponResult.discounted_amount / 100).toFixed(0)}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-red-600 text-xs font-satoshi">{error}</p>}

            {/* Pay button */}
            {hasEnoughCredits ? (
              <button
                onClick={() => onPaymentSuccess()}
                className="w-full h-12 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center justify-center gap-2"
              >
                Use my credits
                <FiArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePayAndContinue}
                disabled={paying}
                className="w-full h-12 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                <FiCreditCard className="w-4 h-4" />
                {paying ? "Processing..." : `Pay ${displayPrice} and start outreach`}
              </button>
            )}

            <p className="text-xs text-studojo-muted font-satoshi text-center">
              Emails send over 5-7 days. Most students get their first reply within a week.
            </p>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-studojo-ink/10" />
              <span className="text-xs text-studojo-muted font-satoshi">or</span>
              <div className="flex-1 h-px bg-studojo-ink/10" />
            </div>

            {/* Consultation CTA */}
            <a
              href={CONSULTATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl bg-white text-studojo-ink font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center justify-center gap-2"
            >
              <FiCalendar className="w-4 h-4 text-studojo-purple" />
              Book a free 15-min strategy call
            </a>
            <p className="text-xs text-studojo-muted font-satoshi text-center">
              Not sure yet? Talk to us first. No pressure.
            </p>
          </div>
        </div>
      </div>

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
