import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiCheckCircle, FiTag, FiArrowRight, FiMail, FiLinkedin } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
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

type Channel = "email" | "linkedin" | "both";
type Size = "starter" | "growth" | "scale";

interface Plan {
  id: string;
  channel: Channel;
  size: Size;
  name: string;
  emailCount: number;
  linkedinCount: number;
  tier: 200 | 350 | 500;
  recommended: boolean;
  priceUSD: number;
  priceINR: number;
  bundlePriceUSD?: number;
  bundlePriceINR?: number;
  savingsLabel?: string;
}

const PLANS: Plan[] = [
  // Email
  { id: "email_200", channel: "email", size: "starter", name: "Starter", emailCount: 200, linkedinCount: 0, tier: 200, recommended: false, priceUSD: 20, priceINR: 1775 },
  { id: "email_350", channel: "email", size: "growth", name: "Growth", emailCount: 350, linkedinCount: 0, tier: 350, recommended: true, priceUSD: 27, priceINR: 2295 },
  { id: "email_500", channel: "email", size: "scale", name: "Scale", emailCount: 500, linkedinCount: 0, tier: 500, recommended: false, priceUSD: 50, priceINR: 3465 },
  // LinkedIn
  { id: "linkedin_200", channel: "linkedin", size: "starter", name: "Starter", emailCount: 0, linkedinCount: 200, tier: 200, recommended: false, priceUSD: 20, priceINR: 1775 },
  { id: "linkedin_350", channel: "linkedin", size: "growth", name: "Growth", emailCount: 0, linkedinCount: 350, tier: 350, recommended: true, priceUSD: 27, priceINR: 2295 },
  { id: "linkedin_500", channel: "linkedin", size: "scale", name: "Scale", emailCount: 0, linkedinCount: 500, tier: 500, recommended: false, priceUSD: 50, priceINR: 3465 },
  // Both (bundle)
  { id: "both_200", channel: "both", size: "starter", name: "Starter", emailCount: 200, linkedinCount: 200, tier: 200, recommended: false, priceUSD: 35, priceINR: 2999, bundlePriceUSD: 40, bundlePriceINR: 3550, savingsLabel: "Save 12%" },
  { id: "both_350", channel: "both", size: "growth", name: "Growth", emailCount: 350, linkedinCount: 350, tier: 350, recommended: true, priceUSD: 45, priceINR: 3999, bundlePriceUSD: 54, bundlePriceINR: 4590, savingsLabel: "Save 17%" },
  { id: "both_500", channel: "both", size: "scale", name: "Scale", emailCount: 500, linkedinCount: 500, tier: 500, recommended: false, priceUSD: 70, priceINR: 4999, bundlePriceUSD: 100, bundlePriceINR: 6930, savingsLabel: "Save 30%" },
];

