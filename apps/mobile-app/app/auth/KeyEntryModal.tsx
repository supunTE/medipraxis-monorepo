import { Color, TextSize, TextVariant } from "@repo/config";
import { KeyIcon } from "phosphor-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ButtonComponent,
  ButtonSize,
  TextComponent,
} from "../../components/basic";
import { useFetchUserKeys } from "../../services/user-keys";
import { unwrapPrivateKey } from "../../utils/decryption";
import { encryptionKeyStorage } from "../../utils/storage";

type KeyEntryModalProps = {
  visible: boolean;
  onSuccess: () => void;
  onForgotKey: () => void;
};

const KEY_LENGTH = 16;
const GROUP_SIZE = 4;

export function KeyEntryModal({
  visible,
  onSuccess,
  onForgotKey,
}: KeyEntryModalProps) {
  const [chars, setChars] = useState<string[]>(Array(KEY_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>(Array(KEY_LENGTH).fill(null));

  const { data: userKeys, error: keysError } = useFetchUserKeys(visible);

  useEffect(() => {
    if (visible) {
      setChars(Array(KEY_LENGTH).fill(""));
      setError(null);
      setIsVerifying(false);
    }
  }, [visible]);

  const focusInput = useCallback((index: number) => {
    if (index >= 0 && index < KEY_LENGTH) {
      inputRefs.current[index]?.focus();
    }
  }, []);

  const handleChangeText = useCallback(
    (text: string, index: number) => {
      // Detect paste (text length > 1)
      if (text.length > 1) {
        const cleaned = text
          .replace(/[^0-9A-Za-z]/g, "")
          .toUpperCase()
          .slice(0, KEY_LENGTH);
        const newChars = Array(KEY_LENGTH).fill("");
        for (let i = 0; i < cleaned.length; i++) {
          newChars[i] = cleaned[i]!;
        }
        setChars(newChars);
        setError(null);
        // Focus the last filled input or the next empty one
        const focusIndex = Math.min(cleaned.length, KEY_LENGTH - 1);
        setTimeout(() => focusInput(focusIndex), 50);
        return;
      }

      // Single character entry
      const char = text.toUpperCase();
      if (char && !/^[0-9A-Z]$/.test(char)) return; // Reject invalid chars

      setChars((prev) => {
        const next = [...prev];
        next[index] = char;
        return next;
      });
      setError(null);

      if (char) {
        focusInput(index + 1);
      }
    },
    [focusInput]
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === "Backspace" && !chars[index] && index > 0) {
        setChars((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
        focusInput(index - 1);
      }
    },
    [chars, focusInput]
  );

  const handleVerify = useCallback(async () => {
    const candidateKey = chars.join("");

    if (candidateKey.length !== KEY_LENGTH) {
      setError("Please enter all 16 characters of your encryption key.");
      return;
    }

    if (!/^[0-9A-Z]{16}$/.test(candidateKey)) {
      setError(
        "Encryption key must contain only letters (A-Z) and numbers (0-9)."
      );
      return;
    }

    if (keysError || !userKeys) {
      setError("Unable to verify. Please check your connection and try again.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    // Allow the UI to re-render with loading state before CPU-heavy PBKDF2
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const privateKey = unwrapPrivateKey(
        userKeys.wrapped_private_key,
        userKeys.pbkdf2_salt,
        candidateKey
      );
      // Key is correct — zero out private key bytes and store encryption key
      privateKey.fill(0);
      await encryptionKeyStorage.set(candidateKey);
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed";
      if (message.includes("tag")) {
        setError("Incorrect encryption key. Please try again.");
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  }, [chars, userKeys, keysError, onSuccess]);

  const renderCharGroup = (startIndex: number) => (
    <View className="flex-row gap-1">
      {Array.from({ length: GROUP_SIZE }, (_, i) => {
        const idx = startIndex + i;
        return (
          <TextInput
            key={idx}
            ref={(ref) => {
              inputRefs.current[idx] = ref;
            }}
            value={chars[idx]}
            onChangeText={(text) => handleChangeText(text, idx)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(nativeEvent.key, idx)
            }
            maxLength={KEY_LENGTH}
            autoCapitalize="characters"
            autoCorrect={false}
            selectTextOnFocus
            style={{
              fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
              fontWeight: "700",
              fontSize: 16,
              textAlign: "center",
              lineHeight: 20,
              paddingVertical: 0,
              paddingHorizontal: 0,
            }}
            className="bg-gray-100 border border-gray-300 rounded-md w-10 h-11 items-center justify-center"
          />
        );
      })}
    </View>
  );

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            className="flex-1 justify-center items-center px-6"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          >
            <View
              className="bg-white rounded-[20px] p-7 w-full"
              style={{
                maxWidth: 400,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.18,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              {/* Key icon */}
              <View
                className="self-center rounded-full w-16 h-16 justify-center items-center mb-4"
                style={{ backgroundColor: Color.LightCream }}
              >
                <KeyIcon size={30} color={Color.Warning} weight="duotone" />
              </View>

              <TextComponent
                variant={TextVariant.Title}
                size={TextSize.Large}
                className="text-center mb-2"
              >
                Enter Your Encryption Key
              </TextComponent>

              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Medium}
                color={Color.Grey}
                className="text-center mb-6"
                style={{ lineHeight: 22 }}
              >
                Enter the 16-character encryption key you saved during
                registration to unlock your encrypted data.
              </TextComponent>

              {/* Character input grid: 2 rows of [XXXX] - [XXXX] */}
              <View className="mb-5 gap-2">
                {[0, 8].map((rowStart) => (
                  <View
                    key={rowStart}
                    className="flex-row items-center justify-center gap-2"
                  >
                    {renderCharGroup(rowStart)}
                    <View className="w-4 h-px bg-gray-300" />
                    {renderCharGroup(rowStart + GROUP_SIZE)}
                  </View>
                ))}
              </View>

              {/* Error text */}
              {error && (
                <View className="mb-4">
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Small}
                    color={Color.DangerDark}
                    className="text-center"
                  >
                    {error}
                  </TextComponent>
                </View>
              )}

              {/* Verify button */}
              <View className="gap-3">
                <ButtonComponent
                  onPress={() => {
                    void handleVerify();
                  }}
                  disabled={isVerifying}
                  buttonColor={isVerifying ? Color.Grey : Color.Green}
                  textColor={Color.White}
                  size={ButtonSize.Large}
                >
                  {isVerifying ? (
                    <ActivityIndicator size="small" color={Color.White} />
                  ) : (
                    <TextComponent
                      variant={TextVariant.Button}
                      size={TextSize.Medium}
                      color={Color.White}
                    >
                      Verify
                    </TextComponent>
                  )}
                </ButtonComponent>

                {/* Forgot key link */}
                <TouchableOpacity
                  onPress={onForgotKey}
                  className="items-center py-2"
                  activeOpacity={0.7}
                >
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Small}
                    color={Color.Grey}
                  >
                    Can't remember your key? Regenerate
                  </TextComponent>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
