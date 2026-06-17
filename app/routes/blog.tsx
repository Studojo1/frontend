import { useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { Header, Footer } from "~/components";
import { BlogCard } from "~/components/blog/blog-card";
import type { Route } from "./+types/blog";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

const BASE_URL = "https://studojo.com";
const LIMIT = 12;

interface BlogPost {
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

export function meta({}: Route.MetaArgs) {
  const ogImage = `${BASE_URL}/api/blog-og/studojo-blog?v=3`;
  return [
    { title: "Studojo Blog | Internship Tips, Resume Advice & Career Guides" },
    { name: "description", content: "Practical advice for students: internship hunting, resume tips, career strategy, and more. Updated weekly by the Studojo team." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "internship tips, resume advice, career guide for students, how to get an internship, student career blog" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/blog` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Studojo Blog | Internship Tips & Career Guides" },
    { property: "og:description", content: "Practical advice for students: internship hunting, resume tips, career strategy, and more." },
    { property: "og:url", content: `${BASE_URL}/blog` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: "Studojo Blog — career tips and internship guides for students" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@studojo" },
    { name: "twitter:title", content: "Studojo Blog | Internship Tips & Career Guides" },
    { name: "twitter:description", content: "Practical advice for students: internship hunting, resume tips, career strategy, and more." },
    { name: "twitter:image", content: ogImage },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const search = url.searchParams.get("search") || "";
    const offset = (page - 1) * LIMIT;

    let countResult, result;

    if (search) {
      const like = `%${search}%`;
      countResult = await db.execute(
        sql`SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published' AND (title ILIKE ${like} OR excerpt ILIKE ${like} OR content ILIKE ${like})`
      );
      result = await db.execute(
        sql`SELECT id, title, slug, excerpt, featured_image, author_name, published_at, reading_time, view_count, categories FROM blog_posts WHERE status = 'published' AND (title ILIKE ${like} OR excerpt ILIKE ${like} OR content ILIKE ${like}) ORDER BY published_at DESC LIMIT ${LIMIT} OFFSET ${offset}`
      );
    } else {
      countResult = await db.execute(
        sql`SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published'`
      );
      result = await db.execute(
        sql`SELECT id, title, slug, excerpt, featured_image, author_name, published_at, reading_time, view_count, categories FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT ${LIMIT} OFFSET ${offset}`
      );
    }

    const total = Number((countResult.rows[0] as any)?.total || 0);
    const totalPages = Math.max(1, Math.ceil(total / LIMIT));

    const posts: BlogPost[] = (result.rows as any[]).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      slug: String(row.slug),
      excerpt: String(row.excerpt || ""),
      featured_image: row.featured_image ? String(row.featured_image) : undefined,
      author_name: String(row.author_name),
      published_at: row.published_at ? new Date(row.published_at).toISOString() : "",
      reading_time: Number(row.reading_time) || 0,
      view_count: Number(row.view_count) || 0,
      categories: Array.isArray(row.categories) ? row.categories.map(String) : undefined,
    }));

    return { posts, totalPages, page, search };
  } catch (error) {
    console.error("[blog] Loader error:", error);
    return { posts: [], totalPages: 1, page: 1, search: "" };
  }
}

export default function Blog({ data }: Route.ComponentProps) {
  const loaderData = useLoaderData() as
    | { posts: BlogPost[]; totalPages: number; page: number; search: string }
    | undefined;
  const initial = loaderData || (data as typeof loaderData) || {
    posts: [],
    totalPages: 1,
    page: 1,
    search: "",
  };

  const [, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>(initial.posts);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initial.page);
  const [totalPages, setTotalPages] = useState(initial.totalPages);
  const [search, setSearch] = useState(initial.search);
  const [searchInput, setSearchInput] = useState(initial.search);

  const loadPosts = async (newPage: number, newSearch: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: newPage.toString(), limit: LIMIT.toString() });
      if (newSearch) params.append("search", newSearch);

      const response = await fetch(`/api/blog?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load posts");

      const responseData = await response.json();
      setPosts(responseData.posts || []);
      setTotalPages(responseData.totalPages || 1);
      setPage(newPage);
      setSearch(newSearch);
      setSearchParams({ page: newPage.toString(), ...(newSearch && { search: newSearch }) });
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPosts(1, searchInput);
  };

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Studojo Blog",
    description:
      "Practical advice for students: internship hunting, resume tips, career strategy, and more.",
    url: `${BASE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: "Studojo",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/favicon.png` },
    },
    blogPost: posts.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      url: `${BASE_URL}/blog/${post.slug}`,
      author: { "@type": "Person", name: post.author_name },
      datePublished: post.published_at,
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <header className="mb-12 text-center">
          <h1 className="mb-4 font-['Clash_Display'] text-5xl font-bold text-neutral-900 md:text-6xl">
            Blog
          </h1>
          <p className="mx-auto max-w-2xl font-['Satoshi'] text-lg text-gray-600">
            Discover insights, tips, and stories to help you succeed in your career
          </p>
        </header>

        <form onSubmit={handleSearch} className="mb-12">
          <div className="mx-auto flex max-w-md gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search posts..."
              className="flex-1 rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="submit"
              className="rounded-lg border-2 border-neutral-900 bg-violet-600 px-6 py-2 font-['Satoshi'] font-medium text-white transition-colors hover:bg-violet-700"
            >
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="font-['Satoshi'] text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-['Satoshi'] text-gray-600">No posts found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <button
                  onClick={() => loadPosts(Math.max(1, page - 1), search)}
                  disabled={page === 1}
                  className="rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] font-medium text-neutral-900 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-neutral-100"
                >
                  Previous
                </button>
                <span className="flex items-center px-4 font-['Satoshi'] text-neutral-900">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => loadPosts(Math.min(totalPages, page + 1), search)}
                  disabled={page === totalPages}
                  className="rounded-lg border-2 border-neutral-900 px-4 py-2 font-['Satoshi'] font-medium text-neutral-900 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-neutral-100"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
