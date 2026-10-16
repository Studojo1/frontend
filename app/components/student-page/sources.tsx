// The proof report: every claim on the page, grouped by the resume section it
// came from, each opening to the exact resume lines behind it. The seal and the
// bar are green only when every claim matched. It is a match against the
// student's own resume, never a background check, and the note says so.
import { useId, useState } from "react";
import { Card, Icon, LineList, Meter, Seal, Section } from "./atoms";
import type { ClaimView, ProofView, SourcesView } from "./profile-view";

function note(proof: ProofView, first: string, poss: string): string {
  const tail = `Line numbers count from the top of that resume, and contact details are never shown. This is a match against ${poss} own resume, not a background or employment check.`;
  if (proof.all) return `Every claim on this page was matched to the resume ${first} shared with Studojo. Open one to read the exact lines. ${tail}`;
  const missing = proof.total - proof.matched;
  const which = missing === 1 ? "One claim could not be tied to a line and is" : `${missing} claims could not be tied to a line and are`;
  return `Studojo looked for each claim on this page in the resume ${first} shared. ${which} marked No matching line. Open a matched claim to read the exact lines. ${tail}`;
}

function ClaimRow({ c, panelId, open, onToggle, poss }: { c: ClaimView; panelId: string; open: boolean; onToggle: () => void; poss: string }) {
  if (!c.ref) {
    return (
      <li className="flex items-start gap-3 px-5 py-3.5 sm:px-6">
        <span className="mt-[1px] text-neutral-500">
          <Icon name="circle" size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-pretty text-[15.5px] leading-snug text-neutral-600">{c.text}</span>
          <span className="mt-0.5 block text-[13px] text-neutral-600">No matching line</span>
        </span>
      </li>
    );
  }
  return (
    <li>
      <button type="button" data-claim="" aria-expanded={open} aria-controls={panelId} onClick={onToggle} className="group flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-lilac-50 sm:px-6">
        <span className="mt-[1px] text-studojo-green">
          <Icon name="checkCircle" size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-pretty text-[15.5px] leading-snug text-studojo-ink">{c.text}</span>
          <span className="mt-0.5 block text-[12.5px] font-medium text-neutral-600 transition-colors group-hover:text-studojo-purple-strong group-aria-expanded:text-studojo-purple-strong">{c.ref.label}</span>
        </span>
        <span className="mt-[1px] text-neutral-500 transition-colors group-hover:text-studojo-purple-strong">
          <Icon name="chevron" size={18} className="sp-chev" />
        </span>
      </button>
      <div id={panelId} hidden={!open} className="px-5 pb-5 pl-[52px] sm:px-6 sm:pl-[56px]">
        <div className="rounded-2xl border border-lilac-200 bg-lilac-50 px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-studojo-purple-strong">
            <Icon name="file" size={14} />
            <span>From {poss} resume</span>
          </p>
          <div className="mt-2.5">
            <LineList lines={c.ref.lines} />
          </div>
        </div>
      </div>
    </li>
  );
}

export function Proof({ sources, proof, first, poss, updated }: { sources: SourcesView; proof: ProofView; first: string; poss: string; updated: string }) {
  const base = useId();
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const matched = sources.groups.flatMap((g) => g.claims.filter((c) => c.ref));
  const panelId = (n: number) => `${base}-claim-${n}`;
  const allOpen = matched.length > 0 && matched.every((c) => open.has(c.n));
  const toggleOne = (n: number) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(matched.map((c) => c.n)));
  return (
    <Section id="proof" title="Checked against the resume">
      <Card>
        <div className={`flex flex-col gap-4 border-b border-lilac-line px-5 py-5 sm:flex-row sm:items-center sm:gap-5 sm:px-6 ${proof.all ? "bg-ok-soft" : "bg-neutral-50"}`}>
          <Seal all={proof.all} size={52} />
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-bold text-studojo-ink">{proof.text}</p>
            {updated && <p className="mt-0.5 text-[13px] text-neutral-600">Updated {updated}</p>}
            <div className="mt-3 max-w-[420px]">
              <Meter matched={proof.matched} total={proof.total} />
            </div>
            <p className="mt-3 max-w-[70ch] text-pretty text-[14px] leading-relaxed text-neutral-700">{note(proof, first, poss)}</p>
          </div>
          {matched.length > 0 && (
            <button
              type="button"
              data-toggle=""
              data-all=""
              aria-expanded={allOpen}
              aria-controls={matched.map((c) => panelId(c.n)).join(" ")}
              onClick={toggleAll}
              className="inline-flex min-h-[44px] items-center gap-1.5 self-start rounded-full border border-lilac-line bg-white px-3.5 text-[13.5px] font-medium text-studojo-ink transition-colors hover:border-lilac-300 hover:bg-lilac-50 sm:min-h-[36px] sm:self-center"
            >
              <span>{allOpen ? "Close all" : "Open all"}</span>
              <span className="sr-only"> sources</span>
              <Icon name="chevron" size={14} className="sp-chev opacity-70" />
            </button>
          )}
        </div>
        {sources.groups.map((g, gi) => {
          const gid = `${base}-group-${gi}`;
          return (
            <div key={g.label} role="group" aria-labelledby={gid} className="border-t border-lilac-line first:border-t-0">
              <p id={gid} className="bg-lilac-50/60 px-5 pb-1.5 pt-3 text-[12.5px] font-medium uppercase tracking-[0.06em] text-neutral-600 sm:px-6">
                {g.label}
              </p>
              <ul role="list" className="divide-y divide-lilac-line">
                {g.claims.map((c) => (
                  <ClaimRow key={c.n} c={c} panelId={panelId(c.n)} open={open.has(c.n)} onToggle={() => toggleOne(c.n)} poss={poss} />
                ))}
              </ul>
            </div>
          );
        })}
      </Card>
    </Section>
  );
}
