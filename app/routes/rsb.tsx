import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { Header } from "~/components/common/header";
import { WelcomeScreen } from "~/components/rsb/WelcomeScreen";
import { RoleIntake, type IntakePayload } from "~/components/rsb/RoleIntake";
import { rsbFetch } from "~/lib/rsb/api";

type CreateResponse = { session: { id: string }; initial_message: string };

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

  // Auto-resume: if user already has a draft, jump to it.
  useEffect(() => {
    if (!session?.user) return;
    const cached = typeof window !== "undefined" ? localStorage.getItem("rsb:lastSessionId") : null;
    if (cached) navigate(`/rsb/session/${cached}`, { replace: true });
  }, [session?.user, navigate]);

  const createSession = useCallback(async (p: IntakePayload) => {
    setCreating(true);
    try {
      const res = await rsbFetch<CreateResponse>("/session", {
        method: "POST",
        body: JSON.stringify(p),
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("rsb:lastSessionId", res.session.id);
      }
      navigate(`/rsb/session/${res.session.id}`);
    } catch (e) {
      console.error(e);
      alert("Something went wrong creating your draft. Try again in a moment.");
    } finally {
      setCreating(false);
    }
  }, [navigate]);

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
        <RoleIntake submitting={creating} onSubmit={createSession} />
      )}
    </>
  );
}
