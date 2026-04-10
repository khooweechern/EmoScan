<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// 结果数据
const results = ref({
  dimensions: {
    A: {
      name: '情绪稳定性',
      percentage: 0
    },
    B: {
      name: '压力知觉',
      percentage: 0
    },
    C: {
      name: '精神内耗',
      percentage: 0
    },
    D: {
      name: '社交回避',
      percentage: 0
    }
  },
  overallType: {
    title: '',
    coreFeatures: [],
    prescription: ''
  }
});

// Canvas 元素引用
const canvasRef = ref(null);
const imageUrl = ref('');

// 计算海报尺寸（9:16 比例）
const canvasWidth = 720;
const canvasHeight = 1280;

// 解析路由参数
const parseResults = () => {
  try {
    const resultsData = JSON.parse(route.query.results);
    results.value = resultsData;
  } catch (error) {
    console.error('解析结果数据失败:', error);
    // 如果解析失败，重定向到首页
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

// 绘制五边形图
const drawPentagon = (ctx, centerX, centerY, radius, percentages) => {
  const labels = ['情绪稳定性', '压力知觉', '精神内耗', '社交回避', '快乐感知'];
  const values = [
    percentages.A,
    percentages.B,
    percentages.C,
    percentages.D,
    percentages.happiness
  ];

  // 计算5个顶点的位置
  const points = [];
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2; // 从顶部开始
    const value = (values[i] || 0) / 100 * radius;
    points.push({
      x: centerX + value * Math.cos(angle),
      y: centerY + value * Math.sin(angle)
    });
  }

  // 绘制背景五边形网格
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;

  for (let level = 1; level <= 5; level++) {
    const levelRadius = (radius / 5) * level;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = centerX + levelRadius * Math.cos(angle);
      const y = centerY + levelRadius * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }

  // 绘制5条轴线
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
    ctx.stroke();
  }

  // 绘制数据填充区域
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    if (i === 0) {
      ctx.moveTo(points[i].x, points[i].y);
    } else {
      ctx.lineTo(points[i].x, points[i].y);
    }
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
  ctx.fill();
  ctx.strokeStyle = '#6366F1';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 绘制数据点
  points.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#6366F1';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // 绘制标签
  ctx.fillStyle = '#666';
  ctx.font = '14px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';

  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const labelRadius = radius + 30;
    const labelX = centerX + labelRadius * Math.cos(angle);
    const labelY = centerY + labelRadius * Math.sin(angle);

    ctx.fillText(labels[i], labelX, labelY);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(values[i] + '%', labelX, labelY + 18);
    ctx.fillStyle = '#666';
    ctx.font = '14px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  }
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
  ctx.fillText('当代青年情绪体质报告单', canvasWidth / 2, 100);

  // 绘制体质名称
  ctx.fillStyle = '#333';
  ctx.font = 'bold 42px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(results.value.overallType.title, canvasWidth / 2, 160);

  // 计算快乐感知指数
  const happinessPercentage = Math.max(0, Math.min(100, Math.round(
    100 - (results.value.dimensions.A.percentage +
      results.value.dimensions.B.percentage +
      results.value.dimensions.C.percentage) / 3
  )));

  // 绘制五边形图
  const pentagonCenterX = canvasWidth / 2;
  const pentagonCenterY = 460;
  const pentagonRadius = 150;
  const percentages = {
    A: results.value.dimensions.A.percentage,
    B: results.value.dimensions.B.percentage,
    C: results.value.dimensions.C.percentage,
    D: results.value.dimensions.D.percentage,
    happiness: happinessPercentage
  };
  drawPentagon(ctx, pentagonCenterX, pentagonCenterY, pentagonRadius, percentages);

  // 绘制核心特点标题
  ctx.fillStyle = '#666';
  ctx.font = 'bold 24px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('核心特点', canvasWidth / 2, 700);

  // 绘制核心特点列表
  ctx.fillStyle = '#333';
  ctx.font = '20px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'left';

  const features = results.value.overallType.coreFeatures;
  const featuresStartY = 750;
  const lineHeight = 50;

  features.forEach((feature, index) => {
    // 绘制圆点
    ctx.beginPath();
    ctx.arc(100, featuresStartY + index * lineHeight, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#6366F1';
    ctx.fill();

    // 绘制文字（自动换行）
    ctx.fillStyle = '#333';
    const featureLines = wrapText(ctx, feature, 500);
    featureLines.forEach((line, lineIndex) => {
      ctx.fillText(line, 130, featuresStartY + index * lineHeight + 6 + lineIndex * 26);
    });
  });

  // 绘制情绪处方标题
  ctx.fillStyle = '#666';
  ctx.font = 'bold 24px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('情绪处方', canvasWidth / 2, 950);

  // 绘制情绪处方内容（自动换行）
  ctx.fillStyle = '#6366F1';
  ctx.font = 'bold 22px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  const prescriptionLines = wrapText(ctx, results.value.overallType.prescription, 520);
  prescriptionLines.forEach((line, index) => {
    ctx.fillText(line, canvasWidth / 2, 990 + index * 32);
  });

  // 绘制免责声明
  ctx.fillStyle = '#999';
  ctx.font = '16px "PingFang SC", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('本测试为情绪状态评估，非医疗诊断', canvasWidth / 2, 1230);

  // 生成图片URL
  imageUrl.value = canvas.toDataURL('image/png');
};

// 下载海报
const downloadPoster = () => {
  if (!imageUrl.value) return;

  const link = document.createElement('a');
  link.href = imageUrl.value;
  link.download = '情绪体质报告单.png';
  link.click();
};

// 返回结果页
const goBack = () => {
  router.push('/result');
};

onMounted(() => {
  parseResults();
  setTimeout(generatePoster, 100);
});
</script>

<template>
  <div class="share-poster-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">分享海报</h1>
      <button class="back-button" @click="goBack">返回</button>
    </div>

    <!-- 海报预览 -->
    <div class="poster-preview">
      <canvas ref="canvasRef" class="poster-canvas" v-show="false"></canvas>
      <img v-if="imageUrl" :src="imageUrl" class="poster-image" alt="情绪体质报告单" />
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button class="action-button download-button" @click="downloadPoster">保存海报</button>
      <button class="action-button share-button">分享到朋友圈</button>
    </div>
  </div>
</template>

<style scoped>
.share-poster-page {
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 页面标题 */
.page-header {
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.back-button {
  background: none;
  border: none;
  font-size: 1rem;
  color: #6366F1;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #f3f4ff;
}

/* 海报预览 */
.poster-preview {
  width: 100%;
  max-width: 360px;
  margin-bottom: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
  background-color: white;
}

.poster-canvas {
  width: 100%;
  display: block;
}

.poster-image {
  width: 100%;
  display: block;
}

/* 操作按钮 */
.action-buttons {
  width: 100%;
  max-width: 400px;
  display: flex;
  gap: 20px;
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
  background-color: #6366F1;
  color: white;
}

.download-button:hover {
  background-color: #4f46e5;
  transform: translateY(-2px);
}

.share-button {
  background-color: white;
  color: #6366F1;
  border: 2px solid #6366F1;
}

.share-button:hover {
  background-color: #f3f4ff;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .share-poster-page {
    padding: 10px;
  }

  .page-header {
    margin-bottom: 20px;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .poster-preview {
    margin-bottom: 30px;
  }

  .action-button {
    padding: 14px;
    font-size: 0.9rem;
  }
}
</style>