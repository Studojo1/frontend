// Page tab: the headline and every claim, in this mission's lens order.
// Edit runs the evidence check; arrows (or Alt+Up and Alt+Down) reorder the
// lens; Ask hands the claim to Senpai. Group 4.
import { useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { FiArrowDown, FiArrowUp, FiEdit2, FiMessageCircle, FiZap } from "react-icons/fi";
import { chipFor, useAgent } from "../core/engine";
import { useB2C, useMission } from "../core/store";
import { CLAIM_SECTION_LABEL, type ProfileClaim } from "../data";
import { SPRING_SNAP, useMotionPresets } from "../motion";
import { Badge, Button, Card, cx, FOCUS_RING, IconButton, Kbd, LiveRegion, POINTER_FINE } from "../ui";
import { ClaimEditor } from "./claim-editor";
import { claimTextOf, LENS_LEAD, lensClaims, move } from "./page-logic";
import { ProofPin } from "./proof-pin";

const short = (t: string) => (t.length > 28 ? `${t.slice(0, 26).trimEnd()}...` : t);

export function PageClaims() {
  const { s, dispatch } = useB2C();
  const mission = useMission();
  const agent = useAgent();
  const m = useMotionPresets();
  const [editing, setEditing] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  // The preview already shows every claim, so this list opens on the ones that lead the page.
  const [showAll, setShowAll] = useState(false);
  const claims = lensClaims(mission);
  const order = claims.map((c) => c.id);

  const reorder = (c: ProfileClaim, dir: -1 | 1) => {
    const next = move(order, c.id, dir);
    if (next === order) return;
    dispatch({ type: "UPDATE_MISSION", id: mission.id, patch: { lens: next } });
    const pos = next.indexOf(c.id) + 1;
    setAnnounce(`"${short(claimTextOf(s.page, c))}" is now ${pos} of ${next.length}${pos <= LENS_LEAD ? ", leading the page" : ""}.`);
  };

  const onRowKey = (e: KeyboardEvent, c: ProfileClaim) => {
    if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    reorder(c, e.key === "ArrowUp" ? -1 : 1);
  };

  const ask = (c: ProfileClaim) => {
    const chip = chipFor.claim(c.id, short(claimTextOf(s.page, c)));
    dispatch({ type: "FOCUS", item: chip });
    agent.open({ attach: chip });
  };

  return (
    <section aria-labelledby="page-claims-h">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-muted">Lens order for {mission.short}</p>
          <h2 id="page-claims-h" className="font-clash text-xl font-semibold text-studojo-ink">Reorder for this lens</h2>
        </div>
        <p className={cx("font-satoshi text-xs text-studojo-muted", POINTER_FINE)}>
          <Kbd>Alt</Kbd> + <Kbd>↑</Kbd> <Kbd>↓</Kbd> to reorder
        </p>
      </div>

      <HeadlineRow />

      <Card pad="none" shadow="sm" className="mt-3">
        <ol className="divide-y-2 divide-studojo-ink/10">
          {(showAll ? claims : claims.slice(0, LENS_LEAD)).map((c, i) => {
            const text = claimTextOf(s.page, c);
            const edited = s.page.claimText[c.id] !== undefined;
            const lead = i < LENS_LEAD;
            return (
              <motion.li
                key={c.id}
                layout={m.reduced ? false : "position"}
                transition={SPRING_SNAP}
                onKeyDown={(e) => onRowKey(e, c)}
                className={cx("relative px-3 py-3 sm:px-4", lead && "bg-studojo-purple-bg/40")}
              >
                {editing === c.id ? (
                  <ClaimEditor
                    label={`Edit claim, ${CLAIM_SECTION_LABEL[c.section]}`}
                    value={text}
                    lineIds={c.evidence}
                    onCancel={() => setEditing(null)}
                    onAsk={() => {
                      setEditing(null);
                      ask(c);
                    }}
                    onSave={(t) => {
                      const next = { ...s.page.claimText };
                      if (t === c.text) delete next[c.id];
                      else next[c.id] = t;
                      dispatch({ type: "SET_PAGE", patch: { claimText: next }, note: `Edited a page claim: ${short(t)} (checked against your resume)` });
                      setEditing(null);
                      setAnnounce("Saved. Every word is backed by your resume.");
                    }}
                  />
                ) : (
                  <div className="flex items-start gap-3">
                    <span
                      aria-label={`Position ${i + 1}${lead ? ", leads the page" : ""}`}
                      className={cx(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink font-satoshi text-xs font-bold tabular-nums",
                        lead ? "bg-studojo-purple text-white" : "bg-white text-studojo-ink",
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-satoshi text-[11px] font-bold uppercase tracking-wide text-studojo-muted">
                        {CLAIM_SECTION_LABEL[c.section]}
                        {edited ? <Badge kind="neutral" className="ml-2 normal-case">Edited by you</Badge> : null}
                      </p>
                      <p className="mt-0.5 font-satoshi text-base leading-snug text-studojo-ink">{text}</p>
                      <div className="mt-1.5 flex flex-wrap items-start gap-1.5">
                        <ProofPin lineIds={c.evidence} />
                        <Button size="sm" variant="ghost" icon={<FiEdit2 />} onClick={() => setEditing(c.id)} className="min-h-8 px-2 text-xs" aria-label={`Edit: ${short(text)}`}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" icon={<FiMessageCircle />} onClick={() => ask(c)} className="min-h-8 px-2 text-xs" aria-label={`Ask Senpai about: ${short(text)}`}>
                          Ask
                        </Button>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <IconButton size="sm" label={`Move up: ${short(text)}`} icon={<FiArrowUp />} disabled={i === 0} onClick={() => reorder(c, -1)} />
                      <IconButton size="sm" label={`Move down: ${short(text)}`} icon={<FiArrowDown />} disabled={i === claims.length - 1} onClick={() => reorder(c, 1)} />
                    </div>
                  </div>
                )}
              </motion.li>
            );
          })}
        </ol>
      </Card>
      {claims.length > LENS_LEAD ? (
        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((x) => !x)}
          className={cx("mt-2 min-h-10 rounded-lg px-1 font-satoshi text-sm font-bold text-studojo-purple-strong underline underline-offset-4", FOCUS_RING)}
        >
          {showAll ? `Show only the top ${LENS_LEAD}` : `Show all ${claims.length} claims`}
        </button>
      ) : null}
      <p className="mt-2 font-satoshi text-xs text-studojo-muted">
        The top {LENS_LEAD} lead the page when someone opens it from a {mission.short} email. Your other missions keep their own order.
      </p>
      <LiveRegion message={announce} />
    </section>
  );
}

function HeadlineRow() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const [editing, setEditing] = useState(false);
  const punchier = () => {
    agent.open({ focus: false });
    agent.start("F9");
  };
  return (
    <Card pad="sm" shadow="sm">
      {editing ? (
        <ClaimEditor
          label="Edit headline"
          value={s.page.headline}
          lineIds={[]}
          onCancel={() => setEditing(false)}
          onAsk={() => {
            setEditing(false);
            punchier();
          }}
          onSave={(t) => {
            dispatch({ type: "SET_PAGE", patch: { headline: t }, note: "Edited your headline (checked against your resume)" });
            setEditing(false);
          }}
        />
      ) : (
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1 basis-60">
            <p className="font-satoshi text-[11px] font-bold uppercase tracking-wide text-studojo-muted">Headline</p>
            <p className="mt-0.5 font-clash text-lg font-semibold leading-snug text-studojo-ink">{s.page.headline}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="secondary" icon={<FiEdit2 />} onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button size="sm" icon={<FiZap />} onClick={punchier} disabled={!!s.page.pendingHeadline}>
              Make it punchier
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
