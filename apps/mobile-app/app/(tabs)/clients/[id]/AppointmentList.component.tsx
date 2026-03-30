import { TextComponent } from "@/components/basic";
import { Icons } from "@/config";
import {
  useFetchClientAppointmentRecords,
  useFetchClientAppointments,
} from "@/services/clients/useClientAppointment";
import { Color, TextSize, TextVariant } from "@repo/config";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { AppointmentTile, type Appointment } from "./AppointmentTile.component";

// task_statuses
// c2c4fceb = NOT_STARTED
// 6fe35772 = IN_PROGRESS
// 8e5cebbe = CANCELLED
// dbbdc7fa = COMPLETED

export const getDateLabel = (dateString: string): string => {
  const appointmentDate = new Date(dateString);
  const today = new Date();

  const stripTime = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffDays = Math.round(
    (stripTime(appointmentDate).getTime() - stripTime(today).getTime()) /
      86400000
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < -1 && diffDays >= -7) return "Last Week";
  if (diffDays > 1 && diffDays <= 7) return "This Week";

  return appointmentDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface AppointmentsListProps {
  clientId?: string;
  onViewAppointment?: (appointmentId: string) => void;
  onAddRecord?: (appointmentId: string) => void;
  searchQuery?: string;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({
  clientId,
  onViewAppointment,
  onAddRecord,
  searchQuery = "",
}) => {
  const { data: apiAppointments, isLoading } = useFetchClientAppointments(
    clientId ?? ""
  );

  // Fetch appointment records to know which appointments already have a record
  const { data: appointmentIdsWithRecords = new Set<string>() } =
    useFetchClientAppointmentRecords(clientId ?? "");

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <ActivityIndicator size="large" color={Color.Green} />
      </View>
    );
  }

  const data: Appointment[] = apiAppointments ?? [];

  // Sort: most recent / soonest first
  const sorted = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = sorted.filter((appt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const label = getDateLabel(appt.date).toLowerCase();
    const loc = (appt.location ?? "").toLowerCase();
    const dateStr = new Date(appt.date)
      .toLocaleDateString("en-GB")
      .toLowerCase();
    return label.includes(q) || loc.includes(q) || dateStr.includes(q);
  });

  if (filtered.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <Icons.CalendarBlank
          size={64}
          color={Color.LightGrey}
          weight="regular"
        />
        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Medium}
          color={Color.Grey}
          style={{ marginTop: 16, textAlign: "center" }}
        >
          No appointments found
        </TextComponent>
      </View>
    );
  }

  return (
    <View className="pt-1 pb-32">
      {filtered.map((appt) => (
        <AppointmentTile
          key={appt.appointment_id}
          appointment={appt}
          dateLabel={getDateLabel(appt.date)}
          hasRecord={appointmentIdsWithRecords.has(appt.appointment_id)}
          onViewAppointment={onViewAppointment}
          onAddRecord={onAddRecord}
        />
      ))}
    </View>
  );
};
