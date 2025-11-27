import React from 'react';
import { Avatar, Typography } from 'antd';
import './MessageBubble.css';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

const ROLE_META = {
  user: { label: '我', color: '#1677ff' },
  assistant: { label: 'AI', color: '#13c2c2' },
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content }) => {
  const meta = ROLE_META[role];

  return (
    <div
      className={`message-bubble message-bubble-${role}`}
      style={{
        display: 'flex',
        flexDirection: role === 'user' ? 'row-reverse' : 'row',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <Avatar style={{ backgroundColor: meta.color }}>{meta.label}</Avatar>
      <div
        style={{
          backgroundColor: role === 'user' ? '#e6f4ff' : '#f5f5f5',
          padding: '8px 12px',
          borderRadius: 12,
          maxWidth: '80%',
        }}
      >
        <Typography.Text>{content}</Typography.Text>
      </div>
    </div>
  );
};

export default MessageBubble;

