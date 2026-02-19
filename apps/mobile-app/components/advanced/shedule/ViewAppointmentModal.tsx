import { TextInputComponent } from "@/components/basic";
import { Text, View } from "@/components/Themed";
import { Icons } from "@/config";
import { formatISOToSimple } from "@/utils/timeUtils";
import { TaskDetails } from "@repo/models";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";

interface ViewAppointmentModalProps {
  visible: boolean;
  data: TaskDetails;
  onClose: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

export const ViewAppointmentModal = ({
  visible,
  data,
  onClose,
  onEdit,
  onCancel,
  readOnly = false,
}: ViewAppointmentModalProps) => {
  const handleEdit = () => {
    onEdit?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Enable closing the modal when tapping outside of the card */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.cardContainer}>
              {/* Scrollable Content Area */}
              <ScrollView
                contentContainerStyle={styles.cardContent}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.headerTitle}>{data?.task_title}</Text>
                {/* Slot Window */}
                <View style={styles.row}>
                  <TextInputComponent
                    label="Slot Window"
                    inputField={{
                      placeholder: "Slot Window",
                      value: formatISOToSimple(data?.start_date, "dateOnly"),
                      onChangeText: () => {},
                    }}
                    inputWrapper={{
                      accessibilityHint: "Slot Window",
                      isDisabled: readOnly,
                    }}
                  />
                </View>
                {/* Slot No. */}
                <View style={styles.row}>
                  <TextInputComponent
                    label="Slot No."
                    inputField={{
                      placeholder: "Slot No.",
                      value: data?.appointment_number!.toString() ?? "",
                      onChangeText: () => {},
                    }}
                    inputWrapper={{
                      accessibilityHint: "Slot No.",
                      isDisabled: readOnly,
                    }}
                  />
                </View>
                {/* Client Details */}
                <View style={styles.row}>
                  <TextInputComponent
                    label="Client Details"
                    inputField={{
                      placeholder: "Client Details",
                      value: `${data?.client_first_name ?? ""} ${data?.client_last_name ?? ""}`,
                      onChangeText: () => {},
                    }}
                    inputWrapper={{
                      accessibilityHint: "Client Details",
                      isDisabled: readOnly,
                    }}
                  />
                </View>
                {/* Start Date */}
                <View style={styles.row}>
                  <TextInputComponent
                    label="Start Date & time"
                    startIcon={
                      <Icons.CalendarDotsIcon
                        size={20}
                        weight="bold"
                        color="#4B5563"
                      />
                    }
                    inputField={{
                      placeholder: "Enter Start Date & time",
                      value: formatISOToSimple(data?.start_date),
                      onChangeText: () => {},
                    }}
                    inputWrapper={{
                      accessibilityHint: "Enter Start Date & time",
                      isDisabled: readOnly,
                    }}
                  />
                </View>
                {/* End Date */}
                <View style={styles.row}>
                  <TextInputComponent
                    label="End Date & time"
                    startIcon={
                      <Icons.CalendarDotsIcon
                        size={20}
                        weight="bold"
                        color="#4B5563"
                      />
                    }
                    inputField={{
                      placeholder: "Enter End Date & time",
                      value: formatISOToSimple(data?.end_date),
                      onChangeText: () => {},
                    }}
                    inputWrapper={{
                      accessibilityHint: "Enter End Date & time",
                      isDisabled: readOnly,
                    }}
                  />
                </View>
                {/* Note */}
                <View style={styles.row}>
                  <TextInputComponent
                    inputWrapper={{
                      accessibilityHint: "Enter your note",
                    }}
                    inputField={{
                      value: data?.note ?? undefined,
                      onChangeText: () => {},
                      placeholder: "Enter note",
                    }}
                    label="Note"
                  />
                </View>
              </ScrollView>

              {/* Footer Action Bar */}
              <View style={styles.footer}>
                <Pressable style={styles.editButton} onPress={handleEdit}>
                  <Icons.Pencil size={18} color="white" weight="bold" />
                  <Text style={styles.buttonText}>Edit</Text>
                </Pressable>

                <Pressable style={styles.cancelButton} onPress={handleCancel}>
                  <Icons.Trash size={18} color="white" weight="bold" />
                  <Text style={styles.buttonText}>Cancel Appointment</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 20,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    maxHeight: "85%",
  },
  cardContent: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    fontFamily: "System",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  dropdown: {
    justifyContent: "space-between",
  },
  inputText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  iconLeft: {
    marginRight: 10,
  },
  textAreaContainer: {
    height: 100,
    alignItems: "flex-start",
    paddingTop: 12,
  },
  noteText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  footer: {
    backgroundColor: "#EAF8C9",
    padding: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5A5F",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
