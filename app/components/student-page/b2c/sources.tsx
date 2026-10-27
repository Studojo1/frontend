// PROFILE-V2 (27 Oct 2026): the proof report in the site's look, for studojo.pro only (b2c/profile.css). The same
// words and rules as the classic one (../sources.tsx, kept for studojo.com): every claim on the page, grouped by the
// resume section it came from, each opening to the exact resume lines behind it; the seal and the bar green only when
// every claim matched; a match against the student's own resume, never a background check, and the note says so.
import { useId, useState } from "react";
import { Icon, Seal } from "../atoms";
import type { ClaimView, ProofView, SourcesView } from "../profile-view";
import { Card, LineList, Meter, Section } from "./atoms";

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
      <li className="pv-claim pv-miss">
        <span className="pv-claim-ico">
          <Icon name="circle" size={20} />
        </span>
        <span className="pv-claim-text">
          <span className="pv-claim-t">{c.text}</span>
          <span className="pv-claim-ref">No matching line</span>
        </span>
      </li>
    );
  }
  return (
    <li>
      <button type="button" data-claim="" aria-expanded={open} aria-controls={panelId} onClick={onToggle} className="pv-claim">
        <span className="pv-claim-ico">
          <Icon name="checkCircle" size={20} />
        </span>
        <span className="pv-claim-text">
          <span className="pv-claim-t">{c.text}</span>
          <span className="pv-claim-ref">{c.ref.label}</span>
        </span>
        <span className="pv-claim-chev">
          <Icon name="chevron" size={18} className="sp-chev" />
        </span>
      </button>
      <div id={panelId} hidden={!open} className="pv-claim-panel">
        <div className="pv-panel">
          <p className="pv-panel-cap">
            <Icon name="file" size={14} />
            <span>From {poss} resume</span>
          </p>
          <LineList lines={c.ref.lines} />
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
        <div className={proof.all ? "pv-proof-head pv-all" : "pv-proof-head"}>
          <Seal all={proof.all} size={52} />
          <div className="pv-proof-text">
            <p className="pv-proof-title">{proof.text}</p>
            {updated && <span className="pv-mono">Updated {updated}</span>}
            <div className="pv-proof-meter">
              <Meter matched={proof.matched} total={proof.total} />
            </div>
            <p className="pv-proof-note">{note(proof, first, poss)}</p>
          </div>
          {matched.length > 0 && (
            <button
              type="button"
              data-toggle=""
              data-all=""
              aria-expanded={allOpen}
              aria-controls={matched.map((c) => panelId(c.n)).join(" ")}
              onClick={toggleAll}
              className="pv-ghost"
            >
              <span>{allOpen ? "Close all" : "Open all"}</span>
              <span className="pv-sr"> sources</span>
              <Icon name="chevron" size={14} className="sp-chev" />
            </button>
          )}
        </div>
        {sources.groups.map((g, gi) => {
          const gid = `${base}-group-${gi}`;
          return (
            <div key={g.label} role="group" aria-labelledby={gid} className="pv-pgroup">
              <p id={gid} className="pv-label pv-pgroup-cap">
                {g.label}
              </p>
              <ul role="list" className="pv-list pv-rows">
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
