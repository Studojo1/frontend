import { authClient } from "./auth-client";
import { fetchWithRetry } from "./fetch-with-retry";

export function getControlPlaneUrl(): string {
  const url = import.meta.env?.VITE_CONTROL_PLANE_URL;
  if (typeof url === "string" && url) {
    return url;
  }
  // In production, dynamically determine API URL based on current hostname
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname.includes("studojo.pro") || hostname.includes("studojo.com")) {
      // Use the same TLD as the current hostname
      const tld = hostname.includes("studojo.com") ? "studojo.com" : "studojo.pro";
      return `${protocol}//api.${tld}`;
    }
  }
  // Development fallback
  return "http://localhost:8080";
}

export async function getToken(): Promise<string | null> {
  const { data, error } = await authClient.token();
  if (error || !data?.token) return null;
  return data.token;
}

/** Payment order creation request. */
export interface CreateOrderRequest {
  amount: number; // Amount in paise (e.g., 13900 for ₹139)
  job_type?: string; // Optional job type (e.g., "humanizer")
}

/** Payment order creation response. */
export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  key_id: string;
}

/** Payment verification request. */
export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  job_id?: string;
}

/** Payment verification response. */
export interface VerifyPaymentResponse {
  payment_id: string;
  status: string;
  job_id?: string;
}

/** Control plane API error body. */
export interface ApiError {
  error?: { code?: string; message?: string };
}

export class PaymentError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: ApiError
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

/** Create a Razorpay payment order. */
export async function createPaymentOrder(
  amount: number,
  jobType?: string
): Promise<CreateOrderResponse> {
  const token = await getToken();
  if (!token) throw new PaymentError("No token", 401);

  const base = getControlPlaneUrl();
  const body: CreateOrderRequest = { amount };
  if (jobType) {
    body.job_type = jobType;
  }

  const res = await fetchWithRetry(`${base}/v1/payments/create-order`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = (await res.json()) as CreateOrderResponse | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    throw new PaymentError(
      err?.error?.message ?? "Failed to create payment order",
      res.status,
      err
    );
  }
  return data as CreateOrderResponse;
}

/** Verify Razorpay payment. */
export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string,
  jobId?: string
): Promise<VerifyPaymentResponse> {
  const token = await getToken();
  if (!token) throw new PaymentError("No token", 401);

  const base = getControlPlaneUrl();
  const res = await fetchWithRetry(`${base}/v1/payments/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      job_id: jobId,
    }),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = (await res.json()) as VerifyPaymentResponse | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    throw new PaymentError(
      err?.error?.message ?? "Payment verification failed",
      res.status,
      err
    );
  }
  return data as VerifyPaymentResponse;
}

/** Load Razorpay script dynamically. */
export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
}

/** Open Razorpay checkout. */
export async function openRazorpayCheckout(
  options: {
    key: string;
    amount: number;
    currency?: string;
    name?: string;
    description?: string;
    order_id?: string; // Optional - if not provided, Razorpay creates order automatically
    handler: (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => void;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
    onDismiss?: () => void; // Callback when user closes modal
    onPaymentFailed?: (response: any) => void; // Callback when payment fails
  }
): Promise<void> {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay not loaded");
  }

  // Track if payment was completed to prevent onDismiss from firing
  let paymentCompleted = false;
  
  // Wrap the handler to track payment completion
  const wrappedHandler = (response: any) => {
    // Mark payment as completed
    paymentCompleted = true;
    
    // Ensure we pass the response as-is to the original handler
    if (options.handler) {
      options.handler(response);
    }
  };

  const rzpOptions: any = {
    key: options.key,
    amount: options.amount,
    currency: options.currency || "INR",
    name: options.name || "Studojo",
    description: options.description || "Assignment Generation",
    handler: wrappedHandler,
    prefill: options.prefill,
    theme: options.theme || { color: "#7c3aed" }, // violet-500
    modal: {
        ondismiss: () => {
          // Only call onDismiss if payment wasn't completed
          // Add a small delay to ensure payment handler has run first
          setTimeout(() => {
            if (!paymentCompleted && options.onDismiss) {
              options.onDismiss();
            }
          }, 200);
        },
      // Prevent modal from closing on escape key (user must click X)
      escape: false,
      // Prevent backdrop click from closing modal
      backdropclose: false,
    },
    // Simplified - removed complex config that might cause test bank page to close
    // Add retry configuration for test mode
    retry: {
      enabled: true,
      max_count: 3,
    },
  };

  // Add order_id if provided (for server-side order creation)
  // This ensures Razorpay uses the server-created order
  if (options.order_id) {
    rzpOptions.order_id = options.order_id;
  }

  const rzp = new window.Razorpay(rzpOptions);
  
  // Set up error handler for payment failures
  if (options.onPaymentFailed) {
    rzp.on("payment.failed", (response: any) => {
      paymentCompleted = true; // Mark as handled to prevent onDismiss
      options.onPaymentFailed!(response);
    });
  }
  
  // Handle modal close
  rzp.on("close", (response: any) => {
    if (!paymentCompleted && options.onDismiss) {
      // Small delay to ensure payment handler has run
      setTimeout(() => {
        if (!paymentCompleted) {
          options.onDismiss!();
        }
      }, 200);
    }
  });
  
  // Suppress Razorpay console warnings (they're harmless)
  const originalWarn = console.warn;
  const originalError = console.error;
  const suppressRazorpayWarnings = () => {
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      // Suppress Razorpay-specific warnings
      if (
        message.includes("Unrecognized feature") ||
        message.includes("web-share") ||
        message.includes("unsafe header") ||
        message.includes("x-rtb-fingerprint-id")
      ) {
        return; // Suppress these warnings
      }
      originalWarn.apply(console, args);
    };
    
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      // Suppress Razorpay-specific errors that are actually warnings
      if (
        message.includes("Unrecognized feature") ||
        message.includes("web-share") ||
        message.includes("unsafe header") ||
        message.includes("x-rtb-fingerprint-id") ||
        message.includes("api.razorpay.com/v2/otp/verify")
      ) {
        return; // Suppress these
      }
      originalError.apply(console, args);
    };
  };
  
  suppressRazorpayWarnings();
  
  // Restore console after a delay
  setTimeout(() => {
    console.warn = originalWarn;
    console.error = originalError;
  }, 10000);
  
  rzp.open();
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}
