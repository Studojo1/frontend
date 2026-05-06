import { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * Legacy route — the project + outcome questions now live in the main
 * onboarding quiz (question_engine.py flex_best_project + flex_outcome).
 * This page used to collect them post-payment; we keep the route as a
 * graceful redirect for any stale bookmarks.
 */
export default function FlexCapturePage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/outreach/enrichment", { replace: true });
  }, [navigate]);
  return null;
}
