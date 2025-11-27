# AI Chat App

基于 React + TypeScript + Ant Design 构建的简易 Chat 应用，前端通过 SSE（Server-Sent Events）接收模型流式回复，支持多轮对话与中断、重试、异常提示等交互。

## 目录结构

```
.
├── public/                      # CRA 静态资源
├── src/
│   ├── components/              # UI 组件（ChatInput、ChatMessageList 等）
│   ├── hooks/                   # 自定义 Hooks（如 useChatStream）
│   ├── pages/                   # 页面级组件（ChatPage）
│   ├── services/                # 与后端 / SSE 相关的请求封装
│   ├── types/                   # TypeScript 类型定义
│   └── utils/                   # 工具方法（预留）
├── server/
│   └── mock-sse-server.js       # 可选：本地 SSE 模拟服务
├── package.json
└── README.md
```

## 开发环境准备

```bash
npm install
```

## 启动前端

```bash
npm start
```

默认在 `http://localhost:3000` 运行。

## 启动 / 模拟后端 SSE

项目自带一个简单的 SSE 模拟服务，方便本地开发：

```bash
node server/mock-sse-server.js
```

服务默认监听 `http://localhost:8787/chat/stream`，可通过设置 `MOCK_SSE_PORT` 环境变量修改端口。

> 如需对接真实模型服务，只需在 `src/services/chatService.ts` 中调整 `API_BASE_URL` 以及请求参数/解析逻辑。

## 后续开发指引

- 在 `useChatStream` 中扩展异常处理（网络中断、超时、服务端错误、SSE 数据格式错误等）。
- 补充消息失败后的重试逻辑、用户手动停止流式生成等交互。
- 根据 UI 需求继续拆分组件（如 Loading、空态、重试提醒等）。
