import { useAuth } from "@/auth/AuthContext";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Defs,
  LinearGradient,
  Stop,
  Svg,
  Text as SvgText,
} from "react-native-svg";

const IMG_SIZE = 120;

const fontFamilyMap: { [key in Font]: string } = {
  [Font.Inter]: "Inter",
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

type HomeHeaderUser = {
  first_name?: string | null;
};

const BellIcon = Icons.Bell;
const SettingsIcon = Icons.Gear;

export function HomeCard({
  onNotificationPress,
  onSettingsPress,
  notificationCount = 8,
}: HomeCardProps) {
  const insets = useSafeAreaInsets();
  const { user: authUser } = useAuth();
  const userId = authUser?.user_id ?? "";
  const today = getLocalDateString();

  const userQuery = useFetchUser(userId) as {
    data: HomeHeaderUser | null;
    isLoading: boolean;
  };
  const user = userQuery.data;
  const userLoading = userQuery.isLoading;
  const { data: taskSummary, isLoading: summaryLoading } = useFetchTaskSummary(
    userId,
    today
  );

  const loading = userLoading || summaryLoading;
  const appointmentCount = taskSummary?.appointment_count ?? 0;
  const taskCount = taskSummary?.reminder_count ?? 0;

  const [cardHeight, setCardHeight] = useState(0);
  const imgTop = cardHeight > 0 ? cardHeight / 2 - IMG_SIZE / 2 : 0;
  const topInsetPadding = Math.max(insets.top + 8, 20);
  const greetingTop = topInsetPadding + 48;
  const headerHeight = 340 + Math.max(topInsetPadding - 20, 0);

  const handleCardLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    if (height !== cardHeight) setCardHeight(height);
  };

  return (
    <ImageBackground
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      source={require("@/assets/images/home/card-background.png") as number}
      style={{ width: "100%", height: headerHeight }}
      imageStyle={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      resizeMode="cover"
    >
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: topInsetPadding,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{ color: Color.Black, fontSize: 14, fontWeight: "500" }}
        >
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

      <View
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: greetingTop,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{ color: Color.Black, fontSize: 32, fontWeight: "700" }}
        >
          {getGreeting()}
        </Text>

        {loading ? (
          <ActivityIndicator
            color={Color.Green}
            style={{ alignSelf: "flex-start", marginTop: 8 }}
          />
        ) : (
          <Svg height={56} width="100%" style={{ marginTop: -4 }}>
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
              y="42"
            >
              {user?.first_name ?? ""}
            </SvgText>
          </Svg>
        )}
      </View>

      {/* Stats Cards Row */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          paddingHorizontal: 20,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 30,
          overflow: "visible",
        }}
      >
        {/* Appointments Card */}
        <View
          className="flex-1 rounded-2xl justify-center items-center py-4"
          style={{
            backgroundColor: Color.LightCream,
            minHeight: 120,
            overflow: "hidden",
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
          {loading ? (
            <ActivityIndicator
              size="small"
              color={Color.Black}
              style={{ marginTop: 6, marginBottom: 6 }}
            />
          ) : (
            <Text
              style={{
                ...applyTextStyle(TextVariant.Title, TextSize.Large),
                color: Color.Black,
                textAlign: "center",
                lineHeight: 36,
              }}
            >
              {String(appointmentCount).padStart(2, "0")}
            </Text>
          )}

          {/* Appointment image — left edge, dynamically vertically centered */}
          {cardHeight > 0 && (
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require("@/assets/images/home/calendar.png") as number}
              style={{
                position: "absolute",
                left: -28,
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
            overflow: "hidden",
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
          {loading ? (
            <ActivityIndicator
              size="small"
              color={Color.Black}
              style={{ marginTop: 6, marginBottom: 6 }}
            />
          ) : (
            <Text
              style={{
                ...applyTextStyle(TextVariant.Title, TextSize.Large),
                color: Color.Black,
                textAlign: "center",
                lineHeight: 36,
              }}
            >
              {String(taskCount).padStart(2, "0")}
            </Text>
          )}

          {/* Reminder image — right edge, dynamically vertically centered */}
          {cardHeight > 0 && (
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require("@/assets/images/home/checklist.png") as number}
              style={{
                position: "absolute",
                right: -36,
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
