import { TextComponent } from "@/components/basic";
import { Icons, type IconName } from "@/config";
import { Color, TextSize, TextVariant } from "@repo/config";
import { type FC } from "react";
import { View } from "react-native";

export enum ChipVariant {
  DarkGreen = "darkGreen",
  TextGreen = "textGreen",
  Green = "green",
  LightGreen = "lightGreen",
  LightCream = "lightCream",
  White = "white",
  Black = "black",
  Grey = "grey",
  LightGrey = "lightGrey",
  Danger = "danger",
  Success = "success",
  Warning = "warning",
}

// Define the style type
type ChipVariantStyle = {
  backgroundColor: Color;
  textColor: Color;
};

// Map ChipVariant to Color enum
const variantColorMap: Record<ChipVariant, Color> = {
  [ChipVariant.DarkGreen]: Color.DarkGreen,
  [ChipVariant.TextGreen]: Color.TextGreen,
  [ChipVariant.Green]: Color.Green,
  [ChipVariant.LightGreen]: Color.LightGreen,
  [ChipVariant.LightCream]: Color.LightCream,
  [ChipVariant.White]: Color.White,
  [ChipVariant.Black]: Color.Black,
  [ChipVariant.Grey]: Color.Grey,
  [ChipVariant.LightGrey]: Color.LightGrey,
  [ChipVariant.Danger]: Color.Danger,
  [ChipVariant.Success]: Color.Success,
  [ChipVariant.Warning]: Color.Warning,
};

// Variants that should use black text
const lightBackgroundVariants: ChipVariant[] = [
  ChipVariant.LightGreen,
  ChipVariant.LightCream,
  ChipVariant.White,
  ChipVariant.LightGrey,
];

// Determine text color based on background
const getTextColor = (variant: ChipVariant): Color => {
  return lightBackgroundVariants.includes(variant) ? Color.Black : Color.White;
};

// Generate chipVariantStyles
const chipVariantStyles: Record<ChipVariant, ChipVariantStyle> = Object.keys(
  variantColorMap
).reduce(
  (acc, key) => {
    const variant = key as ChipVariant;
    acc[variant] = {
      backgroundColor: variantColorMap[variant],
      textColor: getTextColor(variant),
    };
    return acc;
  },
  {} as Record<ChipVariant, ChipVariantStyle>
);

export interface ChipComponentProps {
  text: string;
  variant?: ChipVariant;
  iconName?: IconName;
  iconPosition?: "left" | "right";
}

export const ChipComponent: FC<ChipComponentProps> = ({
  text,
  variant = ChipVariant.Green,
  iconName,
  iconPosition = "left",
}) => {
  // Get colors based on variant
  const { backgroundColor, textColor } = chipVariantStyles[variant];

  // Get icon component from Icons
  const IconComponent = iconName ? Icons[iconName] : null;

  // Icon size
  const iconSize = 13;

  // Use bold weight
  const iconWeight = "bold";

  return (
    <View
      className="flex-row items-center rounded-full px-3 py-1.5 self-start"
      style={{ backgroundColor }}
    >
      {/* Render icon on the left if specified */}
      {IconComponent && iconPosition === "left" && (
        <View className="mx-1">
          <IconComponent
            size={iconSize}
            color={textColor}
            weight={iconWeight}
          />
        </View>
      )}

      <TextComponent
        variant={TextVariant.Body}
        size={TextSize.Small}
        color={textColor}
      >
        {text}
      </TextComponent>

      {/* Render icon on the right if specified */}
      {IconComponent && iconPosition === "right" && (
        <View className="mx-1">
          <IconComponent
            size={iconSize}
            color={textColor}
            weight={iconWeight}
          />
        </View>
      )}
    </View>
  );
};
