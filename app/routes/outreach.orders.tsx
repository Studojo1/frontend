import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiClipboard, FiArrowRight, FiClock, FiCheckCircle, FiZap } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

interface Order {
  id: number;
  status: string;
  candidate_id: number | null;
  campaign_id: number | null;
  email_account_id: number | null;
  leads_collected: number | null;
  leads_target: number | null;
  action_log: Array<{ ts: string; msg: string }>;
  created_at: string | null;
  updated_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  created: { label: "Created", color: "bg-studojo-surface-muted text-studojo-muted border-studojo-ink/20" },
  leads_generating: { label: "Discovering Leads", color: "bg-studojo-orange-bg text-studojo-orange border-studojo-orange/30" },
  leads_ready: { label: "Leads Ready", color: "bg-studojo-purple-bg text-studojo-purple border-studojo-purple/30" },
  enriching: { label: "Enriching", color: "bg-studojo-orange-bg text-studojo-orange border-studojo-orange/30" },
  enrichment_complete: { label: "Enrichment Done", color: "bg-studojo-purple-bg text-studojo-purple border-studojo-purple/30" },
  campaign_setup: { label: "Campaign Setup", color: "bg-studojo-purple-bg text-studojo-purple border-studojo-purple/30" },
  email_connected: { label: "Email Connected", color: "bg-studojo-purple-bg text-studojo-purple border-studojo-purple/30" },
  campaign_running: { label: "Campaign Running", color: "bg-studojo-green-bg text-studojo-green border-studojo-green/30" },
  completed: { label: "Completed", color: "bg-studojo-green-bg text-studojo-green border-studojo-green/30" },
};

function StatusIcon({ status }: { status: string }) {
  if (status === "completed") return <FiCheckCircle className="w-5 h-5 text-studojo-green" />;
  if (status === "campaign_running") return <FiZap className="w-5 h-5 text-studojo-green" />;
  if (["leads_generating", "enriching"].includes(status)) return <FiClock className="w-5 h-5 text-studojo-orange" />;
  return <FiClipboard className="w-5 h-5 text-studojo-muted" />;
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { setOrderId, setCampaignId, setCandidateId, setEmailAccountId } = useOutreachStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    outreachFetch<{ orders: Array<{ order?: Order } & Order> }>("/orders/list")
      .then((data) => {
        setOrders(data.orders?.map((o) => (o as any).order || o) || []);
      })
      .catch((err) => {
        setError(err?.body?.detail || err.message || "Failed to load orders");
      })
      .finally(() => setLoading(false));
  }, [authLoading]);

  const handleResume = async (oid: number) => {
    try {
      const data = await outreachFetch<{
        order_id: number;
        candidate_id?: number;
        campaign_id?: number;
        email_account_id?: number;
        redirect: string;
      }>(`/orders/${oid}/resume`);
      setOrderId(data.order_id);
      if (data.candidate_id) setCandidateId(data.candidate_id);
      if (data.campaign_id) setCampaignId(data.campaign_id);
      if (data.email_account_id) setEmailAccountId(data.email_account_id);
      // Convert outreach backend redirect paths to centralized paths
      const redirect = data.redirect.startsWith("/outreach") ? data.redirect : `/outreach${data.redirect}`;
      navigate(redirect);
    } catch {
      setError("Failed to resume order");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-8 md:px-8">
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-clash text-2xl font-bold text-studojo-ink">My Orders</h1>
              <p className="text-sm text-studojo-muted font-satoshi mt-1">Track your outreach campaigns</p>
            </div>
            <button
              onClick={() => navigate("/outreach/onboarding/upload")}
              className="h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              New Campaign
            </button>
          </div>

          {error && (
            <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4">
              <p className="text-red-600 font-satoshi">{error}</p>
            </div>
          )}

          {orders.length === 0 && !error ? (
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-12 text-center">
              <FiClipboard className="w-12 h-12 text-studojo-muted mx-auto mb-4" />
              <h3 className="font-clash text-lg font-bold mb-2 text-studojo-ink">No orders yet</h3>
              <p className="text-sm text-studojo-muted font-satoshi mb-6">Start your first outreach campaign to see orders here.</p>
              <button
                onClick={() => navigate("/outreach/onboarding/upload")}
                className="h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-studojo-surface-muted text-studojo-muted border-studojo-ink/20" };
                const isActive = order.status !== "completed";
                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6 hover:shadow-brutal-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-studojo-surface-muted border-2 border-studojo-ink flex items-center justify-center flex-shrink-0">
                          <StatusIcon status={order.status} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-clash text-base font-bold text-studojo-ink">Order #{order.id}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium border ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-studojo-muted font-satoshi">
                            {order.created_at && (
                              <span>Created {new Date(order.created_at).toLocaleDateString()}</span>
                            )}
                            {order.leads_collected != null && (
                              <span>{order.leads_collected} leads</span>
                            )}
                            {order.campaign_id && (
                              <span>Campaign #{order.campaign_id}</span>
                            )}
                          </div>
                          {order.action_log && order.action_log.length > 0 && (
                            <p className="text-xs text-studojo-muted font-satoshi mt-2 truncate">
                              Latest: {order.action_log[order.action_log.length - 1].msg}
                            </p>
                          )}
                        </div>
                      </div>
                      {isActive && (
                        <button
                          onClick={() => handleResume(order.id)}
                          className="flex-shrink-0 h-9 px-4 rounded-xl bg-white text-studojo-ink text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
                        >
                          Resume <FiArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      )}
                      {!isActive && order.campaign_id && (
                        <button
                          onClick={() => {
                            setCampaignId(order.campaign_id!);
                            navigate("/outreach/campaign/dashboard");
                          }}
                          className="flex-shrink-0 h-9 px-4 rounded-xl bg-white text-studojo-ink text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center"
                        >
                          View <FiArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}