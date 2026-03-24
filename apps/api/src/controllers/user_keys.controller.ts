import type { SaveUserKeysInput } from "@repo/models";
import { getUserKeysService } from "../lib";
import type { APIContext } from "../types";

export class UserKeysController {
  static async getPublicKey(
    c: APIContext<{ param: { userId: string } }, "/:userId/public-key">
  ) {
    try {
      const userId = c.req.param("userId");
      const userKeysService = getUserKeysService(c);

      const publicKey = await userKeysService.getPublicKeyByUserId(userId);
      return c.json({ public_key: publicKey });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get public key";
      const status =
        error instanceof Error && error.message === "User keys not found"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }

  static async saveUserKeys(c: APIContext<{ json: SaveUserKeysInput }>) {
    try {
      const { public_key, wrapped_private_key, pbkdf2_salt } = c.req.valid(
        "json"
      ) as SaveUserKeysInput;
      const userId = (c.get("user" as never) as { sub: string }).sub;
      const userKeysService = getUserKeysService(c);

      const result = await userKeysService.saveUserKeys(
        userId,
        public_key,
        wrapped_private_key,
        pbkdf2_salt
      );
      return c.json(result, 201);
    } catch (error) {
      console.error("Save user keys error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to save user keys";
      return c.json({ error: message }, 500);
    }
  }

  static async getUserKeys(c: APIContext) {
    try {
      const userId = (c.get("user" as never) as { sub: string }).sub;
      const userKeysService = getUserKeysService(c);

      const result = await userKeysService.getUserKeys(userId);
      return c.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get user keys";
      const status =
        error instanceof Error && error.message === "User keys not found"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }
}
