import { getRequestReportService } from "../lib";
import type { APIContext } from "../types";

export class RequestReportController {
  static async getRequestReportById(c: APIContext<{ param: { id: string } }>) {
    try {
      const requestReportService = getRequestReportService(c);
      const requestReportId = c.req.param("id");

      if (!requestReportId) {
        return c.json({ error: "Request report ID is required" }, 400);
      }

      const requestReport =
        await requestReportService.getRequestReportById(requestReportId);

      if (!requestReport) {
        return c.json({ error: "Request report not found" }, 404);
      }

      return c.json(requestReport);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch request report";
      return c.json({ error: message }, 500);
    }
  }
}
