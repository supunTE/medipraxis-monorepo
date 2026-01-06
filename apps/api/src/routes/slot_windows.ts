import { zValidator } from "@hono/zod-validator";
import {
  createSlotWindowSchema,
  createSlotWindowTemplateSchema,
  updateSlotWindowTemplateSchema,
} from "@repo/models";
import { Hono } from "hono";
import { z } from "zod";
import { SlotWindowController } from "../controllers";

const getSlotWindowTemplateParamSchema = z.object({
  id: z.string(),
});

const getSlotWindowParamSchema = z.object({
  id: z.string(),
});

const slotWindows = new Hono()
  // == Template management routes == //
  // Create slot window template (recurring)
  .post(
    "/templates",
    zValidator("json", createSlotWindowTemplateSchema),
    SlotWindowController.createAppointmentSlotWindowTemplate
  )
  // Update slot window template
  .put(
    "/templates/:id",
    zValidator("param", getSlotWindowTemplateParamSchema),
    zValidator("json", updateSlotWindowTemplateSchema),
    SlotWindowController.updateAppointmentSlotWindowTemplate
  )
  // Delete slot window template
  .delete(
    "/templates/:id",
    zValidator("param", getSlotWindowTemplateParamSchema),
    SlotWindowController.deleteAppointmentSlotWindowTemplate
  )
  .post(
    "/templates/:id/deactivate",
    zValidator("param", getSlotWindowTemplateParamSchema),
    SlotWindowController.deactivateAppointmentSlotWindowTemplate
  )
  // == Slot window routes == //
  // Create slot window (non-recurring)
  .post(
    "/",
    zValidator("json", createSlotWindowSchema),
    SlotWindowController.createAppointmentSlotWindow
  )
  // Cron job route - generate for all active templates
  .post(
    "/generate-from-global-templates",
    SlotWindowController.createAppointmentSlotWindowForGlobalActiveTemplates
  )
  // Generate slot windows from specific template
  .post(
    "/templates/:id/generate",
    zValidator("param", getSlotWindowTemplateParamSchema),
    SlotWindowController.createAppointmentSlotWindowForSpecificTemplate
  )
  // Cancel a specific slot window
  .post(
    "/:id/cancel",
    zValidator("param", getSlotWindowParamSchema),
    SlotWindowController.cancelAppointmentSlotWindow
  );

export default slotWindows;
