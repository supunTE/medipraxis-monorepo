import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";

type SaveUserKeysPayload = {
  public_key: string;
  wrapped_private_key: string;
  pbkdf2_salt: string;
};

type UseSaveUserKeysOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useSaveUserKeys = (options?: UseSaveUserKeysOptions) => {
  return useMutation({
    mutationFn: async (payload: SaveUserKeysPayload) => {
      const res = await apiClient.api["user-keys"].$post({
        json: payload,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          (error as { error?: string }).error ?? "Failed to save user keys"
        );
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
          : "Something went wrong. Please try again."
      );
    },
  });
};
