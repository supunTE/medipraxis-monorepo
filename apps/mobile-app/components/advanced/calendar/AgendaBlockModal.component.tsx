import TextComponent from "@/components/basic";
import { calculateSlotDuration, getSlotTime } from "@/utils";
import { Color, TextSize, TextVariant } from "@repo/config";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { AgendaBlockContent } from "./AgendaTimeBlock.component";

interface AgendaBlockModalProps {
  visible: boolean;
  onClose: () => void;
  startHour: number;
  endHour: number;
  slots: number;
  contents: (AgendaBlockContent | null)[];
}

export function AgendaBlockModal({
  visible,
  onClose,
  startHour,
  endHour,
  slots,
  contents,
}: AgendaBlockModalProps): React.JSX.Element {
  const slotDurationMinutes = calculateSlotDuration(startHour, endHour, slots);
  const reservedSlots = contents.filter((content) => content !== null).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            width: "85%",
            height: "70%",
          }}
        >
          <View style={{ marginBottom: 16 }}>
            <TextComponent size={TextSize.Medium} variant={TextVariant.Title}>
              Appointments
            </TextComponent>
            <TextComponent
              size={TextSize.Small}
              variant={TextVariant.Body}
              color={Color.Grey}
            >
              {reservedSlots}/{slots} slots reserved
            </TextComponent>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={true}
          >
            {contents.map((content, index) => {
              const slotTime = getSlotTime(
                index,
                startHour,
                slotDurationMinutes
              );
              const endSlotTime = getSlotTime(
                index + 1,
                startHour,
                slotDurationMinutes
              );

              return (
                <View
                  key={index}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    marginBottom: 8,
                    backgroundColor: content ? "#F8F9FA" : "#FFFFFF",
                    borderRadius: 8,
                    borderLeftWidth: content ? 4 : 1,
                    borderWidth: content ? 0 : 1,
                    borderStyle: content ? "solid" : "dashed",
                    borderColor: content ? Color.Green : Color.LightGrey,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <TextComponent
                        size={TextSize.Small}
                        variant={TextVariant.Body}
                        color={Color.Grey}
                      >
                        {slotTime} - {endSlotTime}
                      </TextComponent>
                      {content ? (
                        <>
                          <TextComponent
                            size={TextSize.Small}
                            variant={TextVariant.Title}
                          >
                            {content.title}
                          </TextComponent>
                          {content.client && (
                            <TextComponent
                              size={TextSize.Small}
                              variant={TextVariant.Body}
                            >
                              Client: {content.client}
                            </TextComponent>
                          )}
                        </>
                      ) : (
                        <TextComponent
                          size={TextSize.Small}
                          variant={TextVariant.Body}
                          color={Color.Grey}
                        >
                          Available
                        </TextComponent>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={{
              marginTop: 16,
              backgroundColor: Color.Green,
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <TextComponent
              size={TextSize.Small}
              variant={TextVariant.Title}
              color={Color.White}
            >
              Close
            </TextComponent>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
