import { Icons } from "@/config";
import { useFetchTaskSummary } from "@/services/tasks/useTaskSummary";
import { useFetchUser } from "@/services/user";

import {
  Color,
  Font,
  FontStyle,
  FontWeight,
  TextSize,
  TextVariant,
  textStyles,
} from "@repo/config";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from "react-native";
import {
  Defs,
  LinearGradient,
  Stop,
  Svg,
  Text as SvgText,
} from "react-native-svg";

const HARDCODED_USER_ID = "2a3c19b8-d352-4b30-a2ac-1cdf993d310c";
const IMG_SIZE = 120;

const fontFamilyMap: { [key in Font]: string } = {
  [Font.Lato]: "Lato",
  [Font.DMsans]: "DMSans",
};

const fontWeightMap: {
  [key in FontWeight]: "400" | "500" | "600" | "700" | "800";
} = {
  [FontWeight.Regular]: "400",
  [FontWeight.Medium]: "500",
  [FontWeight.SemiBold]: "600",
  [FontWeight.Bold]: "700",
  [FontWeight.ExtraBold]: "800",
};

const fontStyleMap: { [key in FontStyle]: "normal" | "italic" } = {
  [FontStyle.Normal]: "normal",
  [FontStyle.Italic]: "italic",
};

function getFormattedDate(): string {
  const today = new Date();
  const day = today.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th";
  const month = today.toLocaleDateString("en-US", { month: "long" });
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  return `${day}${suffix} ${month}, ${weekday}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning,";
  if (hour < 18) return "Good Afternoon,";
  return "Good Evening,";
}

function applyTextStyle(variant: TextVariant, size: TextSize) {
  const style =
    textStyles[variant][size as keyof (typeof textStyles)[typeof variant]];

  return {
    fontFamily: fontFamilyMap[style.fontFamily],
    fontSize: style.fontSize,
    fontWeight: fontWeightMap[style.fontWeight as FontWeight],
    fontStyle: fontStyleMap[style.fontStyle],
    ...(style.lineHeight && { lineHeight: style.lineHeight }),
    ...(style.letterSpacing && { letterSpacing: style.letterSpacing }),
  };
}

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface HomeCardProps {
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  notificationCount?: number;
}

const BellIcon = Icons.Bell;
const SettingsIcon = Icons.Gear;

export default function HomeCard({
  onNotificationPress,
  onSettingsPress,
  notificationCount = 8,
}: HomeCardProps) {
  const today = getLocalDateString();

  const { data: user, isLoading: userLoading } =
    useFetchUser(HARDCODED_USER_ID);
  const { data: taskSummary, isLoading: summaryLoading } = useFetchTaskSummary(
    HARDCODED_USER_ID,
    today
  );

  const loading = userLoading || summaryLoading;
  const appointmentCount = taskSummary?.appointment_count ?? 0;
  const taskCount = taskSummary?.reminder_count ?? 0;

  const [cardHeight, setCardHeight] = useState(0);
  const imgTop = cardHeight > 0 ? cardHeight / 2 - IMG_SIZE / 2 : 0;

  const handleCardLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    if (height !== cardHeight) setCardHeight(height);
  };

  return (
    <ImageBackground
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      source={require("@/assets/images/home/card-background.png") as number}
      style={{ width: "100%", height: 300 }}
      imageStyle={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      resizeMode="cover"
    >
      {/* Date + Icons Row */}
      <View className="flex-row justify-between items-center px-5 pt-5">
        <Text style={{ color: Color.Black, fontSize: 14, fontWeight: "500" }}>
          {getFormattedDate()}
        </Text>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={onNotificationPress} className="relative">
            <BellIcon size={22} color={Color.Black} />
            {notificationCount > 0 && (
              <View
                className="absolute -top-1 -right-1 rounded-full min-w-4 h-4 justify-center items-center px-1"
                style={{ backgroundColor: Color.Danger }}
              >
                <Text
                  style={{ color: Color.White, fontSize: 9, fontWeight: "700" }}
                >
                  {notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onSettingsPress}>
            <SettingsIcon size={22} color={Color.Black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting + Name */}
      <View className="px-5 pt-3">
        <Text style={{ color: Color.Black, fontSize: 32, fontWeight: "700" }}>
          {getGreeting()}
        </Text>

        {loading ? (
          <ActivityIndicator
            color={Color.Green}
            style={{ alignSelf: "flex-start", marginTop: 8 }}
          />
        ) : (
          <Svg height={56} width="100%">
            <Defs>
              <LinearGradient id="nameGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={Color.TextGreen} />
                <Stop offset="0.5" stopColor={Color.Green} />
                <Stop offset="1" stopColor={Color.TextGreen} />
              </LinearGradient>
            </Defs>
            <SvgText
              fill="url(#nameGradient)"
              fontSize={44}
              fontWeight="800"
              fontStyle="italic"
              x="0"
              y="48"
            >
              {user?.first_name ?? ""}
            </SvgText>
          </Svg>
        )}
      </View>

      {/* Stats Cards Row */}
      <View
        className="flex-row px-5 gap-3 mt-5"
        style={{ overflow: "visible" }}
      >
        {/* Appointments Card */}
        <View
          className="flex-1 rounded-2xl justify-center items-center py-4"
          style={{
            backgroundColor: Color.LightCream,
            minHeight: 120,
            overflow: "visible",
          }}
          onLayout={handleCardLayout}
        >
          <Text
            style={{
              ...applyTextStyle(TextVariant.Title, TextSize.Small),
              color: Color.Black,
              textAlign: "center",
            }}
          >
            APPOINTMENTS
          </Text>
          <Text
            style={{
              ...applyTextStyle(TextVariant.Title, TextSize.Large),
              color: Color.Black,
              textAlign: "center",
              lineHeight: 36,
            }}
          >
            {loading ? "--" : String(appointmentCount).padStart(2, "0")}
          </Text>

          {/* Appointment image — left edge, dynamically vertically centered */}
          {cardHeight > 0 && (
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require("@/assets/images/home/calendar.png") as number}
              style={{
                position: "absolute",
                left: -20,
                top: imgTop,
                width: IMG_SIZE,
                height: IMG_SIZE,
              }}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Reminders Card */}
        <View
          className="flex-1 rounded-2xl justify-center items-center py-4"
          style={{
            backgroundColor: Color.LightCream,
            minHeight: 120,
            overflow: "visible",
          }}
        >
          <Text
            style={{
              ...applyTextStyle(TextVariant.Title, TextSize.Small),
              color: Color.Black,
              textAlign: "center",
            }}
          >
            REMINDERS
          </Text>
          <Text
            style={{
              ...applyTextStyle(TextVariant.Title, TextSize.Large),
              color: Color.Black,
              textAlign: "center",
              lineHeight: 36,
            }}
          >
            {loading ? "--" : String(taskCount).padStart(2, "0")}
          </Text>

          {/* Reminder image — right edge, dynamically vertically centered */}
          {cardHeight > 0 && (
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require("@/assets/images/home/checklist.png") as number}
              style={{
                position: "absolute",
                right: -20,
                top: imgTop,
                width: IMG_SIZE,
                height: IMG_SIZE,
              }}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </ImageBackground>
  );
}
