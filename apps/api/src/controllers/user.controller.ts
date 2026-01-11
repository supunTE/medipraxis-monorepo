import { getUserService } from "../lib";
import type { APIContext } from "../types/api-context";

type UserParam = { id: string };

export class UserController {
  // Get user by ID
  static async getUserById(c: APIContext<{ param: UserParam }, "/:id">) {
    try {
      const userService = getUserService(c);
      const userId = c.req.param("id");

      const user = await userService.getUserById(userId);

      return c.json({ success: true, user });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch user";
      const status =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }
}
