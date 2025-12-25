import TextComponent from "@/components/basic";
import { Color, TextSize, TextVariant } from "@repo/config";
import React, { useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
import { AgendaTimeBlock } from "./AgendaTimeBlock.component";
import { AgendaTimeBlockGroup } from "./AgendaTimeBlockGroup.component";
import { AGENDA_COLORS, HOUR_HEIGHT } from "./calendar.constants";
import { AgendaBlockContent, AgendaData } from "./calendar.types";

interface AgendaComponentProps {
  selectedDate: string;
  agendaData?: AgendaData;
  onAppointmentPress?: (appointment: AgendaBlockContent, groupId: string | null) => void;
  onEmptySlotPress?: (groupId: string, slotNumber: number) => void;
}

export function AgendaComponent({
  selectedDate,
  agendaData,
  onAppointmentPress,
  onEmptySlotPress,
}: AgendaComponentProps): React.JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const hours = Array.from({ length: 25 }, (_, i) => {
    const hour = i % 12 || 12;
    const period = i < 12 ? "am" : "pm";
    return `${hour} ${period}`;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getColorByHour = (startHour: number) => {
    return AGENDA_COLORS[startHour % AGENDA_COLORS.length];
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 0);
  };

  return (
    <>
      <View
        className="px-4 py-4 bg-white"
        style={{
          shadowColor: "#0000007b",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isScrolled ? 0.05 : 0,
          shadowRadius: 4,
          elevation: isScrolled ? 2 : 0,
          zIndex: 10,
        }}
      >
        <TextComponent size={TextSize.Small} variant={TextVariant.Title}>
          {formatDate(selectedDate)}
        </TextComponent>
      </View>
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={{ position: "relative", minHeight: 25 * 60 }}>
          {hours.map((hour, index) => (
            <View
              key={index}
              className="flex-row"
              style={{ position: "relative", height: HOUR_HEIGHT }}
            >
              <View
                className="w-[70px] pr-5"
                style={{ position: "absolute", top: -8, left: 0 }}
              >
                <TextComponent
                  size={TextSize.Small}
                  variant={TextVariant.Body}
                  color={Color.Grey}
                  className="text-right"
                >
                  {hour}
                </TextComponent>
              </View>
              <View
                className="flex-1 h-[1px] bg-gray-200"
                style={{ marginLeft: 60 }}
              />
            </View>
          ))}
          {agendaData?.timeBlocks?.map((block, index) => (
            <AgendaTimeBlock
              key={`timeblock-${index}`}
              content={block.content}
              startHour={block.startHour}
              endHour={block.endHour}
              bgColor={getColorByHour(block.startHour).bg}
              borderColor={getColorByHour(block.startHour).border}
              onPress={(appointment) => onAppointmentPress?.(appointment, null)}
            />
          ))}
          {agendaData?.timeBlockGroups?.map((group, index) => (
            <AgendaTimeBlockGroup
              key={`timeblockgroup-${index}`}
              groupId={group.id}
              startHour={group.startHour}
              endHour={group.endHour}
              slots={group.slots}
              contents={group.contents}
              onAppointmentPress={onAppointmentPress}
              onEmptySlotPress={onEmptySlotPress}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}
