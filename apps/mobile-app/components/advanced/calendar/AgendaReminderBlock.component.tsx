import TextComponent from "@/components/basic";
import { parseTimeToMinutes } from "@/utils";
import { TextSize, TextVariant } from "@repo/config";
import { useRef } from "react";
import { Animated, Pressable, useWindowDimensions } from "react-native";
import { HOUR_HEIGHT } from "./calendar.constants";
import { type AgendaReminderContent } from "./calendar.types";

interface AgendaReminderBlockProps {
  content: AgendaReminderContent;
  startTime: string;
  endTime?: string;
  isMerged?: boolean;
  onPress?: (reminder: AgendaReminderContent) => void;
}

export function AgendaReminderBlock({
  content,
  startTime,
  endTime,
  isMerged = false,
  onPress,
}: AgendaReminderBlockProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // If no endTime, default to 30 minutes from startTime
  // Ensure minimum duration of 30 minutes even when endTime is provided
  const startTimeMinutes = parseTimeToMinutes(startTime);
  const calculatedEndTimeMinutes = endTime
    ? parseTimeToMinutes(endTime)
    : startTimeMinutes + 30;

  // Enforce minimum 30 minute duration
  const endTimeMinutes = Math.max(
    calculatedEndTimeMinutes,
    startTimeMinutes + 30
  );

  const startHourDecimal = startTimeMinutes / 60;
  const endHourDecimal = endTimeMinutes / 60;

  const height = (endHourDecimal - startHourDecimal) * HOUR_HEIGHT;
  const topPosition = startHourDecimal * HOUR_HEIGHT;

  // Calculate position for right column (30% of available space)
  const LEFT_MARGIN = 60;
  const RIGHT_MARGIN = 16;
  const availableWidth = screenWidth - LEFT_MARGIN - RIGHT_MARGIN;
  const leftColumnWidth = availableWidth * 0.7;
  const columnWidth = availableWidth * 0.3;
  const leftPosition = LEFT_MARGIN + leftColumnWidth;

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
      onPress={() => onPress?.(content)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="absolute"
      style={{
        height,
        top: topPosition,
        left: leftPosition,
        width: columnWidth,
      }}
    >
      <Animated.View
        className="px-1 h-full bg-mp-light-green border border-mp-green justify-center"
        style={{ transform: [{ scale: scaleAnim }] }}
      >
        <TextComponent
          size={isMerged ? TextSize.Medium : TextSize.Small}
          variant={TextVariant.Body}
          numberOfLines={2}
        >
          {content.title}
        </TextComponent>
      </Animated.View>
    </Pressable>
  );
}
