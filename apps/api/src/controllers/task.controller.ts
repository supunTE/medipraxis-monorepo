import type {
  CancelAppointmentByClientInput,
  CreateTaskInput,
  GetAllTaskQuery,
  GetAppointmentsByClientQuery,
  GetTaskParam,
  ReserveAppointmentByClientInput,
  TaskType,
  UpdateTaskInput,
} from "@repo/models";
import { TaskStatus } from "@repo/models";
import { getSlotWindowService, getTaskService } from "../lib";
import type { APIContext } from "../types/api-context";

export class TaskController {
  static async getAllTasksByUserId(c: APIContext<{ query: GetAllTaskQuery }>) {
    try {
      const taskService = getTaskService(c);
      const userId = c.req.query("user_id") as string;
      const taskType = c.req.query("task_type") as
        | keyof typeof TaskType
        | undefined;
      const taskStatus = c.req.query("task_status") as
        | keyof typeof TaskStatus
        | undefined;
      const slotWindowId = c.req.query("slot_window_id");

      const tasks = await taskService.getAllTasks(
        userId,
        taskType,
        taskStatus,
        slotWindowId
      );

      return c.json({ tasks, count: tasks.length });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get tasks";
      return c.json({ error: message }, 500);
    }
  }

  static async getAppointmentsByClientId(
    c: APIContext<{ query: GetAppointmentsByClientQuery }>
  ) {
    try {
      const taskService = getTaskService(c);
      const clientId = c.req.query("client_id") as string;
      const taskStatus = c.req.query("task_status") as
        | keyof typeof TaskStatus
        | undefined;
      const slotWindowId = c.req.query("slot_window_id");

      const appointments = await taskService.getAppointmentsByClientId(
        clientId,
        taskStatus,
        slotWindowId
      );

      return c.json({ appointments, count: appointments.length });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to get client appointments";
      return c.json({ error: message }, 500);
    }
  }

  static async getTaskById(c: APIContext<{ param: GetTaskParam }, "/:id">) {
    try {
      const taskService = getTaskService(c);
      const taskId = c.req.param("id");

      const task = await taskService.getTaskById(taskId);

      return c.json({ task });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get task";
      const status =
        error instanceof Error && error.message === "Task not found"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }

  static async createTask(c: APIContext<{ json: CreateTaskInput }>) {
    try {
      const taskService = getTaskService(c);
      const body = c.req.valid("json") as CreateTaskInput;

      const task = await taskService.createTask(body);

      return c.json({ success: true, task }, 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create task";
      return c.json({ error: message }, 400);
    }
  }

  static async updateTask(
    c: APIContext<{ json: UpdateTaskInput; param: GetTaskParam }, "/:id">
  ) {
    try {
      const taskService = getTaskService(c);
      const taskId = c.req.param("id");
      const body = c.req.valid("json") as UpdateTaskInput;

      const task = await taskService.updateTask(taskId, body);

      return c.json({ success: true, task });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update task";
      const status =
        error instanceof Error &&
        error.message === "Task not found or could not be updated"
          ? 404
          : 400;
      return c.json({ error: message }, status);
    }
  }

  // Reserve an appointment from a slot window (creates appointment task)
  static async reserveAppointmentByClient(
    c: APIContext<{ json: ReserveAppointmentByClientInput }>
  ) {
    try {
      const slotWindowService = getSlotWindowService(c);
      const taskService = getTaskService(c);
      const body = c.req.valid("json") as ReserveAppointmentByClientInput;

      // Check if client is in cooldown period
      const cooldownCheck = await taskService.isClientInCooldown(
        body.client_id
      );

      if (cooldownCheck.inCooldown) {
        return c.json(
          {
            error: `Please wait ${cooldownCheck.remainingMinutes} more minute(s) before reserving another appointment`,
          },
          429
        );
      }

      // Check if client already has an appointment in this slot window
      const hasExisting = await taskService.hasExistingAppointmentInSlotWindow(
        body.client_id,
        body.slot_window_id
      );

      if (hasExisting) {
        return c.json(
          { error: "Client already has an appointment in this slot window" },
          409
        );
      }

      // Get slot window details
      const slotWindow = await slotWindowService.getSlotWindowById(
        body.slot_window_id
      );

      // Reserve a slot and get position
      const position = await slotWindowService.reserveSlotFromSlotWindow(
        body.slot_window_id
      );

      // Create appointment task with calculated time slot
      const task = await taskService.reserveAppointmentFromSlotWindow(
        body.slot_window_id,
        slotWindow.start_date,
        slotWindow.end_date,
        slotWindow.total_slots,
        position,
        slotWindow.user_id,
        body.client_id
      );

      return c.json(
        {
          success: true,
          task,
          position,
          message: "Appointment reserved successfully",
        },
        201
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to reserve appointment";
      const status =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : error instanceof Error && error.message.includes("No available")
            ? 409
            : 500;
      return c.json({ error: message }, status);
    }
  }

  // Cancel an appointment (changes status to CANCELLED and releases slot)
  static async cancelAppointmentByClient(
    c: APIContext<{ json: CancelAppointmentByClientInput }>
  ) {
    try {
      const slotWindowService = getSlotWindowService(c);
      const taskService = getTaskService(c);
      const body = c.req.valid("json") as CancelAppointmentByClientInput;

      // Get task details
      const task = await taskService.getTaskById(body.task_id);

      if (!task.slot_window_id || task.appointment_number === null) {
        throw new Error("Task is not an appointment");
      }

      // Check if appointment is already cancelled
      const isCancelled = await taskService.isTaskCancelled(body.task_id);
      if (isCancelled) {
        return c.json({ error: "Appointment is already cancelled" }, 400);
      }

      // Release the slot back to slot window
      await slotWindowService.releaseSlotToSlotWindow(
        task.slot_window_id,
        task.appointment_number
      );

      // Update task status to CANCELLED
      await taskService.updateTaskStatus(body.task_id, TaskStatus.CANCELLED);

      return c.json({
        success: true,
        task_id: body.task_id,
        message: "Appointment cancelled successfully",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel appointment";
      const status =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : error instanceof Error &&
              error.message.includes("not an appointment")
            ? 400
            : error instanceof Error &&
                error.message.includes("already cancelled")
              ? 400
              : 500;
      return c.json({ error: message }, status);
    }
  }
}
