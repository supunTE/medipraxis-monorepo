import { Icon } from "@/components/ui/icon";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Icons } from "@/config";
import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type TextStyle as RNTextStyle,
} from "react-native";
import { Calendar } from "react-native-calendars";

interface DateTimePickerProps {
  label?: string;
  value?: string;
  onChange?: (dateString: string) => void;
  placeholder?: string;
  mode?: "date" | "time" | "datetime";
  isInvalid?: boolean;
  isDisabled?: boolean;
  helperText?: string;
  hideHelperText?: boolean;
  className?: string;
}

const textLargeStyle = textStyles[TextVariant.Body][TextSize.Large];
const textSmallStyle = textStyles[TextVariant.Body][TextSize.Small];

const padZero = (num: number) => String(num).padStart(2, "0");

const monthNamesFull = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const shortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const DateTimePickerComponent: React.FC<DateTimePickerProps> = ({
  label,
  value = "",
  onChange,
  placeholder = "Select Date & Time",
  mode = "datetime",
  isInvalid = false,
  isDisabled = false,
  helperText,
  hideHelperText = false,
  className,
}) => {
  const [showModal, setShowModal] = useState(false);

  let initialDate = new Date();
  if (value) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      initialDate = d;
    }
  }

  const [tempDate, setTempDate] = useState<Date>(initialDate);
  const [tempHours, setTempHours] = useState(initialDate.getHours() % 12 || 12);
  const [tempMinutes, setTempMinutes] = useState(initialDate.getMinutes());
  const [tempIsPM, setTempIsPM] = useState(initialDate.getHours() >= 12);

  // Overlays
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(mode === "time");

  useEffect(() => {
    if (showModal) {
      let d = new Date();
      if (value) {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          d = parsed;
        }
      }
      setTempDate(d);
      setTempHours(d.getHours() % 12 || 12);
      setTempMinutes(d.getMinutes());
      setTempIsPM(d.getHours() >= 12);
      setShowMonthYearPicker(false);
      setShowTimePicker(mode === "time");
    }
  }, [showModal, value, mode]);

  const handleConfirm = () => {
    setShowModal(false);
    const finalDate = new Date(tempDate);
    if (mode === "time" || mode === "datetime") {
      let h = tempHours;
      if (tempIsPM && h !== 12) h += 12;
      if (!tempIsPM && h === 12) h = 0;
      finalDate.setHours(h);
      finalDate.setMinutes(tempMinutes);
    }

    const formatted = `${finalDate.getFullYear()}-${padZero(finalDate.getMonth() + 1)}-${padZero(finalDate.getDate())}T${padZero(finalDate.getHours())}:${padZero(finalDate.getMinutes())}`;
    if (onChange) onChange(formatted);
  };

  const formatDisplay = (d: Date) => {
    const ampm = d.getHours() >= 12 ? "PM" : "AM";
    const hours = d.getHours() % 12 || 12;
    const mins = padZero(d.getMinutes());

    if (mode === "date")
      return `${shortMonthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    if (mode === "time") return `${hours}:${mins} ${ampm}`;
    return `${shortMonthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}  ${hours}:${mins} ${ampm}`;
  };

  const selectedDateStr = `${tempDate.getFullYear()}-${padZero(tempDate.getMonth() + 1)}-${padZero(tempDate.getDate())}`;

  const baseYear = new Date().getFullYear();
  const yearsOptions = Array.from({ length: 40 }, (_, i) => baseYear - 10 + i);
  const hoursOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutesOptions = Array.from({ length: 60 }, (_, i) => i);

  const ITEM_HEIGHT = 44;
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  // Auto-scroll month/year to selected item
  useEffect(() => {
    if (showMonthYearPicker) {
      setTimeout(() => {
        const monthIdx = tempDate.getMonth();
        monthScrollRef.current?.scrollTo({
          y: Math.max(0, monthIdx * ITEM_HEIGHT - ITEM_HEIGHT),
          animated: false,
        });
        const yearIdx = tempDate.getFullYear() - (baseYear - 10);
        yearScrollRef.current?.scrollTo({
          y: Math.max(0, yearIdx * ITEM_HEIGHT - ITEM_HEIGHT),
          animated: false,
        });
      }, 50);
    }
  }, [showMonthYearPicker]);

  // Auto-scroll time picker to selected hour/minute
  useEffect(() => {
    if (showTimePicker) {
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({
          y: Math.max(0, (tempHours - 1) * ITEM_HEIGHT - ITEM_HEIGHT),
          animated: false,
        });
        minuteScrollRef.current?.scrollTo({
          y: Math.max(0, tempMinutes * ITEM_HEIGHT - ITEM_HEIGHT),
          animated: false,
        });
      }, 50);
    }
  }, [showTimePicker]);

  return (
    <View className={`w-full ${className || ""}`}>
      {label && (
        <Text
          className="mb-2"
          style={{
            color: Color.Black,
            fontFamily:
              textLargeStyle.fontFamily === Font.DMsans
                ? "DMSans_400Regular"
                : "Lato_400Regular",
            fontSize: textLargeStyle.fontSize,
            fontWeight: String(
              textLargeStyle.fontWeight
            ) as RNTextStyle["fontWeight"],
          }}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Input
          variant="outline"
          size="md"
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          style={{
            borderColor: isInvalid ? Color.Danger : Color.LightGrey,
            borderWidth: 1,
            borderRadius: 8,
            height: 50,
          }}
          pointerEvents="none"
        >
          <InputField
            value={value ? formatDisplay(initialDate) : ""}
            placeholder={placeholder}
            editable={false}
            style={{
              fontFamily:
                textLargeStyle.fontFamily === Font.DMsans
                  ? "DMSans_400Regular"
                  : "Lato_400Regular",
              fontSize: textLargeStyle.fontSize,
              color: value ? Color.Black : Color.Grey,
            }}
          />
          <InputSlot className="pr-4">
            <Icons.Calendar size={20} color={Color.Grey} weight="regular" />
          </InputSlot>
        </Input>
      </TouchableOpacity>

      {!hideHelperText && helperText && (
        <Text
          className="mt-1 ml-1"
          style={{
            color: Color.Grey,
            fontFamily:
              textSmallStyle.fontFamily === Font.DMsans
                ? "DMSans_400Regular"
                : "Lato_400Regular",
            fontSize: textSmallStyle.fontSize,
            fontWeight: String(
              textSmallStyle.fontWeight
            ) as RNTextStyle["fontWeight"],
          }}
        >
          {helperText}
        </Text>
      )}

      {/* Main Unified Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/40 p-4"
          activeOpacity={1}
          onPress={() => {
            if (showTimePicker && mode !== "time") setShowTimePicker(false);
            else if (showMonthYearPicker) setShowMonthYearPicker(false);
            else setShowModal(false);
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="w-full max-w-[340px] bg-[#f8f9fa] rounded-3xl overflow-hidden shadow-xl"
          >
            {/* Header: Month/Year Dropdown & Arrows */}
            {mode !== "time" && (
              <View className="flex-row items-center justify-between px-6 pt-6 pb-2">
                <TouchableOpacity
                  className="flex-row items-center gap-2"
                  onPress={() => {
                    setShowTimePicker(false);
                    setShowMonthYearPicker(!showMonthYearPicker);
                  }}
                >
                  <Text
                    className="text-xl text-[#333]"
                    style={{ fontFamily: "Lato_700Bold" }}
                  >
                    {monthNamesFull[tempDate.getMonth()]}{" "}
                    {tempDate.getFullYear()}
                  </Text>
                  <Icon
                    as={showMonthYearPicker ? Icons.CaretUp : Icons.CaretDown}
                    color="#666"
                    size="md"
                  />
                </TouchableOpacity>

                <View className="flex-row items-center gap-6">
                  <TouchableOpacity
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setTempDate(newDate);
                    }}
                  >
                    <Icon as={Icons.CaretLeft} color="#333" size="lg" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setTempDate(newDate);
                    }}
                  >
                    <Icon as={Icons.CaretRight} color="#333" size="lg" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Calendar Body */}
            {mode !== "time" && (
              <View className="px-2 min-h-[300px]">
                {!showMonthYearPicker && (
                  <Calendar
                    current={selectedDateStr}
                    key={selectedDateStr}
                    hideArrows={true}
                    renderHeader={() => <View />} // Hide default header, using our custom one above
                    onDayPress={(day) => {
                      const newDate = new Date(day.timestamp);
                      newDate.setHours(tempDate.getHours());
                      newDate.setMinutes(tempDate.getMinutes());
                      setTempDate(newDate);
                    }}
                    markedDates={{
                      [selectedDateStr]: {
                        selected: true,
                        selectedColor: Color.Green,
                      },
                    }}
                    theme={
                      {
                        backgroundColor: "#f8f9fa",
                        calendarBackground: "#f8f9fa",
                        selectedDayBackgroundColor: Color.Green,
                        todayTextColor: Color.Green,
                        textDayFontFamily: "Lato_400Regular",
                        textDayHeaderFontFamily: "Lato_700Bold",
                        textDayFontSize: 16,
                        "stylesheet.calendar.header": {
                          dayHeader: {
                            marginTop: 2,
                            marginBottom: 7,
                            width: 32,
                            textAlign: "center",
                            fontSize: 13,
                            fontFamily: "Lato_400Regular",
                            color: "#999",
                          },
                        },
                      } as any
                    }
                  />
                )}

                {/* Invisible overlay inside the card to catch taps and close popups */}
                {(showMonthYearPicker || showTimePicker) && (
                  <TouchableOpacity
                    activeOpacity={1}
                    className="absolute inset-0 z-10"
                    onPress={() => {
                      setShowMonthYearPicker(false);
                      setShowTimePicker(false);
                    }}
                  />
                )}

                {/* Overlay: Month/Year Grid Dropdown */}
                {showMonthYearPicker && (
                  <View
                    className="absolute top-0 left-4 bg-white rounded-2xl z-20 p-2 w-[240px]"
                    style={{
                      elevation: 10,
                      maxHeight: 320,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 10,
                    }}
                  >
                    <View className="flex-row flex-1">
                      {/* Months Scroll */}
                      <ScrollView
                        ref={monthScrollRef}
                        className="flex-1 pr-1 border-r border-[#eee]"
                        showsVerticalScrollIndicator={false}
                      >
                        {monthNamesFull.map((m, idx) => {
                          const isActive = tempDate.getMonth() === idx;
                          return (
                            <TouchableOpacity
                              key={m}
                              className={`py-3 px-2 rounded-lg items-center ${isActive ? "bg-[#e8f5e9]" : ""}`}
                              onPress={() => {
                                const newDate = new Date(tempDate);
                                newDate.setMonth(idx);
                                setTempDate(newDate);
                              }}
                            >
                              <Text
                                className={`text-base ${isActive ? "text-primary font-bold" : "text-[#444]"}`}
                                style={{
                                  color: isActive ? Color.Green : "#444",
                                }}
                              >
                                {shortMonthNames[idx]}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>

                      {/* Years Scroll */}
                      <ScrollView
                        ref={yearScrollRef}
                        className="flex-1 pl-1"
                        showsVerticalScrollIndicator={false}
                      >
                        {yearsOptions.map((y) => {
                          const isActive = tempDate.getFullYear() === y;
                          return (
                            <TouchableOpacity
                              key={y}
                              className={`py-3 px-2 rounded-lg items-center ${isActive ? "bg-[#e8f5e9]" : ""}`}
                              onPress={() => {
                                const newDate = new Date(tempDate);
                                newDate.setFullYear(y);
                                setTempDate(newDate);
                              }}
                            >
                              <Text
                                className={`text-base ${isActive ? "text-primary font-bold" : "text-[#444]"}`}
                                style={{
                                  color: isActive ? Color.Green : "#444",
                                }}
                              >
                                {y}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                    <TouchableOpacity
                      className="items-center py-2 mt-1"
                      onPress={() => setShowMonthYearPicker(false)}
                    >
                      <Text
                        style={{
                          fontFamily: "Lato_700Bold",
                          color: Color.Green,
                          fontSize: 14,
                        }}
                      >
                        DONE
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Footer Bottom Row (Hidden in Time-only mode) */}
            {mode !== "time" && (
              <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
                {mode === "datetime" ? (
                  <>
                    <Text
                      className="text-[#333] text-base"
                      style={{ fontFamily: "Lato_400Regular" }}
                    >
                      Time
                    </Text>
                    <TouchableOpacity
                      className={`px-4 py-2 rounded-lg ${showTimePicker ? "bg-[#e8f5e9]" : "bg-[#e0e0e0]"}`}
                      onPress={() => {
                        setShowMonthYearPicker(false);
                        setShowTimePicker(!showTimePicker);
                      }}
                    >
                      <Text
                        className="font-bold text-base tracking-wide"
                        style={{
                          color: showTimePicker ? Color.Green : "#333",
                          fontFamily: "Lato_700Bold",
                        }}
                      >
                        {tempHours}:{padZero(tempMinutes)}{" "}
                        {tempIsPM ? "PM" : "AM"}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View className="flex-1" />
                )}
              </View>
            )}

            {/* Time Picker View */}
            {/* If mode="time", render inline permanently, otherwise as an absolute overlay if triggered */}
            {showTimePicker && (
              <View
                className={
                  mode === "time"
                    ? "flex-col p-4 w-full h-[300px] bg-white rounded-3xl"
                    : "absolute bottom-20 right-6 bg-white rounded-2xl z-20 flex-col p-2 w-[240px]"
                }
                style={
                  mode === "time"
                    ? {}
                    : {
                        elevation: 15,
                        maxHeight: 280,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 10,
                      }
                }
              >
                {mode === "time" && (
                  <Text
                    className="text-xl font-bold mb-4 text-[#333] text-center"
                    style={{ fontFamily: "Lato_700Bold" }}
                  >
                    Select Time
                  </Text>
                )}
                <View className="flex-row flex-1">
                  {/* Hours Scroll */}
                  <ScrollView
                    ref={hourScrollRef}
                    className="flex-1 pr-1 border-r border-[#eee]"
                    showsVerticalScrollIndicator={false}
                  >
                    {hoursOptions.map((h) => {
                      const isActive = h === tempHours;
                      return (
                        <TouchableOpacity
                          key={`h-${h}`}
                          className={`py-3 px-2 rounded-lg items-center ${isActive ? "bg-[#e8f5e9]" : ""}`}
                          onPress={() => setTempHours(h)}
                        >
                          <Text
                            className={`text-base ${isActive ? "text-primary font-bold" : "text-[#444]"}`}
                            style={{ color: isActive ? Color.Green : "#444" }}
                          >
                            {h}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Minutes Scroll */}
                  <ScrollView
                    ref={minuteScrollRef}
                    className="flex-1 px-1 border-r border-[#eee]"
                    showsVerticalScrollIndicator={false}
                  >
                    {minutesOptions.map((m) => {
                      const isActive = m === tempMinutes;
                      return (
                        <TouchableOpacity
                          key={`m-${m}`}
                          className={`py-3 px-2 rounded-lg items-center ${isActive ? "bg-[#e8f5e9]" : ""}`}
                          onPress={() => setTempMinutes(m)}
                        >
                          <Text
                            className={`text-base ${isActive ? "text-primary font-bold" : "text-[#444]"}`}
                            style={{ color: isActive ? Color.Green : "#444" }}
                          >
                            {padZero(m)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* AM/PM Scroll */}
                  <ScrollView
                    className="flex-1 pl-1"
                    showsVerticalScrollIndicator={false}
                  >
                    {["AM", "PM"].map((p, i) => {
                      const isActive = (i === 1) === tempIsPM;
                      return (
                        <TouchableOpacity
                          key={p}
                          className={`py-3 px-2 rounded-lg items-center ${isActive ? "bg-[#e8f5e9]" : ""}`}
                          onPress={() => setTempIsPM(i === 1)}
                        >
                          <Text
                            className={`text-base ${isActive ? "text-primary font-bold" : "text-[#444]"}`}
                            style={{ color: isActive ? Color.Green : "#444" }}
                          >
                            {p}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
                {mode !== "time" && (
                  <TouchableOpacity
                    className="items-center py-2 mt-1"
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text
                      style={{
                        fontFamily: "Lato_700Bold",
                        color: Color.Green,
                        fontSize: 14,
                      }}
                    >
                      DONE
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* OK / CANCEL Buttons Footer */}
            <View className="flex-row justify-end px-6 pb-6 gap-6 pt-2">
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text
                  style={{
                    fontFamily: "Lato_700Bold",
                    color: "#666",
                    fontSize: 16,
                  }}
                >
                  CANCEL
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm}>
                <Text
                  style={{
                    fontFamily: "Lato_700Bold",
                    color: Color.Green,
                    fontSize: 16,
                  }}
                >
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
