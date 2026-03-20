import { Color, TextSize, TextVariant } from "@repo/config";
import {
  CheckCircleIcon,
  WarningIcon,
  XCircleIcon,
} from "phosphor-react-native";
import React, { useEffect } from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { TextComponent } from "./Text.component";

// Message type enum
export enum MessageType {
  Success = "success",
  Error = "error",
  Warning = "warning",
}

// Message popup props
export interface MessagePopupProps {
  visible: boolean;
  type: MessageType;
  title?: string;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
  confirmText?: string;
}

// Map MessageType to icon
const getIconForType = (type: MessageType) => {
  switch (type) {
    case MessageType.Success:
      return CheckCircleIcon;
    case MessageType.Error:
      return XCircleIcon;
    case MessageType.Warning:
      return WarningIcon;
    default:
      return CheckCircleIcon;
  }
};

// Map MessageType to color
const getColorForType = (type: MessageType): string => {
  switch (type) {
    case MessageType.Success:
      return Color.Green;
    case MessageType.Error:
      return Color.Danger;
    case MessageType.Warning:
      return Color.Warning;
    default:
      return Color.Green;
  }
};

// Map MessageType to default title
const getDefaultTitleForType = (type: MessageType): string => {
  switch (type) {
    case MessageType.Success:
      return "SUCCESS";
    case MessageType.Error:
      return "ERROR!";
    case MessageType.Warning:
      return "WARNING";
    default:
      return "MESSAGE";
  }
};

export function MessagePopup({
  visible,
  type,
  title,
  message,
  onClose,
  autoClose = false,
  autoCloseDuration = 3000,
  confirmText = "OK",
}: MessagePopupProps) {
  const Icon = getIconForType(type);
  const iconColor = getColorForType(type);
  const displayTitle = title || getDefaultTitleForType(type);

  // Auto close functionality
  useEffect(() => {
    if (visible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, autoClose, autoCloseDuration, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center px-5">
        <View className="bg-white rounded-2xl w-full max-w-[400px] overflow-hidden">
          {/* Icon and Title Section */}
          <View className="items-center py-6 px-5">
            <View className="mb-4 w-16 h-16">
              {/* Background Circle with Opacity */}
              <View
                className="absolute w-16 h-16 rounded-full opacity-20"
                style={{
                  backgroundColor: iconColor,
                }}
              />
              {/* Icon in Center */}
              <View className="absolute w-16 h-16 justify-center items-center">
                <Icon size={40} color={iconColor} weight="regular" />
              </View>
            </View>
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Large}
              color={iconColor as Color}
              style={{ textAlign: "center" }}
            >
              {displayTitle}
            </TextComponent>
          </View>

          {/* Message Section */}
          <View className="px-6 py-5">
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Large}
              color={Color.Grey}
              style={{ textAlign: "center" }}
            >
              {message}
            </TextComponent>
          </View>

          {/* Action Button */}
          <View className="px-5 pb-5">
            <TouchableOpacity
              className="py-3 px-6 rounded-lg items-center"
              style={{ backgroundColor: iconColor }}
              onPress={onClose}
            >
              <TextComponent
                variant={TextVariant.Button}
                size={TextSize.Medium}
                color={Color.White}
              >
                {confirmText}
              </TextComponent>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
