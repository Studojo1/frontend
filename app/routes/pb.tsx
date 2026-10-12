import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode, RefObject } from "react";
import { data, isRouteErrorResponse, useFetcher } from "react-router";
import type { ShouldRevalidateFunctionArgs } from "react-router";
import { toast } from "sonner";
import type { Route } from "./+types/pb";
import { Header } from "~/components/common/header";
import { requirePbStudent } from "~/lib/pb/guard.server";
import type { PbUser } from "~/lib/pb/guard.server";
import {
  getProfile,
  listPostsForStudent,
  markPostCopied,
  markPostPosted,
  saveProfile,
} from "~/lib/pb/store.server";
import { kickPbRunner } from "~/lib/pb/runner.server";
import { describeError } from "~/lib/error-detail";
import { detectInAppBrowser } from "~/lib/in-app-browser";
import { authUrl, safeReturnPath } from "~/lib/return-to";
import { stripDashes } from "~/lib/strip-dashes";
import {
  PB_EMOJI,
  PB_FORMAT_LABELS,
  PB_LANGS,
  PB_LIMITS,
  PB_MARKETS,
  PB_RELATIONS,
  PB_TONE_SCALES,
  PB_TOPICS,
  profileCompleteness,
} from "~/lib/pb/model";
import type { PbPost, PbProfileInput, PbStory } from "~/lib/pb/model";
import {
  PB_CUSTOM_TOPICS_MAX,
  PB_FIELDS,
  PB_SAVE_INTENT,
  PB_TONE_KEYS,
  emptyProfileInput,
  freshStoryId,
  normalizePostedUrl,
  normalizeProfileInput,
  parseProfileForm,
  profileToInput,
  splitCustomTopics,
  splitTopicsForForm,
  toneField,
  topicCount,
  topicSlug,
} from "~/lib/pb/profile-form";
import type { PbToneKey } from "~/lib/pb/profile-form";

/**
 * /pb: the student side of the LinkedIn posts service.
 *
 * A signed-in student tells the Studojo team about themselves (About you) and
 * later reads the finished posts written for them, ready to copy. Students
 * only write about themselves and read here; generation is triggered by staff
 * on /pbadmin and runs in the background.
 *
 * Exists on the apex staging host and localhost only. requirePbStudent throws
 * a 404 anywhere else, exactly like /content, so on studojo.com this URL does
 * not exist. meta and headers add nothing on that 404, so it looks the same as
 * any other missing page.
 *
 * Every action answers with data and never relies on a reload: the page keeps
 * its own state after a save, a copy or a "posted", and opts out of
 * revalidation for them. clientAction turns a dropped connection into a
 * message instead of the error page, so a flaky phone network cannot wipe a
 * half-written story. Unsaved changes are also kept in this browser until
 * they are saved.
 */

/* ------------------------------------------------------------------ types */

/** A delivered post, as the student may see it. Never the angle or the review: those are staff only. */
type StudentPost = {
  id: number;
  body: string;
  firstComment: string | null;
  format: string | null;
  arrivedAt: string;
  copied: boolean;
  postedAt: string | null;
  postedUrl: string | null;
};

type Me = { id: string; name: string | null; image: string | null };

type StudentData = {
  kind: "student";
  me: Me;
  profile: PbProfileInput;
  savedAt: string | null;
  posts: StudentPost[];
};

/** Shown instead of the sign-in redirect inside an app's built-in browser, where sign-in can be refused. */
type SignInData = { kind: "signin"; app: string; signInUrl: string };

type ActionResult = {
  intent: string;
  ok: boolean;
  error?: string;
  errors?: Record<string, string>;
  profile?: PbProfileInput;
  savedAt?: string;
  postId?: number;
  postedUrl?: string | null;
};

const COPIED_INTENT = "copied";
const POSTED_INTENT = "posted";
const POST_ID_FIELD = "postId";
const POSTED_URL_FIELD = "url";
const SAVE_FETCHER_KEY = "pb-save-profile";
const FORM_ID = "pb-profile-form";
const MIN_STORY_SLOTS = 2;
const NO_STORE = { "Cache-Control": "private, no-store" };
const OFFLINE_MESSAGE = "We could not reach Studojo. Check your connection and try again.";
const SERVER_MESSAGE = "Something went wrong on our side. Please try again.";

/* ------------------------------------------------------------ server side */

