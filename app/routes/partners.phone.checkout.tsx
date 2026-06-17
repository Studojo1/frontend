import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { phonePartnersPost, PhonePartnersApiError, getStoredUser, clearToken } from "~/lib/partnersPhone/api";
import type { Route } from "./+types/partners.phone.checkout";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Buy Credits | Studojo Phone API" }];
}

const PRICE_PER_CREDIT = 3000; // ₹
const LEADS_PER_RUN = 25;
const MIN_CREDITS = 1;
const MAX_CREDITS = 500;

const PRESETS = [1, 5, 10, 25, 50, 100, 200, 500];

const INCLUDED = [
  "25 verified hiring manager contacts per run",
  "Direct phone number + verified email per lead",
  "Personalised outreach intel (5 fields per lead)",
  "Career match scores + hiring probability per lead",
  "Web research + company context per lead",
  "Webhook delivery on completion",
  "API key self-service via dashboard",
  "Credits never expire",
];

export default function PhonePartnersCheckout() {
  const navigate = useNavigate();
  const [user] = useState(getStoredUser);
  const [credits, setCredits] = useState(5);
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
    if (!user) navigate("/partners/phone/login");
  }, [user, navigate]);

  const basePaise = credits * PRICE_PER_CREDIT * 100;
  const finalPaise =
    couponState.valid && couponState.discountedPaise != null
      ? couponState.discountedPaise
      : basePaise;
  const savings = basePaise - finalPaise;
  const pricePerLead = ((finalPaise / 100) / (credits * LEADS_PER_RUN)).toFixed(0);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponState({});
    try {
      const res = await phonePartnersPost<{
        valid: boolean;
        discount_percent?: number;
        message?: string;
        discounted_price_paise?: number;
      }>("/api/v1/phone/partners/coupon/validate", { code: couponCode.trim(), credits });
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
      const returnUrl = `${window.location.origin}/partners/phone/payment-success`;
      const res = await phonePartnersPost<{ checkout_url: string; checkout_id: string }>(
        "/api/v1/phone/partners/payment/checkout",
        {
          credits,
          coupon_code: couponState.valid ? couponCode.trim() : undefined,
          return_url: returnUrl,
        },
      );
      localStorage.setItem("phone_partner_checkout_id", res.checkout_id);
      window.location.href = res.checkout_url;
    } catch (err: any) {
      setError(err.message ?? "Payment setup failed. Please try again or contact support.");
      setCheckingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50 font-['Satoshi']">
      <nav className="border-b-2 border-neutral-900 bg-white px-6 py-4 flex items-center justify-between">
        <Link to="/partners/phone" className="font-['Clash_Display'] text-xl font-bold text-neutral-900">
          Studojo Phone API
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden text-sm text-neutral-500 md:block">
              {user.name}{user.company ? ` · ${user.company}` : ""}
            </span>
          )}
          <button
            onClick={() => { clearToken(); navigate("/partners/phone/login"); }}
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-2 font-['Clash_Display'] text-3xl font-bold text-neutral-900">
          Buy run credits
        </h1>
        <p className="mb-8 text-neutral-500">
          Each credit = one run = {LEADS_PER_RUN} verified hiring manager contacts with phone numbers. Credits never expire.
        </p>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left */}
          <div className="lg:col-span-3 space-y-5">
            {/* Slider */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Credits</div>
                  <div className="font-['Clash_Display'] text-5xl font-bold text-neutral-900">
                    {credits.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-right text-sm text-neutral-400">
                  {(credits * LEADS_PER_RUN).toLocaleString("en-IN")} leads total
                </div>
              </div>

              <input
                type="range"
                min={MIN_CREDITS}
                max={MAX_CREDITS}
                step={1}
                value={credits}
                onChange={(e) => { setCredits(Number(e.target.value)); setCouponState({}); }}
                className="w-full accent-violet-500"
              />
              <div className="mt-2 flex justify-between text-xs text-neutral-400">
                <span>{MIN_CREDITS}</span>
                <span>{MAX_CREDITS}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setCredits(p); setCouponState({}); }}
                    className={`rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
                      credits === p
                        ? "border-neutral-900 bg-violet-500 text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                        : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-900"
                    }`}
                  >
                    {p}
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
                  <span>{credits.toLocaleString("en-IN")} credits × ₹3,000</span>
                  <span className="font-semibold">₹{(credits * PRICE_PER_CREDIT).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Leads per run</span>
                  <span>{LEADS_PER_RUN}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Total leads</span>
                  <span>{(credits * LEADS_PER_RUN).toLocaleString("en-IN")}</span>
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
