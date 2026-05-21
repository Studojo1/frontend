import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { useOutreachStore } from "./store";
import { outreachFetch } from "./api";

/**
 * Auth hook for outreach pages.
 * Uses the centralized BetterAuth session — no custom JWT exchange needed.
 * Redirects to /auth?mode=signin if not authenticated.
 */
export function useOutreachAuth(requireAuth = true) {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  const {
    orderId,
    setOrderId,
    setCandidateId,
    setCampaignId,
    setEmailAccountId,
  } = useOutreachStore();

  const [recovered, setRecovered] = useState(false);

  // Auto-recover active order when authenticated
  useEffect(() => {
    if (!session?.user || recovered) return;

    if (!orderId) {
      outreachFetch<{ order: { id: number; candidate_id?: number; campaign_id?: number; email_account_id?: number } | null }>("/orders/active")
        .then((data) => {
          const order = data?.order;
          if (order) {
            setOrderId(order.id);
            if (order.candidate_id) setCandidateId(order.candidate_id);
            if (order.campaign_id) setCampaignId(order.campaign_id);
            if (order.email_account_id) setEmailAccountId(order.email_account_id);
          }
        })
        .catch(() => {
          // No active order — fine
        });
    }
    setRecovered(true);
  }, [session?.user, recovered, orderId, setOrderId, setCandidateId, setCampaignId, setEmailAccountId]);

  // Redirect if not authenticated after loading completes
  useEffect(() => {
    if (!isPending && !session?.user && requireAuth) {
      navigate("/auth?mode=signin&redirect=/outreach");
    }
  }, [isPending, session?.user, requireAuth, navigate]);

  return {
    user: session?.user ?? null,
    loading: isPending,
  };
}

/**
 * Hook for order lifecycle operations.
 */
export function useOrder() {
  const { orderId, setOrderId } = useOutreachStore();

  const createOrder = useCallback(async (candidateId?: number) => {
    try {
      const data = await outreachFetch<{ order_id: number }>("/orders/create", {
        method: "POST",
        body: JSON.stringify({ candidate_id: candidateId || null }),
      });
      setOrderId(data.order_id);
      return data.order_id;
    } catch {
      return null;
    }
  }, [setOrderId]);

  const updateOrder = useCallback(async (updates: {
    status?: string;
    candidate_id?: number;
    campaign_id?: number;
    email_account_id?: number;
    linkedin_campaign_id?: number;
    linkedin_connected?: boolean;
    leads_collected?: number;
    log_entry?: string;
  }) => {
    if (!orderId) return;
    try {
      await outreachFetch(`/orders/${orderId}/update`, {
        method: "POST",
        body: JSON.stringify(updates),
      });
    } catch {
      // silently fail
    }
  }, [orderId]);

  const loadActiveOrder = useCallback(async () => {
    try {
      const data = await outreachFetch<{ order: { id: number } | null }>("/orders/active");
      if (data?.order) {
        setOrderId(data.order.id);
        return data.order;
      }
      return null;
    } catch {
      return null;
    }
  }, [setOrderId]);

  return { orderId, createOrder, updateOrder, loadActiveOrder };
}