import { parse, type ParsedInput } from "@/lib/nlp";
import type { ClientDisplay } from "@/services/clients/useClients";
import { useEffect, useMemo, useRef } from "react";

const DEBOUNCE_MS = 300;
const MIN_LENGTH = 3;

export function useInputParser(
  inputText: string,
  onCorrected: (corrected: string) => void,
  clients: ClientDisplay[]
): { parsed: ParsedInput | null } {
  const lastCorrectedRef = useRef<string>("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parsed = useMemo<ParsedInput | null>(() => {
    if (inputText.trim().length < MIN_LENGTH) return null;
    return parse(inputText, clients);
  }, [inputText, clients]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!parsed) return;

    debounceTimerRef.current = setTimeout(() => {
      const { normalizedText } = parsed;
      // Only call back if the text actually changed and we haven't already applied this correction
      if (
        normalizedText !== inputText &&
        normalizedText !== lastCorrectedRef.current
      ) {
        lastCorrectedRef.current = normalizedText;
        onCorrected(normalizedText);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText, parsed, onCorrected]);

  return { parsed };
}
