import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FiMail, FiCheckCircle, FiTag, FiCreditCard } from "react-icons/fi";
import { Header } from "~/components/header";
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
  const navigate = useNavigate();
  const { user, loading: authLoading } = useOutreachAuth();
  const { candidateId, selectedTier, setSelectedTier, orderId } = useOutreachStore();
  const { updateOrder } = useOrder();

  const [pricing, setPricing] = useState<TierPricing[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [credits, setCredits] = useState<{ total_credits: number; used_credits: number; available_credits: number } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [paying, setPaying] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState({ enriched: 0, failed: 0, total: 0, progress: "" });
  const [result, setResult] = useState<{ enriched: number; failed: number } | null>(null);
  const [error, setError] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

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
        const locale = navigator.language || "en-US";
        const detectedCurrency = locale.toLowerCase().includes("in") ? "INR" : "USD";
        setCurrency(detectedCurrency);

        const [pricingData, creditsData] = await Promise.all([
          outreachFetch<{ tiers: TierPricing[] }>(`/payment/pricing?currency=${detectedCurrency}`),
          outreachFetch<{ total_credits: number; used_credits: number; available_credits: number }>("/payment/credits"),
        ]);
        setPricing(pricingData.tiers || []);
        setCredits(creditsData);
      } catch {
        // fallback tiers
      }
    };
    loadData();
  }, []);

  const pollEnrichmentJob = async (jobId: string, total: number) => {
    const poll = async () => {
      try {
        const data = await outreachFetch<any>(`/enrichment/${jobId}/status`);
        setEnrichProgress({ enriched: data.enriched, failed: data.failed, total, progress: data.progress });

        if (data.status === "completed") {
          setResult({ enriched: data.enriched, failed: data.failed });
          setEnriching(false);
          updateOrder({ status: "enrichment_complete", log_entry: `Enriched ${data.enriched} leads` });
          try { setCredits(await outreachFetch("/payment/credits")); } catch {}
          return;
        }
        if (data.status === "failed") {
          setError(data.error || "Enrichment failed");
          setEnriching(false);
          try { setCredits(await outreachFetch("/payment/credits")); } catch {}
          return;
        }
        setTimeout(poll, 3000);
      } catch {
        setError("Lost connection to enrichment job");
        setEnriching(false);
      }
    };
    setTimeout(poll, 2000);
  };

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

  const handleEnrich = async (limit: number) => {
    if (!candidateId) return;
    setEnriching(true);
    setEnrichProgress({ enriched: 0, failed: 0, total: limit, progress: "Starting enrichment..." });
    setError("");
    try {
      const data = await outreachFetch<any>("/enrichment/enrich", {
        method: "POST",
        body: JSON.stringify({ candidate_id: candidateId, limit, order_id: orderId }),
      });
      if (data.job_id) {
        pollEnrichmentJob(data.job_id, data.total || limit);
      } else {
        setResult({ enriched: data.enriched, failed: data.failed });
        setEnriching(false);
        updateOrder({ status: "enrichment_complete", log_entry: `Enriched ${data.enriched} leads` });
      }
    } catch (err: any) {
      setError(err?.body?.detail || err.message || "Enrichment failed");
      setEnriching(false);
    }
  };

  const handlePayAndEnrich = async () => {
    if (!candidateId) return;

    if (credits && credits.available_credits >= selectedTier) {
      handleEnrich(selectedTier);
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
        handleEnrich(selectedTier);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "OpportunityApply",
        description: `${selectedTier} Email Enrichment Credits`,
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
            setCredits(await outreachFetch("/payment/credits"));
            setPaying(false);
            handleEnrich(selectedTier);
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
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center mx-auto text-studojo-purple mb-6">
            <FiMail className="w-7 h-7" />
          </div>
          <h1 className="font-clash text-2xl font-bold text-studojo-ink">Email Enrichment</h1>
          <p className="text-sm text-studojo-muted mt-2 font-satoshi">Choose how many leads to enrich with verified email addresses.</p>
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

        {result ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-studojo-green-bg border-2 border-studojo-ink flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-6 h-6 text-studojo-green" />
            </div>
            <h2 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">Enrichment Complete</h2>
            <p className="text-base text-studojo-muted font-satoshi">
              <span className="text-studojo-green font-bold">{result.enriched}</span> emails verified
              {result.failed > 0 && <span className="text-studojo-muted"> ({result.failed} not found)</span>}
            </p>
            <button
              onClick={() => navigate("/outreach/connect/gmail")}
              className="mt-8 h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Connect Gmail to Send Emails
            </button>
          </div>
        ) : enriching ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8">
            <div className="text-center mb-6">
              <p className="text-base text-studojo-ink font-bold font-satoshi">Enriching leads...</p>
              <p className="text-sm text-studojo-muted font-satoshi mt-1">{enrichProgress.progress}</p>
            </div>
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <div className="flex justify-between text-xs text-studojo-muted font-satoshi mb-2">
                  <span>{enrichProgress.enriched} enriched{enrichProgress.failed > 0 ? `, ${enrichProgress.failed} failed` : ""}</span>
                  <span>{enrichProgress.total} total</span>
                </div>
                <div className="h-3 rounded-full bg-studojo-surface-muted border-2 border-studojo-ink/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-studojo-purple transition-all duration-500"
                    style={{ width: `${enrichProgress.total > 0 ? ((enrichProgress.enriched + enrichProgress.failed) / enrichProgress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border-2 border-studojo-ink bg-studojo-green-bg text-center">
                  <p className="text-2xl font-bold font-clash text-studojo-green">{enrichProgress.enriched}</p>
                  <p className="text-xs text-studojo-muted font-satoshi mt-1">Emails Found</p>
                </div>
                <div className="p-4 rounded-2xl border-2 border-studojo-ink/30 bg-white text-center">
                  <p className="text-2xl font-bold font-clash text-studojo-muted">{enrichProgress.failed}</p>
                  <p className="text-xs text-studojo-muted font-satoshi mt-1">Not Found</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-studojo-purple border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-studojo-muted font-satoshi">This may take a few minutes for large batches</span>
              </div>
            </div>
          </div>
        ) : (
          <>
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
                  onClick={() => handleEnrich(selectedTier)}
                  className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
                >
                  Enrich {selectedTier} Leads (Use Credits)
                </button>
              ) : (
                <button
                  onClick={handlePayAndEnrich}
                  disabled={paying}
                  className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center disabled:opacity-50 disabled:pointer-events-none"
                >
                  <FiCreditCard className="w-5 h-5 mr-2" /> {paying ? "Processing..." : `Pay ${displayPrice} & Enrich ${selectedTier} Leads`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}