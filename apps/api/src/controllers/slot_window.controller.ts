import type {
  CreateSlotWindowInput,
  CreateSlotWindowTemplateInput,
  GetAllSlotWindowsQuery,
  GetAllSlotWindowTemplatesQuery,
  UpdateSlotWindowTemplateInput,
} from "@repo/models";
import { getSlotWindowService } from "../lib";
import type { APIContext } from "../types/api-context";

type SlotWindowTemplateParam = { id: string };
type SlotWindowParam = { id: string };

export class SlotWindowController {
  // Get all slot windows for a user
  static async getAllSlotWindows(
    c: APIContext<{ query: GetAllSlotWindowsQuery }>
  ) {
    try {
      const slotWindowService = getSlotWindowService(c);
      const userId = c.req.query("user_id");

      if (!userId) {
        return c.json({ error: "user_id is required" }, 400);
      }

      const date = c.req.query("date");

      const slotWindows = await slotWindowService.getAllSlotWindowsByUserId(
        userId,
        date
      );

      return c.json({ slotWindows, count: slotWindows.length });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get slot windows";
      return c.json({ error: message }, 500);
    }
  }

  // Get all slot window templates for a user
  static async getAllSlotWindowTemplates(
    c: APIContext<{ query: GetAllSlotWindowTemplatesQuery }>
  ) {
    try {
      const slotWindowService = getSlotWindowService(c);
      const userId = c.req.query("user_id");

      if (!userId) {
        return c.json({ error: "user_id is required" }, 400);
      }

      const templates =
        await slotWindowService.getAllSlotWindowTemplatesByUserId(userId);

      return c.json({ templates, count: templates.length });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to get slot window templates";
      return c.json({ error: message }, 500);
    }
  }

  // Create a recurring appointment template and generate slot windows for upcoming week
  static async createAppointmentSlotWindowTemplate(
    c: APIContext<{ json: CreateSlotWindowTemplateInput }>
  ) {
    try {
      const slotWindowService = getSlotWindowService(c);
      const body = c.req.valid("json") as CreateSlotWindowTemplateInput;

      const template =
        await slotWindowService.createAppointmentSlotWindowTemplate(body);

      // Automatically generate slot windows for the upcoming week
      const generationResult =
        await slotWindowService.createAppointmentSlotWindowForSpecificTemplate(
          template.slot_window_template_id
        );

      return c.json(
        {
          success: true,
          template,
          slotWindowsGenerated: {
            created: generationResult.created,
            skipped: generationResult.skipped,
            errors: generationResult.errors,
          },
        },
        201
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create slot window template";
      return c.json({ error: message }, 400);
    }
  }

  // Generate slot windows for all active templates from all users (cron job endpoint)
  static async createAppointmentSlotWindowForGlobalActiveTemplates(
    c: APIContext
  ) {
    try {
      const slotWindowService = getSlotWindowService(c);

      const result =
        await slotWindowService.createAppointmentSlotWindowForGlobalActiveTemplates();

      return c.json({
        success: true,
        created: result.created,
        skipped: result.skipped,
        errors: result.errors,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate slot windows from templates";
      return c.json({ error: message }, 500);
    }
  }

  // Generate slot windows for a specific template
  static async createAppointmentSlotWindowForSpecificTemplate(
    c: APIContext<{ param: SlotWindowTemplateParam }, "/:id">
  ) {
    try {
      const slotWindowService = getSlotWindowService(c);
      const templateId = c.req.param("id");

      const result =
        await slotWindowService.createAppointmentSlotWindowForSpecificTemplate(
          templateId
        );

      return c.json({
        success: true,
        created: result.created,
        skipped: result.skipped,
        errors: result.errors,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate slot windows from template";
      return c.json({ error: message }, 500);
    }
  }

  // Create a one-off slot window (not recurring)
  static async createAppointmentSlotWindow(
    c: APIContext<{ json: CreateSlotWindowInput }>
  ) {
    try {
      const slotWindowService = getSlotWindowService(c);
      const body = c.req.valid("json") as CreateSlotWindowInput;

      const slotWindow =
        await slotWindowService.createAppointmentSlotWindow(body);

      return c.json({ success: true, slotWindow }, 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create slot window";
      return c.json({ error: message }, 400);
    }
  }

  // Update a template (does not affect existing slot windows)
  static async updateAppointmentSlotWindowTemplate(
    c: APIContext<
      {
        json: UpdateSlotWindowTemplateInput;
        param: SlotWindowTemplateParam;
      },
      "/:id"
    >
  ) {
    try {
      const slotWindowService = getSlotWindowService(c);
      const templateId = c.req.param("id");
      const body = c.req.valid("json") as UpdateSlotWindowTemplateInput;

      const template =
        await slotWindowService.updateAppointmentSlotWindowTemplate(
          templateId,
          body
        );

      return c.json({ success: true, template });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update slot window template";
      const status =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 400;
      return c.json({ error: message }, status);
    }
  }

  // Cancel a slot window and all its appointments
  static async cancelAppointmentSlotWindow(
    c: APIContext<{ param: SlotWindowParam }, "/:id">
  ) {
    try {
      const slotWindowService = getSlotWindowService(c);
      const slotWindowId = c.req.param("id");

      const result =
        await slotWindowService.cancelAppointmentSlotWindow(slotWindowId);

      return c.json({
        success: true,
        slotWindow: result.slotWindow,
        cancelledTasks: result.cancelledTasks,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel slot window";
      const status =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }

  // Soft delete a template
  static async deleteAppointmentSlotWindowTemplate(
    c: APIContext<{ param: SlotWindowTemplateParam }, "/:id">
  ) {
    try {
      const slotWindowService = getSlotWindowService(c);
      const templateId = c.req.param("id");

      const template =
        await slotWindowService.deleteAppointmentSlotWindowTemplate(templateId);

      return c.json({ success: true, template });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete slot window template";
      const status =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }

  // Deactivate a template
  static async deactivateAppointmentSlotWindowTemplate(
    c: APIContext<{ param: SlotWindowTemplateParam }, "/:id">
  ) {
    try {
      const slotWindowService = getSlotWindowService(c);
      const templateId = c.req.param("id");

      const template =
        await slotWindowService.deactivateAppointmentSlotWindowTemplate(
          templateId
        );

      return c.json({ success: true, template });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to deactivate slot window template";
      const status =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }
}
