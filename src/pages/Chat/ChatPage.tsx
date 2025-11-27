import React, { useMemo, useRef, useState } from "react";
import { Button, Card, Drawer, Empty, Layout, List, Tooltip, Typography } from "antd";
import { PlusOutlined, UnorderedListOutlined, EyeOutlined } from "@ant-design/icons";
import { ChatMessageList } from "../../components/ChatMessageList";
import { ChatInput } from "../../components/ChatInput";
import { MessageStatus } from "../../components/MessageStatus";
import { useChatStream } from "../../hooks/useChatStream";
import { ChatMessage } from "../../types/chat";
import "./ChatPage.css";

const { Content } = Layout;

interface ConversationRecord {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

const ChatPage: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [historyVisible, setHistoryVisible] = useState(false);
  const [conversationRecords, setConversationRecords] = useState<ConversationRecord[]>([]);
  const [conversationCounter, setConversationCounter] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);
  const { messages, isStreaming, error, sendMessage, stopStreaming, retry, resetConversation, loadConversation } =
    useChatStream();

  const currentConversationTitle = useMemo(() => `对话 ${conversationCounter}`, [conversationCounter]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await sendMessage({ message: inputValue });
    setInputValue("");
  };

  const handleStartNewConversation = () => {
    setConversationRecords(prev => {
      if (!messages.length) return prev;
      const snapshot = messages.map(message => ({ ...message }));
      return [
        {
          id: crypto.randomUUID(),
          title: currentConversationTitle,
          messages: snapshot,
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });

    resetConversation();
    setInputValue("");
    setHistoryVisible(false);
    setConversationCounter(prev => prev + 1);
  };

  const handleLoadConversation = (record: ConversationRecord) => {
    loadConversation(record.messages.map(message => ({ ...message })));
    setHistoryVisible(false);
    const index = Number(record.title.replace(/[^\d]/g, ""));
    if (!Number.isNaN(index)) {
      setConversationCounter(index);
    }
  };

  return (
    <Layout className="chat-layout">
      <Content className="chat-layout-content">
        <Card ref={cardRef} className="chat-card" bodyStyle={{ height: "100%", padding: 0 }}>
          <header className="chat-card-header">
            <Tooltip title="对话列表">
              <Button
                type="text"
                shape="circle"
                icon={<UnorderedListOutlined />}
                onClick={() => setHistoryVisible(true)}
                aria-label="查看对话列表"
              />
            </Tooltip>
            <Typography.Title level={4} className="chat-card-header-title">
              {currentConversationTitle}
            </Typography.Title>
            <Tooltip title="新增对话">
              <Button
                type="text"
                shape="circle"
                icon={<PlusOutlined />}
                onClick={handleStartNewConversation}
                aria-label="新增对话"
              />
            </Tooltip>
          </header>
          <section className="chat-card-body">
            <ChatMessageList messages={messages} />
            <MessageStatus
              hasError={Boolean(error)}
              onRetry={retry}
              onCancel={stopStreaming}
              isStreaming={isStreaming}
            />
          </section>
          <footer className="chat-card-footer">
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSend}
              isStreaming={isStreaming}
              onStop={stopStreaming}
            />
          </footer>
        </Card>
        <Drawer
          title="历史对话"
          placement="left"
          open={historyVisible}
          onClose={() => setHistoryVisible(false)}
          width={320}
          getContainer={() => cardRef.current ?? document.body}
          rootStyle={{ position: "absolute" }}
        >
          <List
            dataSource={conversationRecords}
            locale={{ emptyText: <Empty description="暂无对话记录" /> }}
            renderItem={item => (
              <List.Item
                actions={[
                  <Tooltip title="查看" key={item.id}>
                    <Button shape="circle" icon={<EyeOutlined />} onClick={() => handleLoadConversation(item)} />
                  </Tooltip>,
                ]}
              >
                <List.Item.Meta title={item.title} description={new Date(item.updatedAt).toLocaleString()} />
              </List.Item>
            )}
          />
        </Drawer>
      </Content>
    </Layout>
  );
};

export default ChatPage;
