/**
 * Template Loader - Environment-aware template loading from blob storage
 * 
 * Loads templates from blob storage (localstack/Azure) with fallback to database.
 * Auto-detects environment and handles caching.
 */

import { BlobServiceClient } from "@azure/storage-blob";
import db from "~/lib/db";
import { resumeTemplates } from "../../auth-schema";
import { eq } from "drizzle-orm";
import type { Template } from "./template-store";

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
        console.warn("Azure storage credentials not configured, falling back to database");
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
 * Get blob URL for a template asset
 */
function getBlobUrl(blobName: string): string {
  if (useLocalStack) {
    const externalEndpoint = localStackEndpoint.includes("localstack:")
      ? localStackEndpoint.replace("localstack:", "localhost:")
      : localStackEndpoint;
    return `${externalEndpoint}/${containerName}/${blobName}`;
  } else {
    return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
  }
}

/**
 * Load template metadata from blob storage
 */
async function loadTemplateMetadataFromBlob(templateId: string): Promise<Template | null> {
  const client = getBlobServiceClient();
  if (!client) {
    return null;
  }

  try {
    const containerClient = client.getContainerClient(containerName);
    const blobName = `templates/${templateId}/metadata.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const exists = await blockBlobClient.exists();
    if (!exists) {
      return null;
    }

    const downloadResponse = await blockBlobClient.download(0);
    const content = await streamToBuffer(downloadResponse.readableStreamBody);
    const metadata = JSON.parse(content.toString());

    // Construct template with blob storage URLs
    const latexBlobName = `templates/${templateId}/resume.tex`;
    const previewBlobName = `templates/${templateId}/preview.png`;

    // Check if preview.png exists in blob storage
    const previewBlobClient = containerClient.getBlockBlobClient(previewBlobName);
    const previewExists = await previewBlobClient.exists();

    // Use API endpoint for preview URL (serves static image)
    const previewUrl = previewExists 
      ? `/api/resumes/templates/${templateId}/preview-image`
      : undefined;

    return {
      id: metadata.id || templateId,
      version: metadata.version || "1.0",
      name: metadata.name || "",
      description: metadata.description || "",
      category: metadata.category || "",
      previewUrl: metadata.previewUrl || previewUrl,
      assets: {
        latexFile: getBlobUrl(latexBlobName),
        previewImage: previewExists ? getBlobUrl(previewBlobName) : undefined,
      },
    };
  } catch (error) {
    console.error(`Failed to load template ${templateId} from blob storage:`, error);
    return null;
  }
}

/**
 * Load all templates from blob storage
 */
async function loadAllTemplatesFromBlob(): Promise<Template[]> {
  const client = getBlobServiceClient();
  if (!client) {
    return [];
  }

  try {
    const containerClient = client.getContainerClient(containerName);
    const templates: Template[] = [];

    // List all template directories
    for await (const blob of containerClient.listBlobsFlat({ prefix: "templates/" })) {
      if (blob.name.endsWith("/metadata.json")) {
        const templateId = blob.name.split("/")[1];
        const metadata = await loadTemplateMetadataFromBlob(templateId);
        if (metadata) {
          templates.push(metadata);
        }
      }
    }

    return templates;
  } catch (error: any) {
    // Suppress noisy errors when using LocalStack (Azure SDK doesn't work well with S3)
    // We fall back to database anyway, so this is expected in local dev
    if (useLocalStack && error?.code === "NoSuchBucket") {
      // Silently fall back to database - this is expected in local dev
      return [];
    }
    console.error("Failed to load templates from blob storage:", error);
    return [];
  }
}

/**
 * Load templates from database (fallback)
 */
async function loadTemplatesFromDatabase(): Promise<Template[]> {
  try {
    const dbTemplates = await db
      .select({
        id: resumeTemplates.id,
        version: resumeTemplates.version,
        name: resumeTemplates.name,
        description: resumeTemplates.description,
        category: resumeTemplates.category,
        latex_file: resumeTemplates.latexFile,
      })
      .from(resumeTemplates)
      .where(eq(resumeTemplates.isActive, true))
      .orderBy(resumeTemplates.name);

    return dbTemplates.map((t) => ({
      id: t.id,
      version: t.version,
      name: t.name,
      description: t.description,
      category: t.category,
      assets: {
        latexFile: t.latex_file, // Database stores path, not blob URL
      },
    }));
  } catch (error) {
    console.error("Failed to load templates from database:", error);
    return [];
  }
}

/**
 * Load a single template (blob storage first, then database fallback)
 */
export async function loadTemplate(templateId: string): Promise<Template | null> {
  // Try blob storage first
  const blobTemplate = await loadTemplateMetadataFromBlob(templateId);
  if (blobTemplate) {
    return blobTemplate;
  }

  // Fallback to database
  const dbTemplates = await loadTemplatesFromDatabase();
  return dbTemplates.find((t) => t.id === templateId) || null;
}

/**
 * Load all templates (blob storage first, then database fallback)
 */
export async function loadAllTemplates(): Promise<Template[]> {
  // Try blob storage first
  const blobTemplates = await loadAllTemplatesFromBlob();
  if (blobTemplates.length > 0) {
    return blobTemplates;
  }

  // Fallback to database
  return await loadTemplatesFromDatabase();
}

/**
 * Load template LaTeX file content from blob storage
 */
export async function loadTemplateLaTeX(templateId: string): Promise<string | null> {
  const client = getBlobServiceClient();
  if (!client) {
    return null;
  }

  try {
    const containerClient = client.getContainerClient(containerName);
    const blobName = `templates/${templateId}/resume.tex`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const exists = await blockBlobClient.exists();
    if (!exists) {
      return null;
    }

    const downloadResponse = await blockBlobClient.download(0);
    const content = await streamToBuffer(downloadResponse.readableStreamBody);
    return content.toString();
  } catch (error) {
    console.error(`Failed to load LaTeX file for template ${templateId}:`, error);
    return null;
  }
}

/**
 * Helper to convert stream to buffer
 */
async function streamToBuffer(readableStream: NodeJS.ReadableStream | undefined): Promise<Buffer> {
  if (!readableStream) {
    throw new Error("Readable stream is undefined");
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

