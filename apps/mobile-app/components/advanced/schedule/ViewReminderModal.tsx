import {
  DateTimePickerComponent,
  DropdownComponent,
  TextInputComponent,
  ToggleButton,
  ToggleSize,
} from "@/components/basic";
import Loader from "@/components/basic/Loader.component";
import { Text } from "@/components/Themed";
import { Icons } from "@/config";
import { useAuth } from "@/auth/AuthContext";
import { useFetchClients } from "@/services/clients/useClients";
import { useUpdateTask } from "@/services/tasks";
import { formatISOToSimple } from "@/utils/timeUtils";
import { type TaskDetails } from "@repo/models";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ViewReminderModalProps {
  visible: boolean;
  data: TaskDetails;
  onClose: () => void;
  onEdit?: () => void;
  onSave?: (form: TaskDetails) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  isSaving?: boolean;
}

export const ViewReminderModal = ({
  visible,
  data,
  onClose,
  onEdit,
  onSave,
  onCancel,
  readOnly = false,
  isSaving = false,
}: ViewReminderModalProps) => {
  const { user } = useAuth();
  const userId = user?.user_id ?? "";
  const { data: clients = [] } = useFetchClients(userId);

  const clientOptions = useMemo(
    () => clients.map((c) => ({ label: c.name, value: c.id })),
    [clients]
  );

  const { mutate: updateTask, isLoading } = useUpdateTask({
    onSuccess: () => {
      setIsChecked((prev) => !prev);
    },
    onError: (message) => {
      Alert.alert("Error", message ?? "Failed to update task");
    },
  });

  const [form, setForm] = useState<TaskDetails>(data);

  const [isChecked, setIsChecked] = useState(
    data?.task_status_name == "IN_PROGRESS" ||
      data?.task_status_name == "NOT_STARTED"
      ? false
      : data?.task_status_name == "COMPLETED"
  );

  useEffect(() => {
    setIsChecked(data?.task_status_name === "COMPLETED");
  }, [data?.task_status_name]);

  useEffect(() => {
    setForm(data);
  }, [data?.task_id]);

  const clientName =
    data?.client_first_name && data?.client_last_name
      ? `${data.client_first_name} ${data.client_last_name}`
      : "";

  const handleEdit = () => onEdit?.();

  const handleSave = () => {
    if (!form.start_date) {
      Alert.alert("Validation", "Start date & time is required.");
      return;
    }
    if (form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      if (end <= start) {
        Alert.alert("Validation", "End date & time must be after start date & time.");
        return;
      }
    }
    onSave?.(form);
  };

  const handleCancel = () => onCancel?.();

  const handleReminderCheck = () => {
    updateTask({
      task_id: data.task_id,
      data: {
        task_status: isChecked ? "IN_PROGRESS" : "COMPLETED",
      },
    });
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/40 p-5">
          <TouchableWithoutFeedback onPress={() => {}}>
            <View className="w-full max-w-[400px] bg-white rounded-2xl overflow-hidden shadow-md max-h-[85%]">
              {/* Scrollable Content Area */}
              <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 10 }}
                showsVerticalScrollIndicator={true}
              >
                {/* Title + checkbox */}
                <View className="flex-row items-center gap-3 mb-5">
                  <Pressable
                    onPress={handleReminderCheck}
                    className="w-6 h-6 rounded border-2 border-gray-400 justify-center items-center"
                    style={{ backgroundColor: isChecked ? "#1f2937" : "transparent" }}
                    disabled={data?.task_status_name == "CANCELLED"}
                  >
                    {isChecked && <Icons.Check size={16} color="white" weight="bold" />}
                  </Pressable>
                  <Text className="text-xl font-bold text-black flex-1">
                    {data?.task_title}
                  </Text>
                </View>

                {/* Start Date & time */}
                <View className="mb-4">
                  {readOnly ? (
                    <TextInputComponent
                      label="Start Date & time"
                      startIcon={<Icons.CalendarDotsIcon size={20} weight="bold" color="#4B5563" />}
                      inputField={{
                        placeholder: "Enter Start Date & time",
                        value: formatISOToSimple(form?.start_date),
                        onChangeText: (value) => setForm((prev) => ({ ...prev, start_date: value })),
                      }}
                      inputWrapper={{ accessibilityHint: "Start Date & time", isDisabled: true }}
                    />
                  ) : (
                    <DateTimePickerComponent
                      label="Start Date & time"
                      value={form?.start_date}
                      onChange={(text) => setForm((prev) => ({ ...prev, start_date: text }))}
                      placeholder="Nov 15, 2025  08:00 am"
                      mode="datetime"
                    />
                  )}
                </View>

                {/* End Date & time */}
                <View className="mb-4">
                  {readOnly ? (
                    <TextInputComponent
                      label="End Date & time"
                      startIcon={<Icons.CalendarDotsIcon size={20} weight="bold" color="#4B5563" />}
                      inputField={{
                        placeholder: "Not set",
                        value: form?.end_date ? formatISOToSimple(form.end_date) : "",
                        onChangeText: (value) => setForm((prev) => ({ ...prev, end_date: value })),
                      }}
                      inputWrapper={{ accessibilityHint: "End Date & time", isDisabled: true }}
                    />
                  ) : (
                    <DateTimePickerComponent
                      label="End Date & time"
                      value={form?.end_date ?? ""}
                      onChange={(text) => setForm((prev) => ({ ...prev, end_date: text }))}
                      placeholder="Nov 15, 2025  09:00 am"
                      mode="datetime"
                    />
                  )}
                </View>

                {/* Client */}
                <View className="mb-4">
                  {readOnly ? (
                    <TextInputComponent
                      label="Client"
                      inputField={{
                        placeholder: "No client assigned",
                        value: clientName,
                        onChangeText: () => {},
                      }}
                      inputWrapper={{ accessibilityHint: "Client", isDisabled: true }}
                    />
                  ) : (
                    <DropdownComponent
                      label="Client"
                      value={form?.client_id ?? ""}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, client_id: value }))}
                      options={clientOptions}
                      placeholder="Select Client"
                    />
                  )}
                </View>

                {/* Set Alarm */}
                <View className="mb-4">
                  <ToggleButton
                    size={ToggleSize.Medium}
                    label="Alarm"
                    isActive={form?.set_alarm ?? false}
                    onToggle={(value) => setForm((prev) => ({ ...prev, set_alarm: value }))}
                    readOnly={readOnly}
                  />
                </View>

                {/* Note */}
                <View className="mb-4">
                  <TextInputComponent
                    inputWrapper={{
                      accessibilityHint: "Enter your note",
                      isDisabled: readOnly,
                    }}
                    inputField={{
                      value: form?.note ?? undefined,
                      onChangeText: (value) => setForm((prev) => ({ ...prev, note: value })),
                      placeholder: "Enter note",
                    }}
                    label="Note"
                  />
                </View>
              </ScrollView>

              {/* Footer Action Bar */}
              <View className="bg-[#EAF8C9] p-4 flex-row justify-end gap-x-2.5 border-t border-gray-100">
                <Pressable
                  className="flex-row items-center bg-slate-900 py-2.5 px-4 rounded-lg gap-x-2"
                  onPress={readOnly ? handleEdit : handleSave}
                >
                  {readOnly ? (
                    <Icons.Pencil size={18} color="white" weight="bold" />
                  ) : (
                    <Icons.Check size={18} color="white" weight="bold" />
                  )}
                  <Text darkColor="white" lightColor="white" className="font-semibold text-sm">
                    {readOnly ? "Edit" : "Save"}
                  </Text>
                </Pressable>

                <Pressable
                  className="flex-row items-center bg-[#FF5A5F] py-2.5 px-4 rounded-lg gap-x-2"
                  onPress={handleCancel}
                >
                  <Icons.Trash size={18} color="white" weight="bold" />
                  <Text darkColor="white" lightColor="white" className="font-semibold text-sm">
                    Cancel Reminder
                  </Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {(isLoading || isSaving) && <Loader />}
    </Modal>
  );
};
