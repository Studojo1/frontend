// The desk's whole-page states: loading, sent to upload, not available for
// this account yet, and a load error. Plus the boundary that keeps one
// broken tab from taking the shell (and the assistant) down with it.
import { Component, type ErrorInfo, type ReactNode } from "react";
import { FiAlertTriangle, FiClock, FiLock, FiRefreshCw } from "react-icons/fi";
import { cx, FOCUS_RING, PRESS } from "~/components/desk/agent/bits";
import type { UnavailableReason } from "~/lib/desk/hooks";
import { landingCtas, type NextStep } from "~/lib/outreach/next-step";

const PRIMARY =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-purple-strong px-5 font-satoshi text-base font-bold text-white shadow-[3px_3px_0_0_#191a23] hover:bg-[#5b21b6]";
const SECONDARY =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-studojo-ink bg-white px-5 font-satoshi text-base font-bold text-studojo-ink shadow-[3px_3px_0_0_#191a23] hover:bg-studojo-purple-bg";

export function DeskLoading() {
  return (
    <div aria-busy="true" className="mx-auto w-full max-w-[1100px] space-y-4 px-4 pt-6 lg:px-6">
      <span className="sr-only" role="status">
        Loading your desk
      </span>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-studojo-ink/10" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl border-2 border-studojo-ink/15 bg-white/80" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border-2 border-studojo-ink/15 bg-white/80" />
    </div>
  );
}

function Panel({ icon, title, children, actions }: { icon: ReactNode; title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-10 sm:pt-16">
      <section className="rounded-2xl border-2 border-studojo-ink bg-white p-6 shadow-[4px_4px_0_0_#191a23] sm:p-8">
        <span aria-hidden className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg text-xl text-studojo-purple-strong">
          {icon}
        </span>
        <h1 className="font-clash text-2xl font-semibold leading-tight text-studojo-ink sm:text-3xl">{title}</h1>
        <div className="mt-3 space-y-2 font-satoshi text-base text-studojo-muted">{children}</div>
        {actions ? <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
      </section>
    </div>
  );
}

const COPY: Record<UnavailableReason, { title: string; body: string }> = {
  not_enabled: {
    title: "This desk is not open for your account yet",
    body: "We are trying it with a small group of students first. Your matches and emails are where they always were.",
  },
  not_live: {
    title: "This desk is not live yet",
    body: "It is still being set up. Your matches and emails are where they always were.",
  },
  switched_off: {
    title: "The assistant is switched off for a moment",
    body: "Nothing you have is lost. Try again in a few minutes, or carry on from your outreach pages.",
  },
};

/** Shown when the agent API answers 403, 404 or 503, so the page still helps. */
export function DeskUnavailable({ reason, step }: { reason: UnavailableReason; step: NextStep | null }) {
  const c = COPY[reason];
  const { primary, secondary } = landingCtas(step, true);
  return (
    <Panel icon={reason === "switched_off" ? <FiClock /> : <FiLock />} title={c.title}>
      <p>{c.body}</p>
      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap">
        <a href={primary.to} className={cx(PRIMARY, PRESS, FOCUS_RING)}>
          {primary.label}
        </a>
        {secondary ? (
          <a href={secondary.to} className={cx(SECONDARY, PRESS, FOCUS_RING)}>
            {secondary.label}
          </a>
        ) : null}
        {reason === "switched_off" ? (
          <button type="button" onClick={() => window.location.reload()} className={cx(SECONDARY, PRESS, FOCUS_RING)}>
            <FiRefreshCw aria-hidden />
            Try again
          </button>
        ) : null}
      </div>
    </Panel>
  );
}

export function DeskError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <Panel
      icon={<FiAlertTriangle />}
      title="Your desk did not load"
      actions={
        <button type="button" onClick={retry} className={cx(PRIMARY, PRESS, FOCUS_RING)}>
          <FiRefreshCw aria-hidden />
          Try again
        </button>
      }
    >
      <p role="alert">{message}</p>
    </Panel>
  );
}

interface BoundaryState {
  failed: boolean;
}

/** Catches a render error in one tab; the top bar and assistant keep working. */
export class TabBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[desk] tab crashed", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="rounded-2xl border-2 border-studojo-ink bg-studojo-pink-bg p-6 font-satoshi">
        <p className="font-clash text-lg font-semibold text-studojo-ink">This part of the page hit a problem</p>
        <p className="mt-1 text-sm text-studojo-muted">The rest of your desk still works. Reloading usually fixes it.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={cx("mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-studojo-ink bg-white px-4 text-sm font-bold shadow-[2px_2px_0_0_#191a23]", PRESS, FOCUS_RING)}
        >
          <FiRefreshCw aria-hidden />
          Reload
        </button>
      </div>
    );
  }
}
