import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
import { Color, TextSize, TextVariant } from "@repo/config";
import { useRef } from "react";
import { Animated, Modal, Pressable, ScrollView, View } from "react-native";
import {
  type AgendaReminderContent,
  type AgendaReminderData,
} from "./calendar.types";

interface AgendaReminderModalProps {
  visible: boolean;
  onClose: () => void;
  reminders: AgendaReminderData[];
  onReminderPress?: (reminder: AgendaReminderContent) => void;
}

interface ReminderItemProps {
  reminder: AgendaReminderData;
  onPress: () => void;
}

function ReminderItem({ reminder, onPress }: ReminderItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        className="py-3 px-4 mb-2 bg-[#F8F9FA] rounded-lg border-l-4 border-mp-green"
        style={{ transform: [{ scale: scaleAnim }] }}
      >
        <TextComponent
          size={TextSize.Small}
          variant={TextVariant.Body}
          color={Color.Grey}
        >
          {reminder.startTime}
          {reminder.endTime && ` - ${reminder.endTime}`}
        </TextComponent>
        <TextComponent size={TextSize.Small} variant={TextVariant.Title}>
          {reminder.content.title}
        </TextComponent>
      </Animated.View>
    </Pressable>
  );
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
              <ReminderItem
                key={index}
                reminder={reminder}
                onPress={() => {
                  onReminderPress?.(reminder.content);
                  onClose();
                }}
              />
            ))}
          </ScrollView>

          <ButtonComponent
            onPress={onClose}
            size={ButtonSize.Medium}
            buttonColor={Color.Green}
            textColor={Color.White}
            className="mt-4 rounded-lg"
          >
            Close
          </ButtonComponent>
        </View>
      </View>
    </Modal>
  );
}
