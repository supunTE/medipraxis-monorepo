import { apiClient, customFetch } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
import type { AppointmentStatus } from "../../app/(tabs)/clients/[id]/AppointmentTile.component";

export interface AppointmentApiItem {
  task_id: string;
  task_title: string;
  task_type_id: string;
  client_id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  deleted_date: string | null;
  created_date: string;
  modified_date: string | null;
  note: string | null;
  set_alarm: boolean;
  task_status_id: string | null;
  appointment_number: number | null;
  slot_window_id: string | null;
  created_by: string;
  task_type_name: string;
  task_status_name: string | null;
  client_first_name: string | null;
  client_last_name: string | null;
  slot_window_location: string | null; // From slot_windows table
}

// Status
// c2c4fceb = NOT_STARTED
// 6fe35772 = IN_PROGRESS
// 8e5cebbe = CANCELLED
// dbbdc7fa = COMPLETED

const resolveStatus = (
  task_status_name: string | null,
  start_date: string
): AppointmentStatus => {
  const now = new Date();
  const start = new Date(start_date);
  const diffMs = now.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Auto-detect ONGOING: started within last 2 hours and still NOT_STARTED
  if (diffHours >= 0 && diffHours <= 2 && task_status_name === "NOT_STARTED") {
    return "ONGOING";
  }

  switch (task_status_name) {
    case "IN_PROGRESS":
      return "IN_PROGRESS";
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
    case "NOT_STARTED":
    default:
      return "NOT_STARTED";
  }
};

export const useFetchClientAppointments = (clientId: string) => {
  return useQuery({
    queryKey: ["appointments", clientId],
    queryFn: async () => {
      const response = await apiClient.api.tasks.appointments.client.$get({
        query: {
          client_id: clientId,
        },
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to load appointments. Please try again.");
        return [];
      }

      const data = (await response.json()) as {
        appointments: AppointmentApiItem[];
      };

      return data.appointments.map((item: AppointmentApiItem) => ({
        appointment_id: item.task_id,
        date: item.start_date,
        location: item.slot_window_location ?? null,
        status: resolveStatus(item.task_status_name, item.start_date),
      }));
    },
    enabled: !!clientId,
  });
};

// Fetch all appointment records for a client and return a Set of appointment_ids that have records
export const useFetchClientAppointmentRecords = (clientId: string) => {
  return useQuery({
    queryKey: ["appointment-records", clientId],
    queryFn: async () => {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

      // Use customFetch so auth token is injected automatically
      const response = await customFetch(
        `${API_BASE_URL}/api/appointment-records?client_id=${clientId}`
      );

      console.log("[appointment-records] status:", response.status);

      if (!response.ok) {
        console.log("[appointment-records] failed:", response.status);
        return new Set<string>();
      }

      const data = (await response.json()) as {
        records: { appointment_id: string }[];
      };

      console.log("[appointment-records] count:", data.records.length);
      console.log(
        "[appointment-records] ids:",
        data.records.map((r) => r.appointment_id)
      );

      return new Set<string>(data.records.map((r) => r.appointment_id));
    },
    enabled: !!clientId,
  });
};
