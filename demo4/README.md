# AI Life Coach 网站

这是一个基于 LM Studio DeepSeek R1 API 的个人成长辅导网站。通过与 AI 进行对话，用户可以获得个性化的建议和指导，帮助个人成长。

## 项目结构

```
├── public/          # 静态资源目录
│   ├── css/         # 样式文件
│   ├── js/          # JavaScript 文件
│   └── images/      # 图片资源
├── server/          # 后端服务器目录
│   └── server.js    # Node.js 服务器文件
└── index.html       # 主页面
```

## 功能特点

1. 响应式聊天界面
   - 清晰的消息展示区域
   - 用户友好的输入框
   - 发送按钮和加载状态提示

2. AI 对话功能
   - 实时消息发送和接收
   - 流式响应显示
   - 打字机效果的消息展示

3. 后端服务
   - 处理与 LM Studio API 的通信
   - 60秒超时设置
   - 0.6 温度参数
   - CORS 问题处理

## 技术栈

- 前端：HTML5, CSS3, JavaScript
- 后端：Node.js
- API：LM Studio DeepSeek R1

## 页面布局

主页面采用简洁的单页面设计：

1. 顶部导航栏
   - 网站标题
   - 主题切换按钮

2. 聊天主区域
   - 消息历史显示区
   - 滚动条自动定位
   - 消息气泡样式

3. 底部输入区
   - 文本输入框
   - 发送按钮
   - 输入状态提示

## 样式说明

- 采用柔和的配色方案
- 圆角设计元素
- 响应式布局适配各种设备
- 简洁现代的界面风格
- 良好的视觉层次

## 开发计划

1. 搭建基础项目结构
2. 实现前端界面设计
3. 开发后端服务器
4. 集成 LM Studio API
5. 优化用户体验
6. 测试和调试