import { zValidator } from "@hono/zod-validator";
import {
  getClientAppointmentsByLinkQuerySchema,
  getShareableCalendarLinkByUserIdParamSchema,
  getShareableCalendarLinkParamSchema,
} from "@repo/models";
import { Hono } from "hono";
import { ShareableCalendarLinkController } from "../controllers";

const shareableCalendarLinks = new Hono()
  .get(
    "/user/:userId",
    zValidator("param", getShareableCalendarLinkByUserIdParamSchema),
    ShareableCalendarLinkController.getShareableCalendarLinkByUserId
  )
  .get(
    "/:id",
    zValidator("param", getShareableCalendarLinkParamSchema),
    zValidator("query", getClientAppointmentsByLinkQuerySchema),
    ShareableCalendarLinkController.getShareableCalendarLinkById
  );

export default shareableCalendarLinks;
