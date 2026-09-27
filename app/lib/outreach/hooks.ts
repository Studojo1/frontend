import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { useOutreachStore } from "./store";
import { outreachFetch } from "./api";

/**
 * Auth hook for outreach pages.
 * Uses the centralized BetterAuth session — no custom JWT exchange needed.
 * Redirects to /auth (returning to the current page) if not authenticated.
 */
export function useOutreachAuth(requireAuth = true) {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  const {
    orderId,
    candidateId,
    hasHydrated,
    ownerUserId,
    setOwnerUserId,
    resetFunnel,
    setOrderId,
    setCandidateId,
    setCampaignId,
    setEmailAccountId,
    setLinkedInCampaignId,
  } = useOutreachStore();

  const [recovered, setRecovered] = useState(false);

  // Persisted funnel state that belongs to another account is discarded before
  // anything reads it. Older blobs have no owner yet, so they are adopted.
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    if (!hasHydrated || !userId) return;
    if (ownerUserId && ownerUserId !== userId) resetFunnel();
    if (ownerUserId !== userId) setOwnerUserId(userId);
  }, [hasHydrated, userId, ownerUserId, resetFunnel, setOwnerUserId]);

  // Auto-recover active order when authenticated
  useEffect(() => {
    if (!session?.user || recovered || !hasHydrated) return;
    if (ownerUserId !== session.user.id) return; // wait for the owner check above

    if (orderId) {
      setRecovered(true);
      return;
    }
    let cancelled = false;
    outreachFetch<{ order: { id: number; candidate_id?: number; campaign_id?: number; email_account_id?: number; linkedin_campaign_id?: number } | null }>("/orders/active")
      .then((data) => {
        const order = data?.order;
        if (order && !cancelled) {
          setOrderId(order.id);
          // Only fill a gap. Overwriting a candidate the user is already
          // looking at swapped the results grid to an old order's leads.
          if (order.candidate_id && !candidateId) setCandidateId(order.candidate_id);
          if (order.campaign_id) setCampaignId(order.campaign_id);
          if (order.email_account_id) setEmailAccountId(order.email_account_id);
          if (order.linkedin_campaign_id) setLinkedInCampaignId(order.linkedin_campaign_id);
        }
      })
      .catch(() => {
        // No active order — fine
      })
      // Marked done only once the answer is in, so pages can wait for a
      // recovered candidateId instead of bouncing the user to upload.
      .finally(() => { if (!cancelled) setRecovered(true); });
    return () => { cancelled = true; };
  }, [session?.user, recovered, hasHydrated, ownerUserId, orderId, candidateId, setOrderId, setCandidateId, setCampaignId, setEmailAccountId, setLinkedInCampaignId]);

  // Redirect if not authenticated after loading completes
  useEffect(() => {
    if (!isPending && !session?.user && requireAuth) {
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [isPending, session?.user, requireAuth, navigate]);

  return {
    user: session?.user ?? null,
    loading: isPending,
    // True until persisted state is read and any active order has been
    // recovered. Decide "this user has no candidate" only after this is false.
    recovering: !hasHydrated || (!!session?.user && !recovered),
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
    if (!orderId) return false;
    try {
      await outreachFetch(`/orders/${orderId}/update`, {
        method: "POST",
        body: JSON.stringify(updates),
      });
      return true;
    } catch (err) {
      // Never block the funnel on this, but do not hide it either: a rejected
      // transition used to vanish here and leave the order frozen.
      console.warn("[outreach] order update rejected", { orderId, updates, err });
      return false;
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
/**
 * Where this user should go next, from GET /orders/next-step.
 *
 * The backend decides from what the user actually holds (credits, campaigns,
 * a finished profile, a mailbox), never from order.status, which goes stale
 * after payment. A paid user with credits and nothing running always gets
 * Launch, or the one thing blocking it. Paths are relative to /outreach.
 */
export type NextStepState =
  | "campaign_active"
  | "launch_draft"
  | "launch_ready"
  | "connect_gmail"
  | "needs_profile"
  | "not_paid";

export interface NextStep {
  state: NextStepState;
  path: string | null;
  available_credits: number;
  order_id: number | null;
  candidate_id: number | null;
  email_account_id: number | null;
  campaign_id: number | null;
}

/** States where the user has paid and has not launched. */
export const PAID_NOT_LAUNCHED: NextStepState[] = [
  "launch_draft",
  "launch_ready",
  "connect_gmail",
  "needs_profile",
];

export function isPaidNotLaunched(step: NextStep | null | undefined): step is NextStep {
  return !!step && PAID_NOT_LAUNCHED.includes(step.state) && !!step.path;
}

/** Button label for the step a paid-not-launched user is blocked on. */
export function nextStepLabel(step: NextStep): string {
  switch (step.state) {
    case "connect_gmail":
      return "Connect Gmail to launch";
    case "needs_profile":
      return "Finish my profile to launch";
    default:
      return "Launch my campaign";
  }
}

export function fetchNextStep(): Promise<NextStep | null> {
  return outreachFetch<NextStep>("/orders/next-step").catch(() => null);
}

/**
 * Loads the next step once a session exists. `null` while loading, when
 * signed out, or if the call fails, so callers fall back to their normal flow.
 */
export function useNextStep(): NextStep | null {
  const { data: session, isPending } = authClient.useSession();
  const [step, setStep] = useState<NextStep | null>(null);
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    if (isPending || !userId) return;
    let cancelled = false;
    fetchNextStep().then((s) => {
      if (!cancelled) setStep(s);
    });
    return () => {
      cancelled = true;
    };
  }, [isPending, userId]);
  return step;
}
