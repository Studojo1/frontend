import type { Route } from "./+types/api.resumes.templates.$id.preview-image";
import { BlobServiceClient } from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "test";
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || "test";
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "resumes";
const useLocalStack = process.env.USE_LOCALSTACK === "true";
const localStackEndpoint = process.env.LOCALSTACK_ENDPOINT || "http://localstack:4566";

let blobServiceClient: BlobServiceClient | null = null;

function getBlobServiceClient(): BlobServiceClient | null {
  if (blobServiceClient) {
    return blobServiceClient;
  }

  try {
    if (useLocalStack) {
      const internalEndpoint = localStackEndpoint.includes("localhost:")
        ? localStackEndpoint.replace("localhost:", "localstack:")
        : localStackEndpoint;
      const connectionString = `DefaultEndpointsProtocol=http;AccountName=${accountName};AccountKey=${accountKey};BlobEndpoint=${internalEndpoint}/${accountName};`;
      blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    } else {
      if (!accountName || !accountKey) {
        return null;
      }
      const { StorageSharedKeyCredential } = require("@azure/storage-blob");
      const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
      const blobServiceUrl = `https://${accountName}.blob.core.windows.net`;
      blobServiceClient = new BlobServiceClient(blobServiceUrl, sharedKeyCredential);
    }
    return blobServiceClient;
  } catch (error) {
    console.error("Failed to initialize blob service client:", error);
    return null;
  }
}

/**
 * GET /api/resumes/templates/:id/preview-image
 * 
 * Serves static PNG preview image from blob storage ONLY.
 * No generation, no conversion, no compute.
 * Returns 404 if preview doesn't exist.
 */
export async function loader({ params }: Route.LoaderArgs) {
  const templateId = String(params.id || "").trim();
  if (!templateId || templateId === "undefined" || templateId === "null") {
    return new Response(
      JSON.stringify({ error: "Template ID is required" }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const client = getBlobServiceClient();
  if (!client) {
    return new Response(
      JSON.stringify({ error: "Blob storage not configured" }),
      { 
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const containerClient = client.getContainerClient(containerName);
    const blobName = `templates/${templateId}/preview.png`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Check if preview exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      return new Response(
        JSON.stringify({ error: "Preview image not found" }),
        { 
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Download and stream the PNG
    const downloadResponse = await blockBlobClient.download(0);
    
    // Get blob properties for content type
    const properties = await blockBlobClient.getProperties();
    const contentType = properties.contentType || "image/png";

    // Convert stream to buffer for response
    const chunks: Buffer[] = [];
    if (downloadResponse.readableStreamBody) {
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(Buffer.from(chunk));
      }
    }
    const imageBuffer = Buffer.concat(chunks);

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year (static asset)
        "Content-Length": imageBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error(`Error serving preview image for template ${templateId}:`, error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to load preview image" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

