import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Color, Font, TextSize, TextVariant, textStyles } from '@repo/config';
import { EyeIcon, EyeSlashIcon } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, TextStyle as RNTextStyle, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

// Props for the TextInput component
interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  borderColor?: Color;
  textColor?: Color;
  placeholderColor?: Color;
  labelColor?: Color;
  inputType?: 'text' | 'number' | 'decimal' | 'email' | 'phone' | 'password';
  showPasswordToggle?: boolean;
  validationSchema?: z.ZodString;
  helperText?: string;
  helperTextColor?: Color;
  errorTextColor?: Color;
  successTextColor?: Color;
  warningTextColor?: Color;
  showValidation?: boolean;
  validateOnChange?: boolean;
  showWarning?: boolean;
}

// Props for OTP Input Field
interface OTPInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  borderColor?: Color;
  textColor?: Color;
  labelColor?: Color;
  size?: number;
  validationSchema?: z.ZodString;
  showValidation?: boolean;
}

// Type for TextInputComponent with OTPField
interface TextInputComponentType extends React.FC<TextInputProps> {
  OTPField: React.FC<OTPInputFieldProps>;
}

// Map inputType to React Native keyboardType
const getKeyboardType = (type: string) => {
  switch (type) {
    case 'number':
      return 'number-pad';
    case 'decimal':
      return 'decimal-pad';
    case 'email':
      return 'email-address';
    case 'phone':
      return 'phone-pad';
    default:
      return 'default';
  }
};

// Text styles
const textLargeStyle = textStyles[TextVariant.Body][TextSize.Large];
const textSmallStyle = textStyles[TextVariant.Body][TextSize.Small];
const buttonLargeStyle = textStyles[TextVariant.Button][TextSize.Large];

