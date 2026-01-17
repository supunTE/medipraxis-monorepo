import { apiClient } from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface ReserveAppointmentInput {
  slot_window_id: string;
  client_id: string;
}

type UseReserveAppointmentOptions = {
  linkId: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useReserveAppointment = (
  options: UseReserveAppointmentOptions
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReserveAppointmentInput) => {
      const res = await apiClient.api.tasks.appointments.reserve.$post({
        json: {
          slot_window_id: input.slot_window_id,
          client_id: input.client_id,
        },
      });

      if (!res.ok) {
        // Handle specific error cases with user-friendly messages
        if (res.status === 404) {
          throw new Error("This time slot is no longer available");
        } else if (res.status === 409) {
          // Conflict - client already has appointment
          throw new Error(
            "You already have an appointment booked for this time slot"
          );
        } else if (res.status === 429) {
          // Too Many Requests - cooldown period
          const errorData = await res.json();
          throw new Error(
            errorData.error ||
              "Please wait before reserving another appointment"
          );
        } else if (res.status >= 500) {
          throw new Error(
            "Our system is having trouble right now. Please try again in a moment"
          );
        }

        // Generic error for other cases
        throw new Error("Something went wrong. Please try again");
      }

      return res.json();
    },

    onMutate: async (input: ReserveAppointmentInput) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["shareable-calendar-link", options.linkId, input.client_id],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "shareable-calendar-link",
        options.linkId,
        input.client_id,
      ]);

      // Optimistically update the cache
      queryClient.setQueryData(
        ["shareable-calendar-link", options.linkId, input.client_id],
        (old: unknown) => {
          if (!old) return old;
          const oldData = old as {
            success: boolean;
            data: {
              clientReservedSlotWindowIds: string[];
              slotWindows: Array<{
                slot_window_id: string;
                slots_filled: number;
                [key: string]: unknown;
              }>;
              [key: string]: unknown;
            };
          };

          return {
            ...oldData,
            data: {
              ...oldData.data,
              clientReservedSlotWindowIds: [
                ...oldData.data.clientReservedSlotWindowIds,
                input.slot_window_id,
              ],
              slotWindows: oldData.data.slotWindows.map((slot) =>
                slot.slot_window_id === input.slot_window_id
                  ? { ...slot, slots_filled: slot.slots_filled + 1 }
                  : slot
              ),
            },
          };
        }
      );

      // Return context with the snapshot
      return { previousData };
    },

    onError: (error, _input, context) => {
      // Rollback to the previous value on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["shareable-calendar-link", options.linkId, _input.client_id],
          context.previousData
        );
      }

      options?.onError?.(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again"
      );
    },

    onSuccess: () => {
      options?.onSuccess?.();
    },

    onSettled: (_data, _error, input) => {
      // Refetch to ensure data is in sync with server
      void queryClient.invalidateQueries({
        queryKey: ["shareable-calendar-link", options.linkId, input.client_id],
      });
    },
  });
};
