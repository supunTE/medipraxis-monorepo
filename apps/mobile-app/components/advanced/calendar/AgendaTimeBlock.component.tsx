import TextComponent from "@/components/basic";
import { TextSize, TextVariant } from "@repo/config";
import { View } from "react-native";
import { HOUR_HEIGHT } from "./calendar.constants";

export interface AgendaBlockContent {
  title: string;
  client?: string;
}

interface AgendaTimeBlockProps {
  content: AgendaBlockContent;
  startHour: number;
  endHour: number;
  bgColor?: string;
  borderColor?: string;
}

export function AgendaTimeBlock({
  content,
  startHour,
  endHour,
  bgColor = "#E3F2FD",
  borderColor = "#2196F3",
}: AgendaTimeBlockProps): React.JSX.Element {
  const height = (endHour - startHour) * HOUR_HEIGHT;
  const topPosition = startHour * HOUR_HEIGHT;

  return (
    <View
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
    </View>
  );
}
