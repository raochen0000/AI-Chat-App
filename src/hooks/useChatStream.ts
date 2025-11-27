import { useCallback, useRef, useState } from "react";
import { ChatMessage, ChatRequestPayload, StreamChunk } from "../types/chat";
import { createChatStream, parseChatStream } from "../services/chatService";

export interface UseChatStreamResult {
  messages: ChatMessage[];
  isStreaming: boolean;
  error?: string;
  sendMessage: (payload: ChatRequestPayload) => Promise<void>;
  stopStreaming: () => void;
  retry: () => Promise<void>;
  resetConversation: () => void;
  loadConversation: (messages: ChatMessage[]) => void;
}

export const useChatStream = (): UseChatStreamResult => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>();
  const lastPayloadRef = useRef<ChatRequestPayload | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
  }, []);

  const handleChunk = useCallback((chunk: StreamChunk) => {
    setMessages(prev => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      const updated = { ...last };

      if (chunk.type === "delta" && chunk.content) {
        updated.content += chunk.content;
        updated.status = "streaming";
      } else if (chunk.type === "done") {
        updated.status = "completed";
      } else if (chunk.type === "error" && chunk.error) {
        updated.status = "error";
        updated.errorMessage = chunk.error;
      }

      return [...prev.slice(0, -1), updated];
    });
  }, []);

  const sendMessage = useCallback(
    async (payload: ChatRequestPayload) => {
      setError(undefined);
      setIsStreaming(true);
      lastPayloadRef.current = payload;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: payload.message,
        createdAt: new Date().toISOString(),
        status: "completed",
      };

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        status: "streaming",
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);

      const { request, controller } = createChatStream(payload);
      abortControllerRef.current = controller;

      try {
        const response = await request;
        if (!response.ok) {
          throw new Error(`服务端异常：${response.status}`);
        }

        await parseChatStream(response, handleChunk, err => {
          setError(err.message);
          setIsStreaming(false);
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "未知错误";
        setError(errorMessage);
        setMessages(prev =>
          prev.map(message =>
            message.id === assistantMessage.id
              ? { ...message, status: "error", errorMessage: errorMessage || "未知错误" }
              : message
          )
        );
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [handleChunk]
  );

  const retry = useCallback(async () => {
    if (lastPayloadRef.current) {
      await sendMessage(lastPayloadRef.current);
    }
  }, [sendMessage]);

  const resetConversation = useCallback(() => {
    stopStreaming();
    setMessages([]);
    setError(undefined);
    lastPayloadRef.current = null;
  }, [stopStreaming]);

  const loadConversation = useCallback(
    (nextMessages: ChatMessage[]) => {
      stopStreaming();
      setMessages(nextMessages);
      setError(undefined);
      lastPayloadRef.current = null;
    },
    [stopStreaming]
  );

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    retry,
    resetConversation,
    loadConversation,
  };
};
