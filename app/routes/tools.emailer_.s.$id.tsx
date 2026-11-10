import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import emailerCss from "~/components/emailer/emailer.css?url";
import { SHARE, STU } from "~/components/emailer/copy";
import { ResultStuCard, ScoreBadge } from "~/components/emailer/parts";
import { SiteFooter } from "~/components/site-b2c/SiteFooter";
import { SiteHeader } from "~/components/site-b2c/SiteHeader";
import { ArrowIcon, StartViaContext } from "~/components/site-b2c/ui";
import { getShare } from "~/lib/emailer/api";
import { API, SHARE_ID_RE, TOOL_PATH, formatScore, originForHost, pageUtm, readShare, roleAt, sharePath, type ShareResponse } from "~/lib/emailer/contract";
import type { Route } from "./+types/tools.emailer_.s.$id";

// EMAILER: the public share page, /tools/emailer/s/:id. Its link preview (og:image, twitter:image as
// summary_large_image) is the engine's 1200x630 score card, /api/emailer/card/<id>.png. The page shows the same card from
// /api/emailer/share/:id (public: score, role, company, a first name; never the email), a big "Write yours free" and the
// Stu card. Not for search (crawl-policy.ts keeps /tools/emailer/s/* out of the index; link previews may read it).
// The file name's "emailer_" keeps it out of /tools/emailer's route tree (its own page, not a child).

export const links: Route.LinksFunction = () => [{ rel: "stylesheet", href: emailerCss }];

/** The share data, read on the server so the title can carry the score. EMAILER_API_ORIGIN (an in-cluster address
 * for career-agent, e.g. http://career-agent) when set, else this site's own public origin; a short wait, then the
 * page reads it in the browser instead. */
async function fetchShare(origin: string, id: string): Promise<ShareResponse | null> {
  const base = (process.env.EMAILER_API_ORIGIN ?? "").trim().replace(/\/+$/, "") || origin;
  if (!base || /^http:\/\/(localhost|127\.0\.0\.1)/.test(base)) return null;
  try {
    const res = await fetch(`${base}${API.share(id)}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(1200) });
    if (!res.ok) return null;
    return readShare(await res.json());
  } catch {
    return null;
  }
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const id = params.id ?? "";
  if (!SHARE_ID_RE.test(id)) throw new Response("Not found", { status: 404 });
  const origin = originForHost(request.headers.get("host"));
  const share = await fetchShare(origin, id);
  return { id, origin, share };
}

function titleFor(share: ShareResponse | null): string {
  if (!share) return SHARE.titleDefault;
  if (share.kind === "grade" && typeof share.before === "number" && typeof share.after === "number") {
    return SHARE.titleGrade(formatScore(share.before), formatScore(share.after));
  }
  return SHARE.title(formatScore(share.score));
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: SHARE.titleDefault }, { name: "robots", content: "noindex" }];
  const image = `${data.origin}${API.card(data.id)}`;
  const title = titleFor(data.share);
  const sub = roleAt(data.share?.role, data.share?.company);
  const description = sub ? `${sub}. ${SHARE.description}` : SHARE.description;
  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "noindex" },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: `${data.origin}${sharePath(data.id)}` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: title.replace(/ \| Studojo$/, "") },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@studojo" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}

/** The score card, drawn in HTML (the PNG is for link previews). */
function ShareCard({ share }: { share: ShareResponse }) {
  const ba = share.kind === "grade" && typeof share.before === "number" && typeof share.after === "number";
  const sub = roleAt(share.role, share.company);
  const [logoOk, setLogoOk] = useState(true);
  return (
    <div className="em-card em-sharecard" data-kind={share.kind}>
      <div className="em-sharecard-score">
        {ba ? (
          <div className="em-ba">
            <ScoreBadge value={share.before as number} size="md" />
            <span className="em-ba-arrow" aria-hidden="true">
              <ArrowIcon size={26} />
            </span>
            <ScoreBadge value={share.after as number} />
          </div>
        ) : (
          <ScoreBadge value={share.score} />
        )}
      </div>
      <p className="em-sharecard-line">
        {SHARE.myEmail}: {ba ? `${formatScore(share.before)}/10 \u2192 ${formatScore(share.after)}/10` : `${formatScore(share.score)}/10`}
      </p>
      {sub ? (
        <p className="em-sharecard-sub">
          {share.companyLogo && logoOk ? (
            <img src={share.companyLogo} alt="" width={22} height={22} referrerPolicy="no-referrer" onError={() => setLogoOk(false)} />
          ) : null}
          {sub}
        </p>
      ) : null}
      {share.firstName ? <p className="em-sharecard-by">{share.firstName}</p> : null}
      <p className="em-sharecard-foot">studojo.com/tools/emailer</p>
    </div>
  );
}

export default function EmailerShare({ loaderData }: Route.ComponentProps) {
  const { id } = loaderData;
  const { search } = useLocation();
  const [share, setShare] = useState<ShareResponse | null>(loaderData.share);
  const [state, setState] = useState<"ready" | "loading" | "missing">(loaderData.share ? "ready" : "loading");

  useEffect(() => {
    if (loaderData.share) return;
    let alive = true;
    void getShare(id).then((r) => {
      if (!alive) return;
      if (r.ok) {
        setShare(r.data);
        setState("ready");
      } else setState("missing");
    });
    return () => {
      alive = false;
    };
  }, [id, loaderData.share]);

  // "Write yours free" keeps where this visit came from (the share link's utm), and says it came from a share.
  const carry = new URLSearchParams({ utm_source: "share", utm_medium: "share", utm_campaign: "emailer", ...pageUtm(search), ref: "share" });
  const writeHref = `${TOOL_PATH}?${carry}`;
  const gradeHref = `${TOOL_PATH}?${new URLSearchParams({ ...Object.fromEntries(carry), tab: "grade" })}`;

  return (
    <StartViaContext.Provider value="emailer">
      <div className="em-page">
        <SiteHeader />
        <main id="main" className="sv-page em-main">
          <section className="sv-in em-sharehero" aria-labelledby="em-share-h">
            <span className="sv-kicker">{SHARE.kicker}</span>
            <h1 className="sv-h2" id="em-share-h">
              {state === "missing" ? SHARE.missingTitle : share ? titleFor(share).replace(/ \| Studojo$/, ".") : SHARE.titleDefault.replace(/ \| Studojo$/, ".")}
            </h1>
            {state === "ready" && share ? (
              <ShareCard share={share} />
            ) : state === "loading" ? (
              <div className="em-card em-sharecard em-sharecard-skel" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            ) : null}
            <p className="sv-lead em-share-line">{state === "missing" ? SHARE.missingLine : SHARE.line}</p>
            <div className="em-share-acts">
              <a href={writeHref} className="sv-btn em-share-go">
                {SHARE.writeYours}
                <ArrowIcon size={20} />
              </a>
              <a href={gradeHref} className="em-btn-ghost">
                {SHARE.gradeYours}
              </a>
            </div>
          </section>
          <section className="sv-in em-sec em-share-stu">
            <ResultStuCard cta="share" title={STU.modalTitle} line={STU.resultLine} />
          </section>
        </main>
        <SiteFooter />
      </div>
    </StartViaContext.Provider>
  );
}
