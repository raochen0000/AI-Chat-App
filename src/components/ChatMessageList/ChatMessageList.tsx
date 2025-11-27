import React, { useEffect, useRef, useState } from "react";
import { Empty } from "antd";
import { MessageBubble } from "../MessageBubble";
import { ChatMessage } from "../../types/chat";
import "./ChatMessageList.css";

interface ChatMessageListProps {
  messages: ChatMessage[];
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    if (!isScrolling) {
      setIsScrolling(true);
    }

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsScrolling(false);
      scrollTimeoutRef.current = null;
    }, 400);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`chat-message-list ${!messages.length ? "is-empty" : ""} ${isScrolling ? "show-scrollbar" : ""}`}
    >
      {!messages.length && (
        <div className="chat-message-list-empty">
          <Empty description="暂无对话" />
        </div>
      )}
      {messages.map((message, index) => {
        const isLast = index === messages.length - 1;
        return (
          <div
            key={message.id}
            ref={
              isLast
                ? node => {
                    lastMessageRef.current = node;
                  }
                : undefined
            }
            className="chat-message-list-item"
          >
            <MessageBubble role={message.role} content={message.content} />
          </div>
        );
      })}
    </div>
  );
};

export default ChatMessageList;
