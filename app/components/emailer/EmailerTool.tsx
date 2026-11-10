import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLocation } from "react-router";
import { authUrl } from "~/lib/return-to";
import { getMe, gradeEmail, readResume, writeEmail } from "~/lib/emailer/api";
import {
  DRAFT_KEY,
  LIMITS,
  TOOL_PATH,
  buildGradeRequest,
  buildWriteRequest,
  emptyGradeForm,
  emptyWriteForm,
  gmailComposeUrl,
  hasNumber,
  pageUtm,
  readDraft,
  validateGrade,
  validateWrite,
  type ClassifiedError,
  type Draft,
  type FieldErrors,
  type GradeForm,
  type GradeResponse,
  type MeResponse,
  type Tab,
  type WriteForm,
  type WriteResponse,
} from "~/lib/emailer/contract";
import { track } from "~/lib/emailer/track";
import { ArrowIcon, StuHead } from "~/components/site-b2c/ui";
import { COPY, ERRORS, EXAMPLE, FORM, GRADE, LOADING_STEPS, LOCK, LOCKED_FOLLOWUP, RESULT, STU } from "./copy";
import {
  CopyIcon,
  EditIcon,
  EmailBody,
  EmailHead,
  Field,
  LockIcon,
  LockedOver,
  MailIcon,
  Modal,
  RefreshIcon,
  ResultMeter,
  ResultStuCard,
  ScoreBadge,
  ScoreCard,
  StickyBar,
  StuLink,
  UploadIcon,
  WhyThisWorks,
} from "./parts";

// EMAILER: the tool itself, two tabs: "Write my email" (the default) and "Grade my email".
//
// - Anonymous: the first action of the day is free. Its follow-ups, regenerate and more emails are locked; the grader's
//   rewrite is locked. Each lock is a sign-in to the site's own /auth (the same account as Stu), back to this page.
// - The forms and the last results are kept in localStorage (DRAFT_KEY) as they change, so a sign-in, a reload or a
//   second visit comes back to them.
// - Errors (contract.ts classifyError): 429 with signIn is the sign-in wall, 429 without it the daily limit, "busy"
//   the day's total, 503 "back soon", 400 marks the field.

const SIGN_IN = authUrl("signin", TOOL_PATH);
const STU_MODAL_SEEN = "stu_emailer_stu_modal";

type Notice = { kind: ClassifiedError["kind"]; message: string } | null;

function noticeFor(e: ClassifiedError): Notice {
  switch (e.kind) {
    case "limit":
      return { kind: "limit", message: ERRORS.limit };
    case "busy":
      return { kind: "busy", message: ERRORS.busy };
    case "off":
      return { kind: "off", message: ERRORS.off };
    case "field":
      return { kind: "field", message: e.message || ERRORS.field };
    default:
      return { kind: "error", message: e.message || ERRORS.error };
  }
}

