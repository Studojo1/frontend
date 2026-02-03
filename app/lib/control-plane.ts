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

// Token cache to reduce auth requests (5 minute TTL)
let tokenCache: { token: string; expires: number } | null = null;
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getToken(): Promise<string | null> {
  // Check cache first
  if (tokenCache && tokenCache.expires > Date.now()) {
    return tokenCache.token;
  }

  // Clear expired cache
  tokenCache = null;

  // Get token with retry (Better Auth client now uses fetchWithRetry internally)
  try {
    const { data, error } = await authClient.token();
    if (error || !data?.token) return null;
    
    // Cache the token
    tokenCache = {
      token: data.token,
      expires: Date.now() + TOKEN_CACHE_TTL,
    };
    
    return data.token;
  } catch (error: any) {
    // If it's a network error, the fetchWithRetry wrapper should have retried
    // But if it still fails after retries, return null
    console.warn("Failed to get auth token:", error);
    return null;
  }
}

/** Assignment-gen v1 minimal payload. */
export interface SubmitPayload {
  assignment_type: string;
  description: string;
  length_words: number;
  format_style: string;
  allow_web_search: boolean;
  humanizer_config?: { enabled: boolean; intensity: string };
}

/** POST /v1/jobs response (202 new, 200 replay). */
export interface SubmitResponse {
  job_id: string;
  status: string;
  created_at: string;
  result?: { download_url?: string; [k: string]: unknown };
}

/** GET /v1/jobs/:id response. */
export interface JobResponse {
  job_id: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  result?: { download_url?: string; [k: string]: unknown };
  error?: string;
  progress?: number; // 0-100
  current_section?: string; // Current section being processed
}

/** Control plane API error body. */
export interface ApiError {
  error?: { code?: string; message?: string };
}

export class ControlPlaneError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: ApiError
  ) {
    super(message);
    this.name = "ControlPlaneError";
  }
}

export interface OutlineResponse {
  job_id: string;
  status: string;
  outline?: any;
}

export interface OutlineEditResponse {
  job_id: string;
  status: string;
  outline?: any;
  assistant_message?: string;
}

/** Resume generation payload. */
export interface ResumeGenPayload {
  resume: any; // Resume JSON object matching services-jobs resume model
  job_title?: string;
  company?: string;
  job_description?: string;
}

/** Resume optimization payload. */
export interface ResumeOptimizePayload {
  resume: any; // Resume JSON object
  job_title: string;
  company: string;
  job_description: string;
}

/** Generate outline from assignment description (free, no payment). */
export async function generateOutline(
  payload: SubmitPayload
): Promise<OutlineResponse> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("No token", 401);

  const base = getControlPlaneUrl();
  const res = await fetchWithRetry(`${base}/v1/outlines/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "assignment-gen",
      payload,
    }),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = (await res.json()) as OutlineResponse | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    throw new ControlPlaneError(
      err?.error?.message ?? "Outline generation failed",
      res.status,
      err
    );
  }
  return data as OutlineResponse;
}

/** Edit outline via chat message (free, no payment). */
export async function editOutline(
  outline: any,
  userMessage: string
): Promise<OutlineEditResponse> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("No token", 401);

  const base = getControlPlaneUrl();
  const res = await fetchWithRetry(`${base}/v1/outlines/edit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      outline,
      user_message: userMessage,
    }),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = (await res.json()) as OutlineEditResponse | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    throw new ControlPlaneError(
      err?.error?.message ?? "Outline editing failed",
      res.status,
      err
    );
  }
  return data as OutlineEditResponse;
}

