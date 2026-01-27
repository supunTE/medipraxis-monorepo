import { apiClient } from "@/lib";
import { useMutation } from "@tanstack/react-query";

export interface VerifyOtpInput {
  country_code: string;
  contact_number: string;
  otp: string;
}

type UseVerifyOtpOptions = {
  onSuccess?: (contactId: string) => void;
  onError?: (message: string) => void;
};

export const useVerifyOtp = (options?: UseVerifyOtpOptions) => {
  return useMutation({
    mutationFn: async (input: VerifyOtpInput) => {
      const response = await apiClient.api.otp.verify.$post({
        json: {
          country_code: input.country_code,
          contact_number: input.contact_number,
          otp: input.otp,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error((data as { error?: string }).error || "Invalid OTP");
      }

      const verifyData = await response.json();
      return verifyData;
    },

    onSuccess: (data) => {
      const contactId = data.contact_id || sessionStorage.getItem("contact_id");
      if (contactId) {
        options?.onSuccess?.(contactId);
      } else {
        throw new Error("Contact ID not found");
      }
    },

    onError: (error) => {
      options?.onError?.(
        error instanceof Error
          ? error.message
          : "Invalid OTP. Please try again."
      );
    },
  });
};
