import type {
  CreateTaskInput,
  Task,
  TaskDetails,
  UpdateTaskInput,
} from "@repo/models";
import { TaskStatus, TaskType } from "@repo/models";
import { type TaskRepository } from "../repositories";

export class TaskService {
  private taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  async getAllTasks(userId?: string): Promise<TaskDetails[]> {
    return await this.taskRepository.findAll(userId);
  }

  async getTaskById(taskId: string): Promise<TaskDetails> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    return task;
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    if (!input.start_date) {
      input.start_date = new Date().toISOString();
    }

    if (!input.task_type_id) {
      const reminderTypeId = await this.taskRepository.getTaskTypeByName(
        TaskType.REMINDER
      );

      if (!reminderTypeId) {
        throw new Error('Default task type "REMINDER" not found in database');
      }

      input.task_type_id = reminderTypeId;
    }

    const appointmentTypeId = await this.taskRepository.getTaskTypeByName(
      TaskType.APPOINTMENT
    );

    if (!appointmentTypeId) {
      throw new Error('Default task type "APPOINTMENT" not found in database');
    }

    if (input.task_type_id == appointmentTypeId) {
      const appointmentDate = input.start_date;

      const count = await this.taskRepository.getAppointmentCountForDate(
        input.user_id,
        appointmentDate
      );

      const appointmentNumber = count + 1;

      input = {
        ...input,
        appointment_number: appointmentNumber,
        task_type_id: appointmentTypeId,
      };
    }

    if (!input.task_status_id) {
      const notStartedStatusId = await this.taskRepository.getTaskStatusByName(
        TaskStatus.NOT_STARTED
      );

      if (!notStartedStatusId) {
        throw new Error(
          'Default task status "NOT_STARTED" not found in database'
        );
      }

      input.task_status_id = notStartedStatusId;
    }

    return await this.taskRepository.create(input);
  }

  async updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
    const updatedTask = await this.taskRepository.update(taskId, input);

    if (!updatedTask) {
      throw new Error("Task not found or could not be updated");
    }

    return updatedTask;
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    // Get the status ID by status name
    const statusId = await this.taskRepository.getTaskStatusByName(status);

    if (!statusId) {
      throw new Error(`Task status "${status}" not found in database`);
    }

    // Update the task with the new status
    const updatedTask = await this.taskRepository.update(taskId, {
      task_status_id: statusId,
    });

    if (!updatedTask) {
      throw new Error("Task not found or could not be updated");
    }

    return updatedTask;
  }

  async isTaskCancelled(taskId: string): Promise<boolean> {
    const task = await this.getTaskById(taskId);
    const cancelledStatusId = await this.taskRepository.getTaskStatusByName(
      TaskStatus.CANCELLED
    );

    return task.task_status_id === cancelledStatusId;
  }

  // Check if client already has an appointment in the slot window
  async hasExistingAppointmentInSlotWindow(
    clientId: string,
    slotWindowId: string
  ): Promise<boolean> {
    // Get appointment type ID
    const appointmentTypeId = await this.taskRepository.getTaskTypeByName(
      TaskType.APPOINTMENT
    );

    if (!appointmentTypeId) {
      throw new Error('Task type "APPOINTMENT" not found in database');
    }

    // Get cancelled status ID to exclude cancelled appointments
    const cancelledStatusId = await this.taskRepository.getTaskStatusByName(
      TaskStatus.CANCELLED
    );

    // Find appointments for this client in this slot window
    const existingTasks = await this.taskRepository.findByClientId(clientId, {
      taskTypeId: appointmentTypeId,
      slotWindowId: slotWindowId,
    });

    // Filter out cancelled appointments
    const activeAppointments = existingTasks.filter(
      (task) => task.task_status_id !== cancelledStatusId
    );

    return activeAppointments.length > 0;
  }

  // Calculate slot time range based on slot window and position
  private calculateSlotTimeRange(
    slotWindowStartDate: string,
    slotWindowEndDate: string,
    totalSlots: number,
    position: number
  ): { start_date: string; end_date: string } {
    const startDate = new Date(slotWindowStartDate);
    const endDate = new Date(slotWindowEndDate);

    // Calculate total duration in milliseconds
    const totalDuration = endDate.getTime() - startDate.getTime();

    // Calculate duration per slot
    const slotDuration = totalDuration / totalSlots;

    // Calculate this slot's start and end times (position is 1-indexed)
    const slotStartTime = startDate.getTime() + (position - 1) * slotDuration;
    const slotEndTime = slotStartTime + slotDuration;

    return {
      start_date: new Date(slotStartTime).toISOString(),
      end_date: new Date(slotEndTime).toISOString(),
    };
  }

  // Reserve an appointment from a slot window
  async reserveAppointmentFromSlotWindow(
    slotWindowId: string,
    slotWindowStartDate: string,
    slotWindowEndDate: string,
    totalSlots: number,
    position: number,
    userId: string,
    clientId: string
  ): Promise<Task> {
    // Calculate the specific time slot for this appointment
    const { start_date, end_date } = this.calculateSlotTimeRange(
      slotWindowStartDate,
      slotWindowEndDate,
      totalSlots,
      position
    );

    // Get appointment type ID
    const appointmentTypeId = await this.taskRepository.getTaskTypeByName(
      TaskType.APPOINTMENT
    );

    if (!appointmentTypeId) {
      throw new Error('Task type "APPOINTMENT" not found in database');
    }

    // Get NOT_STARTED status ID
    const notStartedStatusId = await this.taskRepository.getTaskStatusByName(
      TaskStatus.NOT_STARTED
    );

    if (!notStartedStatusId) {
      throw new Error('Task status "NOT_STARTED" not found in database');
    }

    // Create the appointment task
    const task = await this.taskRepository.create({
      task_title: "Appointment",
      task_type_id: appointmentTypeId,
      task_status_id: notStartedStatusId,
      user_id: userId,
      client_id: clientId,
      start_date,
      end_date,
      slot_window_id: slotWindowId,
      appointment_number: position,
      set_alarm: false,
      created_by: "CLIENT",
    });

    return task;
  }
}
