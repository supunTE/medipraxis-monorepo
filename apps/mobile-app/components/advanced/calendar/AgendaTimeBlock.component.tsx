import { TextComponent } from "@/components/basic";
import { timeToDecimalHour } from "@/utils";
import { TextSize, TextVariant } from "@repo/config";
import { useRef } from "react";
import { Animated, Pressable, useWindowDimensions } from "react-native";
import { HOUR_HEIGHT } from "./calendar.constants";
import { type AgendaBlockContent } from "./calendar.types";

const APPOINTMENT_TEXT_LINE_HEIGHT = 14;
const TWO_LINE_MIN_HEIGHT = APPOINTMENT_TEXT_LINE_HEIGHT * 2 + 4;

interface AgendaTimeBlockProps {
  content: AgendaBlockContent;
  startTime: string;
  endTime: string;
  bgColor?: string;
  borderColor?: string;
  onPress?: (appointment: AgendaBlockContent, groupId: string | null) => void;
}

export function AgendaTimeBlock({
  content,
  startTime,
  endTime,
  bgColor = "#E3F2FD",
  borderColor = "#2196F3",
  onPress,
}: AgendaTimeBlockProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const startHourDecimal = timeToDecimalHour(startTime);
  const endHourDecimal = timeToDecimalHour(endTime);
  const height = (endHourDecimal - startHourDecimal) * HOUR_HEIGHT;
  const topPosition = startHourDecimal * HOUR_HEIGHT;

  // Calculate width for left column (appointments) - 75% of available space
  const LEFT_MARGIN = 60;
  const RIGHT_MARGIN = 16;
  const availableWidth = screenWidth - LEFT_MARGIN - RIGHT_MARGIN;
  const columnWidth = availableWidth * 0.7;
  const numberOfLines = height >= TWO_LINE_MIN_HEIGHT ? 2 : 1;
  const displayText =
    numberOfLines > 1 && content.client
      ? `${content.title}\n#${content.client}`
      : content.title;

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
      onPress={() => onPress?.(content, null)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="absolute"
      style={{
        height,
        top: topPosition,
        left: LEFT_MARGIN,
        width: columnWidth,
      }}
    >
      <Animated.View
        className="px-1 h-full border border-l-4 justify-center overflow-hidden"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <TextComponent
          size={TextSize.Small}
          variant={TextVariant.Body}
          numberOfLines={numberOfLines}
          ellipsizeMode="tail"
          style={{ lineHeight: APPOINTMENT_TEXT_LINE_HEIGHT }}
        >
          {displayText}
        </TextComponent>
      </Animated.View>
    </Pressable>
  );
}
