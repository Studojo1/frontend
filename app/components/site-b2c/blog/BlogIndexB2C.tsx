import type { FormEvent } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { REPORTS } from "../site-links";
import { ArrowIcon, BackIcon, Kicker, TileIcon } from "../ui";
import { blogDate } from "./blog-b2c";

// SITE-V2 /blog on B2C hosts (routes/blog._index.tsx returns this early on studojo.pro; studojo.com keeps its own
// page). Same loader data, same search form and ?page/?search handling: the route owns the state and passes its
// handlers in. Look: site-blog.css.

export interface BlogIndexPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  author_name: string;
  published_at: string;
  reading_time: number;
  view_count: number;
  categories?: string[];
}

interface Props {
  posts: BlogIndexPost[];
  loading: boolean;
  page: number;
  totalPages: number;
  search: string;
  searchInput: string;
  setSearchInput: (v: string) => void;
  onSearch: (e: FormEvent) => void;
  loadPosts: (page: number, search: string) => void;
  jsonLd: Record<string, unknown>;
}

export function BlogIndexB2C({ posts, loading, page, totalPages, search, searchInput, setSearchInput, onSearch, loadPosts, jsonLd }: Props) {
  return (
    <div className="sv-blog-wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="sv-page sv-blog-main">
        <div className="sv-in">
          <header className="sv-pagehead sv-center sv-blog-pagehead">
            <Kicker>the studojo blog</Kicker>
            <h1 className="sv-h1">short reads on getting hired.</h1>
            <p className="sv-lead">Plain answers on finding work, applying and choosing an offer, from the Studojo team.</p>
            <form onSubmit={onSearch} className="sv-blog-search" role="search">
              <div className="sv-blog-search-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="search posts"
                  aria-label="search posts"
                  className="sv-blog-search-input"
                />
                <button type="submit" className="sv-blog-search-btn">
                  search
                </button>
              </div>
            </form>
          </header>

          {loading ? (
            <div className="sv-empty sv-blog-loading" role="status">
              <span className="sv-mono">loading posts</span>
            </div>
          ) : posts.length === 0 ? (
            <BlogEmptyB2C
              kind={search ? "search" : page > 1 ? "page" : "none"}
              onAll={() => {
                setSearchInput("");
                loadPosts(1, "");
              }}
            />
          ) : (
            <>
              {search ? (
                <p className="sv-blog-found sv-mono">
                  posts matching <b>{search}</b>
                </p>
              ) : null}
              <div className="sv-blog-grid">
                {posts.map((post) => (
                  <BlogCardB2C key={post.id} post={post} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="sv-blog-pages" aria-label="pages">
                  <button
                    type="button"
                    onClick={() => loadPosts(Math.max(1, page - 1), search)}
                    disabled={page === 1}
                    className="sv-btn-ghost sv-blog-pill"
                  >
                    <BackIcon size={15} />
                    previous
                  </button>
                  <span className="sv-mono sv-blog-page-of">
                    page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => loadPosts(Math.min(totalPages, page + 1), search)}
                    disabled={page === totalPages}
                    className="sv-btn-ghost sv-blog-pill"
                  >
                    next
                    <ArrowIcon size={15} />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/**
 * The calm empty state, one card for every empty list: "none" = the blog has no posts yet (what studojo.pro shows
 * today, no search), "search" = nothing matches the search, "page" = a page past the last post (?page=9).
 */
function BlogEmptyB2C({ kind, onAll }: { kind: "none" | "search" | "page"; onAll: () => void }) {
  const copy = {
    none: { h: "the first posts are on the way.", p: "Until then, the free reports cover entry-level pay, hiring and applying." },
    search: { h: "no posts match that search.", p: "Try a shorter word, or look through every post." },
    page: { h: "this page has no posts.", p: "The newest posts are on the first page." },
  }[kind];
  return (
    <div className="sv-card sv-empty sv-blog-empty" role="status">
      <TileIcon name={kind === "search" ? "search" : "book"} />
      <h2 className="sv-h3">{copy.h}</h2>
      <p className="sv-body">{copy.p}</p>
      <div className="sv-blog-empty-acts">
        {kind === "none" ? (
          <Link to={REPORTS} className="sv-btn-ghost sv-blog-pill">
            read the reports
            <ArrowIcon size={15} />
          </Link>
        ) : (
          <>
            <button type="button" className="sv-btn-ghost sv-blog-pill" onClick={onAll}>
              {kind === "page" ? "first page" : "all posts"}
            </button>
            <Link to={REPORTS} className="sv-link">
              read the reports
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

/** One post on the B2C index: the post's poster, category, date, reading time, the title as written, the excerpt. */
export function BlogCardB2C({ post }: { post: BlogIndexPost }) {
  const posterUrl = `/api/blog-og/${post.slug}?v=3`;
  const cat = post.categories?.[0];
  const date = blogDate(post.published_at);
  return (
    <Link to={`/blog/${post.slug}`} className="sv-card sv-blog-card">
      <span className="sv-blog-card-img">
        <img src={posterUrl} alt="" loading="lazy" width={1200} height={630} />
      </span>
      <span className="sv-blog-card-body">
        <span className="sv-blog-card-meta">
          {cat ? <span className="sv-blog-cat">{cat}</span> : null}
          {date ? <time dateTime={post.published_at}>{date}</time> : null}
          {post.reading_time ? <span>{post.reading_time} min read</span> : null}
        </span>
        <h2 className="sv-blog-card-title">{post.title}</h2>
        {post.excerpt ? <p className="sv-blog-card-ex">{post.excerpt}</p> : null}
        <span className="sv-go">
          read
          <ArrowIcon />
        </span>
      </span>
    </Link>
  );
}
