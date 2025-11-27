import { ChatRequestPayload, StreamChunk, ChatStreamOptions } from "../types/chat";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://localhost:3001";

export function createChatStream(payload: ChatRequestPayload, options?: ChatStreamOptions) {
  const controller = new AbortController();
  const signal = options?.signal ?? controller.signal;

  const url = `${API_BASE_URL}/api/chat/stream`;
  const request = fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  return { request, controller };
}

export async function parseChatStream(
  response: Response,
  onChunk: (chunk: StreamChunk) => void,
  onError: (error: Error) => void
) {
  if (!response.body) {
    onError(new Error("Readable stream is not supported in this environment."));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onChunk({ id: crypto.randomUUID(), type: "done" });
        break;
      }

      const text = decoder.decode(value, { stream: true });
      if (!text.trim()) continue;

      // 兼容后端返回纯文本或 SSE 数据
      if (text.includes("data:")) {
        const events = text.split("\n\n");
        for (const event of events) {
          const dataLine = event.split("\n").find(line => line.startsWith("data:"));
          if (!dataLine) continue;
          const data = dataLine.replace(/^data:\s*/, "");

          try {
            const chunk: StreamChunk = JSON.parse(data);
            onChunk(chunk);
          } catch {
            onError(new Error("SSE 数据解析失败"));
            return;
          }
        }
      } else {
        onChunk({
          id: crypto.randomUUID(),
          type: "delta",
          content: text,
        });
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error("流式解析失败"));
  }
}
