import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FiMail, FiShield, FiEye, FiSend, FiCheckCircle } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOrder } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

export default function GmailConnectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading: authLoading } = useOutreachAuth();
  const { emailAccountId, setEmailAccountId } = useOutreachStore();
  const { updateOrder } = useOrder();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [handled, setHandled] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState("");

  useEffect(() => {
    if (handled) return;
    const status = searchParams.get("status");
    const errorMsg = searchParams.get("message");

    if (status === "error") {
      setError(errorMsg || "Gmail connection failed. Please try again.");
      setHandled(true);
      return;
    }

    if (status === "success") {
      setHandled(true);
      setConnecting(true);
      outreachFetch<{ email_account_id?: number }>("/gmail/oauth/account")
        .then((data) => {
          const accountId = data?.email_account_id;
          if (accountId) {
            setEmailAccountId(accountId);
            updateOrder({ status: "email_connected", email_account_id: accountId, log_entry: "Gmail account connected" });
          }
          setConnected(true);
        })
        .catch(() => {
          setConnected(true);
        })
        .finally(() => setConnecting(false));
    } else if (emailAccountId && !connected) {
      setHandled(true);
      setConnecting(true);
      outreachFetch<{ email_account_id?: number; email_address?: string; token_valid?: boolean }>("/gmail/oauth/account")
        .then((data) => {
          if (data?.email_account_id) {
            if (data.token_valid === false) {
              setNeedsReauth(true);
              setConnectedEmail(data.email_address || "");
            } else {
              setConnected(true);
            }
          }
        })
        .catch(() => {
          setEmailAccountId(0);
        })
        .finally(() => setConnecting(false));
    }
  }, [searchParams, handled]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const data = await outreachFetch<{ url: string }>("/gmail/oauth/connect-url");
      window.location.href = data.url;
    } catch {
      setError("Failed to start Gmail connection. Please try again.");
      setConnecting(false);
    }
  };

  const handleContinue = () => {
    navigate("/outreach/campaign/style-pick");
  };

  const permissions = [
    { icon: <FiSend className="w-5 h-5" />, label: "Send Emails", desc: "Send your outreach emails from your Gmail" },
    { icon: <FiEye className="w-5 h-5" />, label: "Read Replies", desc: "Know when a hiring manager replies" },
    { icon: <FiShield className="w-5 h-5" />, label: "Your Email Address", desc: "Link your Gmail account" },
  ];

  if (authLoading || connecting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        {needsReauth ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-studojo-ink flex items-center justify-center mx-auto mb-6">
              <FiShield className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">Gmail Access Expired</h1>
            <p className="text-base text-studojo-muted mb-2 font-satoshi">
              Your connection to <span className="font-bold text-studojo-ink">{connectedEmail}</span> has been revoked or expired.
            </p>
            <p className="text-sm text-studojo-muted mb-8 font-satoshi">
              Please re-authorize to continue sending emails.
            </p>
            <button
              onClick={handleConnect}
              className="w-full h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Re-authorize Gmail
            </button>
          </div>
        ) : connected ? (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-studojo-green-bg border-2 border-studojo-ink flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-8 h-8 text-studojo-green" />
            </div>
            <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">Gmail Connected</h1>
            <p className="text-base text-studojo-muted mb-8 font-satoshi">Your Gmail account is ready to send outreach emails.</p>
            <button
              onClick={handleContinue}
              className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Continue to Campaign Setup
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-full bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center mx-auto text-studojo-purple mb-6">
                <FiMail className="w-8 h-8" />
              </div>
              <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">Connect Your Gmail</h1>
              <p className="text-sm text-studojo-muted font-satoshi">We need Gmail access to send outreach emails from your account.</p>
            </div>

            <div className="space-y-3 mb-8">
              <h3 className="font-clash text-lg font-bold text-studojo-ink">Permissions Required</h3>
              {permissions.map((p, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-studojo-surface-muted rounded-xl border-2 border-studojo-ink/20">
                  <div className="w-10 h-10 rounded-xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center text-studojo-purple flex-shrink-0">
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold font-satoshi text-studojo-ink">{p.label}</p>
                    <p className="text-sm text-studojo-muted font-satoshi">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-studojo-green-bg rounded-xl border-2 border-studojo-ink/20 p-4 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <FiShield className="w-4 h-4 text-studojo-green" />
                <span className="text-sm font-bold text-studojo-green font-satoshi">Your data is safe</span>
              </div>
              <p className="text-sm text-studojo-muted font-satoshi">
                We never store your emails or read your inbox. We only send outreach you've set up — nothing else. You can disconnect anytime from Gmail settings.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 rounded-xl border-2 border-red-200 p-4 mb-8">
                <p className="text-sm text-red-700 font-satoshi font-bold mb-1">Connection failed</p>
                <p className="text-sm text-red-600 font-satoshi">{error}</p>
              </div>
            )}

            <button
              onClick={handleConnect}
              className="w-full h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Connect Gmail Account
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}