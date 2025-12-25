import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Color } from "@repo/config";
import { useFonts } from "expo-font";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { DateData } from "react-native-calendars";
import {
  Calendar,
  CalendarProvider,
  WeekCalendar,
} from "react-native-calendars";
import { Theme } from "react-native-calendars/src/types";
import { AgendaComponent } from "./Agenda.component";
import type {
  AgendaBlockContent,
  AgendaData,
  AgendaReminderContent,
} from "./calendar.types";

interface CalendarComponentProps {
  agendaData?: AgendaData;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  onAppointmentPress?: (
    appointment: AgendaBlockContent,
    groupId: string | null
  ) => void;
  onEmptySlotPress?: (groupId: string, slotNumber: number) => void;
  onReminderPress?: (reminder: AgendaReminderContent) => void;
}

export function CalendarComponent({
  agendaData,
  selectedDate,
  onDateChange,
  onAppointmentPress,
  onEmptySlotPress,
  onReminderPress,
}: CalendarComponentProps = {}) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Controls which calendar component renders - switches with animation timing
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const selected = selectedDate || today;

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    Lato_400Regular,
    Lato_700Bold,
  });

  // Animation values
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // When expanding, show full calendar immediately
    if (isExpanded) {
      setShowFullCalendar(true);
    }

    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        // use js thread to avoid issues
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 200,
        // use js thread to avoid issues
        useNativeDriver: false,
      }),
    ]).start(() => {
      // When collapsing, switch to week calendar after animation completes
      if (!isExpanded) {
        setShowFullCalendar(false);
      }
    });
  }, [isExpanded]);

  const toggleCalendar = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const renderArrow = useCallback((direction: "left" | "right") => {
    return direction === "left" ? (
      <CaretLeftIcon size={24} color={Color.Grey} weight="bold" />
    ) : (
      <CaretRightIcon size={24} color={Color.Grey} weight="bold" />
    );
  }, []);

  const renderToggleButton = useCallback(() => {
    return (
      <View className="flex-row justify-end items-center mt-2 mb-2 pr-4">
        <TouchableOpacity
          onPress={toggleCalendar}
          activeOpacity={0.7}
          className="bg-mp-light-green rounded-xl py-1 px-3 border border-mp-green"
        >
          <Text
            className="text-sm text-mp-black"
            style={{ fontFamily: "DMSans_500Medium" }}
          >
            {isExpanded ? "Week View ▲" : "Month View ▼"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [isExpanded, toggleCalendar]);

  const renderDay = useCallback(
    ({ date, state }: { date?: DateData; state?: string }) => {
      const isToday = date?.dateString === today;
      const isSelected = date?.dateString === selected;
      const isDisabled = state === "disabled";

      return (
        <TouchableOpacity
          onPress={() => {
            if (!isDisabled && date?.dateString) {
              onDateChange?.(date.dateString);
            }
          }}
          activeOpacity={0.7}
          style={{
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 16,
            borderWidth: isToday && !isSelected ? 2 : 0,
            borderColor: isToday && !isSelected ? Color.Green : "transparent",
            backgroundColor: isSelected ? Color.Green : "transparent",
          }}
        >
          <Text
            style={{
              fontFamily: "DMSans_400Regular",
              fontSize: 20,
              color: isSelected
                ? Color.White
                : isDisabled
                  ? "#A8B89D"
                  : "#000000",
              fontWeight: "400",
            }}
          >
            {date?.day}
          </Text>
        </TouchableOpacity>
      );
    },
    [today, selected, onDateChange]
  );

  if (!fontsLoaded) {
    return null;
  }

  const calendarTheme: Theme = {
    calendarBackground: "#E8F5B8",
    textSectionTitleColor: "#5A6B4D",
    textSectionTitleDisabledColor: "#A8B89D",
    monthTextColor: "#000000",
    dotColor: "#4F7F48",
    textDayFontSize: 20,
    textMonthFontSize: 20,
    textDayHeaderFontSize: 14,
    textDayFontFamily: "DMSans_400Regular",
    textMonthFontFamily: "DMSans_600SemiBold",
    textDayHeaderFontFamily: "DMSans_500Medium",
    textDayFontWeight: "400" as const,
    textMonthFontWeight: "bold" as const,
    textDayHeaderFontWeight: "400" as const,
    arrowColor: "#5A6B4D",
  };

  // Interpolate height for smooth animation
  const calendarHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [140, 425],
  });

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-grow-0"
        contentContainerStyle={{ flexGrow: 0 }}
      >
        <CalendarProvider date={selected}>
          <Animated.View
            className="overflow-hidden w-full relative"
            style={{
              height: calendarHeight,
              opacity: animatedOpacity,
            }}
          >
            {showFullCalendar && (
              <View className="bg-mp-secondary rounded-b-3xl overflow-hidden z-[2]">
                <Calendar
                  firstDay={1}
                  theme={calendarTheme}
                  style={{
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
                    padding: 16,
                  }}
                  renderArrow={renderArrow}
                  dayComponent={renderDay}
                />
              </View>
            )}
            {!showFullCalendar && (
              <View className="rounded-b-3xl overflow-hidden w-full">
                <WeekCalendar
                  firstDay={1}
                  theme={calendarTheme}
                  renderArrow={renderArrow}
                  dayComponent={renderDay}
                />
              </View>
            )}
            {showFullCalendar && !isExpanded && (
              <View className="absolute top-0 left-0 right-0 bg-mp-secondary z-[1]">
                <View className="rounded-b-3xl overflow-hidden w-full">
                  <WeekCalendar
                    firstDay={1}
                    theme={calendarTheme}
                    renderArrow={renderArrow}
                    dayComponent={renderDay}
                  />
                </View>
              </View>
            )}
            {renderToggleButton()}
          </Animated.View>
        </CalendarProvider>
      </ScrollView>
      <AgendaComponent
        selectedDate={selected}
        agendaData={agendaData}
        onAppointmentPress={onAppointmentPress}
        onEmptySlotPress={onEmptySlotPress}
        onReminderPress={onReminderPress}
      />
    </View>
  );
}
