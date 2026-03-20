import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

type UserKeysResponse = {
  public_key: string;
  wrapped_private_key: string;
  pbkdf2_salt: string;
};

export const useFetchUserKeys = (enabled = true) => {
  return useQuery({
    queryKey: ["user-keys"],
    queryFn: async () => {
      const res = await apiClient.api["user-keys"].$get({});

      if (!res.ok) {
        throw new Error("Failed to fetch user keys");
      }

      const data = await res.json();
      return data as UserKeysResponse;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};
