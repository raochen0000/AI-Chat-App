export type SenderRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: SenderRole;
  content: string;
  createdAt: string;
  status?: 'streaming' | 'completed' | 'error';
  errorMessage?: string;
}

export interface ChatRequestPayload {
  message: string;
  conversationId?: string;
  metadata?: Record<string, unknown>;
}

export interface StreamChunk {
  id: string;
  type: 'delta' | 'done' | 'error';
  content?: string;
  error?: string;
}

export interface ChatStreamOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

