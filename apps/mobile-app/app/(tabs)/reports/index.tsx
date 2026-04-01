import { useAuth } from "@/auth/AuthContext";
import {
  ButtonComponent,
  ButtonSize,
  OfflineNoticeBar,
  TextComponent,
} from "@/components/basic";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Icons } from "@/config";
import { useFetchGroupedReports } from "@/services/reports";
import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type TextStyle as RNTextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReportTile } from "./ReportTile.component";

const SEARCH_ICON_SIZE = 20;
const INPUT_HEIGHT = 54;
const INPUT_BORDER_WIDTH = 1.5;
const INPUT_BORDER_RADIUS = 12;
const BOTTOM_PADDING = 100;

type TabType = "completed" | "pending";

const textLargeStyle = textStyles[TextVariant.Body][TextSize.Large];

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userId = user?.user_id ?? "";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("completed");
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(e.nativeEvent.contentOffset.y > 0);
  };
  const router = useRouter();

  // Fetch reports based on active tab
  const { data: groupedReports = [], isLoading } = useFetchGroupedReports(
    userId,
    activeTab === "completed"
  );

  // Filter reports based on search query
  const filteredReports = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedReports;
    }

    const query = searchQuery.toLowerCase().trim();

    return groupedReports.filter((group) => {
      // Search by client name
      const clientName =
        `${group.client_first_name} ${group.client_last_name}`.toLowerCase();
      if (clientName.includes(query)) {
        return true;
      }

      // Search by report titles
      const hasMatchingReport = group.reports.some((report) =>
        report.report_title?.toLowerCase().includes(query)
      );

      return hasMatchingReport;
    });
  }, [groupedReports, searchQuery]);

  // Handle view client navigation
  const handleViewClient = (clientId: string) => {
    router.push(`/clients/${clientId}` as any);
  };

  // Handle report click for completed reports with files
  const handleReportClick = (reportId: string) => {
    router.push(`/reports/${reportId}` as any);
  };

  const handleRequestReport = () => {
    const firstGroup = filteredReports[0];
    const clientId = firstGroup?.client_id || "unknown-client";
    const clientName = firstGroup
      ? `${firstGroup.client_first_name} ${firstGroup.client_last_name}`.trim()
      : "Unknown Client";

    router.push(
      `/reports/request-report/${clientId}?clientName=${encodeURIComponent(clientName)}` as any
    );
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 20, paddingHorizontal: 20 }}
    >
      {/* Header with Title and Button */}
      <View className="flex-row justify-between items-center mb-5">
        <TextComponent
          variant={TextVariant.Title}
          size={TextSize.Large}
          color={Color.Black}
        >
          Reports
        </TextComponent>

        <ButtonComponent
          size={ButtonSize.Small}
          buttonColor={Color.Black}
          textColor={Color.White}
          onPress={handleRequestReport}
        >
          + Request Report
        </ButtonComponent>
      </View>

      <OfflineNoticeBar containerStyle={{ marginBottom: 16 }} />

      {/* Search Bar */}
      <View className="mb-5">
        <Input
          variant="outline"
          size="md"
          style={{
            borderColor: Color.LightGrey,
            borderWidth: INPUT_BORDER_WIDTH,
            borderRadius: INPUT_BORDER_RADIUS,
            width: "100%",
            height: INPUT_HEIGHT,
            backgroundColor: Color.White,
          }}
        >
          <InputField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search reports..."
            placeholderTextColor={Color.Grey}
            style={{
              paddingLeft: 16,
              paddingRight: 48,
              paddingVertical: 12,
              fontFamily:
                textLargeStyle.fontFamily === Font.DMsans
                  ? "DMSans_400Regular"
                  : "Inter_400Regular",
              fontSize: textLargeStyle.fontSize,
              fontWeight: "400" as RNTextStyle["fontWeight"],
              textAlign: "left",
              color: Color.Black,
            }}
          />
          <InputSlot className="pr-4">
            <Icons.Search
              size={SEARCH_ICON_SIZE}
              color={Color.Grey}
              weight="regular"
            />
          </InputSlot>
        </Input>
      </View>

      {/* Tabs */}
      <View
        style={{
          marginHorizontal: -20,
          overflow: "hidden",
          paddingBottom: 12,
          zIndex: 1,
        }}
      >
        <View
          className="flex-row justify-center items-center gap-4 bg-white"
          style={{
            marginTop: -20,
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 12,
            shadowColor: "#0000007b",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isScrolled ? 0.05 : 0,
            shadowRadius: 4,
            elevation: isScrolled ? 2 : 0,
          }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab("completed")}
            className="px-6 py-2 rounded-lg"
            style={{
              backgroundColor:
                activeTab === "completed" ? Color.Green : "transparent",
            }}
          >
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.Black}
            >
              Completed
            </TextComponent>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("pending")}
            className="px-6 py-2 rounded-lg"
            style={{
              backgroundColor:
                activeTab === "pending" ? Color.Green : "transparent",
            }}
          >
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.Black}
            >
              Pending
            </TextComponent>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reports List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: BOTTOM_PADDING,
        }}
      >
        {isLoading ? (
          <View className="flex-1 justify-center items-center pt-10">
            <ActivityIndicator size="large" color={Color.Green} />
          </View>
        ) : filteredReports.length === 0 ? (
          <View className="flex-1 justify-center items-center pt-10">
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.Black}
              style={{ opacity: 0.5 }}
            >
              {searchQuery.trim()
                ? "No reports found matching your search"
                : activeTab === "completed"
                  ? "No completed reports yet"
                  : "No pending reports yet"}
            </TextComponent>
          </View>
        ) : (
          <View className="gap-4">
            {filteredReports.map((group) => (
              <ReportTile
                key={group.group_id}
                clientId={group.client_id}
                clientFirstName={group.client_first_name}
                clientLastName={group.client_last_name}
                reportDate={group.report_date}
                reports={group.reports}
                onViewClient={handleViewClient}
                onReportClick={handleReportClick}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