// Default TextInput component
const TextInputBase: React.FC<TextInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Enter text',
  label,
  isDisabled = false,
  isInvalid = false,
  borderColor = Color.LightGrey,
  textColor = Color.Black,
  placeholderColor = Color.Grey,
  labelColor = Color.Black,
  inputType = 'text',
  showPasswordToggle = false,
  validationSchema,
  helperText,
  helperTextColor = Color.Grey,
  errorTextColor = Color.Danger,
  successTextColor = Color.Success,
  warningTextColor = Color.Warnning,
  showValidation = true,
  validateOnChange = true,
  showWarning = false,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  
  const shouldShowToggle = showPasswordToggle || inputType === 'password';
  const isSecureEntry = shouldShowToggle && !isPasswordVisible;

  // Validate input - automatically gets error message from Zod schema
  useEffect(() => {
    if (!validationSchema || !showValidation) {
      setValidationError(null);
      setIsValid(false);
      return;
    }

    if (!validateOnChange && value === '') {
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
      if (value !== '') {
        // Automatically get the error message from Zod schema
        const zodError = result.error.issues[0]?.message || 'Invalid input';
        setValidationError(zodError);
      } else {
        setValidationError(null);
      }
    }
  }, [value, validationSchema, showValidation, validateOnChange]);

  // Determine border color based on validation
  const getBorderColor = () => {
    if (isInvalid || validationError) return Color.Danger;
    if (showWarning) return Color.Warnning;
    if (isValid && value !== '') return Color.Success;
    return borderColor;
  };

  // Determine message to display
  const getMessage = () => {
    if (validationError) return validationError;
    if (showWarning) return helperText || null;
    if (isValid) return helperText || null;
    if (helperText && !validationError && !isValid) return helperText;
    return null;
  };

  // Determine message color
  const getMessageColor = () => {
    if (validationError) return errorTextColor;
    if (showWarning) return warningTextColor;
    if (isValid) return successTextColor;
    return helperTextColor;
  };

  const message = getMessage();
  const messageColor = getMessageColor();

  return (
    <View style={styles.inputWrapper}>
      {label && (
        <Text style={[styles.label, { 
          color: labelColor,
          fontFamily: textLargeStyle.fontFamily === Font.DMsans ? 'DMSans_400Regular' : 'Lato_400Regular',
          fontSize: textLargeStyle.fontSize,
          fontWeight: String(textLargeStyle.fontWeight) as RNTextStyle['fontWeight'],
        }]}>
          {label}
        </Text>
      )}
      <Input
        variant="outline"
        size="md"
        isDisabled={isDisabled}
        isInvalid={isInvalid || !!validationError}
        style={{
          borderColor: getBorderColor(),
          borderWidth: 1,
          borderRadius: 8,
          width: '100%',
          height: 50,
        }}
      >
        <InputField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          secureTextEntry={isSecureEntry}
          style={{
            color: textColor,
            paddingHorizontal: 16,
            paddingVertical: 8,
            paddingRight: shouldShowToggle ? 48 : 16,
            fontFamily: textLargeStyle.fontFamily === Font.DMsans ? 'DMSans_400Regular' : 'Lato_400Regular',
            fontSize: textLargeStyle.fontSize,
            fontWeight: String(textLargeStyle.fontWeight) as RNTextStyle['fontWeight'],
            textAlign: 'left',
          }}
          keyboardType={getKeyboardType(inputType)}
        />
        {shouldShowToggle && (
          <InputSlot style={styles.iconSlot}>
            <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              {isPasswordVisible ? (
                <EyeIcon size={20} color={Color.Grey} weight="regular" />
              ) : (
                <EyeSlashIcon size={20} color={Color.Grey} weight="regular" />
              )}
            </Pressable>
          </InputSlot>
        )}
      </Input>
      {message && (
        <Text style={[styles.helperText, {
          color: messageColor,
          fontFamily: textSmallStyle.fontFamily === Font.DMsans ? 'DMSans_400Regular' : 'Lato_400Regular',
          fontSize: textSmallStyle.fontSize,
          fontWeight: String(textSmallStyle.fontWeight) as RNTextStyle['fontWeight'],
        }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

// OTP Input Field component
const OTPField: React.FC<OTPInputFieldProps> = ({
  value,
  onChangeText,
  label,
  isDisabled = false,
  isInvalid = false,
  borderColor = Color.LightGrey,
  textColor = Color.Black,
  labelColor = Color.Black,
  size = 50,
  validationSchema,
  showValidation = true,
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Validate input - automatically gets error message from Zod schema
  useEffect(() => {
    if (!validationSchema || !showValidation) {
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
      if (value !== '') {
        setValidationError('Invalid');
      } else {
        setValidationError(null);
      }
    }
  }, [value, validationSchema, showValidation]);

  // Determine border color based on validation
  const getBorderColor = () => {
    if (isInvalid || validationError) return Color.Danger;
    if (isValid && value !== '') return Color.Success;
    return borderColor;
  };

  return (
    <View style={styles.otpWrapper}>
      {label && (
        <Text style={[styles.label, { 
          color: labelColor,
          fontFamily: textLargeStyle.fontFamily === Font.DMsans ? 'DMSans_400Regular' : 'Lato_400Regular',
          fontSize: textLargeStyle.fontSize,
          fontWeight: String(textLargeStyle.fontWeight) as RNTextStyle['fontWeight'],
        }]}>
          {label}
        </Text>
      )}
      <Input
        variant="outline"
        size="md"
        isDisabled={isDisabled}
        isInvalid={isInvalid || !!validationError}
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
          onChangeText={onChangeText}
          maxLength={1}
          style={{
            color: textColor,
            fontFamily: buttonLargeStyle.fontFamily === Font.DMsans ? 'DMSans_500Regular' : 'Lato_500Regular',
            fontSize: buttonLargeStyle.fontSize,
            fontWeight: String(buttonLargeStyle.fontWeight) as RNTextStyle['fontWeight'],
            textAlign: 'center',
          }}
          keyboardType="number-pad"
        />
      </Input>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
  },
  otpWrapper: {
    alignItems: 'center',
  },
  label: {
    marginBottom: 8,
  },
  iconSlot: {
    paddingRight: 16,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 4,
  },
});

// Combine the components
export const TextInputComponent = Object.assign(TextInputBase, {
  OTPField: OTPField,
}) as TextInputComponentType;

