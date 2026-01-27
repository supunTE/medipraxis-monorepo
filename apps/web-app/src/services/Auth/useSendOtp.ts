import { apiClient } from "@/lib";
import { useMutation } from "@tanstack/react-query";

export interface SendOtpInput {
  country_code: string;
  contact_number: string;
}

type UseSendOtpOptions = {
  onSuccess?: (contactId: string) => void;
  onError?: (message: string) => void;
};

export const useSendOtp = (options?: UseSendOtpOptions) => {
  return useMutation({
    mutationFn: async (input: SendOtpInput) => {
      const response = await apiClient.api.otp.send.$post({
        json: {
          country_code: input.country_code,
          contact_number: input.contact_number,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      const data = await response.json();
      return data;
    },

    onSuccess: (data) => {
      options?.onSuccess?.(data.contact_id);
    },

    onError: (error) => {
      options?.onError?.(
        error instanceof Error
          ? error.message
          : "Failed to send OTP. Please try again."
      );
    },
  });
};
