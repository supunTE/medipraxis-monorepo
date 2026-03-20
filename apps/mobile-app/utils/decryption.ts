import { p256 } from "@noble/curves/nist.js";
import { gcm } from "@noble/ciphers/aes.js";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { hkdf } from "@noble/hashes/hkdf.js";

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Unwraps a P-256 private key that was wrapped with AES-256-GCM
 * using a PBKDF2-derived key from the recovery key.
 *
 * Reverses the wrapping in `generateUserKeys()` from userKeys.ts.
 *
 * @param wrappedPrivateKeyBase64 - base64-encoded [IV(12) + ciphertext + GCM tag(16)]
 * @param pbkdf2SaltHex - hex-encoded 16-byte PBKDF2 salt
 * @param recoveryKey - 16-character recovery key string
 * @returns raw 32-byte P-256 private key
 */
export function unwrapPrivateKey(
  wrappedPrivateKeyBase64: string,
  pbkdf2SaltHex: string,
  recoveryKey: string
): Uint8Array {
  const saltBytes = hexToBytes(pbkdf2SaltHex);

  const wrappingKey = pbkdf2(
    sha256,
    new TextEncoder().encode(recoveryKey),
    saltBytes,
    { c: 10_000, dkLen: 32 }
  );

  const wrappedBytes = base64ToBytes(wrappedPrivateKeyBase64);
  const iv = wrappedBytes.slice(0, 12);
  const ciphertextWithTag = wrappedBytes.slice(12);

  const cipher = gcm(wrappingKey, iv);
  return cipher.decrypt(ciphertextWithTag);
}

/**
 * Decrypts an ECIES-encrypted file using a P-256 private key.
 *
 * Reverses the encryption in `encryptFileForAppUser()` from
 * apps/web-app/src/utils/encryption.ts.
 *
 * Expected binary layout:
 *   [ephemeral_public_key (65 bytes)] [iv (12 bytes)] [ciphertext + GCM tag]
 *
 * @param encryptedBlob - full ECIES blob bytes
 * @param privateKey - raw 32-byte P-256 private key
 * @returns decrypted plaintext bytes
 */
export function decryptFile(
  encryptedBlob: Uint8Array,
  privateKey: Uint8Array
): Uint8Array {
  const ephemeralPublicKey = encryptedBlob.slice(0, 65);
  const iv = encryptedBlob.slice(65, 77);
  const ciphertextWithTag = encryptedBlob.slice(77);

  const sharedPoint = p256.getSharedSecret(privateKey, ephemeralPublicKey);
  const sharedSecret = sharedPoint.slice(1, 33);

  const aesKey = hkdf(sha256, sharedSecret, undefined, undefined, 32);

  const cipher = gcm(aesKey, iv);
  return cipher.decrypt(ciphertextWithTag);
}
