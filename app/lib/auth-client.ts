import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  jwtClient,
  lastLoginMethodClient,
  phoneNumberClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { fetchWithRetry } from "./fetch-with-retry";

// Wrap fetchWithRetry to match native fetch signature for Better Auth
const fetchWithRetryWrapper = async (
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> => {
  // Convert input to URL string
  let urlString: string;
  let requestInit: RequestInit = init || {};
  
  if (typeof input === "string") {
    urlString = input;
  } else if (input instanceof URL) {
    urlString = input.toString();
  } else if (input instanceof Request) {
    urlString = input.url;
    // Merge Request's init with provided init
    requestInit = {
      method: input.method,
      headers: input.headers,
      body: input.body,
      mode: input.mode,
      credentials: input.credentials,
      cache: input.cache,
      redirect: input.redirect,
      referrer: input.referrer,
      referrerPolicy: input.referrerPolicy,
      integrity: input.integrity,
      ...init, // Provided init overrides Request's init
    };
  } else {
    throw new Error("Invalid input type for fetch");
  }
  
  return fetchWithRetry(urlString, {
    ...requestInit,
    maxRetries: 3,
    timeout: 30 * 1000, // 30 seconds for auth requests
  });
};

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined" ? window.location.origin : "",
  fetch: fetchWithRetryWrapper, // Use our retry-enabled fetch
  plugins: [
    lastLoginMethodClient(),
    jwtClient(),
    adminClient(),
    passkeyClient(),
    phoneNumberClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/2fa";
        }
      },
    }),
  ],
});
