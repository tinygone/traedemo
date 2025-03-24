const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// LM Studio API 配置
const API_URL = 'http://127.0.0.1:1234/v1/chat/completions';
const TIMEOUT = 600000; // 60秒超时
const TEMPERATURE = 0.6;

// 系统提示词，定义 AI 作为 life coach 的角色
const SYSTEM_PROMPT = `你是一位专业的 Life Coach，拥有丰富的个人成长和发展指导经验。你的目标是通过对话帮助用户实现个人成长。

作为 Life Coach，你应该：
1. 倾听用户的问题和困扰
2. 提供具有建设性的建议和指导
3. 帮助用户制定可行的目标和计划
4. 鼓励用户保持积极向上的心态
5. 引导用户进行自我反思和成长

请用温暖、专业的语气与用户交流，让他们感受到被理解和支持。`;

// 处理聊天请求
app.post('/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        // 添加系统提示词
        const fullMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
        ];

        // 设置请求选项
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek-r1-distill-qwen-7b',
                messages: fullMessages,
                temperature: TEMPERATURE,
                max_tokens: -1,
                stream: true
            }),
            timeout: TIMEOUT
        };

        // 发送请求到 LM Studio API
        const response = await fetch(API_URL, requestOptions);

        // 设置响应头以支持流式输出
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 处理流式响应
        response.body.on('data', chunk => {
            const lines = chunk.toString().split('\n');

            for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.trim() === 'data: [DONE]') continue;

                try {
                    const data = JSON.parse(line.replace('data: ', ''));
                    const content = data.choices[0].delta.content || '';
                    res.write(`data: ${JSON.stringify({ content })}\n\n`);
                } catch (error) {
                    console.error('Error parsing chunk:', error);
                }
            }
        });

        response.body.on('end', () => {
            res.end();
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});