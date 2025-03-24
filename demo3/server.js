const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 设置CORS头，允许前端页面访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理OPTIONS请求（预检请求）
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    // 处理静态文件请求
    if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Error loading index.html');
                return;
            }
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
        });
        return;
    }

    // 处理API请求 - 生成中文名
    if (req.method === 'POST' && pathname === '/generate-name') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { englishName } = JSON.parse(body);
                if (!englishName) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'English name is required' }));
                    return;
                }

                // 构建发送到LM Studio API的请求数据
                const requestData = {
                    model: "deepseek-r1-distill-qwen-7b", // 使用提供的模型
                    messages: [
                        {
                            role: "system",
                            content: `你是一个专业的中文名字生成器，专门为外国人创建有趣且有文化内涵的中文名字。

请根据提供的英文名生成三个不同的中文名字，每个名字都应该：
1. 考虑英文名的含义和音译
2. 融入中国传统文化元素
3. 包含一些幽默或有趣的成分
4. 适合外国人使用

对于每个名字，请提供：
- 中文名字（汉字）
- 中文含义解释（详细说明每个字的含义和文化背景）
- 英文解释（翻译名字的含义，并解释为什么这个名字适合该外国人）

请以JSON格式返回结果，格式如下：
{
  "names": [
    {
      "chinese": "中文名1",
      "chineseMeaning": "中文含义解释1",
      "englishMeaning": "英文解释1"
    },
    {
      "chinese": "中文名2",
      "chineseMeaning": "中文含义解释2",
      "englishMeaning": "英文解释2"
    },
    {
      "chinese": "中文名3",
      "chineseMeaning": "中文含义解释3",
      "englishMeaning": "英文解释3"
    }
  ]
}`
                        },
                        {
                            role: "user",
                            content: `请为英文名"${englishName}"生成三个有趣且有文化内涵的中文名字。`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: -1,
                    stream: false
                };

                // 创建请求选项
                const options = {
                    hostname: '127.0.0.1',
                    port: 1234,
                    path: '/v1/chat/completions',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 600000 // 10分钟超时
                };

                // 发送请求到LM Studio API
                const apiReq = http.request(options, (apiRes) => {
                    let responseData = '';

                    apiRes.on('data', (chunk) => {
                        responseData += chunk;
                    });

                    apiRes.on('end', () => {
                        try {
                            const parsedResponse = JSON.parse(responseData);
                            const content = parsedResponse.choices[0].message.content;
                            
                            // 尝试解析AI返回的JSON内容
                            let namesData;
                            try {
                                // 提取JSON部分（防止AI返回额外文本）
                                const jsonMatch = content.match(/\{[\s\S]*\}/);
                                if (jsonMatch) {
                                    namesData = JSON.parse(jsonMatch[0]);
                                } else {
                                    throw new Error('No JSON found in response');
                                }
                            } catch (jsonError) {
                                // 如果解析失败，尝试构建一个基本响应
                                console.error('Failed to parse AI response as JSON:', jsonError);
                                namesData = {
                                    names: [{
                                        chinese: "未能生成名字",
                                        chineseMeaning: "AI返回格式有误",
                                        englishMeaning: "Could not generate names due to formatting error"
                                    }]
                                };
                            }

                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(namesData));
                        } catch (error) {
                            console.error('Error processing API response:', error);
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: 'Error processing API response' }));
                        }
                    });
                });

                apiReq.on('error', (error) => {
                    console.error('Error calling LM Studio API:', error);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ 
                        error: 'Error calling AI API', 
                        details: error.message 
                    }));
                });

                // 处理请求超时
                apiReq.on('timeout', () => {
                    apiReq.destroy();
                    res.statusCode = 504;
                    res.end(JSON.stringify({ error: 'Request to AI API timed out' }));
                });

                // 发送请求数据
                apiReq.write(JSON.stringify(requestData));
                apiReq.end();

            } catch (error) {
                console.error('Error processing request:', error);
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid request data' }));
            }
        });
        return;
    }

    // 处理其他请求
    res.statusCode = 404;
    res.end('Not Found');
});

// 启动服务器
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Make sure LM Studio is running with the API server enabled at port 1234');
});