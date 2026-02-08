import type { Route } from "./+types/api.images.$";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";

// GET /api/images/* - Serve images from Azure Blob Storage
export async function loader({ params }: Route.LoaderArgs) {
  let path = params["*"];

  if (!path) {
    return Response.json({ error: "Image path required" }, { status: 400 });
  }

  // Decode URL-encoded path (e.g., blog-images%2Ffilename.png -> blog-images/filename.png)
  try {
    path = decodeURIComponent(path);
  } catch (e) {
    // If decoding fails, use original path
    console.warn("Failed to decode image path:", path);
  }

  try {
    if (!accountName || !accountKey) {
      return Response.json({ error: "Blob storage not configured" }, { status: 500 });
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceUrl = `https://${accountName}.blob.core.windows.net`;
    const blobServiceClient = new BlobServiceClient(blobServiceUrl, sharedKeyCredential);

    // Extract container and blob name from path
    // Path format: blog-images/filename.jpg
    // The blob name in Azure is just the filename (without container prefix)
    const parts = path.split("/");
    let containerName: string;
    let blobName: string;
    
    if (parts[0] === "blog-images" && parts.length > 1) {
      // Path is blog-images/filename.jpg
      // Container is "blog-images", blob name is just "filename.jpg" (relative to container)
      containerName = "blog-images";
      blobName = parts.slice(1).join("/");
    } else {
      // Path is just filename.jpg - assume container is blog-images
      containerName = "blog-images";
      blobName = parts.join("/");
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);

    // Check if blob exists
    const exists = await blobClient.exists();
    if (!exists) {
      console.error(`[api.images] Blob not found: container=${containerName}, blobName=${blobName}, path=${path}`);
      return Response.json({ error: "Image not found", details: `Container: ${containerName}, Blob: ${blobName}` }, { status: 404 });
    }

    // Download blob
    const downloadResponse = await blobClient.download();
    if (!downloadResponse.readableStreamBody) {
      return Response.json({ error: "Failed to download image" }, { status: 500 });
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of downloadResponse.readableStreamBody) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Determine content type from blob properties or file extension
    const contentType =
      downloadResponse.contentType ||
      (blobName.endsWith(".png")
        ? "image/png"
        : blobName.endsWith(".webp")
        ? "image/webp"
        : blobName.endsWith(".gif")
        ? "image/gif"
        : "image/jpeg");

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Error serving image:", error);
    return Response.json(
      { error: "Failed to serve image", details: error.message },
      { status: 500 }
    );
  }
}

