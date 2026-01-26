import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Icons } from "@/config";
import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import React, { useEffect, useState } from "react";
import {
  type KeyboardType,
  Pressable,
  type TextStyle as RNTextStyle,
  Text,
  View,
} from "react-native";
import { type z } from "zod";

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
  validationSchema?: z.ZodString;
  helperText?: string;
  hideHelperText?: boolean;
  validateOnChange?: boolean;
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
  validationSchema?: z.ZodString;
  hideHelperText?: boolean;
}

// Type for TextInputComponent with OTPField
interface TextInputComponentType extends React.FC<TextInputProps> {
  OTPField: React.FC<OTPInputFieldProps>;
}

// Map inputType to React Native keyboardType
const getKeyboardType = (type?: TextInputType): KeyboardType => {
  switch (type) {
    case "number":
      return "number-pad";
    case "decimal":
      return "decimal-pad";
    case "email":
      return "email-address";
    case "phone":
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
  validationSchema,
  helperText,
  hideHelperText = false,
  validateOnChange = true,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

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

  // Validate input - automatically gets error message from Zod schema
  useEffect(() => {
    if (!validationSchema || hideHelperText) {
      setValidationError(null);
      setIsValid(false);
      return;
    }

    if (!validateOnChange && value === "") {
      setValidationError(null);
      setIsValid(false);
      return;
    }

    const result = validationSchema.safeParse(value);

    if (result.success) {
      setValidationError(null);
      setIsValid(true);
    } else {
      setIsValid(false);
      if (value !== "") {
        // Automatically get the error message from Zod schema
        const zodError = result.error.issues[0]?.message || "Invalid input";
        setValidationError(zodError);
      } else {
        setValidationError(null);
      }
    }
  }, [value, validationSchema, hideHelperText, validateOnChange]);

  // Determine border color based on validation
  const getBorderColor = () => {
    if (isInvalid || validationError) return Color.Danger;
    if (isValid && value !== "") return Color.Success;
    return Color.LightGrey;
  };

  // Determine message to display
  const getMessage = () => {
    if (hideHelperText) return null;
    if (validationError) return validationError;
    if (isValid) return helperText || null;
    if (helperText && !validationError && !isValid) return helperText;
    return null;
  };

  // Determine message color
  const getMessageColor = () => {
    if (validationError) return Color.Danger;
    if (isValid) return Color.Success;
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
        isInvalid={isInvalid || !!validationError}
        {...restInputWrapper}
        style={{
          borderColor: getBorderColor(),
          borderWidth: 1,
          borderRadius: 8,
          width: "100%",
          height: 50,
        }}
      >
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
  validationSchema,
  hideHelperText = false,
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const {
    isDisabled = false,
    isInvalid = false,
    ...restInputWrapper
  } = inputWrapper;
  const { value = "", onChangeText, ...restInputField } = inputField;

  // Validate input - automatically gets error message from Zod schema
  useEffect(() => {
    if (!validationSchema || hideHelperText) {
      setValidationError(null);
      setIsValid(false);
      return;
    }

    const result = validationSchema.safeParse(value);

    if (result.success) {
      setValidationError(null);
      setIsValid(true);
    } else {
      setIsValid(false);
      if (value !== "") {
        setValidationError("Invalid");
      } else {
        setValidationError(null);
      }
    }
  }, [value, validationSchema, hideHelperText]);

  // Determine border color based on validation
  const getBorderColor = () => {
    if (isInvalid || validationError) return Color.Danger;
    if (isValid && value !== "") return Color.Success;
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
        isInvalid={isInvalid || !!validationError}
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
