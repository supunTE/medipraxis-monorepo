import { Input, InputField } from '@/components/ui/input';
import { Color, Font, TextSize, TextVariant, textStyles } from '@repo/config';
import React from 'react';
import { TextStyle as RNTextStyle, StyleSheet, Text, View } from 'react-native';

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
  inputType?: 'text' | 'number' | 'decimal' | 'email' | 'phone';
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
}) => {
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
        isInvalid={isInvalid}
        style={{
          borderColor: borderColor,
          borderRadius: 8, // Border radius
          width: '100%', // Full width
          height: 50, // Fixed height for Input Box
        }}
      >
        <InputField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          style={{
            color: textColor,
            paddingHorizontal: 16, // Padding
            paddingVertical: 8, // Padding
            fontFamily: textLargeStyle.fontFamily === Font.DMsans ? 'DMSans_400Regular' : 'Lato_400Regular',
            fontSize: textLargeStyle.fontSize,
            fontWeight: String(textLargeStyle.fontWeight) as RNTextStyle['fontWeight'],
            textAlign: 'left',
          }}
          keyboardType={getKeyboardType(inputType)}
        />
      </Input>
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
}) => {
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
        isInvalid={isInvalid}
        style={{
          borderColor: borderColor,
          borderRadius: 8, // Border radius for OTP input
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
    marginBottom: 8, // Margin between label and input
  },
});

// Combine the components
export const TextInputComponent = Object.assign(TextInputBase, {
  OTPField: OTPField,
}) as TextInputComponentType;

