import { Hono } from "hono";
import { RequestReportController } from "../controllers";

const requestReports = new Hono().get(
  "/:id",
  RequestReportController.getRequestReportById
);

export default requestReports;
