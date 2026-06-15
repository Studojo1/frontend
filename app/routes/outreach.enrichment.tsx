import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiMail, FiCheckCircle, FiTag, FiCreditCard, FiArrowRight } from "react-icons/fi";
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

  // Funnel: stamp "payment_page_reached" the first time the user lands on
  // this page. This page is where pricing is shown, so it's the true
  // "saw paywall" signal — much more accurate than only counting users
  // who later clicked Pay (which already lives in PaymentOrder.created_at).
  // Idempotent on the server; safe to fire on every mount. Fire-and-forget.
  const funnelPingedRef = useRef(false);
  useEffect(() => {
    if (funnelPingedRef.current) return;
    if (authLoading || !user) return;
    funnelPingedRef.current = true;
    outreachFetch("/orders/funnel/mark", {
      method: "POST",
      body: JSON.stringify({ stage: "payment_page_reached" }),
    }).catch(() => { /* never break the page */ });

    // New efficient flow: reaching the payment page schedules the abandoned-
    // checkout sequence (2h buffer, then "you were right there" + a founder
    // coupon). It is DEFERRED, so a student who pays within the window never
    // gets it: payment success cancels all pending cc_ emails. Runs in the
    // browser, so it goes through the server resource route that holds the
    // internal secret (the emailer endpoint is gated).
    import("~/lib/events").then(({ publishEmailEventFromClient }) => {
      publishEmailEventFromClient("event.cc.outreach_payment_page", {
        user_id: user.id,
        email: user.email,
        name: user.name,
      }).catch(() => {});
    }).catch(() => {});
  }, [authLoading, user]);

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
    // New efficient flow: cancel any pending abandoned-checkout / nudge emails
    // now that the user has paid. event.cc.paid is cancel-only (no email).
    if (user?.id) {
      import("~/lib/events").then(({ publishEmailEventFromClient }) => {
        publishEmailEventFromClient("event.cc.paid", { user_id: user.id }).catch(() => {});
      }).catch(() => {});
    }
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
        // If the user already has credits but the store defaulted to a higher
        // tier than they can afford, snap down to the highest affordable tier.
        const available = creditsData.available_credits;
        if (available > 0 && available < selectedTier) {
          if (available >= 200) setSelectedTier(200);
        }
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

  const currSymbol = currency === "INR" ? "₹" : "$";
  const hasEnoughCredits = credits ? credits.available_credits >= selectedTier : false;

  const SHARED_FEATURES = (count: number) => [
    `${count} verified hiring managers`,
    "Tailored to your role & industry",
    "AI-personalised email per contact",
    "Inbox-safe drip schedule",
    "Live reply tracking dashboard",
    "Email support",
  ];

  const TIERS = [
    ...(currency === "INR" ? [{
      value: 50 as const,
      name: "Starter",
      tagline: "50 emails over 8 days. A focused sprint.",
      fallbackPrice: "₹499",
      durationDays: 8,
      features: [
        "50 verified hiring managers",
        "Tailored to your role & industry",
        "AI-personalised email per contact",
        "8-day controlled send window",
        "Reply tracking dashboard",
        "Email support",
      ],
    }] : []),
    {
      value: 200 as const,
      name: "Growth",
      tagline: "200 decision makers. Cast a wide net.",
      fallbackPrice: "$20",
      features: SHARED_FEATURES(200),
    },
    {
      value: 350 as const,
      name: "Pro",
      tagline: "350 contacts. The most popular choice.",
      fallbackPrice: "$27",
      recommended: true,
      features: SHARED_FEATURES(350),
    },
    {
      value: 500 as const,
      name: "Scale",
      tagline: "500 contacts. Maximum coverage.",
      fallbackPrice: "$40",
      features: SHARED_FEATURES(500),
    },
  ];


  const getTierPrice = (tierValue: number) => {
    const match = pricing.find((p) => p.tier === tierValue);
    if (match) {
      const discounted = couponResult?.valid && selectedTier === tierValue ? couponResult.discounted_amount : null;
      const raw = match.amount_cents;
      return {
        display: match.display_price || `${currSymbol}${(raw / 100).toFixed(0)}`,
        discounted: discounted ? `${currSymbol}${(discounted / 100).toFixed(0)}` : null,
        anchor: match.anchor_display ?? null,         // e.g. "₹2500" — struck-out
        discountPct: match.discount_pct ?? null,      // e.g. 27 — "Save 27%"
      };
    }
    const fallback = TIERS.find((t) => t.value === tierValue)?.fallbackPrice ?? "—";
    return { display: fallback, discounted: null, anchor: null, discountPct: null };
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Colleges marquee */}
      <div className="py-5 bg-studojo-surface-muted border-b-2 border-studojo-ink overflow-hidden">
        <p className="font-satoshi text-xs font-bold uppercase tracking-widest text-studojo-muted text-center mb-4">
          Students from these colleges use Studojo
        </p>
        {[
          ["IIT Bombay","NUS Singapore","BITS Pilani","UCL London","IIT Delhi","NTU Singapore","VIT Vellore","University of Toronto","IIT Madras","Symbiosis Pune","NYU","NIT Trichy","King's College London","Manipal University","University of Melbourne","NMIMS Mumbai","IIT Kharagpur","Christ University","UNSW Sydney","Amity University"],
          ["Delhi University","NIT Warangal","Monash University","SRM University","University of Manchester","BITS Hyderabad","SMU Singapore","Anna University","University of Dubai","Jadavpur University","Panjab University","University of Warwick","Thapar University","Northeastern University","PSG Tech","Loughborough University","Shiv Nadar University","University of Bath","KIIT University","Hult International"],
        ].map((row, ri) => (
          <div key={ri} className="overflow-hidden mb-3 last:mb-0">
            <div className={`flex gap-3 w-max ${ri === 1 ? "animate-marquee-reverse" : "animate-marquee"}`}>
              {[...row, ...row].map((c, i) => (
                <span key={i} className="shrink-0 px-4 py-1.5 rounded-full border-2 border-studojo-ink bg-white font-satoshi text-xs font-semibold text-studojo-ink whitespace-nowrap">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink">Contact Hiring Managers Directly</h1>
          <p className="text-base text-studojo-muted mt-3 font-satoshi max-w-xl mx-auto">
            Skip the job board queue. We find verified emails, write personalised messages, and send them on your behalf.
          </p>
        </div>

        {/* Credits banner */}
        {credits && credits.total_credits > 0 && (
          <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-green-bg/30 p-4 mb-8 flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-studojo-green-bg border-2 border-studojo-ink flex items-center justify-center">
                <span className="text-studojo-green text-sm font-bold">{currSymbol}</span>
              </div>
              <div>
                <p className="text-sm font-bold font-satoshi text-studojo-ink">You have credits</p>
                <p className="text-xs text-studojo-muted font-satoshi">{credits.available_credits} available</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-satoshi font-bold bg-studojo-green-bg text-studojo-green border-2 border-studojo-ink">
              {credits.available_credits} credits
            </span>
          </div>
        )}

        {/* Tier cards */}
        <div className={`grid grid-cols-1 ${TIERS.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"} gap-4 mb-8 items-stretch`}>
          {TIERS.map((tier) => {
            const price = getTierPrice(tier.value);
            const isSelected = selectedTier === tier.value;
            const hasCredits = credits ? credits.available_credits >= tier.value : false;
            const isStarter = "durationDays" in tier && !!tier.durationDays;

            return (
              <div
                key={tier.value}
                onClick={() => { setSelectedTier(tier.value); setCouponResult(null); setCouponError(""); }}
                className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all flex flex-col ${
                  tier.recommended
                    ? "border-studojo-purple bg-studojo-purple-bg/20 shadow-[4px_4px_0px_0px_rgba(124,58,237,1)]"
                    : isSelected
                    ? "border-studojo-ink bg-white shadow-brutal"
                    : "border-studojo-ink/20 bg-white hover:border-studojo-ink/50"
                }`}
              >
                {/* Badges */}
                {isStarter && (
                  <div className="absolute -top-3 left-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-studojo-ink text-white text-[11px] font-bold font-satoshi whitespace-nowrap">
                      8-day sprint
                    </span>
                  </div>
                )}
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-2.5 py-0.5 rounded-full bg-studojo-purple text-white text-[11px] font-bold font-satoshi whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <p className="text-[11px] font-clash font-bold text-studojo-muted uppercase tracking-widest mb-3 mt-1">
                  {tier.name}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  {price.anchor && !price.discounted && (
                    <span className="text-sm line-through text-studojo-muted font-satoshi">{price.anchor}</span>
                  )}
                  <span className="font-clash text-3xl font-black text-studojo-ink leading-none">
                    {price.discounted || price.display}
                  </span>
                  {price.discounted && (
                    <span className="text-sm line-through text-studojo-muted font-satoshi">{price.display}</span>
                  )}
                </div>

                {/* Discount pill */}
                {price.discountPct != null && price.discountPct > 0 && !price.discounted && (
                  <span className="inline-flex items-center mb-1 px-2 py-0.5 rounded-full text-[11px] font-satoshi font-bold bg-studojo-green/15 text-studojo-green border border-studojo-green/40 w-fit">
                    Save {price.discountPct}%
                  </span>
                )}

                {/* Tagline */}
                <p className="text-xs text-studojo-muted font-satoshi mt-2 mb-4 leading-relaxed">{tier.tagline}</p>

                <div className="border-t border-studojo-ink/10 mb-4" />

                {/* Features */}
                <ul className="space-y-2.5 mb-5 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs font-satoshi text-studojo-ink leading-snug">
                      <FiCheckCircle className="w-3.5 h-3.5 text-studojo-green mt-0.5 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTier(tier.value);
                    handlePayAndContinue();
                  }}
                  disabled={paying && isSelected}
                  className={`w-full h-10 rounded-xl font-satoshi font-bold text-sm border-2 border-studojo-ink transition-all flex items-center justify-center gap-1.5 ${
                    tier.recommended
                      ? "bg-studojo-purple text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      : "bg-white text-studojo-ink shadow-[2px_2px_0px_0px_rgba(25,26,35,0.7)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  } disabled:opacity-50 disabled:pointer-events-none`}
                >
                  {paying && isSelected ? "Processing..." : hasCredits
                    ? <><span>Use Credits</span><FiArrowRight className="w-3 h-3" /></>
                    : <><span>Get Started</span><FiArrowRight className="w-3 h-3" /></>}
                </button>
              </div>
            );
          })}
        </div>

        {/* Coupon */}
        <div className="rounded-2xl border-2 border-studojo-ink/20 bg-white p-5 mb-6 max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <FiTag className="w-4 h-4 text-studojo-purple" />
            <p className="font-satoshi text-sm font-bold text-studojo-ink">Have a coupon?</p>
          </div>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(""); }}
              placeholder="Enter code"
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
            <div className="mt-3 p-3 bg-studojo-green-bg rounded-xl border border-studojo-green/30">
              <p className="text-sm text-studojo-green font-bold font-satoshi">
                {couponResult.discount_type === "percent"
                  ? `${couponResult.discount_value}% off`
                  : `${currSymbol}${(couponResult.discount_value / 100).toFixed(0)} off`}
                {couponResult.distributor && <span className="text-studojo-muted font-normal"> via {couponResult.distributor}</span>}
              </p>
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm text-center mb-4 font-satoshi">{error}</p>}

        <p className="text-xs text-studojo-muted font-satoshi text-center mt-6">
          Emails sent gradually over several days. Most students get their first reply within a week.
        </p>
      </div>
      <Footer />

      {/* Consultation qualifying modal */}
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
