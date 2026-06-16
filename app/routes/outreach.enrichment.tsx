import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiTag, FiArrowRight, FiArrowLeft, FiShield, FiCheck, FiCheckCircle } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { useOrder } from "~/lib/outreach/hooks";
import { outreachFetch } from "~/lib/outreach/api";
import { capturePostHog } from "~/lib/posthog";
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

// ── Trust / value copy ─────────────────────────────────────────────────────
const GUARANTEE = {
  head: "Zero-reply protection",
  body: "If your campaign finishes and not a single person replies, we extend it free until you hear back. You never pay for silence.",
};
const TRUST_PTS = [
  "Verified emails, not guesses",
  "Sent from your own Gmail",
  "One-time, no subscription",
  "Your data stays private",
];
const FAQ_ITEMS: [string, string][] = [
  ["Is this spam?", "No. Each email is personalised to the person and their company, sent one at a time from your own Gmail on an inbox-safe schedule."],
  ["Whose email does it come from?", "Your own Gmail, signed by you, so replies come straight back to your inbox."],
  ["What if I don't get any replies?", GUARANTEE.body],
  ["Can they tell it's written by AI?", "No. Each email references real details about them and your background, so it reads like a human wrote it, because the substance is yours."],
  ["Is my data safe?", "Yes. Your resume and contacts stay private and are never sold or shared. Payments are handled by Razorpay, so we never see your card details."],
];

// ── Wall of Love (authentic-style screenshots, anonymised) ─────────────────
type WallCard =
  | { type: "tweet"; n: string; h: string; d: string; v: boolean; q: string; re: number; rt: number; lk: number }
  | { type: "imsg"; in: string; out: string; t: string }
  | { type: "whatsapp"; q: string; t: string }
  | { type: "linkedin"; n: string; role: string; deg: string; q: string };
const WALL: WallCard[] = [
  { type: "tweet", n: "Sahil Gulihar", h: "@Sahil_Gulihar", d: "May 30", v: false, q: "went in as a casual tester to find bugs. came out with an interview lol. no messy emails, no hunting. just chat, then interview", re: 4, rt: 4, lk: 34 },
  { type: "imsg", in: "yo update, my profile got shortlisted for a role", out: "and I wasn't even trying that hard", t: "2:11 PM" },
  { type: "linkedin", n: "Rimjhim Hazarika", role: "L&D Consultant", deg: "2nd", q: "Trying it out and saying this with a lot of respect. The convo feels anything but transactional. Genuinely impressed." },
  { type: "tweet", n: "Siddharth K S", h: "@sidks", d: "4d", v: true, q: "been testing this for the past hour, honestly seamless. gives such a great handle on things right away", re: 1, rt: 2, lk: 21 },
  { type: "whatsapp", q: "have been using studojo, pretty good at finding the right people. really liked it", t: "9:09 PM" },
  { type: "tweet", n: "Anunaya Tandon", h: "@AnunayaTandon", d: "May 28", v: false, q: "first experience of @studojo, the ai is so good!", re: 0, rt: 1, lk: 12 },
  { type: "imsg", in: "wait this actually works??", out: "told you", t: "3:38 AM" },
  { type: "whatsapp", q: "studojo slaps hard", t: "9:12 PM" },
  { type: "linkedin", n: "Marcus T.", role: "CS @ NYU", deg: "2nd", q: "3 founder replies in week one. Genuinely did not expect this from a tool. Telling everyone in my batch." },
  { type: "tweet", n: "Meera P.", h: "@meera_builds", d: "Jun 2", v: false, q: "stopped spamming applications. finally getting actual responses", re: 2, rt: 3, lk: 27 },
];
const WCOLORS = ["bg-studojo-purple", "bg-studojo-pink", "bg-studojo-green", "bg-studojo-orange", "bg-indigo-500", "bg-rose-500", "bg-teal-500"];
const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const wcolor = (n: string) => WCOLORS[n.charCodeAt(0) % WCOLORS.length];

