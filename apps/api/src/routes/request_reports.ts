import { zValidator } from "@hono/zod-validator";
import { createRequestReportInputSchema } from "@repo/models";
import { Hono } from "hono";
import { RequestReportController } from "../controllers";

const requestReports = new Hono()
  .get("/:id", RequestReportController.getRequestReportById)
  .post(
    "/",
    zValidator("json", createRequestReportInputSchema),
    RequestReportController.createRequestReport
  );

export default requestReports;
