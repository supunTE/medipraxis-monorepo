import type { ReactNode } from "react";
import { Modal, Platform, View, type ViewStyle } from "react-native";

interface FormPopupProps {
  visible: boolean;
  onRequestClose?: () => void;
  children: ReactNode;
  containerStyle?: ViewStyle;
  animationType?: "slide" | "fade" | "none";
}

/**
 * Cross-platform modal popup for forms.
 *
 * Android: two stacked Modals (backdrop + content) so the system keyboard
 *          pushes the content up automatically.
 * iOS:     single Modal with the backdrop as a wrapper View background,
 *          because iOS does not support presenting multiple Modals at once.
 */
export function FormPopup({
  visible,
  onRequestClose,
  children,
  containerStyle,
  animationType = "slide",
}: FormPopupProps) {
  const wrapperStyle: ViewStyle = {
    flex: 1,
    justifyContent: "center",
    padding: 12,
    ...containerStyle,
  };

  if (Platform.OS === "android") {
    return (
      <>
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          statusBarTranslucent
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} />
        </Modal>
        <Modal
          visible={visible}
          animationType={animationType}
          transparent
          onRequestClose={onRequestClose}
        >
          <View style={[wrapperStyle, { backgroundColor: "transparent" }]}>
            {children}
          </View>
        </Modal>
      </>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent
      statusBarTranslucent
      onRequestClose={onRequestClose}
    >
      <View style={[wrapperStyle, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
        {children}
      </View>
    </Modal>
  );
}
