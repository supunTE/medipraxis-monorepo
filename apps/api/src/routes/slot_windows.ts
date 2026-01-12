import { zValidator } from "@hono/zod-validator";
import {
  createSlotWindowSchema,
  createSlotWindowTemplateSchema,
  getAllTasksQuerySchema,
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
  // Get all slot window templates for a user
  .get(
    "/templates",
    zValidator("query", getAllTasksQuerySchema),
    SlotWindowController.getAllSlotWindowTemplates
  )
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
  // Get all slot windows for a user
  .get(
    "/",
    zValidator("query", getAllTasksQuerySchema),
    SlotWindowController.getAllSlotWindows
  )
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
