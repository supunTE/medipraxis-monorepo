import { TextComponent, TextInputComponent } from "@/components/basic";
import { NotoColorEmoji_400Regular } from "@expo-google-fonts/noto-color-emoji";
import { Color, TextSize, TextVariant } from "@repo/config";
import clsx from "clsx";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import {
  MicrophoneIcon,
  PaperPlaneRightIcon,
  XIcon,
} from "phosphor-react-native";
import { useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";

const backgroundGradient =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/assets/images/ai/background-gradient.jpg") as ImageSourcePropType;

const botAvatar =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/assets/images/ai/bot-eye-opened.png") as ImageSourcePropType;

interface AIAssistantModalProps {
  visible: boolean;
  onClose: () => void;
}

interface SuggestionButton {
  id: string;
  emoji: string;
  label: string;
}

export default function AIAssistantModal({
  visible,
  onClose,
}: AIAssistantModalProps) {
  const [fontsLoaded] = useFonts({
    NotoColorEmoji_400Regular,
  });

  const [inputText, setInputText] = useState("");

  const suggestions: SuggestionButton[] = [
    {
      id: "schedule",
      emoji: "📅",
      label: "Schedule an appointment",
    },
    {
      id: "summary",
      emoji: "📋",
      label: "Get a medical record summary",
    },
    {
      id: "report",
      emoji: "📁",
      label: "Retrieve a report",
    },
    {
      id: "appointments",
      emoji: "🗓️",
      label: "When do I have appointments today?",
    },
  ];

  const handleSuggestionPress = (suggestion: SuggestionButton) => {
    // Handle suggestion press
    console.log("Suggestion pressed:", suggestion.label);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      // Handle send message
      console.log("Message sent:", inputText);
      setInputText("");
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-2">
          {/* Outer box with full opacity gradient - creates the border effect */}
          <ImageBackground
            source={backgroundGradient}
            className="rounded-3xl w-full h-[90%] p-2 overflow-hidden"
            resizeMode="cover"
          >
            {/* Inner box with 20% opacity gradient - contains content */}
            <ImageBackground
              source={backgroundGradient}
              className="flex-1 bg-white rounded-3xl overflow-hidden relative"
              resizeMode="cover"
              imageStyle={{ opacity: 0.2 }}
            >
              {/* Close button */}
              <Pressable
                onPress={onClose}
                className="absolute top-[1.35rem] right-4 z-10 w-10 h-10 rounded-full bg-mp-white justify-center items-center shadow-md"
              >
                <XIcon size={20} color={Color.TextGreen} weight="bold" />
              </Pressable>

              {/* Scrollable Content */}
              <ScrollView
                className="flex-1 p-6"
                showsVerticalScrollIndicator={false}
              >
                {/* Greeting */}
                <View className="items-center mb-10">
                  <View className="border border-mp-green rounded-full px-6 py-2">
                    <TextComponent
                      variant={TextVariant.Body}
                      size={TextSize.Small}
                      color={Color.TextGreen}
                    >
                      Good Evening, Katherine
                    </TextComponent>
                  </View>
                </View>

                {/* Avatar */}
                <View className="items-center mb-8">
                  <View className="w-48 h-48 bg-mp-white rounded-full items-center justify-center shadow-soft-2">
                    <Image
                      source={botAvatar}
                      style={{ width: 144, height: 144 }}
                      resizeMode="contain"
                    />
                  </View>
                </View>

                {/* Main heading */}
                <View className="mb-8">
                  <TextComponent
                    variant={TextVariant.Title}
                    size={TextSize.ExtraLarge}
                    color={Color.Black}
                    style={{ textAlign: "left" }}
                  >
                    Need help with{"\n"}something today?
                  </TextComponent>
                </View>

                {/* Suggestion buttons */}
                <View className="gap-3 mb-40">
                  {suggestions.map((suggestion) => (
                    <Pressable
                      key={suggestion.id}
                      onPress={() => handleSuggestionPress(suggestion)}
                      className="bg-mp-green rounded-full px-4 py-2 flex-row items-center gap-2 shadow-soft-1 active:opacity-80 self-start"
                    >
                      <Text
                        style={{
                          fontFamily: "NotoColorEmoji_400Regular",
                          fontSize: 16,
                        }}
                      >
                        {suggestion.emoji}
                      </Text>
                      <TextComponent
                        variant={TextVariant.Body}
                        size={TextSize.Medium}
                        color={Color.White}
                      >
                        {suggestion.label}
                      </TextComponent>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              {/* Gradient fade to prevent content clutter */}
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0)",
                  "rgba(255, 255, 255, 0.95)",
                  "rgba(255, 255, 255, 1)",
                ]}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 128,
                }}
                pointerEvents="none"
              />

              {/* Fixed bottom input area */}
              <View className="absolute bottom-0 left-0 right-0 px-6 py-4">
                <View className="flex-row items-center gap-3">
                  {/* Input field */}
                  <View className="flex-1 relative">
                    <TextInputComponent
                      inputWrapper={{
                        className: clsx(
                          "rounded-full border-0 h-14",
                          inputText.trim() ? "bg-mp-white" : "bg-transparent"
                        ),
                      }}
                      inputField={{
                        value: inputText,
                        onChangeText: setInputText,
                        placeholder: "Ask me anything...",
                        onSubmitEditing: handleSendMessage,
                      }}
                      hideHelperText
                    />
                  </View>

                  {/* Microphone/Send button */}
                  <Pressable
                    onPress={
                      inputText.trim()
                        ? handleSendMessage
                        : () => console.log("Voice input")
                    }
                    className="w-12 h-12 bg-mp-black rounded-full items-center justify-center shadow-soft-2 active:opacity-80"
                  >
                    {inputText.trim() ? (
                      <PaperPlaneRightIcon
                        size={20}
                        color={Color.White}
                        weight="bold"
                      />
                    ) : (
                      <MicrophoneIcon
                        size={20}
                        color={Color.White}
                        weight="bold"
                      />
                    )}
                  </Pressable>
                </View>
              </View>
            </ImageBackground>
          </ImageBackground>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
