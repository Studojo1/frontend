// Step 4: profile. The page drafted from the resume, in a browser frame,
// beside a proof lens that shows the resume line behind every claim. Inline
// edits, a strength meter with a checklist, and Approve lands a rubber stamp.
// Owned by builder B (Your page). Helpers live in ./page/.
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { FiAlertCircle, FiArrowDown } from "react-icons/fi";
import { PROFILE_CHECKS, profileStrength } from "../data";
import { useFlow, useStepBar } from "../flow";
import { useMotionPresets } from "../motion";
import type { ProfileState } from "../types";
import { Badge, cx, FOCUS_RING, LiveRegion, StepHeader } from "../ui";
import { ProfilePage, type EditingBlock } from "./page/profile-page";
import { ABOUT_ID, HEADLINE_ID, nextChecks, NUMBER_HEADLINE, proofAnnouncement, proofTargets } from "./page/profile-logic";
import { ProofLens } from "./page/proof-lens";
import { Strength } from "./page/strength";

const FIRST_CLAIM = "c-proj-1";

export function Profile() {
  const f = useFlow();
  const m = useMotionPresets();
  const profile = f.data.profile;
  const [selected, setSelected] = useState(FIRST_CLAIM);
  const [editing, setEditing] = useState<EditingBlock>(null);
  const [animateStamp, setAnimateStamp] = useState(false);
  const [changedAfterApprove, setChangedAfterApprove] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const advanceTimer = useRef<number | null>(null);
  const strengthRef = useRef<HTMLDivElement>(null);
  const wins = PROFILE_CHECKS.filter((c) => !profile.checks[c.id]).length;

  const targets = useMemo(() => proofTargets(profile), [profile]);

  useEffect(
    () => () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    },
    [],
  );

  const select = (id: string) => {
    if (id === selected) return;
    setSelected(id);
    setAnnounce(proofAnnouncement(targets.get(id)));
  };

  /** Any change to the page text after approval asks for a fresh approval. */
  const applyEdit = (patch: Partial<ProfileState>, block?: "headline" | "about") => {
    const changed = Object.entries(patch).some(([k, v]) => profile[k as keyof ProfileState] !== v);
    const checks = nextChecks(profile, patch, block);
    const unapprove = changed && profile.approved;
    f.update("profile", { ...patch, checks, ...(unapprove ? { approved: false } : {}) });
    if (unapprove) {
      // Search stays locked until the page is approved again.
      f.update("visibility", { search: false });
      setChangedAfterApprove(true);
      setAnimateStamp(false);
    }
  };

  const save = (block: "headline" | "about", text: string) => {
    applyEdit(block === "headline" ? { headline: text } : { about: text }, block);
    setEditing(null);
    setSelected(block === "headline" ? HEADLINE_ID : ABOUT_ID);
    setAnnounce(`${block === "headline" ? "Headline" : "About"} saved.`);
  };

  const addNumber = () => {
    applyEdit({ headline: NUMBER_HEADLINE });
    setSelected(HEADLINE_ID);
    setAnnounce("Headline now carries your 1,200 users.");
  };

  const verified = () => {
    f.update("profile", { collegeVerified: true, checks: { ...profile.checks, "college-email": true } });
    setAnnounce("College email verified. Your page now shows a verified badge.");
  };

  const approve = () => {
    if (advanceTimer.current) return;
    if (profile.approved) {
      f.next();
      return;
    }
    // Bring the page into view first, so the stamp lands where the student is looking.
    const el = scope.current;
    const top = el ? el.getBoundingClientRect().top : 0;
    const headerRoom = window.innerWidth >= 768 ? 165 : 120;
    const offscreen = Boolean(el) && (top < headerRoom - 20 || top > window.innerHeight * 0.45);
    if (offscreen) window.scrollTo({ top: Math.max(0, window.scrollY + top - headerRoom), behavior: m.reduced ? "auto" : "smooth" });
    const lead = offscreen && !m.reduced ? 380 : 0;
    advanceTimer.current = window.setTimeout(() => {
      f.update("profile", { approved: true });
      setAnimateStamp(true);
      setChangedAfterApprove(false);
      setAnnounce("Approved. Your page is stamped: reviewed by you.");
      advanceTimer.current = window.setTimeout(() => {
        advanceTimer.current = null;
        f.next();
      }, m.reduced ? 450 : 1150);
    }, lead);
  };

  const onStampLanded = () => {
    if (!animateStamp || m.reduced || !scope.current) return;
    animate(scope.current, { y: [0, 5, 0], rotate: [0, -0.35, 0] }, { duration: 0.26, ease: "easeOut" });
  };

  useStepBar({
    label: profile.approved ? "Continue" : "Approve page",
    disabled: editing !== null,
    disabledHint: "Save or cancel your edit first.",
    hint: profile.approved
      ? "Approved. Next you choose who can see it."
      : "Approving stamps your page as reviewed. You can still change it later.",
    onPrimary: approve,
  });

  return (
    <div>
      <StepHeader
        title="Your page, drafted from your resume"
        description="Every line has a pink dot. Tap one to see the resume line it came from. Fix anything that does not sound like you, then approve it."
        aside={<Badge kind="sample">Sample resume</Badge>}
      />

      {/* The checklist sits below the page, so point to it from the top. */}
      <button
        type="button"
        onClick={() => strengthRef.current?.scrollIntoView({ block: "start", behavior: m.reduced ? "auto" : "smooth" })}
        className={cx(
          "-mt-2 mb-5 inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-studojo-ink bg-studojo-pink-bg px-4 font-satoshi text-sm font-bold shadow-[2px_2px_0_0_#191a23]",
          FOCUS_RING,
        )}
      >
        Page strength {profileStrength(profile)}%{wins ? `, ${wins} quick win${wins === 1 ? "" : "s"}` : ""}
        <FiArrowDown aria-hidden />
      </button>

      <AnimatePresence initial={false}>
        {changedAfterApprove && !profile.approved ? (
          <motion.p
            key="reapprove"
            variants={m.fade}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="mb-5 flex items-start gap-2 rounded-xl border-2 border-studojo-ink bg-studojo-yellow-bg px-3 py-2 font-satoshi text-sm"
          >
            <FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />
            You changed your page after approving it. Give it one more look, then approve again.
          </motion.p>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-8">
        <div ref={scope}>
          <ProfilePage
            profile={profile}
            targets={targets}
            selected={selected}
            onSelect={select}
            editing={editing}
            onEdit={setEditing}
            onSave={save}
            stamped={profile.approved}
            animateStamp={animateStamp}
            onStampLanded={onStampLanded}
          />
        </div>
        <div className="hidden lg:sticky lg:top-40 lg:block">
          <ProofLens target={targets.get(selected)} />
        </div>
      </div>

      {/* The lens is as tall as the screen, so the checklist sits below the page; the chip up top jumps to it. */}
      <div ref={strengthRef} className="mt-6 scroll-mt-32 sm:mt-8 lg:scroll-mt-44">
        <Strength
          profile={profile}
          onAddNumber={addNumber}
          onEditHeadline={() => setEditing("headline")}
          onEditAbout={() => setEditing("about")}
          onVerified={verified}
        />
      </div>

      <LiveRegion message={announce} />
    </div>
  );
}
