import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
import { useFetchReportFile } from "@/services/reports";
import { Color, TextSize, TextVariant } from "@repo/config";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CalendarBlankIcon,
  ClockIcon,
  FileTextIcon,
  UserIcon,
} from "phosphor-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const TEMP_USER_ID = "2a3c19b8-d352-4b30-a2ac-1cdf993d310c";

const isPDF = (fileType: string | null) => {
  if (!fileType) return false;
  const lowerType = fileType.toLowerCase();
  return lowerType === "pdf" || lowerType === "application/pdf";
};

const isImage = (fileType: string | null) => {
  if (!fileType) return false;
  const lowerType = fileType.toLowerCase();
  return (
    lowerType.includes("image") ||
    ["jpg", "jpeg", "png", "JPG", "JPEG", "PNG"].includes(fileType)
  );
};

export default function ReportViewerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState(false);

  const {
    data: reportData,
    isLoading,
    error,
    refetch,
  } = useFetchReportFile(TEMP_USER_ID, id || "");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={Color.Green} />
        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Medium}
          color={Color.Grey}
          className="mt-4"
        >
          Loading report...
        </TextComponent>
      </SafeAreaView>
    );
  }

  if (error || !reportData) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 pt-3">
          <View className="mb-6 self-start">
            <ButtonComponent.BackButton
              onPress={() => router.back()}
              size={ButtonSize.Small}
            />
          </View>
        </View>
        <View className="flex-1 justify-center items-center px-5">
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Medium}
            color={Color.Danger}
            className="mb-4 text-center"
          >
            Failed to load report. Please try again.
          </TextComponent>
          <ButtonComponent
            size={ButtonSize.Medium}
            buttonColor={Color.Black}
            textColor={Color.White}
            onPress={() => refetch()}
          >
            Retry
          </ButtonComponent>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-[#F5F5F5]">
        {/* Header Section */}
        <View className="px-5 pt-3 pb-6 bg-white">
          {/* Back Button */}
          <View className="mb-6 self-start">
            <ButtonComponent.BackButton
              onPress={() => router.back()}
              size={ButtonSize.Small}
            />
          </View>

          {/* Report Metadata */}
          <View className="gap-2">
            {/* Client Name */}
            <View className="flex-row items-center gap-2">
              <UserIcon size={18} color={Color.Black} weight="regular" />
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Black}
              >
                Client Name:{" "}
              </TextComponent>
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Black}
              >
                {reportData.clientName}
              </TextComponent>
            </View>

            {/* Report Title */}
            <View className="flex-row items-center gap-2">
              <FileTextIcon size={18} color={Color.Black} weight="regular" />
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Black}
              >
                Report Title:{" "}
              </TextComponent>
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Black}
              >
                {reportData.reportTitle || "Untitled Report"}
              </TextComponent>
            </View>

            {/* Uploaded On */}
            <View className="flex-row items-center gap-2">
              <CalendarBlankIcon
                size={18}
                color={Color.Black}
                weight="regular"
              />
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Black}
              >
                Uploaded On:{" "}
              </TextComponent>
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Black}
              >
                {formatDateTime(reportData.uploadedOn)}
              </TextComponent>
            </View>

            {/* Expires On */}
            {reportData.expiresIn && (
              <View className="flex-row items-center gap-2">
                <ClockIcon size={18} color={Color.Danger} weight="regular" />
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Small}
                  color={Color.Danger}
                >
                  Expires On:{" "}
                </TextComponent>
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Small}
                  color={Color.Danger}
                >
                  {formatDate(reportData.expiresIn)}
                </TextComponent>
              </View>
            )}
          </View>
        </View>

        {/* Document Viewer */}
        <ScrollView
          className="flex-1 bg-[#F5F5F5]"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          {documentError ? (
            <View className="p-6 bg-red-50 rounded-lg items-center">
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Medium}
                color={Color.Danger}
                className="mb-4 text-center"
              >
                Failed to load document. The link may have expired.
              </TextComponent>
              <ButtonComponent
                size={ButtonSize.Medium}
                buttonColor={Color.Black}
                textColor={Color.White}
                onPress={() => {
                  setDocumentError(false);
                  setDocumentLoading(true);
                  refetch();
                }}
              >
                Retry
              </ButtonComponent>
            </View>
          ) : reportData.fileType && isPDF(reportData.fileType) ? (
            <View
              className="relative rounded-xl overflow-hidden bg-white"
              style={{
                height: Dimensions.get("window").height * 0.6,
              }}
            >
              <WebView
                source={{
                  uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(reportData.fileUrl)}`,
                }}
                onLoadStart={() => setDocumentLoading(true)}
                onLoadEnd={() => setDocumentLoading(false)}
                onError={() => {
                  setDocumentError(true);
                  setDocumentLoading(false);
                }}
                className="flex-1 w-full"
                startInLoadingState={true}
                scalesPageToFit={true}
                javaScriptEnabled={true}
              />
              {documentLoading && (
                <View className="absolute inset-0 justify-center items-center bg-white/80">
                  <ActivityIndicator size="large" color={Color.Green} />
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Small}
                    color={Color.Grey}
                    className="mt-2"
                  >
                    Loading PDF...
                  </TextComponent>
                </View>
              )}
            </View>
          ) : reportData.fileType && isImage(reportData.fileType) ? (
            <View className="relative">
              <Image
                source={{ uri: reportData.fileUrl }}
                className="w-full rounded-xl"
                style={{
                  height: Dimensions.get("window").height * 0.5,
                }}
                resizeMode="contain"
                onLoadStart={() => setDocumentLoading(true)}
                onLoadEnd={() => setDocumentLoading(false)}
                onError={() => {
                  setDocumentError(true);
                  setDocumentLoading(false);
                }}
              />
              {documentLoading && (
                <View className="absolute inset-0 justify-center items-center bg-white/80">
                  <ActivityIndicator size="large" color={Color.Green} />
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Small}
                    color={Color.Grey}
                    className="mt-2"
                  >
                    Loading image...
                  </TextComponent>
                </View>
              )}
            </View>
          ) : (
            <View className="p-4 bg-gray-100 rounded-lg">
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Grey}
              >
                Unable to display this file type
              </TextComponent>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
