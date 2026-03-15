import { TextComponent } from "@/components/basic";
import { View } from "@/components/Themed";
import { Icons } from "@/config";
import { getRandomColor, getRandomIcon } from "@/services/clients";
import { Color, TextSize, TextVariant } from "@repo/config";
import { Client } from "@repo/models";
import { PencilSimpleIcon } from "phosphor-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

interface SameContactSectionProps {
  clients: Client[];
}

export const SameContactSection: React.FC<SameContactSectionProps> = ({
  clients,
}) => {
  if (!clients?.length) return null;

  return (
    <View className="mt-3 ml-6">
      <TextComponent
        variant={TextVariant.Body}
        size={TextSize.Small}
        className="mb-2 opacity-60"
      >
        Clients from same contact
      </TextComponent>

      {clients.map((client) => {
        const IconComponent = Icons[getRandomIcon()];
        console.log(client);

        return (
          <TouchableOpacity
            key={client.client_id}
            className="flex-row items-center gap-3 py-2"
            activeOpacity={0.7}
          >
            <View
              className="w-5 h-5 rounded-full items-center justify-center"
              style={{ backgroundColor: getRandomColor() }}
            >
              {IconComponent ? (
                <IconComponent size={10} color={Color.White} />
              ) : (
                <PencilSimpleIcon size={10} color={Color.White} />
              )}
            </View>

            <TextComponent variant={TextVariant.Body} size={TextSize.Small}>
              {client.first_name + " " + client.last_name}
            </TextComponent>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
