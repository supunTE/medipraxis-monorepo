import { useMutation } from "@tanstack/react-query";
import type { ClientRegistrationFormValues } from "@/types/clientRegistration.types";
import { apiClient } from "@/lib/api-client";

type UseRegisterPatientOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useRegisterPatient = (options?: UseRegisterPatientOptions) => {
  return useMutation({
    mutationFn: async (payload: ClientRegistrationFormValues) => {
      const res = await apiClient.api.clients.$post({
        json: payload,
      });

      // tRPC-style clients usually return fetch Response
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error ?? "Registration failed");
      }

      return res.json();
    },

    onSuccess: () => {
      options?.onSuccess?.();
    },

    onError: (error) => {
      options?.onError?.(
        error instanceof Error
          ? error.message
          : "Failed to register patient. Please try again."
      );
    },
  });
};
