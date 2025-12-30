import TextComponent from "@/components/basic";
import { timeToDecimalHour } from "@/utils";
import { Color, TextSize, TextVariant } from "@repo/config";
import clsx from "clsx";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import { Animated, Pressable, View, useWindowDimensions } from "react-native";
import { AgendaBlockModal } from "./AgendaBlockModal.component";
import {
  AGENDA_COLORS,
  HOUR_HEIGHT,
  MIN_SLOT_DURATION_MINUTES,
} from "./calendar.constants";
import { type AgendaBlockContent } from "./calendar.types";

interface AgendaTimeBlockGroupProps {
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

export function AgendaTimeBlockGroup({
  groupId,
  startTime: startHour,
  endTime: endHour,
  slots,
  contents,
  onAppointmentPress,
  onEmptySlotPress,
}: AgendaTimeBlockGroupProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const startHourDecimal = timeToDecimalHour(startHour);
  const endHourDecimal = timeToDecimalHour(endHour);
  const totalHeight = (endHourDecimal - startHourDecimal) * HOUR_HEIGHT;
  const slotHeight = totalHeight / slots;
  const topPosition = startHourDecimal * HOUR_HEIGHT;
  const LEFT_MARGIN = 60;
  const RIGHT_MARGIN = 16;

  // Calculate width for left column (appointments) - 75% of available space
  const availableWidth = screenWidth - LEFT_MARGIN - RIGHT_MARGIN;
  const columnWidth = availableWidth * 0.7;

  // Calculate slot duration in minutes
  const totalDurationMinutes = (endHourDecimal - startHourDecimal) * 60;
  const slotDurationMinutes = totalDurationMinutes / slots;

  // Count reserved slots
  const reservedSlots = contents.filter((content) => content !== null).length;

  // Show summary overlay if slot duration is less than the minimum threshold
  const showSummaryOverlay = slotDurationMinutes < MIN_SLOT_DURATION_MINUTES;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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
      onPress={() => setModalVisible(true)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="absolute"
      style={{
        height: totalHeight,
        top: topPosition,
        left: LEFT_MARGIN,
        width: columnWidth,
      }}
    >
      <Animated.View
        className="h-full"
        style={{ transform: [{ scale: scaleAnim }] }}
      >
        {Array.from({ length: slots }).map((_, index) => {
          const content = contents[index];
          const color = AGENDA_COLORS[index % AGENDA_COLORS.length];

          return (
            <View
              key={index}
              className={clsx(
                "flex flex-row items-center gap-2 border border-l-4 pl-4",
                {
                  "opacity-100": content,
                  "opacity-50": !content,
                }
              )}
              style={{
                height: slotHeight,
                backgroundColor: content ? color?.bg : "#F3F4F6",
                borderColor: content ? color?.border : Color.LightGrey,
              }}
            >
              {content && !showSummaryOverlay && (
                <>
                  <TextComponent
                    size={TextSize.Small}
                    variant={TextVariant.Body}
                    numberOfLines={1}
                  >
                    {content.title}
                  </TextComponent>
                  {content.client && (
                    <TextComponent
                      size={TextSize.Small}
                      variant={TextVariant.Body}
                      numberOfLines={1}
                    >
                      #{content.client}
                    </TextComponent>
                  )}
                </>
              )}
            </View>
          );
        })}
        {showSummaryOverlay && (
          <View className="absolute top-0 left-0 right-0 bottom-0">
            <LinearGradient
              colors={[
                "rgba(247, 247, 247, 0.9)",
                "rgba(247, 247, 247, 0.8)",
                "rgba(247, 247, 247, 0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-1 justify-center pl-4"
            >
              <TextComponent size={TextSize.Medium} variant={TextVariant.Body}>
                {reservedSlots}/{slots} slots reserved
              </TextComponent>
              <TextComponent size={TextSize.Small} variant={TextVariant.Body}>
                Click to open
              </TextComponent>
            </LinearGradient>
          </View>
        )}
      </Animated.View>
      <AgendaBlockModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        groupId={groupId}
        startTime={startHour}
        endTime={endHour}
        slots={slots}
        contents={contents}
        onAppointmentPress={onAppointmentPress}
        onEmptySlotPress={onEmptySlotPress}
      />
    </Pressable>
  );
}