export async function submitJob(
  payload: SubmitPayload,
  paymentOrderId: string,
  outline?: any
): Promise<{
  res: SubmitResponse;
  status: number;
}> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("No token", 401);

  const base = getControlPlaneUrl();
  const body: any = {
    type: "assignment-gen",
    payload,
    payment_order_id: paymentOrderId,
  };
  if (outline) {
    body.outline = outline;
  }

  const res = await fetchWithRetry(`${base}/v1/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = (await res.json()) as SubmitResponse | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    throw new ControlPlaneError(
      err?.error?.message ?? "Submit failed",
      res.status,
      err
    );
  }
  return { res: data as SubmitResponse, status: res.status };
}

export async function getJob(jobId: string): Promise<JobResponse> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("No token", 401);

  const base = getControlPlaneUrl();
  const res = await fetchWithRetry(`${base}/v1/jobs/${encodeURIComponent(jobId)}`, {
    headers: { Authorization: `Bearer ${token}` },
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = (await res.json()) as JobResponse | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    throw new ControlPlaneError(
      err?.error?.message ?? "Get job failed",
      res.status,
      err
    );
  }
  return data as JobResponse;
}

/** List jobs for the current user. */
export async function getJobs(
  jobType?: string,
  limit?: number,
  offset?: number
): Promise<JobResponse[]> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("No token", 401);

  const base = getControlPlaneUrl();
  const params = new URLSearchParams();
  if (jobType) params.append("type", jobType);
  if (limit !== undefined) params.append("limit", limit.toString());
  if (offset !== undefined) params.append("offset", offset.toString());

  const url = `${base}/v1/jobs${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetchWithRetry(url, {
    headers: { Authorization: `Bearer ${token}` },
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = (await res.json()) as JobResponse[] | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    throw new ControlPlaneError(
      err?.error?.message ?? "List jobs failed",
      res.status,
      err
    );
  }
  return data as JobResponse[];
}

/** Submit resume generation job. */
export async function submitResumeJob(
  payload: ResumeGenPayload
): Promise<{
  res: SubmitResponse;
  status: number;
}> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("No token", 401);

  const base = getControlPlaneUrl();
  const res = await fetchWithRetry(`${base}/v1/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "resume-gen",
      payload,
    }),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = (await res.json()) as SubmitResponse | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    throw new ControlPlaneError(
      err?.error?.message ?? "Resume generation failed",
      res.status,
      err
    );
  }
  return { res: data as SubmitResponse, status: res.status };
}

/** Submit resume optimization job. */
export async function optimizeResumeJob(
  payload: ResumeOptimizePayload
): Promise<{
  res: SubmitResponse;
  status: number;
}> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("No token", 401);

  const base = getControlPlaneUrl();
  const res = await fetchWithRetry(`${base}/v1/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "resume-optimize",
      payload,
    }),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = (await res.json()) as SubmitResponse | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    throw new ControlPlaneError(
      err?.error?.message ?? "Resume optimization failed",
      res.status,
      err
    );
  }
  return { res: data as SubmitResponse, status: res.status };
}

/** Humanizer job payload. */
export interface HumanizerJobPayload {
  file_url?: string; // Blob storage URL (preferred for large files)
  file_data?: string; // Base64 encoded DOCX file (fallback)
  original_filename: string;
  word_count?: number;
}

/** Humanizer price calculation response. */
export interface HumanizerPriceResponse {
  word_count: number;
  amount: number; // Amount in paise
  amount_inr: number; // Amount in INR
}

/** Parse DOCX file and count words in the browser. */
async function parseDocxWordCount(file: File): Promise<number> {
  // DOCX is a ZIP archive - use JSZip to extract document.xml
  const JSZip = (await import("jszip")).default;
  
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Get document.xml from the ZIP
  const documentXml = zip.file("word/document.xml");
  if (!documentXml) {
    throw new Error("Invalid DOCX file: document.xml not found");
  }
  
  // Parse XML and extract text
  const xmlText = await documentXml.async("string");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  
  // Extract all text nodes
  const textNodes = xmlDoc.evaluate(
    "//text()",
    xmlDoc,
    null,
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
    null
  );
  
  let allText = "";
  let node;
  while ((node = textNodes.iterateNext())) {
    allText += node.textContent + " ";
  }
  
  // Count words (split by whitespace, filter empty)
  const words = allText.trim().split(/\s+/).filter((w) => w.length > 0);
  return words.length;
}

/** Calculate humanizer price with retry logic. */
export async function calculateHumanizerPrice(
  file: File
): Promise<HumanizerPriceResponse> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("No token", 401);

  // Parse DOCX in browser to get actual word count
  const wordCount = await parseDocxWordCount(file);

  const base = getControlPlaneUrl();
  const res = await fetchWithRetry(`${base}/v1/humanizer/calculate-price`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ word_count: wordCount }),
    maxRetries: 3,
    timeout: 30 * 1000, // 30 seconds
  });

  const data = (await res.json()) as HumanizerPriceResponse | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    throw new ControlPlaneError(
      err?.error?.message ?? "Price calculation failed",
      res.status,
      err
    );
  }
  return data as HumanizerPriceResponse;
}