/** The form key a field's element carries (data-key), for focusing the first error. */
function focusFirstError(errors: FieldErrors) {
  const first = Object.keys(errors)[0];
  if (!first) return;
  const el = document.querySelector<HTMLElement>(`[data-key="${first}"]`);
  if (el) {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.focus({ preventScroll: true });
  }
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 84;
  window.scrollTo({ top, behavior: "smooth" });
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function EmailerTool({ initialTab }: { initialTab: Tab }) {
  const { search } = useLocation();
  const utm = useMemo(() => pageUtm(search), [search]);

  const [tab, setTab] = useState<Tab>(initialTab);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [restored, setRestored] = useState(false);

  // write
  const [write, setWrite] = useState<WriteForm>(emptyWriteForm);
  const [writeErrors, setWriteErrors] = useState<FieldErrors>({});
  const [writeBusy, setWriteBusy] = useState<false | "write" | "regenerate">(false);
  const [writeResult, setWriteResult] = useState<WriteResponse | null>(null);
  const [writeNotice, setWriteNotice] = useState<Notice>(null);
  const [editing, setEditing] = useState(false);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // resume
  const [resumeBusy, setResumeBusy] = useState(false);
  const [resumeMsg, setResumeMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [resumeExtra, setResumeExtra] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // grade
  const [grade, setGrade] = useState<GradeForm>(emptyGradeForm);
  const [gradeErrors, setGradeErrors] = useState<FieldErrors>({});
  const [gradeBusy, setGradeBusy] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResponse | null>(null);
  const [gradeNotice, setGradeNotice] = useState<Notice>(null);

  // the sign-in wall and the Stu modal
  const [modal, setModal] = useState<null | "signin" | "stu">(null);
  const [wallWhere, setWallWhere] = useState("write");

  const started = useRef(false);
  const [phIndex, setPhIndex] = useState(0);

  // ── on arrival: the saved draft, who this is, the view ──
  useEffect(() => {
    let draft: Draft | null = null;
    try {
      draft = readDraft(localStorage.getItem(DRAFT_KEY), Date.now());
    } catch {
      draft = null;
    }
    const askedTab = new URLSearchParams(window.location.search).get("tab");
    if (draft) {
      setWrite(draft.write);
      setWriteResult(draft.writeResult);
      setGrade(draft.grade);
      setGradeResult(draft.gradeResult);
      if (askedTab !== "grade" && askedTab !== "write") setTab(draft.tab);
    }
    setRestored(true);
    setPhIndex(Math.floor(Math.random() * FORM.nowPhs.length));
    let alive = true;
    void getMe().then((r) => {
      if (!alive) return;
      if (r.ok) setMe(r.data);
      track("emailer_view", {
        tab: askedTab === "grade" ? "grade" : draft?.tab ?? "write",
        signed_in: r.ok ? r.data.signedIn : null,
        restored: !!draft,
        has_result: !!draft?.writeResult || !!draft?.gradeResult,
        ...utm,
      });
    });
    return () => {
      alive = false;
    };
    // on arrival only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── keep the draft as it changes ──
  useEffect(() => {
    if (!restored) return;
    const t = window.setTimeout(() => {
      const d: Draft = { v: 1, savedAt: Date.now(), tab, write, writeResult, grade, gradeResult };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
      } catch {
        // storage full or blocked: the page still works, only the return trip forgets
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [restored, tab, write, writeResult, grade, gradeResult]);

  const saveNow = useCallback(() => {
    try {
      const d: Draft = { v: 1, savedAt: Date.now(), tab, write, writeResult, grade, gradeResult };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch {
      // see above
    }
  }, [tab, write, writeResult, grade, gradeResult]);

  const noteStart = useCallback(
    (which: Tab) => {
      if (started.current) return;
      started.current = true;
      track("emailer_start", { tab: which });
    },
    [],
  );

  const signedIn = me?.signedIn ?? writeResult?.usage.signedIn ?? gradeResult?.usage.signedIn ?? false;

  const openWall = useCallback((where: string) => {
    setWallWhere(where);
    setModal("signin");
    track("emailer_signin_prompt", { where, action: "shown" });
  }, []);

  /** Every "Sign in free": keep everything, then the site's sign-in, back here. A real link; this runs first. */
  const onSignIn = useCallback(
    (where: string) => () => {
      saveNow();
      track("emailer_signin_prompt", { where, action: "click" });
    },
    [saveNow],
  );

  const maybeStuModal = useCallback(() => {
    try {
      if (sessionStorage.getItem(STU_MODAL_SEEN)) return;
      sessionStorage.setItem(STU_MODAL_SEEN, "1");
    } catch {
      // no storage: show it this once
    }
    window.setTimeout(() => setModal((m) => m ?? "stu"), 500);
  }, []);

  // ── write ──
  const setW = <K extends keyof WriteForm>(k: K, v: WriteForm[K]) => {
    noteStart("write");
    setWrite((f) => ({ ...f, [k]: v }));
    setWriteErrors((e) => {
      if (!Object.keys(e).length) return e;
      const next = { ...e };
      delete next[k as string];
      if (k === "toName" || k === "toTitle") delete next.to;
      return next;
    });
  };
  const setResult = (i: number, v: string) => {
    noteStart("write");
    setWrite((f) => {
      const results = [...f.results];
      results[i] = v;
      return { ...f, results };
    });
    setWriteErrors((e) => {
      if (!e[`results.${i}`] && !(i === 0 && e["results.0"])) return e;
      const next = { ...e };
      delete next[`results.${i}`];
      return next;
    });
  };

  const applyWrite = (r: WriteResponse) => {
    setWriteResult(r);
    setEditing(false);
    setMe((m) => (m ? { ...m, used: r.usage.used, limit: r.usage.limit, signedIn: r.usage.signedIn } : { signedIn: r.usage.signedIn, firstName: null, used: r.usage.used, limit: r.usage.limit }));
  };

  const runWrite = async (regenerateOf?: string) => {
    const errors = validateWrite(write);
    setWriteErrors(errors);
    setWriteNotice(null);
    if (Object.keys(errors).length) {
      focusFirstError(errors);
      return;
    }
    setWriteBusy(regenerateOf ? "regenerate" : "write");
    if (!regenerateOf) window.setTimeout(() => scrollToId("em-out"), 60);
    const req = buildWriteRequest(write, utm, regenerateOf);
    const r = await writeEmail(req);
    setWriteBusy(false);
    const props = {
      regenerate: !!regenerateOf,
      job_type: write.jobType,
      has_job_post: !!(req.jobPost || req.jobUrl),
      has_to: !!req.to,
      has_why: !!req.you.why,
      results: req.you.results.length,
      results_with_number: req.you.results.filter(hasNumber).length,
    };
    if (r.ok) {
      applyWrite(r.data);
      track("emailer_generate", { ...props, ok: true, score: r.data.score.value, locked: r.data.locked.followups });
      window.setTimeout(() => scrollToId("em-out"), 60);
      return;
    }
    track("emailer_generate", { ...props, ok: false, status: r.status, error: r.error.kind });
    if (r.error.kind === "signin") {
      openWall(regenerateOf ? "regenerate" : "write");
      return;
    }
    if (r.error.kind === "field" && r.error.field && r.error.field !== "form") {
      const errs = { [r.error.field]: r.error.message || ERRORS.field };
      setWriteErrors(errs);
      focusFirstError(errs);
      return;
    }
    setWriteNotice(noticeFor(r.error));
  };

  const onWriteSubmit = (e: FormEvent) => {
    e.preventDefault();
    void runWrite();
  };

  const regenerate = () => {
    if (!writeResult) return;
    if (writeResult.locked.regenerate && !signedIn) {
      openWall("regenerate");
      return;
    }
    void runWrite(writeResult.id);
  };

  const writeAnother = () => {
    if (writeResult?.locked.more && !signedIn) {
      openWall("more");
      return;
    }
    setWrite((f) => ({ ...f, company: "", role: "", jobPost: "", jobUrl: "", toName: "", toTitle: "", why: "" }));
    setWriteResult(null);
    setWriteNotice(null);
    setEditing(false);
    window.setTimeout(() => {
      scrollToId("em-tool");
      document.querySelector<HTMLElement>('[data-key="company"]')?.focus({ preventScroll: true });
    }, 60);
  };

  const subject = writeResult ? writeResult.subject : "";
  const body = writeResult ? writeResult.body : "";

  const startEdit = () => {
    if (!writeResult) return;
    setDraftSubject(writeResult.subject);
    setDraftBody(writeResult.body);
    setEditing(true);
  };
  const finishEdit = () => {
    if (writeResult) setWriteResult({ ...writeResult, subject: draftSubject.trim() || writeResult.subject, body: draftBody.trim() || writeResult.body });
    setEditing(false);
  };

  const flash = (what: string) => {
    setCopied(what);
    window.setTimeout(() => setCopied((c) => (c === what ? null : c)), 1800);
  };

  const copyEmail = async () => {
    const text = editing ? draftBody : body;
    if (await copyText(text)) {
      flash("email");
      track("emailer_copy", { what: "email", score: writeResult?.score.value });
      maybeStuModal();
    }
  };
  const copySubject = async () => {
    if (await copyText(editing ? draftSubject : subject)) {
      flash("subject");
      track("emailer_copy", { what: "subject" });
    }
  };

  // ── resume ──
  const onResume = async (file: File | undefined) => {
    if (!file) return;
    noteStart("write");
    setResumeMsg(null);
    setResumeExtra([]);
    const okType = /\.(pdf|docx)$/i.test(file.name) || /pdf|officedocument\.wordprocessingml/.test(file.type);
    if (!okType) {
      setResumeMsg({ ok: false, text: FORM.resumeBadType });
      return;
    }
    if (file.size > LIMITS.resumeBytes) {
      setResumeMsg({ ok: false, text: FORM.resumeTooBig });
      return;
    }
    setResumeBusy(true);
    const r = await readResume(file);
    setResumeBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (!r.ok) {
      track("emailer_resume", { ok: false, status: r.status });
      setResumeMsg({ ok: false, text: r.status === 429 ? FORM.resumeLimit : FORM.resumeFailed });
      return;
    }
    const d = r.data;
    const lines = (d.results ?? []).map((s) => String(s).trim()).filter(Boolean);
    setWrite((f) => {
      const results = [...f.results];
      let at = 0;
      for (let i = 0; i < results.length && at < lines.length; i++) {
        if (!results[i].trim()) results[i] = lines[at++].slice(0, LIMITS.result);
      }
      return {
        ...f,
        name: f.name.trim() ? f.name : d.name ?? "",
        now: f.now.trim() ? f.now : d.now ?? "",
        links: f.links.trim() ? f.links : (d.links ?? []).slice(0, LIMITS.links).join(", "),
        results,
      };
    });
    const used = new Set(write.results.map((x) => x.trim()).filter(Boolean));
    const free = write.results.filter((x) => !x.trim()).length;
    setResumeExtra(lines.filter((l) => !used.has(l)).slice(free));
    setResumeMsg({ ok: true, text: FORM.resumeDone });
    setWriteErrors({});
    track("emailer_resume", { ok: true, results: lines.length });
  };

  const pickExtra = (line: string) => {
    const results = [...write.results];
    // the first empty slot, else the weakest line (no number), else the last
    let i = results.findIndex((x) => !x.trim());
    if (i < 0) i = results.findIndex((x) => !hasNumber(x));
    if (i < 0) i = results.length - 1;
    const out = results[i];
    results[i] = line.slice(0, LIMITS.result);
    setWrite((f) => ({ ...f, results }));
    setResumeExtra((xs) => [...xs.filter((x) => x !== line), ...(out.trim() ? [out] : [])]);
  };

  // ── grade ──
  const setG = <K extends keyof GradeForm>(k: K, v: GradeForm[K]) => {
    noteStart("grade");
    setGrade((f) => ({ ...f, [k]: v }));
    if (gradeErrors[k as string]) {
      setGradeErrors((e) => {
        const next = { ...e };
        delete next[k as string];
        return next;
      });
    }
  };

  const onGradeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateGrade(grade);
    setGradeErrors(errors);
    setGradeNotice(null);
    if (Object.keys(errors).length) {
      focusFirstError(errors);
      return;
    }
    setGradeBusy(true);
    window.setTimeout(() => scrollToId("em-out"), 60);
    const r = await gradeEmail(buildGradeRequest(grade, write.name));
    setGradeBusy(false);
    if (r.ok) {
      setGradeResult(r.data);
      setMe((m) => ({ signedIn: r.data.usage.signedIn, firstName: m?.firstName ?? null, used: r.data.usage.used, limit: r.data.usage.limit }));
      track("emailer_grade", { ok: true, score: r.data.score.value, rewrite_score: r.data.rewrite?.score ?? null, locked: r.data.locked.rewrite });
      window.setTimeout(() => scrollToId("em-out"), 60);
      return;
    }
    track("emailer_grade", { ok: false, status: r.status, error: r.error.kind });
    if (r.error.kind === "signin") {
      openWall("grade");
      return;
    }
    if (r.error.kind === "field" && r.error.field && r.error.field !== "form") {
      const errs = { [r.error.field === "subject" ? "subject" : "email"]: r.error.message || ERRORS.field };
      setGradeErrors(errs);
      focusFirstError(errs);
      return;
    }
    setGradeNotice(noticeFor(r.error));
  };

  const copyRewrite = async () => {
    if (!gradeResult?.rewrite) return;
    if (await copyText(gradeResult.rewrite.body)) {
      flash("rewrite");
      track("emailer_copy", { what: "rewrite", score: gradeResult.rewrite.score });
      maybeStuModal();
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    try {
      const u = new URL(window.location.href);
      if (t === "grade") u.searchParams.set("tab", "grade");
      else u.searchParams.delete("tab");
      window.history.replaceState(window.history.state, "", u.toString());
    } catch {
      // the address bar is a convenience
    }
  };

  // ── usage line ──
  const left = me ? Math.max(0, me.limit - me.used) : null;
  const usageLine = me?.signedIn && left !== null ? COPY.leftToday(left, me.limit) : COPY.freeNote;

  const hasWriteOut = !!writeResult || !!writeBusy;
  const hasGradeOut = !!gradeResult || gradeBusy;

  return (
    <>
      <section className="sv-in em-tool" id="em-tool" aria-label="the email writer">
        <div className="em-tabs" role="tablist" aria-label="mode">
          <button type="button" role="tab" id="em-tab-write" aria-selected={tab === "write"} aria-controls="em-panel" className="em-tab" onClick={() => switchTab("write")}>
            <MailIcon size={16} />
            {COPY.tabWrite}
          </button>
          <button type="button" role="tab" id="em-tab-grade" aria-selected={tab === "grade"} aria-controls="em-panel" className="em-tab" onClick={() => switchTab("grade")}>
            <ScoreGlyph />
            {COPY.tabGrade}
          </button>
        </div>

        <div id="em-panel" role="tabpanel" aria-labelledby={tab === "write" ? "em-tab-write" : "em-tab-grade"}>
          {tab === "write" ? (
            <div className={`em-grid ${hasWriteOut ? "em-has-out" : ""}`}>
              {/* ── the write form ── */}
              <form className="em-card em-form" onSubmit={onWriteSubmit} noValidate aria-label="your email's details">
                <div className="em-resume">
                  <input
                    ref={fileRef}
                    type="file"
                    id="em-resume-file"
                    className="em-file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => void onResume(e.target.files?.[0])}
                  />
                  <label htmlFor="em-resume-file" className="em-btn-ghost em-resume-btn" aria-busy={resumeBusy}>
                    <UploadIcon />
                    {resumeBusy ? FORM.resumeBusy : FORM.resume}
                  </label>
                  <p className="em-hint">{FORM.resumeHint}</p>
                  {resumeMsg ? (
                    <p className={resumeMsg.ok ? "em-ok" : "em-err"} role="status">
                      {resumeMsg.text}
                    </p>
                  ) : null}
                </div>

                <div className="em-row2">
                  <Field id="em-company" label={FORM.company} error={writeErrors.company}>
                    <input
                      id="em-company"
                      data-key="company"
                      className="em-input"
                      value={write.company}
                      onChange={(e) => setW("company", e.target.value)}
                      placeholder={FORM.companyPh}
                      autoComplete="organization"
                      maxLength={300}
                      aria-invalid={!!writeErrors.company}
                    />
                  </Field>
                  <Field id="em-role" label={FORM.role} error={writeErrors.role}>
                    <input
                      id="em-role"
                      data-key="role"
                      className="em-input"
                      value={write.role}
                      onChange={(e) => setW("role", e.target.value)}
                      placeholder={FORM.rolePh}
                      autoComplete="organization-title"
                      maxLength={300}
                      aria-invalid={!!writeErrors.role}
                    />
                  </Field>
                </div>

                <div className="em-seg" role="radiogroup" aria-label="job or internship">
                  {(["job", "internship"] as const).map((t) => (
                    <button key={t} type="button" role="radio" aria-checked={write.jobType === t} className="em-seg-btn" onClick={() => setW("jobType", t)}>
                      {t === "job" ? FORM.job : FORM.internship}
                    </button>
                  ))}
                </div>

                <Field id={write.jobMode === "paste" ? "em-jobpost" : "em-joburl"} label={FORM.jobPost} hint={FORM.jobPostHint} optional error={writeErrors.jobPost || writeErrors.jobUrl}>
                  <div className="em-mini-tabs" role="radiogroup" aria-label="paste or link">
                    {(["paste", "link"] as const).map((m) => (
                      <button key={m} type="button" role="radio" aria-checked={write.jobMode === m} className="em-mini-tab" onClick={() => setW("jobMode", m)}>
                        {m === "paste" ? FORM.jobPaste : FORM.jobLink}
                      </button>
                    ))}
                  </div>
                  {write.jobMode === "paste" ? (
                    <textarea
                      id="em-jobpost"
                      data-key="jobPost"
                      className="em-input em-textarea"
                      rows={4}
                      value={write.jobPost}
                      onChange={(e) => setW("jobPost", e.target.value)}
                      placeholder={FORM.jobPostPh}
                      aria-describedby="em-jobpost-hint"
                      aria-invalid={!!writeErrors.jobPost}
                    />
                  ) : (
                    <input
                      id="em-joburl"
                      data-key="jobUrl"
                      className="em-input"
                      type="url"
                      inputMode="url"
                      value={write.jobUrl}
                      onChange={(e) => setW("jobUrl", e.target.value)}
                      placeholder={FORM.jobUrlPh}
                      aria-invalid={!!writeErrors.jobUrl}
                    />
                  )}
                  {write.jobMode === "paste" && write.jobPost.length > LIMITS.jobPost * 0.9 ? (
                    <p className="em-count">
                      {write.jobPost.length.toLocaleString("en-IN")} / {LIMITS.jobPost.toLocaleString("en-IN")}
                    </p>
                  ) : null}
                </Field>

                <Field id="em-toname" label={FORM.to} hint={FORM.toHint} optional error={writeErrors.to}>
                  <div className="em-row2 em-row2-tight">
                    <input
                      id="em-toname"
                      data-key="to"
                      className="em-input"
                      value={write.toName}
                      onChange={(e) => setW("toName", e.target.value)}
                      placeholder={FORM.toNamePh}
                      autoComplete="off"
                      maxLength={200}
                      aria-label="their name"
                    />
                    <input
                      className="em-input"
                      value={write.toTitle}
                      onChange={(e) => setW("toTitle", e.target.value)}
                      placeholder={FORM.toTitlePh}
                      autoComplete="off"
                      maxLength={200}
                      aria-label="their title"
                    />
                  </div>
                </Field>

                <div className="em-row2">
                  <Field id="em-name" label={FORM.name} error={writeErrors.name}>
                    <input
                      id="em-name"
                      data-key="name"
                      className="em-input"
                      value={write.name}
                      onChange={(e) => setW("name", e.target.value)}
                      placeholder={FORM.namePh}
                      autoComplete="name"
                      maxLength={200}
                      aria-invalid={!!writeErrors.name}
                    />
                  </Field>
                  <Field id="em-now" label={FORM.now} error={writeErrors.now}>
                    <input
                      id="em-now"
                      data-key="now"
                      className="em-input"
                      value={write.now}
                      onChange={(e) => setW("now", e.target.value)}
                      placeholder={FORM.nowPhs[phIndex]}
                      maxLength={300}
                      aria-invalid={!!writeErrors.now}
                    />
                  </Field>
                </div>

                <fieldset className="em-results">
                  <legend className="em-label">{FORM.results}</legend>
                  <p className="em-hint">{FORM.resultsHint}</p>
                  {write.results.map((r, i) => {
                    const err = writeErrors[`results.${i}`];
                    return (
                      <div key={i} className={`em-result ${err ? "em-field-bad" : ""}`}>
                        <div className="em-result-row">
                          <span className="em-result-n" aria-hidden="true">
                            {i + 1}
                          </span>
                          <input
                            data-key={`results.${i}`}
                            className="em-input"
                            value={r}
                            onChange={(e) => setResult(i, e.target.value)}
                            placeholder={FORM.resultPhs[i]}
                            maxLength={LIMITS.result + 20}
                            aria-label={`result ${i + 1}`}
                            aria-invalid={!!err}
                          />
                        </div>
                        <ResultMeter text={r} />
                        {err ? (
                          <p className="em-err" role="alert">
                            {err}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                  {resumeExtra.length ? (
                    <div className="em-extra">
                      <p className="em-hint">{FORM.resumeMore}</p>
                      <div className="em-extra-list">
                        {resumeExtra.map((x) => (
                          <button key={x} type="button" className="em-extra-chip" onClick={() => pickExtra(x)}>
                            {x}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </fieldset>

                <Field id="em-why" label={FORM.why} hint={FORM.whyHint} optional error={writeErrors.why}>
                  <input
                    id="em-why"
                    data-key="why"
                    className="em-input"
                    value={write.why}
                    onChange={(e) => setW("why", e.target.value)}
                    placeholder={FORM.whyPh}
                    maxLength={500}
                  />
                </Field>

                <Field id="em-links" label={FORM.links} hint={FORM.linksHint} optional error={writeErrors.links}>
                  <input
                    id="em-links"
                    data-key="links"
                    className="em-input"
                    value={write.links}
                    onChange={(e) => setW("links", e.target.value)}
                    placeholder={FORM.linksPh}
                    autoComplete="url"
                    maxLength={500}
                  />
                </Field>

                <div className="em-submit-row">
                  <button type="submit" className="sv-btn em-submit" disabled={!!writeBusy}>
                    {writeBusy === "write" ? <Spinner /> : <MailIcon size={18} />}
                    {writeBusy === "write" ? FORM.submitBusy : FORM.submit}
                  </button>
                  <p className="em-usage">{usageLine}</p>
                </div>
                {writeNotice ? <NoticeBox notice={writeNotice} /> : null}
                {writeErrors.form ? (
                  <p className="em-err" role="alert">
                    {writeErrors.form}
                  </p>
                ) : null}
              </form>

              {/* ── the output ── */}
              <div className="em-out" id="em-out" aria-live="polite">
                {writeBusy === "write" ? (
                  <Loading company={write.company.replace(/^https?:\/\//, "").replace(/\/.*$/, "")} />
                ) : writeResult ? (
                  <div className="em-result-wrap">
                    <ScoreCard score={writeResult.score} shareUrl={writeResult.shareUrl} where="write" />

                    <section className="em-card em-mail" aria-label="your email">
                      {writeBusy === "regenerate" ? <div className="em-mail-busy"><Spinner /> {RESULT.regenerating}</div> : null}
                      <EmailHead
                        to={[write.toName.trim(), write.toTitle.trim()].filter(Boolean).join(", ") || RESULT.toDefault}
                        subject={
                          editing ? (
                            <input className="em-input em-subject-input" value={draftSubject} onChange={(e) => setDraftSubject(e.target.value)} aria-label="subject" />
                          ) : (
                            subject
                          )
                        }
                        onCopySubject={editing ? undefined : () => void copySubject()}
                      />
                      {editing ? (
                        <textarea className="em-input em-textarea em-body-edit" value={draftBody} onChange={(e) => setDraftBody(e.target.value)} rows={12} aria-label="email" />
                      ) : (
                        <EmailBody body={body} highlights={writeResult.highlights} />
                      )}
                      <div className="em-actions">
                        <button type="button" className="sv-btn sv-btn-sm em-act-main" onClick={() => void copyEmail()}>
                          <CopyIcon />
                          {copied === "email" ? RESULT.copied : RESULT.copy}
                        </button>
                        <a
                          className="em-btn-ghost"
                          href={gmailComposeUrl(editing ? draftSubject : subject, editing ? draftBody : body)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            track("emailer_gmail", { where: "write", score: writeResult.score.value });
                            maybeStuModal();
                          }}
                        >
                          <MailIcon />
                          {RESULT.gmail}
                        </a>
                        <button type="button" className="em-btn-ghost" onClick={editing ? finishEdit : startEdit}>
                          <EditIcon />
                          {editing ? RESULT.done : RESULT.edit}
                        </button>
                        <button type="button" className="em-btn-ghost" onClick={regenerate} disabled={!!writeBusy} data-locked={writeResult.locked.regenerate && !signedIn ? "" : undefined}>
                          {writeResult.locked.regenerate && !signedIn ? <LockIcon /> : <RefreshIcon />}
                          {RESULT.regenerate}
                        </button>
                      </div>
                      {copied === "subject" ? <p className="em-ok em-copied-note">{RESULT.copied}</p> : null}
                      {editing ? null : <WhyThisWorks body={body} highlights={writeResult.highlights} />}
                    </section>

                    <ResultStuCard />

                    <section className="em-followups" aria-label={RESULT.followups}>
                      <div className="em-fu-head">
                        <h3>{RESULT.followups}</h3>
                        <p className="em-hint">{RESULT.followupsLine}</p>
                      </div>
                      {writeResult.followups && writeResult.followups.length ? (
                        writeResult.followups.map((f) => (
                          <div key={f.day} className="em-card em-fu">
                            <div className="em-fu-top">
                              <span className="em-day">{RESULT.day(f.day)}</span>
                              <button
                                type="button"
                                className="em-icon-btn"
                                onClick={async () => {
                                  if (await copyText(f.body)) {
                                    flash(`fu${f.day}`);
                                    track("emailer_copy", { what: `followup_${f.day}` });
                                  }
                                }}
                                aria-label={`copy the day ${f.day} follow-up`}
                              >
                                {copied === `fu${f.day}` ? <span className="em-ok">{RESULT.copied}</span> : <CopyIcon />}
                              </button>
                            </div>
                            <div className="em-body em-body-sm">{f.body}</div>
                          </div>
                        ))
                      ) : signedIn ? (
                        <div className="em-card em-fu em-fu-unlock">
                          <p>{RESULT.unlockFollowupsLine}</p>
                          <button type="button" className="sv-btn sv-btn-sm" onClick={regenerate} disabled={!!writeBusy}>
                            <RefreshIcon />
                            {RESULT.unlockFollowups}
                          </button>
                        </div>
                      ) : (
                        <LockedOver line={LOCK.line} signInHref={SIGN_IN} onSignIn={onSignIn("followups")}>
                          {LOCKED_FOLLOWUP.map((t, i) => (
                            <div key={i} className="em-card em-fu">
                              <div className="em-fu-top">
                                <span className="em-day">{RESULT.day(i === 0 ? 3 : 7)}</span>
                              </div>
                              <div className="em-body em-body-sm">{t}</div>
                            </div>
                          ))}
                        </LockedOver>
                      )}
                    </section>

                    <button type="button" className="em-btn-ghost em-another" onClick={writeAnother}>
                      {writeResult.locked.more && !signedIn ? <LockIcon /> : <ArrowIcon size={16} />}
                      {RESULT.another}
                    </button>
                  </div>
                ) : (
                  <ExampleOut />
                )}
              </div>
            </div>
          ) : (
            <div className={`em-grid ${hasGradeOut ? "em-has-out" : ""}`}>
              {/* ── the grade form ── */}
              <form className="em-card em-form" onSubmit={onGradeSubmit} noValidate aria-label="your email to grade">
                <Field id="em-g-email" label={GRADE.email} hint={GRADE.emailHint} error={gradeErrors.email}>
                  <textarea
                    id="em-g-email"
                    data-key="email"
                    className="em-input em-textarea em-g-email"
                    rows={10}
                    value={grade.email}
                    onChange={(e) => setG("email", e.target.value)}
                    placeholder={GRADE.emailPh}
                    aria-invalid={!!gradeErrors.email}
                  />
                  <p className="em-count" aria-live="polite">
                    {grade.email.trim().length.toLocaleString("en-IN")} / {LIMITS.gradeMax.toLocaleString("en-IN")}
                  </p>
                </Field>
                <Field id="em-g-subject" label={GRADE.subject} optional error={gradeErrors.subject}>
                  <input id="em-g-subject" data-key="subject" className="em-input" value={grade.subject} onChange={(e) => setG("subject", e.target.value)} placeholder={GRADE.subjectPh} maxLength={300} />
                </Field>
                <div className="em-row2">
                  <Field id="em-g-role" label={GRADE.role} optional>
                    <input id="em-g-role" className="em-input" value={grade.role} onChange={(e) => setG("role", e.target.value)} placeholder={GRADE.rolePh} maxLength={300} />
                  </Field>
                  <Field id="em-g-company" label={GRADE.company} optional>
                    <input id="em-g-company" className="em-input" value={grade.company} onChange={(e) => setG("company", e.target.value)} placeholder={GRADE.companyPh} maxLength={300} />
                  </Field>
                </div>
                <div className="em-submit-row">
                  <button type="submit" className="sv-btn em-submit" disabled={gradeBusy}>
                    {gradeBusy ? <Spinner /> : <ScoreGlyph />}
                    {gradeBusy ? GRADE.submitBusy : GRADE.submit}
                  </button>
                  <p className="em-usage">{usageLine}</p>
                </div>
                {gradeNotice ? <NoticeBox notice={gradeNotice} /> : null}
              </form>

              <div className="em-out" id="em-out" aria-live="polite">
                {gradeBusy ? (
                  <Loading company="" grade />
                ) : gradeResult ? (
                  <div className="em-result-wrap">
                    <ScoreCard
                      score={gradeResult.score}
                      shareUrl={gradeResult.shareUrl}
                      shareScore={gradeResult.rewrite ? gradeResult.rewrite.score : gradeResult.score.value}
                      shareBefore={gradeResult.rewrite ? gradeResult.score.value : null}
                      where="grade"
                    />
                    {gradeResult.rewrite ? (
                      <section className="em-card em-mail" aria-label={GRADE.rewrite}>
                        <div className="em-rw-head">
                          <h3>{GRADE.rewrite}</h3>
                        </div>
                        <div className="em-ba" aria-label={`${GRADE.beforeAfter}: ${gradeResult.score.value} then ${gradeResult.rewrite.score} out of 10`}>
                          <div className="em-ba-col">
                            <ScoreBadge value={gradeResult.score.value} size="md" />
                            <span className="em-ba-cap">{GRADE.before}</span>
                          </div>
                          <span className="em-ba-arrow" aria-hidden="true">
                            <ArrowIcon size={22} />
                          </span>
                          <div className="em-ba-col">
                            <ScoreBadge value={gradeResult.rewrite.score} size="md" />
                            <span className="em-ba-cap">{GRADE.after}</span>
                          </div>
                        </div>
                        <EmailHead to={RESULT.toDefault} subject={gradeResult.rewrite.subject} />
                        <div className="em-body">{gradeResult.rewrite.body}</div>
                        <div className="em-actions">
                          <button type="button" className="sv-btn sv-btn-sm em-act-main" onClick={() => void copyRewrite()}>
                            <CopyIcon />
                            {copied === "rewrite" ? RESULT.copied : RESULT.copy}
                          </button>
                          <a
                            className="em-btn-ghost"
                            href={gmailComposeUrl(gradeResult.rewrite.subject, gradeResult.rewrite.body)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              track("emailer_gmail", { where: "grade", score: gradeResult.rewrite?.score });
                              maybeStuModal();
                            }}
                          >
                            <MailIcon />
                            {RESULT.gmail}
                          </a>
                        </div>
                      </section>
                    ) : (
                      <section className="em-card em-mail" aria-label={GRADE.rewrite}>
                        <div className="em-rw-head">
                          <h3>{GRADE.rewrite}</h3>
                        </div>
                        {signedIn ? (
                          <p className="em-hint">{GRADE.emptyLine}</p>
                        ) : (
                          <LockedOver line={GRADE.rewriteLocked} signInHref={SIGN_IN} onSignIn={onSignIn("rewrite")}>
                            <EmailHead to={RESULT.toDefault} subject={EXAMPLE.subject} />
                            <div className="em-body">{EXAMPLE.body}</div>
                          </LockedOver>
                        )}
                      </section>
                    )}
                    <ResultStuCard />
                  </div>
                ) : (
                  <div className="em-card em-empty">
                    <ScoreBadge value={0} size="md" />
                    <h3 className="sv-h3">{GRADE.emptyTitle}</h3>
                    <p className="sv-body">{GRADE.emptyLine}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── the sign-in wall ── */}
      <Modal open={modal === "signin"} onClose={() => setModal(null)} labelledBy="em-wall-h">
        <div className="em-modal-in">
          <span className="em-lock-ico em-lock-ico-lg">
            <LockIcon size={22} />
          </span>
          <h2 className="em-modal-h" id="em-wall-h">
            {LOCK.title}
          </h2>
          <p className="sv-body">{LOCK.line}</p>
          <a href={SIGN_IN} className="sv-btn em-modal-go" onClick={onSignIn(wallWhere)}>
            {LOCK.go}
          </a>
          <StuLink cta="lock" className="em-textlink" onGo={() => setModal(null)}>
            {LOCK.orStu}
          </StuLink>
        </div>
      </Modal>

      {/* ── 4. after copy or Gmail ── */}
      <Modal open={modal === "stu"} onClose={() => setModal(null)} labelledBy="em-stu-h">
        <div className="em-modal-in">
          <StuHead size={76} face="happy" />
          <h2 className="em-modal-h" id="em-stu-h">
            {STU.modalTitle}
          </h2>
          <p className="sv-body">{STU.modalLine}</p>
          <StuLink cta="modal" className="sv-btn em-modal-go" onGo={() => setModal(null)}>
            {STU.modalGo}
            <ArrowIcon size={18} />
          </StuLink>
          <button type="button" className="em-textlink" onClick={() => setModal(null)}>
            {STU.modalNo}
          </button>
        </div>
      </Modal>

      <StickyBar hidden={modal !== null} />
    </>
  );
}

function NoticeBox({ notice }: { notice: NonNullable<Notice> }) {
  const stu = notice.kind === "limit" || notice.kind === "busy";
  return (
    <div className="em-notice" data-kind={notice.kind} role="alert">
      <p>{notice.message}</p>
      {stu ? (
        <StuLink cta={notice.kind === "busy" ? "busy" : "limit"} className="sv-btn sv-btn-sm">
          {ERRORS.limitGo}
          <ArrowIcon size={16} />
        </StuLink>
      ) : null}
    </div>
  );
}

function Loading({ company, grade = false }: { company: string; grade?: boolean }) {
  const steps = grade ? ["Reading your email", "Checking it like a hiring manager would", "Writing the fixes"] : LOADING_STEPS(company);
  const [at, setAt] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setAt((a) => Math.min(a + 1, steps.length - 1)), 1600);
    return () => window.clearInterval(t);
  }, [steps.length]);
  return (
    <div className="em-card em-loading" role="status">
      <StuHead size={64} face="grin" className="em-loading-stu" />
      <ol>
        {steps.map((s, i) => (
          <li key={s} data-state={i < at ? "done" : i === at ? "now" : "next"}>
            <i aria-hidden="true" />
            {s}
          </li>
        ))}
      </ol>
      <div className="em-skel" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

/** The empty state: a made-up example, labelled. Desktop only (phones go straight from the form to the result). */
function ExampleOut() {
  return (
    <div className="em-example">
      <div className="em-example-label">
        <span className="em-pill">{RESULT.example}</span>
        <span className="em-hint">{RESULT.emptyLine}</span>
      </div>
      <div className="em-card em-scorecard em-scorecard-mini">
        <ScoreBadge value={EXAMPLE.score} size="md" />
        <div className="em-verdict">
          <span className="sv-kicker">{RESULT.scoreKicker}</span>
          <p>Short, specific and easy to say yes to.</p>
        </div>
      </div>
      <section className="em-card em-mail" aria-label="an example email">
        <EmailHead to={EXAMPLE.to} subject={EXAMPLE.subject} />
        <EmailBody body={EXAMPLE.body} highlights={EXAMPLE.highlights} />
      </section>
    </div>
  );
}

function Spinner() {
  return <span className="em-spin" aria-hidden="true" />;
}

function ScoreGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}
