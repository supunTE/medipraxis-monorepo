import { zValidator } from "@hono/zod-validator";
import {
  getClientAppointmentsByLinkQuerySchema,
  getShareableCalendarLinkParamSchema,
} from "@repo/models";
import { Hono } from "hono";
import { ShareableCalendarLinkController } from "../controllers";

const shareableCalendarLinks = new Hono().get(
  "/:id",
  zValidator("param", getShareableCalendarLinkParamSchema),
  zValidator("query", getClientAppointmentsByLinkQuerySchema),
  ShareableCalendarLinkController.getShareableCalendarLinkById
);

export default shareableCalendarLinks;
