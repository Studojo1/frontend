import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "~/components/common/header";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";
import { EmailComposer } from "~/components/outreach/EmailComposer";
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

  // Build candidate context string for the AI assistant
  const candidateContext = (() => {
    if (!profileData) return undefined;
    const parts: string[] = [];
    const parsed = profileData?.parsed_json ?? profileData;
    if (parsed?.name) parts.push(`Name: ${parsed.name}`);
    if (profileData?.target_roles?.length) {
      parts.push(`Target roles: ${profileData.target_roles.slice(0, 3).join(", ")}`);
    }
    if (profileData?.target_industries?.length) {
      parts.push(`Target industries: ${profileData.target_industries.slice(0, 3).join(", ")}`);
    }
    if (parsed?.skills?.length) {
      parts.push(`Key skills: ${parsed.skills.slice(0, 5).join(", ")}`);
    }
    if (parsed?.summary) {
      parts.push(`Summary: ${String(parsed.summary).slice(0, 200)}`);
    }
    return parts.length > 0 ? parts.join("\n") : undefined;
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
            Pick a template, drag in content blocks, and refine with the AI assistant
          </p>
        </div>
      </div>

      {/* 3-panel composer fills remaining space */}
      <EmailComposer
        templates={templates}
        initialTemplate={selectedTemplate}
        candidateContext={candidateContext}
        onTemplateChange={setSelectedTemplate}
        onContinue={handleContinue}
      />
    </div>
  );
}