export function meta({ loaderData, error }: Route.MetaArgs) {
  // Nothing on an error: off-host this route is a plain 404.
  if (error || !loaderData) return [];
  return [
    { title: "Your LinkedIn posts | Studojo" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  // Personal content: never cached. Taken from the loader so a 404 keeps the default headers.
  const cacheControl = loaderHeaders.get("Cache-Control");
  return cacheControl ? { "Cache-Control": cacheControl } : {};
}

/** Name of the app whose built-in browser this is, when it is one. */
function inAppBrowserName(ua: string | null): string | null {
  if (!ua) return null;
  if (/LinkedInApp/i.test(ua)) return "LinkedIn";
  const meta = detectInAppBrowser(ua);
  if (meta === "instagram") return "Instagram";
  if (meta === "facebook") return "Facebook";
  return null;
}

/**
 * Students are often sent this link in a LinkedIn message, and the LinkedIn
 * app opens it in its own browser, where Google can refuse to sign people in.
 * There, instead of the straight redirect, show a page with the sign-in link
 * and a way out to the phone's real browser. Everywhere else the redirect
 * from requirePbStudent stands.
 */
function inAppSignIn(err: unknown, request: Request): SignInData | null {
  if (!(err instanceof Response) || err.status < 300 || err.status >= 400) return null;
  const app = inAppBrowserName(request.headers.get("user-agent"));
  if (!app) return null;
  const signInUrl = safeReturnPath(err.headers.get("Location")) ?? authUrl("signin", "/pb");
  return { kind: "signin", app, signInUrl };
}

function toStudentPost(p: PbPost): StudentPost {
  const firstComment = p.firstComment?.trim() ? stripDashes(p.firstComment) : null;
  return {
    id: p.id,
    body: stripDashes(p.body),
    firstComment,
    format: PB_FORMAT_LABELS[p.format] ?? null,
    arrivedAt: p.deliveredAt ?? p.createdAt,
    copied: Boolean(p.copiedAt),
    postedAt: p.postedAt,
    postedUrl: p.postedUrl,
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  let user: PbUser;
  try {
    user = await requirePbStudent(request);
  } catch (err) {
    const wall = inAppSignIn(err, request);
    if (wall) return data<StudentData | SignInData>(wall, { headers: NO_STORE });
    throw err;
  }

  // Keeps queued jobs moving. Fire and forget: the page never waits on it.
  try {
    kickPbRunner();
  } catch (err) {
    console.error("[pb] could not kick the runner:", describeError(err));
  }

  const profile = await getProfile(user.id);
  const posts = await listPostsForStudent(user.id);
  const page: StudentData = {
    kind: "student",
    me: { id: user.id, name: user.name, image: user.image },
    profile: profile ? profileToInput(profile) : emptyProfileInput({ name: user.name }),
    savedAt: profile?.updatedAt ?? null,
    posts: posts.map(toStudentPost),
  };
  return data<StudentData | SignInData>(page, { headers: NO_STORE });
}

function reply(result: ActionResult, status = 200) {
  return data(result, { status, headers: NO_STORE });
}

/** A post id from the form: a positive whole number that fits the int column, or null. */
function readPostId(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string" || !/^\d{1,10}$/.test(v)) return null;
  const n = Number(v);
  return n > 0 && n <= 2147483647 ? n : null;
}

export async function action({ request }: Route.ActionArgs) {
  // The user always comes from the session, never from the form.
  const user = await requirePbStudent(request);
  if (request.method !== "POST") return reply({ intent: "", ok: false, error: "Not allowed." }, 405);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply({ intent: "", ok: false, error: "That did not come through. Please try again." }, 400);
  }
  const rawIntent = form.get(PB_FIELDS.intent);
  const intent = typeof rawIntent === "string" ? rawIntent : "";

  try {
    if (intent === PB_SAVE_INTENT) {
      const { input, errors } = parseProfileForm(form);
      if (Object.keys(errors).length > 0) return reply({ intent, ok: false, errors }, 400);
      const saved = await saveProfile({ id: user.id, email: user.email }, input);
      return reply({ intent, ok: true, profile: profileToInput(saved), savedAt: saved.updatedAt });
    }

    if (intent === COPIED_INTENT || intent === POSTED_INTENT) {
      const postId = readPostId(form.get(POST_ID_FIELD));
      if (postId === null) return reply({ intent, ok: false, error: "That post could not be found." }, 400);
      const gone = "This post is no longer on your page. Reload to see your current posts.";
      if (intent === COPIED_INTENT) {
        if (!(await markPostCopied(postId, user.id))) return reply({ intent, ok: false, postId, error: gone }, 409);
        return reply({ intent, ok: true, postId });
      }
      const { url, error } = normalizePostedUrl(form.get(POSTED_URL_FIELD));
      if (error) return reply({ intent, ok: false, postId, error }, 400);
      if (!(await markPostPosted(postId, user.id, url))) return reply({ intent, ok: false, postId, error: gone }, 409);
      return reply({ intent, ok: true, postId, postedUrl: url });
    }
  } catch (err) {
    console.error(`[pb] ${intent || "action"} failed:`, describeError(err));
    return reply({ intent, ok: false, error: SERVER_MESSAGE }, 500);
  }

  return reply({ intent, ok: false, error: "Unknown action." }, 400);
}

/**
 * Runs in the browser around every submission. A network failure (a dropped
 * phone connection, a pod restarting mid-deploy) would otherwise reach the
 * error page and throw away whatever the student was typing. Redirects (an
 * expired session) and real HTTP errors keep their normal handling. The 503
 * status also stops React Router reloading data after the failure.
 */
export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  try {
    return await serverAction();
  } catch (err) {
    if (err instanceof Response) throw err;
    // The ingress answers 502, 503 or 504 while pods restart in a deploy:
    // that is a dropped connection too, not an application error.
    if (isRouteErrorResponse(err) && ![502, 503, 504].includes(err.status)) throw err;
    return data<ActionResult>({ intent: "", ok: false, error: OFFLINE_MESSAGE }, { status: 503 });
  }
}

/** Every action here updates the page itself from its answer, so a reload would only cost a round trip. */
export function shouldRevalidate({ formData, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  const intent = formData?.get(PB_FIELDS.intent);
  if (intent === PB_SAVE_INTENT || intent === COPIED_INTENT || intent === POSTED_INTENT) return false;
  return defaultShouldRevalidate;
}

/* -------------------------------------------------------------- styling */

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studojo-purple-strong focus-visible:ring-offset-2";
const BTN_BASE = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-neutral-900 px-5 py-2.5 font-satoshi text-base font-bold transition-transform disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`;
const BTN_PRIMARY = `${BTN_BASE} bg-studojo-purple-strong text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`;
const BTN_SECONDARY = `${BTN_BASE} bg-white text-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]`;
const BTN_LINK = `inline-flex min-h-11 items-center rounded-lg px-2 font-satoshi text-base font-bold text-studojo-purple-strong underline underline-offset-4 hover:text-neutral-900 ${FOCUS_RING}`;
const CARD = "rounded-2xl border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]";
const CONTROL =
  "block w-full rounded-xl border-2 bg-white px-4 py-3 font-satoshi text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-studojo-purple-strong focus:ring-offset-2";
const PILL = `inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-neutral-900 bg-white px-4 font-satoshi text-base font-bold text-neutral-900 hover:bg-neutral-50 ${FOCUS_RING}`;

function controlClass(hasError: boolean): string {
  return `${CONTROL} ${hasError ? "border-red-600" : "border-neutral-900"}`;
}

/** aria-describedby for a control with optional help and error lines. */
function describedBy(id: string, hasHelp: boolean, error?: string): string | undefined {
  const ids = [hasHelp ? `${id}-help` : "", error ? `${id}-error` : ""].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

/* ---------------------------------------------------------- small helpers */

/** True after the first client render. Anything that differs between server and browser waits for it. */
function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

const UTC_DAY = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** A day, in UTC on the server and the first render, then in the reader's own time zone. */
function ClientDate({ iso }: { iso: string }) {
  const hydrated = useHydrated();
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const text = hydrated
    ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : UTC_DAY.format(d);
  return <time dateTime={iso}>{text}</time>;
}

function safeHref(url: string | null | undefined): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

/** Scroll a control into view and focus it. Topics and stories point at their first useful control. */
function focusField(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = el.matches("input, textarea, select, button")
    ? el
    : el.querySelector<HTMLElement>("input:not([type=hidden]), textarea, select, button") ?? el;
  target.scrollIntoView({ block: "center" });
  target.focus({ preventScroll: true });
}

/** Last-resort copy for browsers that refuse the clipboard API: a hidden textarea and execCommand. */
function legacyCopy(text: string): boolean {
  const previous = document.activeElement as HTMLElement | null;
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.setAttribute("aria-hidden", "true");
  Object.assign(ta.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "1px",
    height: "1px",
    opacity: "0",
    fontSize: "16px",
  });
  document.body.appendChild(ta);
  let ok = false;
  try {
    ta.focus({ preventScroll: true });
    ta.select();
    ta.setSelectionRange(0, text.length);
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  previous?.focus({ preventScroll: true });
  return ok;
}

/**
 * Copy text from inside a click handler. The clipboard API first; then the old
 * execCommand route, which some in-app browsers still allow; and failing both,
 * select the visible text so the student can copy it by hand.
 */
async function copyText(text: string, visible: HTMLElement | null): Promise<"copied" | "selected" | "failed"> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return "copied";
    }
  } catch {
    // Refused (no permission, not a secure context, an in-app browser). Try the next way.
  }
  if (legacyCopy(text)) return "copied";
  if (visible) {
    const range = document.createRange();
    range.selectNodeContents(visible);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    return "selected";
  }
  return "failed";
}

const HASHTAG = /(#[\p{L}\p{N}_]+)/u;

/** Post text with hashtags tinted the way LinkedIn shows them. The text itself is untouched. */
function renderPostText(text: string): ReactNode[] {
  return text.split(HASHTAG).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-semibold text-[#0a66c2]">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function Avatar({ name, image }: { name: string; image: string | null }) {
  const [broken, setBroken] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // An image that failed before hydration never fires React's onError.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, []);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => Array.from(w)[0]?.toUpperCase() ?? "")
      .join("") || "?";
  const src = safeHref(image);
  if (src && !broken) {
    return (
      <img
        ref={ref}
        src={src}
        alt=""
        width={48}
        height={48}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className="h-12 w-12 shrink-0 rounded-full border-2 border-neutral-900 object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-studojo-purple-bg font-clash text-lg font-medium text-studojo-purple-strong"
    >
      {initials}
    </span>
  );
}

/* ------------------------------------------------------------------ page */

export default function PbPage({ loaderData }: Route.ComponentProps) {
  if (loaderData.kind === "signin") {
    return <SignInFromApp app={loaderData.app} signInUrl={loaderData.signInUrl} />;
  }
  return <StudentView page={loaderData} />;
}

function SignInFromApp({ app, signInUrl }: { app: string; signInUrl: string }) {
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    const result = await copyText(window.location.href, null);
    setCopied(result === "copied");
  };
  return (
    <>
      <Header />
      <main id="main" className="min-h-screen bg-studojo-purple-bg px-4 py-10 font-satoshi text-neutral-900 md:py-16">
        <div className={`${CARD} mx-auto w-full max-w-md p-6 sm:p-8`}>
          <h1 className="font-clash text-3xl font-medium leading-tight tracking-tight">Your LinkedIn posts</h1>
          <p className="mt-3 text-base leading-relaxed text-neutral-700">
            Sign in to see the posts written for you, and to tell us about yourself.
          </p>
          <a href={signInUrl} className={`${BTN_PRIMARY} mt-6 w-full`}>
            Sign in
          </a>
          <div className="mt-6 rounded-xl border-2 border-neutral-900 bg-studojo-yellow-bg p-4">
            <p className="text-base font-bold">You opened this inside {app}</p>
            <p className="mt-1 text-base leading-relaxed text-neutral-800">
              If sign-in fails here, open this page in your browser. Tap the menu (the three dots), then Open in
              browser. Or copy the link and paste it into your browser.
            </p>
            <button type="button" onClick={() => void copyLink()} className={`${BTN_SECONDARY} mt-3 w-full sm:w-auto`}>
              {copied ? (
                <>
                  <CheckIcon /> Link copied
                </>
              ) : (
                "Copy link"
              )}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

function StudentView({ page }: { page: StudentData }) {
  const profile = useProfileForm(page);
  const live = profile.current.input;
  const author = {
    name: live.name || page.me.name || "You",
    headline: live.headline,
    image: page.me.image,
  };
  const { score } = profileCompleteness(live);

  return (
    <>
      <Header />
      <main id="main" className="min-h-screen bg-studojo-purple-bg font-satoshi text-neutral-900">
        <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-8 sm:px-6 md:pt-12">
          <header className="mb-10">
            <h1 className="font-clash text-4xl font-medium leading-tight tracking-tight md:text-5xl">
              Your LinkedIn posts
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-neutral-700">
              Studojo writes posts for you from what you share below. Finished posts show up here, ready to
              copy and post.
            </p>
            <nav aria-label="On this page" className="mt-5 flex flex-wrap gap-2">
              <a href="#posts" className={PILL}>
                {page.posts.length === 1 ? "1 post" : `${page.posts.length} posts`}
              </a>
              <a href="#about-you" className={PILL}>
                About you <span className="text-studojo-purple-strong">{score}%</span>
              </a>
            </nav>
          </header>

          <PostsSection posts={page.posts} author={author} score={score} />
          <AboutYou form={profile} hasProfile={page.savedAt !== null} />
        </div>
      </main>
    </>
  );
}

/* ------------------------------------------------------------------ posts */

type Author = { name: string; headline: string; image: string | null };

function PostsSection({ posts, author, score }: { posts: StudentPost[]; author: Author; score: number }) {
  return (
    <section id="posts" aria-labelledby="pb-posts-title" className="scroll-mt-24 md:scroll-mt-32">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="pb-posts-title" className="font-clash text-2xl font-medium md:text-3xl">
          Your posts
        </h2>
        {posts.length > 0 && <p className="text-base text-neutral-600">Newest first</p>}
      </div>
      {posts.length === 0 ? (
        <EmptyPosts score={score} />
      ) : (
        <>
          <ol className="mt-4 space-y-8">
            {posts.map((p, i) => (
              <li key={p.id}>
                <PostCard post={p} author={author} position={i + 1} total={posts.length} />
              </li>
            ))}
          </ol>
          <Tips />
        </>
      )}
    </section>
  );
}

function EmptyPosts({ score }: { score: number }) {
  return (
    <div className="mt-4 rounded-2xl border-2 border-dashed border-neutral-500 bg-white p-6 text-center sm:p-8">
      <p className="font-clash text-xl font-medium">Your posts will show up here</p>
      <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-neutral-700">
        The team writes them from what you share in About you. Real stories and a writing sample matter most. They
        are what make a post sound like you and nobody else.
      </p>
      <a href="#about-you" className={`${BTN_PRIMARY} mt-5`}>
        {score >= 100 ? "Check About you" : score > 10 ? "Finish About you" : "Fill in About you"}
      </a>
    </div>
  );
}

function Tips() {
  const tips = [
    "Post when the people you want to reach are online, not late at night.",
    "Stay around for the first hour and reply to every comment.",
    "If a post has a first comment, add it straight after you post.",
    "Change anything that does not sound like you. It goes out under your name.",
  ];
  return (
    <aside aria-labelledby="pb-tips-title" className="mt-8 rounded-2xl border-2 border-neutral-900 bg-white p-5 sm:p-6">
      <h3 id="pb-tips-title" className="font-clash text-xl font-medium">
        Before you post
      </h3>
      <ul className="mt-3 space-y-2">
        {tips.map((t) => (
          <li key={t} className="flex gap-3 text-base leading-relaxed text-neutral-800">
            <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-sm bg-studojo-purple-strong" />
            <span className="min-w-0">{t}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function PostedBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-emerald-700 bg-studojo-green-bg px-2.5 py-0.5 text-sm font-bold text-emerald-900">
      <CheckIcon size={14} /> Posted
    </span>
  );
}

function PostCard({
  post,
  author,
  position,
  total,
}: {
  post: StudentPost;
  author: Author;
  position: number;
  total: number;
}) {
  const copyFetcher = useFetcher<ActionResult>();
  const postedFetcher = useFetcher<ActionResult>();
  const bodyRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLParagraphElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const handled = useRef<ActionResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [justCopied, setJustCopied] = useState<"post" | "comment" | null>(null);
  const [reported, setReported] = useState(post.copied);
  const [posted, setPosted] = useState<{ url: string | null } | null>(
    post.postedAt ? { url: post.postedUrl } : null,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [url, setUrl] = useState(post.postedUrl ?? "");
  const [urlError, setUrlError] = useState<string | null>(null);
  const sending = postedFetcher.state !== "idle";
  const titleId = `pb-post-${post.id}-title`;
  const urlId = `pb-post-${post.id}-url`;

  useEffect(() => {
    if (!justCopied) return;
    const t = window.setTimeout(() => setJustCopied(null), 2500);
    return () => window.clearTimeout(t);
  }, [justCopied]);

  useEffect(() => {
    if (formOpen) urlRef.current?.focus();
  }, [formOpen]);

  useEffect(() => {
    const d = postedFetcher.data;
    if (postedFetcher.state !== "idle" || !d || handled.current === d) return;
    handled.current = d;
    if (d.ok) {
      setPosted((prev) => ({ url: d.postedUrl ?? prev?.url ?? null }));
      setFormOpen(false);
      setUrlError(null);
      setNotice("Marked as posted. Nice one.");
    } else {
      setUrlError(d.error ?? SERVER_MESSAGE);
    }
  }, [postedFetcher.state, postedFetcher.data]);

  const copy = async (what: "post" | "comment") => {
    const text = what === "post" ? post.body : (post.firstComment ?? "");
    const result = await copyText(text, what === "post" ? bodyRef.current : commentRef.current);
    if (result === "copied") {
      setJustCopied(what);
      setNotice(
        what === "comment"
          ? "Comment copied. Add it under your post once it is live."
          : post.firstComment
            ? "Post copied. Paste it into a new LinkedIn post, then come back for the first comment."
            : "Post copied. Paste it into a new LinkedIn post.",
      );
      if (what === "post" && !reported) {
        setReported(true);
        void copyFetcher.submit(
          { [PB_FIELDS.intent]: COPIED_INTENT, [POST_ID_FIELD]: String(post.id) },
          { method: "post" },
        );
      }
      return;
    }
    setNotice(
      result === "selected"
        ? "This browser blocked copying, so the text is selected for you. Copy it from your device's menu."
        : "Copying did not work here. Press and hold the text to copy it.",
    );
  };

  const onPostedSubmit = (e: FormEvent<HTMLFormElement>) => {
    const check = normalizePostedUrl(url);
    if (check.error) {
      e.preventDefault();
      setUrlError(check.error);
      urlRef.current?.focus();
      return;
    }
    setUrlError(null);
  };

  const viewHref = safeHref(posted?.url);

  return (
    <article aria-labelledby={titleId} className={`${CARD} overflow-hidden`}>
      <h3 id={titleId} className="sr-only">
        {`Post ${position} of ${total}${post.format ? `, ${post.format}` : ""}`}
      </h3>

      <div className="flex items-start gap-3 p-4 sm:p-5">
        <Avatar name={author.name} image={author.image} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold leading-snug">{author.name}</p>
          {author.headline && (
            <p className="line-clamp-2 break-words text-sm leading-snug text-neutral-600">{author.headline}</p>
          )}
          <p className="mt-0.5 text-sm text-neutral-600">
            Ready <ClientDate iso={post.arrivedAt} />
            {post.format ? ` · ${post.format}` : ""}
          </p>
        </div>
        {posted && <PostedBadge />}
      </div>

      <div
        ref={bodyRef}
        className="whitespace-pre-wrap break-words px-4 pb-5 text-base leading-relaxed text-neutral-900 [overflow-wrap:anywhere] sm:px-5"
      >
        {renderPostText(post.body)}
      </div>

      {post.firstComment && (
        <div className="mx-4 mb-5 rounded-xl border-2 border-dashed border-neutral-500 bg-studojo-purple-bg p-4 sm:mx-5">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-studojo-purple-strong">First comment</p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-700">
            Add this as a comment on your own post, straight after it goes live.
          </p>
          <p
            ref={commentRef}
            className="mt-3 whitespace-pre-wrap break-words text-base leading-relaxed text-neutral-900 [overflow-wrap:anywhere]"
          >
            {renderPostText(post.firstComment)}
          </p>
          <button
            type="button"
            onClick={() => void copy("comment")}
            className={`${BTN_SECONDARY} mt-3 w-full sm:w-auto`}
          >
            {justCopied === "comment" ? (
              <>
                <CheckIcon /> Copied
              </>
            ) : (
              <>
                <CopyIcon /> Copy comment
              </>
            )}
          </button>
        </div>
      )}

      <div className="border-t-2 border-neutral-900 bg-neutral-50 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="button" onClick={() => void copy("post")} className={`${BTN_PRIMARY} w-full sm:w-auto`}>
            {justCopied === "post" ? (
              <>
                <CheckIcon /> Copied
              </>
            ) : (
              <>
                <CopyIcon /> Copy post
              </>
            )}
          </button>
          {posted ? (
            <div className="flex flex-wrap items-center gap-x-2">
              {viewHref && (
                <a href={viewHref} target="_blank" rel="noopener noreferrer" className={BTN_LINK}>
                  View your post
                </a>
              )}
              {!formOpen && (
                <button type="button" onClick={() => setFormOpen(true)} className={BTN_LINK}>
                  {posted.url ? "Change the link" : "Add the link"}
                </button>
              )}
            </div>
          ) : (
            !formOpen && (
              <button type="button" onClick={() => setFormOpen(true)} className={`${BTN_SECONDARY} w-full sm:w-auto`}>
                I posted it
              </button>
            )
          )}
        </div>

        {formOpen && (
          <postedFetcher.Form
            method="post"
            noValidate
            onSubmit={onPostedSubmit}
            className="mt-4 rounded-xl border-2 border-neutral-900 bg-white p-4"
          >
            <input type="hidden" name={PB_FIELDS.intent} value={POSTED_INTENT} />
            <input type="hidden" name={POST_ID_FIELD} value={post.id} />
            <label htmlFor={urlId} className="block text-base font-bold">
              Link to your post <span className="font-normal text-neutral-600">(optional)</span>
            </label>
            <p id={`${urlId}-help`} className="mt-1 text-sm leading-relaxed text-neutral-600">
              On LinkedIn, open the menu on your post and copy its link. You can also skip this.
            </p>
            <input
              ref={urlRef}
              id={urlId}
              name={POSTED_URL_FIELD}
              type="url"
              inputMode="url"
              autoComplete="off"
              maxLength={PB_LIMITS.postedUrl}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setUrlError(null);
              }}
              placeholder="https://www.linkedin.com/posts/..."
              aria-invalid={urlError ? true : undefined}
              aria-describedby={describedBy(urlId, true, urlError ?? undefined)}
              className={`${controlClass(Boolean(urlError))} mt-2`}
            />
            {urlError && (
              <p id={`${urlId}-error`} className="mt-1.5 text-sm font-medium text-red-700">
                {urlError}
              </p>
            )}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button type="submit" disabled={sending} className={BTN_PRIMARY}>
                {sending ? "Saving…" : posted ? "Save link" : "Mark as posted"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setUrlError(null);
                }}
                className={BTN_SECONDARY}
              >
                Cancel
              </button>
            </div>
          </postedFetcher.Form>
        )}

        <p role="status" aria-live="polite" className={notice ? "mt-3 text-base text-neutral-700" : ""}>
          {notice}
        </p>
      </div>
    </article>
  );
}

/* ----------------------------------------------------------- the form state */

/** The form as the page holds it: topics split into chips and the free text field. */
type FormState = Omit<PbProfileInput, "topics"> & { knownTopics: string[]; customTopics: string };

const TOPIC_ORDER: readonly string[] = PB_TOPICS;

function withStorySlots(stories: PbStory[]): PbStory[] {
  const out = stories.map((s) => ({ id: s.id, text: s.text }));
  for (let i = out.length; i < MIN_STORY_SLOTS; i++) {
    out.push({ id: freshStoryId(out.map((s) => s.id), String(i + 1)), text: "" });
  }
  return out;
}

function toFormState(p: PbProfileInput): FormState {
  const { known, custom } = splitTopicsForForm(p.topics);
  return {
    name: p.name,
    headline: p.headline,
    stage: p.stage,
    market: p.market,
    relation: p.relation,
    goals: p.goals,
    knownTopics: TOPIC_ORDER.filter((t) => known.includes(t)),
    customTopics: custom,
    stories: withStorySlots(p.stories),
    writingSample: p.writingSample,
    tone: { ...p.tone },
    emoji: p.emoji,
    lang: p.lang,
    avoid: p.avoid,
    linkedinUrl: p.linkedinUrl,
    extra: p.extra,
  };
}

function fromFormState(f: FormState): Record<string, unknown> {
  const { knownTopics, customTopics, ...rest } = f;
  return { ...rest, topics: [...knownTopics, ...splitCustomTopics(customTopics)] };
}

/** What would be saved, as one comparable string. Runs through the form shape so order quirks never count as a change. */
function savedKey(p: PbProfileInput): string {
  return JSON.stringify(normalizeProfileInput(fromFormState(toFormState(p))).input);
}

/** Unsaved changes kept in this browser are dropped after a week (shared computers). */
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function draftStorageKey(userId: string): string {
  return `pb:draft:v1:${userId}`;
}

function useProfileForm(page: StudentData) {
  const fetcher = useFetcher<ActionResult>({ key: SAVE_FETCHER_KEY });
  const [form, setForm] = useState<FormState>(() => toFormState(page.profile));
  const [baseline, setBaseline] = useState<PbProfileInput>(page.profile);
  const [savedAt, setSavedAt] = useState<string | null>(page.savedAt);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [restored, setRestored] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [errorFocus, setErrorFocus] = useState(0);
  const edits = useRef(0);
  const editsAtSubmit = useRef(-1);
  const handled = useRef<ActionResult | null>(null);

  const current = useMemo(() => normalizeProfileInput(fromFormState(form)), [form]);
  const currentKey = useMemo(() => JSON.stringify(current.input), [current]);
  const baselineKey = useMemo(() => savedKey(baseline), [baseline]);
  const dirty = currentKey !== baselineKey;
  const saving = fetcher.state !== "idle";
  const draftKey = draftStorageKey(page.me.id);

  const update = useCallback((next: (f: FormState) => FormState, field?: string) => {
    edits.current += 1;
    setForm(next);
    setJustSaved(false);
    if (field) {
      setErrors((e) => {
        if (!(field in e)) return e;
        const rest = { ...e };
        delete rest[field];
        return rest;
      });
    }
  }, []);

  // On arrival, bring back changes this browser kept from an earlier visit that never got saved.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { base?: unknown; at?: unknown; input?: unknown } | null;
        const kept = parsed && typeof parsed === "object" ? parsed.input : null;
        const draft = normalizeProfileInput(kept).input;
        // A draft is only worth bringing back on top of the version it was
        // typed against. If the profile was saved since (another device, or
        // another tab), or the draft is a week old, it is stale: restoring it
        // would put old text over newer saved work.
        const base = parsed && typeof parsed === "object" ? (parsed.base ?? null) : undefined;
        const at = parsed && typeof parsed === "object" && typeof parsed.at === "number" ? parsed.at : 0;
        const stale = base !== page.savedAt || Date.now() - at > DRAFT_MAX_AGE_MS;
        if (stale) {
          window.localStorage.removeItem(draftKey);
        } else if (JSON.stringify(normalizeProfileInput(fromFormState(toFormState(draft))).input) !== baselineKey) {
          edits.current += 1;
          setForm(toFormState(draft));
          setRestored(true);
        } else {
          window.localStorage.removeItem(draftKey);
        }
      }
    } catch {
      // Storage blocked (private windows, some in-app browsers) or a bad entry: start from the saved profile.
    }
    setDraftReady(true);
    // Once, on arrival: a draft is only ever compared with the profile the page loaded with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep unsaved changes in this browser, so a dropped connection or a closed tab does not lose them.
  useEffect(() => {
    if (!draftReady) return;
    const t = window.setTimeout(() => {
      try {
        if (dirty) {
          window.localStorage.setItem(draftKey, JSON.stringify({ v: 2, base: savedAt, at: Date.now(), input: current.input }));
        } else {
          window.localStorage.removeItem(draftKey);
        }
      } catch {
        // A convenience only. Save is what keeps the work.
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [draftReady, dirty, current, draftKey, savedAt]);

  // The answer to a save.
  useEffect(() => {
    const d = fetcher.data;
    if (fetcher.state !== "idle" || !d || handled.current === d) return;
    handled.current = d;
    if (d.ok && d.profile) {
      const saved = d.profile;
      setBaseline(saved);
      setSavedAt(d.savedAt ?? null);
      // Show what was stored, unless the student kept typing while it saved.
      if (edits.current === editsAtSubmit.current) setForm(toFormState(saved));
      setErrors({});
      setSaveError(null);
      setRestored(false);
      setJustSaved(true);
      toast.success("Saved. Your next posts will be written from this.");
      return;
    }
    if (d.errors && Object.keys(d.errors).length > 0) {
      setErrors(d.errors);
      setSaveError(null);
      setErrorFocus((n) => n + 1);
      return;
    }
    setSaveError(d.error ?? "That did not save. Please try again.");
  }, [fetcher.state, fetcher.data]);

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    const { errors: found } = parseProfileForm(new FormData(e.currentTarget));
    if (Object.keys(found).length > 0) {
      e.preventDefault();
      setErrors(found);
      setSaveError(null);
      setErrorFocus((n) => n + 1);
      return;
    }
    editsAtSubmit.current = edits.current;
    setErrors({});
    setSaveError(null);
  }, []);

  const discardDraft = useCallback(() => {
    edits.current += 1;
    setForm(toFormState(baseline));
    setRestored(false);
    setErrors({});
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // Nothing to clean up.
    }
  }, [baseline, draftKey]);

  return {
    fetcher,
    form,
    update,
    current,
    errors,
    saveError,
    savedAt,
    justSaved,
    restored,
    dirty,
    saving,
    errorFocus,
    onSubmit,
    discardDraft,
  };
}

type ProfileForm = ReturnType<typeof useProfileForm>;

/* --------------------------------------------------------------- about you */

const STORY_EXAMPLES = [
  "e.g. The week I emailed 30 founders about internships. Most never replied, one said yes, and what I changed in the email that worked.",
  "e.g. The group project where I ended up building the whole deck the night before, and what it taught me about speaking up earlier.",
  "e.g. Getting rejected after the final round for a role I really wanted, and what the interviewer said when I asked why.",
  "e.g. Starting a club in second year with four people, and how we filled the room for the first event.",
  "e.g. A side project I built over the summer that nobody used, and why I would do it again.",
  "e.g. The first time a stranger messaged me about something I had posted, and what came of it.",
];

const TONE_TITLES: Record<PbToneKey, string> = {
  formality: "Formality",
  rhythm: "Rhythm",
  energy: "Energy",
};

/** Words for a slider position, used on screen and read out by screen readers. */
function toneWord(value: number, left: string, right: string): string {
  if (value <= 1) return left;
  if (value === 2) return `Leans ${left.toLowerCase()}`;
  if (value === 3) return "Balanced";
  if (value === 4) return `Leans ${right.toLowerCase()}`;
  return right;
}

/** Error keys from the parser, and the control each one points at. */
const ERROR_TARGETS: Record<string, string> = {
  name: "pb-name",
  headline: "pb-headline",
  linkedinUrl: "pb-linkedin-url",
};

/** profileCompleteness's missing items, in words, and where each one is filled in. */
const MISSING_ITEMS: Record<string, { label: string; target: string }> = {
  name: { label: "your name", target: "pb-name" },
  headline: { label: "your headline", target: "pb-headline" },
  goals: { label: "what you are aiming for", target: "pb-goals" },
  topics: { label: "a few topics", target: "pb-topics" },
  stories: { label: "two real stories", target: "pb-stories" },
  "a second story": { label: "a second story", target: "pb-stories" },
  "writing sample": { label: "a writing sample", target: "pb-writing-sample" },
};

function storyDomId(id: string): string {
  return `pb-story-${id}`;
}

function FieldShell({
  id,
  label,
  help,
  error,
  required,
  counter,
  children,
}: {
  id: string;
  label: string;
  help?: ReactNode;
  error?: string;
  required?: boolean;
  counter?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <label htmlFor={id} className="text-base font-bold text-neutral-900">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-2 text-sm font-medium text-studojo-purple-strong">
              Required
            </span>
          )}
        </label>
        {counter}
      </div>
      {help && (
        <p id={`${id}-help`} className="mt-1 text-sm leading-relaxed text-neutral-600">
          {help}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <span className="text-sm tabular-nums text-neutral-600">
      {value.toLocaleString("en-US")}/{max.toLocaleString("en-US")}
    </span>
  );
}

function TextField({
  id,
  name,
  label,
  value,
  onChange,
  maxLength,
  help,
  error,
  required,
  placeholder,
  autoComplete = "off",
  type = "text",
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  help?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  type?: "text" | "url";
}) {
  return (
    <FieldShell id={id} label={label} help={help} error={error} required={required}>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={type === "url" ? "url" : undefined}
        autoComplete={autoComplete}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-required={required ? true : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, Boolean(help), error)}
        className={controlClass(Boolean(error))}
      />
    </FieldShell>
  );
}

function TextAreaField({
  id,
  name,
  label,
  value,
  onChange,
  maxLength,
  rows,
  help,
  placeholder,
  counter,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  rows: number;
  help?: string;
  placeholder?: string;
  counter?: boolean;
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      help={help}
      counter={counter ? <Counter value={value.length} max={maxLength} /> : undefined}
    >
      <textarea
        id={id}
        name={name}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-describedby={describedBy(id, Boolean(help))}
        className={`${controlClass(false)} resize-y leading-relaxed`}
      />
    </FieldShell>
  );
}

function OptionRow({
  id,
  name,
  value,
  label,
  checked,
  onChange,
}: {
  id: string;
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 text-base transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-studojo-purple-strong has-[:focus-visible]:ring-offset-2 ${
        checked ? "border-neutral-900 bg-studojo-purple-bg font-bold" : "border-neutral-300 bg-white hover:border-neutral-900"
      }`}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 shrink-0 accent-studojo-purple-strong focus:outline-none"
      />
      <span className="min-w-0">{label}</span>
    </label>
  );
}

