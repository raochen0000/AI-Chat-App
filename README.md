# AI Chat App

基于 React + TypeScript + Ant Design 构建的简易 Chat 应用，前端通过 SSE（Server-Sent Events）接收模型流式回复，支持多轮对话与中断、重试、异常提示等交互。

## 整个 demo 主要通过 AI 编程（Cursor）辅助开发完成

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
npm run start
```

默认在 `http://localhost:3000` 运行。

## 启动后端 SSE

后端服务调用的是 deepseek 的 API，经验证数据不是很可靠，信息存在滞后性！

```bash
node server/index.js
```

看到终端中打印出‘后端服务运行在 http://localhost:3001’提示信息表示启动成功。

服务默认监听 `http://localhost:8787/chat/stream`。

> 如需对接真实模型服务，只需在 `src/services/chatService.ts` 中调整 `API_BASE_URL` 以及请求参数/解析逻辑。

##
