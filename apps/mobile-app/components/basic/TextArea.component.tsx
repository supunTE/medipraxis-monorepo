import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import React, { useEffect, useState } from "react";
import { type TextStyle as RNTextStyle, Text, View } from "react-native";
import { type z } from "zod";

// Props for the TextArea component
interface TextAreaProps {
  inputWrapper?: Omit<
    React.ComponentPropsWithoutRef<typeof Textarea>,
    "size" | "variant" | "style"
  >;
  inputField?: Omit<
    React.ComponentPropsWithoutRef<typeof TextareaInput>,
    "style"
  >;
  label?: string;
  validationSchema?: z.ZodString;
  helperText?: string;
  hideHelperText?: boolean;
  validateOnChange?: boolean;
}

// Text styles
const textLargeStyle = textStyles[TextVariant.Body][TextSize.Large];
const textSmallStyle = textStyles[TextVariant.Body][TextSize.Small];

export const TextAreaComponent: React.FC<TextAreaProps> = ({
  inputWrapper = {},
  inputField = {},
  label,
  validationSchema,
  helperText,
  hideHelperText = false,
  validateOnChange = true,
}) => {
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
      <Textarea
        size="md"
        isDisabled={isDisabled}
        isInvalid={isInvalid || !!validationError}
        {...restInputWrapper}
        style={{
          borderColor: getBorderColor(),
          borderWidth: 1,
          borderRadius: 8,
          width: "100%",
        }}
      >
        <TextareaInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          {...restInputField}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontFamily:
              textLargeStyle.fontFamily === Font.DMsans
                ? "DMSans_400Regular"
                : "Lato_400Regular",
            fontSize: textLargeStyle.fontSize,
            fontWeight: String(
              textLargeStyle.fontWeight
            ) as RNTextStyle["fontWeight"],
            textAlign: "left",
            minHeight: 100,
          }}
        />
      </Textarea>
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
