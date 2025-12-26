import TextComponent from "@/components/basic";
import { groupReminders } from "@/utils";
import { Color, TextSize, TextVariant } from "@repo/config";
import clsx from "clsx";
import React, { useMemo, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
import { AgendaReminderBlock } from "./AgendaReminderBlock.component";
import { AgendaReminderModal } from "./AgendaReminderModal.component";
import { AgendaTimeBlock } from "./AgendaTimeBlock.component";
import { AgendaTimeBlockGroup } from "./AgendaTimeBlockGroup.component";
import { AGENDA_COLORS, HOUR_HEIGHT } from "./calendar.constants";
import type {
  AgendaBlockContent,
  AgendaData,
  AgendaReminderContent,
  AgendaReminderData,
} from "./calendar.types";

interface AgendaComponentProps {
  selectedDate: string;
  agendaData?: AgendaData;
  onAppointmentPress?: (
    appointment: AgendaBlockContent,
    groupId: string | null
  ) => void;
  onEmptySlotPress?: (groupId: string, slotNumber: number) => void;
  onReminderPress?: (reminder: AgendaReminderContent) => void;
}

export function AgendaComponent({
  selectedDate,
  agendaData,
  onAppointmentPress,
  onEmptySlotPress,
  onReminderPress,
}: AgendaComponentProps): React.JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedReminderGroup, setSelectedReminderGroup] = useState<
    AgendaReminderData[]
  >([]);

  const hours = Array.from({ length: 25 }, (_, i) => {
    const hour = i % 12 || 12;
    const period = i < 12 ? "am" : "pm";
    return `${hour} ${period}`;
  });

  // Group reminders that are close together or overlapping
  const groupedReminders = useMemo(() => {
    if (!agendaData?.reminders) return [];
    return groupReminders(agendaData.reminders, 15, 30);
  }, [agendaData?.reminders]);

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

  const getColorByIndex = (index: number) => {
    return AGENDA_COLORS[index % AGENDA_COLORS.length];
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 0);
  };

  return (
    <>
      <View
        className={clsx("px-4 py-4 bg-white z-10")}
        style={{
          shadowColor: "#0000007b",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isScrolled ? 0.05 : 0,
          shadowRadius: 4,
          elevation: isScrolled ? 2 : 0,
        }}
      >
        <TextComponent size={TextSize.Small} variant={TextVariant.Title}>
          {formatDate(selectedDate)}
        </TextComponent>
      </View>
      <ScrollView
        className="flex-1 bg-white"
        contentContainerClassName="pt-4 pb-4"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View className="relative" style={{ minHeight: 25 * 60 }}>
          {hours.map((hour, index) => (
            <View
              key={index}
              className="flex-row relative"
              style={{ height: HOUR_HEIGHT }}
            >
              <View className="w-[70px] pr-5 absolute -top-2 left-0">
                <TextComponent
                  size={TextSize.Small}
                  variant={TextVariant.Body}
                  color={Color.Grey}
                  className="text-right"
                >
                  {hour}
                </TextComponent>
              </View>
              <View className="flex-1 h-[1px] bg-gray-200 ml-[60px]" />
            </View>
          ))}
          {agendaData?.timeBlocks?.map((block, index) => (
            <AgendaTimeBlock
              key={`timeblock-${index}`}
              content={block.content}
              startTime={block.startTime}
              endTime={block.endTime}
              bgColor={getColorByIndex(index).bg}
              borderColor={getColorByIndex(index).border}
              onPress={(appointment) => onAppointmentPress?.(appointment, null)}
            />
          ))}
          {agendaData?.timeBlockGroups?.map((group, index) => (
            <AgendaTimeBlockGroup
              key={`timeblockgroup-${index}`}
              groupId={group.id}
              startTime={group.startTime}
              endTime={group.endTime}
              slots={group.slots}
              contents={group.contents}
              onAppointmentPress={onAppointmentPress}
              onEmptySlotPress={onEmptySlotPress}
            />
          ))}
          {groupedReminders.map((group, index) => (
            <AgendaReminderBlock
              key={`reminder-group-${index}`}
              content={
                group.count > 1
                  ? { id: `group-${index}`, title: `${group.count} Tasks` }
                  : group.reminders[0].content
              }
              startTime={group.startTime}
              endTime={group.endTime}
              isMerged={group.count > 1}
              onPress={
                group.count > 1
                  ? () => {
                      setSelectedReminderGroup(group.reminders);
                      setReminderModalVisible(true);
                    }
                  : () => onReminderPress?.(group.reminders[0].content)
              }
            />
          ))}
        </View>
      </ScrollView>
      <AgendaReminderModal
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        reminders={selectedReminderGroup}
        onReminderPress={onReminderPress}
      />
    </>
  );
}
