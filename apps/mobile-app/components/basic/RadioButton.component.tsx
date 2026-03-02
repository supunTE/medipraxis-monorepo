import { CircleIcon } from "@/components/ui/icon";
import {
  Radio as GluestackRadio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { Color, TextSize, TextVariant } from "@repo/config";
import React from "react";
import { TextComponent } from "./Text.component";

export interface RadioOption {
  label: string;
  value: string;
}

export enum RadioSize {
  Small = "sm",
  Medium = "md",
  Large = "lg",
}

interface RadioGroupComponentProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  size?: RadioSize;
  isDisabled?: boolean;
  isInvalid?: boolean;
  labelVariant?: TextVariant;
  labelSize?: Exclude<TextSize, TextSize.ExtraLarge>;
  labelColor?: Color;
  className?: string;
  itemClassName?: string;
}

export const RadioGroupComponent: React.FC<RadioGroupComponentProps> = ({
  value,
  onChange,
  options,
  size = RadioSize.Medium,
  isDisabled = false,
  isInvalid = false,
  labelVariant = TextVariant.Body,
  labelSize = TextSize.Medium,
  labelColor = Color.Black,
  className,
  itemClassName,
}) => {
  return (
    <RadioGroup value={value} onChange={onChange} className={className}>
      {options.map((option) => (
        <GluestackRadio
          key={option.value}
          value={option.value}
          size={size}
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          className={itemClassName}
        >
          <RadioIndicator>
            <RadioIcon as={CircleIcon} />
          </RadioIndicator>
          <RadioLabel className="ml-2">
            <TextComponent
              variant={labelVariant}
              size={labelSize}
              color={labelColor}
            >
              {option.label}
            </TextComponent>
          </RadioLabel>
        </GluestackRadio>
      ))}
    </RadioGroup>
  );
};