function GroupTitle({ children }: { children: ReactNode }) {
  return <h3 className="border-t-2 border-neutral-200 pt-6 font-clash text-xl font-medium">{children}</h3>;
}

function Meter({ input, onJump }: { input: PbProfileInput; onJump: (target: string) => void }) {
  const { score, missing } = profileCompleteness(input);
  return (
    <div className="rounded-xl border-2 border-neutral-900 bg-studojo-purple-bg p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p id="pb-meter-label" className="text-base font-bold">
          How much we have to work with
        </p>
        <p className="font-clash text-2xl font-medium text-studojo-purple-strong">{score}%</p>
      </div>
      <div
        role="progressbar"
        aria-labelledby="pb-meter-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        className="mt-3 h-3 w-full overflow-hidden rounded-full border-2 border-neutral-900 bg-white"
      >
        <div className="h-full bg-studojo-purple-strong transition-[width]" style={{ width: `${score}%` }} />
      </div>
      {missing.length > 0 ? (
        <div className="mt-3 text-base text-neutral-800">
          <span>Still to add: </span>
          <ul className="inline">
            {missing.map((m, i) => {
              const item = MISSING_ITEMS[m] ?? { label: m, target: "pb-about-title" };
              return (
                <li key={m} className="inline">
                  <a
                    href={`#${item.target}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onJump(item.target);
                    }}
                    className={`font-bold text-studojo-purple-strong underline underline-offset-4 ${FOCUS_RING} rounded`}
                  >
                    {item.label}
                  </a>
                  {i < missing.length - 1 ? ", " : "."}
                </li>
              );
            })}
          </ul>
          <span className="mt-1 block text-sm text-neutral-600">Stories and a writing sample count the most.</span>
        </div>
      ) : (
        <p className="mt-3 text-base text-neutral-800">This is everything we need. You can keep adding to it anytime.</p>
      )}
    </div>
  );
}

function ErrorSummary({ errors, boxRef }: { errors: Record<string, string>; boxRef: RefObject<HTMLDivElement | null> }) {
  const keys = Object.keys(errors);
  return (
    <div
      ref={boxRef}
      tabIndex={-1}
      className="scroll-mt-28 rounded-xl border-2 border-red-600 bg-red-50 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
    >
      <div role="alert">
        <p className="text-base font-bold text-red-800">
          {keys.length === 1 ? "One thing to fix before you save:" : "A few things to fix before you save:"}
        </p>
        <ul className="mt-1">
          {keys.map((k) => {
            const target = ERROR_TARGETS[k] ?? "pb-about-title";
            return (
              <li key={k}>
                <a
                  href={`#${target}`}
                  onClick={(e) => {
                    e.preventDefault();
                    focusField(target);
                  }}
                  className={`inline-flex min-h-11 items-center text-base font-medium text-red-800 underline underline-offset-4 ${FOCUS_RING} rounded`}
                >
                  {errors[k]}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function FloatingSave({ saving }: { saving: boolean }) {
  return (
    <div data-floating-cta className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,26rem)] -translate-x-1/2">
      <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-neutral-900 bg-white py-2 pl-4 pr-2 font-satoshi shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
        <p className="min-w-0 text-base font-bold text-neutral-900">Unsaved changes</p>
        <button type="submit" form={FORM_ID} disabled={saving} className={`${BTN_PRIMARY} shrink-0`}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

function AboutYou({ form: f, hasProfile }: { form: ProfileForm; hasProfile: boolean }) {
  const { form, update, errors } = f;
  const summaryRef = useRef<HTMLDivElement>(null);
  const saveRowRef = useRef<HTMLDivElement>(null);
  const [saveRowInView, setSaveRowInView] = useState(true);
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);
  const [removed, setRemoved] = useState<{ story: PbStory; index: number } | null>(null);

  const topics = topicCount(form.knownTopics, form.customTopics);
  const atTopicLimit = topics >= PB_LIMITS.topics;
  const sampleLength = form.writingSample.trim().length;
  const errorKeys = Object.keys(errors);

  useEffect(() => {
    if (f.errorFocus === 0) return;
    const box = summaryRef.current;
    if (!box) return;
    box.scrollIntoView({ block: "start" });
    box.focus({ preventScroll: true });
  }, [f.errorFocus]);

  useEffect(() => {
    if (!pendingFocus) return;
    document.getElementById(pendingFocus)?.focus();
    setPendingFocus(null);
  }, [pendingFocus]);

  useEffect(() => {
    const el = saveRowRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setSaveRowInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K], errorKey?: string) =>
    update((s) => ({ ...s, [key]: value }), errorKey);

  const toggleTopic = (topic: string) =>
    update((s) => {
      const picked = new Set(s.knownTopics);
      if (picked.has(topic)) picked.delete(topic);
      else picked.add(topic);
      return { ...s, knownTopics: TOPIC_ORDER.filter((t) => picked.has(t)) };
    });

  const setStory = (id: string, text: string) =>
    update((s) => ({ ...s, stories: s.stories.map((st) => (st.id === id ? { ...st, text } : st)) }));

  const addStory = () => {
    if (form.stories.length >= PB_LIMITS.stories) return;
    const id = freshStoryId(
      form.stories.map((s) => s.id),
      Date.now().toString(36),
    );
    update((s) => (s.stories.length >= PB_LIMITS.stories ? s : { ...s, stories: [...s.stories, { id, text: "" }] }));
    setRemoved(null);
    setPendingFocus(storyDomId(id));
  };

  const removeStory = (id: string) => {
    const index = form.stories.findIndex((s) => s.id === id);
    if (index < 0) return;
    const story = form.stories[index];
    update((s) => ({ ...s, stories: s.stories.filter((st) => st.id !== id) }));
    const hadText = Boolean(story.text.trim());
    setRemoved(hadText ? { story, index } : null);
    setPendingFocus(hadText ? "pb-story-undo" : "pb-add-story");
  };

  const undoRemove = () => {
    if (!removed) return;
    const { story, index } = removed;
    update((s) => {
      if (s.stories.some((st) => st.id === story.id) || s.stories.length >= PB_LIMITS.stories) return s;
      const stories = [...s.stories];
      stories.splice(Math.min(index, stories.length), 0, story);
      return { ...s, stories };
    });
    setRemoved(null);
    setPendingFocus(storyDomId(story.id));
  };

  const jump = (target: string) => {
    if (target === "pb-stories") {
      const empty = form.stories.find((s) => !s.text.trim());
      focusField(empty ? storyDomId(empty.id) : "pb-add-story");
      return;
    }
    focusField(target);
  };

  let status: string;
  if (f.saving) status = "Saving your changes.";
  else if (f.dirty) status = "You have changes that are not saved yet.";
  else if (f.justSaved) status = "Saved just now.";
  else if (f.savedAt) status = "";
  else status = "Nothing saved yet. Save whenever you like and come back to add more.";

  return (
    <section id="about-you" aria-labelledby="pb-about-title" className="mt-14 scroll-mt-24 md:scroll-mt-32">
      <h2 id="pb-about-title" className="font-clash text-2xl font-medium md:text-3xl">
        About you
      </h2>
      <p className="mt-2 text-base leading-relaxed text-neutral-700">
        Your posts are written from this. Real detail beats polish: one specific story makes a better post than a list
        of achievements. It is only used to write your posts.
      </p>

      {f.restored && (
        <div role="status" className="mt-5 rounded-xl border-2 border-neutral-900 bg-studojo-yellow-bg p-4">
          <p className="text-base font-bold">Your unsaved changes are back</p>
          <p className="mt-1 text-base text-neutral-800">
            You changed this on an earlier visit and did not save. Save to keep the changes, or go back to what you
            saved before.
          </p>
          <button type="button" onClick={f.discardDraft} className={`${BTN_SECONDARY} mt-3`}>
            Go back to my saved version
          </button>
        </div>
      )}

      <div className={`${CARD} mt-5 p-4 sm:p-6`}>
        <Meter input={f.current.input} onJump={jump} />

        <f.fetcher.Form
          id={FORM_ID}
          method="post"
          noValidate
          onSubmit={f.onSubmit}
          aria-labelledby="pb-about-title"
          className="ph-no-capture mt-6 space-y-6"
        >
          <input type="hidden" name={PB_FIELDS.intent} value={PB_SAVE_INTENT} />

          {errorKeys.length > 0 && <ErrorSummary errors={errors} boxRef={summaryRef} />}

          <GroupTitle>The basics</GroupTitle>
          <TextField
            id="pb-name"
            name={PB_FIELDS.name}
            label="Your name"
            required
            autoComplete="name"
            help="As it appears on LinkedIn."
            value={form.name}
            onChange={(v) => set("name", v, "name")}
            maxLength={PB_LIMITS.name}
            error={errors.name}
          />
          <TextField
            id="pb-headline"
            name={PB_FIELDS.headline}
            label="Your LinkedIn headline"
            required
            help="The line under your name on LinkedIn. Copy it from your profile."
            placeholder="e.g. Final year BBA | Writing about D2C brands | Looking for marketing internships"
            value={form.headline}
            onChange={(v) => set("headline", v, "headline")}
            maxLength={PB_LIMITS.headline}
            error={errors.headline}
          />
          <TextField
            id="pb-stage"
            name={PB_FIELDS.stage}
            label="Where you are right now"
            placeholder="e.g. Final year B.Tech, or 2nd year BBA"
            value={form.stage}
            onChange={(v) => set("stage", v)}
            maxLength={PB_LIMITS.stage}
          />
          <FieldShell id="pb-market" label="Where most of your audience is" help="Pick Global if they are spread out.">
            <select
              id="pb-market"
              name={PB_FIELDS.market}
              value={form.market}
              onChange={(e) => set("market", e.target.value)}
              aria-describedby="pb-market-help"
              className={controlClass(false)}
            >
              {PB_MARKETS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </FieldShell>

          <GroupTitle>You and Studojo</GroupTitle>
          <fieldset aria-describedby="pb-relation-help" className="min-w-0">
            <legend className="text-base font-bold">How are you connected to Studojo?</legend>
            <p id="pb-relation-help" className="mt-1 text-sm leading-relaxed text-neutral-600">
              This decides how your posts mention Studojo, if they do at all, and keeps them honest about your
              connection.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PB_RELATIONS.map((r) => (
                <OptionRow
                  key={r.value}
                  id={`pb-relation-${r.value}`}
                  name={PB_FIELDS.relation}
                  value={r.value}
                  label={r.label}
                  checked={form.relation === r.value}
                  onChange={() => set("relation", r.value)}
                />
              ))}
            </div>
          </fieldset>

          <GroupTitle>What you want</GroupTitle>
          <TextAreaField
            id="pb-goals"
            name={PB_FIELDS.goals}
            label="What you are aiming for next"
            placeholder="e.g. A product marketing internship at a B2B startup by next summer. I also want to get comfortable writing in public."
            rows={3}
            value={form.goals}
            onChange={(v) => set("goals", v)}
            maxLength={PB_LIMITS.goals}
          />
          <fieldset id="pb-topics" aria-describedby="pb-topics-help" className="min-w-0">
            <legend className="text-base font-bold">Topics you want to be known for</legend>
            <p id="pb-topics-help" className="mt-1 text-sm leading-relaxed text-neutral-600">
              Pick up to {PB_LIMITS.topics}. They shape what your posts are about.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PB_TOPICS.map((t) => {
                const on = form.knownTopics.includes(t);
                const off = !on && atTopicLimit;
                const id = `pb-topic-${topicSlug(t)}`;
                return (
                  <label
                    key={t}
                    htmlFor={id}
                    className={`inline-flex min-h-11 select-none items-center gap-1.5 rounded-full border-2 px-4 text-base transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-studojo-purple-strong has-[:focus-visible]:ring-offset-2 ${
                      on
                        ? "cursor-pointer border-neutral-900 bg-studojo-purple-strong font-bold text-white"
                        : off
                          ? "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-500"
                          : "cursor-pointer border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900"
                    }`}
                  >
                    <input
                      id={id}
                      type="checkbox"
                      name={PB_FIELDS.topics}
                      value={t}
                      checked={on}
                      disabled={off}
                      onChange={() => toggleTopic(t)}
                      className="sr-only"
                    />
                    {on && <CheckIcon size={16} />}
                    {t}
                  </label>
                );
              })}
            </div>
            <div className="mt-4">
              <TextField
                id="pb-custom-topics"
                name={PB_FIELDS.customTopics}
                label="Anything not on the list?"
                help="Separate topics with commas."
                placeholder="e.g. Climate tech, Podcasts"
                value={form.customTopics}
                onChange={(v) => set("customTopics", v)}
                maxLength={PB_CUSTOM_TOPICS_MAX}
              />
            </div>
            <p className={`mt-2 text-sm ${topics > PB_LIMITS.topics ? "font-bold text-red-700" : "text-neutral-600"}`}>
              {topics > PB_LIMITS.topics
                ? `That is ${topics} topics. Only the first ${PB_LIMITS.topics} are kept.`
                : `${topics} of ${PB_LIMITS.topics} picked.`}
            </p>
          </fieldset>

          <GroupTitle>Your stories</GroupTitle>
          <fieldset id="pb-stories" aria-describedby="pb-stories-help" className="min-w-0">
            <legend className="text-base font-bold">Things that actually happened to you</legend>
            <p id="pb-stories-help" className="mt-1 text-sm leading-relaxed text-neutral-600">
              Your posts are only ever built from real moments like these, never made-up ones. Write each one the way
              you would tell a friend: what happened, what you did, what changed. A few lines is plenty.
            </p>
            <div className="mt-3 space-y-4">
              {form.stories.map((s, i) => {
                const id = storyDomId(s.id);
                return (
                  <div key={s.id} className="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-3 sm:p-4">
                    <input type="hidden" name={PB_FIELDS.storyId} value={s.id} />
                    <div className="flex flex-wrap items-center justify-between gap-x-3">
                      <label htmlFor={id} className="text-base font-bold">
                        Story {i + 1}
                      </label>
                      <div className="flex items-center gap-1">
                        <Counter value={s.text.length} max={PB_LIMITS.story} />
                        {form.stories.length > MIN_STORY_SLOTS && (
                          <button
                            type="button"
                            onClick={() => removeStory(s.id)}
                            aria-label={`Remove story ${i + 1}`}
                            className={BTN_LINK}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <textarea
                      id={id}
                      name={PB_FIELDS.storyText}
                      rows={4}
                      maxLength={PB_LIMITS.story}
                      value={s.text}
                      placeholder={STORY_EXAMPLES[i % STORY_EXAMPLES.length]}
                      onChange={(e) => setStory(s.id, e.target.value)}
                      className={`${controlClass(false)} mt-2 resize-y leading-relaxed`}
                    />
                  </div>
                );
              })}
            </div>
            {removed && (
              <div role="status" className="mt-3 flex flex-wrap items-center gap-x-3 text-base">
                <span>Story removed.</span>
                <button id="pb-story-undo" type="button" onClick={undoRemove} className={BTN_LINK}>
                  Undo
                </button>
              </div>
            )}
            <div className="mt-4">
              <button
                id="pb-add-story"
                type="button"
                onClick={addStory}
                disabled={form.stories.length >= PB_LIMITS.stories}
                className={`${BTN_SECONDARY} w-full sm:w-auto`}
              >
                Add another story
              </button>
              {form.stories.length >= PB_LIMITS.stories && (
                <p className="mt-2 text-sm text-neutral-600">
                  {`That is the most you can add (${PB_LIMITS.stories}). Swap one out if you have a better one.`}
                </p>
              )}
            </div>
          </fieldset>

          <GroupTitle>How you write</GroupTitle>
          <div>
            <TextAreaField
              id="pb-writing-sample"
              name={PB_FIELDS.writingSample}
              label="A writing sample"
              help="Paste something you wrote yourself: an old post, a long message, an essay. It shows how you write, and a post may draw on what it says, so only paste something you are happy to see in a post."
              rows={7}
              counter
              value={form.writingSample}
              onChange={(v) => set("writingSample", v)}
              maxLength={PB_LIMITS.writingSample}
            />
            {sampleLength > 0 && sampleLength < 150 && (
              <p className="mt-1.5 text-sm text-neutral-600">A bit more helps. Aim for 150 characters or more.</p>
            )}
          </div>

          <fieldset aria-describedby="pb-tone-help" className="min-w-0">
            <legend className="text-base font-bold">Your tone</legend>
            <p id="pb-tone-help" className="mt-1 text-sm leading-relaxed text-neutral-600">
              Move each slider to where you sit between the two.
            </p>
            <div className="mt-3 space-y-5">
              {PB_TONE_KEYS.map((key) => {
                const scale = PB_TONE_SCALES[key];
                const value = form.tone[key];
                const id = `pb-tone-${key}`;
                const word = toneWord(value, scale.left, scale.right);
                return (
                  <div key={key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <label htmlFor={id} className="text-base font-bold">
                        {TONE_TITLES[key]}
                      </label>
                      <span aria-hidden="true" className="text-base font-bold text-studojo-purple-strong">
                        {word}
                      </span>
                    </div>
                    <input
                      id={id}
                      name={toneField(key)}
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={value}
                      onChange={(e) => set("tone", { ...form.tone, [key]: Number(e.target.value) })}
                      aria-valuetext={`${word}, ${value} of 5`}
                      className="mt-1 block h-11 w-full cursor-pointer accent-studojo-purple-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studojo-purple-strong"
                    />
                    <div aria-hidden="true" className="flex justify-between text-sm text-neutral-600">
                      <span>{scale.left}</span>
                      <span>{scale.right}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="text-base font-bold">Emoji in your posts</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {PB_EMOJI.map((o) => (
                <OptionRow
                  key={o.value}
                  id={`pb-emoji-${o.value}`}
                  name={PB_FIELDS.emoji}
                  value={o.value}
                  label={o.label}
                  checked={form.emoji === o.value}
                  onChange={() => set("emoji", o.value)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="text-base font-bold">Language</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PB_LANGS.map((o) => (
                <OptionRow
                  key={o.value}
                  id={`pb-lang-${o.value}`}
                  name={PB_FIELDS.lang}
                  value={o.value}
                  label={o.label}
                  checked={form.lang === o.value}
                  onChange={() => set("lang", o.value)}
                />
              ))}
            </div>
          </fieldset>

          <TextField
            id="pb-avoid"
            name={PB_FIELDS.avoid}
            label="Words you never use"
            help="Words or phrases that would never sound like you."
            placeholder="e.g. thrilled, humbled, synergy"
            value={form.avoid}
            onChange={(v) => set("avoid", v)}
            maxLength={PB_LIMITS.avoid}
          />

          <GroupTitle>Last bits</GroupTitle>
          <TextField
            id="pb-linkedin-url"
            name={PB_FIELDS.linkedinUrl}
            label="Your LinkedIn profile link"
            type="url"
            autoComplete="url"
            placeholder="linkedin.com/in/your-name"
            value={form.linkedinUrl}
            onChange={(v) => set("linkedinUrl", v, "linkedinUrl")}
            maxLength={PB_LIMITS.linkedinUrl}
            error={errors.linkedinUrl}
          />
          <TextAreaField
            id="pb-extra"
            name={PB_FIELDS.extra}
            label="Anything else we should know"
            placeholder="e.g. I am shy about posting, so keep it low key. Please never name my college."
            rows={3}
            counter
            value={form.extra}
            onChange={(v) => set("extra", v)}
            maxLength={PB_LIMITS.extra}
          />

          <div
            ref={saveRowRef}
            className="flex flex-col gap-3 border-t-2 border-neutral-900 pt-6 sm:flex-row sm:items-center"
          >
            <button type="submit" disabled={f.saving} className={`${BTN_PRIMARY} w-full sm:w-auto`}>
              {f.saving ? "Saving…" : hasProfile || f.savedAt ? "Save changes" : "Save"}
            </button>
            <div className="min-w-0 text-base">
              {f.saveError ? (
                <p role="alert" className="font-medium text-red-700">
                  {f.saveError}
                </p>
              ) : status ? (
                <p className="text-neutral-700">{status}</p>
              ) : (
                f.savedAt && (
                  <p className="text-neutral-700">
                    Last saved <ClientDate iso={f.savedAt} />.
                  </p>
                )
              )}
            </div>
          </div>
          <p role="status" aria-live="polite" className="sr-only">
            {f.justSaved ? "Saved." : ""}
          </p>
        </f.fetcher.Form>
      </div>

      {f.dirty && !saveRowInView && <FloatingSave saving={f.saving} />}
    </section>
  );
}
