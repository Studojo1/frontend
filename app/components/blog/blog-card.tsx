import { useState } from "react";
import { Link } from "react-router";
import { FiClock, FiEye, FiCalendar } from "react-icons/fi";

interface BlogCardProps {
  post: {
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
  };
}

function normalizeImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  // If it's already a relative path starting with /api/images, return as is
  if (url.startsWith("/api/images")) {
    return url;
  }
  
  // If it's an absolute URL, extract the path after the domain
  try {
    const urlObj = new URL(url);
    // If it's from the same origin or a known CDN, use the pathname
    if (urlObj.pathname.startsWith("/api/images")) {
      return urlObj.pathname;
    }
    // If it contains blog-images in the path, construct the proper path
    if (urlObj.pathname.includes("blog-images")) {
      const pathMatch = urlObj.pathname.match(/\/api\/images\/blog-images\/.+/);
      if (pathMatch) {
        return pathMatch[0];
      }
      // Extract blog-images path from full URL
      const blogImagesMatch = urlObj.pathname.match(/blog-images\/.+/);
      if (blogImagesMatch) {
        return `/api/images/${blogImagesMatch[0]}`;
      }
    }
  } catch {
    // If URL parsing fails, check if it's just a filename
    // Check if it looks like a filename (starts with timestamp pattern or is just a filename)
    // Pattern: timestamp-filename.ext or just filename.ext
    const filenamePattern = /^(\d+-)?[^\/]+\.(png|jpg|jpeg|webp|gif)$/i;
    if (filenamePattern.test(url) && !url.startsWith("/")) {
      // It's just a filename, prepend the blog-images path
      return `/api/images/blog-images/${url}`;
    }
    
    // If it's already a relative path starting with /, return as is
    if (url.startsWith("/")) {
      return url;
    }
  }
  
  // Check if it's just a filename (not a URL and not starting with /)
  // Pattern: timestamp-filename.ext or just filename.ext
  const filenamePattern = /^(\d+-)?[^\/]+\.(png|jpg|jpeg|webp|gif)$/i;
  if (filenamePattern.test(url) && !url.startsWith("/") && !url.includes("://")) {
    // It's just a filename, prepend the blog-images path
    return `/api/images/blog-images/${url}`;
  }
  
  // Default: return as is (might be a relative path already)
  return url;
}

export function BlogCard({ post }: BlogCardProps) {
  const [imageError, setImageError] = useState(false);
  const normalizedImageUrl = normalizeImageUrl(post.featured_image);

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block rounded-2xl border-2 border-neutral-900 bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
    >
      {normalizedImageUrl && !imageError && (
        <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
          <img
            src={normalizedImageUrl}
            alt={post.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      )}
      {imageError && (
        <div className="relative h-48 w-full overflow-hidden bg-neutral-200 flex items-center justify-center">
          <span className="font-['Satoshi'] text-sm text-neutral-400">Image not available</span>
        </div>
      )}
      <div className="p-6 md:p-8">
        {post.categories && post.categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-neutral-900 bg-violet-100 px-3 py-1 text-xs font-['Satoshi'] font-medium text-violet-700"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
        <h3 className="mb-3 font-['Clash_Display'] text-xl font-medium leading-tight text-neutral-900 line-clamp-2 md:text-2xl group-hover:text-violet-600 transition-colors">
          {post.title}
        </h3>
        <p className="mb-4 font-['Satoshi'] text-sm font-normal leading-6 text-neutral-600 line-clamp-2 md:text-base">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs font-['Satoshi'] text-gray-500 md:text-sm">
          <span className="flex items-center gap-1.5">
            <FiCalendar className="w-3 h-3 md:w-4 md:h-4" />
            {new Date(post.published_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <FiClock className="w-3 h-3 md:w-4 md:h-4" />
            {post.reading_time} min
          </span>
          <span className="flex items-center gap-1.5">
            <FiEye className="w-3 h-3 md:w-4 md:h-4" />
            {post.view_count}
          </span>
        </div>
      </div>
    </Link>
  );
}

