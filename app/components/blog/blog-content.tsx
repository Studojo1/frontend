import { CTA_INLINE_HTML } from "./blog-cta-bar";

interface BlogContentProps {
  content: string;
}

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
    if (filenamePattern.test(url) && !url.startsWith("/")) return `/api/images/blog-images/${url}`;
    if (url.startsWith("/")) return url;
  }
  const filenamePattern = /^(\d+-)?[^\/]+\.(png|jpg|jpeg|webp|gif)$/i;
  if (filenamePattern.test(url) && !url.startsWith("/") && !url.includes("://")) return `/api/images/blog-images/${url}`;
  return url;
}

function processBlogContentHtml(html: string): string {
  if (!html) return html;

  // 1. Fix legacy job.studojo.com links → studojo.com/outreach
  let processed = html.replace(
    /https?:\/\/job\.studojo\.com[^\s"'>]*/gi,
    "https://studojo.com/outreach"
  );

  // 2. Also fix any href that points to job.studojo.com (in case protocol-relative or other formats)
  processed = processed.replace(
    /(href\s*=\s*["'])https?:\/\/job\.studojo\.com[^\s"']*(["'])/gi,
    "$1https://studojo.com/outreach$2"
  );

  // 3. Replace manually-inserted CTA placeholders (from Maverick editor)
  //    Matches: <div data-studojo-cta="outreach">...</div> (possibly with inner content)
  processed = processed.replace(
    /<div[^>]*data-studojo-cta="outreach"[^>]*>[\s\S]*?<\/div>/gi,
    CTA_INLINE_HTML
  );

  // 4. Fix image URLs
  processed = processed.replace(
    /<img([^>]*?)src\s*=\s*((["'])([^"']+)\3|([^\s>]+))([^>]*?)>/gi,
    (match, beforeSrc, fullSrcAttr, quote, quotedValue, unquotedValue, afterSrc) => {
      const srcValue = quotedValue || unquotedValue;
      const quoteChar = quote || '"';
      if (!srcValue) return match;
      const normalizedSrc = normalizeImageUrl(srcValue);
      if (normalizedSrc && normalizedSrc !== srcValue) {
        return `<img${beforeSrc}src=${quoteChar}${normalizedSrc}${quoteChar}${afterSrc}>`;
      }
      return match;
    }
  );

  // 5. Ensure all img tags have an alt attribute (empty string if missing — required for accessibility + SEO)
  processed = processed.replace(
    /<img(?![^>]*\balt\s*=)([^>]*?)>/gi,
    '<img alt=""$1>'
  );

  return processed;
}

export function BlogContent({ content }: BlogContentProps) {
  const processedContent = processBlogContentHtml(content);
  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
