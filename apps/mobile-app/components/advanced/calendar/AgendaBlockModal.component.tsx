import ButtonComponent, { ButtonSize } from "@/components/basic/Button.component";
import TextComponent from "@/components/basic";
import {
  formatDuration,
  getSlotTimeFromMinutes,
  parseTimeToMinutes,
} from "@/utils";
import { Color, TextSize, TextVariant } from "@repo/config";
import clsx from "clsx";
import { useRef } from "react";
import { Animated, Modal, Pressable, ScrollView, View } from "react-native";
import { AgendaBlockContent } from "./calendar.types";

interface AgendaBlockModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  startTime: string;
  endTime: string;
  slots: number;
  contents: (AgendaBlockContent | null)[];
  onAppointmentPress?: (
    appointment: AgendaBlockContent,
    groupId: string | null
  ) => void;
  onEmptySlotPress?: (groupId: string, slotNumber: number) => void;
}

interface SlotItemProps {
  content: AgendaBlockContent | null;
  slotTime: string;
  endSlotTime: string;
  slotDurationMinutes: number;
  onPress: () => void;
}

function SlotItem({
  content,
  slotTime,
  endSlotTime,
  slotDurationMinutes,
  onPress,
}: SlotItemProps) {
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
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        className={clsx("py-3 px-4 mb-2 rounded-lg", {
          "bg-[#F8F9FA] border-l-4 border-mp-green": content,
          "bg-white border border-dashed border-mp-light-grey": !content,
        })}
        style={{ transform: [{ scale: scaleAnim }] }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <TextComponent
              size={TextSize.Small}
              variant={TextVariant.Body}
              color={Color.Grey}
            >
              {slotTime} - {endSlotTime} ({formatDuration(slotDurationMinutes)})
            </TextComponent>
            {content ? (
              <>
                <TextComponent size={TextSize.Small} variant={TextVariant.Title}>
                  {content.title}
                </TextComponent>
                {content.client && (
                  <TextComponent size={TextSize.Small} variant={TextVariant.Body}>
                    Client: {content.client}
                  </TextComponent>
                )}
              </>
            ) : (
              <TextComponent
                size={TextSize.Small}
                variant={TextVariant.Body}
                color={Color.Grey}
              >
                Available
              </TextComponent>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function AgendaBlockModal({
  visible,
  onClose,
  groupId,
  startTime,
  endTime,
  slots,
  contents,
  onAppointmentPress,
  onEmptySlotPress,
}: AgendaBlockModalProps): React.JSX.Element {
  // Start and end times of full window in minutes
  const startTimeMinutes = parseTimeToMinutes(startTime);
  const endTimeMinutes = parseTimeToMinutes(endTime);
  // Total duration of the full window and per slot
  const totalDurationMinutes = endTimeMinutes - startTimeMinutes;
  const slotDurationMinutes = totalDurationMinutes / slots;
  // Count of reserved slots
  const reservedSlots = contents.filter((content) => content !== null).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-2xl p-5 w-[85%] h-[70%]">
          <View className="mb-4">
            <TextComponent size={TextSize.Medium} variant={TextVariant.Title}>
              Appointments
            </TextComponent>
            <TextComponent
              size={TextSize.Small}
              variant={TextVariant.Body}
              color={Color.Grey}
            >
              {reservedSlots}/{slots} slots reserved
            </TextComponent>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-4"
            showsVerticalScrollIndicator={true}
          >
            {contents.map((content, index) => {
              const slotTime = getSlotTimeFromMinutes(
                index,
                startTimeMinutes,
                slotDurationMinutes
              );
              const endSlotTime = getSlotTimeFromMinutes(
                index + 1,
                startTimeMinutes,
                slotDurationMinutes
              );

              return (
                <SlotItem
                  key={index}
                  content={content}
                  slotTime={slotTime}
                  endSlotTime={endSlotTime}
                  slotDurationMinutes={slotDurationMinutes}
                  onPress={() => {
                    if (content) {
                      onAppointmentPress?.(content, groupId);
                    } else {
                      onEmptySlotPress?.(groupId, index);
                    }
                  }}
                />
              );
            })}
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
