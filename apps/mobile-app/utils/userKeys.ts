import * as ExpoCrypto from "expo-crypto";
import { p256 } from "@noble/curves/nist.js";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { gcm } from "@noble/ciphers/aes.js";

// ---------------------------------------------------------------------------
// Recovery key
// ---------------------------------------------------------------------------

/**
 * Generates a cryptographically random 16-character recovery key
 * using base-36 characters (0-9, A-Z).
 *
 * Returns the raw 16-char string (without dashes) for storage,
 * and a formatted display string as XXXX-XXXX-XXXX-XXXX.
 */
export const generateRecoveryKey = async (): Promise<{
  raw: string;
  formatted: string;
}> => {
  const bytes = await ExpoCrypto.getRandomBytesAsync(12);
  const raw = Array.from(bytes)
    .map((b) => b.toString(36).toUpperCase())
    .join("")
    .slice(0, 16);

  const formatted = [
    raw.slice(0, 4),
    raw.slice(4, 8),
    raw.slice(8, 12),
    raw.slice(12, 16),
  ].join("-");

  return { raw, formatted };
};

// ---------------------------------------------------------------------------
// User key pair generation (E2E encryption setup)
// ---------------------------------------------------------------------------

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

/**
 * Generates a P-256 key pair and wraps the private key with an
 * AES-256-GCM key derived from the user's recovery key via PBKDF2-SHA256.
 *
 * Pure-JS via @noble — works on Hermes/Expo Go without native modules.
 *
 * Returns values ready for storage in `app_user_keys`:
 *   - publicKey         — uncompressed P-256 public key, base64 (65 bytes)
 *   - wrappedPrivateKey — AES-GCM-wrapped private key, base64 (12-byte IV prepended)
 *   - pbkdf2Salt        — random 16-byte salt used for PBKDF2, hex
 */
export const generateUserKeys = async (
  recoveryKey: string
): Promise<{
  publicKey: string;
  wrappedPrivateKey: string;
  pbkdf2Salt: string;
}> => {
  // 1. Random bytes from native CSPRNG (works in Expo Go)
  const saltBytes = await ExpoCrypto.getRandomBytesAsync(16);
  const iv = await ExpoCrypto.getRandomBytesAsync(12);
  const privateKeyBytes = await ExpoCrypto.getRandomBytesAsync(32);

  const pbkdf2Salt = bytesToHex(saltBytes);

  // 2. Derive 32-byte AES wrapping key via PBKDF2-SHA256
  // 10k iterations — sufficient for Hermes/Expo Go; bump to 100k on native build
  const wrappingKey = pbkdf2(
    sha256,
    new TextEncoder().encode(recoveryKey),
    saltBytes,
    { c: 10_000, dkLen: 32 }
  );

  // 3. Derive P-256 public key from the random private key bytes
  const publicKeyBytes = p256.getPublicKey(privateKeyBytes, false); // uncompressed

  // 4. Wrap private key with AES-256-GCM
  const cipher = gcm(wrappingKey, iv);
  const wrappedBytes = cipher.encrypt(privateKeyBytes);

  // [12-byte IV][encrypted private key + 16-byte GCM tag] → base64
  const combined = new Uint8Array(iv.length + wrappedBytes.length);
  combined.set(iv, 0);
  combined.set(wrappedBytes, iv.length);

  return {
    publicKey: bytesToBase64(publicKeyBytes),
    wrappedPrivateKey: bytesToBase64(combined),
    pbkdf2Salt,
  };
};
