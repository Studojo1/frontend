/**
 * Add security headers to HTTP responses
 */
export function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY");
  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");
  // XSS protection (legacy but still useful)
  headers.set("X-XSS-Protection", "1; mode=block");
  // HSTS - only set if using HTTPS (check via protocol or env var)
  if (process.env.NODE_ENV === "production" || process.env.FORCE_HTTPS === "true") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  // Basic CSP - can be customized per application
  // For now, use a permissive CSP that allows common resources
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.fontshare.com https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://cdn.fontshare.com",
      // Fontshare serves the @font-face CSS from api.fontshare.com but the actual .woff2 files
      // from cdn.fontshare.com — font-src MUST allow the CDN host or every font file is
      // CSP-blocked and the whole UI falls back to serif (regression from the CSP added in
      // a6876b5, which whitelisted only the stylesheet host).
      "font-src 'self' https://api.fontshare.com https://cdn.fontshare.com",
      "img-src 'self' data: https:",
      "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
      "connect-src 'self' https://api.studojo.com https://api.studojo.pro https://api.mixpanel.com https://lumberjack-cx.razorpay.com https://api.razorpay.com",
    ].join("; ")
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

