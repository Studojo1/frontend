import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { Header } from "~/components/common/header";
import { WelcomeScreen } from "~/components/rsb/WelcomeScreen";
import { LinkedInIntake, type IntakeSubmit } from "~/components/rsb/LinkedInIntake";
import { rsbFetch, rsbUpload } from "~/lib/rsb/api";

type CreateResponse = { session: { id: string } };

export default function RsbRoot() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"welcome" | "intake">("welcome");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate("/auth?mode=signin&redirect=/rsb");
    }
  }, [isPending, session?.user, navigate]);

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
          }),
        });
        const sessionId = res.session.id;
        if (p.pdf) {
          try {
            await rsbUpload(`/session/${sessionId}/linkedin`, p.pdf);
          } catch (e) {
            console.error("LinkedIn PDF parse failed", e);
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
    [navigate],
  );

  if (isPending || !session?.user) {
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
      {phase === "welcome" ? (
        <WelcomeScreen onStart={() => setPhase("intake")} />
      ) : (
        <LinkedInIntake submitting={creating} onSubmit={createSession} />
      )}
    </>
  );
}
