/**
 * What the outreach pages treat as the session, from the latest session check.
 *
 * A failed check is not a sign-out. Chrome on Android re-checks the session the
 * moment it returns from the file picker (the picker sends the page to the
 * background), often before the network is back. The auth client turns that
 * failure into "no session", so the upload page went blank, the picked file was
 * lost and the student was sent to sign in. Once a student is signed in, only a
 * finished check that answers "no session", or a 401, signs them out. Loading,
 * a re-check in flight and a network or server error all keep the last
 * signed-in session: the auth client clears its data on a failure and reports
 * a re-check of cleared data as loading, which also blanked the page. Pure, for
 * tests.
 */
export type SessionLike = { user?: unknown } | null | undefined;

export function effectiveSession<S extends SessionLike>(
  live: S,
  last: S,
  error: unknown,
  isPending: boolean,
  isRefetching: boolean,
  retriesLeft: boolean,
): { session: S | null; checkFailed: boolean; answeredNo: boolean; signedOut: boolean; loading: boolean } {
  const status = (error as { status?: number } | null | undefined)?.status;
  const checkFailed = !live?.user && !!error && status !== 401;
  const answeredNo = !live?.user && ((!error && !isPending && !isRefetching) || status === 401);
  const session = live?.user ? live : last?.user && !answeredNo ? last : (live ?? null);
  const signedIn = !!session?.user;
  const loading = !signedIn && (isPending || isRefetching || (checkFailed && retriesLeft));
  return { session, checkFailed, answeredNo, signedOut: !signedIn && !loading, loading };
}

/** Wait before re-checking after the nth failed check (0-based). */
export function recheckDelayMs(attempt: number): number {
  return 2000 * 2 ** attempt;
}

export const SESSION_RECHECKS = 3;
