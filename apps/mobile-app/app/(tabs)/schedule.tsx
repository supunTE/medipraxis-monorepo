import { View } from "@/components/Themed";
import {
  type AgendaData,
  type AgendaSelection,
  AgendaSelectionType,
  CalendarComponent,
} from "@/components/advanced";
import {
  ViewAppointmentModal,
  ViewReminderModal,
} from "@/components/advanced/schedule";
import Loader from "@/components/basic/Loader.component";
import { useGetTaskById } from "@/services/tasks/useGetTaskById";
import { useEffect, useState } from "react";
import { Alert, StyleSheet } from "react-native";

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTask, setSelectedTask] = useState<AgendaSelection | null>(
    null
  );
  const [viewApptModalVisible, setViewApptModalVisible] = useState(false);
  const [viewApptReadOnly, setViewApptReadOnly] = useState(true);

  const [viewReminderModalVisible, setViewReminderModalVisible] =
    useState(false);
  const [viewReminderReadOnly, setViewReminderReadOnly] = useState(true);

  // Use the mutation hook to fetch task by ID
  const {
    mutate: fetchTask,
    data: appointmentData,
    isLoading,
  } = useGetTaskById({
    onSuccess: () => {
      selectedTask?.type == AgendaSelectionType.Appointment &&
        setViewApptModalVisible(true);
      selectedTask?.type == AgendaSelectionType.Reminder &&
        setViewReminderModalVisible(true);
    },
    onError: (message) => {
      console.error("Failed to load appointment:", message);
      Alert.alert("Error", message);
      setSelectedTask(null);
    },
  });

  // Trigger fetch when appointment is selected
  useEffect(() => {
    if (selectedTask?.type === AgendaSelectionType.Appointment) {
      fetchTask({ task_id: selectedTask.appointmentId });
    } else if (selectedTask?.type === AgendaSelectionType.EmptySlot) {
      Alert.alert(
        "Empty Slot Selected",
        `Group ID: ${selectedTask.groupId}\nSlot Number: ${selectedTask.slotNumber}`,
        [{ text: "OK", onPress: () => setSelectedTask(null) }]
      );
    } else if (selectedTask?.type === AgendaSelectionType.Reminder) {
      fetchTask({ task_id: selectedTask.reminderId });
    }
  }, [selectedTask]);

  // Sample agenda data
  // TODO: Replace with real data fetching logic and save to a state
  const sampleAgendaData: AgendaData = {
    timeBlocks: [
      {
        content: {
          id: "08c6d070-7d58-48d5-8cc1-7486952b5cd2",
          title: "Appointment",
          client: "John Doe",
        },
        startTime: "1:00 am",
        endTime: "2:00 am",
      },
    ],
    timeBlockGroups: [
      {
        id: "group-001",
        startTime: "3:30 am",
        endTime: "5:30 am",
        slots: 8,
        contents: [
          { id: "apt-002", title: "Appointment", client: "Anna" },
          null,
          { id: "apt-003", title: "Appointment", client: "Michael" },
          { id: "apt-004", title: "Appointment", client: "Sophie" },
          null,
          { id: "apt-005", title: "Appointment", client: "Ella" },
          null,
          null,
        ],
      },
      {
        id: "group-002",
        startTime: "8:15 am",
        endTime: "10:15 am",
        slots: 12,
        contents: [
          { id: "apt-006", title: "Appointment", client: "David" },
          null,
          { id: "apt-007", title: "Appointment", client: "Emma" },
          { id: "apt-008", title: "Appointment", client: "Oliver" },
          null,
          null,
          { id: "apt-009", title: "Appointment", client: "Liam" },
          null,
          null,
          { id: "apt-010", title: "Appointment", client: "Noah" },
          null,
          null,
        ],
      },
    ],
    reminders: [
      {
        content: {
          id: "d6bb74bd-8d22-47a4-8171-a7d327685b4d",
          title: "Check records",
        },
        startTime: "2:30 am",
      },
      {
        content: { id: "rem-002", title: "Call pharmacy" },
        startTime: "6:00 am",
      },
      {
        content: { id: "rem-003", title: "Review lab results" },
        startTime: "7:30 am",
      },
      {
        content: { id: "rem-004", title: "Follow up with patient" },
        startTime: "9:45 am",
      },
      {
        content: { id: "rem-005", title: "Check inventory" },
        startTime: "9:50 am", // Close to rem-004, will be grouped
      },
      {
        content: { id: "rem-006", title: "Lunch break" },
        startTime: "12:00 pm",
        endTime: "12:30 pm",
      },
      {
        content: { id: "rem-007", title: "Team meeting prep" },
        startTime: "2:00 pm",
      },
      {
        content: { id: "rem-008", title: "Review notes" },
        startTime: "2:10 pm", // Close to rem-007, will be grouped
      },
      {
        content: { id: "rem-009", title: "Call supplier" },
        startTime: "2:15 pm", // Also close, will be grouped with rem-007 and rem-008
      },
    ],
  };

  const handleCloseViewApptModal = () => {
    setViewApptModalVisible(false);
    setSelectedTask(null);
    setViewApptReadOnly(true);
  };

  const handleCloseViewReminderModal = () => {
    setViewReminderModalVisible(false);
    setSelectedTask(null);
    setViewReminderReadOnly(true);
  };

  const handleEditViewApptModal = () => {
    setViewApptReadOnly(false);
    setSelectedTask(null);
  };

  const handleEditViewReminderModal = () => {
    setViewReminderReadOnly(false);
    setSelectedTask(null);
  };

  return (
    <View style={styles.container}>
      <CalendarComponent
        agendaData={sampleAgendaData}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onAppointmentPress={(appointment, groupId) =>
          setSelectedTask({
            type: AgendaSelectionType.Appointment,
            appointmentId: appointment.id,
            groupId,
          })
        }
        onEmptySlotPress={(groupId, slotNumber) =>
          setSelectedTask({
            type: AgendaSelectionType.EmptySlot,
            groupId,
            slotNumber,
          })
        }
        onReminderPress={(reminder) =>
          setSelectedTask({
            type: AgendaSelectionType.Reminder,
            reminderId: reminder.id,
          })
        }
      />
      <ViewAppointmentModal
        visible={viewApptModalVisible}
        data={appointmentData?.task!}
        onClose={handleCloseViewApptModal}
        onEdit={handleEditViewApptModal}
        onCancel={handleCloseViewApptModal}
        readOnly={viewApptReadOnly}
      />

      <ViewReminderModal
        visible={viewReminderModalVisible}
        data={appointmentData?.task!}
        onClose={handleCloseViewReminderModal}
        onEdit={handleEditViewReminderModal}
        onCancel={handleCloseViewReminderModal}
        readOnly={viewReminderReadOnly}
      />

      {isLoading && <Loader />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
