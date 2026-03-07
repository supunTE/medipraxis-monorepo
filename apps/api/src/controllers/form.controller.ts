import type { CreateFormInput, GetFormParam, GetFormQuery } from "@repo/models";
import { getFormService } from "../lib";
import type { APIContext } from "../types/api-context";

export class FormController {
  static async saveForm(c: APIContext<{ json: CreateFormInput }>) {
    try {
      const formService = getFormService(c);
      const body = c.req.valid("json") as CreateFormInput;

      const form = await formService.saveForm(body);

      return c.json({ success: true, form }, 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save form";
      return c.json({ error: message }, 400);
    }
  }

  static async getFormsByUserId(c: APIContext<{ query: GetFormQuery }>) {
    try {
      const formService = getFormService(c);
      const userId = c.req.query("user_id") as string;
      const formType = c.req.query("form_type");

      const forms = await formService.getFormsByUserId(userId, formType);

      return c.json({ forms, count: forms.length });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get forms";
      return c.json({ error: message }, 500);
    }
  }

  static async getFormById(c: APIContext<{ param: GetFormParam }, "/:id">) {
    try {
      const formService = getFormService(c);
      const formId = c.req.param("id");

      const form = await formService.getFormById(formId);

      return c.json({ form });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get form";
      const status =
        error instanceof Error && error.message === "Form not found"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }

  static async getActiveForm(c: APIContext<{ query: GetFormQuery }>) {
    try {
      const formService = getFormService(c);
      const userId = c.req.query("user_id") as string;
      const formType = c.req.query("form_type") as string;

      if (!formType) {
        return c.json({ error: "form_type is required" }, 400);
      }

      const form = await formService.getActiveForm(userId, formType);
      return c.json({ form });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get active form";
      const status =
        error instanceof Error && error.message === "No active form found"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }
}
