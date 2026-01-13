import type { ClientReport, CreateClientReportInput } from "@repo/models";
import { ClientReportRepository } from "../repositories";

export class ClientReportService {
  private clientReportRepository: ClientReportRepository;

  constructor(clientReportRepository: ClientReportRepository) {
    this.clientReportRepository = clientReportRepository;
  }

  async createReport(
    input: CreateClientReportInput,
    file: File
  ): Promise<ClientReport> {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only PDF and image files (JPEG, PNG, JPG) are allowed"
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error("File size exceeds 10MB limit");
    }

    // Upload file to storage
    const filePath = await this.clientReportRepository.uploadFile(
      file,
      input.user_id,
      input.client_id
    );

    // Create database record
    const report = await this.clientReportRepository.create(input, filePath);

    return report;
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
}
