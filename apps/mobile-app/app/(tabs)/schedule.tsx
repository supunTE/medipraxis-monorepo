import { View } from "@/components/Themed";
import {
  type AgendaData,
  type AgendaSelection,
  AgendaSelectionType,
  CalendarComponent,
} from "@/components/advanced";
import { ViewAppointmentModal } from "@/components/advanced/shedule/ViewAppointmentModal";
import { useGetTaskById } from "@/services/tasks/useGetTaskById";
import { useEffect, useState } from "react";
import { Alert, StyleSheet } from "react-native";

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTask, setSelectedTask] = useState<AgendaSelection | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [viewApptReadOnly, setViewApptReadOnly] = useState(true);

  // Use the mutation hook to fetch task by ID
  const { mutate: fetchTask, data: appointmentData } = useGetTaskById({
    onSuccess: () => {
      setModalVisible(true);
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
      Alert.alert(
        "Reminder Selected",
        `Reminder ID: ${selectedTask.reminderId}`,
        [{ text: "OK", onPress: () => setSelectedTask(null) }]
      );
    }
  }, [selectedTask]);

  // Sample agenda data
  // TODO: Replace with real data fetching logic and save to a state
  const sampleAgendaData: AgendaData = {
    timeBlocks: [
      {
        content: { id: "08c6d070-7d58-48d5-8cc1-7486952b5cd2", title: "Appointment", client: "John Doe" },
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
        content: { id: "rem-001", title: "Check records" },
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

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTask(null);
    // setAppointmentData(null);
  };

  // Format task data for modal display
  //   const modalData = appointmentData
  //     ? {
  //         title: appointmentData.task_title || "Appointment",
  //         slotWindow: appointmentData.slot_window_id || "N/A",
  //         slotNo: appointmentData.appointment_number || 0,
  //         client: appointmentData.client_id || "N/A",
  //         start_date: appointmentData.start_date || "N/A",
  //         end_date: appointmentData.end_date || "N/A",
  //         note: appointmentData.note || "",
  //       }
  //     : {
  //         title: "Loading...",
  //         slotWindow: "",
  //         slotNo: 0,
  //         client: "",
  //         start_date: "",
  //         end_date: "",
  //         note: "",
  //       };

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
        visible={modalVisible}
        data={appointmentData?.task!}
        onClose={handleCloseModal}
        onEdit={() => {
          setViewApptReadOnly(false);
        }}
        onCancel={handleCloseModal}
        readOnly={viewApptReadOnly}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
