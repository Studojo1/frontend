import { describeError } from "~/lib/error-detail";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiTag, FiArrowRight, FiArrowLeft, FiCheck } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { AppFooter } from "~/components/outreach/AppFooter";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { useOrder } from "~/lib/outreach/hooks";
import { outreachFetch } from "~/lib/outreach/api";
import { capturePostHog } from "~/lib/posthog";
import { track } from "~/lib/analytics";
import { metaBrowserIds } from "~/lib/attribution";
import type { TierPricing } from "~/lib/outreach/types";
import { RealNumbers } from "~/components/outreach/RealNumbers";
import { recallCoupon, sessionStore } from "~/lib/outreach/coupon";
import { tierMatch, leadHeadline } from "~/lib/outreach/tier-match";

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

const FAQ_ITEMS: [string, string][] = [
  ["Is this spam?", "No. Each email is personalised to the person and their company, sent one at a time from your own Gmail on an inbox-safe schedule."],
  ["Whose email does it come from?", "Your own Gmail, signed by you, so replies come straight back to your inbox."],
  ["Can they tell it's written by AI?", "Each email is written by AI from real details about them and your background, then sent from your Gmail. It reads personally because the details are real."],
  ["Is my data safe?", "Yes. Your resume and contacts are never sold. Payments are handled by Razorpay in India and Dodo Payments elsewhere, so we never see your card details."],
];

// Outcome figures from our own records. These replaced an invented "Wall of
// Love" of testimonials (audit OP-N02).
function WallOfLove() {
  return (
    <div className="mb-14">
      <RealNumbers title="Students are already getting in" />
    </div>
  );
}

// Dream-company chip: logo from a guessed domain, graceful fallback to name only.
function DreamChip({ name, domain }: { name: string; domain: string | null }) {
  // Same logo waterfall as FlashCard: Clearbit (crisp brand mark) → Google
  // favicon → hide. We ONLY guess "{name}.com" when no real domain is known
  // from the user's actual leads, and even then we prefer to hide than show
  // the wrong brand (e.g. swish.com is the Swedish payment app, not the
  // Indian food-delivery startup the user wants).
  const realDomain = domain || null;
  const [src, setSrc] = useState<string | null>(
    realDomain ? `https://logo.clearbit.com/${realDomain}` : null,
  );
  const [step, setStep] = useState(0);
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border-2 border-studojo-ink bg-white px-3 py-1.5 text-sm font-medium whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
      {src && (
        <img
          src={src}
          alt=""
          className="w-4 h-4 rounded object-contain"
          onError={() => {
            if (step === 0 && realDomain) {
              setStep(1);
              setSrc(`https://www.google.com/s2/favicons?sz=64&domain=${realDomain}`);
            } else {
              setSrc(null);
            }
          }}
        />
      )}
      {name}
    </span>
  );
}

type CreditsInfo = {
  total_credits: number;
  used_credits: number;
  available_credits: number;
  emails_delivered?: number;
  emails_scheduled?: number;
  reserved_credits?: number;
  has_active_campaign?: boolean;
  campaign_status?: "running" | "paused" | null;
};

// A campaign needs at least this many credits (credits.MIN_CAMPAIGN_CREDITS).
const MIN_CAMPAIGN_CREDITS = 50;

