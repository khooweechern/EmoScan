<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// 定义开始测试按钮的点击效果
const handleStartTest = () => {
  // 跳转到答题页
  router.push('/answer');
};
</script>

<template>
  <div class="home-page">
    <!-- 顶部标题区 -->
    <div class="header-section">
      <h1 class="main-title">当代青年情绪体质报告单</h1>
      <p class="sub-title">一份科学又扎心的情绪体检</p>
    </div>

    <!-- 氛围插图区 -->
    <div class="illustration-section">
      <div class="illustration-container">
        <!-- 云朵 -->
        <svg class="cloud" width="80" height="40" viewBox="0 0 80 40">
          <path d="M10,25 Q20,15 30,25 Q35,10 45,25 Q55,15 65,25 Q70,20 80,25" fill="none" stroke="#9ca3af"
            stroke-width="2" />
        </svg>

        <!-- 心电图 -->
        <svg class="ecg" width="100" height="40" viewBox="0 0 100 40">
          <path d="M0,20 L20,20 L25,5 L30,35 L35,20 L40,20 L45,10 L50,30 L55,20 L100,20" fill="none" stroke="#6366F1"
            stroke-width="2" />
        </svg>

        <!-- 放松线条 -->
        <svg class="relax" width="120" height="40" viewBox="0 0 120 40">
          <path d="M0,20 Q30,5 60,20 Q90,35 120,20" fill="none" stroke="#9ca3af" stroke-width="2" />
        </svg>
      </div>
    </div>

    <!-- 开始测试按钮 -->
    <div class="button-section">
      <button class="start-button" @click="handleStartTest">开始体检</button>
    </div>

    <!-- 底部免责小字 -->
    <div class="disclaimer-section">
      <p class="disclaimer-text">本测试为情绪状态评估，非医疗诊断</p>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 40px;
}

/* 顶部标题区 */
.header-section {
  text-align: center;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.sub-title {
  font-size: 1rem;
  color: #9ca3af;
  margin: 0;
}

/* 氛围插图区 */
.illustration-section {
  width: 100%;
  max-width: 400px;
}

.illustration-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.cloud,
.ecg,
.relax {
  opacity: 0.8;
}

/* 开始测试按钮 */
.button-section {
  margin: 20px 0;
}

.start-button {
  background-color: #6366F1;
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  padding: 15px 40px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
}

.start-button:hover {
  box-shadow: 0 6px 8px rgba(99, 102, 241, 0.4);
}

.start-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

/* 底部免责小字 */
.disclaimer-section {
  margin-top: 20px;
}

.disclaimer-text {
  font-size: 0.8rem;
  color: #9ca3af;
  text-align: center;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }

  .illustration-container {
    gap: 15px;
  }

  .start-button {
    font-size: 1.1rem;
    padding: 12px 35px;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 1.8rem;
  }

  .sub-title {
    font-size: 0.9rem;
  }

  .start-button {
    font-size: 1rem;
    padding: 10px 30px;
  }

  .disclaimer-text {
    font-size: 0.7rem;
  }
}
</style>