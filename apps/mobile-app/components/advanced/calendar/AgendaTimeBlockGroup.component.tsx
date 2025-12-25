import TextComponent from "@/components/basic";
import { timeToDecimalHour } from "@/utils";
import { Color, TextSize, TextVariant } from "@repo/config";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { AgendaBlockModal } from "./AgendaBlockModal.component";
import {
  AGENDA_COLORS,
  HOUR_HEIGHT,
  MIN_SLOT_DURATION_MINUTES,
} from "./calendar.constants";
import { AgendaBlockContent } from "./calendar.types";

interface AgendaTimeBlockGroupProps {
  groupId: string;
  startHour: string;
  endHour: string;
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
  startHour,
  endHour,
  slots,
  contents,
  onAppointmentPress,
  onEmptySlotPress,
}: AgendaTimeBlockGroupProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);

  const startHourDecimal = timeToDecimalHour(startHour);
  const endHourDecimal = timeToDecimalHour(endHour);
  const totalHeight = (endHourDecimal - startHourDecimal) * HOUR_HEIGHT;
  const slotHeight = totalHeight / slots;
  const topPosition = startHourDecimal * HOUR_HEIGHT;
  const LEFT_MARGIN = 60;
  const RIGHT_MARGIN = 16;

  // Calculate width for left column (appointments) - 75% of available space
  const availableWidth = screenWidth - LEFT_MARGIN - RIGHT_MARGIN;
  const columnWidth = availableWidth * 0.75;

  // Calculate slot duration in minutes
  const totalDurationMinutes = (endHourDecimal - startHourDecimal) * 60;
  const slotDurationMinutes = totalDurationMinutes / slots;

  // Count reserved slots
  const reservedSlots = contents.filter((content) => content !== null).length;

  // Show summary overlay if slot duration is less than the minimum threshold
  const showSummaryOverlay = slotDurationMinutes < MIN_SLOT_DURATION_MINUTES;

  return (
    <View
      style={{
        position: "absolute",
        height: totalHeight,
        top: topPosition,
        left: LEFT_MARGIN,
        width: columnWidth,
      }}
    >
      {Array.from({ length: slots }).map((_, index) => {
        const content = contents[index];
        const color = AGENDA_COLORS[index % AGENDA_COLORS.length];

        return (
          <Pressable
            key={index}
            onPress={() => setModalVisible(true)}
            style={{
              height: slotHeight,
              backgroundColor: content ? color.bg : "#F3F4F6",
              borderColor: content ? color.border : Color.LightGrey,
              borderWidth: 1,
              borderLeftWidth: 4,
              paddingLeft: 16,
              opacity: content ? 1 : 0.5,
            }}
            className="flex flex-row items-center gap-2"
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
          </Pressable>
        );
      })}
      {showSummaryOverlay && (
        <Pressable
          onPress={() => setModalVisible(true)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <LinearGradient
            colors={[
              "rgba(247, 247, 247, 0.9)",
              "rgba(247, 247, 247, 0.8)",
              "rgba(247, 247, 247, 0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flex: 1,
              justifyContent: "center",
              paddingLeft: 16,
            }}
          >
            <TextComponent size={TextSize.Medium} variant={TextVariant.Body}>
              {reservedSlots}/{slots} slots reserved
            </TextComponent>
            <TextComponent size={TextSize.Small} variant={TextVariant.Body}>
              Click to open
            </TextComponent>
          </LinearGradient>
        </Pressable>
      )}
      <AgendaBlockModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        groupId={groupId}
        startHour={startHour}
        endHour={endHour}
        slots={slots}
        contents={contents}
        onAppointmentPress={onAppointmentPress}
        onEmptySlotPress={onEmptySlotPress}
      />
    </View>
  );
}
