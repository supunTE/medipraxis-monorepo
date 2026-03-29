import { useAuth } from "@/auth/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import TaskForm from "@/components/advanced/taskPanel/TaskForm";
import { ButtonComponent, ButtonSize } from "@/components/basic";
import Loader from "@/components/basic/Loader.component";
import { Icons } from "@/config";
import { useGetSlotWindows } from "@/services/slotWindows";
import {
  useCancelAppointment,
  useGetAppointments,
  useGetReminders,
  useGetTaskById,
  useUpdateTask,
} from "@/services/tasks";
import { formatISOToTime, simpleDateTimeToISO } from "@/utils";
import { Color } from "@repo/config";
import { type TaskDetails } from "@repo/models";

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userId = user?.user_id ?? "";
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(
    null
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [showForm, setShowForm] = useState(false);
  const [viewApptModalVisible, setViewApptModalVisible] = useState(false);
  const [viewApptReadOnly, setViewApptReadOnly] = useState(true);
  const [viewReminderModalVisible, setViewReminderModalVisible] =
    useState(false);
  const [viewReminderReadOnly, setViewReminderReadOnly] = useState(true);

  const slotWindowsQuery = useGetSlotWindows(userId, selectedDate);
  const appointmentsQuery = useGetAppointments(userId, selectedDate);
  const remindersQuery = useGetReminders(userId, selectedDate);
  const timeBlockGroups =
    slotWindowsQuery.timeBlockGroups as AgendaData["timeBlockGroups"];
  const appointments = appointmentsQuery.appointments;
  const reminders = remindersQuery.reminders as AgendaData["reminders"];

  useFocusEffect(
    useCallback(() => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["slot-windows", userId] }),
        queryClient.invalidateQueries({ queryKey: ["appointments", userId] }),
        queryClient.invalidateQueries({ queryKey: ["reminders", userId] }),
      ]);
    }, [queryClient, userId])
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

  const { mutate: updateTask, isLoading: isLoadingUpdate } = useUpdateTask({
    onSuccess: () => {
      setViewReminderReadOnly(true);
      if (selectedReminderId) {
        reminderTaskQuery.mutate({ task_id: selectedReminderId });
      }
    },
    onError: (message) => {
      Alert.alert("Error", message ?? "Failed to update reminder");
    },
  });

  const { mutate: cancelTaskStatus, isLoading: isLoadingCancel } = useUpdateTask({
    onSuccess: () => {
      handleCloseViewReminderModal();
      handleCloseViewApptModal();
    },
    onError: (message) => {
      Alert.alert("Error", message ?? "Failed to cancel");
    },
  });

  const { mutate: cancelSlotAppointment, isLoading: isLoadingCancelSlot } =
    useCancelAppointment({
      onSuccess: () => {
        handleCloseViewApptModal();
      },
      onError: (message) => {
        Alert.alert("Error", message ?? "Failed to cancel appointment");
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

  const handleSaveTaskModal = (form: TaskDetails) => {
    updateTask({
      task_id: form.task_id,
      data: {
        start_date: form.start_date.includes("T")
          ? form.start_date
          : simpleDateTimeToISO(form.start_date),
        end_date: form.end_date
          ? form.end_date.includes("T")
            ? form.end_date
            : simpleDateTimeToISO(form.end_date)
          : undefined,
        client_id: form.client_id ?? undefined,
        note: form.note ?? undefined,
        set_alarm: form.set_alarm,
      },
    });
    setViewApptReadOnly(true);
    setViewReminderReadOnly(true);
  };

  const handleCancelReminder = () => {
    if (!selectedReminderId) return;
    Alert.alert(
      "Cancel Reminder",
      "Are you sure you want to cancel this reminder?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            cancelTaskStatus({
              task_id: selectedReminderId,
              data: { task_status: "CANCELLED" },
            });
          },
        },
      ]
    );
  };

  const handleCancelAppointment = () => {
    if (!selectedAppointmentId) return;
    const task = appointmentTaskQuery.data?.task;
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            if (task?.slot_window_id) {
              // Slot-window appointment: use dedicated cancel endpoint to release the slot
              cancelSlotAppointment({ task_id: selectedAppointmentId });
            } else {
              // Custom appointment: update task status to CANCELLED
              cancelTaskStatus({
                task_id: selectedAppointmentId,
                data: { task_status: "CANCELLED" },
              });
            }
          },
        },
      ]
    );
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
      <View
        pointerEvents="none"
        style={[styles.topEdgeBackground, { height: insets.top + 16 }]}
      />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <CalendarComponent
          agendaData={agendaData}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onAgendaRefresh={() => {
            void Promise.all([
              queryClient.invalidateQueries({
                queryKey: ["slot-windows", userId],
              }),
              queryClient.invalidateQueries({
                queryKey: ["appointments", userId],
              }),
              queryClient.invalidateQueries({
                queryKey: ["reminders", userId],
              }),
            ]);
          }}
          isAgendaRefreshing={
            slotWindowsQuery.isFetching ||
            appointmentsQuery.isFetching ||
            remindersQuery.isFetching
          }
          agendaHeaderRightAction={
            <ButtonComponent
              onPress={() => setShowForm(true)}
              size={ButtonSize.Small}
              leftIcon={Icons.Plus}
              buttonColor={Color.Black}
              textColor={Color.White}
              iconColor={Color.White}
            >
              Create
            </ButtonComponent>
          }
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
      </View>

      {appointmentTaskQuery.data?.task && selectedAppointmentId && (
        <ViewAppointmentModal
          visible={viewApptModalVisible}
          data={appointmentTaskQuery.data.task}
          onClose={handleCloseViewApptModal}
          onEdit={handleEditViewApptModal}
          onSave={handleSaveTaskModal}
          onCancel={handleCancelAppointment}
          readOnly={viewApptReadOnly}
          isSaving={isLoadingUpdate || isLoadingCancel || isLoadingCancelSlot}
        />
      )}

      {reminderTaskQuery.data?.task && selectedReminderId && (
        <ViewReminderModal
          visible={viewReminderModalVisible}
          data={reminderTaskQuery.data.task}
          onClose={handleCloseViewReminderModal}
          onEdit={handleEditViewReminderModal}
          onSave={handleSaveTaskModal}
          onCancel={handleCancelReminder}
          readOnly={viewReminderReadOnly}
          isSaving={isLoadingUpdate || isLoadingCancel}
        />
      )}

      {(slotWindowsQuery.isLoading ||
        appointmentsQuery.isLoading ||
        remindersQuery.isLoading ||
        appointmentTaskQuery.isLoading ||
        reminderTaskQuery.isLoading ||
        isLoadingCancel ||
        isLoadingCancelSlot) && <Loader />}

      <TaskForm visible={showForm} onClose={() => setShowForm(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.White,
  },
  topEdgeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Color.LightGreen,
    zIndex: 0,
  },
});
