import { useAuth } from "@/auth/AuthContext";
import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
import { useDecryptedReport, useFetchReportFile } from "@/services/reports";
import { Color, TextSize, TextVariant } from "@repo/config";
import { ReportFileType } from "@repo/models";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  allowScreenCaptureAsync,
  preventScreenCaptureAsync,
} from "expo-screen-capture";
import {
  CalendarBlankIcon,
  ClockIcon,
  FileTextIcon,
  LockIcon,
  UserIcon,
} from "phosphor-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const HIDE_POPOUT_ICON_JS = `
(function() {
  var style = document.createElement('style');
  style.textContent = [
    'a[target="_blank"] { display: none !important; }',
    '.ndfHFb-c4YZDc-GSQQnc-LgbsSe { display: none !important; }',
    '.ndfHFb-c4YZDc-to915-LgbsSe { display: none !important; }',
    '#ge_oi { display: none !important; }',
    '[aria-label="Pop-out"] { display: none !important; }',
    '[aria-label="Open in new window"] { display: none !important; }'
  ].join('\\n');
  document.head.appendChild(style);

  var observer = new MutationObserver(function() {
    document.querySelectorAll('a[target="_blank"]').forEach(function(el) {
      el.style.display = 'none';
      el.removeAttribute('href');
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
true;
`;

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

const isEncrypted = (fileType: string | null) =>
  fileType === ReportFileType.EncryptedPdf ||
  fileType === ReportFileType.EncryptedImage;

export default function ReportViewerScreen() {
  const { user } = useAuth();
  const userId = user?.user_id ?? "";

  useFocusEffect(
    useCallback(() => {
      preventScreenCaptureAsync();
      return () => {
        allowScreenCaptureAsync();
      };
    }, [])
  );

  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const webViewRef = useRef<WebView>(null);
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState(false);

  const {
    data: reportData,
    isLoading,
    error,
    refetch,
  } = useFetchReportFile(userId, id || "");

  const { decryptedBase64, originalType, isDecrypting, decryptionError } =
    useDecryptedReport(reportData?.fileUrl ?? "", reportData?.fileType ?? null);

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
          ) : isEncrypted(reportData.fileType) && isDecrypting ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={Color.Green} />
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Grey}
                className="mt-2"
              >
                Decrypting report...
              </TextComponent>
            </View>
          ) : isEncrypted(reportData.fileType) && decryptionError ? (
            <View className="p-6 bg-gray-100 rounded-lg items-center">
              <LockIcon size={48} color={Color.Grey} weight="regular" />
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Medium}
                color={Color.Black}
                className="mt-4 mb-2"
              >
                File is locked
              </TextComponent>
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Grey}
                className="text-center"
              >
                {decryptionError}
              </TextComponent>
            </View>
          ) : isEncrypted(reportData.fileType) &&
            decryptedBase64 &&
            originalType === "pdf" ? (
            <View
              className="relative rounded-xl overflow-hidden bg-white"
              style={{
                height: Dimensions.get("window").height * 0.6,
              }}
            >
              <WebView
                source={{
                  html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0}canvas{width:100%;display:block;margin-bottom:4px}</style><script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script></head><body><div id="c"></div><script>pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";var r=atob("${decryptedBase64}"),u=new Uint8Array(r.length);for(var i=0;i<r.length;i++)u[i]=r.charCodeAt(i);pdfjsLib.getDocument({data:u}).promise.then(function(p){var c=document.getElementById("c");(function next(n){if(n>p.numPages)return;p.getPage(n).then(function(pg){var s=window.innerWidth/pg.getViewport({scale:1}).width;var vp=pg.getViewport({scale:s});var cv=document.createElement("canvas");cv.width=vp.width;cv.height=vp.height;c.appendChild(cv);pg.render({canvasContext:cv.getContext("2d"),viewport:vp}).promise.then(function(){next(n+1)})});})(1);});</script></body></html>`,
                }}
                onLoadStart={() => setDocumentLoading(true)}
                onLoadEnd={() => setDocumentLoading(false)}
                onError={() => {
                  setDocumentError(true);
                  setDocumentLoading(false);
                }}
                originWhitelist={["*"]}
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
          ) : isEncrypted(reportData.fileType) &&
            decryptedBase64 &&
            originalType === "image" ? (
            <View className="relative">
              <Image
                source={{
                  uri: `data:image/png;base64,${decryptedBase64}`,
                }}
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
          ) : reportData.fileType && isPDF(reportData.fileType) ? (
            <View
              className="relative rounded-xl overflow-hidden bg-white"
              style={{
                height: Dimensions.get("window").height * 0.6,
              }}
            >
              <WebView
                ref={webViewRef}
                source={{
                  uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(reportData.fileUrl)}`,
                }}
                onLoadStart={() => setDocumentLoading(true)}
                onLoadEnd={() => setDocumentLoading(false)}
                onError={() => {
                  setDocumentError(true);
                  setDocumentLoading(false);
                }}
                injectedJavaScript={HIDE_POPOUT_ICON_JS}
                onShouldStartLoadWithRequest={(request) => {
                  if (request.url.includes("docs.google.com/gview"))
                    return true;
                  if (
                    Platform.OS === "android" &&
                    request.url === "about:blank"
                  )
                    return true;
                  return false;
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
