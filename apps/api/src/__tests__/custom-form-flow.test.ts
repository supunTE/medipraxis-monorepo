import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { CreateFormInput, Form, FormType } from "@repo/models";
import { FormController } from "../controllers/form.controller";
import type { APIContext } from "../types";

// Mock the getFormService function
jest.mock("../lib", () => ({
  getFormService: jest.fn(),
}));

import { getFormService } from "../lib";

describe("Custom Form Flow", () => {
  let mockContext: any;
  let mockFormService: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock service with all required methods
    mockFormService = {
      saveForm: jest.fn(),
      getFormById: jest.fn(),
      getActiveForm: jest.fn(),
      getFormsByUserId: jest.fn(),
    };

    // Mock the context object
    mockContext = {
      req: {
        param: jest.fn(),
        valid: jest.fn(),
        query: jest.fn(),
      },
      json: jest.fn(),
    };

    // Make getFormService return our mock service
    (getFormService as jest.Mock).mockReturnValue(mockFormService);
  });

  describe("POST /forms", () => {
    it("should successfully save a custom form", async () => {
      // Arrange
      const mockFormInput: CreateFormInput = {
        title: "Request Report Form",
        description: "Form for requesting medical reports from clients",
        user_id: "user-123",
        form_type: "REQUEST_FORM" as FormType,
        form_configuration: [
          {
            id: "field-1",
            active: true,
            sequence: 1,
            help_text: "Select the type of blood test",
            field_type: "checkbox",
            description: "Blood test selection",
            display_label: "Blood Test",
            required: true,
            shareable: true,
          },
          {
            id: "field-2",
            active: true,
            sequence: 2,
            help_text: "Additional notes for the client",
            field_type: "textarea",
            description: "Special instructions",
            display_label: "Notes",
            required: false,
            shareable: true,
          },
        ],
      };

      const mockSavedForm: Form = {
        form_id: "form-abc-123",
        title: mockFormInput.title,
        description: mockFormInput.description || null,
        version: 1,
        is_active: true,
        form_configuration: mockFormInput.form_configuration,
        user_id: mockFormInput.user_id,
        form_type: mockFormInput.form_type,
        created_date: "2026-03-21T10:00:00Z",
        updated_date: "2026-03-21T10:00:00Z",
      };

      mockContext.req.valid.mockReturnValue(mockFormInput);
      mockFormService.saveForm.mockResolvedValue(mockSavedForm);

      // Act
      await FormController.saveForm(
        mockContext as APIContext<{ json: CreateFormInput }>
      );

      // Assert
      expect(getFormService).toHaveBeenCalledWith(mockContext);
      expect(mockContext.req.valid).toHaveBeenCalledWith("json");
      expect(mockFormService.saveForm).toHaveBeenCalledWith(mockFormInput);
      expect(mockContext.json).toHaveBeenCalledWith(
        { success: true, form: mockSavedForm },
        201
      );
    });

    it("should handle errors when saving form fails", async () => {
      // Arrange
      const mockFormInput: CreateFormInput = {
        title: "Invalid Form",
        user_id: "user-123",
        form_type: "REQUEST_FORM" as FormType,
        form_configuration: [],
      };

      const errorMessage = "Form configuration cannot be empty";
      mockContext.req.valid.mockReturnValue(mockFormInput);
      mockFormService.saveForm.mockRejectedValue(new Error(errorMessage));

      // Act
      await FormController.saveForm(
        mockContext as APIContext<{ json: CreateFormInput }>
      );

      // Assert
      expect(mockFormService.saveForm).toHaveBeenCalledWith(mockFormInput);
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: errorMessage },
        400
      );
    });
  });

  describe("GET /forms/:id", () => {
    it("should successfully retrieve a form by ID", async () => {
      // Arrange
      const mockFormId = "form-abc-123";
      const mockForm: Form = {
        form_id: mockFormId,
        title: "Client Details Form",
        description: "Comprehensive client information form",
        version: 2,
        is_active: true,
        form_configuration: [
          {
            id: "field-1",
            active: true,
            sequence: 1,
            help_text: "Enter client full name",
            field_type: "text",
            description: "Full name",
            display_label: "Name",
            required: true,
            shareable: true,
          },
        ],
        user_id: "user-456",
        form_type: "CLIENT_DETAILS",
        created_date: "2026-03-20T08:00:00Z",
        updated_date: "2026-03-21T09:30:00Z",
      };

      mockContext.req.param.mockReturnValue(mockFormId);
      mockFormService.getFormById.mockResolvedValue(mockForm);

      // Act
      await FormController.getFormById(mockContext as any);

      // Assert
      expect(getFormService).toHaveBeenCalledWith(mockContext);
      expect(mockContext.req.param).toHaveBeenCalledWith("id");
      expect(mockFormService.getFormById).toHaveBeenCalledWith(mockFormId);
      expect(mockContext.json).toHaveBeenCalledWith({ form: mockForm });
    });

    it("should return 404 when form is not found", async () => {
      // Arrange
      const mockFormId = "non-existent-form-id";

      mockContext.req.param.mockReturnValue(mockFormId);
      mockFormService.getFormById.mockRejectedValue(
        new Error("Form not found")
      );

      // Act
      await FormController.getFormById(mockContext as any);

      // Assert
      expect(mockFormService.getFormById).toHaveBeenCalledWith(mockFormId);
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Form not found" },
        404
      );
    });
  });

  describe("GET /forms/active", () => {
    it("should successfully retrieve the active form for a user and form type", async () => {
      // Arrange
      const mockUserId = "user-789";
      const mockFormType = "APPOINTMENT_RECORD";
      const mockActiveForm: Form = {
        form_id: "active-form-xyz",
        title: "Active Appointment Record Form",
        description: "Current version of appointment record form",
        version: 3,
        is_active: true,
        form_configuration: [
          {
            id: "field-1",
            active: true,
            sequence: 1,
            help_text: "Select appointment type",
            field_type: "select",
            description: "Appointment type",
            display_label: "Type",
            options: ["Consultation", "Follow-up", "Emergency"],
            required: true,
            shareable: false,
          },
        ],
        user_id: mockUserId,
        form_type: mockFormType,
        created_date: "2026-03-21T07:00:00Z",
        updated_date: "2026-03-21T07:00:00Z",
      };

      mockContext.req.query
        .mockReturnValueOnce(mockUserId)
        .mockReturnValueOnce(mockFormType);
      mockFormService.getActiveForm.mockResolvedValue(mockActiveForm);

      // Act
      await FormController.getActiveForm(mockContext as any);

      // Assert
      expect(getFormService).toHaveBeenCalledWith(mockContext);
      expect(mockContext.req.query).toHaveBeenCalledWith("user_id");
      expect(mockContext.req.query).toHaveBeenCalledWith("form_type");
      expect(mockFormService.getActiveForm).toHaveBeenCalledWith(
        mockUserId,
        mockFormType
      );
      expect(mockContext.json).toHaveBeenCalledWith({ form: mockActiveForm });
    });

    it("should return 404 when no active form is found", async () => {
      // Arrange
      const mockUserId = "user-789";
      const mockFormType = "REQUEST_FORM";

      mockContext.req.query
        .mockReturnValueOnce(mockUserId)
        .mockReturnValueOnce(mockFormType);
      mockFormService.getActiveForm.mockRejectedValue(
        new Error("No active form found")
      );

      // Act
      await FormController.getActiveForm(mockContext as any);

      // Assert
      expect(mockFormService.getActiveForm).toHaveBeenCalledWith(
        mockUserId,
        mockFormType
      );
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "No active form found" },
        404
      );
    });
  });
});
