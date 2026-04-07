import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { outreachFetch } from "~/lib/outreach/api";

const STYLES = [
  {
    id: "warm_intro",
    label: "Warm & Genuine",
    description: "Humble, friendly — asks for a nudge in the right direction. Works well for small companies and founders.",
  },
  {
    id: "value_prop",
    label: "Professional & Specific",
    description: "References your background clearly, asks who to talk to. Works well for mid-to-large companies.",
  },
  {
    id: "company_curiosity",
    label: "Curious & Low-key",
    description: "Shows genuine interest in what they're building. Works well for 11-200 person companies.",
  },
  {
    id: "peer_to_peer",
    label: "Casual & Collegial",
    description: "Peer-to-peer tone, shared-interest angle. Works well for engineers, designers, ICs.",
  },
  {
    id: "direct_ask",
    label: "Direct & Concise",
    description: "No fluff — asks clearly for open roles or a referral. Works well for VPs, Directors, CTOs.",
  },
] as const;

type StyleId = typeof STYLES[number]["id"];

interface PreviewEmail {
  subject: string;
  body: string;
  lead_name: string;
  company: string;
}

export default function StylePickPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { candidateId, setSelectedStyles } = useOutreachStore();

  const [selected, setSelected] = useState<StyleId[]>(["warm_intro", "value_prop"]);
  const [activePreview, setActivePreview] = useState<StyleId>("warm_intro");
  const [previews, setPreviews] = useState<Record<string, PreviewEmail | null>>({});
  const [previewLoading, setPreviewLoading] = useState<Record<string, boolean>>({});

  const fetchPreview = async (styleId: StyleId) => {
    if (previews[styleId] !== undefined || !candidateId) return;
    setPreviewLoading((prev) => ({ ...prev, [styleId]: true }));
    try {
      const data = await outreachFetch<PreviewEmail>("/campaign/preview-email", {
        method: "POST",
        body: JSON.stringify({ candidate_id: candidateId, selected_styles: [styleId] }),
        maxRetries: 1,
        timeout: 15000,
      });
      setPreviews((prev) => ({ ...prev, [styleId]: data }));
    } catch {
      setPreviews((prev) => ({ ...prev, [styleId]: null }));
    } finally {
      setPreviewLoading((prev) => ({ ...prev, [styleId]: false }));
    }
  };

  // Fetch the first preview on load
  useEffect(() => {
    if (!authLoading && candidateId) {
      fetchPreview("warm_intro");
    }
  }, [authLoading, candidateId]);

  const handleCardClick = (styleId: StyleId) => {
    setActivePreview(styleId);
    fetchPreview(styleId);
    setSelected((prev) =>
      prev.includes(styleId)
        ? prev.length > 1 ? prev.filter((s) => s !== styleId) : prev // keep at least 1
        : prev.length < 3 ? [...prev, styleId] : prev // max 3
    );
  };

  const handleContinue = () => {
    setSelectedStyles(selected);
    navigate("/outreach/campaign/setup");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activePreviewData = previews[activePreview];
  const activePreviewIsLoading = previewLoading[activePreview];

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <h1 className="font-clash text-2xl font-bold text-studojo-ink mb-1">Pick your email style</h1>
        <p className="text-sm text-studojo-muted font-satoshi mb-8">
          Select up to 3 styles. The AI picks the best fit per lead automatically. Click any card to preview a real sample.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: style cards */}
          <div className="space-y-3">
            {STYLES.map((style) => {
              const isSelected = selected.includes(style.id);
              const isActive = activePreview === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => handleCardClick(style.id)}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                    isActive
                      ? "border-studojo-purple shadow-brutal bg-studojo-purple-bg"
                      : isSelected
                      ? "border-studojo-ink bg-white shadow-brutal"
                      : "border-studojo-ink/20 bg-white hover:border-studojo-ink/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-clash text-sm font-bold text-studojo-ink">{style.label}</p>
                      <p className="text-xs text-studojo-muted font-satoshi mt-0.5 leading-relaxed">{style.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${
                      isSelected
                        ? "border-studojo-purple bg-studojo-purple text-white"
                        : "border-studojo-ink/20"
                    }`}>
                      {isSelected && <FiCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </button>
              );
            })}

            <p className="text-xs text-studojo-muted font-satoshi pt-1">
              {selected.length}/3 styles selected — at least 1 required
            </p>
          </div>

          {/* Right: preview pane */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6 h-fit sticky top-6">
            <p className="text-xs font-bold text-studojo-muted font-satoshi uppercase tracking-wider mb-3">
              Email Preview — {STYLES.find((s) => s.id === activePreview)?.label}
            </p>

            {activePreviewIsLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-studojo-purple border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activePreviewData ? (
              <div>
                <p className="text-xs text-studojo-muted font-satoshi mb-3">
                  To: {activePreviewData.lead_name} at {activePreviewData.company}
                </p>
                <p className="text-sm font-bold font-satoshi text-studojo-ink mb-3">
                  Subject: {activePreviewData.subject}
                </p>
                <p className="text-sm text-studojo-muted whitespace-pre-line leading-relaxed font-satoshi">
                  {activePreviewData.body}
                </p>
              </div>
            ) : previews[activePreview] === null ? (
              <p className="text-sm text-studojo-muted font-satoshi text-center py-8">
                Preview unavailable — this style will still be used when sending.
              </p>
            ) : (
              <p className="text-sm text-studojo-muted font-satoshi text-center py-8">
                Click a style card to preview a sample email.
              </p>
            )}
          </div>
        </div>

      </div>
      <Footer />

      {/* Floating Use these styles button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className="h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-semibold text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2 whitespace-nowrap"
        >
          Use these styles <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
