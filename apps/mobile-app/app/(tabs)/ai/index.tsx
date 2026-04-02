import { useAuth } from "@/auth/AuthContext";
import { ParsedEntities } from "@/components/ai/ParsedEntities.component";
import { TextComponent, TextInputComponent } from "@/components/basic";
import { useAIChat, useInputParser } from "@/services/ai";
import { useFetchClients } from "@/services/clients/useClients";
import { useFetchUser } from "@/services/user";
import { NotoColorEmoji_400Regular } from "@expo-google-fonts/noto-color-emoji";
import { Color, TextSize, TextVariant } from "@repo/config";
import { AIChatRole, type UIChatMessage } from "@repo/models";
import clsx from "clsx";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import type {
  ExpoSpeechRecognitionModule as SpeechModuleType,
  useSpeechRecognitionEvent as useSpeechEventType,
} from "expo-speech-recognition";

// expo-speech-recognition is not available in Expo Go — load safely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SpeechModule: typeof SpeechModuleType | null = null;
let useSpeechRecognitionEvent: typeof useSpeechEventType = () => {};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("expo-speech-recognition") as {
    ExpoSpeechRecognitionModule: typeof SpeechModuleType;
    useSpeechRecognitionEvent: typeof useSpeechEventType;
  };
  SpeechModule = mod.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
} catch {
  // Running in Expo Go — speech recognition unavailable
}
import {
  BroomIcon,
  MicrophoneIcon,
  PaperPlaneRightIcon,
  XIcon,
} from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import Markdown from "react-native-markdown-display";

const backgroundGradient =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/assets/images/ai/background-gradient.jpg") as ImageSourcePropType;

