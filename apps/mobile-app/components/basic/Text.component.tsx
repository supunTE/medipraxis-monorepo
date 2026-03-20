import {
  Color,
  Font,
  FontWeight,
  type TextSize,
  type TextStyle,
  textStyles,
  type TextVariant,
} from "@repo/config";
import {
  Text as RNText,
  type TextProps as RNTextProps,
  StyleSheet,
} from "react-native";

// Import font assets
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";

// Props type
type TextComponentProps<T extends TextVariant = TextVariant> = {
  variant: T;
  // Only Title may use ExtraLarge. Other categories must exclude ExtraLarge
  size: T extends TextVariant.Title
    ? TextSize
    : Exclude<TextSize, TextSize.ExtraLarge>;
  children: React.ReactNode;
  color?: Color;
  style?: RNTextProps["style"];
} & Omit<RNTextProps, "style" | "children">;

// Font mapping
const INTER_FONT_MAP: Record<number, string> = {
  [FontWeight.Regular]: "Inter_400Regular",
  [FontWeight.SemiBold]: "Inter_600SemiBold",
  [FontWeight.Bold]: "Inter_700Bold",
  [FontWeight.ExtraBold]: "Inter_700Bold",
};
const DMSANS_FONT_MAP: Record<number, string> = {
  [FontWeight.Regular]: "DMSans_400Regular",
  [FontWeight.Medium]: "DMSans_500Medium",
  [FontWeight.SemiBold]: "DMSans_600SemiBold",
};

// Function to get font family
const getFontFamily = (
  fontFamily: Font,
  fontWeight: FontWeight | number
): string => {
  const weightKey = Number(fontWeight);
  if (fontFamily === Font.Inter) {
    // @ts-expect-error "font always exists in map"
    return INTER_FONT_MAP[weightKey] ?? INTER_FONT_MAP[FontWeight.Regular];
  }
  if (fontFamily === Font.DMsans) {
    // @ts-expect-error "font always exists in map"
    return DMSANS_FONT_MAP[weightKey] ?? DMSANS_FONT_MAP[FontWeight.Regular];
  }
  // Default
  // @ts-expect-error "font always exists in map"
  return INTER_FONT_MAP[FontWeight.Regular];
};

// Main TextComponent
export function TextComponent<T extends TextVariant = TextVariant>({
  variant: category,
  size,
  children,
  color = Color.Black,
  style,
  ...restProps
}: TextComponentProps<T>) {
  // Load fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // Get text style based on category and size
  const getTextStyle = (
    variant: TextVariant,
    selectedSize: TextSize
  ): TextStyle | undefined => {
    const mapping = textStyles[variant];
    return mapping
      ? (mapping as Record<TextSize, TextStyle>)[selectedSize]
      : undefined;
  };

  const textStyle = getTextStyle(category, size);

  if (!textStyle) {
    console.warn(`Invalid category "${category}" or size "${size}"`);
    return null;
  }

  // Map font family and weight to actual font name
  const fontFamily = getFontFamily(textStyle.fontFamily, textStyle.fontWeight);

  // Create style object
  const computedStyle = StyleSheet.flatten([
    {
      fontFamily,
      fontSize: textStyle.fontSize,
      fontStyle: textStyle.fontStyle,
      color,
      ...(textStyle.lineHeight && { lineHeight: textStyle.lineHeight }),
      ...(textStyle.letterSpacing && {
        letterSpacing: textStyle.letterSpacing,
      }),
    },
    style,
  ]);

  return (
    <RNText style={computedStyle} {...restProps}>
      {children}
    </RNText>
  );
}

TextComponent.displayName = "TextComponent";
