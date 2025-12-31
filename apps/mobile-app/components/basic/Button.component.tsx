import { Icons, type Icon } from "@/config";
import { Color, TextSize, textStyles, TextVariant } from "@repo/config";
import clsx from "clsx";
import React, { useRef } from "react";
import {
  Animated,
  type TextStyle as RNTextStyle,
  type ViewStyle,
} from "react-native";
import {
  Button as GlueStackButton,
  ButtonText as GlueStackButtonText,
} from "../ui/button";

// Enum - Button size
export enum ButtonSize {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

// Button component props
type BasicButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof GlueStackButton>,
  "size" | "children"
> & {
  size?: ButtonSize;
  children?: React.ReactNode;
  className?: string;
  leftIcon?: Icon;
  rightIcon?: Icon;
  buttonColor?: Color;
  textColor?: Color;
  iconColor?: Color;
};

// Map ButtonSize to TextSize
const mapButtonSizeToTextSize = (
  size: ButtonSize
): Exclude<TextSize, TextSize.ExtraLarge> => {
  const mapping: Record<ButtonSize, Exclude<TextSize, TextSize.ExtraLarge>> = {
    [ButtonSize.Small]: TextSize.Small,
    [ButtonSize.Medium]: TextSize.Medium,
    [ButtonSize.Large]: TextSize.Large,
  };
  return mapping[size];
};

// Map ButtonSize to Icon size
const mapButtonSizeToIconSize = (size: ButtonSize): number =>
  ({
    [ButtonSize.Small]: 16,
    [ButtonSize.Medium]: 20,
    [ButtonSize.Large]: 24,
  })[size];

// Default button component
const ButtonComponent = ({
  size = ButtonSize.Medium,
  children,
  className,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  buttonColor = Color.Black,
  textColor = Color.White,
  iconColor = Color.White,
  ...rest
}: BasicButtonProps) => {
  // Set up press animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Get text style for button size
  const textSize = mapButtonSizeToTextSize(size);
  const buttonTextStyle = textStyles[TextVariant.Button][textSize];

  // Set icon size based on button size
  const defaultIconSize = mapButtonSizeToIconSize(size);

  // Set icon color or fallback to text color
  const finalIconColor = iconColor || textColor;
  const iconSettings = { size: defaultIconSize, color: finalIconColor };

  // Apply custom background color if provided
  const buttonStyle = buttonColor
    ? { backgroundColor: buttonColor }
    : undefined;

  // Apply text color to button text style
  const textStyleWithColor: RNTextStyle = {
    fontFamily: buttonTextStyle.fontFamily,
    fontSize: buttonTextStyle.fontSize,
    fontWeight: String(buttonTextStyle.fontWeight) as RNTextStyle["fontWeight"],
    fontStyle: buttonTextStyle.fontStyle,
    color: textColor,
  };

  // Animation style for scaling
  const animatedStyle: Animated.WithAnimatedValue<ViewStyle> = {
    transform: [{ scale: scaleAnim }],
  };

  // Scale down when pressed
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  // Scale up when released
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Button styling based on size using clsx
  const buttonClassName = clsx(
    "justify-center items-center",
    {
      // Large: Full width with fixed height, centered content
      "px-4 h-14 w-full gap-2": size === ButtonSize.Large,
      // Medium: Hug content with padding and spacing
      "px-4 py-2 gap-2": size === ButtonSize.Medium,
      // Small: Hug content with small padding and spacing
      "px-3 py-1.5 gap-1.5": size === ButtonSize.Small,
    },
    className
  );

  // Render button content (icons and text)
  const buttonContent = (
    <>
      {/* Left icon */}
      {LeftIcon && <LeftIcon {...iconSettings} />}

      {/* Button text */}
      {typeof children === "string" || typeof children === "number" ? (
        <GlueStackButtonText style={textStyleWithColor}>
          {children}
        </GlueStackButtonText>
      ) : (
        children
      )}

      {/* Right icon */}
      {RightIcon && <RightIcon {...iconSettings} />}
    </>
  );

  // Render animated button
  return (
    <Animated.View style={animatedStyle}>
      <GlueStackButton
        {...rest}
        className={buttonClassName}
        style={buttonStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {buttonContent}
      </GlueStackButton>
    </Animated.View>
  );
};

// BackButton component props
type BackButtonProps = Omit<
  BasicButtonProps,
  "leftIcon" | "buttonColor" | "textColor" | "iconColor" | "size"
> & {
  children?: string;
  size?: ButtonSize.Small | ButtonSize.Medium;
};

// BackButton component
const BackButton: React.FC<BackButtonProps> = ({
  children = "Back",
  size = ButtonSize.Medium,
  ...props
}) => {
  return (
    <ButtonComponent
      size={size}
      leftIcon={Icons.CaretLeft}
      buttonColor={Color.Green}
      textColor={Color.White}
      iconColor={Color.White}
      className="rounded-xl shadow-sm"
      {...props}
    >
      {children}
    </ButtonComponent>
  );
};

// Attach BackButton as a static property
ButtonComponent.BackButton = BackButton;

export { ButtonComponent };
