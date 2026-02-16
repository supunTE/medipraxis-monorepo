import { apiClient } from "@/lib/api-client";
import { AIChatRole, type UIChatMessage } from "@repo/models";
import { useCallback, useState } from "react";
import uuid from "react-native-uuid";

export interface AIConversation {
  messages: UIChatMessage[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
}

function createUserMessage(content: string): UIChatMessage {
  return {
    id: uuid.v4(),
    role: AIChatRole.User,
    content,
    timestamp: new Date(),
    isError: false,
  };
}

function createAssistantMessage(
  content: string,
  { isError }: { isError?: boolean } = { isError: false }
): UIChatMessage {
  return {
    id: uuid.v4(),
    role: AIChatRole.Assistant,
    content,
    isError,
    timestamp: new Date(),
  };
}

export function useAIChat(): AIConversation {
  const [messages, setMessages] = useState<UIChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim()) return;

      setIsLoading(true);

      // Add user message to chat
      const userMessage = createUserMessage(messageText);
      setMessages((prev) => [...prev, userMessage]);

      // Build history from current messages (last 10, before the new message)
      const history = messages.slice(-10).map((m) => ({
        role: m.role === AIChatRole.User ? "user" : "assistant",
        content: m.content,
      })) as { role: "user" | "assistant"; content: string }[];

      try {
        // Send to AI service with conversation history
        const res = await apiClient.api.ai.$post({
          json: { query: messageText, history },
        });

        const resonse = await res.json();

        // Handle successful response
        if (resonse.success && resonse.data) {
          const assistantMessage = createAssistantMessage(resonse.data.message);
          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          // Handle API error response
          const errorMessage =
            "error" in resonse && typeof resonse.error === "string"
              ? resonse.error
              : "Failed to get response from AI";
          console.error("AI Chat Error:", errorMessage);

          const errorAssistantMessage = createAssistantMessage(
            `Sorry, I encountered an error.`,
            { isError: true }
          );
          setMessages((prev) => [...prev, errorAssistantMessage]);
        }
      } catch (err) {
        // Handle network or unexpected errors
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        console.error("AI Chat Error:", errorMessage);

        const errorAssistantMessage = createAssistantMessage(
          `Sorry, I encountered an error.`,
          { isError: true }
        );
        setMessages((prev) => [...prev, errorAssistantMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}
