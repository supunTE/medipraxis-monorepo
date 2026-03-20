import { Color, TextSize, TextVariant } from "@repo/config";
import { setStringAsync } from "expo-clipboard";
import {
  CheckIcon,
  CopySimpleIcon,
  EyeIcon,
  KeyIcon,
} from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, TouchableOpacity, View } from "react-native";

import {
  ButtonComponent,
  ButtonSize,
  CheckboxComponent,
  TextComponent,
} from "../../components/basic";
import { useSaveUserKeys } from "../../services/user-keys";
import { encryptionKeyStorage } from "../../utils/storage";
import { generateRecoveryKey, generateUserKeys } from "../../utils/userKeys";

type KeyRevealModalProps = {
  visible: boolean;
  mode: "register" | "revoke";
  onSuccess: () => void;
  onClose?: () => void;
};

export function KeyRevealModal({
  visible,
  mode,
  onSuccess,
  onClose,
}: KeyRevealModalProps) {
  const [step, setStep] = useState<"info" | "key">("info");
  const [acknowledged, setAcknowledged] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState("................");
  const [copied, setCopied] = useState(false);
  const [generatingKeys, setGeneratingKeys] = useState(false);

  const { mutateAsync: saveUserKeys } = useSaveUserKeys();

  useEffect(() => {
    if (visible) {
      setStep("info");
      setAcknowledged(false);
      setCopied(false);
      setGeneratingKeys(false);
      void (async () => {
        const { raw } = await generateRecoveryKey();
        setRecoveryKey(raw);
      })();
    }
  }, [visible]);

  const handleCopy = async () => {
    await setStringAsync(recoveryKey);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleContinue = async () => {
    setGeneratingKeys(true);
    await new Promise((resolve) => setTimeout(resolve, 50));
    const userKeys = await generateUserKeys(recoveryKey);
    await saveUserKeys({
      public_key: userKeys.publicKey,
      wrapped_private_key: userKeys.wrappedPrivateKey,
      pbkdf2_salt: userKeys.pbkdf2Salt,
    });
    await encryptionKeyStorage.set(recoveryKey);
    setGeneratingKeys(false);
    onSuccess();
  };

  const isRevoke = mode === "revoke";

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}
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
            style={{
              backgroundColor: isRevoke ? "#FEE2E2" : Color.LightCream,
            }}
          >
            <KeyIcon
              size={30}
              color={isRevoke ? Color.DangerDark : Color.Warning}
              weight="duotone"
            />
          </View>

          <TextComponent
            variant={TextVariant.Title}
            size={TextSize.Large}
            className="text-center mb-8"
          >
            {isRevoke
              ? "Regenerate Your Encryption Key"
              : "Your Encryption Key"}
          </TextComponent>

          {/* Warning message */}
          <View
            className="rounded-lg p-4 mb-5"
            style={{
              backgroundColor: isRevoke ? "#FEF2F2" : Color.LightCream,
              borderWidth: 1,
              borderColor: isRevoke ? Color.DangerDark : Color.Warning,
            }}
          >
            {isRevoke && (
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Medium}
                color={Color.DangerDark}
                style={{ lineHeight: 22, marginBottom: 8, fontWeight: "700" }}
              >
                Warning: Revoking your key will make all previously encrypted
                patient records inaccessible.
              </TextComponent>
            )}
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.Grey}
              style={{ lineHeight: 22 }}
            >
              {isRevoke
                ? "A new recovery key will be generated. Save it securely, it cannot be recovered by our support team."
                : "This key is generated once and never shown again. Store it offline in a safe place. Without it, your encrypted patient data cannot be recovered, not even by our support team."}
            </TextComponent>
          </View>

          {step === "key" && (
            <>
              {/* Recovery key — 2 rows of [X][X][X][X] · [X][X][X][X] */}
              <View className="mb-5 gap-2">
                {[recoveryKey.slice(0, 8), recoveryKey.slice(8, 16)].map(
                  (half: string, row: number) => (
                    <View
                      key={row}
                      className="flex-row items-center justify-center gap-2"
                    >
                      <View className="flex-row gap-1">
                        {half
                          .slice(0, 4)
                          .split("")
                          .map((char: string, i: number) => (
                            <View
                              key={i}
                              className="bg-gray-100 border border-gray-300 rounded-md w-9 h-9 items-center justify-center"
                            >
                              <TextComponent
                                variant={TextVariant.Body}
                                size={TextSize.Small}
                                style={{
                                  fontFamily: "monospace",
                                  fontWeight: "700",
                                }}
                              >
                                {char}
                              </TextComponent>
                            </View>
                          ))}
                      </View>
                      <View className="w-4 h-px bg-gray-300" />
                      <View className="flex-row gap-1">
                        {half
                          .slice(4, 8)
                          .split("")
                          .map((char: string, i: number) => (
                            <View
                              key={i}
                              className="bg-gray-100 border border-gray-300 rounded-md w-9 h-9 items-center justify-center"
                            >
                              <TextComponent
                                variant={TextVariant.Body}
                                size={TextSize.Small}
                                style={{
                                  fontFamily: "monospace",
                                  fontWeight: "700",
                                }}
                              >
                                {char}
                              </TextComponent>
                            </View>
                          ))}
                      </View>
                    </View>
                  )
                )}
              </View>

              {/* Copy button */}
              <TouchableOpacity
                onPress={() => {
                  void handleCopy();
                }}
                className="flex-row items-center justify-center gap-1.5 mb-5"
                activeOpacity={0.7}
              >
                {copied ? (
                  <CheckIcon size={16} color={Color.Green} />
                ) : (
                  <CopySimpleIcon size={16} color={Color.Grey} />
                )}
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Small}
                  color={copied ? Color.Green : Color.Grey}
                >
                  {copied ? "Copied!" : "Copy key"}
                </TextComponent>
              </TouchableOpacity>

              {/* Acknowledge checkbox row */}
              <View className="mb-5">
                <CheckboxComponent
                  isChecked={acknowledged}
                  onChange={setAcknowledged}
                  isInvalid={isRevoke}
                  label={
                    isRevoke
                      ? "I understand that revoking my key will make older records inaccessible"
                      : "I understand and have saved my key safely"
                  }
                  labelColor={Color.Grey}
                />
              </View>
            </>
          )}

          <View className="gap-3">
            {step === "info" ? (
              <ButtonComponent
                onPress={() => setStep("key")}
                buttonColor={isRevoke ? Color.DangerDark : Color.Green}
                textColor={Color.White}
                size={ButtonSize.Large}
              >
                <View className="flex-row items-center gap-2">
                  <EyeIcon size={18} color={Color.White} />
                  <TextComponent
                    variant={TextVariant.Button}
                    size={TextSize.Medium}
                    color={Color.White}
                  >
                    Show Key
                  </TextComponent>
                </View>
              </ButtonComponent>
            ) : (
              <ButtonComponent
                onPress={() => {
                  void handleContinue();
                }}
                disabled={!acknowledged || generatingKeys}
                buttonColor={
                  acknowledged && !generatingKeys
                    ? isRevoke
                      ? Color.DangerDark
                      : Color.Green
                    : Color.Grey
                }
                textColor={Color.White}
                size={ButtonSize.Large}
              >
                {generatingKeys ? (
                  <ActivityIndicator size="small" color={Color.White} />
                ) : (
                  <TextComponent
                    variant={TextVariant.Button}
                    size={TextSize.Medium}
                    color={Color.White}
                  >
                    {isRevoke ? "Revoke & Regenerate Key" : "Continue to Login"}
                  </TextComponent>
                )}
              </ButtonComponent>
            )}

            {onClose && (
              <ButtonComponent
                onPress={onClose}
                buttonColor={Color.Transparent}
                textColor={Color.Grey}
                size={ButtonSize.Large}
              >
                <TextComponent
                  variant={TextVariant.Button}
                  size={TextSize.Medium}
                  color={Color.Grey}
                >
                  Cancel
                </TextComponent>
              </ButtonComponent>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
