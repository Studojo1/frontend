import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiArrowRight } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { TemplateEditor } from "~/components/outreach/TemplateEditor";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";
import type { EmailTemplate } from "~/lib/outreach/types";

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { selectedTemplate, setSelectedTemplate } = useOutreachStore();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(selectedTemplate?.id || null);

  useEffect(() => {
    if (authLoading) return;
    outreachFetch<{ templates: EmailTemplate[] }>("/campaign/templates")
      .then((data) => {
        setTemplates(data.templates);
        if (!selectedId && data.templates.length > 0) {
          setSelectedId(data.templates[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authLoading, selectedId]);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    const t = templates.find((t) => t.id === id);
    if (t) setSelectedTemplate(t);
  };

  const handleUpdate = (id: number, subject: string, body: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, subject, body } : t))
    );
    if (selectedId === id) {
      const t = templates.find((t) => t.id === id);
      if (t) setSelectedTemplate({ ...t, subject, body });
    }
  };

  const handleContinue = () => {
    const t = templates.find((t) => t.id === selectedId);
    if (t) {
      setSelectedTemplate(t);
      navigate("/outreach/campaign/setup");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="font-clash text-2xl font-bold text-studojo-ink">Choose an Email Template</h1>
          <p className="text-sm text-studojo-muted font-satoshi mt-2">
            Select a template for your outreach emails. You can customize it before sending.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {templates.map((template) => (
                <TemplateEditor
                  key={template.id}
                  template={template}
                  isSelected={selectedId === template.id}
                  onSelect={() => handleSelect(template.id)}
                  onUpdate={(subject, body) => handleUpdate(template.id, subject, body)}
                />
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={handleContinue}
                disabled={!selectedId}
                className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center"
              >
                Continue to Campaign Setup <FiArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}