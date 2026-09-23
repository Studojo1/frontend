import db from "~/lib/db";
import { sql } from "drizzle-orm";
import playbookSeed from "./playbook-seed.json";

/**
 * First-run seed: the roster and the playbook.
 *
 * Runs once, only into empty tables, so it can never overwrite edits made in
 * the UI. The playbook text is the studojo-content skill, split into four
 * entries so a section can be parked without losing the rest.
 */

/**
 * The roster. Twelve posts a week, two per account per week, six accounts
 * live. Vanshika is set up but on standby, so she is inactive rather than
 * absent: the account should be one toggle away, not a re-entry job.
 *
 * Vivan runs the B2B lane. That is not a label, it changes the rules: the
 * playbook forbids webinar content on B2B profiles entirely, and the prompt
 * reads the lane to enforce it.
 */
const ACCOUNTS = [
  {
    handle: "jeremy",
    displayName: "Jeremy",
    lane: "student",
    accent: "purple",
    active: true,
    persona:
      "Studojo founder. The core voice the playbook is built from: lowercase openings, anti-system framing, cold email as the cheat code for students the system was not built for. Uses the founder phrases in the playbook naturally, never forced.",
    audience:
      "Indian college students outside the IIT/NIT bubble who are applying and hearing nothing back.",
    notes: "Founder account. Milestone and POV posts belong here most naturally.",
  },
  {
    handle: "pranav-hegde",
    displayName: "Pranav Hegde",
    lane: "student",
    accent: "green",
    active: true,
    persona:
      "Studojo team. Same voice system as the founder account, his own scenes and his own students. Needs a distinct entry point on any shared fact.",
    audience: "Indian college students job hunting without a referral network.",
    notes: "",
  },
  {
    handle: "pranav-shastri",
    displayName: "Pranav Shastri",
    lane: "student",
    accent: "orange",
    active: true,
    persona:
      "Studojo team. Same voice system, distinct person. Never share wording with the other Pranav account, the overlap in audience is highest here.",
    audience: "Indian college students job hunting without a referral network.",
    notes: "Highest duplication risk with Pranav Hegde. Stagger and rewrite.",
  },
  {
    handle: "vivan",
    displayName: "Vivan",
    lane: "b2b",
    accent: "teal",
    active: true,
    persona:
      "Runs the B2B lane for Sensei, the automated employer prospecting product. Writes for the person doing the prospecting, not the person being placed.",
    audience:
      "Founders and BD/placement teams at training institutes, heads of placement cells and TPOs, recruitment and staffing agencies.",
    notes:
      "B2B. No webinar content, ever. CTA is direct response (DM me), never a comment gate.",
  },
  {
    handle: "manashwini",
    displayName: "Manashwini",
    lane: "student",
    accent: "pink",
    active: true,
    persona:
      "Studojo team. Same voice system, her own scenes and students.",
    audience: "Indian college students, heavier skew to first-time applicants.",
    notes: "",
  },
  {
    handle: "ayushi",
    displayName: "Ayushi",
    lane: "student",
    accent: "yellow",
    active: true,
    persona:
      "Studojo team. Same voice system, her own scenes and students.",
    audience: "Indian college students, heavier skew to first-time applicants.",
    notes: "",
  },
  {
    handle: "vanshika",
    displayName: "Vanshika",
    lane: "student",
    accent: "purple",
    active: false,
    persona:
      "Studojo team. Same voice system. On standby, set active to bring into the weekly rotation.",
    audience: "Indian college students.",
    notes: "On standby. Not counted in the twelve posts a week until activated.",
  },
];

let seeded = false;

export async function seedIfEmpty() {
  if (seeded) return;

  const counts = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM content_accounts) AS accounts,
      (SELECT COUNT(*) FROM content_playbook) AS playbook
  `);
  const row = counts.rows[0];

  if (Number(row.accounts) === 0) {
    for (const a of ACCOUNTS) {
      await db.execute(sql`
        INSERT INTO content_accounts
          (handle, platform, display_name, persona, audience, notes, accent,
           active, lane, posts_per_week)
        VALUES
          (${a.handle}, 'linkedin', ${a.displayName}, ${a.persona}, ${a.audience},
           ${a.notes || null}, ${a.accent}, ${a.active}, ${a.lane}, 2)
      `);
    }
  }

  if (Number(row.playbook) === 0) {
    for (const e of playbookSeed) {
      await db.execute(sql`
        INSERT INTO content_playbook (kind, title, body, include_in_prompt)
        VALUES (${e.kind}, ${e.title}, ${e.body}, ${e.includeInPrompt})
      `);
    }
  }

  seeded = true;
}
