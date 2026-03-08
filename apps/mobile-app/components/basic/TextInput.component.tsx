import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Icons } from "@/config";
import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import React, { useState } from "react";
import {
  type KeyboardType,
  Pressable,
  type TextStyle as RNTextStyle,
  Text,
  View,
} from "react-native";

export enum TextInputType {
  Text = "text",
  Password = "password",
  Number = "number",
  Decimal = "decimal",
  Email = "email",
  Phone = "phone",
}

// Props for the TextInput component
interface TextInputProps {
  inputWrapper?: Omit<
    React.ComponentPropsWithoutRef<typeof Input>,
    "size" | "variant" | "style"
  >;
  inputField?: Omit<React.ComponentPropsWithoutRef<typeof InputField>, "style">;
  label?: string;
  inputType?: TextInputType;
  helperText?: string;
  errorText?: string;
  hideHelperText?: boolean;
  validateOnChange?: boolean;
  startIcon?: React.ReactNode;
}

// Props for OTP Input Field
interface OTPInputFieldProps {
  inputWrapper?: Omit<
    React.ComponentPropsWithoutRef<typeof Input>,
    "size" | "variant" | "style"
  >;
  inputField?: Omit<React.ComponentPropsWithoutRef<typeof InputField>, "style">;
  label?: string;
  size?: number;
  errorText?: string;
}

// Type for TextInputComponent with OTPField
interface TextInputComponentType extends React.FC<TextInputProps> {
  OTPField: React.FC<OTPInputFieldProps>;
}

// Map inputType to React Native keyboardType
const getKeyboardType = (type?: TextInputType): KeyboardType => {
  switch (type) {
    case TextInputType.Number:
      return "number-pad";
    case TextInputType.Decimal:
      return "decimal-pad";
    case TextInputType.Email:
      return "email-address";
    case TextInputType.Phone:
      return "phone-pad";
    default:
      return "default";
  }
};

// Text styles
const textLargeStyle = textStyles[TextVariant.Body][TextSize.Large];
const textSmallStyle = textStyles[TextVariant.Body][TextSize.Small];
const buttonLargeStyle = textStyles[TextVariant.Button][TextSize.Large];

