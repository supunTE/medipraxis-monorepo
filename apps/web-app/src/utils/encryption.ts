import { gcm } from "@noble/ciphers/aes.js";
import { p256 } from "@noble/curves/nist.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { randomBytes } from "@noble/hashes/utils.js";

/**
 * Encrypts raw file bytes using ECIES (P-256 + ECDH + HKDF-SHA256 + AES-256-GCM).
 *
 * Output binary layout:
 *   [ephemeral_public_key (65 bytes)] [iv (12 bytes)] [ciphertext + GCM tag]
 *
 * @param appUserPublicKeyBase64 - base64-encoded 65-byte uncompressed P-256 public key
 * @param plaintext - raw file bytes
 * @returns Uint8Array of the full ECIES blob
 */
export function encryptFileForAppUser(
  appUserPublicKeyBase64: string,
  plaintext: Uint8Array
): Uint8Array {
  // 1. Decode app user's public key
  const appUserPublicKeyBytes = base64ToBytes(appUserPublicKeyBase64);

  // 2. Generate ephemeral P-256 private key
  const ephemeralPrivateKey = randomBytes(32);

  // 3. Compute ephemeral public key (uncompressed, 65 bytes)
  const ephemeralPublicKey = p256.getPublicKey(ephemeralPrivateKey, false);

  // 4. ECDH: shared point x-coordinate as shared secret
  const sharedPoint = p256.getSharedSecret(
    ephemeralPrivateKey,
    appUserPublicKeyBytes
  );
  const sharedSecret = sharedPoint.slice(1, 33); // x-coordinate only

  // 5. Derive 32-byte AES key via HKDF-SHA256
  const aesKey = hkdf(sha256, sharedSecret, undefined, undefined, 32);

  // 6. Generate 12-byte IV
  const iv = randomBytes(12);

  // 7. AES-256-GCM encrypt
  const cipher = gcm(aesKey, iv);
  const ciphertext = cipher.encrypt(plaintext);

  // 8. Assemble: [ephPubKey(65) | iv(12) | ciphertext+tag]
  const output = new Uint8Array(
    ephemeralPublicKey.length + iv.length + ciphertext.length
  );
  output.set(ephemeralPublicKey, 0);
  output.set(iv, 65);
  output.set(ciphertext, 77);
  return output;
}

function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)!;
  }
  return bytes;
}
