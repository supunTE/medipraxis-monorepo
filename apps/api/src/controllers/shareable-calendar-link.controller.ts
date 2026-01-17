import type {
  GetClientAppointmentsByLinkQuery,
  GetShareableCalendarLinkParam,
} from "@repo/models";
import { getShareableCalendarLinkService } from "../lib";
import type { APIContext } from "../types/api-context";

export class ShareableCalendarLinkController {
  static async getShareableCalendarLinkById(
    c: APIContext<{
      param: GetShareableCalendarLinkParam;
      query: GetClientAppointmentsByLinkQuery;
    }>
  ) {
    try {
      const shareableCalendarLinkService = getShareableCalendarLinkService(c);
      const linkId = c.req.param("id") as string;
      const clientId = c.req.query("client_id") as string;

      const linkWithSlotWindows =
        await shareableCalendarLinkService.getShareableCalendarLinkWithSlotWindows(
          linkId,
          clientId
        );

      return c.json({ success: true, data: linkWithSlotWindows });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch shareable calendar link";
      const status =
        error instanceof Error &&
        (error.message.includes("not found") ||
          error.message.includes("expired") ||
          error.message.includes("deleted"))
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }
}
