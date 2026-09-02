// The six email styles job-outreach-svc can write in.
//
// Copied deliberately from the service's STYLE_DESCRIPTIONS
// (services/email_campaign/email_generator_service.py:24-55) so the wording a
// student reads matches what the generator actually does. The ids MUST match
// exactly — an unknown id falls back to warm_intro (assign_style, :676-693).
//
// This matters more than it looks. /campaign/create defaults blank styles to
// ["warm_intro","value_prop"] and never reads subject_template/body_template
// (routes_campaign.py:258-260), so the template path is unreachable and
// CHOOSING A STYLE is the only real control a student has over the email that
// actually goes out.
export interface EmailStyle {
  id: string;
  name: string;
  tone: string;
  /** What the opening line does. */
  hook: string;
  /** What it asks for at the end. */
  ask: string;
}

export const EMAIL_STYLES: EmailStyle[] = [
  {
    id: "warm_intro",
    name: "Warm intro",
    tone: "Warm, genuine, humble",
    hook: "Mentions something you noticed about their team or role",
    ask: "Asks if they'd point you in the right direction",
  },
  {
    id: "value_prop",
    name: "What I bring",
    tone: "Professional, specific, grounded",
    hook: "References an area their team works on that relates to your skills",
    ask: "Asks who on their team you should talk to",
  },
  {
    id: "company_curiosity",
    name: "Curious about the company",
    tone: "Genuinely curious, low-key",
    hook: "Mentions something the company is building that caught your eye",
    ask: "Asks for a few minutes to hear what the team is working on",
  },
  {
    id: "peer_to_peer",
    name: "Peer to peer",
    tone: "Casual, collegial",
    hook: "Connects on a shared technical interest or tool",
    ask: "Suggests a quick chat about shared interests",
  },
  {
    id: "direct_ask",
    name: "Straight to the point",
    tone: "Concise, respectful, no fluff",
    hook: "States directly why you're reaching out to them specifically",
    ask: "Asks clearly about open roles or who to contact",
  },
  {
    id: "coffee_chat",
    name: "Coffee chat",
    tone: "Warm and admiring; someone who wants to learn",
    hook: "Reflects on their journey, or the company's mission if they founded it",
    ask: "Asks for a short chat to learn from their experience",
  },
];

export const DEFAULT_STYLE = "warm_intro";

export function isKnownStyle(id: string | null | undefined): boolean {
  return EMAIL_STYLES.some((s) => s.id === id);
}
