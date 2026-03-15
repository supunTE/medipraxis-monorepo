import { JwtService } from "../lib/jwt";
import { hashPassword, verifyPassword } from "../lib/password";
import type { RefreshTokenRepository, UserRepository } from "../repositories";

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    public jwtService: JwtService
  ) {}

  async register(
    username: string,
    mobileNumber: string,
    countryCode: string,
    password: string,
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
}
