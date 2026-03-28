import { FiArrowRight } from "react-icons/fi";

interface BlogCtaBarProps {
  variant?: "inline" | "end";
}

const OUTREACH_URL = "https://studojo.com/outreach";

export function BlogCtaBar({ variant = "inline" }: BlogCtaBarProps) {
  if (variant === "end") {
    return (
      <div className="my-10 rounded-2xl border-2 border-studojo-ink bg-studojo-purple shadow-brutal p-8 text-center">
        <p className="font-['Clash_Display'] text-2xl font-bold text-white mb-2">
          Ready to land your next role?
        </p>
        <p className="font-['Satoshi'] text-white/80 text-sm mb-6 max-w-sm mx-auto">
          Studojo Outreach finds the hiring managers at companies where you'd thrive and handles the introduction for you.
        </p>
        <a
          href={OUTREACH_URL}
          className="inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-white text-studojo-purple font-['Satoshi'] font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Find my leads <FiArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-xl border-2 border-studojo-ink bg-studojo-purple/8 p-5 flex flex-col sm:flex-row items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-['Clash_Display'] text-base font-bold text-studojo-ink mb-0.5">
          Land your next role, faster.
        </p>
        <p className="font-['Satoshi'] text-studojo-muted text-sm">
          Find and contact the right hiring managers, without the cold email guesswork.
        </p>
      </div>
      <a
        href={OUTREACH_URL}
        className="flex-shrink-0 inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-studojo-purple text-white font-['Satoshi'] font-semibold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none whitespace-nowrap"
      >
        Try for free <FiArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

/**
 * Inline HTML version of the CTA — injected into dangerouslySetInnerHTML content
 * when a writer places [studojo-cta] in the blog via Maverick.
 */
export const CTA_INLINE_HTML = `<div data-studojo-cta="rendered" style="margin:2rem 0;padding:1.25rem 1.5rem;background:rgba(139,92,246,0.07);border-radius:0.75rem;border:2px solid #191a23;display:flex;flex-wrap:wrap;align-items:center;gap:1rem;font-family:'Satoshi',sans-serif;"><div style="flex:1;min-width:0;"><p style="font-family:'Clash Display',sans-serif;font-size:1rem;font-weight:700;color:#191a23;margin:0 0 0.25rem 0;">Land your next role, faster.</p><p style="font-size:0.875rem;color:#64748b;margin:0;">Find and contact the right hiring managers, without the cold email guesswork.</p></div><a href="https://studojo.com/outreach" style="flex-shrink:0;display:inline-flex;align-items:center;gap:0.375rem;height:2.5rem;padding:0 1.25rem;border-radius:0.625rem;background:#8b5cf6;color:#fff;font-weight:600;font-size:0.875rem;text-decoration:none;border:2px solid #191a23;box-shadow:2px 2px 0 #191a23;white-space:nowrap;" onmouseover="this.style.transform='translate(2px,2px)';this.style.boxShadow='none'" onmouseout="this.style.transform='';this.style.boxShadow='2px 2px 0 #191a23'">Try for free →</a></div>`;
