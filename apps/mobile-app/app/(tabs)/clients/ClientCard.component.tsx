import { View } from "@/components/Themed";
import { TextComponent } from "@/components/basic";
import { Icons, type IconName } from "@/config";
import { Color, TextSize, TextVariant } from "@repo/config";
import React, { useRef } from "react";
import { Animated, TouchableOpacity, type ViewStyle } from "react-native";
import { SameContactSection } from "./SameContactSection.component";
import { Client } from "@repo/models";

// Client card props
interface ClientCardProps {
  id: string;
  name: string;
  color: string;
  icon: IconName;
  onPress?: () => void;
  className?: string;
  index?: number;
  familyMembers: Client[];
}

// Client card component
export const ClientCardComponent: React.FC<ClientCardProps> = ({
  name,
  color,
  icon,
  onPress,
  className,
  index,
  familyMembers = [],
}) => {
  // Set up press animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const IconComponent = Icons[icon];

  // Animation style for scaling
  const animatedStyle: Animated.WithAnimatedValue<ViewStyle> = {
    transform: [{ scale: scaleAnim }],
  };

  // Scale down when pressed
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        className={`flex-row items-center rounded-xl py-4 px-4 mt-3 gap-4 ${className || ""}`}
        style={{ backgroundColor: Color.LightCream }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View
          className="w-10 h-10 rounded-full justify-center items-center"
          style={{ backgroundColor: color }}
        >
          <IconComponent size={20} color={Color.White} />
        </View>
        <TextComponent variant={TextVariant.Body} size={TextSize.Medium}>
          {name}
        </TextComponent>
      </TouchableOpacity>

      {index !== undefined && index <= 3 && familyMembers.length > 0 && (
        <SameContactSection clients={familyMembers} />
      )}
    </Animated.View>
  );
};
