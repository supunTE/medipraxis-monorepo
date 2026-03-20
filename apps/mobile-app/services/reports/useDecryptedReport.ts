import { useFetchUserKeys } from "@/services/user-keys";
import { decryptFile, unwrapPrivateKey } from "@/utils/decryption";
import { encryptionKeyStorage } from "@/utils/storage";
import { ReportFileType } from "@repo/models";
import { useCallback, useEffect, useState } from "react";

type DecryptedReportResult = {
  decryptedBase64: string | null;
  originalType: "pdf" | "image" | null;
  isDecrypting: boolean;
  decryptionError: string | null;
};

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function isEncryptedType(fileType: string | null): boolean {
  return (
    fileType === ReportFileType.EncryptedPdf ||
    fileType === ReportFileType.EncryptedImage
  );
}

export function useDecryptedReport(
  fileUrl: string,
  fileType: string | null
): DecryptedReportResult {
  const [decryptedBase64, setDecryptedBase64] = useState<string | null>(null);
  const [originalType, setOriginalType] = useState<"pdf" | "image" | null>(
    null
  );
  const [_isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);

  const encrypted = isEncryptedType(fileType);

  const { data: userKeys, error: keysError } = useFetchUserKeys(encrypted);

  const decrypt = useCallback(async () => {
    if (!encrypted || !fileUrl || !userKeys) return;

    setIsDecrypting(true);
    setDecryptionError(null);
    setDecryptedBase64(null);

    try {
      const recoveryKey = await encryptionKeyStorage.get();
      if (!recoveryKey) {
        setDecryptionError("Recovery key not found");
        setIsDecrypting(false);
        return;
      }

      const response = await fetch(fileUrl);
      if (!response.ok) {
        setDecryptionError("Failed to download encrypted file");
        setIsDecrypting(false);
        return;
      }

      const encryptedBlob = new Uint8Array(await response.arrayBuffer());

      const privateKey = unwrapPrivateKey(
        userKeys.wrapped_private_key,
        userKeys.pbkdf2_salt,
        recoveryKey
      );

      const plaintext = decryptFile(encryptedBlob, privateKey);
      privateKey.fill(0);

      const base64 = bytesToBase64(plaintext);
      const isPdf = fileType === ReportFileType.EncryptedPdf;
      setOriginalType(isPdf ? "pdf" : "image");
      setDecryptedBase64(base64);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Decryption failed";
      if (message.includes("tag")) {
        setDecryptionError("Unable to decrypt. Key may have been revoked.");
      } else {
        setDecryptionError(message);
      }
    } finally {
      setIsDecrypting(false);
    }
  }, [encrypted, fileUrl, userKeys, fileType]);

  useEffect(() => {
    if (encrypted && userKeys && fileUrl) {
      decrypt();
    }
  }, [decrypt, encrypted, userKeys, fileUrl]);

  useEffect(() => {
    if (keysError && encrypted) {
      setDecryptionError("Encryption keys not found");
    }
  }, [keysError, encrypted]);

  return {
    decryptedBase64,
    originalType,
    isDecrypting: encrypted && !decryptedBase64 && !decryptionError,
    decryptionError,
  };
}
