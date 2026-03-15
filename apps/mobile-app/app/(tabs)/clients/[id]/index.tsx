import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
import { ChipComponent, ChipVariant } from "@/components/basic/Chip.component";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Icons } from "@/config";
import { useFetchClientById } from "@/services/clients";
import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type TextStyle as RNTextStyle,
} from "react-native";

enum ClientDetailTab {
  Appointments = "Appointments",
  Reports = "Reports",
}

interface IconProps {
  size?: number;
  color?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}

interface MenuOption {
  label: string;
  value: string;
  icon: React.ComponentType<IconProps>;
}

const textLargeStyle = textStyles[TextVariant.Body][TextSize.Large];
const textButtonMediumStyle = textStyles[TextVariant.Button][TextSize.Medium];

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // useRouter gives us programmatic navigation (push, back, replace etc.)
  // We need this because the back button triggers navigation in code,
  // not via a static <Link> element
  const router = useRouter();

  const { data: client, isLoading } = useFetchClientById(id ?? "");

  const [activeTab, setActiveTab] = useState<ClientDetailTab>(
    ClientDetailTab.Appointments
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading] = useState(false);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsButtonRef = useRef<View>(null);

  const handleActionScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const contentWidth = event.nativeEvent.contentSize.width;
    const viewWidth = event.nativeEvent.layoutMeasurement.width;
    setShowLeftShadow(scrollX > 10);
    setShowRightShadow(scrollX < contentWidth - viewWidth - 10);
  };

  const generateGradientStrips = (reverse = false) => {
    const steps = 20;
    const strips = [];
    for (let i = 0; i < steps; i++) {
      const opacity = reverse ? (i + 1) / steps : 1 - i / steps;
      strips.push(
        <View
          key={i}
          style={{
            width: 2,
            backgroundColor: `rgba(255, 255, 255, ${opacity.toFixed(2)})`,
          }}
        />
      );
    }
    return strips;
  };

  const calculateAge = (dateOfBirth?: string): number | null => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getMenuOptions = (): MenuOption[] => {
    if (activeTab === ClientDetailTab.Appointments) {
      return [
        {
          label: "Schedule Appointment",
          value: "schedule_appointment",
          icon: Icons.CalendarBlank,
        },
      ];
    } else {
      return [
        { label: "Request Report", value: "request_report", icon: Icons.Plus },
        {
          label: "Direct Upload Report",
          value: "direct_upload_report",
          icon: Icons.UploadIcon,
        },
      ];
    }
  };

  const handleOptionSelect = (value: string) => {
    setShowOptionsMenu(false);
    switch (value) {
      case "schedule_appointment":
        console.log("Schedule appointment for:", client?.client_id);
        break;
      case "request_report":
        router.push(`/reports/request-report/${client?.client_id}` as any);
        break;
      case "direct_upload_report":
        console.log("Direct upload report for:", client?.client_id);
        break;
    }
  };

  const EmptyState = ({
    icon: Icon,
    message,
  }: {
    icon: React.ComponentType<IconProps>;
    message: string;
  }) => (
    <View className="flex-1 justify-center items-center py-20">
      <Icon size={64} color={Color.LightGrey} weight="regular" />
      <TextComponent
        variant={TextVariant.Body}
        size={TextSize.Medium}
        color={Color.Grey}
        style={{ marginTop: 16, textAlign: "center" }}
      >
        {message}
      </TextComponent>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={Color.Green} />
      </SafeAreaView>
    );
  }

  if (!client) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center gap-4">
        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Medium}
          color={Color.Grey}
        >
          Client not found.
        </TextComponent>
        <ButtonComponent.BackButton
          size={ButtonSize.Small}
          onPress={() => router.push("/clients" as any)}
        />
      </SafeAreaView>
    );
  }

  const fullName =
    `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unknown";
  const age = calculateAge(client.date_of_birth);
  const hasAllergies =
    client.known_conditions &&
    Array.isArray(client.known_conditions) &&
    client.known_conditions.length > 0 &&
    client.known_conditions[0];
  const allergyText =
    hasAllergies && client.known_conditions?.[0]
      ? String(client.known_conditions[0])
      : null;
  const titlePrefix =
    client.gender === "MALE" ? "Mr" : client.gender === "FEMALE" ? "Ms" : "";
  const displayName = titlePrefix ? `${titlePrefix} ${fullName}` : fullName;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-[#F5F5F5]">
          {/* Header Section */}
          <View className="px-5 pt-3 pb-6 bg-white">
            {/* Back Button */}
            <View className="mb-6 self-start">
              <ButtonComponent.BackButton
                onPress={() => router.push("/clients" as any)}
                size={ButtonSize.Small}
              />
            </View>

            {/* Patient Info */}
            <View className="flex-row items-center gap-4 mb-6">
              <View className="w-[120px] h-[120px] rounded-full bg-[#E8F5A8] justify-center items-center overflow-hidden">
                <Icons.User size={60} color={Color.Grey} />
              </View>

              <View className="flex-1">
                <TextComponent
                  variant={TextVariant.Title}
                  size={TextSize.Medium}
                  style={{ marginBottom: 2 }}
                >
                  {displayName}
                </TextComponent>
                {age !== null && (
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Small}
                    color={Color.Grey}
                    style={{ marginBottom: 8 }}
                  >
                    {age} years old
                  </TextComponent>
                )}
                {allergyText && (
                  <ChipComponent
                    text={allergyText}
                    variant={ChipVariant.Danger}
                  />
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="-ml-5">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 12,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
                onScroll={handleActionScroll}
                scrollEventThrottle={16}
              >
                <View style={{ width: 100 }}>
                  <ButtonComponent
                    size={ButtonSize.Small}
                    leftIcon={Icons.Eye}
                    buttonColor={Color.Black}
                    textColor={Color.White}
                    iconColor={Color.White}
                    onPress={() =>
                      console.log("View profile:", client.client_id)
                    }
                  >
                    Profile
                  </ButtonComponent>
                </View>
                <View style={{ width: 160 }}>
                  <ButtonComponent
                    size={ButtonSize.Small}
                    leftIcon={Icons.ShareNetwork}
                    buttonColor={Color.Black}
                    textColor={Color.White}
                    iconColor={Color.White}
                    onPress={() =>
                      console.log("Share calendar:", client.client_id)
                    }
                  >
                    Share Calendar
                  </ButtonComponent>
                </View>
                <View style={{ width: 100 }}>
                  <ButtonComponent
                    size={ButtonSize.Small}
                    leftIcon={Icons.Phone}
                    buttonColor={Color.Black}
                    textColor={Color.White}
                    iconColor={Color.White}
                    onPress={() => console.log("Call:", client.contact_number)}
                  >
                    Call
                  </ButtonComponent>
                </View>
              </ScrollView>

              {/* Left fade */}
              {showLeftShadow && (
                <View
                  className="absolute left-0 top-0 bottom-0 w-10 flex-row"
                  pointerEvents="none"
                >
                  {generateGradientStrips(false)}
                </View>
              )}
              {/* Right fade */}
              {showRightShadow && (
                <View
                  className="absolute right-0 top-0 bottom-0 w-10 flex-row"
                  pointerEvents="none"
                >
                  {generateGradientStrips(true)}
                </View>
              )}
            </View>
          </View>

          {/* Tab Section */}
          <View className="px-5 pt-5 bg-[#F5F5F5]">
            <View className="flex-row items-center mb-4">
              {/* Tab Buttons */}
              <View className="flex-1 flex-row justify-center gap-2">
                <TouchableOpacity
                  className="px-5 py-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      activeTab === ClientDetailTab.Appointments
                        ? Color.Green
                        : "transparent",
                  }}
                  onPress={() => setActiveTab(ClientDetailTab.Appointments)}
                  activeOpacity={0.7}
                >
                  <TextComponent
                    variant={TextVariant.Button}
                    size={TextSize.Medium}
                    color={Color.Black}
                  >
                    Appointments
                  </TextComponent>
                </TouchableOpacity>

                <TouchableOpacity
                  className="px-5 py-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      activeTab === ClientDetailTab.Reports
                        ? Color.Green
                        : "transparent",
                  }}
                  onPress={() => setActiveTab(ClientDetailTab.Reports)}
                  activeOpacity={0.7}
                >
                  <TextComponent
                    variant={TextVariant.Button}
                    size={TextSize.Medium}
                    color={Color.Black}
                  >
                    Reports
                  </TextComponent>
                </TouchableOpacity>
              </View>

              {/* More Options */}
              <View className="relative">
                <TouchableOpacity
                  ref={optionsButtonRef}
                  className="px-2 py-2 justify-center items-center"
                  onPress={() => setShowOptionsMenu(!showOptionsMenu)}
                  activeOpacity={0.7}
                >
                  <Icons.DotsThreeVertical
                    size={20}
                    color={Color.Black}
                    weight="bold"
                  />
                </TouchableOpacity>

                {showOptionsMenu && (
                  <View
                    className="absolute top-10 right-0 min-w-[240px] bg-white rounded-xl overflow-hidden z-50"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    {getMenuOptions().map((option, index) => {
                      const IconComponent = option.icon;
                      const isLast = index === getMenuOptions().length - 1;
                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => handleOptionSelect(option.value)}
                          className="flex-row items-center px-4 py-4 gap-3"
                          style={{
                            borderBottomWidth: isLast ? 0 : 1,
                            borderBottomColor: "#F0F0F0",
                          }}
                          android_ripple={{ color: "#F5F5F5" }}
                        >
                          <IconComponent
                            size={20}
                            color={Color.Black}
                            weight="regular"
                          />
                          <Text
                            style={{
                              color: Color.Black,
                              fontFamily:
                                textButtonMediumStyle.fontFamily === Font.DMsans
                                  ? "DMSans_400Regular"
                                  : "Lato_400Regular",
                              fontSize: textButtonMediumStyle.fontSize,
                              fontWeight: String(
                                textButtonMediumStyle.fontWeight
                              ) as RNTextStyle["fontWeight"],
                            }}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>

            {/* Search Bar */}
            <View className="mb-4">
              <Input
                variant="outline"
                size="md"
                className="border border-[#D3D3D3] rounded-xl h-[50px] bg-white"
              >
                <InputSlot className="pl-4">
                  <Icons.MagnifyingGlass
                    size={18}
                    color={Color.Grey}
                    weight="regular"
                  />
                </InputSlot>
                <InputField
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search"
                  placeholderTextColor={Color.Grey}
                  style={{
                    paddingLeft: 12,
                    paddingRight: 16,
                    paddingVertical: 12,
                    fontFamily:
                      textLargeStyle.fontFamily === Font.DMsans
                        ? "DMSans_400Regular"
                        : "Lato_400Regular",
                    fontSize: textLargeStyle.fontSize,
                    fontWeight: "400" as RNTextStyle["fontWeight"],
                    textAlign: "left",
                    color: Color.Black,
                  }}
                />
              </Input>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            className="flex-1 bg-[#F5F5F5]"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 20,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color={Color.Green} />
              </View>
            ) : (
              <View className="flex-1">
                {activeTab === ClientDetailTab.Appointments ? (
                  <EmptyState
                    icon={Icons.CalendarBlank}
                    message="No appointments found"
                  />
                ) : (
                  <EmptyState
                    icon={Icons.FileText}
                    message="No reports found"
                  />
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Overlay to close dropdown */}
      {showOptionsMenu && (
        <TouchableOpacity
          className="absolute inset-0"
          onPress={() => setShowOptionsMenu(false)}
          activeOpacity={1}
        />
      )}
    </SafeAreaView>
  );
}
