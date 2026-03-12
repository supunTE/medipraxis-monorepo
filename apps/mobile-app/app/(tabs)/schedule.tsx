import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet } from "react-native";

import { View } from "@/components/Themed";
import {
  type AgendaBlockContent,
  type AgendaData,
  CalendarComponent,
} from "@/components/advanced";
import {
  ViewAppointmentModal,
  ViewReminderModal,
} from "@/components/advanced/schedule";
import Loader from "@/components/basic/Loader.component";
import { useGetSlotWindows } from "@/services/slotWindows";
import {
  useGetAppointments,
  useGetReminders,
  useGetTaskById,
} from "@/services/tasks";
import { formatISOToTime } from "@/utils";
import { type TaskDetails } from "@repo/models";

const USER_ID = "2a3c19b8-d352-4b30-a2ac-1cdf993d310c";

export default function ScheduleScreen() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]!
  );
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(
    null
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [viewApptModalVisible, setViewApptModalVisible] = useState(false);
  const [viewApptReadOnly, setViewApptReadOnly] = useState(true);
  const [viewReminderModalVisible, setViewReminderModalVisible] =
    useState(false);
  const [viewReminderReadOnly, setViewReminderReadOnly] = useState(true);

  const slotWindowsQuery = useGetSlotWindows(USER_ID, selectedDate);
  const appointmentsQuery = useGetAppointments(USER_ID, selectedDate);
  const remindersQuery = useGetReminders(USER_ID, selectedDate);
  const timeBlockGroups =
    slotWindowsQuery.timeBlockGroups as AgendaData["timeBlockGroups"];
  const appointments = appointmentsQuery.appointments;
  const reminders = remindersQuery.reminders as AgendaData["reminders"];

  useFocusEffect(
    useCallback(() => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["slot-windows", USER_ID] }),
        queryClient.invalidateQueries({ queryKey: ["appointments", USER_ID] }),
        queryClient.invalidateQueries({ queryKey: ["reminders", USER_ID] }),
      ]);
    }, [queryClient])
  );

  const appointmentTaskQuery = useGetTaskById({
    onSuccess: () => {
      setViewApptModalVisible(true);
    },
    onError: (message) => {
      Alert.alert("Error", message);
      setSelectedAppointmentId(null);
    },
  });

  const reminderTaskQuery = useGetTaskById({
    onSuccess: () => {
      setViewReminderModalVisible(true);
    },
    onError: (message) => {
      Alert.alert("Error", message);
      setSelectedReminderId(null);
    },
  });

  const buildAppointmentContent = (
    appointment: TaskDetails
  ): AgendaBlockContent => {
    const clientName = [
      appointment.client_first_name,
      appointment.client_last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      id: appointment.task_id,
      title: appointment.task_title,
      ...(clientName ? { client: clientName } : {}),
    };
  };

  const agendaData: AgendaData = useMemo(() => {
    const mappedTimeBlockGroups = (timeBlockGroups ?? []).map((group) => ({
      ...group,
      contents: [...group.contents],
    }));

    const groupsById = new Map(
      mappedTimeBlockGroups.map((group) => [group.id, group])
    );
    const timeBlocks: NonNullable<AgendaData["timeBlocks"]> = [];

    appointments.forEach((appointment) => {
      const content = buildAppointmentContent(appointment);

      if (appointment.slot_window_id) {
        const group = groupsById.get(appointment.slot_window_id);
        const slotIndex =
          appointment.appointment_number !== null
            ? appointment.appointment_number - 1
            : -1;

        if (group && slotIndex >= 0 && slotIndex < group.contents.length) {
          group.contents[slotIndex] = content;
          return;
        }
      }

      timeBlocks.push({
        content,
        startTime: formatISOToTime(appointment.start_date),
        endTime: formatISOToTime(appointment.end_date),
      });
    });

    return {
      reminders,
      timeBlocks,
      timeBlockGroups: mappedTimeBlockGroups,
    };
  }, [appointments, reminders, timeBlockGroups]);

  const handleCloseViewApptModal = () => {
    setViewApptModalVisible(false);
    setSelectedAppointmentId(null);
    setViewApptReadOnly(true);
  };

  const handleEditViewApptModal = () => {
    setViewApptReadOnly(false);
  };

  const handleCloseViewReminderModal = () => {
    setViewReminderModalVisible(false);
    setSelectedReminderId(null);
    setViewReminderReadOnly(true);
  };

  const handleEditViewReminderModal = () => {
    setViewReminderReadOnly(false);
  };

  const handleReminderPress = (reminderId: string) => {
    setSelectedReminderId(reminderId);
    reminderTaskQuery.mutate({ task_id: reminderId });
  };

  const handleAppointmentPress = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    appointmentTaskQuery.mutate({ task_id: appointmentId });
  };

  return (
    <View style={styles.container}>
      <CalendarComponent
        agendaData={agendaData}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onAppointmentPress={(appointment) =>
          handleAppointmentPress(appointment.id)
        }
        onEmptySlotPress={(groupId, slotNumber) =>
          Alert.alert(
            "Available Slot",
            `Window ID: ${groupId}\nSlot Number: ${slotNumber + 1}`
          )
        }
        onReminderPress={(reminder) => handleReminderPress(reminder.id)}
      />

      {appointmentTaskQuery.data?.task && selectedAppointmentId && (
        <ViewAppointmentModal
          visible={viewApptModalVisible}
          data={appointmentTaskQuery.data.task}
          onClose={handleCloseViewApptModal}
          onEdit={handleEditViewApptModal}
          onCancel={handleCloseViewApptModal}
          readOnly={viewApptReadOnly}
        />
      )}

      {reminderTaskQuery.data?.task && selectedReminderId && (
        <ViewReminderModal
          visible={viewReminderModalVisible}
          data={reminderTaskQuery.data.task}
          onClose={handleCloseViewReminderModal}
          onEdit={handleEditViewReminderModal}
          onCancel={handleCloseViewReminderModal}
          readOnly={viewReminderReadOnly}
        />
      )}

      {(slotWindowsQuery.isLoading ||
        appointmentsQuery.isLoading ||
        remindersQuery.isLoading ||
        appointmentTaskQuery.isLoading ||
        reminderTaskQuery.isLoading) && <Loader />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
