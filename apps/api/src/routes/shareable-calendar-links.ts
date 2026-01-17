import { zValidator } from "@hono/zod-validator";
import { getShareableCalendarLinkParamSchema } from "@repo/models";
import { Hono } from "hono";
import { ShareableCalendarLinkController } from "../controllers";

const shareableCalendarLinks = new Hono().get(
  "/:id",
  zValidator("param", getShareableCalendarLinkParamSchema),
  ShareableCalendarLinkController.getShareableCalendarLinkById
);

export default shareableCalendarLinks;
