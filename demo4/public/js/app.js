// 主题切换功能
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// 从本地存储中获取主题设置
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
}

// 切换主题
themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// 聊天功能
const messageHistory = document.getElementById('messageHistory');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// 消息历史
let messages = [];

// 自动调整输入框高度
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
});

// 添加消息到聊天界面
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    messageHistory.appendChild(messageDiv);
    messageHistory.scrollTop = messageHistory.scrollHeight;
}

// 发送消息
async function sendMessage() {
    const content = userInput.value.trim();
    if (!content) return;

    // 禁用输入和发送按钮
    userInput.disabled = true;
    sendButton.disabled = true;
    sendButton.classList.add('loading');

    // 添加用户消息
    addMessage(content, true);
    messages.push({ role: 'user', content });

    try {
        // 发送请求到后端
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages })
        });

        if (!response.ok) throw new Error('网络请求失败');

        // 创建新的助手消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        messageDiv.appendChild(contentDiv);
        messageHistory.appendChild(messageDiv);

        let assistantMessage = '';

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.trim() === 'data: [DONE]') continue;

                try {
                    const data = JSON.parse(line.replace('data: ', ''));
                    assistantMessage += data.content;
                    contentDiv.textContent = assistantMessage;
                    messageHistory.scrollTop = messageHistory.scrollHeight;
                } catch (error) {
                    console.error('Error parsing chunk:', error);
                }
            }
        }

        // 保存助手消息
        messages.push({ role: 'assistant', content: assistantMessage });

    } catch (error) {
        console.error('Error:', error);
        addMessage('抱歉，发生了错误。请稍后重试。');
    } finally {
        // 重置输入框和按钮状态
        userInput.value = '';
        userInput.style.height = 'auto';
        userInput.disabled = false;
        sendButton.disabled = false;
        sendButton.classList.remove('loading');
        userInput.focus();
    }
}

// 发送消息事件监听
sendButton.addEventListener('click', sendMessage);

// 按下回车键发送消息
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});