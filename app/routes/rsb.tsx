import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { Header } from "~/components/common/header";
import { WelcomeScreen } from "~/components/rsb/WelcomeScreen";
import { TemplatePicker, type TemplateId } from "~/components/rsb/TemplatePicker";
import { SourcePicker, type SourceChoice } from "~/components/rsb/SourcePicker";
import { LinkedInIntake, type IntakeSubmit } from "~/components/rsb/LinkedInIntake";
import { rsbFetch, rsbUpload } from "~/lib/rsb/api";

type CreateResponse = { session: { id: string } };
type Phase = "welcome" | "template" | "source" | "intake";

export default function RsbRoot() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("welcome");
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [source, setSource] = useState<SourceChoice>("scratch");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isPending && !session?.user) {
      navigate("/auth?mode=signin&redirect=/rsb", { replace: true });
    }
  }, [mounted, isPending, session?.user, navigate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rsb:lastSessionId");
    }
  }, []);

  const createSession = useCallback(
    async (p: IntakeSubmit) => {
      setCreating(true);
      try {
        const res = await rsbFetch<CreateResponse>("/session", {
          method: "POST",
          body: JSON.stringify({
            full_name: p.full_name,
            linkedin_url: p.linkedin_url ?? null,
            template,
          }),
        });
        const sessionId = res.session.id;
        if (p.resume_label) {
          try { localStorage.setItem(`rsb:label:${sessionId}`, p.resume_label); } catch {}
        }
        if (p.pdf) {
          try {
            await rsbUpload(`/session/${sessionId}/linkedin`, p.pdf);
          } catch (e) {
            console.error("LinkedIn PDF parse failed", e);
          }
        }
        if (p.resumePdf) {
          try {
            await rsbUpload(`/session/${sessionId}/resume`, p.resumePdf);
          } catch (e) {
            console.error("existing resume parse failed", e);
          }
        }
        navigate(`/rsb/session/${sessionId}`);
      } catch (e) {
        console.error(e);
        alert("Something went wrong creating your draft. Try again in a moment.");
      } finally {
        setCreating(false);
      }
    },
    [navigate, template],
  );

  if (!mounted || isPending || !session?.user) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center text-neutral-500 font-['Satoshi']">
          Loading...
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      {phase === "welcome" && <WelcomeScreen onStart={() => setPhase("template")} />}
      {phase === "template" && (
        <TemplatePicker
          onPick={(t) => {
            setTemplate(t);
            setPhase("source");
          }}
        />
      )}
      {phase === "source" && (
        <SourcePicker
          onPick={(s) => {
            setSource(s);
            setPhase("intake");
          }}
        />
      )}
      {phase === "intake" && (
        <LinkedInIntake
          submitting={creating}
          onSubmit={createSession}
          requireResume={source === "existing"}
        />
      )}
    </>
  );
}
