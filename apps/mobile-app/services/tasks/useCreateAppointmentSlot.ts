import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";

import { DayOfWeek } from "@repo/models";

export type CreateAppointmentSlotPayload =
  | {
      is_recurring: true;
      user_id: string;
      location?: string;
      total_slots: number;
      start_time: string;
      end_time: string;
      repeat_until: string;
      day_of_week: DayOfWeek[];
      note?: string;
    }
  | {
      is_recurring: false;
      user_id: string;
      location?: string;
      total_slots: number;
      date: string;
      start_time: string;
      end_time: string;
      note?: string;
    };

type UseCreateAppointmentSlotOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useCreateAppointmentSlot = (
  options?: UseCreateAppointmentSlotOptions
) => {
  return useMutation({
    mutationFn: async (payload: CreateAppointmentSlotPayload) => {
      if (payload.is_recurring) {
        const res = await apiClient.api["slot-windows"].templates.$post({
          json: {
            user_id: payload.user_id,
            start_time: payload.start_time,
            end_time: payload.end_time,
            end_date: payload.repeat_until,
            day_of_week: payload.day_of_week,
            note: payload.note,
            location: payload.location,
            total_slots: payload.total_slots,
          },
        });
        if (!res.ok) {
          const errorData = (await res.json().catch(() => ({}))) as any;
          throw new Error(
            errorData?.error ??
              errorData?.message ??
              "Failed to create appointment template"
          );
        }
        return res.json();
      } else {
        const res = await apiClient.api["slot-windows"].$post({
          json: {
            user_id: payload.user_id,
            start_date: payload.start_time,
            end_date: payload.end_time,
            total_slots: payload.total_slots,
            note: payload.note,
            location: payload.location,
          },
        });
        if (!res.ok) {
          const errorData = (await res.json().catch(() => ({}))) as any;
          throw new Error(
            errorData?.error ??
              errorData?.message ??
              "Failed to create appointment slot"
          );
        }
        return res.json();
      }
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
