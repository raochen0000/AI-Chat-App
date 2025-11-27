import React from "react";
import { ConfigProvider, theme } from "antd";
import ChatPage from "./pages/Chat/ChatPage";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <ChatPage />
    </ConfigProvider>
  );
};

export default App;
