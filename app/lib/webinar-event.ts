/**
 * The webinar being sold right now.
 *
 * Copy and timing live here so the landing page, the page title, the meta
 * description and the confirmation screen cannot drift apart. When the next
 * webinar is announced, this is the file to edit.
 *
 * Note this is display copy only. Which webinar a registration is *attached*
 * to still comes from the `webinars` table (the row marked 'upcoming'), set in
 * the admin panel — see getActiveWebinarId() in webinar.server.ts.
 */

export const WEBINAR = {
  /** Short name, used in the browser tab and share previews. */
  title: "How to Get a Job When No One Is Hiring",
  /** The line under the title. */
  subtitle: "No one is hiring. Get hired anyway.",
  /** What the session actually covers. */
  description:
    "“My dad knows a guy” is not enough. Learn how to create opportunities when job postings aren't enough, from cold emails to reaching out the right way.",
  /** Human-readable date, as written on the page. */
  dateLabel: "Saturday, 26 September",
  /** Start time, as written on the page. */
  timeLabel: "7:00 PM IST onwards",
  /** Machine-readable date, matching the `webinars` row for this event. */
  isoDate: "2026-09-26",
} as const;
