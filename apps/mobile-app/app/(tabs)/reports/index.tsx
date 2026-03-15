import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
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
  type TextStyle as RNTextStyle,
} from "react-native";
import { ReportTile } from "./ReportTile.component";

// Text styles
const textLargeStyle = textStyles[TextVariant.Body][TextSize.Large];

type TabType = "completed" | "pending";

// Hardcoded user ID for now - TODO: Get from auth context
const TEMP_USER_ID = "2a3c19b8-d352-4b30-a2ac-1cdf993d310c";

export default function ReportsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("completed");
  const router = useRouter();

  // Fetch reports based on active tab
  const { data: groupedReports = [], isLoading } = useFetchGroupedReports(
    TEMP_USER_ID,
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
  const handleReportClick = (reportId: string, filePath: string) => {
    // TODO: Open/download report file
    console.log("Open report:", reportId, filePath);
  };

  return (
    <View className="flex-1 bg-white px-5 pt-5">
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
          onPress={() => {
            // TODO: Implement request report functionality
            console.log("Request Report pressed");
          }}
        >
          + Request Report
        </ButtonComponent>
      </View>

      {/* Search Bar */}
      <View className="mb-5">
        <Input
          variant="outline"
          size="md"
          style={{
            borderColor: Color.LightGrey,
            borderWidth: 1.5,
            borderRadius: 12,
            width: "100%",
            height: 56,
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
                  : "Lato_400Regular",
              fontSize: textLargeStyle.fontSize,
              fontWeight: "400" as RNTextStyle["fontWeight"],
              textAlign: "left",
              color: Color.Black,
            }}
          />
          <InputSlot className="pr-4">
            <Icons.Search size={20} color={Color.Grey} weight="regular" />
          </InputSlot>
        </Input>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-center items-center mb-5 gap-4">
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

      {/* Reports List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
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
