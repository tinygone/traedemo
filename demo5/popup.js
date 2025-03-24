// 获取DOM元素
const textInput = document.getElementById('text-input');
const generateBtn = document.getElementById('generate-btn');
const saveBtn = document.getElementById('save-btn');
const preview = document.getElementById('preview');
const errorMessage = document.getElementById('error-message');

// 创建AI总结按钮
const summarizeBtn = document.createElement('button');
summarizeBtn.id = 'summarize-btn';
summarizeBtn.textContent = 'DeepSeek R1总结';
document.querySelector('.button-group').appendChild(summarizeBtn);

// 生成图片的配置参数
const config = {
  width: 600, // 图片宽度
  padding: 50, // 内边距
  lineHeight: 1.8, // 行高
  fontSize: 28, // 字体大小
  fontFamily: '"Source Han Sans CN", "Noto Sans SC", "Microsoft YaHei", sans-serif', // 字体
  textColor: '#2c3e50', // 文字颜色
  backgroundColor: '#ffffff', // 背景颜色
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)' // 文字阴影
};

// 监听生成按钮点击事件
generateBtn.addEventListener('click', () => {
  const text = textInput.value.trim();
  
  // 验证输入
  if (!text) {
    errorMessage.style.display = 'block';
    preview.style.display = 'none';
    saveBtn.disabled = true;
    return;
  }
  
  errorMessage.style.display = 'none';
  generateImage(text);
});

// 监听保存按钮点击事件
saveBtn.addEventListener('click', () => {
  const text = textInput.value.trim();
  const fileName = `${text.slice(0, 10)}...${Date.now()}.png`;
  
  // 将图片保存到本地
  const link = document.createElement('a');
  link.download = fileName;
  link.href = preview.src;
  link.click();
});

// 生成图片
function generateImage(text) {
  // 创建Canvas元素
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 设置Canvas样式
  ctx.font = `${config.fontSize}px ${config.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = config.backgroundColor;
  
  // 计算文本换行
  const maxWidth = config.width - (config.padding * 2);
  const lines = getLines(ctx, text, maxWidth);
  
  // 计算Canvas高度
  const lineHeight = config.fontSize * config.lineHeight;
  const height = (lines.length * lineHeight) + (config.padding * 2);
  
  // 设置Canvas尺寸
  canvas.width = config.width;
  canvas.height = height;
  
  // 绘制背景
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制文本
  ctx.fillStyle = config.textColor;
  ctx.font = `${config.fontSize}px ${config.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  lines.forEach((line, index) => {
    const y = config.padding + (index * lineHeight) + config.fontSize;
    ctx.fillText(line, canvas.width / 2, y);
  });
  
  // 显示预览图片
  preview.src = canvas.toDataURL('image/png');
  preview.style.display = 'block';
  saveBtn.disabled = false;
}

// 计算文本换行
function getLines(ctx, text, maxWidth) {
  const lines = [];
  let currentLine = '';
  
  text.split('').forEach(char => {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// 监听输入框变化，重置错误提示
textInput.addEventListener('input', () => {
  if (textInput.value.trim()) {
    errorMessage.style.display = 'none';
  }
});

// 监听AI总结按钮点击事件
summarizeBtn.addEventListener('click', async () => {
  const text = textInput.value.trim();
  
  // 验证输入
  if (!text) {
    errorMessage.style.display = 'block';
    return;
  }
  
  errorMessage.style.display = 'none';
  summarizeBtn.disabled = true;
  summarizeBtn.textContent = '正在总结...';
  
  try {
    const response = await fetch('http://localhost:3000/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      throw new Error('API请求失败');
    }
    
    const data = await response.json();
    textInput.value = data.summary;
    
  } catch (error) {
    console.error('总结失败:', error);
    errorMessage.textContent = '总结失败，请重试';
    errorMessage.style.display = 'block';
  } finally {
    summarizeBtn.disabled = false;
    summarizeBtn.textContent = 'DeepSeek R1总结';
  }
});