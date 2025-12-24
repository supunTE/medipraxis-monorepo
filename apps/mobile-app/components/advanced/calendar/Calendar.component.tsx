import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { useFonts } from "expo-font";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Calendar,
  CalendarProvider,
  WeekCalendar,
} from "react-native-calendars";
import { AgendaComponent } from "./Agenda.component";
import { AgendaData } from "./calendar.types";

interface CalendarComponentProps {
  agendaData?: AgendaData;
}

export function CalendarComponent({ agendaData }: CalendarComponentProps = {}) {
  const [selected, setSelected] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const today = new Date().toISOString().split("T")[0];

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
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 200,
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
      <CaretLeftIcon size={24} color="#5A6B4D" weight="bold" />
    ) : (
      <CaretRightIcon size={24} color="#5A6B4D" weight="bold" />
    );
  }, []);

  const renderToggleButton = useCallback(() => {
    return (
      <View style={styles.toggleButtonContainer}>
        <TouchableOpacity
          onPress={toggleCalendar}
          activeOpacity={0.7}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleButtonText}>
            {isExpanded ? "Collapse ▲" : "Expand ▼"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [isExpanded, toggleCalendar]);

  if (!fontsLoaded) {
    return null;
  }

  const markedDates = {
    ...(selected && selected !== today
      ? {
          [selected]: {
            selected: true,
            selectedColor: "#93C48B",
          },
        }
      : {}),
    ...(selected === today
      ? {
          [today]: {
            selected: true,
            selectedColor: "#93C48B",
          },
        }
      : {
          [today]: {
            customStyles: {
              container: {
                borderWidth: 2,
                borderColor: "#2D5026",
                borderRadius: 16,
                width: 40,
                height: 40,
                justifyContent: "center" as const,
                alignItems: "center" as const,
              },
              text: {
                color: "#4F7F48",
                fontWeight: "bold" as const,
              },
            },
          },
        }),
  };

  const calendarTheme = {
    calendarBackground: "#E8F5B8",
    textSectionTitleColor: "#5A6B4D",
    textSectionTitleDisabledColor: "#A8B89D",
    dayTextColor: "#000000",
    textDisabledColor: "#A8B89D",
    monthTextColor: "#000000",
    selectedDayBackgroundColor: "#93C48B",
    selectedDayTextColor: "#000000",
    todayTextColor: "#4F7F48",
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
    outputRange: [140, 420],
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <CalendarProvider date={selected || today}>
          <Animated.View
            style={[
              styles.animatedContainer,
              {
                height: calendarHeight,
                opacity: animatedOpacity,
              },
            ]}
          >
            {showFullCalendar && (
              <View style={styles.fullCalendarWrapper}>
                <Calendar
                  firstDay={1}
                  onDayPress={(day) => {
                    setSelected(day.dateString);
                  }}
                  markedDates={markedDates}
                  theme={calendarTheme}
                  style={styles.calendar}
                  renderArrow={renderArrow}
                />
              </View>
            )}
            {!showFullCalendar && (
              <View style={styles.calendarWrapper}>
                <WeekCalendar
                  firstDay={1}
                  markedDates={markedDates}
                  onDayPress={(day) => setSelected(day.dateString)}
                  theme={calendarTheme}
                  renderArrow={renderArrow}
                />
              </View>
            )}
            {showFullCalendar && !isExpanded && (
              <View style={styles.weekCalendarContainer}>
                <View style={styles.calendarWrapper}>
                  <WeekCalendar
                    firstDay={1}
                    markedDates={markedDates}
                    onDayPress={(day) => setSelected(day.dateString)}
                    theme={calendarTheme}
                    renderArrow={renderArrow}
                  />
                </View>
              </View>
            )}
            {renderToggleButton()}
          </Animated.View>
        </CalendarProvider>
      </ScrollView>
      <AgendaComponent selectedDate={selected || today} agendaData={agendaData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    flexGrow: 0,
  },
  animatedContainer: {
    overflow: "hidden",
    width: "100%",
    position: "relative",
  },
  fullCalendarWrapper: {
    backgroundColor: "#E8F5B8",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    zIndex: 2,
  },
  weekCalendarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#E8F5B8",
    zIndex: 1,
  },
  toggleButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    paddingRight: 16,
  },
  toggleButtonAbsolute: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    backgroundColor: "#E8F5B8",
  },
  toggleButton: {
    backgroundColor: "#E8F5B8",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D0E4A3",
  },
  toggleButtonText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: "#5A6B4D",
  },
  calendarWrapper: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    width: "100%",
  },
  calendar: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingLeft: 16,
    paddingRight: 16,
    padding: 16,
  },
});
