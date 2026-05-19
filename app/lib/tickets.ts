// Shared ticket types + category-to-priority mapping. The priority is
// computed server-side and never returned to user-facing API responses
// so users can't game it.

export type TicketSource = "support_chat" | "outreach_dashboard";
export type TicketStatus = "open" | "in_progress" | "resolved" | "wont_fix";
export type TicketPriority = "high" | "normal" | "low";

export type TicketCategory =
  | "campaign_broken"
  | "campaign_changes"
  | "website_broken"
  | "info_request"
  | "other";

interface CategoryConfig {
  id: TicketCategory;
  label: string;
  sources: TicketSource[];
  priority: TicketPriority;
}

export const TICKET_CATEGORIES: CategoryConfig[] = [
  {
    id: "campaign_broken",
    label: "My campaign is broken or not sending",
    sources: ["outreach_dashboard"],
    priority: "high",
  },
  {
    id: "campaign_changes",
    label: "I want to change my campaign",
    sources: ["outreach_dashboard"],
    priority: "normal",
  },
  {
    id: "website_broken",
    label: "Something is broken on the site",
    sources: ["support_chat"],
    priority: "high",
  },
  {
    id: "info_request",
    label: "I want more info / how does X work",
    sources: ["support_chat"],
    priority: "low",
  },
  {
    id: "other",
    label: "Something else",
    sources: ["support_chat", "outreach_dashboard"],
    priority: "normal",
  },
];

export function categoriesFor(source: TicketSource): CategoryConfig[] {
  return TICKET_CATEGORIES.filter((c) => c.sources.includes(source));
}

export function categoryToPriority(
  category: TicketCategory,
): TicketPriority {
  const entry = TICKET_CATEGORIES.find((c) => c.id === category);
  return entry?.priority ?? "normal";
}

export function isValidCategory(c: string): c is TicketCategory {
  return TICKET_CATEGORIES.some((entry) => entry.id === c);
}

export function isValidSource(s: string): s is TicketSource {
  return s === "support_chat" || s === "outreach_dashboard";
}

// Wire shapes used by both client and API.

export interface TicketSummary {
  id: number;
  category: TicketCategory;
  status: TicketStatus;
  source: TicketSource;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  preview: string; // first 120 chars of latest message
  unread_admin_replies: number; // count of admin messages newer than user's last view
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  author_type: "user" | "admin" | "system";
  author_email: string;
  body: string;
  created_at: string;
}

export interface TicketAttachment {
  url: string;
  content_type?: string;
  filename?: string;
}

export interface TicketDetail {
  id: number;
  category: TicketCategory;
  status: TicketStatus;
  source: TicketSource;
  context: Record<string, any> | null;
  attachments: TicketAttachment[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  messages: TicketMessage[];
}
