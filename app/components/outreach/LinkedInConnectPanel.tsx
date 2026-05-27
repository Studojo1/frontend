import { useState } from "react";
import { FiEye, FiEyeOff, FiShield, FiAlertCircle, FiLinkedin } from "react-icons/fi";
import { outreachFetch } from "~/lib/outreach/api";

interface Props {
  orderId: number;
  onSuccess: (campaignId: number) => void;
}

export function LinkedInConnectPanel({ orderId, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [challenge, setChallenge] = useState<{ type: "pin" | "phone_tap"; sessionKey: string } | null>(null);
  const [pin, setPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [phoneTapLoading, setPhoneTapLoading] = useState(false);

  const [error, setError] = useState("");
  const [creatingCampaign, setCreatingCampaign] = useState(false);

  const afterLogin = async () => {
    setCreatingCampaign(true);
    setError("");
    try {
      const res = await outreachFetch<{ id: number }>("/linkedin/automation/campaigns/from-order", {
        method: "POST",
        body: JSON.stringify({ order_id: orderId, daily_limit: 10 }),
      });
      onSuccess(res.id);
    } catch (err: any) {
      setError(err?.body?.detail || err.message || "Could not create LinkedIn campaign. Please try again.");
    } finally {
      setCreatingCampaign(false);
    }
  };

  // LinkedIn login through the Evomi proxy spawns a Playwright browser and
  // navigates through the full login + checkpoint flow — easily 60-120s.
  // Retrying creates a brand-new Playwright session each time, which fires a
  // fresh phone notification on the user's device. So: long timeout, NO retries.
  const LOGIN_FETCH_OPTS = { timeout: 180_000, maxRetries: 1 } as const;

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await outreachFetch<{ challenge_required?: boolean; challenge_type?: string; session_key?: string }>(
        "/linkedin/automation/login",
        { method: "POST", body: JSON.stringify({ email, password }), ...LOGIN_FETCH_OPTS },
      );
      if (res.challenge_required) {
        setChallenge({
          type: res.challenge_type === "phone_tap" ? "phone_tap" : "pin",
          sessionKey: res.session_key || "",
        });
        return;
      }
      await afterLogin();
    } catch (err: any) {
      setError(err?.body?.detail || err.message || "Connection failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!challenge) return;
    setPinLoading(true);
    setError("");
    try {
      await outreachFetch("/linkedin/automation/login/verify-pin", {
        method: "POST",
        body: JSON.stringify({ session_key: challenge.sessionKey, pin }),
        ...LOGIN_FETCH_OPTS,
      });
      setChallenge(null);
      await afterLogin();
    } catch (err: any) {
      setError(err?.body?.detail || err.message || "Incorrect code. Please try again.");
    } finally {
      setPinLoading(false);
    }
  };

  const handleCheckPhoneTap = async () => {
    if (!challenge) return;
    setPhoneTapLoading(true);
    setError("");
    try {
      const res = await outreachFetch<{ still_waiting?: boolean }>(
        "/linkedin/automation/login/check-phone-tap",
        { method: "POST", body: JSON.stringify({ session_key: challenge.sessionKey }), ...LOGIN_FETCH_OPTS },
      );
      if (res.still_waiting) {
        setError('Not approved yet — tap "Yes" on your phone first, then click Continue.');
        return;
      }
      setChallenge(null);
      await afterLogin();
    } catch (err: any) {
      setError(err?.body?.detail || err.message || "Session expired. Please log in again.");
    } finally {
      setPhoneTapLoading(false);
    }
  };

  if (creatingCampaign) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-studojo-muted font-satoshi">Setting up your LinkedIn campaign...</p>
      </div>
    );
  }

  if (challenge?.type === "pin") {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
          <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold font-satoshi text-amber-800">Verification required</p>
            <p className="text-sm text-amber-700 font-satoshi mt-0.5">LinkedIn sent a verification code to your email. Enter it below.</p>
          </div>
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="6-digit code"
          maxLength={8}
          className="w-full border-2 border-studojo-ink rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest font-clash"
          onKeyDown={(e) => e.key === "Enter" && handleVerifyPin()}
        />
        {error && <p className="text-red-600 text-sm font-satoshi">{error}</p>}
        <button
          onClick={handleVerifyPin}
          disabled={pinLoading || !pin}
          className="w-full h-11 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none"
        >
          {pinLoading ? "Verifying..." : "Verify Code"}
        </button>
        <button onClick={() => setChallenge(null)} className="text-xs text-studojo-muted font-satoshi w-full text-center mt-2">
          ← Use different credentials
        </button>
      </div>
    );
  }

  if (challenge?.type === "phone_tap") {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
          <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold font-satoshi text-blue-800">LinkedIn wants you to confirm it's you</p>
            <p className="text-sm text-blue-700 font-satoshi mt-1">Follow these steps:</p>
            <ol className="mt-2 space-y-1 text-sm text-blue-700 font-satoshi list-none">
              <li className="flex items-start gap-2"><span className="font-bold flex-shrink-0">1.</span> Open the LinkedIn app on your phone</li>
              <li className="flex items-start gap-2"><span className="font-bold flex-shrink-0">2.</span> You'll see a notification — tap it</li>
              <li className="flex items-start gap-2"><span className="font-bold flex-shrink-0">3.</span> Tap <span className="font-bold">"Yes, it's me"</span> to approve</li>
              <li className="flex items-start gap-2"><span className="font-bold flex-shrink-0">4.</span> Come back here and click Continue</li>
            </ol>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm font-satoshi">{error}</p>}
        <button
          onClick={handleCheckPhoneTap}
          disabled={phoneTapLoading}
          className="w-full h-11 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none"
        >
          {phoneTapLoading ? "Checking..." : "I approved it — Continue"}
        </button>
        <button onClick={() => setChallenge(null)} className="text-xs text-studojo-muted font-satoshi w-full text-center mt-2">
          ← Use different credentials
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-studojo-green-bg border-2 border-studojo-ink/20">
        <FiShield className="w-5 h-5 text-studojo-green flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold font-satoshi text-studojo-ink">How this works</p>
          <p className="text-sm text-studojo-muted font-satoshi">
            We use your email and password to log in to LinkedIn once, collect your session cookies, then <span className="font-bold text-studojo-ink">permanently delete your credentials</span>. Your password is never stored — only the session cookies needed to send connection requests on your behalf.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="LinkedIn email"
          className="w-full border-2 border-studojo-ink rounded-xl px-4 py-3 text-sm font-satoshi"
        />
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="LinkedIn password"
            className="w-full border-2 border-studojo-ink rounded-xl px-4 py-3 text-sm font-satoshi pr-12"
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-studojo-muted"
          >
            {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <FiAlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-satoshi">
            LinkedIn may ask you to approve a notification on your phone. If that happens, just tap "Yes, it's me" in the LinkedIn app and come back here.
          </p>
        </div>
        {error && <p className="text-red-600 text-sm font-satoshi">{error}</p>}
        <button
          onClick={handleConnect}
          disabled={loading || !email || !password}
          className="w-full h-11 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          <FiLinkedin className="w-4 h-4" /> {loading ? "Connecting..." : "Connect LinkedIn"}
        </button>
      </div>
    </div>
  );
}
