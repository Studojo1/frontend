import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "test";
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || "test";
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "resumes";
const useLocalStack = process.env.USE_LOCALSTACK === "true";
const localStackEndpoint = process.env.LOCALSTACK_ENDPOINT || "http://localstack:4566";

let blobServiceClient: BlobServiceClient | null = null;

function isLocalStackS3SuccessError(error: any): boolean {
  if (!useLocalStack || !error) return false;
  const status = (error as any).statusCode ?? (error as any).status;
  const details = (error as any).details || {};
  return (
    status === 200 &&
    (details["x-amz-request-id"] || details["x-amz-id-2"])
  );
}

function getBlobServiceClient(): BlobServiceClient {
  if (blobServiceClient) {
    return blobServiceClient;
  }

  if (useLocalStack) {
    // Use LocalStack for local development.
    // For LocalStack S3 emulation, the *container name* should map directly to the S3 bucket name.
    // LocalStack buckets are created as:
    //   aws --endpoint-url=http://localstack:4566 s3 mb s3://resumes
    // so we want BlobEndpoint to point at /{containerName}, not /{accountName}.
    //
    // We still provide AccountName/Key to satisfy the Azure SDK, but LocalStack will
    // ignore them and just use the S3 bucket path semantics.
    const internalEndpoint = localStackEndpoint.includes("localhost:")
      ? localStackEndpoint.replace("localhost:", "localstack:")
      : localStackEndpoint;

    // Point BlobEndpoint at the LocalStack S3 root; the Azure SDK will append
    // "/{containerName}" for getContainerClient(containerName), which maps to
    // the S3 bucket name created by localstack-init.
    const connectionString = `DefaultEndpointsProtocol=http;AccountName=${accountName};AccountKey=${accountKey};BlobEndpoint=${internalEndpoint};`;
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  } else {
    // Use real Azure Blob Storage
    if (!accountName || !accountKey) {
      throw new Error("AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY are required");
    }
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceUrl = `https://${accountName}.blob.core.windows.net`;
    blobServiceClient = new BlobServiceClient(blobServiceUrl, sharedKeyCredential);
  }

  return blobServiceClient;
}

/**
 * Upload a template preview PNG to blob storage.
 * @param templateId - The template ID (e.g., "modern", "classic")
 * @param pngBuffer - The PNG image buffer
 * @returns The public URL to access the uploaded preview
 */
export async function uploadTemplatePreview(
  templateId: string,
  pngBuffer: Buffer
): Promise<string> {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(containerName);
  
  // Ensure container exists
  try {
    // Try to create with public blob access (for template previews)
    await containerClient.createIfNotExists({
      access: "blob", // Public read access for blobs in container
    });
  } catch (error: any) {
    // If public access is not allowed (Azure policy), try without it
    if (error.message?.includes("Public access") || error.message?.includes("not permitted")) {
      try {
        await containerClient.createIfNotExists();
        console.warn("Container created without public access - blobs may need SAS tokens or proxy");
      } catch (e: any) {
        // Container might already exist, ignore
        if (!e.message?.includes("ContainerAlreadyExists") && !e.message?.includes("409")) {
          console.warn("Failed to create container:", e);
        }
      }
    } else if (!error.message?.includes("ContainerAlreadyExists") && 
               !error.message?.includes("409")) {
      console.warn("Failed to create container (may already exist):", error);
    }
  }

  // Upload the PNG
  const blobName = `template-previews/${templateId}.png`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  await blockBlobClient.upload(pngBuffer, pngBuffer.length, {
    blobHTTPHeaders: {
      blobContentType: "image/png",
      blobCacheControl: "public, max-age=86400", // Cache for 24 hours
    },
  });

  // Return the public URL
  if (useLocalStack) {
    // For LocalStack, use localhost for external browser access
    const externalEndpoint = localStackEndpoint.includes("localstack:")
      ? localStackEndpoint.replace("localstack:", "localhost:")
      : localStackEndpoint;
    return `${externalEndpoint}/${containerName}/${blobName}`;
  } else {
    // For Azure, use the blob URL directly
    return blockBlobClient.url;
  }
}

