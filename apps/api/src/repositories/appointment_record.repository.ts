import type {
  AppointmentRecord,
  CreateAppointmentRecordInput,
  UpdateAppointmentRecordInput,
} from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  APPOINTMENT_RECORD_COL_APPOINTMENT_DATA,
  APPOINTMENT_RECORD_COL_APPOINTMENT_ID,
  APPOINTMENT_RECORD_COL_CLIENT_ID,
  APPOINTMENT_RECORD_COL_CREATED_DATE,
  APPOINTMENT_RECORD_COL_DELETED,
  APPOINTMENT_RECORD_COL_FORM_ID,
  APPOINTMENT_RECORD_COL_ID,
  APPOINTMENT_RECORD_COL_NOTE,
  APPOINTMENT_RECORD_COL_UPDATED_DATE,
  APPOINTMENT_RECORD_COL_USER_ID,
  APPOINTMENT_RECORD_TABLE,
} from "../constants";

export class AppointmentRecordRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async create(
    input: CreateAppointmentRecordInput
  ): Promise<AppointmentRecord> {
    const { data, error } = await this.db
      .from(APPOINTMENT_RECORD_TABLE)
      .insert({
        [APPOINTMENT_RECORD_COL_USER_ID]: input.user_id,
        [APPOINTMENT_RECORD_COL_CLIENT_ID]: input.client_id,
        [APPOINTMENT_RECORD_COL_APPOINTMENT_ID]: input.appointment_id,
        [APPOINTMENT_RECORD_COL_FORM_ID]: input.form_id,
        [APPOINTMENT_RECORD_COL_APPOINTMENT_DATA]:
          input.appointment_data || null,
        [APPOINTMENT_RECORD_COL_NOTE]: input.note || null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to create appointment record");
    }

    return data as AppointmentRecord;
  }

  async findByClientId(clientId: string): Promise<AppointmentRecord[]> {
    const { data, error } = await this.db
      .from(APPOINTMENT_RECORD_TABLE)
      .select("*")
      .eq(APPOINTMENT_RECORD_COL_CLIENT_ID, clientId)
      .eq(APPOINTMENT_RECORD_COL_DELETED, false)
      .order(APPOINTMENT_RECORD_COL_CREATED_DATE, { ascending: false });

    if (error || !data) return [];
    return data as AppointmentRecord[];
  }

  async findByClientIdAndAppointmentId(
    clientId: string,
    appointmentId: string
  ): Promise<AppointmentRecord | null> {
    const { data, error } = await this.db
      .from(APPOINTMENT_RECORD_TABLE)
      .select("*")
      .eq(APPOINTMENT_RECORD_COL_CLIENT_ID, clientId)
      .eq(APPOINTMENT_RECORD_COL_APPOINTMENT_ID, appointmentId)
      .eq(APPOINTMENT_RECORD_COL_DELETED, false)
      .single();

    if (error || !data) return null;
    return data as AppointmentRecord;
  }

  async update(
    recordId: string,
    input: UpdateAppointmentRecordInput
  ): Promise<AppointmentRecord> {
    const { data, error } = await this.db
      .from(APPOINTMENT_RECORD_TABLE)
      .update({
        ...(input.appointment_data !== undefined && {
          [APPOINTMENT_RECORD_COL_APPOINTMENT_DATA]: input.appointment_data,
        }),
        ...(input.note !== undefined && {
          [APPOINTMENT_RECORD_COL_NOTE]: input.note,
        }),
        [APPOINTMENT_RECORD_COL_UPDATED_DATE]: new Date().toISOString(),
      })
      .eq(APPOINTMENT_RECORD_COL_ID, recordId)
      .eq(APPOINTMENT_RECORD_COL_DELETED, false)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update appointment record");
    }

    return data as AppointmentRecord;
  }

  async delete(recordId: string): Promise<void> {
    const { error } = await this.db
      .from(APPOINTMENT_RECORD_TABLE)
      .update({
        [APPOINTMENT_RECORD_COL_DELETED]: true,
        [APPOINTMENT_RECORD_COL_UPDATED_DATE]: new Date().toISOString(),
      })
      .eq(APPOINTMENT_RECORD_COL_ID, recordId)
      .eq(APPOINTMENT_RECORD_COL_DELETED, false);

    if (error) {
      throw new Error(error?.message || "Failed to delete appointment record");
    }
  }
}
