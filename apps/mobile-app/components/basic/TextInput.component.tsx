import { Input, InputField } from '@/components/ui/input';
import { Color, Font, TextSize, TextVariant, textStyles } from '@repo/config';
import React from 'react';

// Props for the TextInput component
interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  borderColor?: Color;
  textColor?: Color;
  placeholderColor?: Color;
  inputType?: 'text' | 'number' | 'decimal' | 'email' | 'phone';
}

// Default TextInput component
export const TextInputComponent: React.FC<TextInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Enter text',
  isDisabled = false,
  isInvalid = false,
  borderColor = Color.LightGrey,
  textColor = Color.Black,
  placeholderColor = Color.Grey,
  inputType = 'text',
}) => {
  
  // Text style
  const textLargeStyle = textStyles[TextVariant.Body][TextSize.Large];

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

  return (
    <Input
      variant="outline"
      size="md"
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      style={{
        borderColor: borderColor,
        borderRadius: 8, // border radius
      }}
    >
      <InputField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        style={{
          color: textColor,
          paddingHorizontal: 8, // padding
          paddingVertical: 4, // padding
          fontFamily: textLargeStyle.fontFamily === Font.DMsans ? 'DMSans_400Regular' : 'Lato_400Regular',
          fontSize: textLargeStyle.fontSize,
          fontWeight: '400' as const,
        }}
        keyboardType={getKeyboardType(inputType)}
      />
    </Input>
  );
};