// Default TextInput component
export const TextInput: React.FC<TextInputProps> = ({
  inputWrapper = {},
  inputField = {},
  label,
  inputType = TextInputType.Text,
  helperText,
  errorText,
  hideHelperText = false,
  startIcon,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    isDisabled = false,
    isInvalid = false,
    ...restInputWrapper
  } = inputWrapper;
  const {
    value = "",
    onChangeText,
    placeholder,
    ...restInputField
  } = inputField;

  const shouldShowToggle = inputType === TextInputType.Password;
  const isSecureEntry = shouldShowToggle && !isPasswordVisible;
  const hasStartIcon = !!startIcon;

  // Determine border color based on error state
  const getBorderColor = () => {
    if (errorText || isInvalid) return Color.Danger;
    return Color.LightGrey;
  };

  // Determine message to display
  const getMessage = () => {
    if (hideHelperText) return null;
    if (errorText) return errorText;
    return helperText || null;
  };

  // Determine message color
  const getMessageColor = () => {
    if (errorText) return Color.Danger;
    return Color.Grey;
  };

  const message = getMessage();
  const messageColor = getMessageColor();

  return (
    <View className="w-full">
      {label && (
        <Text
          className="mb-2"
          style={{
            color: Color.Black,
            fontFamily:
              textLargeStyle.fontFamily === Font.DMsans
                ? "DMSans_400Regular"
                : "Lato_400Regular",
            fontSize: textLargeStyle.fontSize,
            fontWeight: String(
              textLargeStyle.fontWeight
            ) as RNTextStyle["fontWeight"],
          }}
        >
          {label}
        </Text>
      )}
      <Input
        variant="outline"
        size="md"
        isDisabled={isDisabled}
        isInvalid={isInvalid || !!errorText}
        {...restInputWrapper}
        style={{
          borderColor: getBorderColor(),
          borderWidth: 1,
          borderRadius: 8,
          width: "100%",
          height: 50,
          backgroundColor: inputWrapper.isDisabled
            ? Color.LightGrey
            : Color.White,
          opacity: inputWrapper.isDisabled ? 0.6 : 1,
        }}
      >
        {hasStartIcon && <InputSlot className="pl-4">{startIcon}</InputSlot>}
        <InputField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={isSecureEntry}
          keyboardType={getKeyboardType(inputType)}
          {...restInputField}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            paddingLeft: hasStartIcon ? 8 : 16,
            paddingRight: shouldShowToggle ? 48 : 16,
            fontFamily:
              textLargeStyle.fontFamily === Font.DMsans
                ? "DMSans_400Regular"
                : "Lato_400Regular",
            fontSize: textLargeStyle.fontSize,
            fontWeight: String(
              textLargeStyle.fontWeight
            ) as RNTextStyle["fontWeight"],
            textAlign: "left",
          }}
        />
        {shouldShowToggle && (
          <InputSlot className="pr-4">
            <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              {isPasswordVisible ? (
                <Icons.Eye size={20} color={Color.Grey} weight="regular" />
              ) : (
                <Icons.EyeSlash size={20} color={Color.Grey} weight="regular" />
              )}
            </Pressable>
          </InputSlot>
        )}
      </Input>
      {message && (
        <Text
          className="mt-1 ml-1"
          style={{
            color: messageColor,
            fontFamily:
              textSmallStyle.fontFamily === Font.DMsans
                ? "DMSans_400Regular"
                : "Lato_400Regular",
            fontSize: textSmallStyle.fontSize,
            fontWeight: String(
              textSmallStyle.fontWeight
            ) as RNTextStyle["fontWeight"],
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

// OTP Input Field component
const OTPField: React.FC<OTPInputFieldProps> = ({
  inputWrapper = {},
  inputField = {},
  label,
  size = 50,
  errorText,
}) => {
  const {
    isDisabled = false,
    isInvalid = false,
    ...restInputWrapper
  } = inputWrapper;
  const { value = "", onChangeText, ...restInputField } = inputField;

  // Determine border color based on error state
  const getBorderColor = () => {
    if (errorText || isInvalid) return Color.Danger;
    return Color.LightGrey;
  };

  return (
    <View className="items-center">
      {label && (
        <Text
          className="mb-2"
          style={{
            color: Color.Black,
            fontFamily:
              textLargeStyle.fontFamily === Font.DMsans
                ? "DMSans_400Regular"
                : "Lato_400Regular",
            fontSize: textLargeStyle.fontSize,
            fontWeight: String(
              textLargeStyle.fontWeight
            ) as RNTextStyle["fontWeight"],
          }}
        >
          {label}
        </Text>
      )}
      <Input
        variant="outline"
        size="md"
        isDisabled={isDisabled}
        isInvalid={isInvalid || !!errorText}
        {...restInputWrapper}
        style={{
          borderColor: getBorderColor(),
          borderWidth: 1,
          borderRadius: 8,
          width: size,
          height: size,
        }}
      >
        <InputField
          value={value}
          onChangeText={(text) => {
            // Only allow numbers
            const numericText = text.replace(/[^0-9]/g, "");
            onChangeText?.(numericText);
          }}
          maxLength={1}
          keyboardType="number-pad"
          {...restInputField}
          style={{
            fontFamily:
              buttonLargeStyle.fontFamily === Font.DMsans
                ? "DMSans_500Regular"
                : "Lato_500Regular",
            fontSize: buttonLargeStyle.fontSize,
            fontWeight: String(
              buttonLargeStyle.fontWeight
            ) as RNTextStyle["fontWeight"],
            textAlign: "center",
          }}
        />
      </Input>
    </View>
  );
};

// Combine the components
export const TextInputComponent = Object.assign(TextInput, {
  OTPField: OTPField,
}) as TextInputComponentType;
