import {
  TextInputComponent,
  ToggleButton,
  ToggleSize,
} from "@/components/basic";
import Loader from "@/components/basic/Loader.component";
import { Text } from "@/components/Themed";
import { Icons } from "@/config";
import { useUpdateTask } from "@/services/tasks/useUpdateTask";
import { formatISOToSimple } from "@/utils/timeUtils";
import { TaskDetails } from "@repo/models";
import { useState } from "react";
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
  onCancel?: () => void;
  readOnly?: boolean;
}

export const ViewReminderModal = ({
  visible,
  data,
  onClose,
  onEdit,
  onCancel,
  readOnly = false,
}: ViewReminderModalProps) => {
  const { mutate: updateTask, isLoading } = useUpdateTask({
    onSuccess: () => {
      setIsChecked((prev) => !prev);
    },
    onError: (message) => {
      Alert.alert("Error", message ?? "Failed to update task");
    },
  });

  const [isChecked, setIsChecked] = useState(
    data?.task_status_name == "IN_PROGRESS" ||
      data?.task_status_name == "NOT_STARTED"
      ? false
      : data?.task_status_name == "COMPLETED"
  );

  const handleEdit = () => {
    onEdit?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleReminderCheck = () => {
    updateTask({
      task_id: data.task_id,
      data: {
        task_status_id: isChecked
          ? "dbbdc7fa-aba7-43ab-8252-4766c1fbcfc1" // completed
          : "6fe35772-6214-468c-ae26-1b2f2f067740", // inprogress
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
                <View className="flex-row items-center gap-3 mb-5">
                  <Pressable
                    onPress={handleReminderCheck}
                    className="w-6 h-6 rounded border-2 border-gray-400 justify-center items-center"
                    style={{
                      backgroundColor: isChecked ? "#1f2937" : "transparent",
                    }}
                    disabled={data?.task_status_name == "CANCELLED"}
                  >
                    {isChecked && (
                      <Icons.Check size={16} color="white" weight="bold" />
                    )}
                  </Pressable>
                  <Text className="text-xl font-bold text-black flex-1">
                    {data?.task_title}
                  </Text>
                </View>

                {/* Date */}
                <View className="flex-row justify-between mb-4">
                  <TextInputComponent
                    label="Date & time"
                    startIcon={
                      <Icons.CalendarDotsIcon
                        size={20}
                        weight="bold"
                        color="#4B5563"
                      />
                    }
                    inputField={{
                      placeholder: "Enter Date & time",
                      value: formatISOToSimple(data?.start_date),
                      onChangeText: () => {},
                    }}
                    inputWrapper={{
                      accessibilityHint: "Enter Date & time",
                      isDisabled: readOnly,
                    }}
                  />
                </View>

                {/* Set Alarm */}
                <View className="flex-row justify-between mb-4">
                  <ToggleButton
                    size={ToggleSize.Medium}
                    label="Alarm"
                    isActive={data?.set_alarm ?? false}
                  />
                </View>

                {/* Note */}
                <View className="flex-row justify-between mb-4">
                  <TextInputComponent
                    inputWrapper={{
                      accessibilityHint: "Enter your note",
                      isDisabled: readOnly,
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
              <View className="bg-[#EAF8C9] p-4 flex-row justify-end gap-x-2.5 border-t border-gray-100">
                <Pressable
                  className="flex-row items-center bg-slate-900 py-2.5 px-4 rounded-lg gap-x-2"
                  onPress={handleEdit}
                >
                  <Icons.Pencil size={18} color="white" weight="bold" />
                  <Text
                    darkColor="white"
                    lightColor="white"
                    className=" font-semibold text-sm"
                  >
                    Edit
                  </Text>
                </Pressable>

                <Pressable
                  className="flex-row items-center bg-[#FF5A5F] py-2.5 px-4 rounded-lg gap-x-2"
                  onPress={handleCancel}
                >
                  <Icons.Trash size={18} color="white" weight="bold" />
                  <Text
                    darkColor={"white"}
                    lightColor="white"
                    className="font-semibold text-sm"
                  >
                    Cancel Reminder
                  </Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {isLoading && <Loader />}
    </Modal>
  );
};
