import { API_BASE_URL } from "@/lib";
import { useMutation } from "@tanstack/react-query";

export interface UploadReportsInput {
  client_id: string;
  user_id: string;
  request_report_id: string;
  expiry_date: string;
  files: Array<{ file: File; title: string }>;
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

      // Add files and titles with indexed names (file0, title0, file1, title1, etc.)
      input.files.forEach((item, index) => {
        formData.append(`file${index}`, item.file);
        formData.append(`title${index}`, item.title);
      });

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
