import { TextComponent } from "@/components/basic";
import { Switch } from "@/components/ui/switch";
import { Color, TextSize, TextVariant } from "@repo/config";
import { useState } from "react";
import { Platform, View } from "react-native";

// Enum - Toggle size
export enum ToggleSize {
  Medium = "medium",
  Large = "large",
}

// Type for ToggleSize values
export type ToggleSizeType = ToggleSize.Medium | ToggleSize.Large;

// Enum for actual rendering sizes
enum InternalToggleSize {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

interface ToggleButtonProps {
  size?: ToggleSize;
  isActive?: boolean;
  onToggle?: (active: boolean) => void;
  label?: string;
}

// Map user size to platform-specific internal size
const getInternalSize = (userSize: ToggleSize): InternalToggleSize => {
  const platform = Platform.OS;

  // For macOS/iOS (Medium -> Small, Large -> Medium)
  if (platform === "ios" || platform === "macos") {
    switch (userSize) {
      case ToggleSize.Medium:
        return InternalToggleSize.Small;
      case ToggleSize.Large:
        return InternalToggleSize.Medium;
    }
  }

  // For Android/Web(Medium -> Medium, Large -> Large)
  switch (userSize) {
    case ToggleSize.Medium:
      return InternalToggleSize.Medium;
    case ToggleSize.Large:
      return InternalToggleSize.Large;
  }
};

export const ToggleButton = ({
  size = ToggleSize.Medium,
  isActive: controlledIsActive,
  onToggle,
  label,
}: ToggleButtonProps) => {
  const [internalIsActive, setInternalIsActive] = useState(false);
  const internalSize = getInternalSize(size);

  // Use controlled value if provided, otherwise use internal state
  const isActive =
    controlledIsActive !== undefined ? controlledIsActive : internalIsActive;

  const handleToggle = (value: boolean) => {
    if (controlledIsActive === undefined) {
      setInternalIsActive(value);
    }
    onToggle?.(value);
  };

  // Map InternalToggleSize to TextSize (excluding ExtraLarge for Body variant)
  const getTextSize = (): Exclude<TextSize, TextSize.ExtraLarge> => {
    switch (internalSize) {
      case InternalToggleSize.Large:
        return TextSize.Large;
      case InternalToggleSize.Small:
        return TextSize.Small;
      case InternalToggleSize.Medium:
      default:
        return TextSize.Medium;
    }
  };

  // Map InternalToggleSize to Switch size prop
  const getSwitchSize = (): "sm" | "md" | "lg" => {
    switch (internalSize) {
      case InternalToggleSize.Large:
        return "lg";
      case InternalToggleSize.Small:
        return "sm";
      case InternalToggleSize.Medium:
      default:
        return "md";
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      {label && (
        <TextComponent variant={TextVariant.Body} size={getTextSize()}>
          {label}
        </TextComponent>
      )}

      <Switch
        size={getSwitchSize()}
        value={isActive}
        onValueChange={handleToggle}
        trackColor={{
          false: Color.Grey,
          true: Color.Green,
        }}
      />
    </View>
  );
};
