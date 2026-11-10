import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import { heldTrackingParams } from "~/lib/attribution";
import { productHref } from "~/lib/product-origin";
import {
  ctaSource,
  formatScore,
  highlightSegments,
  linkedinShareUrl,
  resultStrength,
  scoreTone,
  shareText,
  stuJoinHref,
  strengthSteps,
  withShareUtm,
  xShareUrl,
  type CtaId,
  type HighlightKind,
  type Score,
} from "~/lib/emailer/contract";
import { track } from "~/lib/emailer/track";
import { ArrowIcon, SiteLink, StuHead, TileIcon } from "~/components/site-b2c/ui";
import { COPY, FAQ, FORM, HIGHLIGHTS, LOCK, MORE_FREE, RESULT, SEO, STEPS, STU } from "./copy";

// EMAILER: the free email writer's building blocks, in the site's look (emailer.css, under html[data-sv2]).

// ── The Stu links ───────────────────────────────────────────────────────────────────────────────────────────────

/**
 * The Stu link for a CTA: the product's /join on this environment's product host (productHref, PRODUCT_ORIGIN:
 * https://platform.studojo.pro on staging, https://platform.studojo.com on production) with via=emailer, how=voice,
 * utm_source (the page's own, else the visit's held first touch, else the referrer, else "direct"), utm_medium=tool,
 * utm_campaign=emailer and utm_content=<cta>. The source is read again after hydration (the held touch and the
 * referrer are browser only).
 */
export function useStuHref(): (cta: CtaId) => string {
  const { search } = useLocation();
  const [source, setSource] = useState(() => ctaSource(search, null, null));
  useEffect(() => {
    let held: URLSearchParams | null = null;
    try {
      held = heldTrackingParams();
    } catch {
      held = null;
    }
    setSource(ctaSource(search, held, typeof document !== "undefined" ? document.referrer : null));
  }, [search]);
  const join = productHref("/join");
  return useCallback((cta: CtaId) => stuJoinHref(join, cta, source), [join, source]);
}

/** A link to Stu. data-join-cta makes the site's own clicked_join count it (journey-client.ts). */
export function StuLink({ cta, className, children, onGo }: { cta: CtaId; className?: string; children: ReactNode; onGo?: () => void }) {
  const href = useStuHref();
  return (
    <a
      href={href(cta)}
      className={className}
      data-join-cta={`emailer_${cta}`}
      onClick={() => {
        track("emailer_cta", { cta });
        onGo?.();
      }}
    >
      {children}
    </a>
  );
}

// ── 1. The announcement bar ─────────────────────────────────────────────────────────────────────────────────────

export function AnnouncementBar() {
  return (
    <div className="em-bar" role="region" aria-label="announcement">
      <p>
        <span className="em-bar-long">{COPY.bar}</span>
        <span className="em-bar-short">{COPY.barShort}</span>
        <StuLink cta="bar" className="em-bar-go">
          {COPY.barGo}
          <ArrowIcon size={14} />
        </StuLink>
      </p>
    </div>
  );
}

// ── Fields ──────────────────────────────────────────────────────────────────────────────────────────────────────

export function Field({
  id,
  label,
  hint,
  optional,
  error,
  children,
  className = "",
}: {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`em-field ${error ? "em-field-bad" : ""} ${className}`.trim()} data-field={id}>
      <label htmlFor={id} className="em-label">
        {label}
        {optional ? <span className="em-opt">{FORM.optional}</span> : null}
      </label>
      {hint ? (
        <p className="em-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className="em-err" id={`${id}-err`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** The live meter under one result: three steps and a nudge toward a number. */
export function ResultMeter({ text }: { text: string }) {
  const s = resultStrength(text);
  const steps = strengthSteps(s);
  return (
    <div className="em-meter" data-strength={s} aria-live="polite">
      <span className="em-meter-bars" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <i key={i} data-on={i <= steps ? "" : undefined} />
        ))}
      </span>
      <span className="em-meter-text">{FORM.meter[s]}</span>
    </div>
  );
}

// ── The score ───────────────────────────────────────────────────────────────────────────────────────────────────

export function ScoreBadge({ value, size = "lg" }: { value: number; size?: "lg" | "md" | "sm" }) {
  return (
    <div className="em-score" data-tone={scoreTone(value)} data-size={size} aria-label={`${formatScore(value)} out of 10`}>
      <b>{formatScore(value)}</b>
      <span>/10</span>
    </div>
  );
}

export function ShareButtons({ shareUrl, score, before, where }: { shareUrl: string; score: number; before?: number | null; where: string }) {
  if (!shareUrl) return null;
  const text = shareText(score, before);
  return (
    <div className="em-share">
      <span className="em-share-label">{RESULT.share}</span>
      <a
        className="em-chip-btn"
        href={xShareUrl(text, withShareUtm(shareUrl, "x"))}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("emailer_share", { network: "x", where, score })}
      >
        <XLogo />
        {RESULT.shareX}
      </a>
      <a
        className="em-chip-btn"
        href={linkedinShareUrl(withShareUtm(shareUrl, "linkedin"))}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("emailer_share", { network: "linkedin", where, score })}
      >
        <LinkedInLogo />
        {RESULT.shareLinkedIn}
      </a>
    </div>
  );
}

