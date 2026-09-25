import { useState, useEffect } from "react";
import { FiLinkedin, FiExternalLink } from "react-icons/fi";
import { capturePostHog } from "~/lib/posthog";
import type { Lead } from "~/lib/outreach/types";

interface FlashCardProps {
  lead: Lead;
  // Where a click goes is the page's decision, so the card and the page's own
  // CTA can never send the same user to two different products.
  onSelect: (lead: Lead) => void;
  // Names what a click actually does. The destination is a plan-wide step, not
  // a per-person action, so the card must not promise "Contact them".
  actionLabel: string;
}

const COLORS = ["bg-studojo-purple", "bg-studojo-pink", "bg-studojo-green", "bg-studojo-orange", "bg-studojo-teal", "bg-indigo-500", "bg-rose-500", "bg-amber-500"];
const colOf = (n: string) => COLORS[(n || "x").charCodeAt(0) % COLORS.length];
const cleanCo = (c: string) => (c || "").replace(/\s+(Pvt\.?\s*Ltd\.?|Private Limited|Pvt Ltd)\.?$/i, "").trim();
// Mirrors stage_signal in job-outreach-svc's company_fact_extractor, which is
// the only thing that appends a stage to the company bullet.
const STAGE: Record<string, string> = { "early-stage": "Early-stage", growth: "Growth", scale: "Scale-up", mature: "Established" };
const SIGNAL: Record<string, string> = { high: "Strong match", medium: "Good match" };

// Fallback "why" when a lead has no LLM justification yet.
function buildContactReason(lead: Lead): string {
  const tl = (lead.title || "").toLowerCase();
  if (/\b(founder|co-founder|ceo|cto|cfo|coo|chief)\b/.test(tl)) return `As ${lead.company ? `${cleanCo(lead.company)}'s` : "a"} founder or C-suite exec, they own key hires personally.`;
  if (/\bvp\b|vice president/.test(tl)) return "VPs carry direct budget and headcount authority. No committee needed.";
  if (/\bdirector\b/.test(tl)) return "Directors own their team's roadmap and can approve talent without going up the chain.";
  if (/\bhead of\b/.test(tl)) return "Heads of departments set their own priorities and hire directly into their teams.";
  if (/\bmanager\b/.test(tl)) return "Managers are closest to the work. They know exactly what their team is missing and can act fast.";
  return "Their position puts them close to the decision-making on new hires.";
}

