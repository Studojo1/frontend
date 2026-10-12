// Page tab: the preview. Your page in a browser frame through this mission's
// lens, every claim with an evidence pin, and "Preview as Ananya": the Day 4
// follow-up with the page card, the way a hiring manager meets it. Group 4.
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiExternalLink, FiLock, FiMail } from "react-icons/fi";
import { peopleIn } from "../core/derive";
import { useB2C, useMission } from "../core/store";
import { makeDraft, PAGE_URL, PROFILE_DRAFT, STUDENT } from "../data";
import { useMotionPresets } from "../motion";
import type { Person } from "../types";
import { Badge, BrowserFrame, cx, Segmented, SimNote } from "../ui";
import { claimTextOf, LENS_LEAD, lensClaims } from "./page-logic";
import { ProofPin } from "./proof-pin";

type Mode = "page" | "viewer";

/** The hiring manager to preview as: Ananya in jan27, else the first who opened the page. */
export function previewPerson(people: Person[], opened: Person[]): Person | undefined {
  return people.find((p) => p.id === "kitebase") ?? opened[0] ?? people[0];
}

export function PagePreview() {
  const { s } = useB2C();
  const mission = useMission();
  const [mode, setMode] = useState<Mode>("page");
  const views = peopleIn(s);
  const viewer = previewPerson(
    views.map((v) => v.p),
    views.filter((v) => v.pageOpened).map((v) => v.p),
  );
  const items = [
    { id: "page" as const, label: "Your page" },
    ...(viewer ? [{ id: "viewer" as const, label: `As ${viewer.first}` }] : []),
  ];
  return (
    <section aria-labelledby="page-preview-h" className="min-w-0">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-muted">Through the {mission.short} lens</p>
          <h2 id="page-preview-h" className="font-clash text-xl font-semibold text-studojo-ink">Preview</h2>
        </div>
        <Segmented items={items} value={mode} onChange={setMode} label="Preview mode" layoutId="b2c-page-preview-mode" idPrefix="page-preview" size="sm" className="w-full sm:w-auto" />
      </div>
      <div id="page-preview-panel" role="tabpanel" aria-labelledby={`page-preview-tab-${mode}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
            {mode === "viewer" && viewer ? <ViewerPreview viewer={viewer} /> : <PageFrame />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function PageFrame() {
  const { s } = useB2C();
  const mission = useMission();
  const m = useMotionPresets();
  const claims = lensClaims(mission);
  const lead = claims.slice(0, LENS_LEAD);
  const rest = claims.slice(LENS_LEAD);
  return (
    <BrowserFrame url={PAGE_URL} actions={<Badge kind="sample" />} className="relative">
      <div className={cx("relative px-4 pb-6 pt-5 sm:px-6", !s.page.live && "select-none opacity-40 blur-[1px]")} aria-hidden={!s.page.live || undefined}>
        <div className="flex items-center gap-3">
          <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-studojo-ink bg-studojo-pink-bg font-clash text-xl font-semibold shadow-[2px_2px_0_0_#191a23]">
            {PROFILE_DRAFT.initials}
          </span>
          <div className="min-w-0">
            <p className="font-clash text-2xl font-semibold leading-tight">{PROFILE_DRAFT.name}</p>
            <p className="font-satoshi text-sm text-studojo-muted">{PROFILE_DRAFT.meta} · {STUDENT.collegeShort}</p>
          </div>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={s.page.headline} variants={m.fade} initial="hidden" animate="show" className="mt-4 font-clash text-xl font-semibold leading-snug">
            {s.page.headline}
          </motion.p>
        </AnimatePresence>
        <p className="mt-2 font-satoshi text-base leading-relaxed text-studojo-ink">{s.page.about}</p>

        <h3 className="mt-5 flex items-center gap-2 font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-purple-strong">
          Leads for {mission.short}
        </h3>
        <motion.ol layout={!m.reduced} className="mt-2 space-y-2">
          {lead.map((c, i) => (
            <motion.li layout={!m.reduced ? "position" : false} key={c.id} className="rounded-xl border-2 border-studojo-ink bg-studojo-purple-bg/60 p-3">
              <div className="flex items-start gap-2">
                <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-purple font-satoshi text-[11px] font-bold text-white">{i + 1}</span>
                <ProofPin lineIds={c.evidence} className="min-w-0 flex-1">
                  <p className="font-satoshi text-base font-medium leading-snug">{claimTextOf(s.page, c)}</p>
                </ProofPin>
              </div>
            </motion.li>
          ))}
        </motion.ol>
        {rest.length ? (
          <>
            <h3 className="mt-5 font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">Also on the page</h3>
            <motion.ul layout={!m.reduced} className="mt-1 divide-y-2 divide-studojo-ink/10">
              {rest.map((c) => (
                <motion.li layout={!m.reduced ? "position" : false} key={c.id} className="py-2">
                  <ProofPin lineIds={c.evidence}>
                    <p className="pt-1 font-satoshi text-[15px] leading-snug">{claimTextOf(s.page, c)}</p>
                  </ProofPin>
                </motion.li>
              ))}
            </motion.ul>
          </>
        ) : null}
      </div>
      {!s.page.live ? (
        <div className="absolute inset-x-0 bottom-0 top-12 flex items-center justify-center p-4">
          <p className="flex max-w-xs items-center gap-2 rounded-2xl border-2 border-studojo-ink bg-white px-4 py-3 font-satoshi text-sm font-bold shadow-brutal">
            <FiLock aria-hidden className="shrink-0" /> Private. This link opens for nobody but you.
          </p>
        </div>
      ) : null}
    </BrowserFrame>
  );
}

function ViewerPreview({ viewer }: { viewer: Person }) {
  const { s } = useB2C();
  const mission = useMission();
  const live = s.page.live;
  const draft = makeDraft(viewer, "follow", mission.target, { pageLive: live });
  const [hi, line, ...after] = draft.paragraphs;
  const proof = lensClaims(mission).slice(0, 2).map((c) => claimTextOf(s.page, c));
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal-lg">
      <div className="flex items-center gap-2 border-b-2 border-studojo-ink bg-studojo-surface-muted px-3 py-2 font-satoshi text-xs text-studojo-muted">
        <FiMail aria-hidden className="shrink-0" />
        <span className="truncate">
          {viewer.first} {viewer.last}'s inbox, the Day 4 follow-up
        </span>
        <span className="ml-auto shrink-0">
          <Badge kind="sample" />
        </span>
      </div>
      <div className="px-4 py-4 font-satoshi text-[15px] leading-relaxed text-studojo-ink sm:px-5">
        <p className="text-xs text-studojo-muted">
          From {STUDENT.name} &lt;{s.gmail.address}&gt; to {viewer.first} at {viewer.company}
        </p>
        <p className="mt-1 font-bold">{draft.subject}</p>
        <p className="mt-3">{hi}</p>
        <p className="mt-2">{line}</p>
        {live ? (
          <div className="mt-3 flex items-stretch overflow-hidden rounded-2xl border-2 border-studojo-ink bg-white shadow-[3px_3px_0_0_#191a23]">
            <span aria-hidden className="w-2 shrink-0 bg-studojo-pink" />
            <div className="min-w-0 flex-1 p-3">
              <div className="flex items-center gap-2.5">
                <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-pink-bg font-clash text-sm font-semibold">
                  {PROFILE_DRAFT.initials}
                </span>
                <div className="min-w-0">
                  <p className="font-clash text-base font-semibold">{PROFILE_DRAFT.name}</p>
                  <p className="truncate text-xs text-studojo-muted">{PROFILE_DRAFT.meta}</p>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium leading-snug">{s.page.headline}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {proof.map((t) => (
                  <span key={t} className="rounded-full border-2 border-studojo-ink bg-studojo-yellow-bg px-2 py-0.5 text-[11px] font-bold leading-snug">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#be185d]">
                <FiExternalLink aria-hidden className="shrink-0" />
                <span className="truncate">{PAGE_URL}</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-3 flex items-center gap-2 rounded-2xl border-2 border-dashed border-studojo-ink/40 px-3 py-3 text-sm text-studojo-muted">
            <FiLock aria-hidden className="shrink-0" /> No page card while your page is private. This follow-up goes without the link.
          </p>
        )}
        {after.map((p) => (
          <p key={p} className="mt-3">{p}</p>
        ))}
        <p className="mt-3">{draft.signoff}</p>
        <p>{STUDENT.first}</p>
      </div>
      <p className="border-t-2 border-studojo-ink/10 px-4 py-2 font-satoshi text-xs text-studojo-muted sm:px-5">
        The card leads with your top {mission.short} lens claims. Reorder them in Claims. <SimNote kind="sample" />
      </p>
    </div>
  );
}
