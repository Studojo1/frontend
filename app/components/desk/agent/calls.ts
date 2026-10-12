// The JSON routes the agent panel calls, through the desk's one typed client
// (lib/desk/api.ts, one attempt per write as contract section 2 requires).
// These are the same server functions the workspace buttons and the agent's
// tools call, so chat and tabs cannot disagree.
import {
  approveDraft as apiApprove,
  createThread,
  discardDraft as apiDiscard,
  editDraft,
  errorDetail,
  errorMessage,
  getOutreach,
  getThread as apiGetThread,
  listThreads as apiListThreads,
  skipMatch,
} from "~/lib/desk/api";

export { loadBootstrap } from "~/lib/desk/hooks";
export { createThread, editDraft, errorDetail, errorMessage };

export const listThreads = (scope = "main") => apiListThreads(scope);

export const getThread = (id: number, before?: number | null) => apiGetThread(id, before ? { before, limit: 50 } : { limit: 50 });

export const getOutreachDetail = (id: string) => getOutreach(id);

export const approveDraft = (id: string, expectedVersion: number) => apiApprove(id, { expected_version: expectedVersion });

export const discardDraft = (id: string) => apiDiscard(id, {});

export const skipLead = (leadId: number) => skipMatch(leadId, {});