// Company logo via our own /api/company-logo (see that route for why it is not
// fetched from a third party directly), falling back to a coloured letter tile.
// Stored domains are sometimes wrapped in prose or markdown by the research
// step ("neurofin.ai. ([neurofin.ai](https://neurofin.ai/))"). The backend now
// cleans them on write; this handles the rows saved before that.
const DOMAIN_RE = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}/;
function bareDomain(d: string | null): string | null {
  const m = (d || "").trim().toLowerCase().replace(/^[a-z]+:\/\//, "").match(DOMAIN_RE);
  return m ? m[0].replace(/^www\./, "") : null;
}

function CompanyLogo({ domain, name, size = 48 }: { domain: string | null; name: string; size?: number }) {
  const co = cleanCo(name);
  const logoUrl = (d: string | null) => {
    const host = bareDomain(d);
    return host ? `/api/company-logo?domain=${encodeURIComponent(host)}` : null;
  };
  const [src, setSrc] = useState<string | null>(logoUrl(domain));
  // Domains resolve after the card mounts (the page now loads before justification
  // finishes, and domains stream in via polling). Without this, the initial null
  // domain sticks and the logo never appears. Re-init the source whenever it arrives.
  useEffect(() => {
    setSrc(logoUrl(domain));
  }, [domain]);
  return (
    <span className="relative inline-block flex-shrink-0" style={{ width: size, height: size }}>
      <span className={`absolute inset-0 rounded-xl ${colOf(co)} text-white flex items-center justify-center font-bold`} style={{ fontSize: Math.round(size * 0.4) }}>
        {(co[0] || "?").toUpperCase()}
      </span>
      {src && (
        <img
          src={src}
          alt=""
          loading="lazy"
          className="absolute inset-0 rounded-xl object-contain bg-white border border-studojo-ink/10"
          style={{ width: size, height: size }}
          onError={() => setSrc(null)}
        />
      )}
    </span>
  );
}

export function FlashCard({ lead, onSelect, actionLabel }: FlashCardProps) {
  const company = cleanCo(lead.company);

  // LinkedIn profile (the "id"), show it on the card and make it clickable.
  const liUrl = lead.linkedin_url || "";
  const liHandle = liUrl
    ? liUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "").replace(/\?.*$/, "")
    : "";

  // The "why": the LLM's per-lead headline first, then the older fit_reason
  // schema, then a reason generated from the title. The first bullet is a
  // company snapshot, not a reason, so it goes in the "about" line instead.
  const j = lead.score?.justification;
  const bullets = j?.bullets ?? [];
  let about = bullets[0] ?? "";
  let stage = "";
  if (about) {
    // The backend appends " · <stage>" when it knows one. Only strip the last
    // segment when it really is a stage; otherwise it is a headcount or city.
    const m = about.match(/\s·\s([^·]+)$/);
    const label = m ? STAGE[(m[1] || "").trim().toLowerCase()] : undefined;
    if (m && label) { stage = label; about = about.slice(0, m.index).trim(); }
  }
  const desc = j?.headline || j?.fit_reason || (bullets.length ? "" : buildContactReason(lead));
  const fit = bullets.length ? bullets.slice(1, 3) : j?.talk_track ? [j.talk_track] : [];
  const signal = SIGNAL[j?.signal_strength ?? ""] ?? "";

  const select = () => {
    capturePostHog("lead_contact_clicked", { lead_id: lead.id });
    onSelect(lead);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${lead.name}, ${lead.title}${company ? ` at ${company}` : ""}. ${actionLabel}`}
      onClick={select}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return; // let the LinkedIn link handle its own keys
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); }
      }}
      className="group relative overflow-hidden rounded-2xl border-2 border-studojo-ink shadow-brutal bg-white p-4 cursor-pointer transition-all motion-safe:hover:-translate-x-[2px] motion-safe:hover:-translate-y-[2px] hover:shadow-brutal-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-studojo-purple-strong/40"
    >
      <div className="flex items-center gap-3">
        <CompanyLogo domain={lead.company_domain} name={lead.company} size={48} />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[15px] text-studojo-ink truncate leading-tight font-satoshi" title={lead.name}>{lead.name}</p>
          <p className="text-sm text-studojo-ink/70 font-medium line-clamp-2 mt-0.5 font-satoshi" title={lead.title}>{lead.title}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        {company && <p className="text-[13px] font-semibold text-studojo-ink truncate font-satoshi">{company}</p>}
        {stage && (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-studojo-purple/10 text-studojo-purple-strong border border-studojo-purple/20 whitespace-nowrap flex-shrink-0 font-satoshi">{stage}</span>
        )}
        {lead.location && <span className="text-[11px] text-studojo-muted truncate font-satoshi">· {lead.location}</span>}
      </div>
      {lead.industry && <p className="text-[11px] text-studojo-muted mt-0.5 truncate font-satoshi">{lead.industry}</p>}
      {about && <p className="text-[11px] text-studojo-muted mt-0.5 line-clamp-2 font-satoshi">{about}</p>}

      {liUrl && (
        <a
          href={liUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => { e.stopPropagation(); capturePostHog("lead_linkedin_opened", { lead_id: lead.id }); }}
          title={liUrl}
          // py-2 with a matching negative margin: a 24px+ tap target without
          // moving the layout, so a near miss does not land on the card.
          className="mt-1 -my-1 py-2 inline-flex items-center gap-1.5 max-w-full text-[12px] font-semibold text-[#0a66c2] hover:underline font-satoshi"
        >
          <FiLinkedin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          <span className="truncate">{liHandle}</span>
          <FiExternalLink className="w-3 h-3 flex-shrink-0 opacity-70" aria-hidden />
          <span className="sr-only">(opens LinkedIn in a new tab)</span>
        </a>
      )}

      <div className="mt-3 pt-3 border-t border-studojo-ink/8">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-[11px] font-bold text-studojo-purple-strong uppercase tracking-wide font-satoshi">Why contact them</p>
          {signal && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-studojo-green-bg text-emerald-800 border border-studojo-green/30 whitespace-nowrap font-satoshi">{signal}</span>
          )}
        </div>
        {desc && <p className="text-[13px] text-studojo-ink leading-snug mb-1.5 font-satoshi line-clamp-3">{desc}</p>}
        {fit.length > 0 && (
          <ul className="space-y-1">
            {fit.map((b, i) => (
              <li key={i} className="text-[12px] text-studojo-ink/90 flex gap-1.5 leading-snug font-satoshi">
                <span className="text-studojo-purple-strong font-bold flex-shrink-0" aria-hidden>▸</span>
                <span className="line-clamp-2">{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 -mx-4 -mb-4 px-4 py-2.5 border-t border-studojo-ink/8 flex items-center justify-between transition-colors group-hover:bg-studojo-purple-strong">
        <span className="text-[12px] font-medium text-studojo-muted group-hover:text-white transition-colors font-satoshi">
          Hiring decision-maker
        </span>
        <span className="text-[12px] font-bold text-studojo-purple-strong group-hover:text-white transition-colors font-satoshi">{actionLabel} →</span>
      </div>
    </div>
  );
}
