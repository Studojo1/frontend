import { STU_HEAD } from "./site-links";
import {
  STU_CTA_GO,
  STU_CTA_GO_SIGNED,
  STU_CTA_KICKER,
  STU_CTA_LINE,
  STU_CTA_NOTE,
  STU_CTA_QUIET,
  STU_CTA_TITLE,
  withVia,
  type StuCtaSize,
} from "./stu-cta";
import { ArrowIcon, MicIcon, useSiteStart } from "./ui";

// CTA-NEW (4 Nov 2026): THE call to action on every blog post and report (stu-cta.ts says why). Stu's head, the
// page's own title and line, and the homepage's purple pill "start the call", to the platform's /join with the page's
// ad keys (else the visit's held first touch), how=voice and via=<via>. Signed in: "my jobs", never /join again.
// size "card" (reports, the end of a page): kicker, title, line, button, "free to start". size "quiet" (inside a
// post): head, one line, button. The same markup as stuCtaHtml(), so both look the same. Look: site.css.

/** The start link for this page, with its own `via` (blog-<slug>, report-<slug>). */
export function useStuStart(via: string): { href: string; signedIn: boolean } {
  const start = useSiteStart();
  return { href: start.signedIn ? start.href : withVia(start.href, via), signedIn: start.signedIn };
}

export function StuCta({
  via,
  title,
  line,
  place,
  size = "card",
  className = "",
}: {
  /** blog-<slug> or report-<slug> (stu-cta.ts stuVia). */
  via: string;
  title?: string;
  line?: string;
  /** Tags the button (data-start), as on the homepage. */
  place: string;
  size?: StuCtaSize;
  className?: string;
}) {
  const { href, signedIn } = useStuStart(via);
  const quiet = size === "quiet";
  return (
    <aside className={`sv-stu-cta ${className}`.trim()} data-size={size} aria-label="stu, your career agent">
      <img className="sv-stu-cta-head" src={STU_HEAD} alt="" width={56} height={56} aria-hidden="true" />
      <div className="sv-stu-cta-copy">
        {quiet ? null : <span className="sv-kicker sv-stu-cta-kick">{STU_CTA_KICKER}</span>}
        <p className="sv-stu-cta-title">{quiet ? title || STU_CTA_QUIET : title || STU_CTA_TITLE}</p>
        {quiet ? null : <p className="sv-stu-cta-line">{line || STU_CTA_LINE}</p>}
      </div>
      <div className="sv-stu-cta-act">
        <a href={href} className="sv-btn sv-btn-sm sv-stu-cta-go" data-start={place}>
          {signedIn ? <ArrowIcon size={16} /> : <MicIcon size={16} />}
          <span>{signedIn ? STU_CTA_GO_SIGNED : STU_CTA_GO}</span>
        </a>
        {quiet ? null : <span className="sv-stu-cta-note">{STU_CTA_NOTE}</span>}
      </div>
    </aside>
  );
}
