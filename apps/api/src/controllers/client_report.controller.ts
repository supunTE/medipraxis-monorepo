import type { CreateClientReportInput } from "@repo/models";
import { getClientReportService } from "../lib";
import type { APIContext } from "../types";

export class ClientReportController {
  static async createReport(
    c: APIContext<{ form: CreateClientReportInput & { file: File } }>
  ) {
    try {
      const clientReportService = getClientReportService(c);
      const body = await c.req.parseBody();

      const file = body["file"] as File;
      const input: CreateClientReportInput = {
        report_title: body["report_title"] as string,
        client_id: body["client_id"] as string,
        user_id: body["user_id"] as string,
      };

      const report = await clientReportService.createReport(input, file);

      return c.json({ report }, 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create report";
      return c.json({ error: message }, 500);
    }
  }

  static async getAllReports(c: APIContext<{ query: any }>) {
    try {
      const clientReportService = getClientReportService(c);
      const userId = c.req.query("user_id");
      const clientId = c.req.query("client_id");

      const reports = await clientReportService.getAllReports(userId, clientId);

      return c.json({ reports, count: reports.length });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get reports";
      return c.json({ error: message }, 500);
    }
  }

  static async getReportById(c: APIContext<{ param: { id: string } }, "/:id">) {
    try {
      const clientReportService = getClientReportService(c);
      const reportId = c.req.param("id");

      const report = await clientReportService.getReportById(reportId);

      return c.json({ report });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get report";
      const status =
        error instanceof Error && error.message === "Report not found"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }

  static async getReportFileUrl(
    c: APIContext<{ param: { id: string } }, "/:id/file">
  ) {
    try {
      const clientReportService = getClientReportService(c);
      const reportId = c.req.param("id");

      const fileUrl = await clientReportService.getReportFileUrl(reportId);

      return c.json({ fileUrl });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get file URL";
      const status =
        error instanceof Error && error.message === "Report not found"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }

  static async deleteReport(c: APIContext<{ param: { id: string } }, "/:id">) {
    try {
      const clientReportService = getClientReportService(c);
      const reportId = c.req.param("id");

      await clientReportService.deleteReport(reportId);

      return c.json({ message: "Report deleted successfully" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete report";
      const status =
        error instanceof Error &&
        error.message === "Report not found or could not be deleted"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }
}
