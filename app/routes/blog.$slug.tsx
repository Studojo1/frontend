import { useState } from "react";
import { useLoaderData } from "react-router";
import { BlogContent } from "~/components/blog/blog-content";
import { Header, Footer } from "~/components";
import { FiClock, FiEye, FiCalendar } from "react-icons/fi";
import type { Route } from "./+types/blog.$slug";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

const BASE_URL = "https://studojo.com";

function normalizeImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/api/images")) return url;
  try {
    const urlObj = new URL(url);
    if (urlObj.pathname.startsWith("/api/images")) return urlObj.pathname;
    if (urlObj.pathname.includes("blog-images")) {
      const pathMatch = urlObj.pathname.match(/\/api\/images\/blog-images\/.+/);
      if (pathMatch) return pathMatch[0];
      const blogImagesMatch = urlObj.pathname.match(/blog-images\/.+/);
      if (blogImagesMatch) return `/api/images/${blogImagesMatch[0]}`;
    }
  } catch {
    const filenamePattern = /^(\d+-)?[^\/]+\.(png|jpg|jpeg|webp|gif)$/i;
    if (filenamePattern.test(url) && !url.startsWith("/")) {
      return `/api/images/blog-images/${url}`;
    }
    if (url.startsWith("/")) return url;
  }
  const filenamePattern = /^(\d+-)?[^\/]+\.(png|jpg|jpeg|webp|gif)$/i;
  if (filenamePattern.test(url) && !url.startsWith("/") && !url.includes("://")) {
    return `/api/images/blog-images/${url}`;
  }
  return url;
}

function absoluteImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const normalized = normalizeImageUrl(url);
  if (!normalized) return undefined;
  if (normalized.startsWith("http")) return normalized;
  return `${BASE_URL}${normalized}`;
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.post) {
    return [{ title: "Post Not Found – Studojo" }];
  }

  const post = data.post;
  const title = post.seo_meta_title || post.title;
  const description = post.seo_meta_description || post.excerpt;
  const canonicalUrl = `${BASE_URL}/blog/${post.slug}`;
  const ogImage = absoluteImageUrl(post.seo_og_image || post.featured_image);
  const keywords = post.seo_keywords?.join(", ") || post.tags?.join(", ");

  return [
    { title: `${title} | Studojo Blog` },
    { name: "description", content: description },
    ...(keywords ? [{ name: "keywords", content: keywords }] : []),
    { name: "author", content: post.author_name },
    { tagName: "link", rel: "canonical", href: canonicalUrl },

    // Open Graph — article type
    { property: "og:type", content: "article" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:site_name", content: "Studojo" },
    ...(ogImage ? [{ property: "og:image", content: ogImage }, { property: "og:image:alt", content: title }] : []),
    { property: "article:published_time", content: post.published_at },
    { property: "article:author", content: post.author_name },
    ...(post.categories?.length ? [{ property: "article:section", content: post.categories[0] }] : []),
    ...(post.tags?.map((tag) => ({ property: "article:tag", content: tag })) || []),

    // Twitter Card
    { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
    { name: "twitter:site", content: "@studojo" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(ogImage ? [{ name: "twitter:image", content: ogImage }] : []),
  ];
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  author_name: string;
  author_email: string;
  published_at: string;
  updated_at?: string;
  reading_time: number;
  view_count: number;
  categories?: string[];
  tags?: string[];
  seo_meta_title?: string;
  seo_meta_description?: string;
  seo_keywords?: string[];
  seo_og_image?: string;
}

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const { slug } = params;
    const decodedSlug = decodeURIComponent(slug);
    const escapedSlug = decodedSlug.replace(/'/g, "''").trim();

    let result = await db.execute(
      sql.raw(`SELECT * FROM blog_posts WHERE slug = '${escapedSlug}' AND status = 'published' LIMIT 1`)
    );

    if (result.rows.length === 0) {
      result = await db.execute(
        sql.raw(`SELECT * FROM blog_posts WHERE LOWER(slug) = LOWER('${escapedSlug}') AND status = 'published' LIMIT 1`)
      );
    }

    if (result.rows.length === 0) {
      const anyStatusResult = await db.execute(
        sql.raw(`SELECT slug, status FROM blog_posts WHERE LOWER(slug) = LOWER('${escapedSlug}') LIMIT 1`)
      );
      if (anyStatusResult.rows.length > 0) {
        const postStatus = (anyStatusResult.rows[0] as any).status;
        throw new Response(`Post found but status is '${postStatus}', not 'published'`, { status: 404 });
      }
      throw new Response("Post not found", { status: 404 });
    }

    const post = result.rows[0] as any;

    try {
      await db.execute(
        sql`UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ${post.id}`
      );
    } catch {}

    const serializedPost: BlogPost = {
      id: String(post.id),
      title: String(post.title),
      slug: String(post.slug),
      content: String(post.content),
      excerpt: String(post.excerpt),
      featured_image: post.featured_image ? String(post.featured_image) : undefined,
      author_name: String(post.author_name),
      author_email: String(post.author_email),
      published_at: post.published_at ? new Date(post.published_at).toISOString() : "",
      updated_at: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
      reading_time: Number(post.reading_time) || 0,
      view_count: Number(post.view_count) || 0,
      categories: Array.isArray(post.categories) ? post.categories.map(String) : undefined,
      tags: Array.isArray(post.tags) ? post.tags.map(String) : undefined,
      seo_meta_title: post.seo_meta_title ? String(post.seo_meta_title) : undefined,
      seo_meta_description: post.seo_meta_description ? String(post.seo_meta_description) : undefined,
      seo_keywords: Array.isArray(post.seo_keywords) ? post.seo_keywords.map(String) : undefined,
      seo_og_image: post.seo_og_image ? String(post.seo_og_image) : undefined,
    };

    return { post: serializedPost };
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error(`[blog.$slug] Loader error:`, error);
    throw new Response("Internal server error", { status: 500 });
  }
}

export default function BlogPost({ data }: Route.ComponentProps) {
  const loaderData = useLoaderData() as { post: BlogPost } | undefined;
  const post = (loaderData?.post || data?.post) as BlogPost | undefined;
  const [imageError, setImageError] = useState(false);
  const normalizedImageUrl = normalizeImageUrl(post?.featured_image);

  if (!post) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="mx-auto max-w-4xl">
          <p className="font-['Satoshi'] text-gray-600">Post not found</p>
        </div>
      </div>
    );
  }

  const canonicalUrl = `${BASE_URL}/blog/${post.slug}`;
  const ogImage = absoluteImageUrl(post.seo_og_image || post.featured_image);

  // JSON-LD: BlogPosting schema
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.seo_meta_title || post.title,
    "description": post.seo_meta_description || post.excerpt,
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
    "url": canonicalUrl,
    ...(ogImage ? { "image": { "@type": "ImageObject", "url": ogImage } } : {}),
    "datePublished": post.published_at,
    "dateModified": post.updated_at || post.published_at,
    "author": { "@type": "Person", "name": post.author_name },
    "publisher": {
      "@type": "Organization",
      "name": "Studojo",
      "url": BASE_URL,
      "logo": { "@type": "ImageObject", "url": `${BASE_URL}/favicon.png` },
    },
    "timeRequired": `PT${post.reading_time}M`,
    ...(post.categories?.length ? { "articleSection": post.categories[0] } : {}),
    ...(post.tags?.length ? { "keywords": post.tags.join(", ") } : {}),
    "inLanguage": "en-US",
  };

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": canonicalUrl },
    ],
  };

  return (
    <article className="min-h-screen bg-white">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Header />

      {/* Hero image — eager + high priority for LCP */}
      {normalizedImageUrl && !imageError && (
        <div className="h-64 w-full md:h-96">
          <img
            src={normalizedImageUrl}
            alt={post.title}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
            loading="eager"
            fetchpriority="high"
            width="1200"
            height="630"
          />
        </div>
      )}
      {imageError && (
        <div className="h-64 w-full md:h-96 bg-neutral-200 flex items-center justify-center">
          <span className="font-['Satoshi'] text-base text-neutral-400">Image not available</span>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
        {/* Breadcrumb nav */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 font-['Satoshi'] text-sm text-neutral-500">
            <li><a href="/" className="hover:text-neutral-900 transition-colors">Home</a></li>
            <li aria-hidden>/</li>
            <li><a href="/blog" className="hover:text-neutral-900 transition-colors">Blog</a></li>
            <li aria-hidden>/</li>
            <li className="text-neutral-900 font-medium truncate max-w-xs">{post.title}</li>
          </ol>
        </nav>

        <header className="mb-12">
          {post.categories && post.categories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {post.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-violet-100 px-4 py-1.5 text-sm font-['Satoshi'] font-medium text-violet-700"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          <h1 className="mb-6 font-['Clash_Display'] text-4xl font-bold text-neutral-900 md:text-5xl leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm font-['Satoshi'] text-gray-500 mb-6">
            <span className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </span>
            <span className="flex items-center gap-2">
              <FiClock className="w-4 h-4" />
              {post.reading_time} min read
            </span>
            <span className="flex items-center gap-2">
              <FiEye className="w-4 h-4" />
              {post.view_count} views
            </span>
            <span>By <span className="font-medium text-neutral-900">{post.author_name}</span></span>
          </div>

          {post.excerpt && (
            <p className="font-['Satoshi'] text-lg text-neutral-600 leading-relaxed border-l-4 border-violet-500 pl-4">
              {post.excerpt}
            </p>
          )}
        </header>

        <div className="mt-8">
          <BlogContent content={post.content} />
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 border-t-2 border-neutral-900 pt-8">
            <h3 className="mb-4 font-['Satoshi'] font-bold text-neutral-900">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <a
                  key={tag}
                  href={`/blog?search=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-['Satoshi'] text-emerald-700 hover:bg-emerald-200 transition-colors"
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </article>
  );
}
