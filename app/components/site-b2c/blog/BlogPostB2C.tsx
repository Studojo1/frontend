import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router";
import { Header, Footer } from "~/components";
import { BLOG } from "../site-links";
import { ArrowIcon, BackIcon, Kicker, MicIcon, StuHead, useSiteStart } from "../ui";
import { STU_CARD_LINE, blogDate, blogStartHref, processBlogHtmlB2c, splitForStu, stuGoInner, withVia } from "./blog-b2c";

// SITE-V2 /blog/<slug> on B2C hosts (routes/blog.$slug.tsx returns this early on studojo.pro; studojo.com keeps its
// own page with the Outreach CTAs). Same loader data and JSON-LD. Every Outreach CTA becomes one quiet Stu card
// (Stu's head, one line, "start the call" to /b2cnew/join?via=blog-<slug>&how=voice): the writer's own CTA spots in the
// post HTML, else one in the middle. The end-of-article bar is not repeated here: the footer right below closes with
// Stu and the same button. Look: site-blog.css.

export interface BlogPostB2CData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_name: string;
  published_at: string;
  reading_time: number;
  categories?: string[];
  tags?: string[];
}

interface Props {
  post: BlogPostB2CData;
  posterUrl: string;
  jsonLd: (Record<string, unknown> | null)[];
}

/** The start link for this post: the URL's ad keys (then, after hydration, the held first touch), via=blog-<slug>. */
function usePostStart(slug: string) {
  const start = useSiteStart();
  const href = start.signedIn ? start.href : withVia(start.href, `blog-${slug}`);
  return { ...start, href };
}

export function BlogPostB2C({ post, posterUrl, jsonLd }: Props) {
  const { search } = useLocation();
  const start = usePostStart(post.slug);
  const bodyRef = useRef<HTMLDivElement>(null);

  // The post HTML is built from the URL only, so server and browser render the same string; Stu cards inside it are
  // then pointed at the live start link (signed in, or the visit's held first touch) without re-rendering the body.
  // A post whose writer placed its own CTA already gets a Stu card there, so it gets no second one in the middle.
  const [part1, part2] = useMemo(() => {
    const href = blogStartHref(post.slug, search);
    const placed = /data-studojo-cta="(?:outreach|rendered)"/i.test(post.content);
    const [a, b] = placed ? [post.content, ""] : splitForStu(post.content);
    return [processBlogHtmlB2c(a, href), b ? processBlogHtmlB2c(b, href) : ""];
  }, [post.content, post.slug, search]);

  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLAnchorElement>("a[data-sv-blog-start]").forEach((a) => {
      if (a.getAttribute("href") !== start.href) a.setAttribute("href", start.href);
      const signed = a.getAttribute("data-sv-signed") === "1";
      if (signed !== start.signedIn) {
        a.innerHTML = stuGoInner(start.signedIn);
        a.setAttribute("data-sv-signed", start.signedIn ? "1" : "0");
      }
    });
  }, [start.href, start.signedIn, part1, part2]);

  const cats = post.categories ?? [];
  const date = blogDate(post.published_at, "short");

  return (
    <div className="sv-blog-wrap">
      {jsonLd.map((ld, i) =>
        ld ? <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /> : null,
      )}
      <Header />
      <main className="sv-page">
        <article className="sv-in sv-read sv-blog-post" ref={bodyRef}>
          <nav aria-label="Breadcrumb" className="sv-crumbs sv-blog-crumbs">
            <Link to={BLOG}>blog</Link>
            <span aria-hidden="true">/</span>
            <span className="sv-blog-crumb-now" aria-current="page">
              {post.title}
            </span>
          </nav>

          <header className="sv-blog-head">
            {cats.length > 0 ? <Kicker className="sv-blog-kick">{cats.join(" · ")}</Kicker> : null}
            <h1 className="sv-blog-title">{post.title}</h1>
            {post.excerpt ? <p className="sv-lead sv-blog-ex">{post.excerpt}</p> : null}
            <p className="sv-blog-meta">
              <span className="sv-blog-by">
                by <b>{post.author_name}</b>
              </span>
              {date ? (
                <time className="sv-mono" dateTime={post.published_at}>
                  {date}
                </time>
              ) : null}
              {post.reading_time ? <span className="sv-mono">{post.reading_time} min read</span> : null}
            </p>
          </header>

          <div className="sv-card sv-blog-hero">
            <img src={posterUrl} alt={post.title} loading="eager" fetchPriority="high" width="1200" height="630" />
          </div>

          <div className="sv-prose sv-blog-prose" dangerouslySetInnerHTML={{ __html: part1 }} />
          {part2 ? <StuCard href={start.href} signedIn={start.signedIn} /> : null}
          {part2 ? <div className="sv-prose sv-blog-prose" dangerouslySetInnerHTML={{ __html: part2 }} /> : null}

          {post.tags && post.tags.length > 0 ? (
            <div className="sv-blog-tags">
              <span className="sv-mono">tags</span>
              {post.tags.map((tag) => (
                <a key={tag} href={`/blog?search=${encodeURIComponent(tag)}`} className="sv-chip sv-chip-q">
                  {tag}
                </a>
              ))}
            </div>
          ) : null}

          <div className="sv-blog-back">
            <Link to={BLOG} className="sv-go">
              <BackIcon size={15} />
              all posts
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

/** The quiet Stu card in the middle of a post (the same look as the HTML card in site-blog.css). */
function StuCard({ href, signedIn }: { href: string; signedIn: boolean }) {
  return (
    <aside className="sv-blog-stu" aria-label="stu, the job agent">
      <StuHead size={52} className="sv-blog-stu-head" />
      <p className="sv-blog-stu-line">{STU_CARD_LINE}</p>
      <a href={href} className="sv-btn sv-btn-sm sv-blog-stu-go" data-start="blog-inline">
        {signedIn ? <ArrowIcon size={16} /> : <MicIcon size={16} />}
        <span>{signedIn ? "my jobs" : "start the call"}</span>
      </a>
    </aside>
  );
}

/** The post page's own "no post" state (the loader normally throws a 404 to the root error page instead). */
export function BlogPostMissingB2C() {
  return (
    <div className="sv-blog-wrap">
      <Header />
      <main className="sv-page">
        <div className="sv-in sv-read">
          <div className="sv-empty sv-blog-missing">
            <Kicker>the studojo blog</Kicker>
            <h1 className="sv-h2">this post is not here.</h1>
            <p className="sv-body">It may have moved, or the link may be wrong.</p>
            <Link to={BLOG} className="sv-btn-ghost">
              <BackIcon size={15} />
              all posts
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
