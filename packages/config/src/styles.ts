// Enums

export enum Font {
  Lato = "lato",
  DMsans = "dm_sans",
}

export enum FontWeight {
  Regular = 400,
  Medium = 500,
  SemiBold = 600,
  Bold = 700,
  ExtraBold = 800,
}

export enum FontStyle {
  Normal = "normal",
  Italic = "italic",
}

export enum Color {
  DarkGreen = "#01130A",
  TextGreen = "#44B619",
  Green = "#90C67C",
  LightGreen = "#E3F0AF",
  LightCream = "#FBF6E9",
  White = "#FFFFFF",
  Black = "#01130A",
  Grey = "#7D7D7D", // For Placeholder text
  LightGrey = "#D3D3D3", // For borders
  Danger = "#FF5757",
  Success = "#44B619",
  Warning = "#FFA500",
}

// Variant and Size enums

export enum TextVariant {
  Title = "title",
  Body = "body",
  Button = "button",
}

export enum TextSize {
  Small = "small",
  Medium = "medium",
  Large = "large",
  ExtraLarge = "extra_large",
}

// Types

export type TextStyle = {
  fontFamily: Font;
  fontSize: number;
  fontWeight: FontWeight | number;
  fontStyle: FontStyle;
  lineHeight?: number;
  letterSpacing?: number;
};

export type TextMapping = {
  [TextVariant.Title]: Record<TextSize, TextStyle>;
  [TextVariant.Body]: Record<Exclude<TextSize, TextSize.ExtraLarge>, TextStyle>;
  [TextVariant.Button]: Record<
    Exclude<TextSize, TextSize.ExtraLarge>,
    TextStyle
  >;
};

// Orginal Text Styles (Initial figma hifi design)
const originalTextStyles: TextMapping = {
  [TextVariant.Title]: {
    // Title – Small
    [TextSize.Small]: {
      fontFamily: Font.Lato,
      fontSize: 16,
      fontWeight: FontWeight.Bold,
      fontStyle: FontStyle.Normal,
    },

    // Title – Medium
    [TextSize.Medium]: {
      fontFamily: Font.Lato,
      fontSize: 20,
      fontWeight: FontWeight.Bold,
      fontStyle: FontStyle.Normal,
    },

    // Title – Large
    [TextSize.Large]: {
      fontFamily: Font.Lato,
      fontSize: 24,
      fontWeight: FontWeight.ExtraBold,
      fontStyle: FontStyle.Normal,
    },

    // Title - Extra Large (Page Title)
    [TextSize.ExtraLarge]: {
      fontFamily: Font.Lato,
      fontSize: 36,
      fontWeight: FontWeight.SemiBold,
      fontStyle: FontStyle.Normal,
    },
  },

  [TextVariant.Body]: {
    // Text – Small (tags)
    [TextSize.Small]: {
      fontFamily: Font.DMsans,
      fontSize: 11,
      fontWeight: FontWeight.Regular,
      fontStyle: FontStyle.Normal,
    },

    // Text – Medium (tags)
    [TextSize.Medium]: {
      fontFamily: Font.DMsans,
      fontSize: 12,
      fontWeight: FontWeight.SemiBold,
      fontStyle: FontStyle.Normal,
    },

    // Text – large
    [TextSize.Large]: {
      fontFamily: Font.DMsans,
      fontSize: 14,
      fontWeight: FontWeight.Regular,
      fontStyle: FontStyle.Normal,
    },
  },

  [TextVariant.Button]: {
    // Button – Small
    [TextSize.Small]: {
      fontFamily: Font.Lato,
      fontSize: 14,
      fontWeight: FontWeight.Bold,
      fontStyle: FontStyle.Normal,
    },

    // Button – Medium
    [TextSize.Medium]: {
      fontFamily: Font.DMsans,
      fontSize: 16,
      fontWeight: FontWeight.SemiBold,
      fontStyle: FontStyle.Normal,
    },

    // Button – Large
    [TextSize.Large]: {
      fontFamily: Font.DMsans,
      fontSize: 16,
      fontWeight: FontWeight.Medium,
      fontStyle: FontStyle.Normal,
    },
  },
};

// Updated Text Styles with fontSize increased by 20%

export const textStyles = Object.entries(originalTextStyles).reduce(
  (acc, [variant, sizes]) => {
    acc[variant as TextVariant] = Object.entries(sizes).reduce(
      (sizeAcc, [size, style]) => {
        sizeAcc[size as TextSize] = {
          ...style,
          fontSize: Math.round(style.fontSize * 1.2),
        };
        return sizeAcc;
      },
      {} as Record<TextSize, TextStyle>
    );
    return acc;
  },
  {} as TextMapping
);
