import { useState } from "react";
import { useNavigate } from "react-router";
import { capturePostHog } from "~/lib/posthog";
import type { Lead } from "~/lib/outreach/types";

interface FlashCardProps {
  lead: Lead;
}

const COLORS = ["bg-studojo-purple", "bg-studojo-pink", "bg-studojo-green", "bg-studojo-orange", "bg-studojo-teal", "bg-indigo-500", "bg-rose-500", "bg-amber-500"];
const colOf = (n: string) => COLORS[(n || "x").charCodeAt(0) % COLORS.length];
const cleanCo = (c: string) => (c || "").replace(/\s+(Pvt\.?\s*Ltd\.?|Private Limited|Pvt Ltd)\.?$/i, "").trim();
const STAGE: Record<string, string> = { "early-stage": "Early-stage", growth: "Growth", seed: "Seed", "series-a": "Series A", "series-b": "Series B" };

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

// Company logo: Clearbit (crisp for known brands) → Google favicon (covers
// obscure startups) → coloured letter tile. Browser-side only, no Apollo.
function CompanyLogo({ domain, name, size = 48 }: { domain: string | null; name: string; size?: number }) {
  const co = cleanCo(name);
  const [src, setSrc] = useState<string | null>(domain ? `https://logo.clearbit.com/${domain}` : null);
  const [step, setStep] = useState(0);
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
          onError={() => {
            if (step === 0 && domain) { setStep(1); setSrc(`https://www.google.com/s2/favicons?sz=128&domain=${domain}`); }
            else setSrc(null);
          }}
        />
      )}
    </span>
  );
}

export function FlashCard({ lead }: FlashCardProps) {
  const navigate = useNavigate();
  const company = cleanCo(lead.company);

  // Build the "why" — prefer LLM bullets, then fit_reason, then a generated reason.
  const j = lead.score?.justification;
  const bullets = j?.bullets ?? [];
  let desc = "";
  let stage = "";
  let fit: string[] = [];
  if (bullets.length) {
    desc = bullets[0];
    const m = desc.match(/\s·\s([^·]+)$/);
    if (m) { stage = STAGE[(m[1] || "").trim().toLowerCase()] || ""; desc = desc.slice(0, m.index).trim(); }
    fit = bullets.slice(1, 3);
  } else if (j?.fit_reason) {
    desc = j.fit_reason;
    if (j.talk_track) fit = [j.talk_track];
  } else {
    desc = buildContactReason(lead);
  }

  return (
    <div
      onClick={() => { capturePostHog("lead_contact_clicked", { company: lead.company }); navigate("/outreach/enrichment"); }}
      className="group relative overflow-hidden rounded-2xl border-2 border-studojo-ink shadow-brutal bg-white p-4 cursor-pointer transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg"
    >
      <div className="flex items-center gap-3">
        <CompanyLogo domain={lead.company_domain} name={lead.company} size={48} />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[15px] text-studojo-ink truncate leading-tight font-satoshi">{lead.name}</p>
          <p className="text-sm text-studojo-ink/70 font-medium truncate mt-0.5 font-satoshi">{lead.title}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        {company && <p className="text-[13px] font-semibold text-studojo-ink truncate font-satoshi">{company}</p>}
        {stage && (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-studojo-purple/10 text-studojo-purple border border-studojo-purple/20 whitespace-nowrap flex-shrink-0 font-satoshi">{stage}</span>
        )}
        {lead.location && <span className="text-[11px] text-studojo-muted truncate font-satoshi">· {lead.location}</span>}
      </div>
      {lead.industry && <p className="text-[11px] text-studojo-muted mt-0.5 truncate font-satoshi">{lead.industry}</p>}

      <div className="mt-3 pt-3 border-t border-studojo-ink/8">
        <p className="text-[11px] font-bold text-studojo-purple uppercase tracking-wide mb-1.5 font-satoshi">Why contact them</p>
        {desc && <p className="text-[13px] text-studojo-ink leading-snug mb-1.5 font-satoshi line-clamp-3">{desc}</p>}
        {fit.length > 0 && (
          <ul className="space-y-1">
            {fit.map((b, i) => (
              <li key={i} className="text-[12px] text-studojo-ink/90 flex gap-1.5 leading-snug font-satoshi">
                <span className="text-studojo-purple font-bold flex-shrink-0">▸</span>
                <span className="line-clamp-2">{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 -mx-4 -mb-4 px-4 py-2.5 border-t border-studojo-ink/8 flex items-center justify-between transition-colors group-hover:bg-studojo-purple">
        <span className="text-[12px] font-medium text-studojo-muted group-hover:text-white transition-colors font-satoshi">
          {lead.email_verified ? "Verified email" : "Hiring decision-maker"}
        </span>
        <span className="text-[12px] font-bold text-studojo-purple group-hover:text-white transition-colors font-satoshi">Contact them →</span>
      </div>
    </div>
  );
}
