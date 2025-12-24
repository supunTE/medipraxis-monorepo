import { Color, TextSize, textStyles, TextVariant } from '@repo/config';
import { CaretLeft, IconProps } from 'phosphor-react-native';
import React, { useRef } from 'react';
import { Animated, TextStyle as RNTextStyle, ViewStyle } from 'react-native';
import {
  Button as GlueStackButton,
  ButtonText as GlueStackButtonText
} from '../ui/button';

// Enum - Button size
export enum ButtonSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

// Button component props
type BasicButtonProps = Omit<React.ComponentPropsWithoutRef<typeof GlueStackButton>, 'size' | 'children'> & {
  size?: ButtonSize;
  children?: React.ReactNode;
  className?: string;
  leftIcon?: React.ComponentType<IconProps>;
  rightIcon?: React.ComponentType<IconProps>;
  buttonColor?: Color;
  textColor?: Color;
  iconColor?: Color;
};

// Map ButtonSize to TextSize
const mapButtonSizeToTextSize = (size: ButtonSize): Exclude<TextSize, TextSize.ExtraLarge> => {
  if (size === ButtonSize.Small) return TextSize.Small;
  if (size === ButtonSize.Medium) return TextSize.Medium;
  return TextSize.Large;
};

// Default button component
export const ButtonComponent = ({ 
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
  const defaultIconSize = size === ButtonSize.Large ? 24 : size === ButtonSize.Medium ? 20 : 16;
  
  // Set icon color or fallback to text color
  const finalIconColor = iconColor || textColor;
  const iconSettings = { size: defaultIconSize, color: finalIconColor };

  // Apply custom background color if provided
  const buttonStyle = buttonColor ? { backgroundColor: buttonColor } : undefined;

  // Apply text color to button text style
  const textStyleWithColor: RNTextStyle = {
    fontFamily: buttonTextStyle.fontFamily,
    fontSize: buttonTextStyle.fontSize,
    fontWeight: String(buttonTextStyle.fontWeight) as RNTextStyle['fontWeight'],
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

  // Button styling based on size
  let buttonClassName = className ?? '';
  
  if (size === ButtonSize.Large) {
    // Large: Full width with fixed height, centered content
    buttonClassName = [buttonClassName, 'px-4 h-14 w-full justify-center items-center gap-2'].filter(Boolean).join(' ');
  } else if (size === ButtonSize.Medium) {
    // Medium: Hug content with padding and spacing
    buttonClassName = [buttonClassName, 'px-4 py-2 justify-center items-center gap-2'].filter(Boolean).join(' ');
  } else {
    // Small: Hug content with small padding and spacing
    buttonClassName = [buttonClassName, 'px-3 py-1.5 justify-center items-center gap-1.5'].filter(Boolean).join(' ');
  }

  // Render button content (icons and text)
  const buttonContent = (
    <>
      {/* Left icon */}
      {LeftIcon && <LeftIcon {...iconSettings} />}
      
      {/* Button text */}
      {typeof children === 'string' || typeof children === 'number' ? (
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
type BackButtonProps = Omit<BasicButtonProps, 'leftIcon' | 'buttonColor' | 'textColor' | 'iconColor' | 'size'> & {
  children?: string;
  size?: ButtonSize.Small | ButtonSize.Medium;
};

// BackButton component
const BackButton: React.FC<BackButtonProps> = ({ 
  children = 'Back',
  size = ButtonSize.Medium,
  ...props 
}) => {
  return (
    <ButtonComponent
      size={size}
      leftIcon={CaretLeft}
      buttonColor={Color.Green}
      textColor={Color.White}
      iconColor={Color.White}
      {...props}
    >
      {children}
    </ButtonComponent>
  );
};

// Attach BackButton as a static property
ButtonComponent.BackButton = BackButton;

export default ButtonComponent;


