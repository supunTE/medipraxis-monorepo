import { TextComponent } from "@/components/basic";
import { groupReminders } from "@/utils";
import { Color, TextSize, TextVariant } from "@repo/config";
import clsx from "clsx";
import { ArrowsClockwise } from "phosphor-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
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
  compactTopSpacing?: boolean;
  headerRightAction?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
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
  compactTopSpacing = false,
  headerRightAction,
  onRefresh,
  isRefreshing = false,
  onAppointmentPress,
  onEmptySlotPress,
  onReminderPress,
}: AgendaComponentProps): React.JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRefreshing) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [isRefreshing, spinAnim]);

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

  const formatDateLine = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDayLine = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
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
        className={clsx("px-4 pb-4 bg-white z-10")}
        style={{
          paddingTop: compactTopSpacing ? 8 : 16,
          shadowColor: "#0000007b",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isScrolled ? 0.05 : 0,
          shadowRadius: 4,
          elevation: isScrolled ? 2 : 0,
        }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-col">
            <View className="flex-row items-center gap-3">
              <TextComponent size={TextSize.Small} variant={TextVariant.Title}>
                {formatDateLine(selectedDate)}
              </TextComponent>
              <TouchableOpacity
                onPress={onRefresh}
                disabled={isRefreshing}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="flex-row items-center gap-1"
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: spinAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  }}
                >
                  <ArrowsClockwise size={13} color={Color.Grey} weight="bold" />
                </Animated.View>
                <TextComponent
                  size={TextSize.Small}
                  variant={TextVariant.Body}
                  color={Color.Grey}
                >
                  Refresh
                </TextComponent>
              </TouchableOpacity>
            </View>
            <TextComponent size={TextSize.Small} variant={TextVariant.Body}>
              {formatDayLine(selectedDate)}
            </TextComponent>
          </View>
          {headerRightAction ? <View>{headerRightAction}</View> : null}
        </View>
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
              bgColor={getColorByIndex(index)?.bg}
              borderColor={getColorByIndex(index)?.border}
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
                  : (group.reminders[0]?.content ?? { id: "", title: "" })
              }
              startTime={group.startTime}
              endTime={group.endTime}
              isMerged={group.count > 1}
              isCompleted={
                group.count > 1
                  ? false
                  : (group.reminders[0]?.isCompleted ?? false)
              }
              onPress={
                group.count > 1
                  ? () => {
                      setSelectedReminderGroup(group.reminders);
                      setReminderModalVisible(true);
                    }
                  : () =>
                      onReminderPress?.(
                        group.reminders[0]?.content ?? { id: "", title: "" }
                      )
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
