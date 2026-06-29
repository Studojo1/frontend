import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiCheckCircle, FiLinkedin, FiShield, FiTag, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

declare global { interface Window { Razorpay: any } }

interface PlanRow {
  plan_id: string;
  plan_type: string;
  label: string;
  linkedin_credits: number;
  amount_cents: number;
  currency: string;
  display_price: string;
  anchor_display?: string | null;
  discount_pct?: number | null;
}

export default function LinkedInPricing() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useOutreachAuth();
  const { candidateId, setPlanType, setSelectedPlanId } = useOutreachStore();

  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [paying, setPaying] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [rzpLoaded, setRzpLoaded] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discounted: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Load Razorpay
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) { setRzpLoaded(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => setRzpLoaded(true);
    s.onerror = () => setError("Couldn't load the payment widget. Disable ad blockers and refresh.");
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    outreachFetch<{ plans: PlanRow[]; currency: string }>("/payment/pricing")
      .then((r) => {
        const li = (r.plans || []).filter((p) => p.plan_type === "linkedin");
        setPlans(li);
        if (r.currency) setCurrency(r.currency);
      })
      .catch(() => setError("Couldn't load pricing, refresh the page."));
  }, []);

  const validateCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponError("");
    try {
      const recommended = plans.find((p) => p.linkedin_credits === 350) || plans[0];
      if (!recommended) return;
      const res = await outreachFetch<{ valid: boolean; discounted_amount: number }>("/payment/coupon/validate", {
        method: "POST",
        body: JSON.stringify({ code: coupon.trim(), plan_id: recommended.plan_id, currency }),
      });
      if (res.valid) {
        setCouponApplied({ code: coupon.trim().toUpperCase(), discounted: res.discounted_amount });
      } else {
        setCouponError("That code didn't work.");
      }
    } catch (e: any) {
      setCouponError(e?.body?.detail || "Invalid code");
    }
  };

  const buy = async (plan: PlanRow) => {
    if (!candidateId) {
      navigate("/linkedin/onboarding/upload");
      return;
    }
    if (!rzpLoaded) {
      setError("Payment widget still loading. Try again in a second.");
      return;
    }
    setPaying(true);
    setPayingId(plan.plan_id);
    setError("");
    setPlanType("linkedin");
    setSelectedPlanId(plan.plan_id);
    try {
      const order = await outreachFetch<any>("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({
          plan_id: plan.plan_id,
          currency,
          coupon_code: couponApplied ? couponApplied.code : undefined,
        }),
      });

      // Free / fully-discounted → straight to connect
      if (order.free) {
        navigate("/linkedin/connect");
        return;
      }

      // Dodo (international) handled later if needed, for now require Razorpay path
      if (!order.order_id) {
        setError("Payment route not available. Try refreshing or contact studojo@gmail.com.");
        setPaying(false);
        setPayingId(null);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Studojo LinkedIn",
        description: `${plan.linkedin_credits} LinkedIn connection invites`,
        order_id: order.order_id,
        prefill: { email: user?.email || "", name: user?.name || "" },
        theme: { color: "#0a66c2" },
        modal: { ondismiss: () => { setPaying(false); setPayingId(null); } },
        handler: async (resp: any) => {
          try {
            await outreachFetch("/payment/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              }),
            });
            navigate("/linkedin/connect");
          } catch (e: any) {
            setError(e?.body?.detail || "Payment verification failed. Contact support.");
            setPaying(false);
            setPayingId(null);
          }
        },
      });
      rzp.on("payment.failed", (r: any) => {
        setError(r?.error?.description || "Payment failed.");
        setPaying(false);
        setPayingId(null);
      });
      rzp.open();
    } catch (e: any) {
      setError(e?.body?.detail || "Couldn't start payment. Try again.");
      setPaying(false);
      setPayingId(null);
    }
  };

  const popularId = "linkedin_350";

  return (
    <div className="min-h-screen bg-white pb-12">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-satoshi bg-[#0a66c2]/10 text-[#0a66c2] border-2 border-[#0a66c2]/25 mb-4">
            <FiLinkedin className="w-3.5 h-3.5" /> STEP 3 OF 3 · PICK A PLAN
          </span>
          <h1 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink mb-2">
            Send invites on autopilot.
          </h1>
          <p className="text-base text-studojo-muted font-satoshi max-w-2xl mx-auto">
            One-time payment. No subscription. Connection invites sent at LinkedIn-safe pacing with hand-personalised notes.
          </p>
        </div>

        {/* Trust strip */}
        <div className="rounded-2xl border-2 border-studojo-green/40 bg-studojo-green-bg p-4 mb-6 flex items-start gap-3">
          <FiShield className="w-5 h-5 text-studojo-green flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold font-satoshi text-studojo-ink">Zero-reply protection</p>
            <p className="text-xs text-studojo-muted font-satoshi mt-0.5">
              If your campaign finishes and not a single person replies, we extend it free until you hear back. You never pay for silence.
            </p>
          </div>
        </div>

        {/* Coupon */}
        <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-4 mb-8 max-w-lg mx-auto">
          {couponApplied ? (
            <div className="flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4 text-studojo-green" />
              <p className="text-sm font-bold font-satoshi text-studojo-ink">Code <span className="text-studojo-purple">{couponApplied.code}</span> applied</p>
              <button onClick={() => setCouponApplied(null)} className="text-xs text-studojo-muted underline ml-auto">Remove</button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <FiTag className="w-4 h-4 text-studojo-purple" />
                <p className="text-sm font-bold font-satoshi text-studojo-ink">Have a coupon?</p>
              </div>
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }}
                  placeholder="Enter code"
                  className="flex-1 border-2 border-studojo-ink/20 rounded-xl px-3 py-2 text-sm font-satoshi"
                />
                <button
                  onClick={validateCoupon}
                  disabled={!coupon.trim()}
                  className="h-10 px-4 rounded-xl bg-studojo-ink text-white text-sm font-satoshi font-bold disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-xs text-red-600 font-satoshi mt-2">{couponError}</p>}
            </>
          )}
        </div>

        {error && (
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3 mb-6 flex items-start gap-2 max-w-2xl mx-auto">
            <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-satoshi text-red-700">{error}</p>
          </div>
        )}

        {/* Plans */}
        {plans.length === 0 ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((p) => {
              const popular = p.plan_id === popularId;
              const isPaying = payingId === p.plan_id;
              return (
                <div key={p.plan_id} className={`rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6 flex flex-col relative ${popular ? "ring-4 ring-studojo-purple/20" : ""}`}>
                  {popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold font-satoshi bg-studojo-purple text-white border-2 border-studojo-ink whitespace-nowrap">
                      MOST POPULAR
                    </span>
                  )}
                  <p className="text-xs font-bold font-satoshi text-studojo-muted uppercase mb-1">{p.label}</p>
                  <h3 className="font-clash text-2xl font-bold text-studojo-ink">{p.linkedin_credits} invites</h3>
                  <div className="mt-3 mb-1 flex items-baseline gap-2 flex-wrap">
                    {p.anchor_display && (
                      <span className="text-base font-clash font-bold text-studojo-muted line-through">{p.anchor_display}</span>
                    )}
                    <span className="font-clash text-3xl font-bold text-studojo-ink">{p.display_price}</span>
                  </div>
                  {p.discount_pct ? (
                    <span className="self-start mb-4 px-2 py-0.5 rounded-full text-[10px] font-bold font-satoshi bg-studojo-green/15 text-studojo-green border border-studojo-green/40">
                      Save {p.discount_pct}%
                    </span>
                  ) : <div className="mb-4" />}

                  <ul className="space-y-2 mb-5 flex-1 text-sm font-satoshi text-studojo-ink">
                    <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-studojo-green flex-shrink-0 mt-0.5" /> {p.linkedin_credits} hand-personalised invites</li>
                    <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-studojo-green flex-shrink-0 mt-0.5" /> AI follow-up message on accept</li>
                    <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-studojo-green flex-shrink-0 mt-0.5" /> Reply tracking + inbox</li>
                    <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-studojo-green flex-shrink-0 mt-0.5" /> ~{Math.round(p.linkedin_credits / 30)} invites/day, safe pacing</li>
                    <li className="flex items-start gap-2"><FiCheckCircle className="w-4 h-4 text-studojo-green flex-shrink-0 mt-0.5" /> Auto-withdraw stale invites at 14d</li>
                  </ul>
                  <button
                    onClick={() => buy(p)}
                    disabled={paying || authLoading}
                    className={`h-11 rounded-xl text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 inline-flex items-center justify-center gap-2 ${
                      popular ? "bg-studojo-purple" : "bg-[#0a66c2]"
                    }`}
                  >
                    {isPaying ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading…</>
                    ) : (
                      <>Get Started <FiArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
