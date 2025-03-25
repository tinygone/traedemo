const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

// 设置超时时间为600秒
const TIMEOUT = 600000;
// 最大重试次数
const MAX_RETRIES = 3;
// 重试延迟时间（毫秒）
const RETRY_DELAY = 1000;

app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: '文本内容不能为空' });
    }

    let retries = 0;
    const makeRequest = async () => {
      const options = {
        hostname: '127.0.0.1',
        port: 1234,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: TIMEOUT
      };

      return new Promise((resolve, reject) => {
        const apiRequest = http.request(options, (apiRes) => {
      let data = '';
      
      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          const summary = response.choices[0].message.content;
          resolve({ summary });
        } catch (error) {
          console.error('解析API响应失败:', error);
          reject(new Error('API响应解析失败'));
        }
      });
    });

    apiRequest.on('error', (error) => {
      console.error('API请求失败:', error.message);
      console.error('错误详情:', {
        code: error.code,
        syscall: error.syscall,
        errno: error.errno
      });
      reject(error);
    });

    apiRequest.on('timeout', () => {
      apiRequest.destroy();
      reject(new Error('请求超时'));
    });

    const requestData = {
      model: 'deepseek-r1-distill-qwen-7b',
      messages: [
        { role: 'system', content: '使用一个金句总结全文最核心的内容' },
        { role: 'user', content: text }
      ],
      temperature: 0.6,
      max_tokens: -1,
      stream: false
    };

    apiRequest.write(JSON.stringify(requestData));
    apiRequest.end();
      });
    };

    while (retries < MAX_RETRIES) {
      try {
        const result = await makeRequest();
        return res.json(result);
      } catch (error) {
        retries++;
        console.error(`第${retries}次请求失败:`, error);
        if (retries === MAX_RETRIES) {
          return res.status(500).json({ error: `API请求失败，已重试${retries}次` });
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});