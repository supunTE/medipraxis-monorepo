import type {
  CreateClientReportInput,
  GetPendingReportsParam,
} from "@repo/models";
import { getClientReportService } from "../lib";
import type { APIContext } from "../types";

export class ClientReportController {
  static async createReport(
    c: APIContext<{ form: CreateClientReportInput & { files: File[] } }>
  ) {
    try {
      const clientReportService = getClientReportService(c);
      const body = await c.req.parseBody();

      // Extract files and report titles
      const filesWithTitles: Array<{ file: File; title: string }> = [];

      // Parse files and their corresponding titles from the multipart form data
      for (const [key, value] of Object.entries(body)) {
        if (key === "files" || value instanceof File) {
          const file = value as File;
          // Look for corresponding title field
          const titleKey = key.replace("file", "title");
          const title = body[titleKey] as string;

          if (title) {
            filesWithTitles.push({ file, title });
          }
        }
      }

      const input: CreateClientReportInput = {
        client_id: body["client_id"] as string,
        user_id: body["user_id"] as string,
        request_report_id: body["request_report_id"] as string,
        expiry_date: body["expiry_date"] as string | undefined,
        reports: filesWithTitles.map((item) => ({ report_title: item.title })),
      };

      const files = filesWithTitles.map((item) => item.file);
      const reports = await clientReportService.createReport(input, files);

      return c.json({ reports, count: reports.length }, 201);
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
    c: APIContext<{ param: { user_id: string; id: string } }, ":user_id/:id/file">
  ) {
    try {
      const clientReportService = getClientReportService(c);
      const reportId = c.req.param("id");
      const userId = c.req.param("user_id");

      const fileUrl = await clientReportService.getReportFileUrl(
        reportId,
        userId
      );

      return c.json({ fileUrl });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get file URL";
      if (error instanceof Error) {
        if (error.message === "Report not found") {
          return c.json({ error: message }, 404);
        } else if (error.message === "Unauthorized") {
          return c.json({ error: message }, 403);
        }
      }
      return c.json({ error: message }, 500);
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

  static async getPendingReports(
    c: APIContext<{ param: GetPendingReportsParam }, "/pending/:contact_id">
  ) {
    try {
      const clientReportService = getClientReportService(c);
      const contactId = c.req.param("contact_id");

      const pendingReports =
        await clientReportService.getPendingReportsByContactId(contactId);

      return c.json({
        pending_reports: pendingReports,
        count: pendingReports.length,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch pending reports";
      return c.json({ error: message }, 500);
    }
  }

  static async getReportsByClientId(
    c: APIContext<{ param: { clientId: string } }, "/clientId/:clientId">
  ) {
    try {
      const clientReportService = getClientReportService(c);
      const clientId = c.req.param("clientId");

      const report = await clientReportService.getReportsByClientId(clientId);

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

  static async getAllReportsByUserId(
    c: APIContext<{ query: { user_id: string; completed?: string } }>
  ) {
    try {
      const clientReportService = getClientReportService(c);
      const userId = c.req.query("user_id");
      const completedParam = c.req.query("completed");

      if (!userId) {
        return c.json({ error: "user_id is required" }, 400);
      }

      let completed: boolean | undefined;
      if (completedParam !== undefined) {
        completed = completedParam === "true";
      }

      const groupedReports =
        await clientReportService.getGroupedReportsByUserId(userId, completed);

      return c.json({
        grouped_reports: groupedReports,
        count: groupedReports.length,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to get grouped reports";
      return c.json({ error: message }, 500);
    }
  }
}
