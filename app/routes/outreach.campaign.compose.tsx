import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "~/components/common/header";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";
import { EmailComposer, type StyleProfile } from "~/components/outreach/EmailComposer";
import type { EmailTemplate } from "~/lib/outreach/types";

export default function ComposePage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const {
    candidateId,
    profileData,
    selectedTemplate,
    setSelectedTemplate,
    setSelectedStyles,
  } = useOutreachStore();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Derive StyleProfile from the candidate's existing onboarding data — no wizard needed
  const derivedProfile: StyleProfile | null = (() => {
    if (!profileData) return null;
    const parsed = profileData?.parsed_json ?? profileData;

    const name: string = parsed?.name || "";
    // Try to find university from education array
    const edu = Array.isArray(parsed?.education) ? parsed.education[0] : null;
    const university: string =
      typeof edu === "string" ? edu.split(",")[0] : (edu?.institution || edu?.school || "");

    // Top credential: first work experience bullet or summary snippet
    const expArr = Array.isArray(parsed?.experience) ? parsed.experience : [];
    const firstExp = expArr[0];
    const topCredential: string =
      (firstExp?.highlights?.[0]) ||
      (firstExp?.description?.slice(0, 120)) ||
      (parsed?.summary?.slice(0, 120)) ||
      "";

    const targetRoles: string = [
      ...(profileData?.target_roles || []),
      ...(profileData?.target_industries || []),
    ]
      .slice(0, 5)
      .join(", ");

    // Infer lookingFor from target roles text
    const rolesText = targetRoles.toLowerCase();
    const lookingFor = rolesText.includes("intern")
      ? ("internship" as const)
      : rolesText.includes("research")
        ? ("research" as const)
        : ("fulltime" as const);

    return {
      name,
      university,
      tone: "warm" as const,
      topCredential,
      lookingFor,
      targetRoles,
      sampleEmail: undefined,
    };
  })();

  useEffect(() => {
    if (authLoading) return;
    outreachFetch<{ templates: EmailTemplate[] }>("/campaign/templates")
      .then((data) => {
        setTemplates(data.templates);
        // Pre-select first template if none selected
        if (!selectedTemplate && data.templates.length > 0) {
          setSelectedTemplate(data.templates[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, [authLoading]);

  const handleContinue = (
    subject: string,
    body: string,
    templateId: number | null,
  ) => {
    // Update the selected template with any edits the user made
    if (templateId !== null) {
      const base = templates.find((t) => t.id === templateId);
      if (base) {
        setSelectedTemplate({ ...base, subject, body });
      }
    } else if (subject || body) {
      // Custom (no template) — store as a synthetic template
      setSelectedTemplate({ id: -1, name: "Custom", subject, body });
    }

    // Clear any previously set styles so preview-email uses the template body
    setSelectedStyles([]);

    navigate("/outreach/campaign/setup");
  };

  if (authLoading || loadingTemplates) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header />

      {/* Page title bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b-2 border-studojo-ink/10 flex-shrink-0">
        <div>
          <h1 className="font-clash text-base font-bold text-studojo-ink leading-tight">
            Compose Email
          </h1>
          <p className="text-[11px] text-studojo-muted font-satoshi">
            Set your style, add recipient context, then refine with the AI assistant
          </p>
        </div>
      </div>

      {/* 3-panel composer — skips style wizard, uses onboarding data */}
      <EmailComposer
        templates={templates}
        initialTemplate={selectedTemplate}
        savedProfile={derivedProfile}
        onTemplateChange={setSelectedTemplate}
        onContinue={handleContinue}
      />
    </div>
  );
}
