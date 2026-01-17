import { apiClient } from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CancelAppointmentInput {
  task_id: string;
  slot_window_id: string; // For optimistic update
}

type UseCancelAppointmentOptions = {
  linkId: string;
  clientId: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useCancelAppointment = (options: UseCancelAppointmentOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CancelAppointmentInput) => {
      const res = await apiClient.api.tasks.appointments.cancel.$post({
        json: {
          task_id: input.task_id,
        },
      });

      if (!res.ok) {
        // Handle specific error cases with user-friendly messages
        if (res.status === 404) {
          throw new Error("This appointment could not be found");
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

    onMutate: async (input: CancelAppointmentInput) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["shareable-calendar-link", options.linkId, options.clientId],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "shareable-calendar-link",
        options.linkId,
        options.clientId,
      ]);

      // Optimistically update the cache
      queryClient.setQueryData(
        ["shareable-calendar-link", options.linkId, options.clientId],
        (old: unknown) => {
          if (!old) return old;
          const oldData = old as {
            success: boolean;
            data: {
              clientReservedSlotWindowIds: string[];
              clientReservedAppointments: Record<string, string>;
              slotWindows: Array<{
                slot_window_id: string;
                slots_filled: number;
                [key: string]: unknown;
              }>;
              [key: string]: unknown;
            };
          };

          // Remove the slot window ID from reserved list
          const updatedReservedIds =
            oldData.data.clientReservedSlotWindowIds.filter(
              (id) => id !== input.slot_window_id
            );

          // Remove from appointments map
          const updatedAppointments = {
            ...oldData.data.clientReservedAppointments,
          };
          delete updatedAppointments[input.slot_window_id];

          return {
            ...oldData,
            data: {
              ...oldData.data,
              clientReservedSlotWindowIds: updatedReservedIds,
              clientReservedAppointments: updatedAppointments,
              slotWindows: oldData.data.slotWindows.map((slot) =>
                slot.slot_window_id === input.slot_window_id
                  ? {
                      ...slot,
                      slots_filled: Math.max(0, slot.slots_filled - 1),
                    }
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
          ["shareable-calendar-link", options.linkId, options.clientId],
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

    onSettled: () => {
      // Refetch to ensure data is in sync with server
      void queryClient.invalidateQueries({
        queryKey: ["shareable-calendar-link", options.linkId, options.clientId],
      });
    },
  });
};
