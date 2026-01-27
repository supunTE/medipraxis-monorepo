import { apiClient } from "@/lib";
import { useMutation } from "@tanstack/react-query";

export interface CheckPhoneInput {
  country_code: string;
  contact_number: string;
}

type UseCheckPhoneOptions = {
  onSuccess?: (exists: boolean) => void;
  onError?: (message: string) => void;
};

export const useCheckPhone = (options?: UseCheckPhoneOptions) => {
  return useMutation({
    mutationFn: async (input: CheckPhoneInput) => {
      const response = await apiClient.api.clients["check-phone"].$get({
        query: {
          country_code: input.country_code,
          contact_number: input.contact_number,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check phone number");
      }

      const data = await response.json();
      return data;
    },

    onSuccess: (data) => {
      options?.onSuccess?.(data.exists);
    },

    onError: (error) => {
      options?.onError?.(
        error instanceof Error
          ? error.message
          : "Failed to check phone number. Please try again."
      );
    },
  });
};
