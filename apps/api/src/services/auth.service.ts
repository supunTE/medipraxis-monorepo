import type { RegisterAdditionalDetailsInput } from "@repo/models";
import { type JwtService } from "../lib/jwt";
import { hashPassword, verifyPassword } from "../lib/password";
import type { RefreshTokenRepository, UserRepository } from "../repositories";
import type { OtpService } from "./otp.service";

const MOBILE_PASSWORD_RESET_OTP_EXPIRATION_MS = 5 * 60 * 1000;

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    public jwtService: JwtService,
    private otpService: OtpService
  ) {}

  private buildPasswordResetOtpKey(countryCode: string, mobileNumber: string) {
    const normalizedCountryCode = countryCode.replace(/\s/g, "");
    const normalizedMobileNumber = mobileNumber.replace(/\s/g, "");
    return `password-reset:${normalizedCountryCode}${normalizedMobileNumber}`;
  }

  async register(
    username: string,
    mobileNumber: string,
    countryCode: string,
    password: string,
    firstName?: string,
    lastName?: string,
    additionalData: any = {}
  ) {
    const existingMobile = await this.userRepository.findUserByMobile(
      mobileNumber,
      countryCode
    );
    if (existingMobile) {
      throw new Error("Mobile number already exists");
    }

    const existingUsername =
      await this.userRepository.findUserByUsername(username);
    if (existingUsername) {
      throw new Error("Username already exists");
    }

    const passwordHash = await hashPassword(password);
    const user = await this.userRepository.createUser({
      username,
      mobile_number: mobileNumber,
      mobile_country_code: countryCode,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      ...additionalData,
    });

    const accessToken = await this.jwtService.signAccessToken({
      sub: user.user_id,
      mobile_number: user.mobile_number,
    });
    const refreshToken = await this.jwtService.signRefreshToken({
      sub: user.user_id,
    });

    // Store refresh token
    const tokenHash = await hashPassword(refreshToken); // Hash refresh token before storing
    // Note: We are hashing the refresh token to store it securely.
    // This means we need the raw refresh token to verify it later.
    // The refresh token itself is a JWT signed by us.
    // We can store the signature or hash the whole token.
    // The plan said "Store hashed refresh tokens".

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.refreshTokenRepository.createRefreshToken(
      user.user_id,
      tokenHash,
      expiresAt
    );

    return { user, accessToken, refreshToken };
  }

  async login(mobileNumber: string, countryCode: string, password: string) {
    const user = await this.userRepository.findUserByMobile(
      mobileNumber,
      countryCode
    );
    if (!user || !user.password_hash) {
      throw new Error("Invalid credentials");
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const accessToken = await this.jwtService.signAccessToken({
      sub: user.user_id,
      mobile_number: user.mobile_number,
    });
    const refreshToken = await this.jwtService.signRefreshToken({
      sub: user.user_id,
    });

    const tokenHash = await hashPassword(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokenRepository.createRefreshToken(
      user.user_id,
      tokenHash,
      expiresAt
    );

    return { user, accessToken, refreshToken };
  }

  async refresh(rawRefreshToken: string) {
    // 1. Verify the JWT signature/validity
    const payload = await this.jwtService.verifyRefreshToken(rawRefreshToken);
    if (!payload || !payload.sub) {
      throw new Error("Invalid refresh token");
    }

    const userId = payload.sub as string;

    // 2. We need to find the token in the DB.
    // CHALLENGE: Deterministic lookup is impossible because tokens are hashed with a random salt.
    // OPTIMIZATION: Instead of a full table scan, we:
    // 1. Verify the JWT to get the `userId` from the payload.
    // 2. Fetch only that user's non-revoked refresh tokens.
    // 3. Match the provided token using `verifyPassword` (PBKDF2).

    const userTokens =
      await this.refreshTokenRepository.findTokensByUserId(userId);
    let matchedToken = null;

    for (const dbToken of userTokens) {
      if (await verifyPassword(rawRefreshToken, dbToken.token_hash)) {
        matchedToken = dbToken;
        break;
      }
    }

    if (!matchedToken) {
      // Reuse detection? If valid JWT but not in DB (or revoked), allows Reuse Detection logic.
      // For now, just throw.
      throw new Error("Invalid or revoked refresh token");
    }

    // Rotate
    // Revoke old
    await this.refreshTokenRepository.revokeRefreshToken(
      matchedToken.token_hash
    );

    // Issue new
    const newAccessToken = await this.jwtService.signAccessToken({
      sub: userId,
    });
    const newRefreshToken = await this.jwtService.signRefreshToken({
      sub: userId,
    });

    const newTokenHash = await hashPassword(newRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokenRepository.createRefreshToken(
      userId,
      newTokenHash,
      expiresAt
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string, rawRefreshToken?: string) {
    // If a specific refresh token is provided, revoke only that token.
    if (rawRefreshToken) {
      const userTokens =
        await this.refreshTokenRepository.findTokensByUserId(userId);
      let matchedToken = null;

      for (const dbToken of userTokens) {
        if (await verifyPassword(rawRefreshToken, dbToken.token_hash)) {
          matchedToken = dbToken;
          break;
        }
      }

      if (matchedToken) {
        await this.refreshTokenRepository.revokeRefreshToken(
          matchedToken.token_hash
        );
        return;
      }
    }

    // Fallback: If no token matches or no token provided, revoke all tokens for safety/legacy behavior.
    await this.refreshTokenRepository.revokeAllUserTokens(userId);
  }

  async requestPasswordReset(mobileNumber: string, countryCode: string) {
    const user = await this.userRepository.findUserByMobile(
      mobileNumber,
      countryCode
    );

    if (!user) {
      throw new Error("User not found");
    }

    const otp = await this.otpService.sendOtp(countryCode, mobileNumber);
    const otpKey = this.buildPasswordResetOtpKey(countryCode, mobileNumber);
    await this.otpService.storeOtp(
      otpKey,
      otp,
      MOBILE_PASSWORD_RESET_OTP_EXPIRATION_MS
    );

    return {
      message: "OTP sent successfully",
    };
  }

  async resetPasswordWithOtp(
    mobileNumber: string,
    countryCode: string,
    otp: string,
    newPassword: string
  ) {
    const user = await this.userRepository.findUserByMobile(
      mobileNumber,
      countryCode
    );

    if (!user) {
      throw new Error("User not found");
    }

    const otpKey = this.buildPasswordResetOtpKey(countryCode, mobileNumber);
    const isValidOtp = await this.otpService.verifyOtp(otpKey, otp);

    if (!isValidOtp) {
      throw new Error("Invalid or expired OTP");
    }

    const passwordHash = await hashPassword(newPassword);
    const updatedUser = await this.userRepository.updatePasswordByMobile(
      mobileNumber,
      countryCode,
      passwordHash
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    await this.refreshTokenRepository.revokeAllUserTokens(updatedUser.user_id);

    return {
      message: "Password reset successfully",
    };
  }

  async saveAdditionalDetails(
    userId: string,
    payload: RegisterAdditionalDetailsInput
  ) {
    const existingUser = await this.userRepository.findUserById(userId);

    if (!existingUser) {
      throw new Error("User not found");
    }

    const updatedUser = await this.userRepository.updateUser(userId, {
      title: payload.title,
      first_name: payload.first_name,
      last_name: payload.last_name,
      role: payload.profession,
      registration_number: payload.registration_number,
      specialization: payload.specialization,
      whatsapp_country_code: payload.different_whatsapp_number
        ? payload.whatsapp_country_code
        : undefined,
      whatsapp_number: payload.different_whatsapp_number
        ? payload.whatsapp_number
        : undefined,
      email_address: payload.email_address,
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  private validateUserAsset(file: File, assetName: "profile" | "seal") {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Invalid ${assetName} file type. Only PDF and image files (JPEG, PNG, JPG) are allowed`
      );
    }

    if (file.size > maxSize) {
      throw new Error(`${assetName} file exceeds 5MB limit`);
    }
  }

  async uploadProfilePicture(file: File, userId: string) {
    this.validateUserAsset(file, "profile");

    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const uploadResult = await this.userRepository.uploadProfilePictureForUser(
      file,
      userId
    );

    return {
      user: uploadResult.user,
      file_path: uploadResult.filePath,
      photo_url: uploadResult.publicUrl,
    };
  }

  async uploadSeal(file: File, userId: string) {
    this.validateUserAsset(file, "seal");

    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const uploadResult = await this.userRepository.uploadSealForUser(
      file,
      userId
    );

    return {
      user: uploadResult.user,
      file_path: uploadResult.filePath,
      seal_url: uploadResult.publicUrl,
    };
  }
}
