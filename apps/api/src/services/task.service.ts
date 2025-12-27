import { TaskRepository } from "../repositories";
import type {
  CreateTaskInput,
  Task,
  TaskDetails,
  UpdateTaskInput,
} from "../types";
import { TaskStatus, TaskType } from "../types";

export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

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
}
