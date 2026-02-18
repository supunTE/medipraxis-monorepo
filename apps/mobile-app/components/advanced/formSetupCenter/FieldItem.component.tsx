import {
  DMSans_400Regular,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";
import { Color } from "@repo/config";
import { useFonts } from "expo-font";
import { DotsSixVerticalIcon } from "phosphor-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { FieldItemProps } from "./formConfig.types";

export function FieldItem({
  field,
  onPress,
  onDragStart,
  onDragMove,
  onDragEnd,
  isDragging = false,
}: FieldItemProps) {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
  });
  const dragStartY = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Animation values
  const scaleXAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(0)).current;

  // Animate when dragging state changes
  useEffect(() => {
    if (isDragging) {
      Animated.parallel([
        Animated.spring(scaleXAnim, {
          toValue: 0.98,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(elevationAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleXAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(elevationAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isDragging, scaleXAnim, elevationAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => isDraggingRef.current,
      onPanResponderGrant: (evt) => {
        isDraggingRef.current = true;
        dragStartY.current = evt.nativeEvent.pageY;
        onDragStart?.();
      },
      onPanResponderMove: (evt) => {
        if (isDraggingRef.current) {
          onDragMove?.(evt.nativeEvent.pageY);
        }
      },
      onPanResponderRelease: () => {
        isDraggingRef.current = false;
        dragStartY.current = 0;
        onDragEnd?.();
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
        dragStartY.current = 0;
        onDragEnd?.();
      },
    })
  ).current;

  if (!fontsLoaded) {
    return null;
  }

  const FieldIcon = field.icon;

  // Interpolate elevation
  const elevationValue = elevationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  const shadowOpacity = elevationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  // Web-compatible drag handlers
  const handleMouseDown = (e: any) => {
    if (Platform.OS === "web") {
      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = true;
      dragStartY.current = e.clientY || e.pageY;
      onDragStart?.();

      const handleMouseMove = (e: MouseEvent) => {
        if (isDraggingRef.current) {
          e.preventDefault();
          onDragMove?.(e.clientY || e.pageY);
        }
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        dragStartY.current = 0;
        onDragEnd?.();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scaleX: scaleXAnim }],
          elevation: elevationValue,
          shadowOpacity: shadowOpacity,
          zIndex: isDragging ? 1000 : 1,
        },
      ]}
    >
      {/* Field Icon Section */}
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <FieldIcon size={20} color={Color.White} weight="regular" />
      </TouchableOpacity>

      {/* Field Name Section */}
      <TouchableOpacity
        style={styles.fieldNameSection}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.fieldNameContainer}>
          <Text style={styles.fieldName}>{field.fieldName}</Text>
          {field.isRequired && <Text style={styles.requiredStar}>*</Text>}
        </View>
      </TouchableOpacity>

      {/* Drag Handle Section */}
      <View
        style={[
          styles.dragHandle,
          isDragging && styles.dragHandleActive,
          Platform.OS === "web" && ({ cursor: "grab" } as any),
          isDragging &&
            Platform.OS === "web" &&
            ({ cursor: "grabbing" } as any),
        ]}
        {...(Platform.OS !== "web" ? panResponder.panHandlers : {})}
        // @ts-ignore - web-specific event
        onMouseDown={Platform.OS === "web" ? handleMouseDown : undefined}
      >
        <DotsSixVerticalIcon size={20} color={Color.Grey} weight="bold" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Color.LightGrey,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: Color.White,
    shadowColor: Color.Black,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconContainer: {
    width: 56,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: Color.Green,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: Color.LightGrey,
  },
  fieldNameSection: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: Color.LightGrey,
  },
  fieldNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: Color.Black,
  },
  requiredStar: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: Color.Danger,
    marginLeft: 2,
  },
  dragHandle: {
    width: 48,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: Color.LightCream,
    justifyContent: "center",
    alignItems: "center",
  },
  dragHandleActive: {
    backgroundColor: Color.Grey,
    opacity: 0.8,
  },
});
