import { zValidator } from "@hono/zod-validator";
import {
  createShareableCalendarLinkBodySchema,
  getClientAppointmentsByLinkQuerySchema,
  getShareableCalendarLinkByUserIdParamSchema,
  getShareableCalendarLinkParamSchema,
} from "@repo/models";
import { Hono } from "hono";
import { ShareableCalendarLinkController } from "../controllers";

const shareableCalendarLinks = new Hono()
  .put(
    "/",
    zValidator("json", createShareableCalendarLinkBodySchema),
    ShareableCalendarLinkController.createOrUpdateShareableCalendarLink
  )
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
