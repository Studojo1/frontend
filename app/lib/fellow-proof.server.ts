import { BlobServiceClient, StorageSharedKeyCredential, type ContainerClient } from "@azure/storage-blob";
import { PROOF_CONTAINER } from "./fellow-view";

// The fellows' LinkedIn analytics screenshots. They sit in their own container, which is private: no blob in
// it has a public address, and the page streams each one only to its fellow (the admin panel reads them with
// the same account key). The container is created private on first use. Each server checks it once, when it
// first uses storage: if it has been opened to the public, every read and write here fails instead.
// FELLOW_PROOF_BLOB_ENDPOINT is for a local storage emulator only; production uses the account's own address.

let ready: Promise<ContainerClient> | null = null;

function container(): Promise<ContainerClient> {
  if (!ready) {
    ready = (async () => {
      const name = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      const key = process.env.AZURE_STORAGE_ACCOUNT_KEY;
      if (!name || !key) throw new Error("blob storage is not configured");
      const endpoint = process.env.FELLOW_PROOF_BLOB_ENDPOINT || `https://${name}.blob.core.windows.net`;
      const box = new BlobServiceClient(endpoint, new StorageSharedKeyCredential(name, key)).getContainerClient(PROOF_CONTAINER);
      await box.createIfNotExists();
      if ((await box.getProperties()).blobPublicAccess) throw new Error(`the ${PROOF_CONTAINER} container allows public access`);
      return box;
    })();
    // A failed start (storage down, or the check above) is tried again on the next request.
    ready.catch(() => { ready = null; });
  }
  return ready;
}

/** Where screenshots are kept. Tests swap these three functions for an in-memory store. */
export const proofStore = {
  async put(blob: string, jpeg: Uint8Array): Promise<void> {
    const box = await container();
    // Names are unique, so an existing blob is never overwritten.
    await box.getBlockBlobClient(blob).uploadData(jpeg, {
      blobHTTPHeaders: { blobContentType: "image/jpeg" },
      conditions: { ifNoneMatch: "*" },
    });
  },
  async get(blob: string): Promise<Uint8Array | null> {
    const box = await container();
    try {
      return await box.getBlockBlobClient(blob).downloadToBuffer();
    } catch (e) {
      if ((e as { statusCode?: number }).statusCode === 404) return null;
      throw e;
    }
  },
  async remove(blob: string): Promise<void> {
    const box = await container();
    await box.getBlockBlobClient(blob).deleteIfExists();
  },
};
