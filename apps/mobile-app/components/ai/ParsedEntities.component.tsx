import { TextComponent } from "@/components/basic";
import type { ParsedInput } from "@/lib/nlp";
import { TextSize, TextVariant } from "@repo/config";
import { ScrollView, View } from "react-native";

interface ParsedEntitiesProps {
  parsed: ParsedInput | null;
}

export function ParsedEntities({ parsed }: ParsedEntitiesProps) {
  if (!parsed?.hasEntities) return null;

  const { people, dates, times } = parsed.entities;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-2"
      contentContainerClassName="flex-row gap-2 px-1 items-center"
    >
      {people.map((person, i) => {
        // Prefer the matched patient name from the local DB
        const display = person.suggestedClient?.name ?? person.text;
        const isSuggested =
          person.suggestedClient &&
          person.suggestedClient.name.toLowerCase() !==
            person.text.toLowerCase();

        return (
          <View
            key={`person-${i}`}
            className="flex-row items-center bg-purple-100 rounded-full px-3 py-1"
          >
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Small}
              style={{ color: "#7C3AED" }}
            >
              {`👤 ${display}`}
              {isSuggested ? " ✓" : ""}
            </TextComponent>
          </View>
        );
      })}

      {dates.map((date, i) => (
        <View
          key={`date-${i}`}
          className="flex-row items-center bg-green-100 rounded-full px-3 py-1"
        >
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Small}
            style={{ color: "#16A34A" }}
          >
            {`📅 ${date.displayText}`}
          </TextComponent>
        </View>
      ))}

      {times.map((time, i) => (
        <View
          key={`time-${i}`}
          className="flex-row items-center bg-amber-100 rounded-full px-3 py-1"
        >
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Small}
            style={{ color: "#D97706" }}
          >
            {`🕐 ${time.resolved}`}
          </TextComponent>
        </View>
      ))}
    </ScrollView>
  );
}
