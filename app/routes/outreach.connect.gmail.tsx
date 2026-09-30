import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FiMail, FiShield, FiEye, FiSend, FiCheckCircle } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { AppFooter } from "~/components/outreach/AppFooter";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOrder } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

export default function GmailConnectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading: authLoading, user } = useOutreachAuth();
  const { emailAccountId, setEmailAccountId, planType } = useOutreachStore();
  const { updateOrder } = useOrder();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [handled, setHandled] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState("");

  const showPermissionError = (msg: string | null) => {
    if (msg === "missing_permissions" || msg === "missing_send_permission") {
      setError(
        'Google didn\'t grant all required permissions. On the Google sign-in screen, please TICK BOTH boxes ("Send email on your behalf" AND "Read your email") before clicking Allow. We need read access to detect replies from leads.'
      );
    } else {
      setError(msg || "Gmail connection failed. Please try again.");
    }
  };

  // Google sends the user back via the API host, which cannot see their
  // session, so it hands the one-time code here and this signed-in page
  // finishes the connection. The backend only accepts it if this is the same
  // user who started the flow.
  useEffect(() => {
    if (handled || authLoading) return;
    // Signed out: leave the code in the URL. useOutreachAuth sends the user to
    // sign in with the full path and query, and the code is used when they are
    // back. Consuming it now 401'd and burned the one-time code (PS-N15).
    if (!user) return;
    const code = searchParams.get("gmail_code");
    const state = searchParams.get("gmail_state");
    if (!code || !state) return;
    setHandled(true);
    setConnecting(true);
    // Drop the code from the address bar so a refresh cannot replay it.
    navigate("/outreach/connect/gmail", { replace: true });
    outreachFetch<{ email_account_id?: number; email_address?: string }>("/gmail/oauth/complete", {
      method: "POST",
      body: JSON.stringify({ code, state }),
    })
      .then((data) => {
        const accountId = data?.email_account_id;
        if (accountId) {
          setEmailAccountId(accountId);
          updateOrder({ status: "email_connected", email_account_id: accountId, log_entry: "Gmail account connected" });
        }
        setConnected(true);
      })
      .catch((err: any) => {
        showPermissionError(err?.message || null);
      })
      .finally(() => setConnecting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, handled, authLoading, user]);

  useEffect(() => {
    if (handled) return;
    if (searchParams.get("gmail_code")) return; // handled above once auth is ready
    const status = searchParams.get("status");
    const errorMsg = searchParams.get("message");

    if (status === "error") {
      const friendly: Record<string, string> = {
        invalid_state: "This Gmail link expired. Please connect again.",
        cancelled: "You cancelled Google's permission screen. Tap Connect Gmail to try again.",
      };
      showPermissionError((errorMsg && friendly[errorMsg]) || errorMsg);
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
    // A student who started at /crm/connect-gmail came here from a LinkedIn
    // job with one email waiting for review. Continuing into campaign setup
    // would abandon it, so hand control back to where they started.
    //
    // Additive: when the key is absent (every student who came through the
    // outreach funnel), the original navigation below is unchanged. The OAuth
    // callback URL is hardcoded server-side (job-outreach-svc
    // api/routes_gmail.py:52), so this page is the only place the handoff can
    // happen.
    try {
      const back = sessionStorage.getItem("sj_gmail_return");
      if (back && back.startsWith("/")) {
        sessionStorage.removeItem("sj_gmail_return");
        navigate(back);
        return;
      }
    } catch {
      /* private mode: fall through to the normal funnel */
    }

    // 'both' plans chain into LinkedIn connect before campaign setup
    if (planType === "both") {
      navigate("/outreach/connect/linkedin");
    } else {
      // Straight to campaign setup: the debrief now runs BEFORE this page, so
      // sending the student back to it here would loop them through questions
      // they have already answered.
      navigate("/outreach/campaign/setup");
    }
  };

  const permissions = [
    { icon: <FiSend className="w-5 h-5" />, label: "Send Emails", desc: "Send your outreach emails from your Gmail" },
    { icon: <FiEye className="w-5 h-5" />, label: "Spot Replies", desc: "Check new inbox messages for replies and bounces to emails Studojo sent" },
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
              {planType === "both" ? "Continue to LinkedIn" : "Continue"}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6 md:p-8">
            {/* The button used to sit ~900px down, on a phone's second screen,
                under the permissions list (PH-20). It now comes first. */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center mx-auto text-studojo-purple mb-4">
                <FiMail className="w-7 h-7" />
              </div>
              <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">Connect Your Gmail</h1>
              <p className="text-sm text-studojo-muted font-satoshi">Your outreach goes out from your own Gmail, so replies come straight to you.</p>
            </div>

            {error && (
              <div className="bg-red-50 rounded-xl border-2 border-red-200 p-4 mb-4">
                <p className="text-sm text-red-700 font-satoshi font-bold mb-1">Connection failed</p>
                <p className="text-sm text-red-600 font-satoshi">{error}</p>
              </div>
            )}

            <button
              onClick={handleConnect}
              className="w-full h-12 px-8 mb-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Connect Gmail Account
            </button>

            <div className="space-y-3 mb-6">
              <h3 className="font-clash text-lg font-bold text-studojo-ink">What Studojo can do</h3>
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

            {/* This said "we never read your inbox" right under a "Read Replies"
                permission (PH-21). Say what actually happens. */}
            <div className="bg-studojo-green-bg rounded-xl border-2 border-studojo-ink/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiShield className="w-4 h-4 text-studojo-green" />
                <span className="text-sm font-bold text-studojo-green font-satoshi">What we keep</span>
              </div>
              <p className="text-sm text-studojo-muted font-satoshi">
                We look at new inbox messages only to find replies and bounces to the emails Studojo sent for you, and we save just those so you can see them. Nothing else is stored. You can disconnect any time in your Google account settings.
              </p>
            </div>
          </div>
        )}
      </div>
      <AppFooter />
    </div>
  );
}