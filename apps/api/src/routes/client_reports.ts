import { zValidator } from "@hono/zod-validator";
import { getPendingReportsParamSchema } from "@repo/models";
import { Hono } from "hono";
import { ClientReportController } from "../controllers";

const clientReports = new Hono()
  .post("/", ClientReportController.createReport)
  .get("/", ClientReportController.getAllReports)
  .get("/grouped", ClientReportController.getAllReportsByUserId)
  .get(
    "/pending/:contact_id",
    zValidator("param", getPendingReportsParamSchema),
    ClientReportController.getPendingReports
  )
  .get("/:id", ClientReportController.getReportById)
  .get("/clientId/:clientId", ClientReportController.getReportsByClientId)
  .get("/:user_id/:id/file", ClientReportController.getReportFileUrl)
  .delete("/:id", ClientReportController.deleteReport);

export default clientReports;
