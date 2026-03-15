import type {
  CreateAppointmentRecordInput,
  GetAppointmentRecordParam,
  GetAppointmentRecordQuery,
  UpdateAppointmentRecordInput,
} from "@repo/models";
import { getAppointmentRecordService } from "../lib";
import type { APIContext } from "../types/api-context";

export class AppointmentRecordController {
  static async create(c: APIContext<{ json: CreateAppointmentRecordInput }>) {
    try {
      const service = getAppointmentRecordService(c);
      const body = c.req.valid("json") as CreateAppointmentRecordInput;

      const record = await service.createRecord(body);

      return c.json({ success: true, record }, 201);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create appointment record";
      return c.json({ error: message }, 400);
    }
  }

  static async getByClientId(
    c: APIContext<{ query: GetAppointmentRecordQuery }>
  ) {
    try {
      const service = getAppointmentRecordService(c);
      const clientId = c.req.query("client_id") as string;
      const appointmentId = c.req.query("appointment_id");

      if (appointmentId) {
        const record = await service.getByClientIdAndAppointmentId(
          clientId,
          appointmentId
        );
        return c.json({ record });
      }

      const records = await service.getByClientId(clientId);
      return c.json({ records, count: records.length });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to get appointment record";
      const status =
        error instanceof Error &&
        error.message === "Appointment record not found"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }
  static async update(
    c: APIContext<
      { json: UpdateAppointmentRecordInput; param: GetAppointmentRecordParam },
      "/:id"
    >
  ) {
    try {
      const service = getAppointmentRecordService(c);
      const recordId = c.req.param("id");
      const body = c.req.valid("json") as UpdateAppointmentRecordInput;

      const record = await service.updateRecord(recordId, body);

      return c.json({ success: true, record });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update appointment record";
      return c.json({ error: message }, 400);
    }
  }

  static async delete(
    c: APIContext<{ param: GetAppointmentRecordParam }, "/:id">
  ) {
    try {
      const service = getAppointmentRecordService(c);
      const recordId = c.req.param("id");

      await service.deleteRecord(recordId);

      return c.json({ success: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete appointment record";
      return c.json({ error: message }, 400);
    }
  }
}