function ReviewCard({ v }: { v: WallCard }) {
  const shell = "w-[290px] h-[160px] flex-shrink-0 rounded-2xl border-2 border-studojo-ink shadow-brutal flex flex-col";
  if (v.type === "tweet") {
    return (
      <div className={`${shell} bg-white p-4`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-full ${wcolor(v.n)} text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 sd-pii`}>{initials(v.n)}</div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-bold truncate sd-pii">{v.n}</span>
              {v.v && <span className="inline-flex w-3.5 h-3.5 rounded-full bg-[#1d9bf0] items-center justify-center flex-shrink-0"><svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg></span>}
            </div>
            <div className="text-[12px] text-studojo-muted truncate"><span className="sd-pii">{v.h}</span> · {v.d}</div>
          </div>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-studojo-muted flex-shrink-0"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        </div>
        <p className="text-[13px] leading-snug mt-2.5 flex-1 overflow-hidden">{v.q}</p>
        <div className="flex items-center gap-7 pt-2 text-studojo-muted text-[11px]">
          <span>↩ {v.re}</span><span>⇄ {v.rt}</span><span>♥ {v.lk}</span>
        </div>
      </div>
    );
  }
  if (v.type === "imsg") {
    return (
      <div className={`${shell} bg-[#1c1c1e] p-3.5 justify-center`}>
        <div className="flex flex-col gap-2">
          <div className="self-start max-w-[88%] bg-[#3a3a3c] text-white text-[13px] leading-snug rounded-2xl rounded-bl-md px-3 py-2">{v.in}</div>
          <div className="self-end max-w-[88%] bg-[#0a84ff] text-white text-[13px] leading-snug rounded-2xl rounded-br-md px-3 py-2">{v.out}</div>
        </div>
        <p className="text-[10px] text-white/40 text-center mt-2.5">{v.t}</p>
      </div>
    );
  }
  if (v.type === "whatsapp") {
    return (
      <div className={`${shell} bg-[#0b141a] p-3.5 justify-center`}>
        <div className="self-end max-w-[94%] bg-[#005c4b] text-white text-[13.5px] leading-snug rounded-2xl rounded-br-md px-3 py-2">
          {v.q}
          <span className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/55">{v.t} ✓✓</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`${shell} bg-white p-4`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-full ${wcolor(v.n)} text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 sd-pii`}>{initials(v.n)}</div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold truncate sd-pii">{v.n}</span>
            <span className="text-[10px] text-studojo-muted whitespace-nowrap">· {v.deg}</span>
            <span className="inline-flex w-3.5 h-3.5 rounded-[3px] bg-[#0a66c2] text-white items-center justify-center text-[8px] font-bold flex-shrink-0">in</span>
          </div>
          <div className="text-[12px] font-medium text-studojo-ink/75 truncate">{v.role}</div>
        </div>
      </div>
      <p className="text-[13px] leading-snug mt-2.5 flex-1 overflow-hidden">{v.q}</p>
      <div className="flex items-center gap-3 pt-2 text-[11px] font-semibold text-studojo-muted"><span>Like</span><span>· Reply</span></div>
    </div>
  );
}

function WallOfLove() {
  const half = Math.ceil(WALL.length / 2);
  const rowA = WALL.slice(0, half);
  const rowB = WALL.slice(half);
  return (
    <div className="mb-14">
      <h2 className="font-clash text-2xl md:text-3xl font-bold text-center text-studojo-ink mb-1">Students are already getting in</h2>
      <p className="text-center text-sm text-studojo-muted mb-6">Real messages from students using Studojo.</p>
      <div className="sd-wall-mask space-y-3 overflow-hidden">
        <div className="sd-marquee flex gap-3 w-max">{[...rowA, ...rowA].map((v, i) => <ReviewCard key={i} v={v} />)}</div>
        <div className="sd-marquee-rev flex gap-3 w-max">{[...rowB, ...rowB].map((v, i) => <ReviewCard key={i} v={v} />)}</div>
      </div>
    </div>
  );
}

// Dream-company chip — logo from a guessed domain, graceful fallback to name only.
function DreamChip({ name, domain }: { name: string; domain: string | null }) {
  // Same logo waterfall as FlashCard: Clearbit (crisp brand mark) → Google
  // favicon → hide. We ONLY guess "{name}.com" when no real domain is known
  // from the user's actual leads — and even then we prefer to hide than show
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
  const [currency, setCurrency] = useState("USD");
  const [credits, setCredits] = useState<{ total_credits: number; used_credits: number; available_credits: number } | null>(null);
  const [dreamCompanies, setDreamCompanies] = useState<Array<{ name: string; domain: string | null }>>([]);
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
    // New email flow: cancel any pending cc marketing sequences for this user
    // now that the user has paid. event.cc.paid is cancel-only (no email).
    if (user?.id) {
      import("~/lib/events").then(({ publishEmailEventFromClient }) => {
        publishEmailEventFromClient("event.cc.paid", { user_id: user.id }).catch(() => {});
      }).catch(() => {});
    }
    // The outreach flow goes straight to Gmail connect (never payment-success.tsx),
    // so fire payment_confirmed here or the funnel's "Paid" step misses these.
    capturePostHog("payment_confirmed", { tier: selectedTier, currency });
    try {
      setCredits(await outreachFetch("/payment/credits"));
    } catch {}
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

  // Fetch dream companies for the "in the mix" bar (no Apollo — reads stored data).
  // We also pull the user's actual leads so we can resolve each dream company's
  // REAL domain (Apollo-verified) instead of guessing "{name}.com" — that guess
  // grabs the wrong site for ambiguous names ("swish.com" is a Swedish payment
  // app, not the Indian food-delivery startup the candidate targeted).
  useEffect(() => {
    if (!candidateId) return;
    Promise.all([
      outreachFetch<any>(`/candidate/${candidateId}/profile`).catch(() => null),
      outreachFetch<{ leads: any[] } | any[]>(`/candidate/${candidateId}/leads`).catch(() => null),
    ]).then(([profile, leadsResp]) => {
      const raw: string[] = profile?.dream_companies || [];
      const clean = raw
        .map((c) => (c || "").trim())
        .filter((c) => c.length >= 2 && c.length <= 40 && /[a-z0-9]/i.test(c) && !/no strong preference|etc\b/i.test(c));

      // Build a {company-name → domain} map from the candidate's leads.
      const leadArr: any[] = Array.isArray(leadsResp)
        ? leadsResp
        : (leadsResp?.leads ?? []);
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
      capturePostHog("coupon_applied", { code: couponCode.trim(), valid: !!data?.valid });
    } catch (err: any) {
      setCouponError(err?.body?.detail || err.message || "Invalid coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePayAndContinue = async (tierValue: number = selectedTier) => {
    if (!candidateId) return;

    const coveredByCredits = !!(credits && credits.available_credits >= tierValue);
    capturePostHog("pay_now_clicked", { tier: tierValue, covered_by_credits: coveredByCredits });

    // If user already has enough credits for this specific tier, skip payment.
    // tierValue is passed explicitly from the button to avoid stale closure
    // (setSelectedTier is async; reading selectedTier here would get the old value).
    if (coveredByCredits) {
      onPaymentSuccess();
      return;
    }

    setPaying(true);
    setError("");
    try {
      const orderData = await outreachFetch<any>("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({ tier: tierValue, currency, coupon_code: couponResult?.valid ? couponCode.trim() : undefined }),
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

      if (orderData.checkout_url) {
        dodoSessionRef.current = orderData.session_id;
        dodoTierRef.current = selectedTier;
        dodoPollingRef.current = true;
        capturePostHog("checkout_opened", { tier: tierValue, provider: "dodo" });
        setDodoCheckoutUrl(orderData.checkout_url);
        pollDodoVerify(0);
        return;
      }

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
        modal: { ondismiss: () => { capturePostHog("checkout_abandoned", { tier: tierValue, provider: "razorpay" }); setPaying(false); } },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        capturePostHog("payment_failed", { tier: tierValue, provider: "razorpay", reason: response.error?.description });
        setError(response.error?.description || "Payment failed");
        setPaying(false);
      });
      capturePostHog("checkout_opened", { tier: tierValue, provider: "razorpay" });
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
        anchor: match.anchor_display ?? null,
        discountPct: match.discount_pct ?? null,
      };
    }
    const fallback = TIERS.find((t) => t.value === tierValue)?.fallbackPrice ?? "";
    return { display: fallback, discounted: null, anchor: null, discountPct: null };
  };

  const selectedTierObj = TIERS.find((t) => t.value === selectedTier) ?? TIERS[TIERS.length - 2];
  const selectedPrice = getTierPrice(selectedTier);
  const hasCreditsForSelected = credits ? credits.available_credits >= selectedTier : false;

  return (
    <div className="min-h-screen bg-white pb-28">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">

        {/* Header — back button gets its own row above the centered title so
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
        <p className="text-base text-studojo-muted text-center max-w-xl mx-auto font-satoshi">
          Skip the job board queue. We find verified emails, write personalised messages, and send them on your behalf.
        </p>

        {/* Dream companies — single-row horizontal scroll */}
        {dreamCompanies.length > 0 && (
          <div className="max-w-3xl mx-auto mb-8 rounded-2xl border-2 border-studojo-ink bg-white p-5 shadow-brutal">
            <p className="text-[11px] font-bold uppercase tracking-widest text-studojo-muted mb-3 text-center">Your dream companies are in the mix</p>
            <div className="flex gap-2.5 overflow-x-auto pb-1 sm:justify-center">
              {dreamCompanies.map((c) => <DreamChip key={c.name} name={c.name} domain={c.domain} />)}
            </div>
          </div>
        )}

        {/* Credits banner */}
        {credits && credits.total_credits > 0 && (
          <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-green-bg/30 px-5 py-3 mb-6 flex items-center justify-between max-w-md mx-auto shadow-brutal">
            <span className="text-sm font-bold font-satoshi text-studojo-ink flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-studojo-green-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-green text-sm font-bold">{currSymbol}</span>
              You have {credits.available_credits} credits
            </span>
            <span className="px-3 py-0.5 rounded-full text-xs font-satoshi font-bold bg-studojo-green-bg text-studojo-green border-2 border-studojo-ink">available</span>
          </div>
        )}

        {/* Zero-reply protection — before the price */}
        <div className="max-w-3xl mx-auto mb-8 rounded-2xl border-2 border-studojo-ink bg-studojo-green-bg/40 p-5 md:p-6 flex items-center gap-4 shadow-brutal">
          <span className="hidden sm:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-studojo-ink bg-studojo-green-bg"><FiShield className="w-6 h-6 text-studojo-green" /></span>
          <div>
            <p className="font-clash text-lg md:text-xl font-bold text-studojo-ink mb-0.5">{GUARANTEE.head}</p>
            <p className="text-sm text-studojo-muted font-satoshi">{GUARANTEE.body}</p>
          </div>
        </div>

        {/* Tier cards */}
        <div className={`grid grid-cols-1 ${TIERS.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"} gap-4 mb-8 items-stretch`}>
          {TIERS.map((tier) => {
            const price = getTierPrice(tier.value);
            const isSelected = selectedTier === tier.value;
            const hasCredits = credits ? credits.available_credits >= tier.value : false;
            const isStarter = "durationDays" in tier && !!tier.durationDays;
            const perContact = (() => {
              const m = (price.discounted || price.display || "").match(/[\d.]+/);
              if (!m) return null;
              return `${currSymbol}${(parseFloat(m[0]) / tier.value).toFixed(2)} per hiring manager`;
            })();

            return (
              <div
                key={tier.value}
                onClick={() => { capturePostHog("tier_selected", { tier: tier.value }); setSelectedTier(tier.value); setCouponResult(null); setCouponError(""); }}
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

                {perContact && <p className="text-xs text-studojo-muted font-satoshi mt-1">just {perContact}</p>}
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
                  <li className="flex items-start gap-2 text-xs font-satoshi font-semibold text-studojo-green leading-snug">
                    <FiCheck className="w-3.5 h-3.5 text-studojo-green mt-0.5 flex-shrink-0" />
                    {GUARANTEE.head} included
                  </li>
                </ul>

                {/* CTA */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTier(tier.value);
                    handlePayAndContinue(tier.value);
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

        <p className="text-center text-sm text-studojo-muted font-satoshi mb-14">
          One-time payment · No subscription, no auto-renew · {GUARANTEE.head} on every plan
        </p>

        {error && <p className="text-red-600 text-sm text-center mb-6 font-satoshi">{error}</p>}

        {/* Wall of Love */}
        <WallOfLove />

        {/* Founder note */}
        <div className="max-w-2xl mx-auto mb-14 rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg/40 p-5 md:p-6 shadow-brutal">
          <p className="text-sm md:text-[15px] text-studojo-ink leading-6 font-satoshi">
            "Job boards are dead. You upload a resume, an algorithm buries it, and weeks later you've heard nothing. We built Studojo so you skip the queue and land straight in the inbox of the person who can actually hire you. And if your list goes quiet, we keep working it until someone replies."
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

        {/* Coupon */}
        <div className="rounded-2xl border-2 border-studojo-ink/20 bg-white p-5 mb-8 max-w-md mx-auto">
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

        <p className="text-xs text-studojo-muted font-satoshi text-center">
          Emails sent gradually over several days. Most students get their first reply within a week.
        </p>
      </div>
      <Footer />

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t-2 border-studojo-ink bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold font-satoshi text-studojo-ink truncate">
              {selectedTierObj?.name} · {selectedTier} contacts <span className="hidden sm:inline text-studojo-green font-semibold">· {GUARANTEE.head}</span>
            </p>
            <p className="text-[11px] text-studojo-muted font-satoshi">
              {selectedPrice.anchor && <span className="line-through">{selectedPrice.anchor} </span>}
              {selectedPrice.discounted || selectedPrice.display}
              {hasCreditsForSelected ? " · covered by your credits" : ""}
            </p>
          </div>
          <button
            onClick={() => handlePayAndContinue(selectedTier)}
            disabled={paying}
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
