import TextComponent from "@/components/basic";
import { TextSize, TextVariant } from "@repo/config";
import { Pressable } from "react-native";
import { HOUR_HEIGHT } from "./calendar.constants";
import { AgendaBlockContent } from "./calendar.types";

interface AgendaTimeBlockProps {
  content: AgendaBlockContent;
  startHour: number;
  endHour: number;
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
  const height = (endHour - startHour) * HOUR_HEIGHT;
  const topPosition = startHour * HOUR_HEIGHT;

  return (
    <Pressable
      onPress={() => onPress?.(content, null)}
      style={{
        position: "absolute",
        height,
        top: topPosition,
        left: 60,
        right: 16,
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: 1,
        borderLeftWidth: 4,
        paddingLeft: 16,
      }}
      className="flex flex-row items-center gap-2"
    >
      <TextComponent size={TextSize.Small} variant={TextVariant.Body}>
        {content.title}
      </TextComponent>
      {content.client && (
        <TextComponent size={TextSize.Small} variant={TextVariant.Body}>
          #{content.client}
        </TextComponent>
      )}
    </Pressable>
  );
}
