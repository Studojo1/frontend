// Status words on screen: chip order, labels, colours and the approval copy
// (contract section 1). This is the only place the desk spells them out; the
// chat and the workspace both read from here, so a student learns six words.
// Phase 1 labels: the `scheduled` word reads "Approved" because nothing is
// scheduled to send yet. Bootstrap's `status_labels` carries the same map.
import { Link } from "react-router";
import { peekResource } from "~/lib/desk/cache";
import { deskPath } from "~/lib/desk/nav";
import { stripDashes } from "~/lib/strip-dashes";
import type { Bootstrap, Counts, MatchState, OutreachId, StatusWord } from "~/lib/desk/types";
import { cx, FOCUS_RING, Pill, type Tone } from "./kit";

export const CHIP_ORDER: readonly (StatusWord | "all")[] = [
  "all", "needs_you", "scheduled", "sent", "replied", "failed", "skipped",
];

export const PHASE1_LABELS: Record<StatusWord, string> = {
  needs_you: "Needs you",
  scheduled: "Approved",
  sent: "Sent",
  replied: "Replied",
  failed: "Failed",
  skipped: "Skipped",
};

/** What an approved draft means in Phase 1, said once wherever it is approved. */
export const APPROVED_COPY =
  "Approved and saved. Nothing has been sent. Sending is not switched on yet, so copy it into Gmail if you want to send it now.";

/** The short form for a row in a list, where the full sentence would repeat on every line. */
export const APPROVED_SHORT = "Approved and saved. Nothing has been sent.";

/** A row's note; an approved draft reads the desk's own approval line. */
export function noteFor(row: { kind: string; server_status: string; note: string }): string {
  return row.kind === "draft" && row.server_status === "approved" ? APPROVED_SHORT : stripDashes(row.note);
}

const TONES: Record<StatusWord, Tone> = {
  needs_you: "purple",
  scheduled: "yellow",
  sent: "white",
  replied: "green",
  failed: "pink",
  skipped: "muted",
};

/** The server's labels from bootstrap win, so Phase 2 can rename a word without a frontend change. */
export function labelFor(word: StatusWord | "all"): string {
  if (word === "all") return "All";
  const server = peekResource<Bootstrap>("bootstrap")?.status_labels;
  return server?.[word] || PHASE1_LABELS[word];
}

export function countFor(word: StatusWord | "all", counts: Counts | null | undefined): number | null {
  if (!counts) return null;
  return counts[word] ?? null;
}

export function isStatusWord(v: string | null | undefined): v is StatusWord {
  return !!v && v in PHASE1_LABELS;
}

export function StatusPill({ word, busy }: { word: StatusWord; busy?: boolean }) {
  return (
    <Pill tone={TONES[word]}>
      {busy ? <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-studojo-purple-strong" /> : null}
      {busy ? "Writing" : labelFor(word)}
    </Pill>
  );
}

/**
 * Where a match stands, for People, the person drawer and the chat's match
 * rows. A new match shows nothing; one with a draft or an email is "In
 * outreach" and opens it; a skipped one uses the sixth word, Skipped.
 */
export function MatchStatePill({ state, outreachId }: { state: MatchState; outreachId: OutreachId | null }) {
  if (state === "new") return null;
  if (state === "skipped") return <StatusPill word="skipped" />;
  const pill = <Pill tone="white">In outreach</Pill>;
  if (!outreachId) return pill;
  return (
    <Link to={deskPath({ to: "outreach", id: outreachId, filter: null })} aria-label="In outreach, open the email" className={cx("inline-flex rounded-full hover:opacity-80", FOCUS_RING)}>
      {pill}
    </Link>
  );
}
