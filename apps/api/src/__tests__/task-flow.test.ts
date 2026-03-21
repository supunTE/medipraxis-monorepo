import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type {
  CreateTaskInput,
  Task,
  TaskDetails,
  UpdateTaskInput,
} from "@repo/models";
import { TaskType } from "@repo/models";
import { TaskController } from "../controllers/task.controller";
import { getSlotWindowService, getTaskService } from "../lib";
import type { APIContext } from "../types/api-context";
import { TaskService } from "../services/task.service";
import { TaskRepository } from "../repositories/task.repository";
import type { SupabaseClient } from "@supabase/supabase-js";

jest.mock("../lib", () => ({
  getTaskService: jest.fn(),
  getSlotWindowService: jest.fn(),
}));

type TaskControllerService = Pick<
  TaskService,
  "getAllTasks" | "createTask" | "updateTask" | "getTaskById"
>;

type ApiInputShape = Partial<{
  json: any;
  form: any;
  query: any;
  param: any;
  header: any;
  cookie: any;
}>;

type MockTaskContext = {
  req: {
    valid: jest.MockedFunction<(target: string) => unknown>;
    query: jest.MockedFunction<(key: string) => string | undefined>;
    param: jest.MockedFunction<(key: string) => string>;
  };
  json: jest.Mock;
};

const buildMockContext = (): MockTaskContext => ({
  req: {
    valid: jest.fn() as jest.MockedFunction<(target: string) => unknown>,
    query: jest.fn() as jest.MockedFunction<
      (key: string) => string | undefined
    >,
    param: jest.fn() as jest.MockedFunction<(key: string) => string>,
  },
  json: jest.fn(),
});

const toApiContext = <I extends ApiInputShape, P extends string = "/">(
  context: MockTaskContext
): APIContext<I, P> => context as unknown as APIContext<I, P>;

