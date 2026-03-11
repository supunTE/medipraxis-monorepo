import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../lib/jwt";
import { hashPassword, verifyPassword } from "../lib/password";
import type { RefreshTokenRepository, UserRepository } from "../repositories";

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository
  ) {}

  async register(
    username: string,
    mobileNumber: string,
    countryCode: string,
    password: string,
    additionalData: any = {}
  ) {
    const existingUser = await this.userRepository.findUserByMobile(
      mobileNumber,
      countryCode
    );
    if (existingUser) {
      throw new Error("User already exists");
    }

    const passwordHash = await hashPassword(password);
    const user = await this.userRepository.createUser({
      username,
      mobile_number: mobileNumber,
      mobile_country_code: countryCode,
      password_hash: passwordHash,
      ...additionalData,
    });

    const accessToken = await signAccessToken({
      sub: user.user_id,
      mobile_number: user.mobile_number,
    });
    const refreshToken = await signRefreshToken({ sub: user.user_id });

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

    const accessToken = await signAccessToken({
      sub: user.user_id,
      mobile_number: user.mobile_number,
    });
    const refreshToken = await signRefreshToken({ sub: user.user_id });

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
    const payload = await verifyRefreshToken(rawRefreshToken);
    if (!payload || !payload.sub) {
      throw new Error("Invalid refresh token");
    }

    const userId = payload.sub as string;

    // 2. We need to find the token in the DB.
    // Since we hash it, we have to iterate? No, that's bad.
    // Wait, if we hash the refresh token, we can't look it up by hash unless we have the clear text.
    // We have the clear text `rawRefreshToken`.
    // But `hashPassword` generates a random salt. So we can't reproduce the hash!
    // We need a deterministic hash OR we store the salt with the token?
    // `hashPassword` returns `salt:hash`.
    // To verify, we need to find the row.
    // If we use `hashPassword` (PBKDF2 with random salt), we cannot look up the token in the DB efficiently.
    // We would need to fetch ALL tokens for the user and verify each one. That's slow.
    // ALTERNATIVE: Use a fast hash (SHA-256) without salt (or constant salt) for the "lookup key" part of the token,
    // OR just store the JWT ID (jti) and hash the rest?
    // OR just use the JWT signature as the key?
    //
    // EASIER APPROACH FOR NOW:
    // Store the refresh token AS IS (if SecureStorage on client is safe).
    // BUT the plan said "Store hashed refresh tokens".
    // AND "Safe on Cloudflare Workers".
    //
    // If we want to look up by token, we should use a hash that is deterministic or just use the token itself if it's high entropy.
    // JWTs are high entropy (signature).
    //
    // Let's perform a "lookup" optimization:
    // When the client sends the refresh token, we verify it (JWT).
    // Ideally the JWT has a `jti` (unique ID). We can store that `jti` in the DB.
    // Then we look up by `jti`.
    // Then verify the token hash if we want to be extra secure against DB leaks.

    // Let's modify `signRefreshToken` to include a `jti` (UUID).
    // And store `jti` in `refresh_tokens` table instead of (or in addition to) `token_hash`.
    //
    // However, I can't change the DB schema easily now (I already wrote the SQL).
    // `token_hash` is indexed.
    //
    // If I stick to `token_hash` with random salt, I can't lookup.
    // I MUST use a deterministic hash for lookup, OR matching the plan's `Rotated on every refresh` with `One per device` maybe implies we traverse?
    // No, lookup should be O(1).
    //
    // I will implementation a `hashToken` function (SHA-256, no salt or fixed salt) for the purpose of the DB lookup key.
    // Wait, the `password.ts` has `verifyPassword` which takes `storedHash` (containing salt).
    // That works for login callback where we have the user ID (email -> user).
    // For refresh token, we generally verify the JWT first -> get user ID -> get user's tokens -> verify?
    // Yes, `verifyRefreshToken` gives us `sub` (user_id).
    // So we CAN fetch all active refresh tokens for the `user_id` and check if `rawRefreshToken` matches any of them.
    // Since `refresh_tokens` table has `user_id` text/uuid.
    // This is acceptable if users don't have thousands of devices.

    // So algorithm:
    // 1. Verify JWT -> get `userId`.
    // 2. Fetch all non-revoked tokens for `userId`.
    // 3. For each, check `verifyPassword(rawRefreshToken, dbToken.token_hash)`.
    // 4. If match -> rotate.

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
    const newAccessToken = await signAccessToken({ sub: userId });
    const newRefreshToken = await signRefreshToken({ sub: userId });

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
