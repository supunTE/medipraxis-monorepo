import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { UserController } from "../controllers/user.controller";
import type { APIContext } from "../types";

// Mock the getUserService function
jest.mock("../lib", () => ({
  getUserService: jest.fn(),
}));

import { getUserService } from "../lib";

describe("User Controller Flow", () => {
  let mockContext: any;
  let mockUserService: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock service with all required methods
    mockUserService = {
      getUserById: jest.fn(),
      updateUser: jest.fn(),
    };

    // Make getUserService return our mock service
    (getUserService as jest.Mock).mockReturnValue(mockUserService);

    // Mock the context object
    mockContext = {
      req: {
        param: jest.fn(),
        valid: jest.fn(),
      },
      json: jest.fn((data: any, status?: number) => ({ data, status })),
    };
  });

  describe("getUserById", () => {
    it("should successfully return a user", async () => {
      const mockUserId = "user-123";
      const mockUser = { id: mockUserId, name: "Test User" };

      mockContext.req.param.mockReturnValue(mockUserId);
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await UserController.getUserById(mockContext as APIContext<any>);

      expect(getUserService).toHaveBeenCalledWith(mockContext);
      expect(mockContext.req.param).toHaveBeenCalledWith("id");
      expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUserId);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        user: mockUser,
      });
    });

    it("should return 404 when user is not found", async () => {
      const mockUserId = "user-123";

      mockContext.req.param.mockReturnValue(mockUserId);
      mockUserService.getUserById.mockRejectedValue(
        new Error("User not found")
      );

      await UserController.getUserById(mockContext as APIContext<any>);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "User not found" },
        404
      );
    });

    it("should return 500 on internal server error", async () => {
      const mockUserId = "user-123";

      mockContext.req.param.mockReturnValue(mockUserId);
      mockUserService.getUserById.mockRejectedValue(
        new Error("Database connection failed")
      );

      await UserController.getUserById(mockContext as APIContext<any>);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Database connection failed" },
        500
      );
    });
  });

  describe("updateUser", () => {
    it("should successfully update a user", async () => {
      const mockUserId = "user-123";
      const mockUpdateBody = { name: "Updated Name" };
      const mockUpdatedUser = { id: mockUserId, name: "Updated Name" };

      mockContext.req.param.mockReturnValue(mockUserId);
      mockContext.req.valid.mockReturnValue(mockUpdateBody);
      mockUserService.updateUser.mockResolvedValue(mockUpdatedUser);

      await UserController.updateUser(mockContext as APIContext<any>);

      expect(getUserService).toHaveBeenCalledWith(mockContext);
      expect(mockContext.req.param).toHaveBeenCalledWith("id");
      expect(mockContext.req.valid).toHaveBeenCalledWith("json");
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        mockUserId,
        mockUpdateBody
      );
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        user: mockUpdatedUser,
      });
    });

    it("should return 404 when user to update is not found", async () => {
      const mockUserId = "user-123";
      const mockUpdateBody = { name: "Updated Name" };

      mockContext.req.param.mockReturnValue(mockUserId);
      mockContext.req.valid.mockReturnValue(mockUpdateBody);
      mockUserService.updateUser.mockRejectedValue(new Error("User not found"));

      await UserController.updateUser(mockContext as APIContext<any>);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "User not found" },
        404
      );
    });

    it("should return 400 on bad validation or upate error", async () => {
      const mockUserId = "user-123";
      const mockUpdateBody = { name: "Updated Name" };

      mockContext.req.param.mockReturnValue(mockUserId);
      mockContext.req.valid.mockReturnValue(mockUpdateBody);
      mockUserService.updateUser.mockRejectedValue(new Error("Invalid format"));

      await UserController.updateUser(mockContext as APIContext<any>);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Invalid format" },
        400
      );
    });
  });
});
