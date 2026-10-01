import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext, HandleErrorFunction } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, isRouteErrorResponse } from "react-router";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";

export const streamTimeout = 5_000;

/** Basic hardening on every HTML page (audit HP-N17). Deliberately not the
 * full CSP from security-headers.server.ts, which would block PostHog and the
 * Meta pixel. Set on HEAD too, which is what `curl -I` and scanners send. */
export function setPageSecurityHeaders(headers: Headers): void {
  headers.set("Content-Security-Policy", "frame-ancestors 'self'");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
}

/** Server error logging (audit AR-B05). React Router's default logs every
 * unmatched URL as an Error with a ~70-line stack: the Facebook crawler asks
 * for /meta.json ~420 times a day and scanners probe /.env and *.php, which
 * buried real errors. A 404 is not a server error and the ingress log already
 * records it, so it is not logged here. Everything else is logged as before. */
export const handleError: HandleErrorFunction = (error, { request }) => {
  if (request.signal.aborted) return;
  if (isRouteErrorResponse(error) && error.status === 404) return;
  const inner = isRouteErrorResponse(error) ? (error as { error?: unknown }).error : undefined;
  console.error(inner ?? error);
};

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext,
  // If you have middleware enabled:
  // loadContext: RouterContextProvider
) {
  // www serves the app, but the OAuth state cookie is host-only and Google
  // returns to the apex callback, so Google sign-in started on www always
  // fails with state_mismatch. Send every www page to the apex.
  const url = new URL(request.url);
  if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.slice(4);
    url.protocol = "https:"; // TLS ends at the ingress, so request.url is http
    return new Response(null, { status: 301, headers: { Location: url.toString() } });
  }

  // https://httpwg.org/specs/rfc9110.html#HEAD
  if (request.method.toUpperCase() === "HEAD") {
    setPageSecurityHeaders(responseHeaders);
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  }

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");

    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
    let readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    // Abort the rendering stream after the `streamTimeout` so it has time to
    // flush down the rejected boundaries
    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => abort(),
      streamTimeout + 1000,
    );

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              // Clear the timeout to prevent retaining the closure and memory leak
              clearTimeout(timeoutId);
              timeoutId = undefined;
              callback();
            },
          });
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          // Hashed assets under /assets already ship
          // `max-age=31536000, immutable`, but the HTML document that names
          // those hashes had no Cache-Control at all. With no directive a
          // browser applies its own heuristic and can hold the document for
          // hours, so a returning visitor keeps loading the OLD html pointing
          // at the OLD bundles -- a deploy looks like it did nothing. That is
          // exactly what happened after the mobile fixes shipped.
          //
          // no-cache does not mean "never store": it means revalidate before
          // reusing. This response is streamed and carries no ETag, so a
          // revalidation re-sends the document rather than returning 304 --
          // the cost is one small HTML fetch per navigation, against deploys
          // that actually reach people. Only set it when nothing upstream has
          // already decided.
          if (!responseHeaders.has("Cache-Control")) {
            responseHeaders.set("Cache-Control", "no-cache");
          }

          setPageSecurityHeaders(responseHeaders);

          pipe(body);

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );
  });
}
