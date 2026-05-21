import { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiShield, FiAlertCircle, FiLinkedin, FiExternalLink } from "react-icons/fi";
import { outreachFetch } from "~/lib/outreach/api";

interface Props {
  orderId: number;
  onSuccess: (campaignId: number) => void;
}

type LoginTab = "password" | "cookies" | "extension";

export function LinkedInConnectPanel({ orderId, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [liAt, setLiAt] = useState("");
  const [jsessionid, setJsessionid] = useState("");
  const [cookieLoading, setCookieLoading] = useState(false);

  const [extInstalled, setExtInstalled] = useState(false);
  const [extLoading, setExtLoading] = useState(false);

  const [challenge, setChallenge] = useState<{ type: "pin" | "phone_tap"; sessionKey: string } | null>(null);
  const [pin, setPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [phoneTapLoading, setPhoneTapLoading] = useState(false);

  const [tab, setTab] = useState<LoginTab>("password");
  const [error, setError] = useState("");
  const [creatingCampaign, setCreatingCampaign] = useState(false);

  useEffect(() => {
    const onReady = () => setExtInstalled(true);
    window.addEventListener("STUDOJO_EXT_READY", onReady);
    window.dispatchEvent(new CustomEvent("STUDOJO_CHECK_EXT"));
    return () => window.removeEventListener("STUDOJO_EXT_READY", onReady);
  }, []);

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

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await outreachFetch<{ challenge_required?: boolean; challenge_type?: string; session_key?: string }>(
        "/linkedin/automation/login",
        { method: "POST", body: JSON.stringify({ email, password }) },
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
        { method: "POST", body: JSON.stringify({ session_key: challenge.sessionKey }) },
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

  const handleCookieLogin = async () => {
    setCookieLoading(true);
    setError("");
    try {
      await outreachFetch("/linkedin/automation/login/cookies", {
        method: "POST",
        body: JSON.stringify({ li_at: liAt.trim(), jsessionid: jsessionid.trim() }),
      });
      await afterLogin();
    } catch (err: any) {
      setError(err?.body?.detail || err.message || "Invalid cookies. Please check and try again.");
    } finally {
      setCookieLoading(false);
    }
  };

  const handleExtensionLogin = () => {
    setExtLoading(true);
    setError("");
    let timeoutId: ReturnType<typeof setTimeout>;
    const onCookies = (e: Event) => {
      clearTimeout(timeoutId);
      const { li_at, jsessionid: jsid, cookies, error: extErr } = (e as CustomEvent).detail || {};
      window.removeEventListener("STUDOJO_LI_COOKIES", onCookies);
      if (extErr || !li_at) {
        setError(extErr || "Extension could not read LinkedIn cookies. Make sure you're logged in to LinkedIn.");
        setExtLoading(false);
        return;
      }
      outreachFetch("/linkedin/automation/login/cookies", {
        method: "POST",
        body: JSON.stringify({ li_at, jsessionid: jsid || "", is_extension: true, cookies }),
      })
        .then(() => afterLogin())
        .catch((err: any) => {
          setError(err?.body?.detail || err.message || "LinkedIn session invalid. Please re-login to LinkedIn and try again.");
        })
        .finally(() => setExtLoading(false));
    };
    window.addEventListener("STUDOJO_LI_COOKIES", onCookies);
    window.dispatchEvent(new CustomEvent("STUDOJO_REQUEST_LI_COOKIES"));
    timeoutId = setTimeout(() => {
      window.removeEventListener("STUDOJO_LI_COOKIES", onCookies);
      setExtLoading((prev) => {
        if (prev) setError("Extension did not respond. Try refreshing or installing the extension.");
        return false;
      });
    }, 5000);
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

      <div className="flex gap-2 rounded-xl border-2 border-studojo-ink/20 p-1 bg-studojo-surface-muted">
        {(["password", "cookies", "extension"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold font-satoshi transition-all ${
              tab === t ? "bg-white border border-studojo-ink/10 shadow-sm text-studojo-purple" : "text-studojo-muted"
            }`}
          >
            {t === "password" ? "Email & Password" : t === "cookies" ? "Paste Cookies" : "Extension"}
          </button>
        ))}
      </div>

      {tab === "password" && (
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
      )}

      {tab === "cookies" && (
        <div className="space-y-4">
          <p className="text-xs text-studojo-muted font-satoshi">
            Open LinkedIn in your browser → F12 → Application → Cookies → copy{" "}
            <code className="bg-studojo-surface-muted px-1 rounded">li_at</code> and{" "}
            <code className="bg-studojo-surface-muted px-1 rounded">JSESSIONID</code> values.
          </p>
          <input
            type="text"
            value={liAt}
            onChange={(e) => setLiAt(e.target.value)}
            placeholder="li_at cookie value"
            className="w-full border-2 border-studojo-ink rounded-xl px-4 py-3 text-sm font-satoshi font-mono"
          />
          <input
            type="text"
            value={jsessionid}
            onChange={(e) => setJsessionid(e.target.value)}
            placeholder="JSESSIONID cookie value"
            className="w-full border-2 border-studojo-ink rounded-xl px-4 py-3 text-sm font-satoshi font-mono"
          />
          {error && <p className="text-red-600 text-sm font-satoshi">{error}</p>}
          <button
            onClick={handleCookieLogin}
            disabled={cookieLoading || !liAt || !jsessionid}
            className="w-full h-11 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            <FiLinkedin className="w-4 h-4" /> {cookieLoading ? "Connecting..." : "Connect with Cookies"}
          </button>
        </div>
      )}

      {tab === "extension" && (
        <div className="space-y-4">
          {!extInstalled ? (
            <div className="p-4 rounded-xl border-2 border-studojo-ink/20 bg-studojo-surface-muted space-y-3">
              <p className="text-sm font-satoshi text-studojo-muted">
                Install the Studojo browser extension, then come back here to connect with one click — no password needed.
              </p>
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-studojo-purple font-satoshi"
              >
                Install Extension <FiExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-studojo-green-bg border-2 border-studojo-ink/20">
              <div className="w-2 h-2 rounded-full bg-studojo-green" />
              <p className="text-sm font-bold font-satoshi text-studojo-green">Studojo extension detected</p>
            </div>
          )}
          {error && <p className="text-red-600 text-sm font-satoshi">{error}</p>}
          <button
            onClick={handleExtensionLogin}
            disabled={extLoading || !extInstalled}
            className="w-full h-11 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            <FiLinkedin className="w-4 h-4" /> {extLoading ? "Connecting..." : "Connect via Extension"}
          </button>
        </div>
      )}
    </div>
  );
}
