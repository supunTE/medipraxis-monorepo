import { apiClient } from "@/lib/api-client";
import { authStorage } from "@/utils/storage";
import type { RegisterAdditionalDetailsInput } from "@repo/models";
import type { File as ExpoFile } from "expo-file-system";
import { Paths } from "expo-file-system";
import { copyAsync } from "expo-file-system/legacy";

export interface User {
  user_id: string;
  mobile_number: string;
  mobile_country_code: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ErrorResponse {
  error: string | Record<string, any>;
}

export interface AdditionalDetailsResponse {
  message: string;
  user?: User;
}

export interface UploadUserAssetResponse {
  user?: User;
  file_path?: string;
  photo_url?: string;
  seal_url?: string;
}

export const authService = {
  async login(
    phoneNumber: string,
    countryCode: string,
    password: string
  ): Promise<User> {
    const res = await apiClient.api.auth.login.$post({
      json: {
        mobile_number: phoneNumber,
        mobile_country_code: countryCode,
        password,
      },
    });

    if (!res.ok) {
      const errorData = (await res
        .json()
        .catch(() => ({ error: "Login failed" }))) as ErrorResponse;
      const errorMessage =
        typeof errorData.error === "string"
          ? errorData.error
          : JSON.stringify(errorData.error) || "Login failed";
      throw new Error(errorMessage);
    }

    const data = (await res.json()) as AuthResponse;
    await authStorage.setAccessToken(data.accessToken);
    await authStorage.setRefreshToken(data.refreshToken);

    return data.user;
  },

  async register(
    phoneNumber: string,
    countryCode: string,
    password: string,
    username: string,
    firstName?: string,
    lastName?: string
  ): Promise<User> {
    const res = await apiClient.api.auth.register.$post({
      json: {
        username: username,
        first_name: firstName,
        last_name: lastName,
        mobile_number: phoneNumber,
        mobile_country_code: countryCode,
        password,
      },
    });

    if (!res.ok) {
      const errorData = (await res
        .json()
        .catch(() => ({ error: "Registration failed" }))) as ErrorResponse;
      const errorMessage =
        typeof errorData.error === "string"
          ? errorData.error
          : JSON.stringify(errorData.error) || "Registration failed";
      throw new Error(errorMessage);
    }

    const data = (await res.json()) as AuthResponse;
    await authStorage.setAccessToken(data.accessToken);
    await authStorage.setRefreshToken(data.refreshToken);

    return data.user;
  },

  async logout() {
    const refreshToken = await authStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.api.auth.logout.$post({
          json: { refreshToken },
        });
      }
    } catch (e) {
      // Ignore logout errors
    } finally {
      await authStorage.clearAll();
    }
  },

  async refresh(): Promise<string | null> {
    const refreshToken = await authStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await apiClient.api.auth.refresh.$post({
        json: { refreshToken },
      });

      if (!res.ok) {
        await authStorage.clearAll();
        return null;
      }

      const data = (await res.json()) as AuthResponse;
      await authStorage.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        await authStorage.setRefreshToken(data.refreshToken);
      }
      return data.accessToken;
    } catch (e) {
      await authStorage.clearAll();
      return null;
    }
  },

  async registerAdditionalDetails(
    payload: RegisterAdditionalDetailsInput
  ): Promise<AdditionalDetailsResponse> {
    const res = await (
      apiClient.api.auth.register["additional-details"] as any
    ).$post({
      json: payload,
    });

    if (!res.ok) {
      const errorData = (await res.json().catch(() => ({
        error: "Failed to save additional details",
      }))) as ErrorResponse;
      const errorMessage =
        typeof errorData.error === "string"
          ? errorData.error
          : JSON.stringify(errorData.error) ||
            "Failed to save additional details";
      throw new Error(errorMessage);
    }

    return (await res.json()) as AdditionalDetailsResponse;
  },

  async uploadProfilePicture(file: ExpoFile): Promise<UploadUserAssetResponse> {
    const localUri = `${Paths.cache.uri}${file.name}`;
    await copyAsync({ from: file.uri, to: localUri });

    const res = await (
      apiClient.api.auth.register["additional-details"][
        "profile-picture"
      ] as any
    ).$post({
      form: {
        file: {
          uri: localUri,
          type: file.type || "image/jpeg",
          name: file.name || "profile.jpg",
        } as unknown as Blob,
      },
    });

    if (!res.ok) {
      const errorData = (await res.json().catch(() => ({
        error: "Failed to upload profile picture",
      }))) as ErrorResponse;
      const errorMessage =
        typeof errorData.error === "string"
          ? errorData.error
          : JSON.stringify(errorData.error) ||
            "Failed to upload profile picture";
      throw new Error(errorMessage);
    }

    return (await res.json()) as UploadUserAssetResponse;
  },

  async uploadSeal(file: ExpoFile): Promise<UploadUserAssetResponse> {
    const localUri = `${Paths.cache.uri}${file.name}`;
    await copyAsync({ from: file.uri, to: localUri });

    const res = await (
      apiClient.api.auth.register["additional-details"]["seal"] as any
    ).$post({
      form: {
        file: {
          uri: localUri,
          type: file.type || "image/jpeg",
          name: file.name || "profile.jpg",
        } as unknown as Blob,
      },
    });

    if (!res.ok) {
      const errorData = (await res
        .json()
        .catch(() => ({ error: "Failed to upload seal" }))) as ErrorResponse;
      const errorMessage =
        typeof errorData.error === "string"
          ? errorData.error
          : JSON.stringify(errorData.error) || "Failed to upload seal";
      throw new Error(errorMessage);
    }

    return (await res.json()) as UploadUserAssetResponse;
  },
};
