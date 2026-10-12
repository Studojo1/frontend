// Settings: Gmail, review before send, follow-ups, never contact, what I
// remember (with Forget and Add), and credits.
import { useState, type ReactNode } from "react";
import { FiExternalLink } from "react-icons/fi";
import type { AgentSettings, NeverContact, Status, UpdateSettingsBody } from "~/lib/desk/types";
import { getSettings, getStatus, updateSettings } from "~/lib/desk/api";
import { Card, cx, ErrorBox, errorText, FOCUS_RING, Loading, Notice, Pill, Section } from "./kit";
import { refresh, useLive, usePageContext } from "./live";
import { MemoriesCard, NeverContactEditor } from "./settings-lists";

export function SettingsTab() {
  const status = useLive<Status>("status", getStatus);
  const settings = useLive<AgentSettings>("settings", getSettings);
  usePageContext({ route: "settings" });
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState<keyof AgentSettings | null>(null);

  const save = async (patch: UpdateSettingsBody, key: keyof AgentSettings) => {
    setSaving(key);
    setMsg(null);
    try {
      await updateSettings(patch);
      refresh(["settings"]);
    } catch (e) {
      setMsg(errorText(e));
    } finally {
      setSaving(null);
    }
  };

  const s = settings.data;
  return (
    <div className="space-y-8">
      <Section title="Settings">
        <div className="grid gap-4 lg:grid-cols-2">
          <GmailCard status={status.data} error={status.error} onRetry={status.reload} />
          <CreditsCard status={status.data} />
        </div>
      </Section>

      <Section title="How I work" sub="Nothing is sent until you approve it.">
        {msg ? <div className="mb-3"><Notice tone="error" onClose={() => setMsg(null)}>{msg}</Notice></div> : null}
        {settings.error ? (
          <ErrorBox error={settings.error} onRetry={settings.reload} />
        ) : !s ? (
          <Loading label="Loading settings" rows={2} />
        ) : (
          <Card className="divide-y-2 divide-studojo-ink/10">
            <SwitchRow
              label="Review before send"
              help="Every email waits for your approval. With this on, approving many at once asks you to confirm first."
              on={s.review_before_send}
              busy={saving === "review_before_send"}
              onChange={(v) => void save({ review_before_send: v }, "review_before_send")}
            />
            <SwitchRow
              label="Follow-ups"
              help="Plan a short follow-up when someone has not replied. Applies once sending is switched on."
              on={s.followups}
              busy={saving === "followups"}
              onChange={(v) => void save({ followups: v }, "followups")}
            />
            <div className="p-4 sm:p-5">
              <NeverContactEditor
                items={s.never_contact}
                busy={saving === "never_contact"}
                onChange={(list: NeverContact[]) => void save({ never_contact: list }, "never_contact")}
              />
            </div>
          </Card>
        )}
      </Section>

      <MemoriesCard />
    </div>
  );
}

function GmailCard({ status, error, onRetry }: { status: Status | null; error: unknown; onRetry: () => void }) {
  if (error) return <ErrorBox error={error} onRetry={onRetry} />;
  if (!status) return <Loading label="Loading Gmail status" rows={1} />;
  const g = status.gmail;
  const broken = g.connected && g.token_valid === false;
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <h3 className="flex-1 font-satoshi text-base font-bold text-studojo-ink">Gmail</h3>
        <Pill tone={!g.connected ? "muted" : broken ? "pink" : "green"}>{!g.connected ? "Not connected" : broken ? "Needs reconnecting" : "Connected"}</Pill>
      </div>
      <p className="mt-2 font-satoshi text-sm text-studojo-muted">
        {g.connected && g.address ? (
          <>Emails will go from <span className="font-bold text-studojo-ink">{g.address}</span> once sending is switched on.</>
        ) : status.sending_enabled ? (
          "Connect the Gmail you want your emails to come from."
        ) : (
          "Sending is not switched on yet, so Gmail is not needed for now."
        )}
      </p>
      {/* Phase 1: no Connect button while sending is off; Gmail is asked for at the first send. */}
      {g.connected || status.sending_enabled ? (
        <div className="mt-3">
          <OutLink href="/outreach/connect/gmail">{!g.connected ? "Connect Gmail" : broken ? "Reconnect Gmail" : "Manage Gmail"}</OutLink>
        </div>
      ) : null}
    </Card>
  );
}

function CreditsCard({ status }: { status: Status | null }) {
  if (!status) return <Loading label="Loading credits" rows={1} />;
  const c = status.credits;
  const l = status.limits;
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <h3 className="flex-1 font-satoshi text-base font-bold text-studojo-ink">Credits</h3>
        <Pill tone="purple">{c.available} left</Pill>
      </div>
      <p className="mt-2 font-satoshi text-sm text-studojo-muted">
        {c.reserved > 0 ? `${c.reserved} are held for a campaign that is running. ` : ""}
        Writing and approving drafts here uses no credits.
      </p>
      <p className="mt-1 font-satoshi text-sm text-studojo-muted tabular-nums">
        Today: {l.drafts_today} of {l.drafts_cap} drafts, {l.messages_today} of {l.messages_cap} messages to me.
      </p>
      <div className="mt-3">
        <OutLink href="/outreach/enrichment">Get more credits</OutLink>
      </div>
    </Card>
  );
}

function SwitchRow({ label, help, on, busy, onChange }: { label: string; help: string; on: boolean; busy: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-4 p-4 sm:p-5">
      <div className="min-w-0 flex-1">
        <p className="font-satoshi text-base font-bold text-studojo-ink">{label}</p>
        <p className="font-satoshi text-sm text-studojo-muted">{help}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={busy}
        onClick={() => onChange(!on)}
        className={cx("relative mt-1 h-8 w-14 shrink-0 rounded-full border-2 border-studojo-ink transition-colors disabled:opacity-60", on ? "bg-studojo-green" : "bg-studojo-surface-muted", FOCUS_RING)}
      >
        <span aria-hidden className={cx("absolute top-0.5 h-6 w-6 rounded-full border-2 border-studojo-ink bg-white transition-[left]", on ? "left-[1.6rem]" : "left-0.5")} />
      </button>
    </div>
  );
}

export function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className={cx("inline-flex min-h-10 items-center gap-1.5 rounded-xl border-2 border-studojo-ink bg-white px-3 font-satoshi text-sm font-bold text-studojo-ink shadow-[3px_3px_0_0_#191a23] hover:bg-studojo-purple-bg", FOCUS_RING)}>
      {children}
      <FiExternalLink aria-hidden />
    </a>
  );
}