describe("Task flow", () => {
  let mockTaskService: jest.Mocked<TaskControllerService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTaskService = {
      getAllTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      getTaskById: jest.fn(),
    };

    (getTaskService as jest.Mock).mockReturnValue(mockTaskService);
    (getSlotWindowService as jest.Mock).mockReturnValue({});
  });

  it("creates a task through the controller", async () => {
    const sendPayload: CreateTaskInput = {
      user_id: "user-1",
      task_title: "Touch base",
      end_date: "2026-03-21T00:00:00Z",
    };
    const savedTask: Task = {
      task_id: "task-1",
      task_title: "Touch base",
      task_type_id: "reminder",
      task_status_id: "not-started",
      client_id: null,
      user_id: "user-1",
      start_date: "2026-03-21T00:00:00Z",
      end_date: "2026-03-21T01:00:00Z",
      deleted_date: null,
      created_date: "2026-03-21T00:00:00Z",
      modified_date: null,
      note: null,
      set_alarm: false,
      appointment_number: null,
      slot_window_id: null,
      created_by: "CLIENT",
    };

    const context = buildMockContext();
    context.req.valid.mockReturnValue(sendPayload);
    mockTaskService.createTask.mockResolvedValue(savedTask);

    await TaskController.createTask(toApiContext(context));

    expect(mockTaskService.createTask).toHaveBeenCalledWith(sendPayload);
    expect(context.json).toHaveBeenCalledWith(
      { success: true, task: savedTask },
      201
    );
  });

  it("returns tasks with a count", async () => {
    const taskList: TaskDetails[] = [
      {
        task_id: "task-1",
        task_title: "Follow up",
        task_type_id: "reminder",
        task_status_id: "in-progress",
        client_id: null,
        user_id: "user-1",
        start_date: "2026-03-21T00:00:00Z",
        end_date: "2026-03-21T01:00:00Z",
        deleted_date: null,
        created_date: "2026-03-21T00:00:00Z",
        modified_date: null,
        note: null,
        set_alarm: false,
        appointment_number: null,
        slot_window_id: null,
        created_by: "CLIENT",
        task_type_name: "REMINDER",
        task_status_name: "IN_PROGRESS",
        client_first_name: null,
        client_last_name: null,
      },
    ];
    mockTaskService.getAllTasks.mockResolvedValue(taskList);
    const context = buildMockContext();
    context.req.query.mockImplementation((key: string) =>
      key === "user_id" ? "user-1" : undefined
    );

    await TaskController.getAllTasksByUserId(toApiContext(context));

    expect(mockTaskService.getAllTasks).toHaveBeenCalledWith(
      "user-1",
      undefined,
      undefined,
      undefined,
      undefined
    );
    expect(context.json).toHaveBeenCalledWith({
      tasks: taskList,
      count: taskList.length,
    });
  });

  it("updates a task", async () => {
    const updatePayload: UpdateTaskInput = {
      task_title: "Updated title",
    };
    const context = buildMockContext();
    context.req.param.mockReturnValue("task-1");
    context.req.valid.mockReturnValue(updatePayload);
    const updatedTask: Task = {
      task_id: "task-1",
      task_title: "Updated title",
      task_type_id: "reminder",
      task_status_id: "in-progress",
      client_id: null,
      user_id: "user-1",
      start_date: "2026-03-21T00:00:00Z",
      end_date: "2026-03-21T01:00:00Z",
      deleted_date: null,
      created_date: "2026-03-20T00:00:00Z",
      modified_date: null,
      note: null,
      set_alarm: false,
      appointment_number: null,
      slot_window_id: null,
      created_by: "CLIENT",
    };
    mockTaskService.updateTask.mockResolvedValue(updatedTask);

    await TaskController.updateTask(
      toApiContext<{ json: UpdateTaskInput; param: { id: string } }, "/:id">(
        context
      )
    );

    expect(mockTaskService.updateTask).toHaveBeenCalledWith(
      "task-1",
      updatePayload
    );
    expect(context.json).toHaveBeenCalledWith({
      success: true,
      task: updatedTask,
    });
  });

  it("returns 404 when a task cannot be found", async () => {
    mockTaskService.getTaskById.mockRejectedValue(new Error("Task not found"));
    const context = buildMockContext();
    context.req.param.mockReturnValue("missing-task");

    await TaskController.getTaskById(
      toApiContext<{ param: { id: string } }, "/:id">(context)
    );

    expect(context.json).toHaveBeenCalledWith({ error: "Task not found" }, 404);
  });

  type RepositorySubset = Pick<
    TaskRepository,
    | "getTaskTypeByName"
    | "getTaskStatusByName"
    | "create"
    | "update"
    | "getAppointmentCountForDate"
  >;

  let repositoryMock: jest.Mocked<RepositorySubset>;

  beforeEach(() => {
    jest.clearAllMocks();

    repositoryMock = {
      getTaskTypeByName: jest.fn(),
      getTaskStatusByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      getAppointmentCountForDate: jest.fn(),
    };
  });

  it("fills defaults when creating a reminder task", async () => {
    const reminderTypeId = "type-reminder";
    const appointmentTypeId = "type-appointment";
    const notStartedStatusId = "status-not-started";

    repositoryMock.getTaskTypeByName.mockImplementation(async (type) => {
      if (type === TaskType.REMINDER) return reminderTypeId;
      if (type === TaskType.APPOINTMENT) return appointmentTypeId;
      return null;
    });
    repositoryMock.getTaskStatusByName.mockResolvedValue(notStartedStatusId);
    const createdTask: Task = {
      task_id: "task-1",
      task_title: "Follow up",
      task_type_id: reminderTypeId,
      task_status_id: notStartedStatusId,
      client_id: null,
      user_id: "user-1",
      start_date: "2026-03-21T00:00:00Z",
      end_date: "2026-03-21T01:00:00Z",
      deleted_date: null,
      created_date: "2026-03-21T00:00:00Z",
      modified_date: null,
      note: null,
      set_alarm: false,
      appointment_number: null,
      slot_window_id: null,
      created_by: "CLIENT",
    };
    repositoryMock.create.mockResolvedValue(createdTask);

    const service = new TaskService(
      repositoryMock as unknown as TaskRepository
    );

    const result = await service.createTask({
      user_id: "user-1",
      task_title: "Follow up",
      end_date: "2026-03-21T00:00:00Z",
    });

    expect(repositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        task_title: "Follow up",
        task_type_id: reminderTypeId,
        task_status_id: notStartedStatusId,
      })
    );
    expect(result).toEqual(createdTask);
  });

  it("fails when the requested task type cannot be resolved during update", async () => {
    repositoryMock.getTaskTypeByName.mockResolvedValue(null);

    const service = new TaskService(
      repositoryMock as unknown as TaskRepository
    );

    await expect(
      service.updateTask("task-1", { task_type: TaskType.APPOINTMENT })
    ).rejects.toThrow('Task type "APPOINTMENT" not found in database');
  });

  it("returns deleted ids when rows exist", async () => {
    const selectMock = jest.fn(async () => ({
      data: [{ task_id: "task-1" }],
      error: null,
    })) as jest.MockedFunction<
      (key: string) => Promise<{ data: { task_id: string }[]; error: null }>
    >;
    const inMock = jest.fn().mockReturnValue({ select: selectMock });
    const deleteMock = jest.fn().mockReturnValue({ in: inMock });
    const fromMock = jest.fn().mockReturnValue({ delete: deleteMock });

    const fakeDb = { from: fromMock } as unknown as SupabaseClient;

    const repository = new TaskRepository(fakeDb);
    const deleted = await repository.deleteByIds(["task-1"]);

    expect(deleted).toEqual(["task-1"]);
    expect(fromMock).toHaveBeenCalledWith("task");
    expect(inMock).toHaveBeenCalledWith("task_id", ["task-1"]);
    expect(selectMock).toHaveBeenCalledWith("task_id");
  });
});
