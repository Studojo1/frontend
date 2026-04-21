import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiMail, FiCheckCircle, FiTag, FiCreditCard, FiArrowRight, FiCalendar, FiUsers, FiSend, FiInbox, FiZap } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { TierSelector } from "~/components/outreach/TierSelector";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { useOrder } from "~/lib/outreach/hooks";
import { outreachFetch } from "~/lib/outreach/api";
import type { TierPricing } from "~/lib/outreach/types";

// Update this to your Calendly / scheduling link
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
  {
    icon: FiUsers,
    title: "We find your hiring managers",
    body: "Within 24 hours, we identify verified hiring managers at companies in your target industry — with confirmed email addresses.",
  },
  {
    icon: FiMail,
    title: "We write personalised emails",
    body: "Each email is written using your resume and the company's context. Not a template blast — actual personalised outreach.",
  },
  {
    icon: FiSend,
    title: "Emails go out automatically",
    body: "Sent gradually over 5–7 days to protect your Gmail reputation. Spacing increases deliverability and reply rates.",
  },
  {
    icon: FiInbox,
    title: "Replies land in your inbox",
    body: "Every reply comes straight to your Gmail. You take it from there. Most students hear back within a week.",
  },
];

const WHAT_YOU_GET = [
  "Verified email addresses — no guessing, no bounces",
  "One personalised cold email per hiring manager, written from your resume",
  "Automated send schedule over 5–7 days (protects your Gmail sender score)",
  "Open & click tracking so you see who engaged",
  "All replies delivered directly to your Gmail inbox",
  "Full campaign dashboard to monitor progress",
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
          <p className="text-sm text-gray-500">This window will close automatically...</p>
        </div>
      </div>
    );
  }

  const navigate = useNavigate();
  const { user, loading: authLoading } = useOutreachAuth();
  const { candidateId, selectedTier, setSelectedTier, orderId } = useOutreachStore();
  const { createOrder, updateOrder } = useOrder();

  useEffect(() => {
    if (!orderId && candidateId) createOrder(candidateId);
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
        method: "POST",
        body: JSON.stringify({ session_id: dodoSessionRef.current }),
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
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    } else { setRazorpayLoaded(true); }
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
      } catch {}
    };
    loadData();
  }, []);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError(""); setCouponResult(null);
    try {
      const data = await outreachFetch<CouponResult>("/payment/coupon/validate", {
        method: "POST",
        body: JSON.stringify({ code: couponCode.trim(), tier: selectedTier, currency }),
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
        dodoTierRef.current = selectedTier;
        dodoPollingRef.current = true;
        setDodoCheckoutUrl(orderData.checkout_url);
        pollDodoVerify(0); return;
      }
      const options = {
        key: orderData.key_id, amount: orderData.amount, currency: orderData.currency,
        name: "Studojo Outreach", description: `Contact ${selectedTier} Hiring Managers`,
        order_id: orderData.order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await outreachFetch("/payment/verify", { method: "POST", body: JSON.stringify(response) });
            setPaying(false); onPaymentSuccess();
          } catch (err: any) { setError(err?.body?.detail || err.message || "Payment verification failed"); setPaying(false); }
        },
        prefill: { email: user?.email || "", name: user?.name || "" },
        theme: { color: "#7C3AED" },
        modal: { ondismiss: () => setPaying(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => { setError(response.error?.description || "Payment failed"); setPaying(false); });
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-2xl px-4 py-10 md:px-8">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-studojo-purple-bg border-2 border-studojo-ink text-xs font-satoshi font-bold text-studojo-purple mb-5">
            <FiZap className="w-3.5 h-3.5" /> Done-for-you hiring manager outreach
          </div>
          <h1 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink leading-tight mb-3">
            Get your resume in front of<br />hiring managers directly.
          </h1>
          <p className="text-base text-studojo-muted font-satoshi max-w-md mx-auto">
            We find their emails, write personalised cold emails using your resume, and send them automatically. You just wait for replies.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { stat: "300+", label: "students launched" },
            { stat: "~8%", label: "average reply rate" },
            { stat: "7 days", label: "to first reply" },
          ].map(({ stat, label }) => (
            <div key={label} className="rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg/30 p-4 text-center">
              <div className="font-clash text-2xl font-bold text-studojo-purple">{stat}</div>
              <div className="font-satoshi text-xs text-studojo-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-10">
          <h2 className="font-clash text-lg font-bold text-studojo-ink mb-4">Here's exactly what happens</h2>
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-4 p-4 rounded-2xl border-2 border-studojo-ink/20 hover:border-studojo-ink transition-colors">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple">
                  <step.icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-satoshi font-bold text-studojo-muted uppercase tracking-wide">Step {i + 1}</span>
                  </div>
                  <p className="font-satoshi font-bold text-sm text-studojo-ink">{step.title}</p>
                  <p className="font-satoshi text-sm text-studojo-muted mt-0.5">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's included */}
        <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg/20 p-5 mb-10">
          <p className="font-clash text-sm font-bold text-studojo-ink mb-3">Everything included in every tier:</p>
          <ul className="space-y-2.5">
            {WHAT_YOU_GET.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm font-satoshi text-studojo-ink">
                <FiCheckCircle className="w-4 h-4 text-studojo-green mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Credits banner */}
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

        {/* Tier selector */}
        <h2 className="font-clash text-lg font-bold text-studojo-ink mb-3">Choose how many hiring managers</h2>
        <p className="font-satoshi text-sm text-studojo-muted mb-4">More contacts = more chances at a reply. We recommend 350 for most students.</p>
        <TierSelector
          selected={selectedTier}
          onSelect={(tier) => { setSelectedTier(tier); setCouponResult(null); setCouponError(""); }}
          pricing={pricing}
        />

        {/* Coupon */}
        {!hasEnoughCredits && (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-5 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <FiTag className="w-4 h-4 text-studojo-purple" />
              <h3 className="font-clash text-sm font-bold text-studojo-ink">Have a coupon?</h3>
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

        {/* CTAs */}
        <div className="mt-8 space-y-3">
          {hasEnoughCredits ? (
            <button
              onClick={() => onPaymentSuccess()}
              className="w-full h-14 rounded-2xl bg-studojo-purple text-white font-satoshi font-bold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center justify-center gap-2"
            >
              Contact {selectedTier} Hiring Managers — Use My Credits
              <FiArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handlePayAndContinue}
              disabled={paying}
              className="w-full h-14 rounded-2xl bg-studojo-purple text-white font-satoshi font-bold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <FiCreditCard className="w-5 h-5" />
              {paying ? "Processing..." : `Pay ${displayPrice} — Contact ${selectedTier} Hiring Managers`}
            </button>
          )}

          <p className="text-xs text-studojo-muted font-satoshi text-center">
            Emails send over 5–7 days. Most students get their first reply within a week.
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-studojo-ink/10" />
            <span className="text-xs text-studojo-muted font-satoshi">or</span>
            <div className="flex-1 h-px bg-studojo-ink/10" />
          </div>

          {/* Free consultation CTA */}
          <a
            href={CONSULTATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-14 rounded-2xl bg-white text-studojo-ink font-satoshi font-bold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center justify-center gap-2"
          >
            <FiCalendar className="w-5 h-5 text-studojo-purple" />
            Book a free 15-min strategy call first
          </a>
          <p className="text-xs text-studojo-muted font-satoshi text-center">
            Not sure if this is right for you? Talk to us first — no pressure, no sales pitch.
          </p>
        </div>

        {/* Trust footer */}
        <div className="mt-10 pt-6 border-t-2 border-studojo-ink/10 grid grid-cols-2 gap-4 text-center">
          {[
            { label: "Secure payment", sub: "Razorpay & Dodo Payments" },
            { label: "No spam risk", sub: "Gradual send protects your Gmail" },
            { label: "Cancel anytime", sub: "Before campaign starts" },
            { label: "Real emails only", sub: "Verified before sending" },
          ].map(({ label, sub }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="font-satoshi font-bold text-sm text-studojo-ink">{label}</span>
              <span className="font-satoshi text-xs text-studojo-muted">{sub}</span>
            </div>
          ))}
        </div>
      </div>

      <Footer />

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
