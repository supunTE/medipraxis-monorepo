import { Hono } from "hono";
import { ClientReportController } from "../controllers";

const clientReports = new Hono()
  .post("/", ClientReportController.createReport)
  .get("/", ClientReportController.getAllReports)
  .get("/:id", ClientReportController.getReportById)
  .get("/:id/file", ClientReportController.getReportFileUrl)
  .delete("/:id", ClientReportController.deleteReport);

export default clientReports;
