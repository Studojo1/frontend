// Send the signup welcome only after the sign-up has committed.
//
// better-auth runs the user.create.after hook INSIDE the sign-up transaction,
// before the credential row is written and before commit. Publishing from the
// hook directly would welcome a user whose sign-up can still roll back. So the
// hook hands off to this, which waits and checks from OUTSIDE the transaction
// (a separate pool connection) that the user has a login account, and only
// then publishes. A rolled-back sign-up never becomes visible, so it is never
// welcomed.

export type WelcomePayload = { user_id: string; email: string; name?: string | null };

export const WELCOME_CHECK_DELAYS_MS = [500, 2_000, 5_000, 15_000];

export async function welcomeAfterCommit(
  user: { id: string; email: string; name?: string | null },
  deps: {
    isCommitted: (userId: string) => Promise<boolean>;
    publish: (payload: WelcomePayload) => Promise<void>;
    delays?: number[];
  },
): Promise<boolean> {
  const delays = deps.delays ?? WELCOME_CHECK_DELAYS_MS;
  for (const delay of delays) {
    await new Promise((r) => setTimeout(r, delay));
    let committed = false;
    try {
      committed = await deps.isCommitted(user.id);
    } catch (err) {
      console.error("[auth] welcome: commit check failed:", err);
    }
    if (!committed) continue;
    try {
      await deps.publish({ user_id: user.id, email: user.email, name: user.name });
      return true;
    } catch (err) {
      console.error("[auth] Failed to publish cc welcome_new_user event:", err);
      return false;
    }
  }
  console.warn(`[auth] welcome: sign-up for ${user.id} never committed a login; no welcome sent`);
  return false;
}
