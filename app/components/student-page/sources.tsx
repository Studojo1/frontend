// Sources: every claim on the page, numbered and grouped by the resume section
// it came from, each opening to its exact lines. One summary line says how many
// matched; a filled check only when all of them did. It is a match against the
// student's own resume, never a background check, and the copy says so.
import { useId, useState } from "react";
import { Chevron, LineList, RingIcon, Section, SummaryMark, TextToggle } from "./atoms";
import type { ClaimView, ProofView, SourcesView } from "./profile-view";

function note(proof: ProofView, first: string, poss: string): string {
  const tail = `Line numbers count from the top of that resume, and contact details are never shown. This is a match against ${poss} own resume, not a background or employment check.`;
  if (proof.all) return `Each claim on this page was matched to the resume ${first} provided. Open one to read the exact lines. ${tail}`;
  const missing = proof.total - proof.matched;
  const which = missing === 1 ? "One claim could not be tied to a line and is" : `${missing} claims could not be tied to a line and are`;
  return `Studojo looked for each claim on this page in the resume ${first} provided. ${which} marked No matching line. Open a matched claim to read the exact lines. ${tail}`;
}

const CITE_HOVER = "transition-colors group-hover:text-studojo-purple-strong group-aria-expanded:text-studojo-purple-strong";

function ClaimRow({ c, panelId, open, onToggle }: { c: ClaimView; panelId: string; open: boolean; onToggle: () => void }) {
  const grid = "grid w-full grid-cols-[22px_minmax(0,1fr)] gap-x-3 py-3.5 text-left sm:grid-cols-[22px_minmax(0,1fr)_auto]";
  const cite = c.ref ? (
    <>
      {c.ref.short}
      <Chevron />
    </>
  ) : (
    <>
      <RingIcon />
      No matching line
    </>
  );
  const cells = (
    <>
      <span className="pt-px text-[12.5px] leading-6 tabular-nums text-neutral-500">{c.n}</span>
      <span className="min-w-0">
        <span className={`block text-[15px] leading-6 ${c.matched ? "text-studojo-ink" : "text-neutral-600"}`}>{c.text}</span>
        <span className={`mt-0.5 flex items-center gap-1.5 text-[12.5px] font-medium leading-5 text-neutral-500 sm:hidden ${CITE_HOVER}`}>{cite}</span>
      </span>
      <span className={`hidden h-6 items-center justify-end gap-1.5 whitespace-nowrap text-[12.5px] font-medium text-neutral-500 sm:flex ${CITE_HOVER}`}>{cite}</span>
    </>
  );
  if (!c.ref) {
    return (
      <li className="border-t border-neutral-100 first:border-t-0">
        <div className={grid}>{cells}</div>
      </li>
    );
  }
  return (
    <li className="border-t border-neutral-100 first:border-t-0">
      <button type="button" data-claim="" data-row="" aria-expanded={open} aria-controls={panelId} onClick={onToggle} className={`group ${grid}`}>
        {cells}
      </button>
      <div id={panelId} hidden={!open} className="pb-4 pl-[34px]">
        <LineList lines={c.ref.lines} />
      </div>
    </li>
  );
}

export function Sources({ sources, proof, first, poss, updated }: { sources: SourcesView; proof: ProofView; first: string; poss: string; updated: string }) {
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
    <Section id="sources" label="Sources" labelTop={8}>
      <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-6">
        <p className="flex items-start gap-2 text-[15px] font-medium leading-6 text-studojo-ink sm:col-start-1 sm:row-start-1">
          <span className="mt-1">
            <SummaryMark all={proof.all} />
          </span>
          <span>
            {proof.text}
            {updated && (
              <>
                <span className="sr-only">. </span>
                <span className="block text-[13px] font-normal leading-5 text-neutral-500">Updated {updated}</span>
              </>
            )}
          </span>
        </p>
        <p className="row-start-2 mt-3 max-w-[36em] text-[14px] leading-[1.6] text-neutral-600 sm:col-span-2 sm:row-start-2">{note(proof, first, poss)}</p>
        {matched.length > 0 && (
          <div className="row-start-3 mt-3 sm:col-start-2 sm:row-start-1 sm:mt-0 sm:justify-self-end">
            <TextToggle all open={allOpen} controls={matched.map((c) => panelId(c.n)).join(" ")} onClick={toggleAll} className="sm:text-[12.5px]">
              <span>{allOpen ? "Close all" : "Open all"}</span>
              <span className="sr-only"> sources</span>
            </TextToggle>
          </div>
        )}
      </div>
      <div className="mt-6 sm:mt-7">
        {sources.groups.map((g, gi) => {
          const gid = `${base}-group-${gi}`;
          return (
            <div key={g.label} role="group" aria-labelledby={gid} className="mt-6 first:mt-0">
              <p id={gid} className="mb-1 text-[13px] font-medium text-neutral-600">
                {g.label}
              </p>
              <ol role="list" className="border-t border-neutral-200">
                {g.claims.map((c) => (
                  <ClaimRow key={c.n} c={c} panelId={panelId(c.n)} open={open.has(c.n)} onToggle={() => toggleOne(c.n)} />
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
