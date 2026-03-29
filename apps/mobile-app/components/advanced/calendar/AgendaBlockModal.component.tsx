import { TextComponent } from "@/components/basic";
import { Text } from "@/components/Themed";
import { Icons } from "@/config";

import {
  formatDuration,
  getSlotTimeFromMinutes,
  parseTimeToMinutes,
} from "@/utils";
import { Color, TextSize, TextVariant } from "@repo/config";
import clsx from "clsx";
import { useRef } from "react";
import { Animated, Modal, Pressable, ScrollView, View } from "react-native";
import { type AgendaBlockContent } from "./calendar.types";

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
  onCancelSlotWindow?: () => void;
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
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
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
                <TextComponent
                  size={TextSize.Small}
                  variant={TextVariant.Title}
                >
                  {content.title}
                </TextComponent>
                {content.client && (
                  <TextComponent
                    size={TextSize.Small}
                    variant={TextVariant.Body}
                  >
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
  onCancelSlotWindow,
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
        <View className="bg-white rounded-2xl overflow-hidden w-[85%] h-[70%]">
          {/* Scrollable content */}
          <View className="flex-1 p-5">
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
          </View>

          {/* Footer — same pattern as ViewAppointmentModal / ViewReminderModal */}
          <View className="bg-[#EAF8C9] p-4 flex-row justify-end gap-x-2.5 border-t border-gray-100">
            <Pressable
              className="flex-row items-center bg-[#FF5A5F] py-2.5 px-4 rounded-lg gap-x-2"
              onPress={onCancelSlotWindow}
            >
              <Icons.Trash size={18} color="white" weight="bold" />
              <Text
                darkColor="white"
                lightColor="white"
                className="font-semibold text-sm"
              >
                Cancel Slot Window
              </Text>
            </Pressable>
            <Pressable
              className="flex-row items-center bg-slate-900 py-2.5 px-4 rounded-lg gap-x-2"
              onPress={onClose}
            >
              <Text
                darkColor="white"
                lightColor="white"
                className="font-semibold text-sm"
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