const botAvatar =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/assets/images/ai/bot-eye-opened.png") as ImageSourcePropType;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

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

  const { user: authUser } = useAuth();
  const userId = authUser?.user_id ?? "";
  const { data: userProfile } = useFetchUser(userId);

  const [inputText, setInputText] = useState("");
  const [resolvedClientIds, setResolvedClientIds] = useState<string[]>([]);
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat();
  const scrollViewRef = useRef<ScrollView>(null);

  const [isListening, setIsListening] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript ?? "";
    if (transcript) {
      setInputText(transcript);
    }
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent("error", () => {
    setIsListening(false);
  });

  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
      return undefined;
    }
  }, [isListening, pulseAnim]);

  const handleMicPress = useCallback(async () => {
    if (!SpeechModule) return;
    if (isListening) {
      SpeechModule.stop();
      return;
    }
    const { granted } = await SpeechModule.requestPermissionsAsync();
    if (!granted) return;
    setInputText("");
    setIsListening(true);
    SpeechModule.start({
      lang: "en-US",
      interimResults: true,
      maxAlternatives: 1,
    });
  }, [isListening]);

  const { user } = useAuth();
  const { data: clients } = useFetchClients(user?.user_id ?? "");

  const handleCorrected = useCallback((corrected: string) => {
    setInputText(corrected);
  }, []);

  const { parsed } = useInputParser(inputText, handleCorrected, clients ?? []);

  const canSend = inputText.trim().length > 0 && !isLoading;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const suggestions: SuggestionButton[] = [
    {
      id: "schedule",
      emoji: "📆",
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
      emoji: "📆",
      label: "When do I have appointments today?",
    },
  ];

  const handleSuggestionPress = (suggestion: SuggestionButton) => {
    void sendMessage(suggestion.label);
  };

  const handleSendMessage = () => {
    if (inputText.trim() && !isLoading) {
      const message = inputText;
      setInputText("");
      void sendMessage(message, { clientIds: resolvedClientIds });
    }
  };

  const markdownStyles = useMemo(
    () =>
      StyleSheet.create({
        body: { color: Color.Black, fontSize: 14, lineHeight: 20 },
        heading1: {
          fontSize: 20,
          fontWeight: "bold",
          color: Color.Black,
          marginBottom: 4,
        },
        heading2: {
          fontSize: 18,
          fontWeight: "bold",
          color: Color.Black,
          marginBottom: 4,
        },
        heading3: {
          fontSize: 16,
          fontWeight: "bold",
          color: Color.Black,
          marginBottom: 4,
        },
        strong: { fontWeight: "bold" },
        em: { fontStyle: "italic" },
        bullet_list: { marginVertical: 4 },
        ordered_list: { marginVertical: 4 },
        list_item: { marginVertical: 2 },
        code_inline: {
          backgroundColor: "#f0f0f0",
          borderRadius: 4,
          paddingHorizontal: 4,
          fontSize: 13,
          fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        },
        fence: {
          backgroundColor: "#f0f0f0",
          borderRadius: 8,
          padding: 10,
          marginVertical: 4,
          fontSize: 13,
          fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        },
        paragraph: { marginVertical: 2 },
      }),
    []
  );

  const renderMessage = (message: UIChatMessage) => {
    const isUser = message.role === AIChatRole.User;

    return (
      <View
        key={message.id}
        className={clsx("mb-4", isUser ? "items-end" : "items-start")}
      >
        <View
          className={clsx(
            "max-w-[80%] px-4 py-3 rounded-2xl",
            isUser ? "bg-mp-green" : "bg-mp-white shadow-soft-1"
          )}
        >
          {isUser ? (
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.White}
            >
              {message.content}
            </TextComponent>
          ) : (
            <Markdown style={markdownStyles}>{message.content}</Markdown>
          )}
        </View>
      </View>
    );
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
              {/* Clear messages button */}
              {messages.length > 0 && (
                <Pressable
                  onPress={clearMessages}
                  className="absolute top-[1.35rem] right-16 z-10 bg-white rounded-full px-3 py-2 flex-row items-center gap-2 shadow-sm"
                >
                  <BroomIcon size={18} color={Color.Grey} weight="regular" />
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Small}
                    color={Color.Grey}
                  >
                    Clear messages
                  </TextComponent>
                </Pressable>
              )}

              {/* Close button */}
              <Pressable
                onPress={onClose}
                className="absolute top-[1.35rem] right-4 z-10 w-10 h-10 rounded-full bg-mp-white justify-center items-center shadow-md"
              >
                <XIcon size={20} color={Color.TextGreen} weight="bold" />
              </Pressable>

              {/* Scrollable Content */}
              <ScrollView
                ref={scrollViewRef}
                className="flex-1 p-6"
                showsVerticalScrollIndicator={false}
              >
                {messages.length === 0 ? (
                  <>
                    {/* Greeting */}
                    <View className="items-center mb-10">
                      <View className="border border-mp-green rounded-full px-6 py-2">
                        <TextComponent
                          variant={TextVariant.Body}
                          size={TextSize.Small}
                          color={Color.TextGreen}
                        >
                          {getGreeting()}
                          {userProfile?.first_name
                            ? `, ${userProfile.first_name}`
                            : ""}
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
                  </>
                ) : (
                  <View className="mb-40 pt-16">
                    {/* Chat messages */}
                    {messages.map((message) => renderMessage(message))}
                    {/* Loading indicator */}
                    {isLoading && (
                      <View className="items-start mb-4">
                        <View className="bg-mp-white px-4 py-3 rounded-2xl shadow-soft-1">
                          <ActivityIndicator
                            size="small"
                            color={Color.TextGreen}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                )}
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
                <ParsedEntities
                  parsed={parsed}
                  onInputChange={setInputText}
                  clients={clients ?? []}
                  onClientIdChange={setResolvedClientIds}
                />
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Small}
                  color={Color.Grey}
                  style={{ textAlign: "center", marginBottom: 12, opacity: 0.7, fontSize: 12 }}
                >
                  AI Responses may not always be accurate.
                </TextComponent>
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
                  <Animated.View
                    style={
                      isListening ? { transform: [{ scale: pulseAnim }] } : {}
                    }
                  >
                    <Pressable
                      onPress={
                        inputText.trim() ? handleSendMessage : handleMicPress
                      }
                      disabled={
                        (!canSend && inputText.trim().length > 0) ||
                        (!inputText.trim() && !SpeechModule)
                      }
                      className={clsx(
                        "w-12 h-12 rounded-full items-center justify-center shadow-soft-2",
                        inputText.trim().length > 0 && !canSend
                          ? "bg-mp-black/40"
                          : !inputText.trim() && !SpeechModule
                            ? "bg-mp-black/40"
                            : isListening
                            ? "bg-red-500 active:opacity-80"
                            : "bg-mp-black active:opacity-80"
                      )}
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
                          weight={isListening ? "fill" : "bold"}
                        />
                      )}
                    </Pressable>
                  </Animated.View>
                </View>
              </View>
            </ImageBackground>
          </ImageBackground>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