/**
 * Check if a template preview exists in blob storage.
 * @param templateId - The template ID
 * @returns The URL if exists, null otherwise
 */
export async function getTemplatePreviewUrl(templateId: string): Promise<string | null> {
  try {
    const client = getBlobServiceClient();
    const containerClient = client.getContainerClient(containerName);
    const blobName = `template-previews/${templateId}.png`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Check if blob exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      return null;
    }

    // Return the public URL
    if (useLocalStack) {
      // For LocalStack, use localhost for external browser access
      const externalEndpoint = localStackEndpoint.includes("localstack:")
        ? localStackEndpoint.replace("localstack:", "localhost:")
        : localStackEndpoint;
      return `${externalEndpoint}/${containerName}/${blobName}`;
    } else {
      return blockBlobClient.url;
    }
  } catch (error) {
    console.error("Error checking template preview:", error);
    return null;
  }
}

/**
 * Upload template metadata JSON to blob storage
 * @param templateId - The template ID
 * @param metadata - Template metadata object
 * @returns The public URL to access the uploaded metadata
 */
export async function uploadTemplateMetadata(
  templateId: string,
  metadata: any
): Promise<string> {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(containerName);
  
  // Ensure container exists
  await containerClient.createIfNotExists({
    access: "blob",
  });

  const blobName = `templates/${templateId}/metadata.json`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const metadataJson = JSON.stringify(metadata, null, 2);
  const buffer = Buffer.from(metadataJson, "utf-8");
  
  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: {
      blobContentType: "application/json",
      blobCacheControl: "public, max-age=3600", // Cache for 1 hour
    },
  });

  if (useLocalStack) {
    const externalEndpoint = localStackEndpoint.includes("localstack:")
      ? localStackEndpoint.replace("localstack:", "localhost:")
      : localStackEndpoint;
    return `${externalEndpoint}/${containerName}/${blobName}`;
  } else {
    return blockBlobClient.url;
  }
}

/**
 * Upload template LaTeX file to blob storage
 * @param templateId - The template ID
 * @param latexContent - LaTeX file content as string
 * @returns The public URL to access the uploaded LaTeX file
 */
export async function uploadTemplateLaTeX(
  templateId: string,
  latexContent: string
): Promise<string> {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(containerName);
  
  await containerClient.createIfNotExists({
    access: "blob",
  });

  const blobName = `templates/${templateId}/resume.tex`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const buffer = Buffer.from(latexContent, "utf-8");
  
  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: {
      blobContentType: "text/plain",
      blobCacheControl: "public, max-age=3600",
    },
  });

  if (useLocalStack) {
    const externalEndpoint = localStackEndpoint.includes("localstack:")
      ? localStackEndpoint.replace("localstack:", "localhost:")
      : localStackEndpoint;
    return `${externalEndpoint}/${containerName}/${blobName}`;
  } else {
    return blockBlobClient.url;
  }
}

/**
 * Upload template preview image to blob storage (new location)
 * @param templateId - The template ID
 * @param imageBuffer - Image buffer (PNG)
 * @returns The public URL to access the uploaded preview
 */
