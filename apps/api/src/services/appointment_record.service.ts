import type {
  AppointmentRecord,
  CreateAppointmentRecordInput,
  UpdateAppointmentRecordInput,
} from "@repo/models";
import type { AppointmentRecordRepository } from "../repositories";

export class AppointmentRecordService {
  private appointmentRecordRepository: AppointmentRecordRepository;

  constructor(appointmentRecordRepository: AppointmentRecordRepository) {
    this.appointmentRecordRepository = appointmentRecordRepository;
  }

  async createRecord(
    input: CreateAppointmentRecordInput
  ): Promise<AppointmentRecord> {
    return await this.appointmentRecordRepository.create(input);
  }

  async getByClientId(clientId: string): Promise<AppointmentRecord[]> {
    return await this.appointmentRecordRepository.findByClientId(clientId);
  }

  async getByClientIdAndAppointmentId(
    clientId: string,
    appointmentId: string
  ): Promise<AppointmentRecord> {
    const record =
      await this.appointmentRecordRepository.findByClientIdAndAppointmentId(
        clientId,
        appointmentId
      );
    if (!record) throw new Error("Appointment record not found");
    return record;
  }

  async updateRecord(
    recordId: string,
    input: UpdateAppointmentRecordInput
  ): Promise<AppointmentRecord> {
    return await this.appointmentRecordRepository.update(recordId, input);
  }

  async deleteRecord(recordId: string): Promise<void> {
    await this.appointmentRecordRepository.delete(recordId);
  }
}
