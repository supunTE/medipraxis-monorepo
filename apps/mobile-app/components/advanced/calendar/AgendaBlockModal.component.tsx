import TextComponent from "@/components/basic";
import {
  formatDuration,
  getSlotTimeFromMinutes,
  parseTimeToMinutes,
  timeToDecimalHour,
} from "@/utils";
import { Color, TextSize, TextVariant } from "@repo/config";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { AgendaBlockContent } from "./calendar.types";

interface AgendaBlockModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  startHour: string;
  endHour: string;
  slots: number;
  contents: (AgendaBlockContent | null)[];
  onAppointmentPress?: (
    appointment: AgendaBlockContent,
    groupId: string | null
  ) => void;
  onEmptySlotPress?: (groupId: string, slotNumber: number) => void;
}

export function AgendaBlockModal({
  visible,
  onClose,
  groupId,
  startHour,
  endHour,
  slots,
  contents,
  onAppointmentPress,
  onEmptySlotPress,
}: AgendaBlockModalProps): React.JSX.Element {
  const startHourDecimal = timeToDecimalHour(startHour);
  const endHourDecimal = timeToDecimalHour(endHour);
  const startTimeMinutes = parseTimeToMinutes(startHour);
  const totalDurationMinutes = (endHourDecimal - startHourDecimal) * 60;
  const slotDurationMinutes = totalDurationMinutes / slots;
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
              const slotTime = getSlotTimeFromMinutes(
                index,
                startTimeMinutes,
                slotDurationMinutes
              );
              const endSlotTime = getSlotTimeFromMinutes(
                index + 1,
                startTimeMinutes,
                slotDurationMinutes
              );

              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    if (content) {
                      onAppointmentPress?.(content, groupId);
                    } else {
                      onEmptySlotPress?.(groupId, index);
                    }
                  }}
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
                        {slotTime} - {endSlotTime} ({formatDuration(slotDurationMinutes)})
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
                </Pressable>
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
