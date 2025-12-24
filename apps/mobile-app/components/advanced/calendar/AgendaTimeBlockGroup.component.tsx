import TextComponent from "@/components/basic";
import { Color, TextSize, TextVariant } from "@repo/config";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { AgendaBlockContent } from "./AgendaTimeBlock.component";
import { AgendaBlockModal } from "./AgendaBlockModal.component";
import { AGENDA_COLORS, HOUR_HEIGHT, MIN_SLOT_DURATION_MINUTES } from "./ui";

interface AgendaTimeBlockGroupProps {
  startHour: number;
  endHour: number;
  slots: number;
  contents: (AgendaBlockContent | null)[];
}

export function AgendaTimeBlockGroup({
  startHour,
  endHour,
  slots,
  contents,
}: AgendaTimeBlockGroupProps): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);

  const totalHeight = (endHour - startHour) * HOUR_HEIGHT;
  const slotHeight = totalHeight / slots;
  const topPosition = startHour * HOUR_HEIGHT;
  const LEFT_MARGIN = 60;
  const RIGHT_MARGIN = 16;

  // Calculate slot duration in minutes
  const totalDurationMinutes = (endHour - startHour) * 60;
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
        right: RIGHT_MARGIN,
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
                <TextComponent size={TextSize.Small} variant={TextVariant.Body}>
                  {content.title}
                </TextComponent>
                {content.client && (
                  <TextComponent
                    size={TextSize.Small}
                    variant={TextVariant.Body}
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
        startHour={startHour}
        endHour={endHour}
        slots={slots}
        contents={contents}
      />
    </View>
  );
}
