import { apiClient } from "@/lib/api-client";
import { type SlotWindowTemplate } from "@repo/models";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";

type GetSlotWindowTemplatesResponse = {
  templates: SlotWindowTemplate[];
  count: number;
};

type UseGetSlotWindowTemplatesResult = UseQueryResult<
  GetSlotWindowTemplatesResponse,
  Error
> & {
  templates: SlotWindowTemplate[];
};

export const useGetSlotWindowTemplates = (
  userId: string
): UseGetSlotWindowTemplatesResult => {
  const query = useQuery<GetSlotWindowTemplatesResponse, Error>({
    queryKey: ["slot-window-templates", userId],
    queryFn: async () => {
      const res = await apiClient.api["slot-windows"].templates.$get({
        query: { user_id: userId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch slot window templates");
      }

      return (await res.json()) as GetSlotWindowTemplatesResponse;
    },
    enabled: !!userId,
    meta: { persist: true },
  });

  const templates: SlotWindowTemplate[] = query.data?.templates ?? [];

  return { ...query, templates };
};
