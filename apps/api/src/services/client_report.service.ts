import type {
  ClientReport,
  CreateClientReportInput,
  PendingReport,
} from "@repo/models";
import { ClientReportRepository, UserRepository } from "../repositories";
import type { ClientRepository } from "../repositories/client.repository";
import type { RequestReportRepository } from "../repositories/request_report.repository";

export class ClientReportService {
  private clientReportRepository: ClientReportRepository;
  private clientRepository: ClientRepository;
  private requestReportRepository: RequestReportRepository;
  private userRepository: UserRepository;

  constructor(
    clientReportRepository: ClientReportRepository,
    clientRepository: ClientRepository,
    requestReportRepository: RequestReportRepository,
    userRepository: UserRepository
  ) {
    this.clientReportRepository = clientReportRepository;
    this.clientRepository = clientRepository;
    this.requestReportRepository = requestReportRepository;
    this.userRepository = userRepository;
  }

  async createReport(
    input: CreateClientReportInput,
    files: File[]
  ): Promise<ClientReport[]> {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    // Validate all files
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          `Invalid file type for ${file.name}. Only PDF and image files (JPEG, PNG, JPG) are allowed`
        );
      }
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} exceeds 10MB limit`);
      }
    }

    // Check if number of files matches number of report titles
    if (files.length !== input.reports.length) {
      throw new Error("Number of files must match number of report titles");
    }

    // Upload files and create reports
    const reports: ClientReport[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) {
        throw new Error(`File missing at index ${i}`);
      }

      const reportData = input.reports[i];
      if (!reportData) {
        throw new Error(`Report data missing for file at index ${i}`);
      }
      const reportTitle = reportData.report_title;

      // Upload file to storage
      const filePath = await this.clientReportRepository.uploadFile(
        file,
        input.user_id,
        input.client_id
      );

      // Create database record with individual report title
      const reportInput = {
        report_title: reportTitle,
        client_id: input.client_id,
        user_id: input.user_id,
        request_report_id: input.request_report_id,
        expiry_date: input.expiry_date,
      };

      const createdReport = await this.clientReportRepository.create(
        reportInput,
        filePath
      );
      reports.push(createdReport);
    }

    return reports;
  }

  async getAllReports(
    userId?: string,
    clientId?: string
  ): Promise<ClientReport[]> {
    return await this.clientReportRepository.findAll(userId, clientId);
  }

  async getReportById(reportId: string): Promise<ClientReport> {
    const report = await this.clientReportRepository.findById(reportId);

    if (!report) {
      throw new Error("Report not found");
    }

    return report;
  }

  async getReportsByClientId(
    clientId: string
  ): Promise<(ClientReport & { status: string | null })[]> {
    const reports = await this.clientReportRepository.findByClientId(clientId);

    const reportsWithStatus = reports.map((report) => {
      let status: string | null = null;

      if (report.file_path) {
        if (report.expiry_date) {
          const expiryDate = new Date(report.expiry_date);
          const now = new Date();
          status = expiryDate < now ? "expired" : "uploaded";
        } else {
          status = "uploaded";
        }
      } else if (report.request_report_id) {
        status = "pending";
      }

      return {
        ...report,
        status,
      };
    });

    return reportsWithStatus;
  }

  async getReportFileUrl(reportId: string, userId: string): Promise<string> {
    const report = await this.clientReportRepository.findById(reportId);

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.user_id !== userId) {
      throw new Error("Unauthorized");
    }

    if (!report.file_path) {
      throw new Error("Report has no associated file");
    }

    return await this.clientReportRepository.getFileUrl(report.file_path, 300);
  }

  async deleteReport(reportId: string): Promise<boolean> {
    const deleted = await this.clientReportRepository.delete(reportId);

    if (!deleted) {
      throw new Error("Report not found or could not be deleted");
    }

    return deleted;
  }

  async getPendingReportsByContactId(
    contactId: string
  ): Promise<PendingReport[]> {
    // Get all clients with contact_id
    const clients = await this.clientRepository.findByContactId(contactId);

    if (!clients || clients.length === 0) {
      return [];
    }

    const clientIds = clients.map((client) => client.client_id);

    // Get all request_reports for these clients (not expired, not deleted)
    const requestReports =
      await this.requestReportRepository.findPendingByClientIds(clientIds);

    if (requestReports.length === 0) {
      return [];
    }

    const requestReportIds = requestReports.map((rr) => rr.request_report_id);

    // Check which request_reports already have uploaded reports
    const uploadedRequestReportIds =
      await this.clientReportRepository.findByRequestReportIds(
        requestReportIds
      );

    // Get unique user_ids and fetch user data
    const userIds = [
      ...new Set(
        requestReports
          .map((rr) => rr.user_id)
          .filter((id): id is string => id !== null)
      ),
    ];

    const usersMap = new Map<
      string,
      { first_name: string; last_name: string }
    >();
    for (const userId of userIds) {
      try {
        const user = await this.userRepository.findUserById(userId);
        if (user) {
          usersMap.set(userId, {
            first_name: user.first_name,
            last_name: user.last_name,
          });
        }
      } catch (error) {
        // Continue if user fetch fails
        console.error(`Failed to fetch user ${userId}:`, error);
      }
    }

    // Filter to only pending (not uploaded) reports
    const pendingReports: PendingReport[] = requestReports
      .filter((rr) => !uploadedRequestReportIds.has(rr.request_report_id))
      .map((rr) => {
        const client = clients.find((c) => c.client_id === rr.client_id);
        const user = rr.user_id ? usersMap.get(rr.user_id) : null;
        const userName = user
          ? `${user.first_name} ${user.last_name}`.trim()
          : null;
        return {
          request_report_id: rr.request_report_id,
          created_date: rr.created_date,
          client_id: rr.client_id!,
          client_name: client
            ? `${client.first_name} ${client.last_name}`
            : "Unknown",
          user_id: rr.user_id,
          user_name: userName,
          requested_reports: rr.requested_reports,
          form_id: rr.form_id,
        };
      });

    return pendingReports;
  }

  async getGroupedReportsByUserId(
    userId: string,
    completed?: boolean
  ): Promise<any[]> {
    // Fetch either completed or pending reports based on the flag
    if (completed === false) {
      // Get pending reports (from request_report table)
      const rawReports =
        await this.clientReportRepository.findPendingReportsByUserId(userId);

      const groupedMap = new Map<
        string,
        {
          client_id: string;
          client_first_name: string;
          client_last_name: string;
          report_date: string;
          reports: Array<{
            report_id: string;
            report_title: string | null;
            file_path: string | null;
            file_type: string | null;
          }>;
        }
      >();

      for (const requestReport of rawReports) {
        const client = requestReport.client;
        if (!client) continue;

        const reportDate = requestReport.created_date.split("T")[0];
        const key = `${requestReport.client_id}_${reportDate}`;

        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            client_id: requestReport.client_id,
            client_first_name: client.first_name,
            client_last_name: client.last_name,
            report_date: reportDate,
            reports: [],
          });
        }

        const group = groupedMap.get(key)!;

        // For pending reports, extract display_label from requested_reports array
        const requestedReports = requestReport.requested_reports || [];

        // Add each requested report as a separate entry
        if (Array.isArray(requestedReports) && requestedReports.length > 0) {
          for (const report of requestedReports) {
            group.reports.push({
              report_id: requestReport.request_report_id,
              report_title: report.display_label || "Report",
              file_path: null,
              file_type: null,
            });
          }
        }
      }

      return Array.from(groupedMap.values());
    }

    // Get completed reports (from client_report table)
    const rawReports =
      await this.clientReportRepository.findCompletedReportsGroupedByUserIdAndDate(
        userId
      );

    const groupedMap = new Map<
      string,
      {
        client_id: string;
        client_first_name: string;
        client_last_name: string;
        report_date: string;
        reports: Array<{
          report_id: string;
          report_title: string | null;
          file_path: string | null;
          file_type: string | null;
        }>;
      }
    >();

    for (const report of rawReports) {
      const client = report.client;
      if (!client) continue;

      const reportDate = report.created_date.split("T")[0];
      const key = `${report.client_id}_${reportDate}`;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          client_id: report.client_id,
          client_first_name: client.first_name,
          client_last_name: client.last_name,
          report_date: reportDate,
          reports: [],
        });
      }

      const group = groupedMap.get(key)!;
      group.reports.push({
        report_id: report.report_id,
        report_title: report.report_title,
        file_path: report.file_path,
        file_type: report.file_type,
      });
    }

    return Array.from(groupedMap.values());
  }
}
