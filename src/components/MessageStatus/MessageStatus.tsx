import React from "react";
import { Alert, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

interface MessageStatusProps {
  hasError: boolean;
  onRetry?: () => void;
  onCancel?: () => void;
  isStreaming: boolean;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ hasError, onRetry, onCancel, isStreaming }) => {
  if (!hasError) {
    return null;
  }

  return (
    <Alert
      type="error"
      message="消息发送失败"
      action={
        onRetry && <Button type="text" shape="circle" icon={<ReloadOutlined />} aria-label="重试" onClick={onRetry} />
      }
      showIcon
    />
  );
};

export default MessageStatus;
