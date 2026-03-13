import { sign, verify } from "hono/jwt";

export class JwtService {
  constructor(
    private readonly accessTokenSecret: string,
    private readonly refreshTokenSecret: string
  ) {
    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new Error("JWT secrets are not configured");
    }
  }

  async signAccessToken(payload: object) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 15; // 15 minutes
    return await sign({ ...payload, iat, exp }, this.accessTokenSecret);
  }

  async signRefreshToken(payload: object) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60 * 24 * 30; // 30 days
    return await sign({ ...payload, iat, exp }, this.refreshTokenSecret);
  }

  async verifyAccessToken(token: string) {
    try {
      return await verify(token, this.accessTokenSecret);
    } catch (e) {
      return null;
    }
  }

  async verifyRefreshToken(token: string) {
    try {
      return await verify(token, this.refreshTokenSecret);
    } catch (e) {
      return null;
    }
  }
}