const CHANNEL_TABS: { id: Channel; label: string; icon: typeof FiMail }[] = [
  { id: "email", label: "Send Emails", icon: FiMail },
  { id: "linkedin", label: "Send LinkedIn", icon: FiLinkedin },
  { id: "both", label: "Send Both", icon: FiArrowRight },
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
    if (!orderId && candidateId) {
      createOrder(candidateId);
    }
  }, [orderId, candidateId]);

  const funnelPingedRef = useRef(false);
  useEffect(() => {
    if (funnelPingedRef.current) return;
    if (authLoading || !user) return;
    funnelPingedRef.current = true;
    outreachFetch("/orders/funnel/mark", {
      method: "POST",
      body: JSON.stringify({ stage: "payment_page_reached" }),
    }).catch(() => {});
  }, [authLoading, user]);

  const [channel, setChannel] = useState<Channel>("email");
  const [pricing, setPricing] = useState<TierPricing[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [credits, setCredits] = useState<{ total_credits: number; used_credits: number; available_credits: number } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [dodoCheckoutUrl, setDodoCheckoutUrl] = useState<string | null>(null);
  const [comingSoonChannel, setComingSoonChannel] = useState<Channel | null>(null);
  const dodoSessionRef = useRef<string>("");
  const dodoPollingRef = useRef(false);

  const closeDodoModal = () => {
    setDodoCheckoutUrl(null);
    dodoPollingRef.current = false;
  };

  const onPaymentSuccess = async () => {
    try {
      setCredits(await outreachFetch("/payment/credits"));
    } catch {}
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
      if (res.status === "paid") {
        closeDodoModal();
        setPaying(false);
        setPayingPlanId(null);
        onPaymentSuccess();
        return;
      }
      if (res.status === "failed") {
        closeDodoModal();
        setError("Payment failed. Please try again.");
        setPaying(false);
        setPayingPlanId(null);
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
        const available = creditsData.available_credits;
        if (available > 0 && available < selectedTier) {
          if (available >= 200) setSelectedTier(200);
        }
      } catch {}
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

  const handlePayAndContinue = async (plan: Plan) => {
    if (!candidateId) return;

    // LinkedIn and Both plans need backend wiring — show coming soon modal
    if (plan.channel !== "email") {
      setComingSoonChannel(plan.channel);
      return;
    }

    setSelectedTier(plan.tier);

    if (credits && credits.available_credits >= plan.tier) {
      onPaymentSuccess();
      return;
    }

    setPaying(true);
    setPayingPlanId(plan.id);
    setError("");
    try {
      const orderData = await outreachFetch<any>("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({ tier: plan.tier, currency, coupon_code: couponResult?.valid ? couponCode.trim() : undefined }),
      });

      if (orderData.free) {
        setCredits((prev) => prev
          ? { ...prev, total_credits: prev.total_credits + orderData.credits_granted, available_credits: prev.available_credits + orderData.credits_granted }
          : { total_credits: orderData.credits_granted, used_credits: 0, available_credits: orderData.credits_granted }
        );
        setPaying(false);
        setPayingPlanId(null);
        onPaymentSuccess();
        return;
      }

      if (orderData.checkout_url) {
        dodoSessionRef.current = orderData.session_id;
        dodoPollingRef.current = true;
        setDodoCheckoutUrl(orderData.checkout_url);
        pollDodoVerify(0);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Outreach",
        description: `Contact ${plan.tier} Hiring Managers`,
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
            setPayingPlanId(null);
            onPaymentSuccess();
          } catch (err: any) {
            setError(err?.body?.detail || err.message || "Payment verification failed");
            setPaying(false);
            setPayingPlanId(null);
          }
        },
        prefill: { email: user?.email || "", name: user?.name || "" },
        theme: { color: "#7C3AED" },
        modal: { ondismiss: () => { setPaying(false); setPayingPlanId(null); } },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setError(response.error?.description || "Payment failed");
        setPaying(false);
        setPayingPlanId(null);
      });
      rzp.open();
    } catch (err: any) {
      setError(err?.body?.detail || err.message || "Failed to create payment order");
      setPaying(false);
      setPayingPlanId(null);
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
  const isINR = currency === "INR";
  const visiblePlans = PLANS.filter((p) => p.channel === channel);

  const formatPrice = (n: number) => isINR ? `₹${n.toLocaleString("en-IN")}` : `$${n}`;

  const getPlanPrice = (plan: Plan) => {
    // For email plans, use backend-served price if available (handles regional/coupon variants)
    if (plan.channel === "email") {
      const match = pricing.find((p) => p.tier === plan.tier);
      if (match) {
        const discounted = couponResult?.valid && selectedTier === plan.tier ? couponResult.discounted_amount : null;
        return {
          display: match.display_price || `${currSymbol}${(match.amount_cents / 100).toFixed(0)}`,
          discounted: discounted ? `${currSymbol}${(discounted / 100).toFixed(0)}` : null,
          original: null as string | null,
        };
      }
    }
    // Hardcoded for LinkedIn / Both plans (and email fallback)
    const price = isINR ? plan.priceINR : plan.priceUSD;
    const bundle = isINR ? plan.bundlePriceINR : plan.bundlePriceUSD;
    return {
      display: formatPrice(price),
      discounted: null,
      original: bundle ? formatPrice(bundle) : null,
    };
  };

  const buildFeatures = (plan: Plan): string[] => {
    const out: string[] = [];
    if (plan.emailCount > 0) {
      out.push(`${plan.emailCount} verified hiring manager emails, personalised and sent for you`);
    }
    if (plan.linkedinCount > 0) {
      out.push(`${plan.linkedinCount} personalised LinkedIn connection requests`);
    }
    out.push("Targeted to your role, industry and company preferences");
    out.push("Fully custom dashboard to track every send and reply");
    if (plan.emailCount > 0) {
      out.push("Sent gradually so they land in the primary inbox");
    }
    if (plan.linkedinCount > 0) {
      out.push("Automated daily limits to keep your LinkedIn account safe");
    }
    out.push("Email support");
    return out;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

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

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">

        <div className="text-center mb-8">
          <h1 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink">Contact Hiring Managers Directly</h1>
          <p className="text-base text-studojo-muted mt-3 font-satoshi max-w-xl mx-auto">
            Skip the job board queue. We find verified contacts, write personalised messages, and reach out on your behalf.
          </p>
        </div>

        {/* Channel tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal">
            {CHANNEL_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = channel === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setChannel(tab.id); setCouponResult(null); setCouponError(""); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-satoshi font-bold transition-all ${
                    isActive
                      ? "bg-studojo-purple text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                      : "text-studojo-ink hover:bg-studojo-surface-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {visiblePlans.map((plan) => {
            const price = getPlanPrice(plan);
            const isSelected = selectedTier === plan.tier && channel === "email";
            const hasCredits = plan.channel === "email" && credits ? credits.available_credits >= plan.tier : false;
            const isPaying = payingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => { if (plan.channel === "email") { setSelectedTier(plan.tier); setCouponResult(null); setCouponError(""); } }}
                className={`relative rounded-2xl border-2 p-6 transition-all flex flex-col ${plan.channel === "email" ? "cursor-pointer" : ""} ${
                  plan.recommended
                    ? "border-studojo-purple bg-studojo-purple-bg/20 shadow-[4px_4px_0px_0px_rgba(124,58,237,1)]"
                    : isSelected
                    ? "border-studojo-ink bg-white shadow-brutal"
                    : "border-studojo-ink/30 bg-white hover:border-studojo-ink/60"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-studojo-purple text-white text-xs font-bold font-satoshi border-2 border-studojo-ink whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                {plan.savingsLabel && (
                  <div className="absolute -top-3 right-4">
                    <span className="px-3 py-1 rounded-full bg-studojo-green text-white text-xs font-bold font-satoshi border-2 border-studojo-ink whitespace-nowrap">
                      {plan.savingsLabel}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <p className="font-clash text-xs font-bold text-studojo-muted uppercase tracking-wider mb-1">{plan.name}</p>
                  <div className="flex items-end gap-2 flex-wrap">
                    <span className="font-clash text-4xl font-black text-studojo-ink">{price.display}</span>
                    {price.original && (
                      <span className="text-base line-through text-studojo-muted font-satoshi mb-1.5">{price.original}</span>
                    )}
                  </div>
                  {price.discounted && (
                    <span className="font-clash text-4xl font-black text-studojo-green">{price.discounted}</span>
                  )}
                  <p className="text-xs text-studojo-muted font-satoshi mt-1">
                    {plan.channel === "email" && `${plan.emailCount} decision makers. ${plan.emailCount} chances.`}
                    {plan.channel === "linkedin" && `${plan.linkedinCount} LinkedIn requests sent for you.`}
                    {plan.channel === "both" && `${plan.emailCount} emails + ${plan.linkedinCount} LinkedIn requests.`}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {buildFeatures(plan).map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm font-satoshi text-studojo-ink">
                      <FiCheckCircle className="w-4 h-4 text-studojo-green mt-0.5 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePayAndContinue(plan);
                  }}
                  disabled={paying && isPaying}
                  className={`w-full h-11 rounded-xl font-satoshi font-bold text-sm border-2 border-studojo-ink transition-all flex items-center justify-center gap-2 ${
                    plan.recommended
                      ? "bg-studojo-purple text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      : "bg-white text-studojo-ink shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  } disabled:opacity-50 disabled:pointer-events-none`}
                >
                  {isPaying ? (
                    "Processing..."
                  ) : hasCredits ? (
                    <>Use Credits <FiArrowRight className="w-3.5 h-3.5" /></>
                  ) : (
                    <>Get Started <FiArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {channel === "email" && (
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
        )}

        {error && <p className="text-red-600 text-sm text-center mb-4 font-satoshi">{error}</p>}

        <p className="text-xs text-studojo-muted font-satoshi text-center mt-6">
          {channel === "linkedin"
            ? "LinkedIn requests sent gradually within daily safety limits. Most students see their first accepted connection within 48 hours."
            : channel === "both"
            ? "Emails and LinkedIn requests sent gradually. Two channels = roughly 2x the reply rate of email alone."
            : "Emails sent gradually over several days. Most students get their first reply within a week."}
        </p>
      </div>
      <Footer />

      {dodoCheckoutUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => { closeDodoModal(); setPaying(false); setPayingPlanId(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ width: "min(480px, 95vw)", height: "min(640px, 90vh)" }}>
            <button
              onClick={() => { closeDodoModal(); setPaying(false); setPayingPlanId(null); }}
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

      {comingSoonChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setComingSoonChannel(null)} />
          <div className="relative bg-white rounded-2xl border-2 border-studojo-ink shadow-brutal p-6 max-w-md w-full">
            <h3 className="font-clash text-xl font-bold text-studojo-ink mb-2">
              {comingSoonChannel === "linkedin" ? "LinkedIn outreach is launching soon" : "Email + LinkedIn bundles launching soon"}
            </h3>
            <p className="text-sm text-studojo-muted font-satoshi mb-4">
              We're finishing the LinkedIn payment integration. In the meantime, start with the Email plan — your credits transfer over once LinkedIn ships, and you'll be first in line for the bundle discount.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setComingSoonChannel(null); setChannel("email"); }}
                className="flex-1 h-10 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-bold border-2 border-studojo-ink shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Switch to Email plans
              </button>
              <button
                onClick={() => setComingSoonChannel(null)}
                className="h-10 px-4 rounded-xl bg-white text-studojo-ink text-sm font-satoshi font-bold border-2 border-studojo-ink shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
