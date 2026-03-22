import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AuthController } from "../controllers/auth.controller";
import type { APIContext } from "../types";

// Mock the getAuthService function
jest.mock("../lib/service-factory", () => ({
  getAuthService: jest.fn(),
}));

import { getAuthService } from "../lib/service-factory";

describe("Auth Controller Flow", () => {
  let mockContext: any;
  let mockAuthService: any;
  let mockJwtService: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    mockJwtService = {
      verifyRefreshToken: jest.fn(),
    };

    // Create mock service with all required methods
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      jwtService: mockJwtService,
    };

    // Make getAuthService return our mock service
    (getAuthService as jest.Mock).mockReturnValue(mockAuthService);

    // Mock the context object
    mockContext = {
      req: {
        json: jest.fn(),
      },
      json: jest.fn((data: any, status?: number) => ({ data, status })),
    };
  });

  describe("register", () => {
    it("should register a user successfully", async () => {
      const payload = {
        username: "testuser",
        mobile_number: "1234567890",
        mobile_country_code: "+1",
        password: "password123",
      };
      mockContext.req.json.mockResolvedValue(payload);

      const mockResult = { user: { id: "1", username: "testuser" }, token: "abc" };
      mockAuthService.register.mockResolvedValue(mockResult);

      await AuthController.register(mockContext as APIContext<any>);

      expect(mockContext.req.json).toHaveBeenCalled();
      expect(mockAuthService.register).toHaveBeenCalledWith(
        payload.username,
        payload.mobile_number,
        payload.mobile_country_code,
        payload.password
      );
      expect(mockContext.json).toHaveBeenCalledWith(mockResult, 201);
    });

    it("should handle conflicts (409) for existing user/mobile", async () => {
      mockContext.req.json.mockResolvedValue({});
      mockAuthService.register.mockRejectedValue(new Error("Username already exists"));

      await AuthController.register(mockContext as APIContext<any>);

      expect(mockContext.json).toHaveBeenCalledWith({ error: "Username already exists" }, 409);
    });

    it("should handle validation or other bad request (400) errors", async () => {
      mockContext.req.json.mockResolvedValue({});
      mockAuthService.register.mockRejectedValue(new Error("Password too weak"));

      await AuthController.register(mockContext as APIContext<any>);

      expect(mockContext.json).toHaveBeenCalledWith({ error: "Password too weak" }, 400);
    });
  });

  describe("login", () => {
    it("should log in successfully", async () => {
      const payload = {
        mobile_number: "1234567890",
        mobile_country_code: "+1",
        password: "password123",
      };
      mockContext.req.json.mockResolvedValue(payload);

      const mockResult = { token: "abc", refreshToken: "def" };
      mockAuthService.login.mockResolvedValue(mockResult);

      await AuthController.login(mockContext as APIContext<any>);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        payload.mobile_number,
        payload.mobile_country_code,
        payload.password
      );
      expect(mockContext.json).toHaveBeenCalledWith(mockResult);
    });

    it("should return false credentials on invalid try", async () => {
      mockContext.req.json.mockResolvedValue({});
      mockAuthService.login.mockRejectedValue(new Error("Wrong password"));

      await AuthController.login(mockContext as APIContext<any>);

      expect(mockContext.json).toHaveBeenCalledWith({ error: "Invalid credentials" }, 401);
    });
  });

  describe("refresh", () => {
    it("should refresh token successfully", async () => {
      mockContext.req.json.mockResolvedValue({ refreshToken: "old-refresh" });
      mockAuthService.refresh.mockResolvedValue({ token: "new-token" });

      await AuthController.refresh(mockContext as APIContext<any>);

      expect(mockAuthService.refresh).toHaveBeenCalledWith("old-refresh");
      expect(mockContext.json).toHaveBeenCalledWith({ token: "new-token" });
    });

    it("should return 401 when refresh fails", async () => {
      mockContext.req.json.mockResolvedValue({ refreshToken: "bad-refresh" });
      mockAuthService.refresh.mockRejectedValue(new Error("Expired"));

      await AuthController.refresh(mockContext as APIContext<any>);

      expect(mockContext.json).toHaveBeenCalledWith({ error: "Invalid refresh token" }, 401);
    });
  });

  describe("logout", () => {
    it("should logout successfully giving valid refresh token", async () => {
      mockContext.req.json.mockResolvedValue({ refreshToken: "valid-refresh" });
      mockJwtService.verifyRefreshToken.mockResolvedValue({ sub: "user-1" });
      mockAuthService.logout.mockResolvedValue();

      await AuthController.logout(mockContext as APIContext<any>);

      expect(mockJwtService.verifyRefreshToken).toHaveBeenCalledWith("valid-refresh");
      expect(mockAuthService.logout).toHaveBeenCalledWith("user-1", "valid-refresh");
      expect(mockContext.json).toHaveBeenCalledWith({ message: "Logged out from this device" });
    });

    it("should return 401 for an invalid token or verification issue", async () => {
      mockContext.req.json.mockResolvedValue({ refreshToken: "invalid-refresh" });
      mockJwtService.verifyRefreshToken.mockRejectedValue(new Error("Invalid token"));

      await AuthController.logout(mockContext as APIContext<any>);

      expect(mockContext.json).toHaveBeenCalledWith({ message: "Token invalid or already logged out" }, 401);
    });

    it("should return 400 if no refresh token is provided", async () => {
      mockContext.req.json.mockResolvedValue({});

      await AuthController.logout(mockContext as APIContext<any>);

      expect(mockContext.json).toHaveBeenCalledWith({ error: "Refresh token is required for logout" }, 400);
    });

    it("should handle error in extracting body without throwing", async () => {
      mockContext.req.json.mockRejectedValue(new Error("Malformed JSON"));

      await AuthController.logout(mockContext as APIContext<any>);

      expect(mockContext.json).toHaveBeenCalledWith({ error: "Refresh token is required for logout" }, 400);
    });
  });
});
