// Page tab: who can see the page (the /jernew switches with their locks) and
// who opened it (Simulated), with "Who opened my page?" for Senpai. Group 4.
import { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiMessageCircle, FiSearch } from "react-icons/fi";
import { peopleIn, snapshot } from "../core/derive";
import { chipFor, useAgent } from "../core/engine";
import { useB2C } from "../core/store";
import { useMotionPresets } from "../motion";
import type { VisibilityState } from "../types";
import { Avatar, Badge, Button, Card, cx, FOCUS_RING, IconButton, LiveRegion, SectionHeader, StagePill, Switch } from "../ui";

function reachSentence(live: boolean, v: VisibilityState): string {
  if (!v.adult) return "Only you. Under 18, your page stays private.";
  if (!live || !v.link) return "Only you. Your page is private.";
  const parts = ["People you send the link to"];
  if (v.search) parts.push("anyone who searches your name");
  if (v.managers) parts.push("hiring managers Studojo shows you to");
  return parts.length === 1 ? "Only the people you send the link to." : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}.`;
}

export function PageVisibility() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const [announce, setAnnounce] = useState("");
  const v = s.page.visibility;
  const live = s.page.live && v.link;
  const ageLock = !v.adult ? "Confirm you are 18 or older first. Under 18, your page stays private." : null;
  const linkLock = !live ? "Turn on the link first. A private page stays out of everything." : null;

  const setVis = (patch: Partial<VisibilityState>, note: string) => {
    dispatch({ type: "SET_PAGE", patch: { visibility: { ...v, ...patch } }, note });
    setAnnounce(note);
  };

  const onLink = (on: boolean) => {
    if (on) {
      dispatch({ type: "SET_PAGE", patch: { visibility: { ...v, link: true } } });
      dispatch({ type: "REPUBLISH" });
      dispatch({ type: "CLEAR_TOAST" });
      agent.note("Your page is live again, link-only. Follow-ups carry the link from now on.");
      setAnnounce("Link on. Your page is live, link-only.");
    } else {
      dispatch({ type: "UNPUBLISH" });
      agent.note("Your page is private. Queued follow-ups now go without the link. Undo is in the toast for 10 seconds.");
      setAnnounce("Link off. Your page is private.");
    }
  };

  const onAdult = (on: boolean) => {
    if (on) {
      setVis({ adult: true }, "Confirmed 18 or older. Your page stays private until you publish it.");
      return;
    }
    setVis({ adult: false, search: false, managers: false }, "Age confirmation removed. Your page is private and autopilot is capped at Batch.");
    if (s.page.live) dispatch({ type: "UNPUBLISH" });
    for (const m of s.missions) if (m.notch === 3) dispatch({ type: "SET_NOTCH", missionId: m.id, notch: 2 });
  };

  return (
    <section aria-labelledby="page-vis-h">
      <SectionHeader id="page-vis-h" title="Who can see it" kicker="Visibility" />
      <Card pad="none" shadow="sm" className="divide-y-2 divide-studojo-ink/10">
        <div className="px-4 py-4">
          <Switch tone="page" checked={v.adult} onChange={onAdult} label="I am 18 or older" description="Needed for a public link. Under 18, your page stays private and emails go without it." />
        </div>
        <div className="px-4 py-4">
          <Switch tone="page" checked={live} onChange={onLink} label="Anyone with the link" description="Only people you send it to, like the hiring managers in your follow-ups. Off makes it private, instantly." locked={!!ageLock} lockedReason={ageLock} />
        </div>
        <div className="px-4 py-4">
          <Switch tone="page" checked={live && v.search} onChange={(on) => setVis({ search: on }, on ? "Search engines can list your page now." : "Search engines: off.")} label="Show in search engines" description="People who search your name could find your page. Off by default." locked={!!(ageLock ?? linkLock)} lockedReason={ageLock ?? linkLock} />
        </div>
        <div className="px-4 py-4">
          <Switch tone="page" checked={live && v.managers} onChange={(on) => setVis({ managers: on }, on ? "Studojo may suggest your page to hiring managers." : "Hiring manager suggestions: off.")} label="Show me to hiring managers" description="Studojo may suggest your page to managers looking for someone like you. They see your page, never your phone or email." locked={!!(ageLock ?? linkLock)} lockedReason={ageLock ?? linkLock} />
        </div>
        <div className="bg-studojo-pink-bg px-4 py-3">
          <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-[#be185d]">Who can open your page now</p>
          <p className="mt-0.5 font-satoshi text-base font-bold text-studojo-ink">{reachSentence(s.page.live, v)}</p>
        </div>
      </Card>
      <LiveRegion message={announce} />
    </section>
  );
}

export function PageOpens() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const m = useMotionPresets();
  const opened = peopleIn(s)
    .filter((x) => x.pageOpened)
    .sort((a, b) => (b.p.pageOpenedDay ?? 0) - (a.p.pageOpenedDay ?? 0));
  const total = snapshot(s).pageOpens;
  const glow = s.highlight?.kind === "landed" ? new Set(s.highlight.ids) : null;
  const whoOpened = () => {
    agent.open({ focus: false });
    agent.start("F10");
  };
  return (
    <section aria-labelledby="page-opens-h">
      <SectionHeader
        id="page-opens-h"
        title="Opens"
        kicker={`${total} in all`}
        action={<Badge kind="simulated" />}
      />
      <Card pad="none" shadow="sm">
        {opened.length ? (
          <motion.ul variants={m.list} initial="hidden" animate="show" className="divide-y-2 divide-studojo-ink/10">
            {opened.map(({ p, reply, stage }) => (
              <motion.li
                key={p.id}
                variants={m.item}
                className={cx("flex items-center gap-3 px-3 py-2.5 transition-colors sm:px-4", glow?.has(p.id) && "bg-studojo-purple-bg")}
              >
                <Avatar first={p.first} last={p.last} size="sm" />
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: "SET_TAB", tab: "people" });
                    dispatch({ type: "SELECT", id: p.id });
                  }}
                  className={cx("min-h-11 min-w-0 flex-1 rounded-lg text-left font-satoshi text-sm leading-snug", FOCUS_RING)}
                >
                  Opened from your follow-up to <b>{p.first}</b>, {p.company}, Day {p.pageOpenedDay}
                  <span className="mt-0.5 block text-xs text-studojo-muted">{reply ? `Replied, Day ${reply.day}` : "No reply yet"}</span>
                </button>
                <span className="hidden sm:inline-flex">
                  <StagePill stage={stage} />
                </span>
                <IconButton size="sm" label={`Ask Senpai about ${p.first}, ${p.company}`} icon={<FiMessageCircle />} onClick={() => agent.open({ attach: chipFor.person(p) })} />
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <p className="flex items-center gap-2 px-4 py-6 font-satoshi text-sm text-studojo-muted">
            <FiEye aria-hidden /> No opens yet. They show here once a follow-up with your page goes out.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 border-t-2 border-studojo-ink/10 px-3 py-3 sm:px-4">
          <p className="min-w-0 flex-1 font-satoshi text-xs text-studojo-muted">
            {opened.length} traced to a named thread. {s.page.live ? "Counted when someone taps the page card in your follow-up." : "New opens stop while your page is private."}
          </p>
          <Button size="sm" variant="secondary" icon={<FiSearch />} onClick={whoOpened}>
            Who opened my page?
          </Button>
        </div>
      </Card>
    </section>
  );
}
