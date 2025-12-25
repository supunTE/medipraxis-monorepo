import TextComponent from "@/components/basic";
import { timeToDecimalHour } from "@/utils";
import { TextSize, TextVariant } from "@repo/config";
import { Pressable, useWindowDimensions } from "react-native";
import { HOUR_HEIGHT } from "./calendar.constants";
import { AgendaBlockContent } from "./calendar.types";

interface AgendaTimeBlockProps {
  content: AgendaBlockContent;
  startHour: string;
  endHour: string;
  bgColor?: string;
  borderColor?: string;
  onPress?: (appointment: AgendaBlockContent, groupId: string | null) => void;
}

export function AgendaTimeBlock({
  content,
  startHour,
  endHour,
  bgColor = "#E3F2FD",
  borderColor = "#2196F3",
  onPress,
}: AgendaTimeBlockProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  const startHourDecimal = timeToDecimalHour(startHour);
  const endHourDecimal = timeToDecimalHour(endHour);
  const height = (endHourDecimal - startHourDecimal) * HOUR_HEIGHT;
  const topPosition = startHourDecimal * HOUR_HEIGHT;

  // Calculate width for left column (appointments) - 75% of available space
  const LEFT_MARGIN = 60;
  const RIGHT_MARGIN = 16;
  const availableWidth = screenWidth - LEFT_MARGIN - RIGHT_MARGIN;
  const columnWidth = availableWidth * 0.75;

  return (
    <Pressable
      onPress={() => onPress?.(content, null)}
      style={{
        position: "absolute",
        height,
        top: topPosition,
        left: LEFT_MARGIN,
        width: columnWidth,
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: 1,
        borderLeftWidth: 4,
        paddingLeft: 16,
      }}
      className="flex flex-row items-center gap-2"
    >
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
    </Pressable>
  );
}