/** Upload humanizer file directly to Azure Blob Storage with retry logic. */
export async function uploadHumanizerFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ file_url: string }> {
  // Validate file size (100MB limit)
  const maxSizeBytes = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSizeBytes) {
    throw new ControlPlaneError(
      `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 100MB`,
      400,
      { error: { message: "File too large" } }
    );
  }

  const token = await getToken();
  if (!token) throw new ControlPlaneError("No token", 401);

  // Step 1: Get SAS URL for direct upload
  const base = getControlPlaneUrl();
  const res = await fetchWithRetry(`${base}/v1/humanizer/upload-file`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = (await res.json()) as {
    upload_sas_url: string;
    file_url: string;
    blob_name: string;
    container_name: string;
  } | ApiError;
  
  if (!res.ok) {
    const err = data as ApiError;
    throw new ControlPlaneError(
      err?.error?.message ?? "Failed to get upload URL",
      res.status,
      err
    );
  }

  const uploadData = data as {
    upload_sas_url: string;
    file_url: string;
    blob_name: string;
    container_name: string;
  };

  // Step 2: Upload file directly to Azure Blob Storage with progress tracking and retry logic
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use XMLHttpRequest for upload progress tracking
      const uploadPromise = new Promise<{ file_url: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress (only on first attempt to avoid confusion)
        if (onProgress && attempt === 0) {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              onProgress(percentComplete);
            }
          });
        }
        
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            if (onProgress) onProgress(100);
            resolve({ file_url: uploadData.file_url });
          } else {
            // Retry on 5xx errors, fail on 4xx
            if (xhr.status >= 500 && attempt < maxRetries - 1) {
              reject(new Error(`Server error ${xhr.status}, will retry`));
            } else {
              reject(new ControlPlaneError(
                `Upload failed with status ${xhr.status}: ${xhr.statusText}`,
                xhr.status,
                { error: { message: xhr.statusText } }
              ));
            }
          }
        });
        
        xhr.addEventListener("error", (event) => {
          // Check if it's a network error that should be retried
          const error = event as any;
          
          // Check multiple sources for error message
          const errorMessage = 
            error?.message || 
            error?.target?.statusText || 
            xhr.statusText || 
            (error?.target?.error?.message) ||
            (error?.target?.error?.toString()) ||
            String(error?.target?.error || "") ||
            "Network error";
          
          // Check for ERR_NETWORK_CHANGED in various formats
          const isNetworkError = 
            errorMessage.includes("ERR_NETWORK_CHANGED") ||
            errorMessage.includes("net::ERR_NETWORK_CHANGED") ||
            errorMessage.includes("Failed to fetch") ||
            errorMessage.includes("NetworkError") ||
            errorMessage.toLowerCase().includes("network") ||
            // Also check xhr readyState - if it's 0 or 4 with status 0, likely network error
            (xhr.readyState === 0 || (xhr.readyState === 4 && xhr.status === 0));
          
          if (isNetworkError && attempt < maxRetries - 1) {
            reject(new Error(`Network error, will retry: ${errorMessage}`));
          } else {
            reject(new ControlPlaneError(
              `Upload failed: ${errorMessage}`,
              0,
              { error: { message: errorMessage } }
            ));
          }
        });
        
        xhr.addEventListener("abort", () => {
          reject(new ControlPlaneError(
            "Upload aborted",
            0,
            { error: { message: "Upload aborted" } }
          ));
        });
        
        // Set timeout (5 minutes for large files)
        xhr.timeout = 5 * 60 * 1000;
        xhr.addEventListener("timeout", () => {
          if (attempt < maxRetries - 1) {
            reject(new Error("Upload timeout, will retry"));
          } else {
            reject(new ControlPlaneError(
              "Upload timeout after 5 minutes",
              0,
              { error: { message: "Upload timeout" } }
            ));
          }
        });
        
        xhr.open("PUT", uploadData.upload_sas_url);
        xhr.setRequestHeader("x-ms-blob-type", "BlockBlob");
        xhr.setRequestHeader("Content-Type", file.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        xhr.setRequestHeader("x-ms-version", "2021-04-10");
        xhr.send(file);
      });
      
      return await uploadPromise;
    } catch (error: any) {
      lastError = error;
      const isLastAttempt = attempt === maxRetries - 1;
      
      // If it's a ControlPlaneError, don't retry (it's a permanent error)
      if (error instanceof ControlPlaneError) {
        throw error;
      }
      
      // If it's the last attempt, throw the error
      if (isLastAttempt) {
        throw new ControlPlaneError(
          `Upload failed after ${maxRetries} attempts: ${error.message || "Network error"}`,
          0,
          { error: { message: error.message || "Network error" } }
        );
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const backoffMs = Math.min(1000 * Math.pow(2, attempt), 4000);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      
      // Reset progress on retry (will be updated on next attempt)
      if (onProgress && attempt < maxRetries - 1) {
        onProgress(0);
      }
    }
  }
  
  // Should never reach here, but TypeScript needs it
  throw lastError || new ControlPlaneError(
    "Upload failed: Unknown error",
    0,
    { error: { message: "Unknown error" } }
  );
}

/** Submit humanizer job with pre-uploaded file URL. */
export async function submitHumanizerJobWithURL(
  fileUrl: string,
  originalFilename: string,
  paymentOrderId: string
): Promise<SubmitResponse> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("No token", 401);

  const payload: HumanizerJobPayload = {
    file_url: fileUrl,
    original_filename: originalFilename,
  };

  const base = getControlPlaneUrl();
  const res = await fetchWithRetry(`${base}/v1/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "humanizer",
      payload,
      payment_order_id: paymentOrderId,
    }),
    maxRetries: 3,
    timeout: 30 * 1000,
  });

  const data = (await res.json()) as SubmitResponse | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    throw new ControlPlaneError(
      err?.error?.message ?? "Humanizer job submission failed",
      res.status,
      err
    );
  }
  return data as SubmitResponse;
}

/** Submit humanizer job (uploads file first, then submits). */
export async function submitHumanizerJob(
  file: File,
  paymentOrderId: string
): Promise<SubmitResponse> {
  // Upload file to blob storage first
  const uploadResult = await uploadHumanizerFile(file);
  // Then submit with the URL
  return submitHumanizerJobWithURL(uploadResult.file_url, file.name, paymentOrderId);
}
