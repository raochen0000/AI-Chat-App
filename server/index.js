const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "sk-7f710a6afdf0406596f5953e384ba1b2";

/**
 * SSE 流式聊天接口
 * Body: { message: string, history?: Array<{ role: string, content: string }> }
 */
app.post("/api/chat/stream", async (req, res) => {
  const { message, history = [] } = req.body || {};

  if (!message) {
    res.status(400).json({ success: false, error: "message 不能为空" });
    return;
  }

  const messages = [...history, { role: "user", content: message }];

  try {
    const response = await axios({
      method: "post",
      url: "https://api.deepseek.com/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      data: {
        model: "deepseek-chat",
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      },
      responseType: "stream",
    });

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    response.data.on("data", chunk => {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.replace(/^data:\s*/, "");
        if (payload === "[DONE]") {
          res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
          return;
        }

        try {
          const data = JSON.parse(payload);
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            res.write(`data: ${JSON.stringify({ id: Date.now(), type: "delta", content })}\n\n`);
          }
        } catch (error) {
          console.error("SSE 数据解析失败:", error);
        }
      }
    });

    response.data.on("end", () => {
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    });

    response.data.on("error", error => {
      console.error("DeepSeek 流错误:", error);
      res.write(`data: ${JSON.stringify({ type: "error", error: "模型流错误" })}\n\n`);
      res.end();
    });

    req.on("close", () => {
      response.data.destroy();
    });
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message || "模型请求失败";
    console.error("调用 DeepSeek 失败:", message);
    res.status(500).json({ success: false, error: message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});