export function ScoreCard({
  score,
  shareUrl,
  shareScore,
  shareBefore,
  where,
}: {
  score: Score;
  shareUrl?: string;
  /** What the share post says (grade: the rewrite's score, from shareBefore). Defaults to this score. */
  shareScore?: number;
  shareBefore?: number | null;
  where: string;
}) {
  return (
    <section className="em-card em-scorecard" aria-label="reply score">
      <div className="em-scorecard-top">
        <ScoreBadge value={score.value} />
        <div className="em-verdict">
          <span className="sv-kicker">{RESULT.scoreKicker}</span>
          <p>{score.verdict}</p>
        </div>
      </div>
      <div className="em-fixes">
        <h3>{RESULT.fixesTitle}</h3>
        {score.fixes.length ? (
          <ul>
            {score.fixes.slice(0, 3).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        ) : (
          <p className="em-hint">{RESULT.noFixes}</p>
        )}
      </div>
      {shareUrl ? <ShareButtons shareUrl={shareUrl} score={shareScore ?? score.value} before={shareBefore} where={where} /> : null}
    </section>
  );
}

// ── The email ───────────────────────────────────────────────────────────────────────────────────────────────────

export function EmailBody({ body, highlights }: { body: string; highlights?: Partial<Record<HighlightKind, string | null>> | null }) {
  const segs = highlightSegments(body, highlights);
  return (
    <div className="em-body">
      {segs.map((s, i) =>
        s.kind ? (
          <mark key={i} className="em-hl" data-kind={s.kind}>
            <span className="em-hl-tag" aria-hidden="true">
              {HIGHLIGHTS[s.kind].tag}
            </span>
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </div>
  );
}

/** "Why this works": one line for each highlight the body still holds. */
export function WhyThisWorks({ body, highlights }: { body: string; highlights?: Partial<Record<HighlightKind, string | null>> | null }) {
  const kinds = highlightSegments(body, highlights)
    .map((s) => s.kind)
    .filter((k): k is HighlightKind => !!k);
  if (!kinds.length) return null;
  return (
    <div className="em-why">
      <span className="sv-kicker">{RESULT.whyTitle}</span>
      <ul>
        {kinds.map((k) => (
          <li key={k} data-kind={k}>
            <i aria-hidden="true" />
            <span>
              <b>{HIGHLIGHTS[k].tag}.</b> {HIGHLIGHTS[k].why}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EmailHead({ to, subject, onCopySubject }: { to: string; subject: ReactNode; onCopySubject?: () => void }) {
  return (
    <div className="em-mailhead">
      <div className="em-mailrow">
        <span className="em-mailkey">{RESULT.to}</span>
        <span className="em-mailval">{to}</span>
      </div>
      <div className="em-mailrow">
        <span className="em-mailkey">{RESULT.subject}</span>
        <span className="em-mailval em-subject">{subject}</span>
        {onCopySubject ? (
          <button type="button" className="em-icon-btn" onClick={onCopySubject} aria-label={RESULT.copySubject} title={RESULT.copySubject}>
            <CopyIcon />
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ── Locks ───────────────────────────────────────────────────────────────────────────────────────────────────────

export function LockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** A blurred stand-in with the sign-in pitch over it. The stand-in text is never real (copy.ts LOCKED_FOLLOWUP). */
export function LockedOver({ children, line, signInHref, onSignIn, stu = true }: { children: ReactNode; line: string; signInHref: string; onSignIn: () => void; stu?: boolean }) {
  return (
    <div className="em-locked">
      <div className="em-locked-blur" aria-hidden="true" inert>
        {children}
      </div>
      <div className="em-locked-over">
        <span className="em-lock-ico">
          <LockIcon size={18} />
        </span>
        <p>{line}</p>
        <a href={signInHref} className="sv-btn sv-btn-sm em-signin-btn" onClick={onSignIn}>
          {LOCK.go}
        </a>
        {stu ? (
          <StuLink cta="lock" className="em-textlink">
            {LOCK.orStu}
          </StuLink>
        ) : null}
      </div>
    </div>
  );
}

// ── The modal ───────────────────────────────────────────────────────────────────────────────────────────────────

export function Modal({ open, onClose, labelledBy, children }: { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    back.current = (document.activeElement as HTMLElement) ?? null;
    const t = window.setTimeout(() => box.current?.querySelector<HTMLElement>("a, button")?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && box.current) {
        const f = [...box.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      back.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="em-modal-back" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="em-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={box}>
        <button type="button" className="em-modal-x" onClick={onClose} aria-label="close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

// ── 3. Next to the result ───────────────────────────────────────────────────────────────────────────────────────

export function ResultStuCard({ cta = "result", title = STU.resultTitle, line = STU.resultLine }: { cta?: CtaId; title?: string; line?: string }) {
  return (
    <aside className="em-card em-stucard" aria-label="stu, your career agent">
      <StuHead size={56} />
      <div>
        <p className="em-stucard-title">{title}</p>
        <p className="em-stucard-line">{line}</p>
      </div>
      <StuLink cta={cta} className="sv-btn sv-btn-sm em-stucard-go">
        {STU.go}
        <ArrowIcon size={16} />
      </StuLink>
    </aside>
  );
}

// ── 5. Five matched jobs a day ──────────────────────────────────────────────────────────────────────────────────

export function JobsCard() {
  return (
    <section className="sv-in em-sec em-jobs-wrap" aria-labelledby="em-jobs-h">
      <div className="em-card em-jobs">
        <StuHead size={88} face="sparkle" />
        <div className="em-jobs-copy">
          <span className="sv-kicker">{STU.jobsKicker}</span>
          <h2 className="sv-h2" id="em-jobs-h">
            {STU.jobsTitle}
          </h2>
          <p className="sv-body">{STU.jobsLine}</p>
        </div>
        <StuLink cta="jobs" className="sv-btn em-jobs-go">
          {STU.go}
          <ArrowIcon size={18} />
        </StuLink>
      </div>
    </section>
  );
}

// ── 7. The phone bar ────────────────────────────────────────────────────────────────────────────────────────────

/** Fixed to the bottom on phones once the hero has scrolled away; out of the way while typing or a dialog is open. */
export function StickyBar({ hidden }: { hidden: boolean }) {
  const [past, setPast] = useState(false);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("em-hero");
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setPast(!e.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const isField = (t: EventTarget | null) => t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
    const on = (e: FocusEvent) => isField(e.target) && setTyping(true);
    const off = (e: FocusEvent) => isField(e.target) && setTyping(false);
    document.addEventListener("focusin", on);
    document.addEventListener("focusout", off);
    return () => {
      document.removeEventListener("focusin", on);
      document.removeEventListener("focusout", off);
    };
  }, []);
  const show = past && !typing && !hidden;
  return (
    <div className="em-sticky" data-show={show ? "" : undefined} aria-hidden={!show}>
      <StuHead size={34} />
      <p>{STU.sticky}</p>
      <StuLink cta="sticky" className="sv-btn sv-btn-sm">
        {STU.go}
      </StuLink>
    </div>
  );
}

// ── How it works, the SEO paragraph, more free, the FAQ ─────────────────────────────────────────────────────────

export function HowItWorks() {
  return (
    <section className="sv-in em-sec" aria-labelledby="em-how-h" id="how-it-works">
      <div className="em-sechead">
        <span className="sv-kicker">{SEO.kicker}</span>
        <h2 className="sv-h2" id="em-how-h">
          {SEO.h2}
        </h2>
      </div>
      <ol className="em-steps">
        {STEPS.map((s, i) => (
          <li key={i} className="em-card em-step">
            <span className="em-step-n">{i + 1}</span>
            <h3 className="sv-h3">{s.title}</h3>
            <p className="sv-body">{s.line}</p>
          </li>
        ))}
      </ol>
      <div className="em-seo">
        {SEO.paras.map((p, i) => (
          <p key={i} className="sv-body">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

export function MoreFree() {
  return (
    <section className="sv-in em-sec" aria-labelledby="em-more-h">
      <div className="em-sechead">
        <span className="sv-kicker">{MORE_FREE.kicker}</span>
        <h2 className="sv-h2" id="em-more-h">
          {MORE_FREE.h2}
        </h2>
      </div>
      <div className="em-more">
        {MORE_FREE.items.map((it) => (
          <SiteLink key={it.href} to={it.href} className="sv-card em-more-card">
            <TileIcon name={it.icon} />
            <span className="em-more-t">{it.title}</span>
            <span className="em-more-d">{it.line}</span>
            <span className="sv-go">
              read it <ArrowIcon size={15} />
            </span>
          </SiteLink>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="sv-in em-sec" aria-labelledby="em-faq-h">
      <div className="em-sechead em-center">
        <span className="sv-kicker">questions</span>
        <h2 className="sv-h2" id="em-faq-h">
          questions people ask.
        </h2>
      </div>
      <div className="em-faq">
        {FAQ.map((f, i) => (
          <details key={i} className="em-q">
            <summary>
              {f.q}
              <span className="em-plus" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

// ── Small icons ─────────────────────────────────────────────────────────────────────────────────────────────────

export function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

export function MailIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function EditIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

export function RefreshIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-2.6-6.4L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

export function UploadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function XLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L1.8 3h6.3l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" />
    </svg>
  );
}

export function LinkedInLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v6.2h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9v5.6h-4z" />
    </svg>
  );
}
