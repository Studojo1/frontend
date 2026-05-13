import { useState, useEffect } from "react";
import { FiMapPin, FiBriefcase, FiExternalLink } from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";
import type { Lead, LeadJustification } from "~/lib/outreach/types";

interface FlashCardProps {
  lead: Lead;
}

const SIGNAL_BADGE: Record<LeadJustification["signal_strength"], string> = {
  high: "bg-studojo-purple text-white border-studojo-purple",
  medium: "bg-studojo-surface-muted text-studojo-ink border-studojo-ink/30",
  low: "bg-white text-studojo-muted border-studojo-ink/20",
};

const SIGNAL_LABEL: Record<LeadJustification["signal_strength"], string> = {
  high: "Strong signal",
  medium: "Solid match",
  low: "Worth a shot",
};

function buildContactReason(lead: Lead): string {
  const title = lead.title || "";
  const company = lead.company || "";
  const industry = lead.industry || "";
  const tl = title.toLowerCase();
  const score = lead.score;

  // ── 1. Authority line — what their role means for hiring power ──────────
  let authorityLine: string;
  if (/\b(founder|co-founder|ceo|cto|cfo|coo|chief)\b/.test(tl)) {
    authorityLine = `As ${company ? `${company}'s` : "a"} founder or C-suite exec, they own every key hire personally.`;
  } else if (/\bvp\b|vice president/.test(tl)) {
    authorityLine = `VPs carry direct budget and headcount authority. No committee needed to say yes.`;
  } else if (/\bdirector\b/.test(tl)) {
    authorityLine = `Directors own their team's roadmap and can approve talent without going up the chain.`;
  } else if (/\bhead of\b/.test(tl)) {
    authorityLine = `Heads of departments set their own priorities and hire directly into their teams.`;
  } else if (/\bmanager\b/.test(tl)) {
    authorityLine = `Managers are closest to the actual work. They know exactly what their team is missing and can act fast.`;
  } else if (/\b(lead|principal|staff)\b/.test(tl)) {
    authorityLine = `Tech leads and principals often drive or heavily influence hiring decisions for their squad.`;
  } else {
    authorityLine = `Their position puts them close to the decision-making on new hires.`;
  }

  // ── 2. Fit line — why this company / industry matches ───────────────────
  let fitLine: string;
  const titleScore = score?.title_relevance ?? 0;
  const industryScore = score?.industry_relevance ?? 0;

  if (titleScore >= 28 && company) {
    fitLine = `Their title maps directly to the kind of work you do, making ${company} a strong target.`;
  } else if (industryScore >= 12 && industry) {
    fitLine = `${industry} is squarely in your target space, so this outreach will feel relevant, not random.`;
  } else if (company) {
    fitLine = `${company} is the type of organisation where your background would stand out.`;
  } else {
    fitLine = `The overlap between their focus area and your background makes the conversation a natural one.`;
  }

  // ── 3. Action line — why now / what to do ───────────────────────────────
  const senScore = score?.seniority_relevance ?? 0;
  let actionLine: string;
  if (senScore >= 9) {
    actionLine = `Reach out now. This is the seniority sweet spot where you get a real conversation.`;
  } else if (lead.email_verified) {
    actionLine = `Their email is verified, so you can reach them directly without guesswork.`;
  } else {
    actionLine = `A short personalised note referencing their work is all it takes to get noticed.`;
  }

  return `${authorityLine} ${fitLine} ${actionLine}`;
}

export function FlashCard({ lead }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  const justification = lead.score?.justification ?? null;
  const reason = justification ? null : buildContactReason(lead);

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: "1000px", height: "290px" }}
      onMouseEnter={() => !isTouch && setFlipped(true)}
      onMouseLeave={() => !isTouch && setFlipped(false)}
      onClick={() => isTouch && setFlipped((f) => !f)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-white border-2 border-studojo-ink rounded-2xl shadow-brutal px-4 py-3 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1 mr-2">
                <h3 className="text-sm font-bold text-studojo-ink truncate font-satoshi">{lead.name}</h3>
                <p className="text-xs text-studojo-muted mt-0.5 truncate font-satoshi">{lead.title}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-xs text-studojo-muted font-satoshi">
              <div className="flex items-center gap-1.5">
                <BsBuilding className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{lead.company}</span>
              </div>
              {lead.location && (
                <div className="flex items-center gap-1.5">
                  <FiMapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{lead.location}</span>
                </div>
              )}
              {lead.industry && (
                <div className="flex items-center gap-1.5">
                  <FiBriefcase className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{lead.industry}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-satoshi font-medium border ${
                lead.email_verified
                  ? "bg-studojo-green-bg text-studojo-green border-studojo-green/30"
                  : "bg-studojo-surface-muted text-studojo-muted border-studojo-ink/20"
              }`}
            >
              {lead.email_verified ? "Verified" : lead.status}
            </span>
            <span className="text-[10px] text-studojo-muted font-satoshi">{isTouch ? "Tap to flip" : "Hover to flip"}</span>
          </div>
        </div>

        {/* Back — "Why contact them" write-up */}
        <div
          className="absolute inset-0 bg-white border-2 border-studojo-purple rounded-2xl shadow-brutal px-4 py-3 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-studojo-purple" />
                <h4 className="text-[11px] font-bold text-studojo-purple uppercase tracking-wide font-satoshi">
                  Why contact them
                </h4>
              </div>
              {justification && (
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-satoshi font-bold uppercase tracking-wide border ${SIGNAL_BADGE[justification.signal_strength]}`}
                >
                  {SIGNAL_LABEL[justification.signal_strength]}
                </span>
              )}
            </div>
            {justification ? (
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-[11px] font-satoshi font-bold text-studojo-ink leading-snug">
                  {justification.headline}
                </p>
                {justification.bullets && justification.bullets.length > 0 ? (
                  <ul className="space-y-1.5 flex-1">
                    {justification.bullets.slice(0, 3).map((b, i) => (
                      <li
                        key={i}
                        className="text-[11px] font-satoshi text-studojo-ink leading-snug flex gap-1.5"
                      >
                        <span className="text-studojo-purple font-bold flex-shrink-0 mt-0.5">▸</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    {justification.fit_reason && (
                      <p className="text-[11px] font-satoshi text-studojo-ink leading-snug line-clamp-3">
                        {justification.fit_reason}
                      </p>
                    )}
                    {justification.talk_track && (
                      <p className="text-[10px] font-satoshi italic text-studojo-muted leading-snug line-clamp-2">
                        {justification.talk_track}
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="text-xs font-satoshi text-studojo-ink leading-relaxed line-clamp-[8]">
                {reason}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-studojo-ink/8">
            {lead.linkedin_url ? (
              <a
                href={lead.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-studojo-purple text-xs hover:underline font-satoshi font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <FiExternalLink className="w-3 h-3" /> View on LinkedIn
              </a>
            ) : (
              <span />
            )}
            {justification?.signal_strength === "high" && (
              <span className="text-[10px] font-satoshi text-studojo-muted">Web-researched</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
