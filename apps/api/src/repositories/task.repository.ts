import type {
  CreateTaskInput,
  Task,
  TaskDetails,
  UpdateTaskInput,
} from "@repo/models";
import { TaskType, type TaskStatus } from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export const TASK_QUERIES = {
  TASK_STATUS_ID: "task_status_id",
  TASK_TYPE_ID: "task_type_id",
  FIND_ALL: `
    *,
    task_type:task_type_id (task_type_name),
    task_status:task_status_id (task_status_name),
    client:client_id (first_name, last_name)
  `,
  FIND_BY_ID: `
    *,
    task_type:task_type_id (task_type_name),
    task_status:task_status_id (task_status_name),
    client:client_id (first_name, last_name)
  `,
} as const;

export class TaskRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async getTaskStatusByName(statusName: TaskStatus): Promise<string | null> {
    const { data, error } = await this.db
      .from("task_status")
      .select(TASK_QUERIES.TASK_STATUS_ID)
      .eq("task_status_name", statusName)
      .single();

    if (error || !data) {
      return null;
    }

    return data.task_status_id;
  }

  async getTaskTypeByName(typeName: TaskType): Promise<string | null> {
    const { data, error } = await this.db
      .from("task_type")
      .select(TASK_QUERIES.TASK_TYPE_ID)
      .eq("task_type_name", typeName)
      .single();

    if (error || !data) {
      return null;
    }

    return data.task_type_id;
  }

  async findAll(userId?: string): Promise<TaskDetails[]> {
    let query = this.db
      .from("task")
      .select(TASK_QUERIES.FIND_ALL)
      .is("deleted_date", null)
      .order("created_date", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map((item) => {
      const { task_type, task_status, client, ...taskData } = item;
      return {
        ...taskData,
        task_type_name: task_type?.task_type_name || "",
        task_status_name: task_status?.task_status_name || "",
        client_first_name: client?.first_name || null,
        client_last_name: client?.last_name || null,
      } as TaskDetails;
    });
  }

  async findById(taskId: string): Promise<TaskDetails | null> {
    const { data, error } = await this.db
      .from("task")
      .select(TASK_QUERIES.FIND_BY_ID)
      .eq("task_id", taskId)
      .is("deleted_date", null)
      .single();

    if (error || !data) {
      return null;
    }

    const { task_type, task_status, client, ...taskData } = data;

    return {
      ...taskData,
      task_type_name: task_type?.task_type_name || "",
      task_status_name: task_status?.task_status_name || "",
      client_first_name: client?.first_name || null,
      client_last_name: client?.last_name || null,
    } as TaskDetails;
  }

  async create(taskData: CreateTaskInput): Promise<Task> {
    const data = {
      task_title: taskData.task_title,
      task_type_id: taskData.task_type_id,
      task_status_id: taskData.task_status_id,
      user_id: taskData.user_id,
      client_id: taskData.client_id || null,
      start_date: taskData.start_date || null,
      end_date: taskData.end_date || null,
      note: taskData.note || null,
      set_alarm: taskData.set_alarm || false,
      modified_date: new Date().toISOString(),
      //appointment
      appointment_number: taskData?.appointment_number,
      // slot window reference
      slot_window_id: taskData.slot_window_id || null,
      created_by: taskData.created_by || "CLIENT",
    };

    const { data: task, error } = await this.db
      .from("task")
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return task as Task;
  }

  async update(
    taskId: string,
    taskData: UpdateTaskInput
  ): Promise<Task | null> {
    const updateData: any = {
      ...taskData,
      modified_date: new Date().toISOString(),
    };

    const { data, error } = await this.db
      .from("task")
      .update(updateData)
      .eq("task_id", taskId)
      .is("deleted_date", null)
      .select()
      .single();

    if (error || !data) {
      return null;
    }

    return data as Task;
  }

  async getAppointmentCountForDate(
    practitionerId: string,
    date: string
  ): Promise<number> {
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const taskType = await this.getTaskTypeByName(TaskType.APPOINTMENT);
    const { count, error } = await this.db
      .from("task")
      .select("*", { count: "exact", head: true })
      .eq("user_id", practitionerId)
      .eq("task_type_id", taskType)
      .gte("start_date", startOfDay)
      .lte("start_date", endOfDay);

    if (error) {
      throw new Error(
        error.message ?? "Failed to generate appointment sequence"
      );
    }

    return count ?? 0;
  }

  async findBySlotWindowId(slotWindowId: string): Promise<Task[]> {
    const { data, error } = await this.db
      .from("task")
      .select("*")
      .eq("slot_window_id", slotWindowId)
      .is("deleted_date", null);

    if (error) {
      console.error("Error fetching tasks by slot window ID:", error);
      throw new Error("Failed to fetch tasks for the given slot window ID");
    }

    if (!data) {
      throw new Error("No tasks found for the given slot window ID");
    }

    return data as Task[];
  }

  async softDelete(taskId: string): Promise<Task | null> {
    const { data, error } = await this.db
      .from("task")
      .update({
        deleted_date: new Date().toISOString(),
        modified_date: new Date().toISOString(),
      })
      .eq("task_id", taskId)
      .is("deleted_date", null)
      .select()
      .single();

    if (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete the task");
    }

    if (!data) {
      return null;
    }

    return data as Task;
  }
}
