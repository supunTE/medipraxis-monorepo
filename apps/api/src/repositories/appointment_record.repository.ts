import type {
  AppointmentRecord,
  CreateAppointmentRecordInput,
  UpdateAppointmentRecordInput,
} from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export class AppointmentRecordRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async create(
    input: CreateAppointmentRecordInput
  ): Promise<AppointmentRecord> {
    const { data, error } = await this.db
      .from("appointment_record")
      .insert({
        user_id: input.user_id,
        client_id: input.client_id,
        appointment_id: input.appointment_id,
        form_id: input.form_id,
        appointment_data: input.appointment_data || null,
        note: input.note || null,
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
      .from("appointment_record")
      .select("*")
      .eq("client_id", clientId)
      .eq("deleted", false)
      .order("created_date", { ascending: false });

    if (error || !data) return [];
    return data as AppointmentRecord[];
  }

  async findByClientIdAndAppointmentId(
    clientId: string,
    appointmentId: string
  ): Promise<AppointmentRecord | null> {
    const { data, error } = await this.db
      .from("appointment_record")
      .select("*")
      .eq("client_id", clientId)
      .eq("appointment_id", appointmentId)
      .eq("deleted", false)
      .single();

    if (error || !data) return null;
    return data as AppointmentRecord;
  }

  async update(
    recordId: string,
    input: UpdateAppointmentRecordInput
  ): Promise<AppointmentRecord> {
    const { data, error } = await this.db
      .from("appointment_record")
      .update({
        ...(input.appointment_data !== undefined && {
          appointment_data: input.appointment_data,
        }),
        ...(input.note !== undefined && { note: input.note }),
        updated_date: new Date().toISOString(),
      })
      .eq("appointment_record_id", recordId)
      .eq("deleted", false)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update appointment record");
    }

    return data as AppointmentRecord;
  }
}
