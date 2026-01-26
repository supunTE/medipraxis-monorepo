import type { Task } from "@repo/models";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface GetTaskResponse {
  task: Task;
}

export async function fetchTaskById(taskId: string): Promise<Task | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as GetTaskResponse;
    return data.task;
  } catch (error) {
    console.error("Error fetching task:", error);
    return null;
  }
};