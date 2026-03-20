import { API_BASE_URL } from "@/lib";
import { encryptFileForAppUser } from "@/utils/encryption";
import { useMutation } from "@tanstack/react-query";

export interface UploadReportsInput {
  client_id: string;
  user_id: string;
  request_report_id: string;
  expiry_date: string;
  files: Array<{ file: File; title: string }>;
  appUserPublicKey: string;
}

const ENCRYPTED_MIME: Record<string, string> = {
  "application/pdf": "application/x-epdf",
  "image/jpeg": "application/x-ejpeg",
  "image/jpg": "application/x-ejpg",
  "image/png": "application/x-epng",
};

function toEncryptedMime(originalMime: string): string {
  return ENCRYPTED_MIME[originalMime] ?? originalMime;
}

type UseUploadReportsOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useUploadReports = (options?: UseUploadReportsOptions) => {
  return useMutation({
    mutationFn: async (input: UploadReportsInput) => {
      const formData = new FormData();

      // Add basic fields
      formData.append("client_id", input.client_id);
      formData.append("user_id", input.user_id);
      formData.append("request_report_id", input.request_report_id);
      formData.append("expiry_date", input.expiry_date);

      // Encrypt each file with the app user's public key before upload
      for (let index = 0; index < input.files.length; index++) {
        const item = input.files[index]!;
        const encryptedMime = toEncryptedMime(item.file.type);
        const plaintext = new Uint8Array(await item.file.arrayBuffer());
        const encrypted = encryptFileForAppUser(
          input.appUserPublicKey,
          plaintext
        );
        const encExt = encryptedMime.replace("application/x-", "");
        const baseName = item.file.name.replace(/\.[^.]+$/, "");
        const encFile = new File([encrypted.slice()], `${baseName}.${encExt}`, {
          type: encryptedMime,
        });
        formData.append(`file${index}`, encFile);
        formData.append(`title${index}`, item.title);
      }

      const response = await fetch(`${API_BASE_URL}/api/client-reports`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          (errorData as { error?: string }).error || "Failed to upload reports"
        );
      }

      return response.json();
    },

    onSuccess: () => {
      options?.onSuccess?.();
    },

    onError: (error) => {
      options?.onError?.(
        error instanceof Error
          ? error.message
          : "Failed to upload reports. Please try again."
      );
    },
  });
};
