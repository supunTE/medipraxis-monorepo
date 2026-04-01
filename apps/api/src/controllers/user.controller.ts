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

  // Get profile picture signed URL
  static async getProfilePicture(
    c: APIContext<{ param: UserParam }, "/:id/profile-picture">
  ) {
    try {
      const userService = getUserService(c);
      const userId = c.req.param("id");

      const profilePictureData = await userService.getProfilePictureUrl(userId);

      return c.json(profilePictureData);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to get profile picture";
      if (error instanceof Error) {
        if (error.message === "User not found") {
          return c.json({ error: message }, 404);
        } else if (error.message === "Profile picture not found") {
          return c.json({ error: message }, 404);
        }
      }
      return c.json({ error: message }, 500);
    }
  }

  // Update user by ID
  static async updateUser(
    c: APIContext<{ json: any; param: UserParam }, "/:id">
  ) {
    try {
      const userService = getUserService(c);
      const userId = c.req.param("id");
      const body = c.req.valid("json");

      const user = await userService.updateUser(userId, body);

      return c.json({ success: true, user });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update user";
      const status =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 400;
      return c.json({ error: message }, status);
    }
  }
}
