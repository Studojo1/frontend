// The drafted Studojo page inside a browser frame: identity card, editable
// headline and about, and every claim with its evidence dot. The stamp lands
// on top when the student approves. Owned by builder B (Your page).
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheckCircle, FiEdit2 } from "react-icons/fi";
import { CLAIM_SECTION_LABEL, PROFILE_DRAFT, STUDENT, type ClaimSection, type ProfileClaim } from "../../data";
import { useMotionPresets } from "../../motion";
import type { ProfileState } from "../../types";
import { Badge, BrowserFrame, Button } from "../../ui";
import { InlineEdit } from "./inline-edit";
import { ClaimButton, InlineProof } from "./profile-claims";
import { ABOUT_ID, ABOUT_MAX, HEADLINE_ID, HEADLINE_MAX, type ProofTarget } from "./profile-logic";
import { Stamp } from "./stamp";

export type EditingBlock = "headline" | "about" | null;

const SECTION_ORDER: ClaimSection[] = ["projects", "experience", "skills", "intro", "more"];
const SECTION_TITLE: Record<ClaimSection, string> = { ...CLAIM_SECTION_LABEL, intro: "Education" };

export interface ProfilePageProps {
  profile: ProfileState;
  targets: Map<string, ProofTarget>;
  selected: string;
  onSelect: (id: string) => void;
  editing: EditingBlock;
  onEdit: (b: EditingBlock) => void;
  onSave: (b: "headline" | "about", text: string) => void;
  /** Show the stamp; animateStamp plays the landing. */
  stamped: boolean;
  animateStamp: boolean;
  onStampLanded: () => void;
}

export function ProfilePage(p: ProfilePageProps) {
  const m = useMotionPresets();
  const { profile, targets, selected, onSelect, editing } = p;
  const headline = targets.get(HEADLINE_ID)!;
  const about = targets.get(ABOUT_ID)!;

  return (
    <BrowserFrame url={PROFILE_DRAFT.url} actions={<span className="hidden sm:inline-flex"><Badge kind="sample" /></span>}>
      <div className="relative px-3 pb-6 pt-5 sm:px-6 sm:pt-6">
        {/* Identity card */}
        <div className="flex items-center gap-3 px-2.5 sm:gap-4">
          <span
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-studojo-ink bg-studojo-pink-bg font-clash text-xl font-semibold shadow-[2px_2px_0_0_#191a23] sm:h-16 sm:w-16 sm:text-2xl"
          >
            {PROFILE_DRAFT.initials}
          </span>
          <div className="min-w-0">
            <h2 className="font-clash text-2xl font-semibold leading-tight sm:text-[1.75rem]">{PROFILE_DRAFT.name}</h2>
            <p className="font-satoshi text-sm text-studojo-muted">{PROFILE_DRAFT.meta}</p>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 font-satoshi text-sm font-medium text-studojo-ink">
              {STUDENT.collegeShort}
              <AnimatePresence initial={false}>
                {profile.collegeVerified ? (
                  <motion.span key="v" variants={m.pop} initial="hidden" animate="show" exit="hidden">
                    <Badge kind="success" icon={<FiCheckCircle />}>Verified college</Badge>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="mt-5">
          {editing === "headline" ? (
            <InlineEdit
              label="Headline"
              value={profile.headline}
              maxLength={HEADLINE_MAX}
              onSave={(t) => p.onSave("headline", t)}
              onCancel={() => p.onEdit(null)}
            />
          ) : (
            <EditableBlock target={headline} selected={selected === HEADLINE_ID} onSelect={onSelect} onEdit={() => p.onEdit("headline")} editLabel="Edit headline" reviewed={p.stamped} order={0}>
              <span className="block font-clash text-xl font-semibold leading-snug sm:text-2xl">{profile.headline}</span>
            </EditableBlock>
          )}
        </div>

        {/* About */}
        <div className="mt-3">
          {editing === "about" ? (
            <InlineEdit
              label="About"
              multiline
              value={profile.about}
              maxLength={ABOUT_MAX}
              minLength={30}
              onSave={(t) => p.onSave("about", t)}
              onCancel={() => p.onEdit(null)}
            />
          ) : (
            <EditableBlock target={about} selected={selected === ABOUT_ID} onSelect={onSelect} onEdit={() => p.onEdit("about")} editLabel="Edit about" reviewed={p.stamped} order={1}>
              <span className="block font-satoshi text-base leading-relaxed text-studojo-ink">{profile.about}</span>
            </EditableBlock>
          )}
        </div>

        {/* Claims, by section */}
        <div className="mt-5 space-y-4">
          {SECTION_ORDER.map((section) => {
            const claims = (PROFILE_DRAFT.claims as ProfileClaim[]).filter((c) => c.section === section);
            if (!claims.length) return null;
            return (
              <section key={section} aria-label={SECTION_TITLE[section]}>
                <h3 className="mb-1 px-2.5 font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">
                  {SECTION_TITLE[section]}
                </h3>
                <ul className="space-y-1">
                  {claims.map((c) => {
                    const t = targets.get(c.id)!;
                    const on = selected === c.id;
                    return (
                      <li key={c.id}>
                        <ClaimButton target={t} selected={on} onSelect={onSelect} reviewed={p.stamped} order={2 + PROFILE_DRAFT.claims.indexOf(c)}>
                          <span className="font-satoshi text-base leading-snug">{c.text}</span>
                        </ClaimButton>
                        <InlineProof target={t} open={on} />
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {p.stamped ? (
          <div className="pointer-events-none absolute right-2 top-[5.5rem] h-[4.5rem] w-32 origin-top-right scale-[0.85] sm:right-6 sm:top-4 sm:h-28 sm:w-52 sm:scale-100">
            <Stamp animateIn={p.animateStamp} onLanded={p.onStampLanded} />
          </div>
        ) : null}
      </div>
    </BrowserFrame>
  );
}

interface EditableBlockProps {
  target: ProofTarget;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: () => void;
  editLabel: string;
  children: ReactNode;
  reviewed?: boolean;
  order?: number;
}

/** Headline or about: inspectable like a claim, plus an Edit button. */
function EditableBlock({ target, selected, onSelect, onEdit, editLabel, children, reviewed, order }: EditableBlockProps) {
  return (
    <div>
      <div className="flex items-start gap-1">
        <ClaimButton target={target} selected={selected} onSelect={onSelect} className="flex-1" reviewed={reviewed} order={order}>
          {children}
          {target.edited ? (
            <span className="mt-1.5 inline-flex">
              <Badge kind="neutral">Edited by you</Badge>
            </span>
          ) : null}
        </ClaimButton>
        <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={onEdit} aria-label={editLabel} className="shrink-0">
          <span className="hidden sm:inline">Edit</span>
        </Button>
      </div>
      <InlineProof target={target} open={selected} />
    </div>
  );
}
