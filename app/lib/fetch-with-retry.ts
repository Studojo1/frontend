/**
 * Centralized fetch wrapper with retry logic for handling network errors.
 * Handles ERR_NETWORK_CHANGED, Failed to fetch, and other browser network errors.
 */

export interface FetchWithRetryOptions extends RequestInit {
  /**
   * Maximum number of retry attempts (default: 3)
   */
  maxRetries?: number;
  
  /**
   * Timeout in milliseconds (default: 30000 for regular requests, 300000 for uploads)
   */
  timeout?: number;
  
  /**
   * Whether this is a file upload request (uses longer timeout)
   */
  isUpload?: boolean;
  
  /**
   * Custom retry condition function. Return true to retry, false to fail immediately.
   */
  shouldRetry?: (error: Error, response: Response | null, attempt: number) => boolean;
  
  /**
   * Suppress console errors during retries. Only log final failures. (default: true)
   */
  silent?: boolean;
}

/**
 * Recursively extract error message from error and its cause chain.
 */
function extractErrorMessage(error: any): string {
  if (!error) return "Network error";
  
  // Try multiple sources for error message
  const message = error?.message || "";
  const toString = error?.toString() || "";
  const stringError = String(error || "");
  
  // Check cause chain recursively
  const causeMessage = error?.cause ? extractErrorMessage(error.cause) : "";
  
  // Return first non-empty message found
  return message || toString || stringError || causeMessage || "Network error";
}

/**
 * Check if an error is a network error that should be retried.
 */
function isNetworkError(error: any): boolean {
  // Extract error message from multiple sources including cause chain
  const message = extractErrorMessage(error);
  const errorString = String(error || "");
  
  const networkErrorIndicators = [
    "ERR_NETWORK_CHANGED",
    "net::ERR_NETWORK_CHANGED", // Chrome's internal format
    "Failed to fetch",
    "network",
    "NetworkError",
    "timeout",
    "aborted",
    "ECONNRESET",
    "ECONNREFUSED",
    "ETIMEDOUT",
  ];
  
  // Check if error message contains any network error indicator
  const hasNetworkIndicator = networkErrorIndicators.some(
    indicator => 
      message.toLowerCase().includes(indicator.toLowerCase()) ||
      errorString.toLowerCase().includes(indicator.toLowerCase())
  );
  
  // Check error type
  const isTypeError = error?.name === "TypeError" || error instanceof TypeError;
  const isNetworkErrorType = error?.name === "NetworkError";
  const isAbortError = error?.name === "AbortError";
  
  // TypeError with network-related message is likely a network error
  if (isTypeError && (hasNetworkIndicator || message.includes("fetch"))) {
    return true;
  }
  
  return hasNetworkIndicator || isNetworkErrorType || (isAbortError && !message.includes("timeout"));
}

/**
 * Fetch with automatic retry on network errors.
 * 
 * @param url - Request URL
 * @param options - Fetch options with retry configuration
 * @returns Promise<Response>
 */
export async function fetchWithRetry(
  url: string | URL,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    timeout,
    isUpload = false,
    shouldRetry,
    silent = true, // Default to silent retries
    ...fetchOptions
  } = options;
  
  // Default timeout: 5 minutes for uploads, 30 seconds for regular requests
  const defaultTimeout = isUpload ? 5 * 60 * 1000 : 30 * 1000;
  const requestTimeout = timeout ?? defaultTimeout;
  
  let lastError: Error | null = null;
  let lastResponse: Response | null = null;
  
  // Store original console methods for suppression
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Check network state before attempting request
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      // Wait for network to come back online
      await new Promise<void>((resolve) => {
        const checkOnline = () => {
          if (navigator.onLine) {
            window.removeEventListener("online", checkOnline);
            // Small delay after network comes back online for stability
            setTimeout(resolve, 500);
          }
        };
        window.addEventListener("online", checkOnline);
        // Also check immediately in case it's already online
        if (navigator.onLine) {
          setTimeout(resolve, 500);
        } else {
          // Timeout after 10 seconds if network doesn't come back
          setTimeout(() => {
            window.removeEventListener("online", checkOnline);
            resolve();
          }, 10000);
        }
      });
    }
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
      
      try {
        // Use timeout controller signal, or merge with existing signal if provided
        let signal = controller.signal;
        if (fetchOptions.signal) {
          // If both signals exist, abort on either
          const combinedController = new AbortController();
          const abort = () => combinedController.abort();
          controller.signal.addEventListener("abort", abort);
          fetchOptions.signal.addEventListener("abort", abort);
          signal = combinedController.signal;
        }
        
        const response = await fetch(url, {
          ...fetchOptions,
          signal,
        });
        
        clearTimeout(timeoutId);
        
        // Check if response is OK
        if (response.ok) {
          return response;
        }
        
        // For non-OK responses, check if we should retry
        lastResponse = response;
        
        // Don't retry on client errors (4xx) except for network-related issues
        if (response.status >= 400 && response.status < 500) {
          // 401/403 are auth errors - don't retry
          if (response.status === 401 || response.status === 403) {
            return response;
          }
          
          // For other 4xx errors, only retry if custom shouldRetry says so
          if (shouldRetry) {
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
            if (!shouldRetry(error, response, attempt)) {
              return response;
            }
          } else {
            // Default: don't retry 4xx errors
            return response;
          }
        }
        
        // For 5xx errors, throw to trigger retry
        if (response.status >= 500) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // For other non-OK responses, return as-is
        return response;
        
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        // Handle abort/timeout
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${requestTimeout / 1000}s`);
        }
        
        throw error;
      }
      
    } catch (error: any) {
      lastError = error;
      const isLastAttempt = attempt === maxRetries - 1;
      
      // Check if we should retry this error
      let shouldRetryError = false;
      
      if (shouldRetry) {
        // Use custom retry logic
        shouldRetryError = shouldRetry(error, lastResponse, attempt);
      } else {
        // Default retry logic
        shouldRetryError = isNetworkError(error);
        
        // Don't retry on auth errors (these are handled above, but double-check)
        if (error.status === 401 || error.status === 403) {
          shouldRetryError = false;
        }
      }
      
      // If we shouldn't retry or this is the last attempt, throw
      if (!shouldRetryError || isLastAttempt) {
        // Restore console methods before throwing final error
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        
        // Enhance error message for network errors
        if (isNetworkError(error) && isLastAttempt) {
          throw new Error(
            `Request failed after ${maxRetries} attempts: ${extractErrorMessage(error)}. Please check your connection and try again.`
          );
        }
        throw error;
      }
      
      // Suppress console errors during retries if silent mode is enabled
      if (silent && !isLastAttempt) {
        console.error = () => {}; // Suppress errors during retries
        console.warn = () => {}; // Suppress warnings during retries
      }
      
      // Exponential backoff: 500ms, 1s, 2s
      const backoffMs = Math.min(500 * Math.pow(2, attempt), 2000);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      
      // Restore console methods after backoff (before next attempt)
      if (silent) {
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
      }
    }
  }
  
  // Restore console methods before final throw
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  
  // Should never reach here, but TypeScript needs it
  throw lastError || new Error("Request failed: Unknown error");
}

