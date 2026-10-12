/**
 * What the outreach pages treat as the session, from the latest session check.
 *
 * A failed check is not a sign-out. Chrome on Android re-checks the session the
 * moment it returns from the file picker (the picker sends the page to the
 * background), often before the network is back. The auth client turns that
 * failure into "no session", so the upload page went blank, the picked file was
 * lost and the student was sent to sign in. A network or server error keeps the
 * last signed-in session while the check is retried; only an answer of "no
 * session", or a 401, signs the student out. Pure, for tests.
 */
export type SessionLike = { user?: unknown } | null | undefined;

export function effectiveSession<S extends SessionLike>(
  live: S,
  last: S,
  error: unknown,
  isPending: boolean,
  retriesLeft: boolean,
): { session: S | null; checkFailed: boolean; signedOut: boolean; loading: boolean } {
  const status = (error as { status?: number } | null | undefined)?.status;
  const checkFailed = !live?.user && !!error && status !== 401;
  const keepLast = checkFailed && !!last?.user;
  const session = live?.user ? live : keepLast ? last : (live ?? null);
  const signedIn = !!session?.user;
  return {
    session,
    checkFailed,
    signedOut: !isPending && !signedIn && !(checkFailed && retriesLeft),
    loading: isPending || (!signedIn && checkFailed && retriesLeft),
  };
}

/** Wait before re-checking after the nth failed check (0-based). */
export function recheckDelayMs(attempt: number): number {
  return 2000 * 2 ** attempt;
}

export const SESSION_RECHECKS = 3;
