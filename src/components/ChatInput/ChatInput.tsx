import React from "react";
import { Input, Button, Space } from "antd";
import { SendOutlined, StopOutlined } from "@ant-design/icons";
import "./ChatInput.css";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  onStop?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSubmit, isStreaming, disabled, onStop }) => {
  return (
    <Space.Compact className="chat-input" style={{ width: "100%" }}>
      <Input.TextArea
        autoSize={{ minRows: 1, maxRows: 4 }}
        placeholder="请输入消息..."
        value={value}
        disabled={disabled}
        onChange={event => onChange(event.target.value)}
        onPressEnter={event => {
          if (!event.shiftKey) {
            event.preventDefault();
            isStreaming ? onStop?.() : onSubmit();
          }
        }}
      />
      <Button
        type={isStreaming ? "default" : "primary"}
        shape="circle"
        icon={isStreaming ? <StopOutlined /> : <SendOutlined />}
        danger={isStreaming}
        disabled={!value.trim() && !isStreaming}
        onClick={isStreaming ? onStop : onSubmit}
        aria-label={isStreaming ? "停止生成" : "发送"}
      />
    </Space.Compact>
  );
};

export default ChatInput;
