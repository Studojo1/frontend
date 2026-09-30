/**
 * What a pack actually buys for this student (audits UC-Q13, UC-Q20).
 *
 * Packs are sold as 200, 350 or 500 contacts, but a student may have fewer
 * leads than that, and most of a pool can be broader matches whose titles do
 * not match their target roles. A campaign is capped at the leads they have
 * (routes_campaign create: required = min(available, lead_count)), and unused
 * credits stay on the balance. These lines say that per pack instead of
 * implying 500 strong contacts.
 *
 * strongCount comes from `strong_total` on GET /candidate/{id}/leads. When
 * the API does not send it, the lines fall back to the plain lead count.
 */

const n = (x: number) => x.toLocaleString("en-US");

export type TierMatch = {
  /** What this pack reaches, e.g. "Reaches your 126 strong matches and 74 broader ones". */
  reach: string;
  /** Set when the pack is bigger than the lead list. */
  leftover: string | null;
};

export function tierMatch(tier: number, leadCount: number | null, strongCount: number | null): TierMatch | null {
  if (!leadCount || leadCount <= 0) return null;
  const covered = Math.min(tier, leadCount);
  let reach: string;
  if (typeof strongCount === "number" && strongCount >= 0) {
    const strong = Math.min(covered, strongCount);
    const broader = covered - strong;
    reach =
      strong === 0
        ? `Reaches ${n(broader)} broader matches`
        : broader > 0
          ? `Reaches your ${n(strong)} strong matches and ${n(broader)} broader ones`
          : covered === strongCount
            ? `Reaches all ${n(strong)} of your strong matches`
            : `Reaches ${n(strong)} of your ${n(strongCount)} strong matches`;
  } else {
    reach = covered === leadCount ? `Reaches all ${n(leadCount)} of your hiring managers` : `Reaches ${n(covered)} of your ${n(leadCount)} hiring managers`;
  }
  const extra = tier - leadCount;
  const leftover =
    extra > 0 ? `You have ${n(leadCount)} matches today, so ${n(extra)} credits stay on your balance for later.` : null;
  return { reach, leftover };
}

/** The headline count on the pricing page: "Your N hiring managers". */
export function leadHeadline(leadCount: number | null, strongCount: number | null): string | null {
  if (!leadCount || leadCount <= 0) return null;
  if (typeof strongCount === "number" && strongCount >= 0 && strongCount < leadCount) {
    return `We found ${n(leadCount)} hiring managers for you: ${n(strongCount)} strong matches for your target roles and ${n(leadCount - strongCount)} broader matches.`;
  }
  return `We found ${n(leadCount)} hiring managers for you.`;
}

/**
 * Is this pack offered to this student (audit UC-Q09)?
 *
 * `sellable` is `sellable_email_packs` from GET /candidate/{id}/leads: the API
 * stops selling packs much bigger than the student's strong matches, and
 * create-order refuses them. A pack paid for from credits the student already
 * holds creates no order, so it stays usable. With no list from the API
 * (older API, failed call) every pack is offered, as before.
 */
export function packOffered(tier: number, sellable: number[] | null | undefined, availableCredits: number): boolean {
  if (availableCredits >= tier) return true;
  if (!Array.isArray(sellable) || sellable.length === 0) return true;
  return sellable.includes(tier);
}

/** Why a pack is not offered, shown on its card. */
export function packNotOfferedReason(strongCount: number | null): string {
  return typeof strongCount === "number"
    ? `Not offered: you have ${n(strongCount)} strong matches, so most of this pack would go to weaker ones.`
    : "Not offered: most of this pack would go to weaker matches.";
}

export type SampleEmail = { masked: string; kind: "email" | "domain"; company?: string | null };

/** The line under the headline that proves an email exists (audit UC-Q13). */
export function sampleEmailLine(sample: SampleEmail | null | undefined): string | null {
  if (!sample || typeof sample.masked !== "string" || !sample.masked.includes("@")) return null;
  const at = sample.company ? ` at ${sample.company}` : "";
  return sample.kind === "email"
    ? `For example, a hiring manager${at}: ${sample.masked}. You see every address in full once you buy a pack.`
    : `For example, a hiring manager${at} uses ${sample.masked} addresses. You see every address in full once you buy a pack.`;
}
