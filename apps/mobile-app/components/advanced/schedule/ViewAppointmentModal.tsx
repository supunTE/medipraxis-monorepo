import {
  DateTimePickerComponent,
  TextInputComponent,
} from "@/components/basic";
import Loader from "@/components/basic/Loader.component";
import { Text } from "@/components/Themed";
import { Icons } from "@/config";
import { formatISOToSimple } from "@/utils/timeUtils";
import { TaskDetails } from "@repo/models";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ViewAppointmentModalProps {
  visible: boolean;
  data: TaskDetails;
  onClose: () => void;
  onEdit?: () => void;
  onSave?: (data: TaskDetails) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  isSaving?: boolean;
}

export const ViewAppointmentModal = ({
  visible,
  data,
  onClose,
  onEdit,
  onSave,
  onCancel,
  readOnly = false,
  isSaving = false,
}: ViewAppointmentModalProps) => {
  const [form, setForm] = useState<TaskDetails>(data);

  useEffect(() => {
    setForm(data);
  }, []);

  useEffect(() => {
    setForm(data);
  }, [data && data.task_id]);

  const handleEdit = () => {
    onEdit?.();
  };

  const handleSave = () => {
    onSave?.(form);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Modal
      animationType="fade"
      transparent
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
                <Text className="text-xl font-bold text-black mb-5">
                  {form?.task_title}
                </Text>

                {/* Slot Window */}
                {form?.slot_window_id && (
                  <>
                    <View className="flex-row justify-between mb-4">
                      <TextInputComponent
                        label="Slot Window"
                        inputField={{
                          placeholder: "Slot Window",
                          value: formatISOToSimple(
                            form?.start_date,
                            "dateOnly"
                          ),
                          onChangeText: () => {},
                        }}
                        inputWrapper={{
                          accessibilityHint: "Slot Window",
                          isDisabled: readOnly,
                        }}
                      />
                    </View>

                    {/* Slot No. */}
                    <View className="flex-row justify-between mb-4">
                      <TextInputComponent
                        label="Slot No."
                        inputField={{
                          placeholder: "Slot No.",
                          value: form?.appointment_number?.toString() ?? "",
                          onChangeText: (text) =>
                            setForm((prev) => ({
                              ...prev,
                              appointment_number: Number(text),
                            })),
                        }}
                        inputWrapper={{
                          accessibilityHint: "Slot No.",
                          isDisabled: readOnly || !readOnly,
                        }}
                      />
                    </View>
                  </>
                )}

                {/* Client Details */}
                <View className="flex-row justify-between mb-4">
                  <TextInputComponent
                    label="Client Details"
                    inputField={{
                      placeholder: "Client Details",
                      value: `${form?.client_first_name ?? ""} ${
                        form?.client_last_name ?? ""
                      }`,
                      onChangeText: () => {},
                    }}
                    inputWrapper={{
                      accessibilityHint: "Client Details",
                      isDisabled: readOnly,
                    }}
                  />
                </View>

                {/* Start Date */}
                <View className="flex-row justify-between mb-4">
                  {readOnly ? (
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
                        value: formatISOToSimple(form?.start_date),
                        onChangeText: (text) =>
                          setForm((prev) => ({
                            ...prev,
                            start_date: text,
                          })),
                      }}
                      inputWrapper={{
                        accessibilityHint: "Enter Start Date & time",
                        isDisabled: readOnly || !readOnly,
                      }}
                    />
                  ) : (
                    <DateTimePickerComponent
                      label="Start Date & time"
                      value={form?.start_date}
                      onChange={(text) =>
                        setForm((prev) => ({
                          ...prev,
                          start_date: text,
                        }))
                      }
                      placeholder="Nov 15, 2025  08:00 am"
                      mode="datetime"
                    />
                  )}
                </View>

                {/* End Date */}
                <View className="flex-row justify-between mb-4">
                  {readOnly ? (
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
                        value: formatISOToSimple(form?.end_date),
                        onChangeText: (text) =>
                          setForm((prev) => ({
                            ...prev,
                            end_date: text,
                          })),
                      }}
                      inputWrapper={{
                        accessibilityHint: "Enter End Date & time",
                        isDisabled: readOnly || !readOnly,
                      }}
                    />
                  ) : (
                    <DateTimePickerComponent
                      label="Enter End Date & time"
                      value={form?.end_date}
                      onChange={(text) =>
                        setForm((prev) => ({
                          ...prev,
                          end_date: text,
                        }))
                      }
                      placeholder="Nov 15, 2025  08:00 am"
                      mode="datetime"
                    />
                  )}
                </View>

                {/* Note */}
                <View className="flex-row justify-between mb-4">
                  <TextInputComponent
                    inputWrapper={{
                      accessibilityHint: "Enter your note",
                      isDisabled: readOnly,
                    }}
                    inputField={{
                      value: form?.note ?? "",
                      onChangeText: (text) =>
                        setForm((prev) => ({
                          ...prev,
                          note: text,
                        })),
                      placeholder: "Enter note",
                    }}
                    label="Note"
                  />
                </View>
              </ScrollView>

              {/* Footer Action Bar */}
              <View className="bg-[#EAF8C9] p-4 flex-row justify-end gap-x-2.5 border-t border-gray-100">
                {!data?.slot_window_id && (
                  <Pressable
                    className="flex-row items-center bg-slate-900 py-2.5 px-4 rounded-lg gap-x-2"
                    onPress={readOnly ? handleEdit : handleSave}
                  >
                    {readOnly ? (
                      <Icons.Pencil size={18} color="white" weight="bold" />
                    ) : (
                      <Icons.Check size={18} color="white" weight="bold" />
                    )}
                    <Text
                      darkColor="white"
                      lightColor="white"
                      className=" font-semibold text-sm"
                    >
                      {readOnly ? "Edit" : "Save"}
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  className="flex-row items-center bg-[#FF5A5F] py-2.5 px-4 rounded-lg gap-x-2"
                  onPress={handleCancel}
                >
                  <Icons.Trash size={18} color="white" weight="bold" />
                  <Text
                    darkColor="white"
                    lightColor="white"
                    className="font-semibold text-sm"
                  >
                    Cancel Appointment
                  </Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      {isSaving && <Loader />}
    </Modal>
  );
};
