// AES-256-GCM encryption for li_at cookie storage
// Key must be 32 bytes hex string in LI_AT_ENCRYPTION_KEY env var

const ALG = "AES-GCM";
const KEY_LEN = 256;
const IV_LEN = 12; // 96 bits recommended for GCM

function getKeyMaterial(): Uint8Array {
  const hex = process.env.LI_AT_ENCRYPTION_KEY;
  if (!hex || hex.length < 64) {
    throw new Error("LI_AT_ENCRYPTION_KEY must be a 32-byte hex string (64 hex chars)");
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", getKeyMaterial(), { name: ALG, length: KEY_LEN }, false, ["encrypt", "decrypt"]);
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: ALG, iv }, key, encoded);
  // Store as iv:ciphertext in base64
  const ivB64 = Buffer.from(iv).toString("base64");
  const ctB64 = Buffer.from(ciphertext).toString("base64");
  return `${ivB64}:${ctB64}`;
}

export async function decrypt(encrypted: string): Promise<string> {
  const key = await importKey();
  const [ivB64, ctB64] = encrypted.split(":");
  if (!ivB64 || !ctB64) throw new Error("Invalid encrypted format");
  const iv = Buffer.from(ivB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  const plaintext = await crypto.subtle.decrypt({ name: ALG, iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}
