import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  View,
  type ImageSourcePropType,
} from "react-native";

const botAvatarClosed =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/assets/images/ai/bot-eye-closed.png") as ImageSourcePropType;

const botAvatarOpened =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/assets/images/ai/bot-eye-opened.png") as ImageSourcePropType;

interface AIAssistantButtonProps {
  onPress: () => void;
}

export function AIAssistantButton({
  onPress,
}: AIAssistantButtonProps): React.JSX.Element {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [eyesOpened, setEyesOpened] = useState(false);
  const cycleCountRef = useRef(0);
  const isOpenCycleRef = useRef(false);
  const hasCountedCycleRef = useRef(false);

  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Listen to animation to track cycles
    const listenerId = floatAnim.addListener(({ value }) => {
      // When reaching the top (value close to -4), open eyes
      if (value <= -3.5 && !isOpenCycleRef.current) {
        setEyesOpened(true);
        isOpenCycleRef.current = true;
        cycleCountRef.current = 0;
        hasCountedCycleRef.current = false;
      }

      // When back at bottom (value close to 0), count cycle once
      if (
        value >= -0.5 &&
        value <= 0.5 &&
        isOpenCycleRef.current &&
        !hasCountedCycleRef.current
      ) {
        cycleCountRef.current += 1;
        hasCountedCycleRef.current = true;

        // Close eyes after 3 complete cycles
        if (cycleCountRef.current >= 3) {
          setEyesOpened(false);
          isOpenCycleRef.current = false;
          cycleCountRef.current = 0;
        }
      }

      // Reset the count flag when moving away from bottom
      if (value < -1 && hasCountedCycleRef.current) {
        hasCountedCycleRef.current = false;
      }
    });

    floatAnimation.start();

    return () => {
      floatAnim.removeListener(listenerId);
      floatAnimation.stop();
    };
  }, [floatAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  return (
    <View className="items-center justify-center z-50">
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          className="w-20 h-20 bg-mp-white rounded-full justify-center items-center shadow-lg border-2 border-mp-green"
          style={{
            transform: [{ scale: scaleAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
            elevation: 4,
          }}
        >
          <Animated.Image
            source={eyesOpened ? botAvatarOpened : botAvatarClosed}
            style={{
              width: 50,
              height: 50,
              transform: [{ translateY: floatAnim }],
            }}
            resizeMode="contain"
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}
