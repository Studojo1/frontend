interface BlogContentProps {
  content: string;
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

function processBlogContentHtml(html: string): string {
  if (!html) return html;
  
  // Find all img tags with src attributes
  // Pattern matches various formats:
  // <img src="filename.png">
  // <img src='filename.png'>
  // <img src=filename.png>
  // <img alt="..." src="filename.png">
  // Handles attributes before and after src, with or without quotes
  // More robust pattern that handles quoted and unquoted src values
  return html.replace(/<img([^>]*?)src\s*=\s*((["'])([^"']+)\3|([^\s>]+))([^>]*?)>/gi, (match, beforeSrc, fullSrcAttr, quote, quotedValue, unquotedValue, afterSrc) => {
    // Extract the actual src value (either from quoted or unquoted)
    const srcValue = quotedValue || unquotedValue;
    const quoteChar = quote || '"';
    
    if (!srcValue) return match;
    
    // Normalize the image URL
    const normalizedSrc = normalizeImageUrl(srcValue);
    
    // If the URL was normalized, replace it in the tag
    if (normalizedSrc && normalizedSrc !== srcValue) {
      // Reconstruct the img tag with the normalized src
      return `<img${beforeSrc}src=${quoteChar}${normalizedSrc}${quoteChar}${afterSrc}>`;
    }
    
    // Return original if no change needed
    return match;
  });
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

