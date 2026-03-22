import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { CreateRequestReportInput, RequestReport } from "@repo/models";
import { RequestReportController } from "../controllers/request_report.controller";
import type { APIContext } from "../types";

// Mock the getRequestReportService function
jest.mock("../lib", () => ({
  getRequestReportService: jest.fn(),
}));

import { getRequestReportService } from "../lib";

describe("Request Report Flow", () => {
  let mockContext: any;
  let mockRequestReportService: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock service with all required methods
    mockRequestReportService = {
      getRequestReportById: jest.fn(),
      createRequestReport: jest.fn(),
    };

    // Mock the context object
    mockContext = {
      req: {
        param: jest.fn(),
        valid: jest.fn(),
      },
      json: jest.fn(),
    };

    // Make getRequestReportService return our mock service
    (getRequestReportService as jest.Mock).mockReturnValue(
      mockRequestReportService
    );
  });

  describe("GET /request-reports/:id", () => {
    it("should successfully retrieve a request report by ID", async () => {
      // Arrange
      const mockRequestReportId = "123e4567-e89b-12d3-a456-426614174000";
      const mockRequestReport: RequestReport & {
        user_name?: string;
        client_name?: string;
      } = {
        request_report_id: mockRequestReportId,
        created_date: "2026-03-21T10:00:00Z",
        user_id: "user-123",
        client_id: "client-456",
        form_id: "form-789",
        requested_reports: [
          { display_label: "Blood Test", active: true },
          { display_label: "X-Ray", active: true },
        ],
        expired: false,
        deleted: false,
        user_name: "Dr. John Smith",
        client_name: "Jane Doe",
      };

      mockContext.req.param.mockReturnValue(mockRequestReportId);
      mockRequestReportService.getRequestReportById.mockResolvedValue(
        mockRequestReport
      );

      // Act
      await RequestReportController.getRequestReportById(
        mockContext as APIContext<{ param: { id: string } }>
      );

      // Assert
      expect(getRequestReportService).toHaveBeenCalledWith(mockContext);
      expect(mockContext.req.param).toHaveBeenCalledWith("id");
      expect(
        mockRequestReportService.getRequestReportById
      ).toHaveBeenCalledWith(mockRequestReportId);
      expect(mockContext.json).toHaveBeenCalledWith(mockRequestReport);
    });

    it("should return 404 when request report is not found", async () => {
      // Arrange
      const mockRequestReportId = "non-existent-id";

      mockContext.req.param.mockReturnValue(mockRequestReportId);
      mockRequestReportService.getRequestReportById.mockResolvedValue(null);

      // Act
      await RequestReportController.getRequestReportById(
        mockContext as APIContext<{ param: { id: string } }>
      );

      // Assert
      expect(
        mockRequestReportService.getRequestReportById
      ).toHaveBeenCalledWith(mockRequestReportId);
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Request report not found" },
        404
      );
    });
  });

  describe("POST /request-reports", () => {
    it("should successfully create a request report with notification", async () => {
      // Arrange
      const mockInput: CreateRequestReportInput = {
        user_id: "user-123",
        client_id: "client-456",
        form_id: "form-789",
        requested_reports: [
          { display_label: "Blood Test", active: true },
          { display_label: "MRI Scan", active: true },
        ],
        note: "Please submit reports by end of week",
        notification_type: {
          text: true,
          whatsapp: false,
          email: false,
        },
      };

      const mockCreatedReport: RequestReport = {
        request_report_id: "new-report-123",
        created_date: "2026-03-21T10:30:00Z",
        user_id: mockInput.user_id,
        client_id: mockInput.client_id,
        form_id: mockInput.form_id || null,
        requested_reports: mockInput.requested_reports,
        expired: false,
        deleted: false,
      };

      mockContext.req.valid.mockReturnValue(mockInput);
      mockRequestReportService.createRequestReport.mockResolvedValue(
        mockCreatedReport
      );

      // Act
      await RequestReportController.createRequestReport(
        mockContext as APIContext<{ json: CreateRequestReportInput }>
      );

      // Assert
      expect(getRequestReportService).toHaveBeenCalledWith(mockContext);
      expect(mockContext.req.valid).toHaveBeenCalledWith("json");
      expect(mockRequestReportService.createRequestReport).toHaveBeenCalledWith(
        mockInput
      );
      expect(mockContext.json).toHaveBeenCalledWith(
        { success: true, requestReport: mockCreatedReport },
        201
      );
    });

    it("should handle errors when creating request report fails", async () => {
      // Arrange
      const mockInput: CreateRequestReportInput = {
        user_id: "user-123",
        client_id: "invalid-client",
        form_id: "form-789",
      };

      const errorMessage = "Client not found";
      mockContext.req.valid.mockReturnValue(mockInput);
      mockRequestReportService.createRequestReport.mockRejectedValue(
        new Error(errorMessage)
      );

      // Act
      await RequestReportController.createRequestReport(
        mockContext as APIContext<{ json: CreateRequestReportInput }>
      );

      // Assert
      expect(mockRequestReportService.createRequestReport).toHaveBeenCalledWith(
        mockInput
      );
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: errorMessage },
        500
      );
    });
  });
});
