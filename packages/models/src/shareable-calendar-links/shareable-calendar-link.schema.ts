import { z } from "zod";
import type { SlotWindowForClient } from "../slot-windows";

/* ---------------- RESPONSE SCHEMAS ---------------- */

export const shareableCalendarLinkSchema = z.object({
  link_id: z.string(),
  user_id: z.string(),
  visible_days_ahead: z.number(),
  days_until_expiry: z.number(),
  expiry_date: z.string(),
  created_date: z.string(),
  is_deleted: z.boolean(),
});

/* ---------------- REQUEST SCHEMAS ---------------- */

export const getShareableCalendarLinkParamSchema = z.object({
  id: z.string(),
});

export const getClientAppointmentsByLinkQuerySchema = z.object({
  client_id: z.string(),
});

/* ---------------- TYPES (DERIVED) ---------------- */

export type ShareableCalendarLink = z.infer<typeof shareableCalendarLinkSchema>;
export type ShareableCalendarLinkWithUser = Omit<
  ShareableCalendarLink,
  "days_until_expiry" | "expiry_date" | "created_date" | "is_deleted"
> & {
  user: {
    first_name: string;
    last_name: string;
  };
};

export type GetShareableCalendarLinkParam = z.infer<
  typeof getShareableCalendarLinkParamSchema
>;

export type GetClientAppointmentsByLinkQuery = z.infer<
  typeof getClientAppointmentsByLinkQuerySchema
>;

export type ShareableCalendarLinkWithSlotWindows =
  ShareableCalendarLinkWithUser & {
    slotWindows: SlotWindowForClient[];
    clientReservedSlotWindowIds: string[];
    clientReservedAppointments: Record<string, string>; // slotWindowId -> taskId
  };
