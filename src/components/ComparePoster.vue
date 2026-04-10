<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// 结果数据
const myResults = ref({
  dimensions: {
    A: { name: '情绪稳定性', percentage: 0 },
    B: { name: '压力知觉', percentage: 0 },
    C: { name: '精神内耗', percentage: 0 },
    D: { name: '社交回避', percentage: 0 }
  },
  overallType: {
    title: '',
    coreFeatures: []
  }
});

const partnerResults = ref({
  dimensions: {
    A: { name: '情绪稳定性', percentage: 0 },
    B: { name: '压力知觉', percentage: 0 },
    C: { name: '精神内耗', percentage: 0 },
    D: { name: '社交回避', percentage: 0 }
  },
  overallType: {
    title: '',
    coreFeatures: []
  }
});

const compatibilityScore = ref(0);
const compatibilityInterpretation = ref('');
const compatibilitySuggestions = ref([]);
const compatibilityPrescription = ref('');

// Canvas 元素引用
const canvasRef = ref(null);
const imageUrl = ref('');

// 计算海报尺寸（9:16 比例）
const canvasWidth = 720;
const canvasHeight = 1280;

// 解析路由参数
const parseResults = () => {
  try {
    myResults.value = JSON.parse(route.query.myResults);
    partnerResults.value = JSON.parse(route.query.partnerResults);
    compatibilityScore.value = parseInt(route.query.compatibilityScore);
    compatibilityInterpretation.value = route.query.compatibilityInterpretation;
    compatibilitySuggestions.value = JSON.parse(route.query.compatibilitySuggestions);
    compatibilityPrescription.value = route.query.compatibilityPrescription;
  } catch (error) {
    console.error('解析结果数据失败:', error);
    router.push('/');
  }
};

// 自动换行函数
const wrapText = (ctx, text, maxWidth) => {
  const words = text.split('');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i];
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
};

