/**
 * 降噪 AI广播编辑器 - 主逻辑脚本
 * 实现功能：
 * 1. 主题切换
 * 2. 系统提示词的保存和加载
 * 3. 文本生成
 * 4. 语音合成
 * 5. 用户界面交互
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化变量
    let audioBlob = null; // 存储音频数据
    const defaultPrompt = document.getElementById('systemPrompt').value; // 默认系统提示词
    
    // 初始化UI元素
    initUI();
    
    // 加载保存的系统提示词
    loadSavedPrompt();
    
    // 初始化事件监听器
    initEventListeners();
    
    /**
     * 初始化UI元素
     */
    function initUI() {
        // 设置主题
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.add(`theme-${savedTheme}`);
        updateThemeIcon(savedTheme);
        
        // 隐藏加载动画
        document.getElementById('loadingSpinner').style.display = 'none';
        
        // 初始化滑块值显示
        updateRangeValues();
    }
    
    /**
     * 初始化事件监听器
     */
    function initEventListeners() {
        // 主题切换
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);
        
        // 系统提示词折叠/展开
        document.getElementById('promptHeader').addEventListener('click', togglePromptCollapse);
        
        // 系统提示词保存
        document.getElementById('savePrompt').addEventListener('click', savePrompt);
        
        // 恢复默认提示词
        document.getElementById('resetPrompt').addEventListener('click', resetPrompt);
        
        // 清空原始文本
        document.getElementById('clearOriginal').addEventListener('click', clearOriginalText);
        
        // 生成广播稿
        document.getElementById('generateBtn').addEventListener('click', generateBroadcast);
        
        // 复制生成的文本
        document.getElementById('copyGenerated').addEventListener('click', copyGeneratedText);
        
        // 合成语音
        document.getElementById('synthesizeBtn').addEventListener('click', synthesizeSpeech);
        
        // 下载MP3
        document.getElementById('downloadBtn').addEventListener('click', downloadAudio);
        
        // 监听滑块变化
        document.getElementById('speedRange').addEventListener('input', updateRangeValue);
        document.getElementById('volumeRange').addEventListener('input', updateRangeValue);
        document.getElementById('pitchRange').addEventListener('input', updateRangeValue);
        
        // 监听文本变化，启用/禁用按钮
        document.getElementById('generatedText').addEventListener('input', updateButtonStates);
        document.getElementById('originalText').addEventListener('input', updateButtonStates);
    }
    
    /**
     * 切换主题（亮色/暗色）
     */
    function toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('theme-dark');
        const newTheme = isDark ? 'light' : 'dark';
        
        // 移除当前主题
        body.classList.remove(isDark ? 'theme-dark' : 'theme-light');
        // 添加新主题
        body.classList.add(`theme-${newTheme}`);
        
        // 更新图标
        updateThemeIcon(newTheme);
        
        // 保存主题设置
        localStorage.setItem('theme', newTheme);
    }
    
    /**
     * 更新主题图标
     * @param {string} theme - 当前主题（'light'或'dark'）
     */
    function updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
    
    /**
     * 切换系统提示词区域的折叠/展开状态
     */
    function togglePromptCollapse() {
        const content = document.getElementById('promptContent');
        const icon = document.getElementById('promptIcon');
        
        content.classList.toggle('open');
        icon.classList.toggle('open');
    }
    
    /**
     * 保存系统提示词到localStorage
     */
    function savePrompt() {
        const promptText = document.getElementById('systemPrompt').value;
        localStorage.setItem('systemPrompt', promptText);
        
        // 显示保存成功提示
        showToast('系统提示词已保存');
    }
    
    /**
     * 从localStorage加载保存的系统提示词
     */
    function loadSavedPrompt() {
        const savedPrompt = localStorage.getItem('systemPrompt');
        if (savedPrompt) {
            document.getElementById('systemPrompt').value = savedPrompt;
        }
    }
    
    /**
     * 恢复默认系统提示词
     */
    function resetPrompt() {
        document.getElementById('systemPrompt').value = defaultPrompt;
        localStorage.removeItem('systemPrompt');
        
        // 显示重置成功提示
        showToast('已恢复默认提示词');
    }
    
    /**
     * 清空原始文本输入区
     */
    function clearOriginalText() {
        document.getElementById('originalText').value = '';
        updateButtonStates();
    }
    
    /**
     * 生成广播稿
     */
    async function generateBroadcast() {
        const originalText = document.getElementById('originalText').value.trim();
        const systemPrompt = document.getElementById('systemPrompt').value.trim();
        
        // 验证输入
        if (!originalText) {
            showToast('请输入原始文案', 'error');
            return;
        }
        
        // 显示加载动画
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'flex';
        
        // 禁用生成按钮
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.disabled = true;
        
        try {
            // 准备请求数据
            const promptWithInput = systemPrompt.replace('{{input}}', originalText);
            
            // 模拟API请求（实际项目中应替换为真实API调用）
            // 注意：这里使用setTimeout模拟异步请求，实际项目中应使用fetch或axios等工具
            setTimeout(() => {
                // 模拟API响应
                const simulatedResponse = simulateAIResponse(originalText);
                
                // 显示生成的文本
                document.getElementById('generatedText').value = simulatedResponse;
                
                // 隐藏加载动画
                loadingSpinner.style.display = 'none';
                
                // 启用按钮
                generateBtn.disabled = false;
                document.getElementById('copyGenerated').disabled = false;
                document.getElementById('synthesizeBtn').disabled = false;
                
                // 显示成功提示
                showToast('广播稿生成成功');
            }, 2000); // 模拟2秒的处理时间
            
            // 实际API调用代码（注释掉，仅供参考）
            /*
            const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer YOUR_API_KEY',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'MiniMax-Text-01',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: originalText
                        }
                    ]
                })
            });
            
            const data = await response.json();
            
            if (data.choices && data.choices.length > 0) {
                const generatedText = data.choices[0].message.content;
                document.getElementById('generatedText').value = generatedText;
            } else {
                throw new Error('API返回数据格式错误');
            }
            */
            
        } catch (error) {
            // 处理错误
            console.error('生成广播稿时出错:', error);
            showToast('生成失败: ' + error.message, 'error');
            
            // 隐藏加载动画
            loadingSpinner.style.display = 'none';
            
            // 重新启用生成按钮
            generateBtn.disabled = false;
        }
    }
    
    /**
     * 模拟AI响应（仅用于演示）
     * @param {string} originalText - 原始文本
     * @returns {string} - 模拟的AI生成文本
     */
    function simulateAIResponse(originalText) {
        // 这只是一个简单的模拟，实际项目中应替换为真实API调用
        const intro = "大家好，我是AI产品黄叔！今天又有一大波AI新鲜资讯来袭，让我用大白话给各位小伙伴们讲清楚这些高深的技术。\n\n";
        
        // 简单处理原始文本，将其分段并添加口语化表达
        const paragraphs = originalText.split('\n\n').filter(p => p.trim().length > 0);
        let result = intro;
        
        paragraphs.forEach((paragraph, index) => {
            // 添加一些口语化表达和转场语
            const transitions = [
                "接下来，",
                "说到这个呢，",
                "嗯，还有个有意思的消息，",
                "那么，",
                "另外，大家肯定想知道，"
            ];
            
            // 随机选择转场语
            const transition = index > 0 ? transitions[Math.floor(Math.random() * transitions.length)] : "";
            
            // 简化段落（实际项目中应使用更复杂的算法）
            let simplified = paragraph;
            if (simplified.length > 100) {
                simplified = simplified.substring(0, 97) + '...';
            }
            
            // 添加一些口语化表达
            simplified = transition + simplified.replace(/技术/g, "黑科技").replace(/人工智能/g, "AI");
            
            result += simplified + "\n\n";
        });
        
        result += "好啦，今天的AI资讯就分享到这里。我是AI产品黄叔，咱们下期再见！";
        
        return result;
    }
    
    /**
     * 复制生成的文本到剪贴板
     */
    function copyGeneratedText() {
        const generatedText = document.getElementById('generatedText');
        generatedText.select();
        document.execCommand('copy');
        
        // 显示复制成功提示
        showToast('已复制到剪贴板');
    }
    
    /**
     * 合成语音
     */
    async function synthesizeSpeech() {
        const text = document.getElementById('generatedText').value.trim();
        
        // 验证输入
        if (!text) {
            showToast('请先生成广播稿', 'error');
            return;
        }
        
        // 获取语音参数
        const speed = parseFloat(document.getElementById('speedRange').value);
        const volume = parseFloat(document.getElementById('volumeRange').value);
        const pitch = parseFloat(document.getElementById('pitchRange').value);
        const emotion = document.getElementById('emotionSelect').value;
        
        // 显示加载提示
        showToast('正在合成语音...', 'info');
        
        try {
            // 模拟API请求（实际项目中应替换为真实API调用）
            // 这里使用setTimeout模拟异步请求
            setTimeout(() => {
                // 模拟获取音频数据
                // 实际项目中，这里应该是从API获取的二进制音频数据
                // 这里我们使用一个示例音频URL
                const audioUrl = 'https://file-examples.com/storage/fe8c7eef0c6364f6898b1d3/2017/11/file_example_MP3_700KB.mp3';
                
                // 设置音频播放器
                const audioPlayer = document.getElementById('audioPlayer');
                audioPlayer.src = audioUrl;
                
                // 启用下载按钮
                document.getElementById('downloadBtn').disabled = false;
                
                // 显示成功提示
                showToast('语音合成成功');
            }, 2000); // 模拟2秒的处理时间
            
            // 实际API调用代码（注释掉，仅供参考）
            /*
            const response = await fetch('https://api.minimax.chat/v1/t2a_v2', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer YOUR_API_KEY',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'speech-01-turbo',
                    text: text,
                    stream: false,
                    voice_setting: {
                        voice_id: 'superhuangclone',
                        speed: speed,
                        vol: volume,
                        pitch: pitch,
                        emotion: emotion
                    },
                    audio_setting: {
                        sample_rate: 32000,
                        bitrate: 128000,
                        format: 'mp3',
                        channel: 1
                    }
                })
            });
            
            // 检查响应
            if (!response.ok) {
                throw new Error('语音合成API请求失败');
            }
            
            // 获取二进制音频数据
            const audioData = await response.arrayBuffer();
            audioBlob = new Blob([audioData], { type: 'audio/mp3' });
            
            // 创建音频URL并设置到播放器
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = audioUrl;
            
            // 启用下载按钮
            document.getElementById('downloadBtn').disabled = false;
            */
            
        } catch (error) {
            // 处理错误
            console.error('语音合成时出错:', error);
            showToast('语音合成失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 下载合成的音频
     */
    function downloadAudio() {
        // 实际项目中，应使用之前保存的audioBlob
        // 这里使用示例音频URL进行模拟
        const audioUrl = document.getElementById('audioPlayer').src;
        
        // 创建一个临时链接元素
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = '降噪广播_' + new Date().toISOString().slice(0, 10) + '.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    /**
     * 更新滑块值显示
     */
    function updateRangeValues() {
        document.getElementById('speedValue').textContent = document.getElementById('speedRange').value;
        document.getElementById('volumeValue').textContent = document.getElementById('volumeRange').value;
        document.getElementById('pitchValue').textContent = document.getElementById('pitchRange').value;
    }
    
    /**
     * 更新单个滑块值显示
     * @param {Event} event - 输入事件
     */
    function updateRangeValue(event) {
        const slider = event.target;
        const valueId = slider.id.replace('Range', 'Value');
        document.getElementById(valueId).textContent = slider.value;
    }
    
    /**
     * 更新按钮状态
     */
    function updateButtonStates() {
        const originalText = document.getElementById('originalText').value.trim();
        const generatedText = document.getElementById('generatedText').value.trim();
        
        // 生成按钮状态
        document.getElementById('generateBtn').disabled = !originalText;
        
        // 复制按钮状态
        document.getElementById('copyGenerated').disabled = !generatedText;
        
        // 合成语音按钮状态
        document.getElementById('synthesizeBtn').disabled = !generatedText;
    }
    
    /**
     * 显示提示消息
     * @param {string} message - 提示消息
     * @param {string} type - 提示类型（'success', 'error', 'info'）
     */
    function showToast(message, type = 'success') {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // 添加到页面
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
});

// 添加toast样式
const style = document.createElement('style');
style.textContent = `
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 9999;
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast.show {
    opacity: 1;
    transform: translateY(0);
}

.toast-success {
    background-color: var(--success-color);
}

.toast-error {
    background-color: var(--danger-color);
}

.toast-info {
    background-color: var(--info-color);
}

.loading-spinner {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(3px);
    border-radius: 8px;
    z-index: 10;
}
`;
document.head.appendChild(style);