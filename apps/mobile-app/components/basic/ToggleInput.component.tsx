import { Switch } from "@/components/ui/switch";
import { Color, TextSize, textStyles, TextVariant } from "@repo/config";
import React, { useState } from "react";
import { Text, View } from "react-native";

type ToggleSize = "sm" | "md" | "lg";

interface ToggleButtonProps {
  size?: ToggleSize;
  isActive?: boolean;
  onToggle?: (active: boolean) => void;
  label?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  size = "md",
  isActive: controlledIsActive,
  onToggle,
  label,
}) => {
  const [internalIsActive, setInternalIsActive] = useState(false);

  // Use controlled value if provided, otherwise use internal state
  const isActive =
    controlledIsActive !== undefined ? controlledIsActive : internalIsActive;

  const handleToggle = (value: boolean) => {
    if (controlledIsActive === undefined) {
      setInternalIsActive(value);
    }
    onToggle?.(value);
  };

  // Get the appropriate text style based on toggle size
  const getLabelStyle = () => {
    const textSize = size === "lg" ? TextSize.Large : TextSize.Medium;
    const style = textStyles[TextVariant.Body][textSize];

    return {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: String(style.fontWeight) as any,
      fontStyle: style.fontStyle,
      color: Color.Black,
    };
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}

      <Switch
        size={size}
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