// 生成海报
const generatePoster = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // 设置画布尺寸
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 绘制背景
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 绘制产品名称
  ctx.fillStyle = '#6366F1';
  ctx.font = 'bold 36px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('双人情绪合拍报告', canvasWidth / 2, 80);

  // 绘制合拍度
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 48px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`合拍度 ${compatibilityScore.value}%`, canvasWidth / 2, 140);

  // 绘制我的体质标题
  ctx.fillStyle = '#6366F1';
  ctx.font = 'bold 24px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('我的体质', 60, 200);

  // 绘制我的体质名称
  ctx.fillStyle = '#333';
  ctx.font = 'bold 28px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(myResults.value.overallType.title, 60, 240);

  // 绘制我的核心特点
  ctx.fillStyle = '#666';
  ctx.font = '18px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  const myFeatures = myResults.value.overallType.coreFeatures;
  myFeatures.forEach((feature, index) => {
    ctx.fillText(`• ${feature}`, 60, 270 + index * 28);
  });

  // 绘制TA的体质标题
  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 24px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TA的体质', 60, 410);

  // 绘制TA的体质名称
  ctx.fillStyle = '#333';
  ctx.font = 'bold 28px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(partnerResults.value.overallType.title, 60, 450);

  // 绘制TA的核心特点
  ctx.fillStyle = '#666';
  ctx.font = '18px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  const partnerFeatures = partnerResults.value.overallType.coreFeatures;
  partnerFeatures.forEach((feature, index) => {
    ctx.fillText(`• ${feature}`, 60, 480 + index * 28);
  });

  // 绘制情绪指数对比标题
  ctx.fillStyle = '#666';
  ctx.font = 'bold 24px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('情绪指数对比', canvasWidth / 2, 620);

  // 绘制情绪指数对比
  const dimensions = ['A', 'B', 'C', 'D'];
  const dimNames = ['情绪稳定性', '压力知觉', '精神内耗', '社交回避'];
  const barStartY = 660;
  const barHeight = 30;
  const barGap = 20;

  dimensions.forEach((dim, index) => {
    const y = barStartY + index * (barHeight + barGap);

    // 绘制标签
    ctx.fillStyle = '#333';
    ctx.font = '16px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(dimNames[index], 60, y + 20);

    // 绘制我的条形图
    const myPercentage = myResults.value.dimensions[dim].percentage;
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(180, y, (myPercentage / 100) * 200, barHeight);
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText(`${myPercentage}%`, 390, y + 20);

    // 绘制TA的条形图
    const partnerPercentage = partnerResults.value.dimensions[dim].percentage;
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(440, y, (partnerPercentage / 100) * 200, barHeight);
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText(`${partnerPercentage}%`, 650, y + 20);
  });

  // 绘制AI解读标题
  ctx.fillStyle = '#666';
  ctx.font = 'bold 24px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AI 解读', canvasWidth / 2, 880);

  // 绘制AI解读内容（自动换行）
  ctx.fillStyle = '#333';
  ctx.font = '18px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'left';
  const interpretationLines = wrapText(ctx, compatibilityInterpretation.value, 600);
  interpretationLines.forEach((line, index) => {
    ctx.fillText(line, 60, 920 + index * 26);
  });

  // 绘制相处建议标题
  ctx.fillStyle = '#666';
  ctx.font = 'bold 24px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('相处建议', canvasWidth / 2, 1020);

  // 绘制相处建议列表
  ctx.fillStyle = '#333';
  ctx.font = '18px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'left';
  compatibilitySuggestions.value.forEach((suggestion, index) => {
    ctx.fillText(`${index + 1}. ${suggestion}`, 60, 1060 + index * 28);
  });

  // 绘制双人情绪处方标题
  ctx.fillStyle = '#666';
  ctx.font = 'bold 24px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('双人情绪处方', canvasWidth / 2, 1160);

  // 绘制双人情绪处方内容（自动换行）
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 20px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  const prescriptionLines = wrapText(ctx, compatibilityPrescription.value, 600);
  prescriptionLines.forEach((line, index) => {
    ctx.fillText(line, canvasWidth / 2, 1195 + index * 26);
  });

  // 生成图片URL
  imageUrl.value = canvas.toDataURL('image/png');
};

// 下载海报
const downloadPoster = () => {
  if (!imageUrl.value) return;

  const link = document.createElement('a');
  link.href = imageUrl.value;
  link.download = '双人情绪合拍报告.png';
  link.click();
};

// 返回对比页
const goBack = () => {
  router.push('/compare');
};

onMounted(() => {
  parseResults();
  setTimeout(generatePoster, 100);
});
</script>

<template>
  <div class="share-poster-page">
    <div class="poster-container">
      <canvas ref="canvasRef" style="display: none;"></canvas>
      
      <div v-if="imageUrl" class="poster-preview">
        <img :src="imageUrl" alt="双人情绪合拍报告" class="poster-image" />
      </div>
      
      <div v-else class="loading-state">
        <div class="loading-spinner"></div>
        <p>海报生成中...</p>
      </div>
    </div>
    
    <div class="action-buttons">
      <button class="action-button download-button" @click="downloadPoster">保存图片</button>
      <button class="action-button back-button" @click="goBack">返回</button>
    </div>
  </div>
</template>

<style scoped>
.share-poster-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.poster-container {
  width: 100%;
  max-width: 720px;
  margin-bottom: 20px;
}

.poster-preview {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.poster-image {
  width: 100%;
  height: auto;
  display: block;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 16px;
  color: #666;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6366F1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.action-buttons {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 720px;
}

.action-button {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.download-button {
  background-color: #10B981;
  color: white;
}

.download-button:hover {
  background-color: #059669;
  transform: translateY(-2px);
}

.back-button {
  background-color: white;
  color: #6366F1;
  border: 2px solid #6366F1;
}

.back-button:hover {
  background-color: #f3f4f6;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .share-poster-page {
    padding: 10px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}
</style>
