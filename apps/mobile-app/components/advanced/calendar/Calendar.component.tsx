import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { Color } from "@repo/config";
import { useFonts } from "expo-font";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
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
import { type Theme } from "react-native-calendars/src/types";
import { AgendaComponent } from "./Agenda.component";
import type {
  AgendaBlockContent,
  AgendaData,
  AgendaReminderContent,
} from "./calendar.types";

function getWeekRowCount(year: number, month: number, firstDay = 1): number {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  let offset = first.getDay() - firstDay;
  if (offset < 0) offset += 7;
  return Math.ceil((offset + daysInMonth) / 7);
}

interface CalendarComponentProps {
  agendaData?: AgendaData;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  agendaHeaderRightAction?: React.ReactNode;
  onAgendaRefresh?: () => void;
  isAgendaRefreshing?: boolean;
  onAppointmentPress?: (
    appointment: AgendaBlockContent,
    groupId: string | null
  ) => void;
  onEmptySlotPress?: (groupId: string, slotNumber: number) => void;
  onReminderPress?: (reminder: AgendaReminderContent) => void;
}

interface DayComponentProps {
  date?: DateData;
  state?: string;
  today: string;
  selected: string;
  onDateChange?: (date: string) => void;
}

function DayComponent({
  date,
  state,
  today,
  selected,
  onDateChange,
}: DayComponentProps) {
  const isToday = date?.dateString === today;
  const isSelected = date?.dateString === selected;
  const isDisabled = state === "disabled";
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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
      onPress={() => {
        if (!isDisabled && date?.dateString) {
          onDateChange?.(date.dateString);
        }
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <Animated.View
        style={{
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 16,
          borderWidth: isToday && !isSelected ? 2 : 0,
          borderColor: isToday && !isSelected ? Color.Green : "transparent",
          backgroundColor: isSelected ? Color.Green : "transparent",
          transform: [{ scale: scaleAnim }],
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
                : Color.DarkGreen,
            fontWeight: "400",
          }}
        >
          {date?.day}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function CalendarComponent({
  agendaData,
  selectedDate,
  onDateChange,
  agendaHeaderRightAction,
  onAgendaRefresh,
  isAgendaRefreshing = false,
  onAppointmentPress,
  onEmptySlotPress,
  onReminderPress,
}: CalendarComponentProps = {}) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Controls which calendar component renders
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const today = new Date().toISOString().split("T")[0] || "";
  const selected = selectedDate || today;

  const initialDate = new Date(selected);
  const [weekRows, setWeekRows] = useState(() =>
    getWeekRowCount(initialDate.getFullYear(), initialDate.getMonth() + 1)
  );

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  // Animation values
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const calendarOpacity = useRef(new Animated.Value(1)).current;
  const isCollapsingTransition = useRef(false);

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: isExpanded ? 260 : 220,
      easing: Easing.out(Easing.cubic),
      // height animation requires JS driver
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isExpanded) {
        if (isCollapsingTransition.current) {
          // Mount week view first at low opacity, then fade it in.
          calendarOpacity.setValue(0.7);
          setShowFullCalendar(false);
          requestAnimationFrame(() => {
            Animated.timing(calendarOpacity, {
              toValue: 1,
              duration: 140,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }).start(() => {
              isCollapsingTransition.current = false;
            });
          });
        } else {
          setShowFullCalendar(false);
        }
      }
    });
  }, [isExpanded, animatedHeight, calendarOpacity]);

  const toggleCalendar = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;

      if (next) {
        const d = new Date(selected);
        setWeekRows(getWeekRowCount(d.getFullYear(), d.getMonth() + 1));

        setShowFullCalendar(true);
        calendarOpacity.setValue(0.88);
        Animated.timing(calendarOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      } else {
        isCollapsingTransition.current = true;
        Animated.timing(calendarOpacity, {
          toValue: 0.92,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      }

      return next;
    });
  }, [calendarOpacity, selected]);

  const onMonthChange = useCallback((date: DateData) => {
    setWeekRows(getWeekRowCount(date.year, date.month));
  }, []);

  const renderArrow = useCallback((direction: "left" | "right") => {
    return direction === "left" ? (
      <CaretLeftIcon size={24} color={Color.Grey} weight="bold" />
    ) : (
      <CaretRightIcon size={24} color={Color.Grey} weight="bold" />
    );
  }, []);

  const renderToggleButton = useCallback(() => {
    return (
      <View
        className="flex-row justify-end items-center pr-4 gap-2"
        style={{
          marginTop: isExpanded ? 8 : 4,
          marginBottom: isExpanded ? 8 : 2,
        }}
      >
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
      return (
        <DayComponent
          date={date}
          state={state}
          today={today}
          selected={selected}
          onDateChange={onDateChange}
        />
      );
    },
    [today, selected, onDateChange]
  );

  if (!fontsLoaded) {
    return null;
  }

  const calendarTheme: Theme = {
    calendarBackground: Color.LightGreen,
    textSectionTitleColor: "#5A6B4D",
    textSectionTitleDisabledColor: "#A8B89D",
    monthTextColor: Color.DarkGreen,
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
  const expandedHeight = weekRows === 6 ? 480 : 425;
  const calendarHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [140, expandedHeight],
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
            }}
          >
            {showFullCalendar && (
              <Animated.View
                className="bg-mp-secondary rounded-b-3xl overflow-hidden z-[2]"
                style={{ opacity: calendarOpacity }}
              >
                <Calendar
                  current={selected}
                  firstDay={1}
                  theme={calendarTheme}
                  style={{
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
                    padding: 16,
                  }}
                  renderArrow={renderArrow}
                  dayComponent={renderDay}
                  onMonthChange={onMonthChange}
                />
              </Animated.View>
            )}
            {!showFullCalendar && (
              <Animated.View
                className="bg-mp-secondary rounded-b-3xl overflow-hidden w-full"
                style={{ opacity: calendarOpacity }}
              >
                <WeekCalendar
                  firstDay={1}
                  theme={calendarTheme}
                  renderArrow={renderArrow}
                  dayComponent={renderDay}
                />
              </Animated.View>
            )}
            {renderToggleButton()}
          </Animated.View>
        </CalendarProvider>
      </ScrollView>
      <AgendaComponent
        selectedDate={selected}
        agendaData={agendaData}
        compactTopSpacing={!isExpanded}
        headerRightAction={agendaHeaderRightAction}
        onRefresh={onAgendaRefresh}
        isRefreshing={isAgendaRefreshing}
        onAppointmentPress={onAppointmentPress}
        onEmptySlotPress={onEmptySlotPress}
        onReminderPress={onReminderPress}
      />
    </View>
  );
}
