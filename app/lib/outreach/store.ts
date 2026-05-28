import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, EmailTemplate, PsychometricResult } from "./types";

export type PlanType = "email" | "linkedin" | "both";

interface OutreachState {
  // Onboarding flow
  candidateId: number | null;
  setCandidateId: (id: number | null) => void;

  // Psychometric result — session only, not persisted
  psychResult: PsychometricResult | null;
  setPsychResult: (r: PsychometricResult | null) => void;

  // Profile data — cached from loading page so profile page renders instantly
  profileData: any | null;
  setProfileData: (data: any | null) => void;

  chatHistory: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChatHistory: () => void;

  // Lead discovery
  selectedTier: 200 | 350 | 500;
  setSelectedTier: (tier: 200 | 350 | 500) => void;

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
}

export const useOutreachStore = create<OutreachState>()(
  persist(
    (set) => ({
      candidateId: null,
      setCandidateId: (candidateId) => set({ candidateId }),

      psychResult: null,
      setPsychResult: (psychResult) => set({ psychResult }),

      profileData: null,
      setProfileData: (profileData) => set({ profileData }),

      chatHistory: [],
      addChatMessage: (msg) =>
        set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
      clearChatHistory: () => set({ chatHistory: [] }),

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
    }),
    {
      name: "internreach-app-store",
      partialize: (state) => ({
        candidateId: state.candidateId,
        currentStep: state.currentStep,
        selectedTier: state.selectedTier,
        selectedStyles: state.selectedStyles,
        campaignId: state.campaignId,
        emailAccountId: state.emailAccountId,
        orderId: state.orderId,
        planType: state.planType,
        selectedPlanId: state.selectedPlanId,
        linkedInCampaignId: state.linkedInCampaignId,
      }),
    },
  ),
);