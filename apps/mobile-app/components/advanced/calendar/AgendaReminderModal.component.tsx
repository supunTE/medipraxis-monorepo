import TextComponent from "@/components/basic";
import { Color, TextSize, TextVariant } from "@repo/config";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { AgendaReminderContent, AgendaReminderData } from "./calendar.types";

interface AgendaReminderModalProps {
  visible: boolean;
  onClose: () => void;
  reminders: AgendaReminderData[];
  onReminderPress?: (reminder: AgendaReminderContent) => void;
}

export function AgendaReminderModal({
  visible,
  onClose,
  reminders,
  onReminderPress,
}: AgendaReminderModalProps): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-2xl p-5 w-[85%] h-[70%]">
          <View className="mb-4">
            <TextComponent size={TextSize.Medium} variant={TextVariant.Title}>
              Tasks
            </TextComponent>
            <TextComponent
              size={TextSize.Small}
              variant={TextVariant.Body}
              color={Color.Grey}
            >
              {reminders.length} task{reminders.length !== 1 ? "s" : ""}
            </TextComponent>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-2"
            showsVerticalScrollIndicator={true}
          >
            {reminders.map((reminder, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  onReminderPress?.(reminder.content);
                  onClose();
                }}
                className="py-3 px-4 mb-2 bg-[#F8F9FA] rounded-lg border-l-4 border-mp-green"
              >
                <TextComponent
                  size={TextSize.Small}
                  variant={TextVariant.Body}
                  color={Color.Grey}
                >
                  {reminder.startTime}
                  {reminder.endTime && ` - ${reminder.endTime}`}
                </TextComponent>
                <TextComponent
                  size={TextSize.Small}
                  variant={TextVariant.Title}
                >
                  {reminder.content.title}
                </TextComponent>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            className="mt-4 bg-mp-green p-3 rounded-lg items-center"
          >
            <TextComponent
              size={TextSize.Small}
              variant={TextVariant.Title}
              color={Color.White}
            >
              Close
            </TextComponent>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
