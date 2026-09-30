import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Header } from "~/components/common/header";
import { useOutreachAuth, fetchNextStep } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { resultsDestination } from "~/lib/outreach/next-step";

/**
 * /outreach/results: the one link the outreach emails use (audit NEW-07).
 *
 * Checkout-recovery and coupon emails ("You were right there", "Here's a
 * coupon") sent students who already had leads to the /outreach landing
 * page, whose button restarted resume upload. This page asks the server
 * where the student really is and goes there: their leads when unpaid (with
 * ?coupon= kept for the pricing page), Launch when paid, the dashboard when
 * a campaign is running, upload only when there are no leads at all.
 */
export default function OutreachResultsEntry() {
  const navigate = useNavigate();
  const { user, loading } = useOutreachAuth(); // signed out: /auth, then back here
  const { setCandidateId } = useOutreachStore();
  const done = useRef(false);

  useEffect(() => {
    if (loading || !user || done.current) return;
    done.current = true;
    const search = window.location.search;
    fetchNextStep().then((step) => {
      // The candidate that holds their leads, not whatever this browser last
      // uploaded (a newer resume with none hid them, OP-N03).
      if (step?.state === "not_paid" && step.candidate_id) setCandidateId(step.candidate_id);
      navigate(resultsDestination(step, search), { replace: true });
    });
  }, [loading, user, navigate, setCandidateId]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex justify-center py-32" role="status">
        <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" aria-hidden />
        <span className="sr-only">Opening your hiring managers</span>
      </div>
    </div>
  );
}
