import {
  ButtonComponent,
  ButtonSize,
  ChipComponent,
  ChipVariant,
  TextComponent,
} from "@/components/basic";
import { Color, TextSize, TextVariant } from "@repo/config";
import {
  CalendarBlankIcon,
  ClockIcon,
  EyeIcon,
  FileImageIcon,
  FilePdfIcon,
} from "phosphor-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export interface Report {
  report_id: string;
  report_title: string | null;
  file_path?: string | null;
  file_type?: string | null;
}

export interface ReportTileProps {
  clientId: string;
  clientFirstName: string;
  clientLastName: string;
  reportDate: string;
  reports: Report[];
  onViewClient?: (clientId: string) => void;
  onReportClick?: (reportId: string, filePath: string) => void;
}

export const ReportTile: React.FC<ReportTileProps> = ({
  clientId,
  clientFirstName,
  clientLastName,
  reportDate,
  reports,
  onViewClient,
  onReportClick,
}) => {
  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time from ISO string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine if reports are completed or pending
  const isCompleted = reports.some((report) => report.file_path);

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E5]">
      {/* Header: Client Name and View Client Button */}
      <View className="flex-row justify-between items-center mb-3">
        <TextComponent
          variant={TextVariant.Title}
          size={TextSize.Small}
          color={Color.Black}
        >
          {clientFirstName} {clientLastName}
        </TextComponent>

        <ButtonComponent
          size={ButtonSize.Small}
          leftIcon={EyeIcon}
          buttonColor={Color.Black}
          textColor={Color.White}
          iconColor={Color.White}
          onPress={() => onViewClient?.(clientId)}
        >
          View Client
        </ButtonComponent>
      </View>

      {/* Reports List */}
      <View className="gap-2 mb-3">
        {reports.map((report) => {
          // If report has file_path, show as clickable tile
          if (report.file_path) {
            return (
              <TouchableOpacity
                key={report.report_id}
                className="flex-row items-center gap-3 p-3 rounded-lg bg-white border border-[#E5E5E5] self-start shadow-sm"
                onPress={() =>
                  onReportClick?.(report.report_id, report.file_path!)
                }
                activeOpacity={0.7}
              >
                {report.file_type === "PDF" ? (
                  <FilePdfIcon size={24} color={Color.Black} weight="regular" />
                ) : (
                  <FileImageIcon
                    size={24}
                    color={Color.Black}
                    weight="regular"
                  />
                )}
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Small}
                  color={Color.Black}
                >
                  {report.report_title || "Untitled Report"}
                </TextComponent>
              </TouchableOpacity>
            );
          }

          // For pending reports without file_path, show simple text
          return (
            <View key={report.report_id} className="flex-row items-center py-1">
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Black}
              >
                • {report.report_title || "Untitled Report"}
              </TextComponent>
            </View>
          );
        })}
      </View>

      {/* Date and Time */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center gap-2">
          <CalendarBlankIcon size={16} color={Color.Grey} weight="regular" />
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Small}
            color={Color.Grey}
          >
            {formatDate(reportDate)}
          </TextComponent>
        </View>
        <View className="flex-row items-center gap-2">
          <ClockIcon size={16} color={Color.Grey} weight="regular" />
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Small}
            color={Color.Grey}
          >
            {formatTime(reportDate)}
          </TextComponent>
        </View>
      </View>

      {/* Horizontal Divider */}
      <View className="border-t border-[#E5E5E5] mb-3" />

      {/* Status Chip */}
      <ChipComponent
        text={isCompleted ? "Completed" : "Pending"}
        variant={isCompleted ? ChipVariant.Green : ChipVariant.LightGreen}
      />
    </View>
  );
};
