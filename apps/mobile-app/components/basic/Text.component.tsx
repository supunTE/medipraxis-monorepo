import { Color, Font, FontWeight, TextSize, TextStyle, textStyles, TextVariant } from '@repo/config';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

// Import font assets
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { useFonts } from 'expo-font';


// Props type
type TextComponentProps<T extends TextVariant = TextVariant> = {
  variant: T;
  // Only Title may use ExtraLarge. Other categories must exclude ExtraLarge
  size: T extends TextVariant.Title ? TextSize : Exclude<TextSize, TextSize.ExtraLarge>;
  children: React.ReactNode;
  color?: Color;
  style?: RNTextProps['style'];
} & Omit<RNTextProps, 'style' | 'children'>;

// Font mapping
const LATO_FONT_MAP: Record<number, string> = {
  [FontWeight.Regular]: 'Lato_400Regular',
  [FontWeight.SemiBold]: 'Lato_400Bold',
  [FontWeight.Bold]: 'Lato_700Bold',
  [FontWeight.ExtraBold]: 'Lato_700Bold',
};
const DMSANS_FONT_MAP: Record<number, string> = {
  [FontWeight.Regular]: 'DMSans_400Regular',
  [FontWeight.Medium]: 'DMSans_500Medium',
  [FontWeight.SemiBold]: 'DMSans_600SemiBold',
};

// Function to get font family
const getFontFamily = (fontFamily: Font, fontWeight: FontWeight | number): string => {
  const weightKey = Number(fontWeight);
  if (fontFamily === Font.Lato) {
    return LATO_FONT_MAP[weightKey] ?? LATO_FONT_MAP[FontWeight.Regular];
  }
  if (fontFamily === Font.DMsans) {
    return DMSANS_FONT_MAP[weightKey] ?? DMSANS_FONT_MAP[FontWeight.Regular];
  }
  // Default
  return LATO_FONT_MAP[FontWeight.Regular];
};

// Main TextComponent
export default function TextComponent<T extends TextVariant = TextVariant>({
  variant: category,
  size,
  children,
  color = Color.Black,
  style,
  ...restProps
}: TextComponentProps<T>) {
  // Load fonts
  const [fontsLoaded] = useFonts({
    Lato_400Regular,
    Lato_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // Get text style based on category and size (typed accessor)
  const getTextStyle = (variant: TextVariant, selectedSize: TextSize): TextStyle | undefined => {
    const mapping = textStyles[variant];
    return mapping ? (mapping as Record<TextSize, TextStyle>)[selectedSize] : undefined;
  };

  const textStyle = getTextStyle(category as TextVariant, size as TextSize);

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
      ...(textStyle.letterSpacing && { letterSpacing: textStyle.letterSpacing }),
    },
    style,
  ]);

  return (
    <RNText style={computedStyle} {...restProps}>
      {children}
    </RNText>
  );
}
