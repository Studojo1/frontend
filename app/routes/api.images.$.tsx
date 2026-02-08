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
    // The blob name in Azure should be just the filename (without container prefix)
    // However, old images might have been stored with blog-images/ prefix in the blob name itself
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
    
    // Try multiple blob name variations to handle legacy uploads
    const blobNameCandidates: string[] = [];
    
    // Candidate 1: Blob name without prefix (new format)
    blobNameCandidates.push(blobName);
    
    // Candidate 2: Blob name with blog-images/ prefix (legacy format where prefix was included in blob name)
    if (!blobName.startsWith("blog-images/")) {
      blobNameCandidates.push(`blog-images/${blobName}`);
    }
    
    // Candidate 3: If path already had blog-images/, try the full path as blob name (very old format)
    if (path.startsWith("blog-images/")) {
      blobNameCandidates.push(path);
    }

    let foundBlob = false;
    let finalBlobName = "";
    let finalBlobClient = containerClient.getBlockBlobClient(blobName);

    // Try each candidate until we find one that exists
    for (const candidateBlobName of blobNameCandidates) {
      const candidateClient = containerClient.getBlockBlobClient(candidateBlobName);
      const exists = await candidateClient.exists();
      console.log(`[api.images] Checking blob: container=${containerName}, blobName=${candidateBlobName}, exists=${exists}`);
      
      if (exists) {
        foundBlob = true;
        finalBlobName = candidateBlobName;
        finalBlobClient = candidateClient;
        console.log(`[api.images] Found blob: ${candidateBlobName}`);
        break;
      }
    }
    
    if (!foundBlob) {
      console.error(`[api.images] Blob not found: container=${containerName}, path=${path}`);
      console.error(`[api.images] Tried candidates: ${blobNameCandidates.join(", ")}`);
      // List some blobs to help debug
      try {
        const blobs = [];
        const searchPrefix = blobName.substring(0, Math.min(20, blobName.length));
        for await (const blob of containerClient.listBlobsFlat({ prefix: searchPrefix })) {
          blobs.push(blob.name);
          if (blobs.length >= 10) break;
        }
        console.error(`[api.images] Similar blobs found (prefix: ${searchPrefix}): ${blobs.join(", ")}`);
      } catch (e) {
        console.error(`[api.images] Error listing blobs:`, e);
      }
      return Response.json({ error: "Image not found", details: `Container: ${containerName}, Path: ${path}, Tried: ${blobNameCandidates.join(", ")}` }, { status: 404 });
    }

    // Download blob
    const downloadResponse = await finalBlobClient.download();
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
      (finalBlobName.endsWith(".png")
        ? "image/png"
        : finalBlobName.endsWith(".webp")
        ? "image/webp"
        : finalBlobName.endsWith(".gif")
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

