import { zValidator } from "@hono/zod-validator";
import {
  createAppointmentRecordSchema,
  getAppointmentRecordParamSchema,
  getAppointmentRecordQuerySchema,
  updateAppointmentRecordSchema,
} from "@repo/models";
import { Hono } from "hono";
import { AppointmentRecordController } from "../controllers";

const appointmentRecords = new Hono()
  .post(
    "/",
    zValidator("json", createAppointmentRecordSchema),
    AppointmentRecordController.create
  )
  .get(
    "/",
    zValidator("query", getAppointmentRecordQuerySchema),
    AppointmentRecordController.getByClientId
  )
  .patch(
    "/:id",
    zValidator("param", getAppointmentRecordParamSchema),
    zValidator("json", updateAppointmentRecordSchema),
    AppointmentRecordController.update
  )
  .delete(
    "/:id",
    zValidator("param", getAppointmentRecordParamSchema),
    AppointmentRecordController.delete
  );

export default appointmentRecords;
