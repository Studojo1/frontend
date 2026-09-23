import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, EmailTemplate } from "./types";

export type PlanType = "email" | "linkedin" | "both";

interface OutreachState {
  // Onboarding flow
  candidateId: number | null;
  setCandidateId: (id: number | null) => void;

  // Profile data — cached from loading page so profile page renders instantly
  profileData: any | null;
  setProfileData: (data: any | null) => void;

  chatHistory: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  // Takes back the optimistically-added user message when its turn failed, so a
  // retry does not send the same answer twice. The backend keys answers by
  // position while replaying, so a duplicate shifts every later answer onto the
  // wrong question.
  removeLastChatMessage: () => void;
  clearChatHistory: () => void;
  // Which candidate the persisted chatHistory belongs to. A new resume upload
  // means a new candidate and the old transcript must not be restored onto it.
  chatCandidateId: number | null;
  setChatCandidateId: (id: number | null) => void;
  // False until zustand has read localStorage back. Pages that decide
  // something from persisted state must wait for this, or they decide it from
  // the empty initial state and act on an answer that is about to change.
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  // Lead discovery
  selectedTier: 50 | 200 | 350 | 500;
  setSelectedTier: (tier: 50 | 200 | 350 | 500) => void;

  // Plan / channel
  planType: PlanType;
  setPlanType: (t: PlanType) => void;
  selectedPlanId: string | null;
  setSelectedPlanId: (id: string | null) => void;
  linkedInCampaignId: number | null;
  setLinkedInCampaignId: (id: number | null) => void;

  // Campaign
  selectedTemplate: EmailTemplate | null;
  setSelectedTemplate: (t: EmailTemplate | null) => void;

  selectedStyles: string[];
  setSelectedStyles: (styles: string[]) => void;

  campaignId: number | null;
  setCampaignId: (id: number | null) => void;

  emailAccountId: number | null;
  setEmailAccountId: (id: number | null) => void;

  // Order tracking
  orderId: number | null;
  setOrderId: (id: number | null) => void;

  // Current step in onboarding
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // The signed-in user this persisted funnel state belongs to. localStorage
  // outlives a sign-out, so without this a second account on the same browser
  // would open the first account's candidate and leads.
  ownerUserId: string | null;
  setOwnerUserId: (id: string | null) => void;
  // Back to a clean slate: used on sign-out and when a different user signs in.
  resetFunnel: () => void;
}

// Everything a sign-out must forget. hasHydrated is deliberately not here.
const FUNNEL_DEFAULTS = {
  candidateId: null,
  profileData: null,
  chatHistory: [] as ChatMessage[],
  chatCandidateId: null,
  selectedTier: 350 as const,
  planType: "email" as PlanType,
  selectedPlanId: null,
  linkedInCampaignId: null,
  selectedTemplate: null,
  selectedStyles: [] as string[],
  campaignId: null,
  emailAccountId: null,
  orderId: null,
  currentStep: 1,
  ownerUserId: null,
};

export const useOutreachStore = create<OutreachState>()(
  persist(
    (set) => ({
      candidateId: null,
      setCandidateId: (candidateId) => set({ candidateId }),

      profileData: null,
      setProfileData: (profileData) => set({ profileData }),

      chatHistory: [],
      addChatMessage: (msg) =>
        set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
      removeLastChatMessage: () =>
        set((s) => ({ chatHistory: s.chatHistory.slice(0, -1) })),
      clearChatHistory: () => set({ chatHistory: [], chatCandidateId: null }),
      chatCandidateId: null,
      setChatCandidateId: (chatCandidateId) => set({ chatCandidateId }),
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      selectedTier: 350,
      setSelectedTier: (selectedTier) => set({ selectedTier }),

      planType: "email",
      setPlanType: (planType) => set({ planType }),
      selectedPlanId: null,
      setSelectedPlanId: (selectedPlanId) => set({ selectedPlanId }),
      linkedInCampaignId: null,
      setLinkedInCampaignId: (linkedInCampaignId) => set({ linkedInCampaignId }),

      selectedTemplate: null,
      setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),

      selectedStyles: [],
      setSelectedStyles: (selectedStyles) => set({ selectedStyles }),

      campaignId: null,
      setCampaignId: (campaignId) => set({ campaignId }),

      emailAccountId: null,
      setEmailAccountId: (emailAccountId) => set({ emailAccountId }),

      orderId: null,
      setOrderId: (orderId) => set({ orderId }),

      currentStep: 1,
      setCurrentStep: (currentStep) => set({ currentStep }),

      ownerUserId: null,
      setOwnerUserId: (ownerUserId) => set({ ownerUserId }),
      resetFunnel: () => set({ ...FUNNEL_DEFAULTS }),
    }),
    {
      name: "internreach-app-store",
      partialize: (state) => ({
        candidateId: state.candidateId,
        // Persisted so a refresh, a back gesture, or a mobile tab eviction does
        // not destroy the quiz. chatCandidateId rides along so a transcript is
        // only ever restored onto the candidate that produced it.
        chatHistory: state.chatHistory,
        chatCandidateId: state.chatCandidateId,
        currentStep: state.currentStep,
        selectedTier: state.selectedTier,
        selectedStyles: state.selectedStyles,
        campaignId: state.campaignId,
        emailAccountId: state.emailAccountId,
        orderId: state.orderId,
        planType: state.planType,
        selectedPlanId: state.selectedPlanId,
        linkedInCampaignId: state.linkedInCampaignId,
        ownerUserId: state.ownerUserId,
      }),
      // Fires once localStorage has been read back (and on failure, so a
      // blocked or full store does not leave every gated page spinning).
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
// Two tabs share one localStorage blob, and persist rewrites the whole blob on
// every change. Without this a stale background tab would write its old
// candidateId back over the one the newer tab just set.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === useOutreachStore.persist.getOptions().name) {
      useOutreachStore.persist.rehydrate();
    }
  });
}
