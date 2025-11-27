const http = require('http');

const PORT = process.env.MOCK_SSE_PORT || 8787;

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.url === '/chat/stream' && req.method === 'POST') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    let step = 0;
    const chunks = ['您好，我是一个示例 AI。', ' 这个 SSE 接口会逐段返回内容，', ' 您可以根据需要替换为真实模型。'];

    const interval = setInterval(() => {
      if (step < chunks.length) {
        res.write(`data: ${JSON.stringify({ id: Date.now(), type: 'delta', content: chunks[step] })}\n\n`);
        step += 1;
      } else {
        res.write(`data: ${JSON.stringify({ id: Date.now(), type: 'done' })}\n\n`);
        clearInterval(interval);
        res.end();
      }
    }, 800);

    req.on('close', () => {
      clearInterval(interval);
    });

    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`Mock SSE server listening on http://localhost:${PORT}`);
});

