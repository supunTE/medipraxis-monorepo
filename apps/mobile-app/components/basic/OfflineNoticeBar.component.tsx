import { Color } from "@repo/config";
import { useNetInfo } from "@react-native-community/netinfo";
import { WifiSlashIcon } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NOTICE_DURATION_MS = 5000;
const NAVBAR_TOP_OFFSET = 84;

// Global flag: once the banner has been shown and completed, skip it on new pages.
let bannerCompletedGlobally = false;

type OfflineNoticeBarProps = {
  containerStyle?: unknown;
};

export function OfflineNoticeBar({ containerStyle: _containerStyle }: OfflineNoticeBarProps) {
  void _containerStyle;

  const { isConnected, isInternetReachable } = useNetInfo();
  const insets = useSafeAreaInsets();
  const isOffline = isConnected === false || isInternetReachable === false;
  const shouldShowOfflineNotice = isOffline;
  const [showCompactIconOnly, setShowCompactIconOnly] = useState(bannerCompletedGlobally);
  const progress = useRef(new Animated.Value(bannerCompletedGlobally ? 0 : 1)).current;

  useEffect(() => {
    if (!shouldShowOfflineNotice) {
      setShowCompactIconOnly(false);
      bannerCompletedGlobally = false;
      progress.stopAnimation();
      progress.setValue(1);
      return;
    }

    // If already shown globally, stay in compact mode.
    if (bannerCompletedGlobally) {
      setShowCompactIconOnly(true);
      return;
    }

    setShowCompactIconOnly(false);
    progress.stopAnimation();
    progress.setValue(1);

    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: NOTICE_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        bannerCompletedGlobally = true;
        setShowCompactIconOnly(true);
      }
    });

    return () => {
      animation.stop();
    };
  }, [progress, shouldShowOfflineNotice]);

  const handleIconPress = () => {
    bannerCompletedGlobally = false;
    progress.stopAnimation();
    progress.setValue(1);
    setShowCompactIconOnly(false);

    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: NOTICE_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        bannerCompletedGlobally = true;
        setShowCompactIconOnly(true);
      }
    });
  };

  if (!shouldShowOfflineNotice) {
    return null;
  }

  const bottomOffset = insets.bottom + NAVBAR_TOP_OFFSET;

  if (showCompactIconOnly) {
    return (
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          right: 16,
          bottom: bottomOffset,
          zIndex: 1000,
        }}
      >
        <TouchableOpacity
          onPress={handleIconPress}
          style={{
            backgroundColor: "#E5E7EB",
            borderRadius: 999,
            width: 34,
            height: 34,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WifiSlashIcon size={18} color={Color.Black} weight="fill" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
        zIndex: 1000,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: "76%",
          backgroundColor: "#E5E7EB",
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingTop: 6,
          paddingBottom: 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minHeight: 22,
          }}
        >
          <WifiSlashIcon size={18} color={Color.Black} weight="fill" />
          <Text
            style={{
              color: Color.Black,
              fontFamily: "DMSans",
              fontSize: 14,
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            {"Offline mode active"}
          </Text>
        </View>

        <View
          style={{
            marginTop: 4,
            marginHorizontal: 22,
            height: 2,
            borderRadius: 999,
            backgroundColor: "#D1D5DB",
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              height: "100%",
              backgroundColor: Color.Black,
            }}
          />
        </View>
      </View>
    </View>
  );
}
