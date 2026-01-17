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

  async getReportFileUrl(reportId: string): Promise<string> {
    const report = await this.clientReportRepository.findById(reportId);

    if (!report) {
      throw new Error("Report not found");
    }

    if (!report.file_path) {
      throw new Error("Report has no associated file");
    }

    return await this.clientReportRepository.getFileUrl(report.file_path);
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
}
