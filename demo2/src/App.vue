<template>
  <div class="container">
    <h1>图片字幕生成器</h1>
    <div class="controls">
      <div class="input-group">
        <input type="file" accept="image/*" @change="handleImageUpload" />
      </div>
      <div class="input-group">
        <label>字幕高度(px):</label>
        <input type="number" v-model="subtitleHeight" min="20" max="100" />
      </div>
      <div class="input-group">
        <label>字体大小(px):</label>
        <input type="number" v-model="fontSize" min="12" max="50" />
      </div>
      <div class="input-group">
        <label>字体颜色:</label>
        <input type="color" v-model="fontColor" />
      </div>
      <div class="input-group">
        <label>轮廓颜色:</label>
        <input type="color" v-model="outlineColor" />
      </div>
      <div class="input-group">
        <textarea
          v-model="subtitleText"
          placeholder="请输入字幕文本，每行将生成一个字幕"
          rows="4"
        ></textarea>
      </div>
    </div>
    
    <div class="preview" v-if="imageUrl">
      <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>
    
    <div class="actions">
      <button @click="generateImage" :disabled="!imageUrl">生成字幕图片</button>
      <button @click="saveImage" :disabled="!imageUrl">保存图片</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const canvas = ref(null)
const imageUrl = ref('')
const canvasWidth = ref(0)
const canvasHeight = ref(0)
const subtitleHeight = ref(40)
const fontSize = ref(20)
const fontColor = ref('#FFFFFF')
const outlineColor = ref('#000000')
const subtitleText = ref('')

let originalImage = null

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target.result
      const img = new Image()
      img.onload = () => {
        originalImage = img
        canvasWidth.value = img.width
        canvasHeight.value = img.height
        drawImage()
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const drawImage = () => {
  if (!canvas.value || !originalImage) return
  
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 绘制原始图片
  ctx.drawImage(originalImage, 0, 0)
  
  // 绘制字幕
  const lines = subtitleText.value.split('\n').filter(line => line.trim())
  const totalHeight = lines.length * subtitleHeight.value
  
  // 获取第一行字幕位置的背景图片
  const firstLineY = canvasHeight.value - totalHeight
  const backgroundImage = ctx.getImageData(0, firstLineY, canvasWidth.value, subtitleHeight.value)
  
  lines.forEach((line, index) => {
    const y = canvasHeight.value - totalHeight + index * subtitleHeight.value
    
    // 使用第一行字幕位置的背景图片
    ctx.putImageData(backgroundImage, 0, y)
    
    // 绘制半透明黑色背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, y, canvasWidth.value, subtitleHeight.value)
    
    // 绘制文字
    ctx.font = `${fontSize.value}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 绘制文字轮廓
    ctx.strokeStyle = outlineColor.value
    ctx.lineWidth = 2
    ctx.strokeText(line, canvasWidth.value / 2, y + subtitleHeight.value / 2)
    
    // 绘制文字填充
    ctx.fillStyle = fontColor.value
    ctx.fillText(line, canvasWidth.value / 2, y + subtitleHeight.value / 2)
    
    // 绘制分割线（除了最后一行）
    if (index < lines.length - 1) {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 1
      ctx.moveTo(0, y + subtitleHeight.value)
      ctx.lineTo(canvasWidth.value, y + subtitleHeight.value)
      ctx.stroke()
    }
  })
}

const generateImage = () => {
  drawImage()
}

const saveImage = () => {
  if (!canvas.value) return
  const link = document.createElement('a')
  link.download = 'subtitle-image.png'
  link.href = canvas.value.toDataURL('image/png')
  link.click()
}

watch(
  [subtitleHeight, fontSize, fontColor, outlineColor, subtitleText],
  () => {
    if (imageUrl.value) {
      drawImage()
    }
  },
  { deep: true }
)
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

h1 {
  text-align: center;
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: 600;
}

.controls {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95rem;
}

.input-group input[type="number"],
.input-group input[type="color"] {
  width: 120px;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.input-group input[type="file"] {
  padding: 10px;
  background: #f5f7fa;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.input-group input[type="file"]:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.input-group textarea {
  width: 100%;
  resize: vertical;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.preview {
  margin: 20px 0;
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.preview canvas {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 2rem;
}

button {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.4);
  background: linear-gradient(135deg, #45a049 0%, #388e3c 100%);
}

button:disabled {
  background: linear-gradient(135deg, #cccccc 0%, #999999 100%);
  cursor: not-allowed;
  box-shadow: none;
}
</style>