// Dodo sends the checkout iframe back here when it is done. This used to say
// "Payment Complete" whatever had happened. It now reports Dodo's own status
// to the page, which confirms with the server; nothing here grants anything.
function DodoReturnFrame() {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const status = (params?.get("status") || "").toLowerCase();
  const failed = ["failed", "cancelled", "canceled", "expired"].includes(status);
  useEffect(() => {
    try {
      window.parent.postMessage(
        { type: "dodo_return", status, payment_id: params?.get("payment_id") || null },
        window.location.origin,
      );
    } catch {
      // The page keeps polling the server either way.
    }
  }, []);
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center p-8">
        {failed ? (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Payment did not go through</h2>
            <p className="text-sm text-gray-500">Nothing was charged. Close this window to try again.</p>
          </>
        ) : (
          <>
            <div className="w-8 h-8 border-2 border-studojo-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Confirming your payment…</h2>
            <p className="text-sm text-gray-500">This takes a few seconds. Please keep this window open.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function EnrichmentPage() {
  // If rendered inside the Dodo modal iframe after payment redirect, show minimal UI
  const isInIframe = typeof window !== "undefined" && window.self !== window.top;
  if (isInIframe) return <DodoReturnFrame />;

  const navigate = useNavigate();
  const { user, loading: authLoading, recovering } = useOutreachAuth();
  const { candidateId, setCandidateId, selectedTier, setSelectedTier, orderId } = useOutreachStore();
  const { createOrder, updateOrder } = useOrder();

  // No candidate: send them to upload, but only once the active order has had
  // its chance to supply one, and from an effect. Navigating during render
  // re-fired on every render while the upload chunk loaded and froze the tab
  // (React #185) for anyone arriving without saved funnel state, e.g. from an
  // email or the extension's needs-credits link.
  useEffect(() => {
    if (!authLoading && !recovering && !candidateId) {
      navigate("/outreach/onboarding/upload", { replace: true });
    }
  }, [authLoading, recovering, candidateId, navigate]);

  // Ensure an order record exists; create one if this is a fresh user
  useEffect(() => {
    if (!orderId && candidateId) {
      createOrder(candidateId);
    }
  }, [orderId, candidateId]);

  // Reaching the pricing page is the strongest pre-purchase intent signal in the
  // funnel, and it is what the "viewed pricing but did not buy" retargeting
  // audience is built from. Once per mount.
  const pricingViewedRef = useRef(false);
  useEffect(() => {
    if (pricingViewedRef.current) return;
    pricingViewedRef.current = true;
    track("pricing_viewed", { content_name: "Outreach Dojo pricing" });
  }, []);

  // Funnel: stamp "payment_page_reached" + schedule abandoned-checkout sequence.
  const funnelPingedRef = useRef(false);
  useEffect(() => {
    if (funnelPingedRef.current) return;
    if (authLoading || !user) return;
    funnelPingedRef.current = true;
    outreachFetch("/orders/funnel/mark", {
      method: "POST",
      body: JSON.stringify({ stage: "payment_page_reached" }),
    }).catch(() => { /* never break the page */ });
    // New email flow: deferred abandoned-checkout sequence (cancelled on payment).
    import("~/lib/events").then(({ publishEmailEventFromClient }) => {
      publishEmailEventFromClient("event.cc.outreach_payment_page", {
        user_id: user.id,
        email: user.email,
        name: user.name,
      }).catch(() => {});
    }).catch(() => {});
  }, [authLoading, user]);

  const [pricing, setPricing] = useState<TierPricing[]>([]);
  const [pricingState, setPricingState] = useState<"loading" | "ready" | "failed">("loading");
  const [currency, setCurrency] = useState("USD");
  const [credits, setCredits] = useState<CreditsInfo | null>(null);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  // Leads whose titles match the target roles (UC-Q09); the rest are broader.
  const [strongCount, setStrongCount] = useState<number | null>(null);
  // Candidates this page already switched away from (OP-N03), so it cannot loop.
  const switchedFromRef = useRef<Set<number>>(new Set());
  const [dreamCompanies, setDreamCompanies] = useState<Array<{ name: string; domain: string | null }>>([]);
  const [couponCode, setCouponCode] = useState("");
  // Links in coupon and checkout-recovery emails carry ?coupon=CODE, either
  // straight here or via /outreach/results, and the outreach layout keeps it
  // for this page (NEW-07). A code from a link is applied once prices load.
  const linkCouponRef = useRef<string | null>(null);
  useEffect(() => {
    const code = recallCoupon(window.location.search, sessionStore());
    if (code) {
      linkCouponRef.current = code;
      setCouponCode(code);
    }
  }, []);
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  // Required before paying: 18+ and the Refund Policy (Terms §2, Refund Policy).
  const [refundAgreed, setRefundAgreed] = useState(false);
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
    // This checkout is resolved one way or another, so drop the recovery
    // breadcrumb. Leaving it would send the next visit to /payment-success
    // chasing a session that is already settled.
    try {
      localStorage.removeItem("dodo_session_id");
      localStorage.removeItem("dodo_pending_job_type");
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
  };

  // After payment succeeds, advance order and navigate to campaign setup.
  //
  // paymentRef is the payment provider's own id (Razorpay order, Dodo session).
  // It becomes the Meta event id, so if this same sale is also confirmed by
  // payment-success.tsx, or later by a server-side copy from job-outreach-svc,
  // Meta collapses them into one Purchase instead of reporting the revenue twice.
  const onPaymentSuccess = async (paymentRef?: string, moneyMoved = true, tier: number = selectedTier) => {
    // New email flow: cancel any pending cc marketing sequences for this user
    // now that the user has paid. event.cc.paid is cancel-only (no email).
    if (user?.id) {
      import("~/lib/events").then(({ publishEmailEventFromClient }) => {
        publishEmailEventFromClient("event.cc.paid", { user_id: user.id }).catch(() => {});
      }).catch(() => {});
    }
    // The outreach flow goes straight to Gmail connect (never payment-success.tsx),
    // so fire payment_confirmed here or the funnel's "Paid" step misses these.
    const amountCents = pricing.find((p) => p.tier === tier)?.amount_cents;
    // The admin funnel counts every one of these as "Paid", which is correct:
    // the user got the product. Meta must NOT, unless money actually moved.
    // Credit-covered and coupon-free orders reach this same handler, and sending
    // a Purchase for them would invent revenue and corrupt ROAS.
    track(
      "payment_confirmed",
      { tier, currency, amount_cents: amountCents, money_moved: moneyMoved },
      moneyMoved
        ? {
            // Meta wants major units; the pricing API speaks cents.
            value: typeof amountCents === "number" ? amountCents / 100 : undefined,
            currency,
            eventId: paymentRef,
          }
        : { meta: false }
    );
    try {
      setCredits(await outreachFetch("/payment/credits"));
    } catch {}
    updateOrder({
      status: "campaign_setup",
      // Credit-covered clicks land here too; logging each as a payment made one
      // order read "Payment completed" six times for a single purchase.
      log_entry: moneyMoved
        ? `Payment completed for ${tier} credits (JIT enrichment)`
        : `Continued with existing credits (${tier} tier, no new payment)`,
    });
    // Debrief BEFORE the Gmail gate. It used to sit after it, and only 151 of
    // 4,791 orders ever reached gmail_connected, so the two answers it collects
    // (best project, concrete outcome) were effectively never gathered:
    // flex_notes coverage fell from 74% to 1.4% when these questions left the
    // quiz. They are what make an outreach email specific rather than generic,
    // so they are asked while the student is still in the flow.
    navigate("/outreach/connect/debrief");
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
        // Real payment. The Dodo session id is also what payment-success.tsx
        // sees, so both routes emit the same Meta event id for one sale.
        onPaymentSuccess(dodoSessionRef.current, true, dodoTierRef.current);
        return;
      }
      if (res.status === "failed") {
        closeDodoModal();
        setError("Payment failed. Please try again.");
        setPaying(false);
        return;
      }
      // No attempt cap while the modal is open: a card challenge or a slow
      // bank can take longer than the old ~3 minutes, and giving up then left
      // a paid user on the pricing page. Closing the modal stops the loop.
      if (dodoPollingRef.current) {
        setTimeout(() => pollDodoVerify(attempt + 1), attempt < 60 ? 3000 : 10000);
      }
    } catch {
      if (dodoPollingRef.current) {
        setTimeout(() => pollDodoVerify(attempt + 1), attempt < 60 ? 5000 : 15000);
      }
    }
  };

  // The checkout iframe lands back on this page when Dodo is done and posts
  // what it was told. Check with the server at once rather than waiting for
  // the next poll; the server's answer is the only one trusted.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "dodo_return") return;
      if (dodoPollingRef.current) void pollDodoVerify(0);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // A phone that locked or switched apps mid-checkout loses the page's poll.
  // The session id survives in localStorage, so settle it on the next visit.
  useEffect(() => {
    if (authLoading || !user) return;
    let sessionId = "";
    try { sessionId = localStorage.getItem("dodo_session_id") || ""; } catch { return; }
    if (!sessionId) return;
    outreachFetch<{ status: string; tier?: number }>("/payment/verify-dodo", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    }).then((res) => {
      if (res.status === "paid") {
        try { localStorage.removeItem("dodo_session_id"); localStorage.removeItem("dodo_pending_job_type"); } catch {}
        onPaymentSuccess(sessionId, true, res.tier ?? selectedTier);
      } else if (res.status === "failed") {
        try { localStorage.removeItem("dodo_session_id"); localStorage.removeItem("dodo_pending_job_type"); } catch {}
      }
    }).catch(() => { /* leave the breadcrumb for the next visit */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => checkoutDiag("script_error", { error: "checkout.js failed to load" });
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, []);

  // Orders stuck at 'created' are either real abandonment or a modal that
  // never opened. These breadcrumbs (CHECKOUT-DIAG in the API logs) tell the
  // two apart. Fire and forget.
  const checkoutDiag = (stage: string, extra: Record<string, unknown> = {}) => {
    outreachFetch("/payment/checkout-diag", {
      method: "POST",
      maxRetries: 1,
      body: JSON.stringify({
        stage,
        razorpay_loaded: typeof window !== "undefined" && !!window.Razorpay,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        ...extra,
      }),
    }).catch(() => {});
  };

  // A returning user can still have the retired Rs 499 tier persisted in their
  // store from before it was withdrawn. Nothing renders it any more and checkout
  // now rejects it, so move them to the entry plan rather than dead-end them.
  useEffect(() => {
    if ((selectedTier as number) === 50) setSelectedTier(200);
  }, [selectedTier, setSelectedTier]);

  // Prices and credits load separately: credits needs a session and can fail
  // on its own, and it used to take prices that loaded fine down with it.
  // There are no made-up backup prices. Until the real ones arrive the page
  // says so and checkout waits, because the currency decides the processor.
  const loadPricing = async () => {
    setPricingState("loading");
    try {
      const pricingData = await outreachFetch<{ tiers: TierPricing[]; currency: string }>("/payment/pricing");
      if (!pricingData.tiers?.length) throw new Error("no tiers");
      setPricing(pricingData.tiers);
      if (pricingData.currency) setCurrency(pricingData.currency);
      setPricingState("ready");
    } catch {
      setPricingState("failed");
    }
  };

  useEffect(() => {
    void loadPricing();
    outreachFetch<CreditsInfo>("/payment/credits")
      .then((creditsData) => {
        setCredits(creditsData);
        const available = creditsData.available_credits;
        if (available > 0 && available < selectedTier) {
          if (available >= 200) setSelectedTier(200);
        }
      })
      .catch(() => { /* no credits banner; pricing still works */ });
  }, []);

  // Fetch dream companies for the "in the mix" bar (no Apollo, reads stored data).
  // We also pull the user's actual leads so we can resolve each dream company's
  // REAL domain (Apollo-verified) instead of guessing "{name}.com"; that guess
  // grabs the wrong site for ambiguous names ("swish.com" is a Swedish payment
  // app, not the Indian food-delivery startup the candidate targeted).
  useEffect(() => {
    if (!candidateId) return;
    Promise.all([
      outreachFetch<any>(`/candidate/${candidateId}/profile`).catch(() => null),
      outreachFetch<{ leads: any[]; strong_total?: number; active_candidate_id?: number | null } | any[]>(`/candidate/${candidateId}/leads`).catch(() => null),
    ]).then(([profile, leadsResp]) => {
      // OP-N03: a re-upload leaves this browser on a newer resume with no
      // leads while an older one holds them, and the checkout guard below then
      // blocked a student who had hundreds. The API names the candidate that
      // has them; switch once, and this effect runs again for it.
      const active = leadsResp && !Array.isArray(leadsResp) ? leadsResp.active_candidate_id : null;
      if (
        leadsResp && !Array.isArray(leadsResp) && (leadsResp.leads?.length ?? 0) === 0 &&
        typeof active === "number" && active !== candidateId && !switchedFromRef.current.has(active)
      ) {
        switchedFromRef.current.add(candidateId);
        capturePostHog("pricing_switched_to_active_candidate", { from: candidateId, to: active });
        setCandidateId(active);
        return;
      }
      const raw: string[] = profile?.dream_companies || [];
      const clean = raw
        .map((c) => (c || "").trim())
        .filter((c) => c.length >= 2 && c.length <= 40 && /[a-z0-9]/i.test(c) && !/no strong preference|etc\b/i.test(c));

      // Build a {company-name → domain} map from the candidate's leads.
      const leadArr: any[] = Array.isArray(leadsResp)
        ? leadsResp
        : (leadsResp?.leads ?? []);
      // null when the call failed: never block checkout on a network blip.
      // Extension users who ran out of credits arrive with ?for=crm; they buy
      // for one-off sends and may never have run discovery.
      const forCrm = new URLSearchParams(window.location.search).get("for") === "crm";
      if (leadsResp && !forCrm) setLeadCount(leadArr.length);
      if (leadsResp && !Array.isArray(leadsResp) && typeof leadsResp.strong_total === "number") {
        setStrongCount(leadsResp.strong_total);
      }
      const domainByCompany = new Map<string, string>();
      for (const l of leadArr) {
        const co = (l?.company || "").trim().toLowerCase();
        const dom = (l?.company_domain || "").trim();
        if (co && dom && !domainByCompany.has(co)) {
          domainByCompany.set(co, dom);
        }
      }

      const resolved = clean.slice(0, 10).map((name) => ({
        name,
        domain: domainByCompany.get(name.toLowerCase()) || null,
      }));
      setDreamCompanies(resolved);
    });
  }, [candidateId]);

  const validateCoupon = async (tierOverride?: number) => {
    if (!couponCode.trim()) return;
    const tierForCheck = tierOverride ?? selectedTier;
    setCouponLoading(true);
    setCouponError("");
    setCouponResult(null);
    try {
      const data = await outreachFetch<CouponResult>("/payment/coupon/validate", {
        method: "POST",
        body: JSON.stringify({ code: couponCode.trim(), tier: tierForCheck, currency }),
      });
      setCouponResult(data);
      capturePostHog("coupon_applied", { coupon_code: couponCode.trim(), valid: !!data?.valid });
    } catch (err: any) {
      setCouponError(describeError(err, "Invalid coupon"));
    } finally {
      setCouponLoading(false);
    }
  };

  // Apply a coupon that came in a link once, as soon as the currency is known
  // (the discount depends on it), so the student sees the price they were
  // promised without finding the coupon box (NEW-07, OP-N12).
  useEffect(() => {
    if (pricingState !== "ready" || !linkCouponRef.current) return;
    linkCouponRef.current = null;
    void validateCoupon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingState]);

  const handlePayAndContinue = async (tierValue: number = selectedTier) => {
    if (!candidateId) return;
    if (leadCount === 0) return; // nothing to send to (UC-Q24)
    if (pricingState !== "ready" && !(credits && credits.available_credits >= tierValue)) return;

    const coveredByCredits = !!(credits && credits.available_credits >= tierValue);
    if (!coveredByCredits && !refundAgreed) return;
    // Meta's AddPaymentInfo only when money can move: not for credit-covered
    // orders, nor when a coupon makes the order free (audit ST-N02).
    const freeWithCoupon = !!(couponResult?.valid && selectedTier === tierValue && couponResult.discounted_amount === 0);
    track(
      "pay_now_clicked",
      { tier: tierValue, covered_by_credits: coveredByCredits },
      coveredByCredits || freeWithCoupon ? { meta: false } : undefined,
    );

    // If user already has enough credits for this specific tier, skip payment.
    // tierValue is passed explicitly from the button to avoid stale closure
    // (setSelectedTier is async; reading selectedTier here would get the old value).
    if (coveredByCredits) {
      onPaymentSuccess(undefined, false, tierValue); // paid from existing credits, no new revenue
      return;
    }

    setPaying(true);
    setError("");
    try {
      const orderData = await outreachFetch<any>("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({ tier: tierValue, currency, coupon_code: couponResult?.valid ? couponCode.trim() : undefined, ...metaBrowserIds() }), // EX-07
      });

      if (orderData.free) {
        setCredits((prev) => prev
          ? { ...prev, total_credits: prev.total_credits + orderData.credits_granted, available_credits: prev.available_credits + orderData.credits_granted }
          : { total_credits: orderData.credits_granted, used_credits: 0, available_credits: orderData.credits_granted }
        );
        setPaying(false);
        onPaymentSuccess(undefined, false, tierValue); // free order, no revenue
        return;
      }

      if (orderData.checkout_url) {
        dodoSessionRef.current = orderData.session_id;
        dodoTierRef.current = tierValue;
        dodoPollingRef.current = true;
        // The verification below lives in page state, so a phone that locks or
        // switches apps during checkout loses it and the order never advances
        // even though the payment went through. /payment-success recovers from
        // these two keys, and the other Dodo caller (lib/payments.ts) already
        // writes them -- this path kept the session in a ref that dies with the
        // tab. Leave the same breadcrumb so a returning user can be picked up.
        try {
          localStorage.setItem("dodo_session_id", orderData.session_id || "");
          localStorage.setItem("dodo_pending_job_type", "outreach");
        } catch {
          // Private mode: the in-page poll below is still the happy path.
        }
        track("checkout_opened", { tier: tierValue, provider: "dodo" });
        setDodoCheckoutUrl(orderData.checkout_url);
        pollDodoVerify(0);
        return;
      }

      if (!orderData.order_id || !orderData.key_id) {
        checkoutDiag("missing_order", { plan_id: `email_${tierValue}`, error: "no order_id or key_id" });
        setError("We could not start the payment. Please try again in a moment.");
        setPaying(false);
        return;
      }
      if (typeof window === "undefined" || !window.Razorpay) {
        checkoutDiag("not_loaded", { order_id: orderData.order_id, amount: orderData.amount, plan_id: `email_${tierValue}` });
        setError(razorpayLoaded
          ? "Payment is still loading, try again in a second."
          : "The payment window could not load. Check your connection, or turn off any ad blocker, and try again.");
        setPaying(false);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Studojo",
        image: "https://studojo.com/logo.png",
        description: `Contact ${tierValue} Hiring Managers`,
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
            onPaymentSuccess(response.razorpay_order_id, true, tierValue);
          } catch (err: any) {
            setError(describeError(err, "Payment verification failed"));
            setPaying(false);
          }
        },
        prefill: {
          email: user?.email || "",
          name: user?.name || "",
          contact: (user as { phoneNumber?: string | null } | null)?.phoneNumber || "",
        },
        theme: { color: "#7C3AED" },
        modal: { ondismiss: () => { capturePostHog("checkout_abandoned", { tier: tierValue, provider: "razorpay" }); setPaying(false); } },
      };

      let rzp: any;
      try {
        rzp = new window.Razorpay(options);
      } catch (e: any) {
        checkoutDiag("open_failed", { order_id: orderData.order_id, amount: orderData.amount, plan_id: `email_${tierValue}`, error: String(e?.message || e) });
        setError("The payment window could not open. Please try again.");
        setPaying(false);
        return;
      }
      rzp.on("payment.failed", (response: any) => {
        capturePostHog("payment_failed", { tier: tierValue, provider: "razorpay", reason: response.error?.description });
        setError(response.error?.description || "Payment failed");
        setPaying(false);
      });
      track("checkout_opened", { tier: tierValue, provider: "razorpay" });
      rzp.open();
    } catch (err: any) {
      setError(describeError(err, "Failed to create payment order"));
      setPaying(false);
    }
  };

  // 50-199 credits: start a campaign with what they have. The server caps the
  // campaign at the available balance (routes_campaign create).
  const startWithRemainingCredits = () => {
    if (!credits || leadCount === 0) return;
    track("pay_now_clicked", { tier: credits.available_credits, covered_by_credits: true, partial: true }, { meta: false });
    onPaymentSuccess(undefined, false, credits.available_credits);
  };

  if (authLoading || (recovering && !candidateId)) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!candidateId) return null; // the effect above redirects

  const currSymbol = currency === "INR" ? "₹" : "$";

  const SHARED_FEATURES = (count: number) => [
    // Emails are found and checked after payment, and a campaign stops at the
    // leads the student has, so this is a ceiling, not a promise (UC-Q20).
    `Emails to up to ${count} hiring managers`,
    // Leads carry no industry data, so this said more than it could (UC-Q03).
    "Found from your target roles and location",
    "AI-personalised email per contact",
    "Inbox-safe drip schedule",
    "Live reply tracking dashboard",
    "Email support",
  ];

  const TIERS = [
    // email_50 (Rs 499 Starter) retired Sept 2026. Existing holders keep their
    // credits; the plan is no longer sold, and the API no longer returns it.
    {
      value: 200 as const,
      name: "Growth",
      tagline: "200 decision makers. The best place to start.",
      recommended: true,
      features: SHARED_FEATURES(200),
    },
    {
      value: 350 as const,
      name: "Pro",
      tagline: "350 contacts. More companies, more shots.",
      features: SHARED_FEATURES(350),
    },
    {
      value: 500 as const,
      name: "Scale",
      tagline: "500 contacts. Maximum coverage.",
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
      };
    }
    // No crossed-out "original" price: those amounts were never charged, so
    // showing them is a false reference price (audit OP-N04).
    return { display: pricingState === "failed" ? "-" : "…", discounted: null };
  };

  const selectedTierObj = TIERS.find((t) => t.value === selectedTier) ?? TIERS[0];
  const selectedPrice = getTierPrice(selectedTier);
  const hasCreditsForSelected = credits ? credits.available_credits >= selectedTier : false;

  return (
    <div className="min-h-screen bg-white pb-28">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">

        {/* Header: back button gets its own row above the centered title so
            it reads as a distinct action, not as title-adjacent floating text. */}
        <div className="mb-5">
          <button
            onClick={() => { capturePostHog("back_to_leads_clicked", {}); navigate("/outreach/leads/results"); }}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-studojo-ink/15 bg-white px-3 py-1.5 text-sm font-semibold text-studojo-ink hover:bg-studojo-surface-muted hover:border-studojo-ink/40 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" /> Back to your hiring managers
          </button>
        </div>
        <h1 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink text-center mb-3">Contact Hiring Managers Directly</h1>
        <p className="text-base text-studojo-muted text-center max-w-xl mx-auto font-satoshi mb-8">
          Skip the job board queue. We find verified emails, write personalised messages, and send them on your behalf.
        </p>

        {/* Say how many hiring managers they have, and how many actually
            match, before they pick a pack bigger than that (UC-Q09, UC-Q13).
            Shown with or without strong_total from the API. */}
        {leadHeadline(leadCount, strongCount) && (
          <p className="max-w-xl mx-auto -mt-4 mb-8 text-center text-sm font-satoshi text-studojo-ink">
            <strong>{leadHeadline(leadCount, strongCount)}</strong>
            {" "}Every pack contacts your strongest matches first, and a campaign never uses more credits than you have matches.
          </p>
        )}

        {/* Dream companies: single-row horizontal scroll */}
        {dreamCompanies.length > 0 && (
          <div className="max-w-3xl mx-auto mb-8 rounded-2xl border-2 border-studojo-ink bg-white p-5 shadow-brutal">
            <p className="text-xs font-bold uppercase tracking-widest text-studojo-muted mb-3 text-center">Your dream companies are in the mix</p>
            <div className="flex gap-2.5 overflow-x-auto pb-1 sm:justify-center">
              {dreamCompanies.map((c) => <DreamChip key={c.name} name={c.name} domain={c.domain} />)}
            </div>
          </div>
        )}

        {/* Credits banner */}
        {credits && credits.total_credits > 0 && (() => {
          const available = credits.available_credits;
          const sent = credits.emails_delivered || 0;
          const scheduled = credits.emails_scheduled || 0;
          const status = credits.campaign_status ?? null;
          // Credits are reserved up front when a campaign starts, so a live
          // campaign leaves available at 0. Saying "you have 0 credits" to
          // someone whose emails are going out reads as money vanishing.
          const label = available > 0
            ? `You have ${available} credits`
            : sent + scheduled > 0
              ? `${sent} emails sent, ${scheduled} ${status === "paused" ? "on hold" : "scheduled"}`
              : `You have ${available} credits`;
          const pill = available > 0
            ? "available"
            : status === "running"
              ? "campaign running"
              : status === "paused"
                ? `paused · ${credits.reserved_credits ?? scheduled} reserved`
                : sent + scheduled > 0 ? "campaign finished" : "available";
          const canUseRemaining = available >= MIN_CAMPAIGN_CREDITS && available < 200 && leadCount !== 0;
          return (
            <div className="max-w-md mx-auto mb-6">
              <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-green-bg/30 px-5 py-3 flex items-center justify-between gap-3 shadow-brutal">
                <span className="text-sm font-bold font-satoshi text-studojo-ink flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-studojo-green-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-green text-sm font-bold">{currSymbol}</span>
                  {label}
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-satoshi font-bold bg-studojo-green-bg text-studojo-green border-2 border-studojo-ink whitespace-nowrap">
                  {pill}
                </span>
              </div>
              {canUseRemaining && (
                <button
                  onClick={startWithRemainingCredits}
                  className="mt-3 w-full h-11 rounded-xl bg-white text-studojo-ink font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center justify-center gap-1.5"
                >
                  Use my {available} credits <FiArrowRight className="w-4 h-4" />
                </button>
              )}
              {available > 0 && available < MIN_CAMPAIGN_CREDITS && (
                <p className="mt-2 text-xs text-studojo-muted font-satoshi text-center">
                  A campaign needs at least {MIN_CAMPAIGN_CREDITS} credits, so these stay on your balance.
                </p>
              )}
            </div>
          );
        })()}

        {/* No leads: nothing to buy yet (UC-Q24) */}
        {leadCount === 0 && (
          <div className="max-w-md mx-auto mb-6 rounded-2xl border-2 border-studojo-ink bg-white px-5 py-4 shadow-brutal text-center">
            <p className="font-satoshi text-sm font-bold text-studojo-ink mb-1">We have not found hiring managers for you yet</p>
            <p className="font-satoshi text-sm text-studojo-muted mb-3">There is nothing to send to, so there is nothing to buy. Go back and run the search again.</p>
            <button
              onClick={() => navigate("/outreach/leads/results")}
              className="h-10 px-4 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-bold border-2 border-studojo-ink shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
            >
              Back to your search
            </button>
          </div>
        )}

        {/* Prices did not load: say so rather than guess (UC-Q39) */}
        {pricingState === "failed" && (
          <div className="max-w-md mx-auto mb-6 rounded-2xl border-2 border-red-500 bg-red-50 px-5 py-3 flex items-center justify-between gap-3">
            <p className="font-satoshi text-sm font-medium text-red-700">Prices did not load.</p>
            <button
              onClick={() => void loadPricing()}
              className="h-9 px-4 rounded-xl bg-white text-studojo-ink text-sm font-satoshi font-bold border-2 border-studojo-ink"
            >
              Try again
            </button>
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
                onClick={() => { capturePostHog("tier_selected", { tier: tier.value }); setSelectedTier(tier.value); setCouponError(""); if (couponCode.trim()) { void validateCoupon(tier.value); } else { setCouponResult(null); } }}
                className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all flex flex-col ${
                  isSelected
                    ? "border-studojo-purple bg-studojo-purple-bg/20 shadow-[4px_4px_0px_0px_rgba(124,58,237,1)]"
                    : "border-studojo-ink/20 bg-white hover:border-studojo-ink/50"
                }`}
              >
                {/* Badges */}
                {isStarter && (
                  <div className="absolute -top-3 left-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-studojo-ink text-white text-xs font-bold font-satoshi whitespace-nowrap">
                      8-day sprint
                    </span>
                  </div>
                )}
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-2.5 py-0.5 rounded-full bg-studojo-purple text-white text-xs font-bold font-satoshi whitespace-nowrap">
                      Recommended
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <p className="text-xs font-clash font-bold text-studojo-muted uppercase tracking-widest mb-3 mt-1">
                  {tier.name}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  <span className="font-clash text-3xl font-black text-studojo-ink leading-none">
                    {price.discounted || price.display}
                  </span>
                  {price.discounted && (
                    <span className="text-sm line-through text-studojo-muted font-satoshi">{price.display}</span>
                  )}
                </div>

                <p className="text-xs text-studojo-muted font-satoshi mt-2 mb-4 leading-relaxed">{tier.tagline}</p>
                {/* UC-Q20: what this pack reaches in their own list. */}
                {(() => {
                  const m = tierMatch(tier.value, leadCount, strongCount);
                  if (!m) return null;
                  return (
                    <div className="-mt-2 mb-4 text-xs font-satoshi leading-snug">
                      <p className="font-medium text-studojo-ink">{m.reach}.</p>
                      {m.leftover && <p className="mt-1 text-amber-700">{m.leftover}</p>}
                    </div>
                  );
                })()}

                <div className="border-t border-studojo-ink/10 mb-4" />

                {/* Features */}
                <ul className="space-y-2.5 mb-5 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs font-satoshi text-studojo-ink leading-snug">
                      <FiCheck className="w-3.5 h-3.5 text-studojo-green mt-0.5 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTier(tier.value);
                    handlePayAndContinue(tier.value);
                  }}
                  disabled={(paying && isSelected) || leadCount === 0 || (pricingState !== "ready" && !hasCredits) || (!hasCredits && !refundAgreed)}
                  className={`w-full h-10 rounded-xl font-satoshi font-bold text-sm border-2 border-studojo-ink transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
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

        <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-studojo-ink bg-white px-4 py-3 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
          <input
            type="checkbox"
            checked={refundAgreed}
            onChange={(e) => setRefundAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#6d28d9]"
          />
          <span className="font-satoshi text-sm leading-5 text-studojo-ink">
            I am 18 or older and agree to the{" "}
            <a href="/refund-policy" target="_blank" rel="noopener" className="font-medium text-studojo-purple-strong underline">
              Refund Policy
            </a>
            .
          </span>
        </label>
        <p className="text-center text-sm text-studojo-muted font-satoshi mb-14">
          One-time payment · No subscription, no auto-renew ·{" "}
          <a href="/refund-policy" target="_blank" rel="noopener" className="underline">Refund Policy</a>
        </p>

        {error && <p className="text-red-600 text-sm text-center mb-6 font-satoshi">{error}</p>}

        {/* Coupon: right under the plans, not below the FAQ (audit OP-N12) */}
        <div id="coupon" className="rounded-2xl border-2 border-studojo-ink/20 bg-white p-5 mb-8 max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <FiTag className="w-4 h-4 text-studojo-purple" />
            <p className="font-satoshi text-sm font-bold text-studojo-ink">Have a coupon?</p>
          </div>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(""); }}
              placeholder="Enter code"
              className="flex-1 h-10 px-4 rounded-xl border-2 border-studojo-ink/20 text-base font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
            />
            <button
              onClick={() => void validateCoupon()}
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

        {/* Wall of Love */}
        <WallOfLove />

        {/* Founder note */}
        <div className="max-w-2xl mx-auto mb-14 rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg/40 p-5 md:p-6 shadow-brutal">
          <p className="text-sm md:text-[15px] text-studojo-ink leading-6 font-satoshi">
            "Job boards are dead. You upload a resume, an algorithm buries it, and weeks later you've heard nothing. We built Studojo so you skip the queue and land straight in the inbox of the person who can actually hire you. And if a campaign stops because of us, we fix it or refund it, as our Refund Policy sets out."
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <div className="h-8 w-8 rounded-full border-2 border-studojo-ink bg-studojo-purple flex items-center justify-center font-clash font-bold text-white text-xs">S</div>
            <p className="text-xs text-studojo-muted font-satoshi"><strong className="text-studojo-ink">The Studojo team</strong> · we read every reply you forward us</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="font-clash text-2xl md:text-3xl font-bold text-center text-studojo-ink mb-6">Questions, answered</h2>
          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map(([q, a]) => (
              <div key={q} className="rounded-2xl border-2 border-studojo-ink bg-white p-5 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
                <p className="font-bold text-[15px] mb-1.5 font-satoshi text-studojo-ink">{q}</p>
                <p className="text-sm text-studojo-muted leading-6 font-satoshi">{a}</p>
              </div>
            ))}
          </div>
        </div>


        <p className="text-xs text-studojo-muted font-satoshi text-center">
          Emails sent gradually over several days. About 4 in 10 students hear back in their first week.
        </p>
      </div>
      <AppFooter />

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t-2 border-studojo-ink bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold font-satoshi text-studojo-ink truncate">
              {selectedTierObj?.name} · {selectedTier} contacts
            </p>
            <p className="text-xs text-studojo-muted font-satoshi">
              {selectedPrice.discounted || selectedPrice.display}
              {hasCreditsForSelected ? " · covered by your credits" : ""}
              {!hasCreditsForSelected && !couponResult?.valid && (
                <>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => document.getElementById("coupon")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                    // PH-14: a 44px tap area without making the bar taller.
                    className="-my-3 inline-block py-3 underline font-semibold text-studojo-purple"
                  >
                    Have a coupon?
                  </button>
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => handlePayAndContinue(selectedTier)}
            disabled={paying || leadCount === 0 || (pricingState !== "ready" && !hasCreditsForSelected)}
            className="h-11 px-6 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none whitespace-nowrap flex-shrink-0 inline-flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {paying ? "Processing..." : <>{hasCreditsForSelected ? "Use Credits" : "Get Started"} <FiArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>

      {/* Dodo Payments checkout modal */}
      {dodoCheckoutUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => { capturePostHog("checkout_abandoned", { tier: selectedTier, provider: "dodo" }); closeDodoModal(); setPaying(false); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ width: "min(480px, 95vw)", height: "min(640px, 90vh)" }}>
            <button
              onClick={() => { capturePostHog("checkout_abandoned", { tier: selectedTier, provider: "dodo" }); closeDodoModal(); setPaying(false); }}
              className="absolute top-3 right-3 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg font-bold"
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
