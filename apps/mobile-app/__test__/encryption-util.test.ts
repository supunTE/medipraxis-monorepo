import * as ExpoCrypto from "expo-crypto";
import { generateRecoveryKey, generateUserKeys } from "../utils/userKeys";
import { unwrapPrivateKey, decryptFile } from "../utils/decryption";
import { p256 } from "@noble/curves/nist.js";
import { gcm } from "@noble/ciphers/aes.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";

jest.mock("expo-crypto", () => ({
  getRandomBytesAsync: jest.fn(),
}));

const mockGetRandomBytes = ExpoCrypto.getRandomBytesAsync as jest.MockedFunction<
  typeof ExpoCrypto.getRandomBytesAsync
>;

afterEach(() => jest.clearAllMocks());

// ── helpers ────────────────────────────────────────────────────────────────────

// Valid P-256 scalars (all < curve order 0xFFFFFFFF00000000...BCE6...2551)
const EPHEMERAL_PRIV = new Uint8Array(32).fill(0x22);
const ECIES_IV = new Uint8Array(12).fill(0x55);

/** Constructs a deterministic ECIES blob matching the layout expected by decryptFile */
function eciesEncrypt(plaintext: Uint8Array, recipientPub: Uint8Array): Uint8Array {
  const ephemPub = p256.getPublicKey(EPHEMERAL_PRIV, false); // 65 bytes
  const sharedPoint = p256.getSharedSecret(EPHEMERAL_PRIV, recipientPub);
  const aesKey = hkdf(sha256, sharedPoint.slice(1, 33), undefined, undefined, 32);
  const ciphertext = gcm(aesKey, ECIES_IV).encrypt(plaintext);

  const blob = new Uint8Array(65 + 12 + ciphertext.length);
  blob.set(ephemPub, 0);
  blob.set(ECIES_IV, 65);
  blob.set(ciphertext, 77);
  return blob;
}

/** Queue the three getRandomBytesAsync calls made by generateUserKeys (salt → iv → privateKey) */
function mockGenerateUserKeysCalls(
  salt = new Uint8Array(16).fill(0xbb),
  iv = new Uint8Array(12).fill(0xcc),
  privateKey = new Uint8Array(32).fill(0xaa)
) {
  mockGetRandomBytes
    .mockResolvedValueOnce(salt)
    .mockResolvedValueOnce(iv)
    .mockResolvedValueOnce(privateKey);
  return { salt, iv, privateKey };
}

// ── generateRecoveryKey ────────────────────────────────────────────────────────

describe("generateRecoveryKey", () => {
  it("produces 16-char uppercase base-36 raw key and XXXX-XXXX-XXXX-XXXX formatted key", async () => {
    mockGetRandomBytes.mockResolvedValueOnce(
      new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120])
    );

    const { raw, formatted } = await generateRecoveryKey();

    expect(raw).toHaveLength(16);
    expect(/^[0-9A-Z]{16}$/.test(raw)).toBe(true);
    expect(formatted).toMatch(/^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    expect(formatted.replace(/-/g, "")).toBe(raw);
  });
});

// ── generateUserKeys + unwrapPrivateKey ────────────────────────────────────────

describe("generateUserKeys + unwrapPrivateKey", () => {
  const RECOVERY_KEY = "ABCD1234EFGH5678";

  it("round-trip: unwrapPrivateKey recovers the original private key bytes", async () => {
    const { privateKey } = mockGenerateUserKeysCalls();

    const { wrappedPrivateKey, pbkdf2Salt } = await generateUserKeys(RECOVERY_KEY);
    const recovered = unwrapPrivateKey(wrappedPrivateKey, pbkdf2Salt, RECOVERY_KEY);

    expect(recovered).toEqual(privateKey);
  });

  it("generated public key corresponds to the private key", async () => {
    const { privateKey } = mockGenerateUserKeysCalls();

    const { publicKey } = await generateUserKeys(RECOVERY_KEY);
    const decoded = Uint8Array.from(atob(publicKey), (c) => c.charCodeAt(0));

    expect(decoded).toEqual(p256.getPublicKey(privateKey, false));
  });

  it("unwrapPrivateKey throws when a wrong recovery key is used (GCM auth failure)", async () => {
    mockGenerateUserKeysCalls();

    const { wrappedPrivateKey, pbkdf2Salt } = await generateUserKeys(RECOVERY_KEY);

    expect(() =>
      unwrapPrivateKey(wrappedPrivateKey, pbkdf2Salt, "WRONG0000KEY1111")
    ).toThrow();
  });
});

// ── decryptFile ────────────────────────────────────────────────────────────────

describe("decryptFile", () => {
  const PRIV_KEY = new Uint8Array(32).fill(0x11);
  const PUB_KEY = p256.getPublicKey(PRIV_KEY, false);
  const PLAINTEXT = new TextEncoder().encode("MediPraxis e2e test payload");

  it("decrypts ECIES blob back to original plaintext", () => {
    const blob = eciesEncrypt(PLAINTEXT, PUB_KEY);
    expect(decryptFile(blob, PRIV_KEY)).toEqual(PLAINTEXT);
  });

  it("throws on tampered ciphertext (GCM authentication failure)", () => {
    const blob = eciesEncrypt(PLAINTEXT, PUB_KEY);
    blob[77] ^= 0xff; // flip a bit in the ciphertext region
    expect(() => decryptFile(blob, PRIV_KEY)).toThrow();
  });
});