export async function uploadTemplatePreviewImage(
  templateId: string,
  imageBuffer: Buffer
): Promise<string> {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(containerName);

  // In real Azure, ensure the container exists (with public access for previews).
  // In LocalStack, the bucket is already created by localstack-init and Azure's
  // "create container" call maps to S3 CreateBucket, which returns 200 but the
  // Azure SDK treats it as a RestError because the payload isn't Azure-shaped.
  // To avoid breaking preview generation locally, skip container creation when
  // using LocalStack and assume the bucket exists.
  if (!useLocalStack) {
    await containerClient.createIfNotExists({
      access: "blob",
    });
  } else {
    try {
      // Touch the container so Azure SDK initializes internal state, but ignore
      // any success-shaped errors from LocalStack.
      await containerClient.getProperties();
    } catch (error: any) {
      if (!isLocalStackS3SuccessError(error)) {
        // For other errors, rethrow so we don't silently hide real issues.
        throw error;
      }
    }
  }

  const blobName = `templates/${templateId}/preview.png`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  try {
    await blockBlobClient.upload(imageBuffer, imageBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: "image/png",
        blobCacheControl: "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error: any) {
    if (isLocalStackS3SuccessError(error)) {
      console.warn(
        `Azure SDK reported error for template preview "${templateId}", but LocalStack S3 returned 200; treating as success.`
      );
    } else {
      throw error;
    }
  }

  if (useLocalStack) {
    const externalEndpoint = localStackEndpoint.includes("localstack:")
      ? localStackEndpoint.replace("localstack:", "localhost:")
      : localStackEndpoint;
    return `${externalEndpoint}/${containerName}/${blobName}`;
  } else {
    return blockBlobClient.url;
  }
}

/**
 * Upload example resume preview image to blob storage
 * @param exampleId - The example resume ID
 * @param imageBuffer - Image buffer (PNG)
 * @returns The public URL to access the uploaded preview
 */
export async function uploadExamplePreview(
  exampleId: string,
  imageBuffer: Buffer
): Promise<string> {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(containerName);
  
  // For LocalStack, try to create container if it doesn't exist
  // The bucket should exist from localstack-init, but Azure SDK might not see it
  let containerExists = false;
  try {
    // First, try to get properties to check if container exists
    await containerClient.getProperties();
    containerExists = true;
  } catch (error: any) {
    // Container doesn't exist or we can't access it
    // Try to create it
    try {
      await containerClient.create({
        access: "blob",
      });
      containerExists = true;
    } catch (createError: any) {
      const createErrorMsg = createError.message || String(createError);
      // If it's an "already exists" error, that's fine
      if (createErrorMsg.includes("ContainerAlreadyExists") || 
          createErrorMsg.includes("409") ||
          createErrorMsg.includes("bucket exists") ||
          createErrorMsg.includes("BucketAlreadyOwnedByYou")) {
        containerExists = true;
      } else if (createErrorMsg.includes("bucket does not exist") || createErrorMsg.includes("NoSuchBucket")) {
        // For LocalStack, the bucket should exist from init script
        // This might be an Azure SDK limitation with LocalStack S3 emulation
        throw new Error(
          `Container/bucket "${containerName}" does not exist. ` +
          `This might be an Azure SDK compatibility issue with LocalStack. ` +
          `Try restarting localstack-init or check LocalStack logs.`
        );
      } else {
        throw createError;
      }
    }
  }

  const blobName = `example-previews/${exampleId}.png`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  try {
    await blockBlobClient.upload(imageBuffer, imageBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: "image/png",
        blobCacheControl: "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error: any) {
    if (isLocalStackS3SuccessError(error)) {
      console.warn(
        `Azure SDK reported error for example preview "${exampleId}", but LocalStack S3 returned 200; treating as success.`
      );
    } else {
      throw error;
    }
  }

  if (useLocalStack) {
    const externalEndpoint = localStackEndpoint.includes("localstack:")
      ? localStackEndpoint.replace("localstack:", "localhost:")
      : localStackEndpoint;
    return `${externalEndpoint}/${containerName}/${blobName}`;
  } else {
    return blockBlobClient.url;
  }
}

/**
 * Get blob URL for a template asset
 * @param blobName - The blob name/path
 * @returns The public URL
 */
export function getTemplateAssetUrl(blobName: string): string {
  if (useLocalStack) {
    const externalEndpoint = localStackEndpoint.includes("localstack:")
      ? localStackEndpoint.replace("localstack:", "localhost:")
      : localStackEndpoint;
    return `${externalEndpoint}/${containerName}/${blobName}`;
  } else {
    return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
  }
}

