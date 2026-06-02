import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { partnersPost, PartnersApiError, getStoredUser, clearToken } from "~/lib/partners/api";
import type { Route } from "./+types/partners.checkout";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Buy Credits | Studojo Partners" }];
}

const PRICE_PER_CANDIDATE = 1500; // ₹
const LEADS_PER_RUN = 200;
const MIN_CANDIDATES = 10;
const MAX_CANDIDATES = 10_000;

const PRESETS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

const INCLUDED = [
  "200 verified hiring manager contacts per run",
  "Personalised outreach intel (5 fields per lead)",
  "Verified work emails with bounce rate protection",
  "Web research + company context per lead",
  "Webhook delivery on completion",
  "API key self-service via dashboard",
  "Credits never expire",
];

export default function PartnersCheckout() {
  const navigate = useNavigate();
  const [user] = useState(getStoredUser);
  const [candidates, setCandidates] = useState(100);
  const [couponCode, setCouponCode] = useState("");
  const [couponState, setCouponState] = useState<{
    valid?: boolean;
    discount?: number;
    message?: string;
    discountedPaise?: number;
  }>({});
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate("/partners/login");
  }, [user, navigate]);

  const basePaise = candidates * PRICE_PER_CANDIDATE * 100;
  const finalPaise =
    couponState.valid && couponState.discountedPaise != null
      ? couponState.discountedPaise
      : basePaise;
  const savings = basePaise - finalPaise;
  const pricePerLead = ((finalPaise / 100) / (candidates * LEADS_PER_RUN)).toFixed(2);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponState({});
    try {
      const res = await partnersPost<{
        valid: boolean;
        discount_percent?: number;
        message?: string;
        discounted_price_paise?: number;
      }>("/partners/coupons/validate", { code: couponCode.trim(), candidates });
      setCouponState({
        valid: res.valid,
        discount: res.discount_percent,
        message: res.message,
        discountedPaise: res.discounted_price_paise,
      });
    } catch {
      setCouponState({ valid: false, message: "Could not validate coupon." });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setError(null);
    try {
      const returnUrl = `${window.location.origin}/partners/payment-success`;
      const res = await partnersPost<{ checkout_url: string; checkout_id: string }>("/partners/payment/checkout", {
        candidates,
        coupon_code: couponState.valid ? couponCode.trim() : undefined,
        return_url: returnUrl,
      });
      localStorage.setItem("partner_checkout_id", res.checkout_id);
      window.location.href = res.checkout_url;
    } catch (err: any) {
      setError(err.message ?? "Payment setup failed. Please try again or contact support.");
      setCheckingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50 font-['Satoshi']">
      {/* Nav — consistent with dashboard */}
      <nav className="border-b-2 border-neutral-900 bg-white px-6 py-4 flex items-center justify-between">
        <Link to="/partners" className="font-['Clash_Display'] text-xl font-bold text-neutral-900">
          Studojo Partners
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden text-sm text-neutral-500 md:block">
              {user.name}{user.company ? ` · ${user.company}` : ""}
            </span>
          )}
          <button
            onClick={() => { clearToken(); navigate("/partners/login"); }}
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-2 font-['Clash_Display'] text-3xl font-bold text-neutral-900">
          Buy candidate credits
        </h1>
        <p className="mb-8 text-neutral-500">
          Each credit = one candidate run = {LEADS_PER_RUN} verified hiring manager leads. Credits never expire.
        </p>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left */}
          <div className="lg:col-span-3 space-y-5">
            {/* Slider */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Candidates</div>
                  <div className="font-['Clash_Display'] text-5xl font-bold text-neutral-900">
                    {candidates.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-right text-sm text-neutral-400">
                  {(candidates * LEADS_PER_RUN).toLocaleString("en-IN")} leads total
                </div>
              </div>

              <input
                type="range"
                min={MIN_CANDIDATES}
                max={MAX_CANDIDATES}
                step={5}
                value={candidates}
                onChange={(e) => { setCandidates(Number(e.target.value)); setCouponState({}); }}
                className="w-full accent-violet-500"
              />
              <div className="mt-2 flex justify-between text-xs text-neutral-400">
                <span>{MIN_CANDIDATES}</span>
                <span>{MAX_CANDIDATES.toLocaleString("en-IN")}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setCandidates(p); setCouponState({}); }}
                    className={`rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
                      candidates === p
                        ? "border-neutral-900 bg-violet-500 text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                        : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-900"
                    }`}
                  >
                    {p >= 1000 ? `${p / 1000}K` : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              <label className="mb-2 block text-sm font-semibold text-neutral-700">Coupon code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponState({}); }}
                  placeholder="Enter code"
                  className="flex-1 rounded-xl border-2 border-neutral-900 px-4 py-2.5 text-sm font-mono uppercase outline-none focus:ring-2 focus:ring-violet-400"
                />
                <button
                  onClick={validateCoupon}
                  disabled={!couponCode.trim() || validatingCoupon}
                  className="rounded-xl border-2 border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
                >
                  {validatingCoupon ? "..." : "Apply"}
                </button>
              </div>
              {couponState.message && (
                <p className={`mt-2 text-sm font-medium ${couponState.valid ? "text-green-600" : "text-red-500"}`}>
                  {couponState.valid ? "✓ " : "✗ "}{couponState.message}
                </p>
              )}
              <p className="mt-2 text-xs text-neutral-400">
                Some codes are only valid for specific quantities.
              </p>
            </div>

            {/* Included */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-neutral-50 p-6">
              <h3 className="mb-3 font-['Clash_Display'] text-base font-bold text-neutral-900">What's included</h3>
              <ul className="space-y-2">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                    <span className="mt-0.5 shrink-0 text-violet-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
              <h2 className="mb-5 font-['Clash_Display'] text-xl font-bold text-neutral-900">Order summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>{candidates.toLocaleString("en-IN")} candidates × ₹1,500</span>
                  <span className="font-semibold">₹{(candidates * PRICE_PER_CANDIDATE).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Leads per run</span>
                  <span>{LEADS_PER_RUN}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Total leads</span>
                  <span>{(candidates * LEADS_PER_RUN).toLocaleString("en-IN")}</span>
                </div>
                {couponState.valid && savings > 0 && (
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Discount ({couponState.discount}% off)</span>
                    <span>-₹{(savings / 100).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="border-t-2 border-neutral-900 pt-3">
                  <div className="flex justify-between font-['Clash_Display'] text-2xl font-bold text-neutral-900">
                    <span>Total</span>
                    <span>₹{(finalPaise / 100).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="mt-1 text-right text-xs text-neutral-400">≈ ₹{pricePerLead} per lead</div>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border-2 border-red-400 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="mt-6 w-full rounded-xl border-2 border-neutral-900 bg-violet-500 py-3.5 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] disabled:opacity-60"
              >
                {checkingOut ? "Redirecting..." : "Complete purchase →"}
              </button>

              <div className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-xs text-violet-700">
                <strong>Credits never expire.</strong> Use them at your own pace. No monthly fee, no seat limit.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
