// Work actions: drafts, people, replies, prep, page, missions, memory.
// Returns null for actions it does not handle. Shared file: owned by the foundation.
import { COPY, NOTCH3_UNLOCK, notchMeta } from "../config";
import { packById, TOP_UP } from "../data";
import type { AppState, B2Action } from "../types";
import { fuel } from "./derive";
import { mapDraft, mapPerson, nameOf, nextSlot, reEvidence, relinkDrafts, withLog, withToast } from "./reducer-util";

const NO_CREDIT = "No credits left. Top up to send this one.";

export function workReducer(s: AppState, a: B2Action): AppState | null {
  switch (a.type) {
    // ── Drafts ──
    case "APPROVE_DRAFT": {
      const d = s.drafts.find((x) => x.id === a.id);
      if (!d || d.status === "approved") return s;
      // A first email needs a credit. With none left it waits; it never overdraws the pack.
      if (d.kind === "first" && fuel(s, d.missionId).left <= 0) return withToast(s, NO_CREDIT);
      let n = mapDraft(s, a.id, (x) => ({ ...x, status: "approved", slotDay: nextSlot(s, x.missionId), diff: undefined }));
      n = { ...n, missions: n.missions.map((m) => (m.id === d.missionId ? { ...m, approvals: m.approvals + 1 } : m)) };
      const mission = s.missions.find((m) => m.id === d.missionId);
      return withLog(n, `Approved the ${d.kind === "first" ? "first email" : d.kind === "follow" ? "follow-up" : "nudge"} to ${nameOf(s, d.personId)} (${notchMeta(mission?.notch ?? 1).name})`, {
        actor: a.by, missionId: d.missionId, undo: { type: "UNAPPROVE_DRAFT", id: d.id },
      });
    }
    case "UNAPPROVE_DRAFT": {
      const d = s.drafts.find((x) => x.id === a.id);
      if (!d || d.status !== "approved" || (d.slotDay !== undefined && d.slotDay <= s.day)) return s;
      const n = mapDraft(s, a.id, (x) => ({ ...x, status: "pending", slotDay: undefined }));
      return withLog({ ...n, missions: n.missions.map((m) => (m.id === d.missionId ? { ...m, approvals: Math.max(0, m.approvals - 1) } : m)) },
        `Took back the approval for ${nameOf(s, d.personId)}`, { missionId: d.missionId });
    }
    case "SKIP_DRAFT": {
      const d = s.drafts.find((x) => x.id === a.id);
      if (!d) return s;
      return withLog(mapDraft(s, a.id, (x) => ({ ...x, status: "skipped", diff: undefined })), `Skipped ${nameOf(s, d.personId)}. No credit used`, {
        actor: a.by, missionId: d.missionId, undo: { type: "RESTORE_DRAFT", id: d.id },
      });
    }
    case "RESTORE_DRAFT":
      return mapDraft(s, a.id, (x) => ({ ...x, status: "pending" }));
    case "EDIT_DRAFT":
      return mapDraft(s, a.id, (x) => reEvidence({ ...x, subject: a.subject ?? x.subject, paragraphs: a.paragraphs ?? x.paragraphs }));
    case "PROPOSE_DIFF":
      return mapDraft(s, a.id, (x) => ({ ...x, diff: { before: x.paragraphs, after: a.after } }));
    case "APPLY_DIFF":
      return mapDraft(s, a.id, (x) =>
        x.diff ? reEvidence({ ...x, paragraphs: a.keep === "after" ? x.diff.after : x.diff.before, diff: undefined }) : x,
      );
    case "APPROVE_MANY": {
      let n = s;
      const done: string[] = [];
      let held = 0;
      for (const id of a.ids) {
        const d = n.drafts.find((x) => x.id === id);
        if (!d || d.status !== "pending") continue;
        if (d.kind === "first" && fuel(n, d.missionId).left <= 0) {
          held++;
          continue;
        }
        const slot = nextSlot(n, d.missionId);
        n = mapDraft(n, id, (x) => ({ ...x, status: "approved", slotDay: slot, diff: undefined }));
        n = { ...n, missions: n.missions.map((m) => (m.id === d.missionId ? { ...m, approvals: m.approvals + 1 } : m)) };
        done.push(id);
      }
      const wait = held ? ` ${held} wait${held === 1 ? "s" : ""} for credits.` : "";
      if (!done.length) return held ? withToast(s, NO_CREDIT) : s;
      n = withLog(n, `Approved ${done.length} drafts in one tap (${notchMeta(s.missions.find((m) => m.id === s.env)?.notch ?? 1).name})`, {
        actor: a.by, undo: { type: "UNAPPROVE_MANY", ids: done },
      });
      return withToast(n, `Approved ${done.length}. They go out from tomorrow, inside the cap.${wait}`, { type: "UNAPPROVE_MANY", ids: done });
    }
    case "UNAPPROVE_MANY": {
      // Only drafts whose send day has not come yet can be taken back.
      const back = s.drafts.filter((d) => a.ids.includes(d.id) && d.status === "approved" && (d.slotDay === undefined || d.slotDay > s.day));
      if (!back.length) return withToast(s, "Too late to take those back: their send day has come.");
      const ids = new Set(back.map((d) => d.id));
      const n: AppState = {
        ...s,
        drafts: s.drafts.map((d) => (ids.has(d.id) ? { ...d, status: "pending", slotDay: undefined } : d)),
        missions: s.missions.map((m) => {
          const k = back.filter((d) => d.missionId === m.id).length;
          return k ? { ...m, approvals: Math.max(0, m.approvals - k) } : m;
        }),
      };
      return withLog(n, `Took back ${back.length} approvals. They wait in Approvals again`);
    }
    case "ADD_DRAFTS": {
      const fresh = a.drafts.filter((d) => !s.drafts.some((x) => x.id === d.id));
      return fresh.length ? { ...s, drafts: [...s.drafts, ...fresh] } : s;
    }

    // ── People ──
    case "ADD_PEOPLE": {
      const fresh = a.people.filter((p) => !s.people.some((x) => x.id === p.id));
      return fresh.length ? { ...s, people: [...s.people, ...fresh] } : s;
    }
    case "SET_STAGE":
      return withLog(mapPerson(s, a.id, (p) => ({ ...p, stage: a.stage })), `Moved ${nameOf(s, a.id)} to ${a.stage}`, { actor: a.by });
    case "SNOOZE": {
      const n = dropDrafts(mapPerson(s, a.id, (p) => ({ ...p, stage: "later", snoozeUntil: a.until })), [a.id]);
      return withLog(n, `Snoozed ${nameOf(s, a.id)} until ${a.until}`, { actor: a.by });
    }
    case "NEVER_CONTACT": {
      let n = dropDrafts(mapPerson(s, a.id, (p) => ({ ...p, stage: "closed" })), [a.id]);
      const p = s.people.find((x) => x.id === a.id);
      n = { ...n, missions: n.missions.map((m) => (m.id === p?.missionId && !m.neverContact.includes(a.id) ? { ...m, neverContact: [...m.neverContact, a.id] } : m)) };
      return withLog(n, `Never contact ${nameOf(s, a.id)}. Their unsent emails dropped`, { actor: a.by });
    }
    case "DROP_FROM_QUEUE": {
      let n = dropDrafts(s, a.personIds);
      if (a.close) n = { ...n, people: n.people.map((p) => (a.personIds.includes(p.id) ? { ...p, stage: "closed" } : p)) };
      const names = a.personIds.map((id) => nameOf(s, id).split(",")[1]?.trim() ?? id).join(" and ");
      return withLog(n, `Dropped ${names} from the queue${a.reason ? `: ${a.reason}` : ""}`, { actor: a.by ?? "senpai", skill: "scout" });
    }

    // ── Replies ──
    case "SET_REPLY_DRAFT":
      return { ...s, replies: s.replies.map((r) => (r.id === a.id ? { ...r, draft: a.draft, savedToGmail: false } : r)) };
    case "SAVE_TO_GMAIL": {
      const r = s.replies.find((x) => x.id === a.id);
      const n = { ...s, replies: s.replies.map((x) => (x.id === a.id ? { ...x, savedToGmail: true } : x)) };
      return withLog(n, `Put the reply to ${r ? nameOf(s, r.personId) : "them"} in Gmail drafts (Simulated)`, { skill: "inbox" });
    }
    case "RETAG":
      return withLog({ ...s, replies: s.replies.map((r) => (r.id === a.id ? { ...r, tag: a.tag } : r)) }, `Retagged a reply as ${a.tag}`);
    case "SEE_REPLY":
      return { ...s, replies: s.replies.map((r) => (r.id === a.id ? { ...r, seen: true } : r)) };
    case "REMIND_REPLY":
      return { ...s, replies: s.replies.map((r) => (r.id === a.id ? { ...r, remindOn: a.on } : r)) };
    case "LOG_OUTCOME": {
      let n = mapPerson(s, a.personId, (p) => ({ ...p, stage: a.outcome }));
      n = { ...n, replies: n.replies.map((r) => (r.personId === a.personId ? { ...r, outcome: a.outcome } : r)) };
      return withLog(n, `Logged ${a.outcome === "offer" ? "an offer" : "an interview"} with ${nameOf(s, a.personId)}. ${COPY.noFee}`);
    }

    // ── Prep ──
    case "ADD_PREP":
      return s.preps.some((p) => p.id === a.prep.id) ? s : { ...s, preps: [...s.preps, a.prep] };
    case "UPDATE_PREP":
      return { ...s, preps: s.preps.map((p) => (p.id === a.id ? { ...p, ...a.patch } : p)) };

    // ── Page ──
    case "SET_PAGE": {
      const n = { ...s, page: { ...s.page, ...a.patch } };
      return a.note ? withLog(n, a.note, { actor: a.by, skill: a.by === "senpai" ? "coach" : undefined }) : n;
    }
    case "UNPUBLISH": {
      if (!s.page.live) return s;
      const n = relinkDrafts({ ...s, page: { ...s.page, live: false } }, false);
      return withToast(withLog(n, "Unpublished your page. Follow-ups now go without the link"), "Your page is private now.", { type: "REPUBLISH" });
    }
    case "REPUBLISH": {
      if (s.page.live || !s.page.visibility.adult) return s;
      const n = relinkDrafts({ ...s, page: { ...s.page, live: true } }, true);
      return withLog(n, "Published your page again, link-only");
    }

    // ── Missions, sending, Gmail, money ──
    case "SET_NOTCH": {
      const m = s.missions.find((x) => x.id === a.missionId);
      if (!m || m.notch === a.notch) return s;
      if (a.notch === 3 && (m.approvals < NOTCH3_UNLOCK || !s.page.visibility.adult)) return s;
      const n = { ...s, missions: s.missions.map((x) => (x.id === a.missionId ? { ...x, notch: a.notch } : x)) };
      return withLog(n, `Autopilot set to ${notchMeta(a.notch).name}`, { missionId: a.missionId, undo: { type: "SET_NOTCH", missionId: a.missionId, notch: m.notch } });
    }
    case "PAUSE_SENDING": {
      const n = { ...s, gmail: { ...s.gmail, paused: a.paused } };
      return withToast(withLog(n, a.paused ? "Paused all sending" : "Resumed sending", { actor: "you" }), a.paused ? COPY.paused : "Sending resumed, inside the daily cap.");
    }
    case "DISCONNECT_GMAIL":
      return withToast(withLog({ ...s, gmail: { ...s.gmail, connected: false, paused: true } }, "Disconnected Gmail. Sending stopped"), "Gmail disconnected. Nothing sends now.");
    case "CONNECT_GMAIL":
      return withLog({ ...s, gmail: { ...s.gmail, connected: true, paused: false } }, "Connected Gmail again (Simulated)", { actor: "gmail" });
    case "TOP_UP": {
      const n = { ...s, missions: s.missions.map((m) => (m.id === a.missionId ? { ...m, total: m.total + TOP_UP.outreaches, toppedUp: true } : m)) };
      return withLog(n, `Topped up 150 outreaches (${COPY.mockPay})`, { missionId: a.missionId });
    }
    case "FUND_MISSION": {
      const pack = packById(a.pack);
      if (!pack) return s;
      const n = { ...s, missions: s.missions.map((m) => (m.id === a.missionId ? { ...m, pack: a.pack, total: m.total + pack.outreaches, status: "running" as const } : m)) };
      return withLog(n, `Funded with ${pack.name}, ${pack.outreaches} outreaches (${COPY.mockPay})`, { missionId: a.missionId });
    }
    case "CREATE_MISSION":
      return s.missions.length >= 3 || s.missions.some((m) => m.id === a.mission.id) ? s : { ...s, missions: [...s.missions, a.mission] };
    case "UPDATE_MISSION": {
      const n = { ...s, missions: s.missions.map((m) => (m.id === a.id ? { ...m, ...a.patch } : m)) };
      return a.note ? withLog(n, a.note, { missionId: a.id }) : n;
    }

    // ── Memory ──
    case "ADD_MEMORY": {
      const exists = s.memory.some((m) => m.id === a.item.id);
      const n = { ...s, memory: exists ? s.memory.map((m) => (m.id === a.item.id ? a.item : m)) : [...s.memory, a.item] };
      return withLog(n, `Saved to memory: ${a.item.text}`, { actor: a.by });
    }
    case "UPDATE_MEMORY":
      return { ...s, memory: s.memory.map((m) => (m.id === a.id ? { ...m, ...a.patch } : m)) };
    case "FORGET_MEMORY": {
      const item = s.memory.find((m) => m.id === a.id);
      return item ? withLog({ ...s, memory: s.memory.filter((m) => m.id !== a.id) }, `Forgot: ${item.text}`) : s;
    }
    default:
      return null;
  }
}

/** Unsent drafts for these people become dropped. */
function dropDrafts(s: AppState, personIds: string[]): AppState {
  return {
    ...s,
    drafts: s.drafts.map((d) => (personIds.includes(d.personId) && d.status === "pending" ? { ...d, status: "dropped" } : d)),
  };
}
