<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 题目数据
const questions = ref([
  // A 情绪稳定性（大五人格・神经质）
  {
    id: 1,
    dimension: 'A',
    dimensionName: '情绪稳定性（大五人格・神经质）',
    content: '计划突然被打乱时，我很容易一下子慌掉'
  },
  {
    id: 2,
    dimension: 'A',
    dimensionName: '情绪稳定性（大五人格・神经质）',
    content: '一点小事就能明显影响我一整天的心情'
  },
  {
    id: 3,
    dimension: 'A',
    dimensionName: '情绪稳定性（大五人格・神经质）',
    content: '被人冷落或敷衍时，会低落、难受很久'
  },
  {
    id: 4,
    dimension: 'A',
    dimensionName: '情绪稳定性（大五人格・神经质）',
    content: '经常没来由地烦躁、提不起精神'
  },
  {
    id: 5,
    dimension: 'A',
    dimensionName: '情绪稳定性（大五人格・神经质）',
    content: '情绪上来以后，很难快速冷静下来'
  },
  // B 压力知觉水平（PSS 量表简化）
  {
    id: 6,
    dimension: 'B',
    dimensionName: '压力知觉水平（PSS 量表简化）',
    content: '最近总觉得事情堆在一起，喘不过气'
  },
  {
    id: 7,
    dimension: 'B',
    dimensionName: '压力知觉水平（PSS 量表简化）',
    content: '感觉自己被生活推着走，很难掌控节奏'
  },
  {
    id: 8,
    dimension: 'B',
    dimensionName: '压力知觉水平（PSS 量表简化）',
    content: '经常莫名担心会出问题、会搞砸'
  },
  {
    id: 9,
    dimension: 'B',
    dimensionName: '压力知觉水平（PSS 量表简化）',
    content: '遇到一点小麻烦就觉得 "好累好难"'
  },
  {
    id: 10,
    dimension: 'B',
    dimensionName: '压力知觉水平（PSS 量表简化）',
    content: '很难真正放松，心里总悬着点什么'
  },
  // C 精神内耗（反刍思维 RRS）
  {
    id: 11,
    dimension: 'C',
    dimensionName: '精神内耗（反刍思维 RRS）',
    content: '不开心的事过去很久，我还是会反复回想'
  },
  {
    id: 12,
    dimension: 'C',
    dimensionName: '精神内耗（反刍思维 RRS）',
    content: '别人随口一句话，我会在心里琢磨半天'
  },
  {
    id: 13,
    dimension: 'C',
    dimensionName: '精神内耗（反刍思维 RRS）',
    content: '躺在床上容易胡思乱想，越想越睡不着'
  },
  {
    id: 14,
    dimension: 'C',
    dimensionName: '精神内耗（反刍思维 RRS）',
    content: '犯一点小错，就会自责、纠结很久'
  },
  {
    id: 15,
    dimension: 'C',
    dimensionName: '精神内耗（反刍思维 RRS）',
    content: '遇到问题容易钻牛角尖，很难走出来'
  },
  // D 社交回避倾向（SAD 社交回避量表）
  {
    id: 16,
    dimension: 'D',
    dimensionName: '社交回避倾向（SAD 社交回避量表）',
    content: '社交对我来说更像耗能，而不是开心'
  },
  {
    id: 17,
    dimension: 'D',
    dimensionName: '社交回避倾向（SAD 社交回避量表）',
    content: '能线上说清楚的事，我尽量不线下见面'
  },
  {
    id: 18,
    dimension: 'D',
    dimensionName: '社交回避倾向（SAD 社交回避量表）',
    content: '突然的邀约，我第一反应是想拒绝'
  },
  {
    id: 19,
    dimension: 'D',
    dimensionName: '社交回避倾向（SAD 社交回避量表）',
    content: '在人多的场合，会下意识降低存在感'
  },
  {
    id: 20,
    dimension: 'D',
    dimensionName: '社交回避倾向（SAD 社交回避量表）',
    content: '周末更想一个人待着，而不是出门聚会'
  }
]);

// 选项数据
const options = [
  { value: 1, label: '完全不符合' },
  { value: 2, label: '不太符合' },
  { value: 3, label: '一般' },
  { value: 4, label: '比较符合' },
  { value: 5, label: '完全符合' }
];

// 当前题目索引
const currentQuestionIndex = ref(0);
// 答案存储
const answers = ref({});

// 计算当前题目
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value];
});

// 计算进度百分比
const progressPercentage = computed(() => {
  const answeredCount = Object.keys(answers.value).length;
  return (answeredCount / questions.value.length) * 100;
});

// 计算当前题目序号
const currentQuestionNumber = computed(() => {
  return currentQuestionIndex.value + 1;
});

// 总题目数
const totalQuestions = computed(() => {
  return questions.value.length;
});

// 处理选项点击
const handleOptionClick = (value) => {
  // 保存答案
  answers.value[currentQuestion.value.id] = value;

  // 自动跳转到下一题
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
  } else {
    // 完成所有题目，跳转到结果页并传递答案
    router.push({
      path: '/result',
      query: { answers: JSON.stringify(answers.value) }
    });
  }
};

// 上一题
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

// 下一题
const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
  }
};

// 检查选项是否被选中
const isOptionSelected = (value) => {
  return answers.value[currentQuestion.value.id] === value;
};
</script>

<template>
  <div class="answer-page">
    <!-- 顶部进度条 -->
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="progress-text">
        {{ currentQuestionNumber }} / {{ totalQuestions }}
      </div>
    </div>

    <!-- 题目卡片 -->
    <div class="question-card">
      <div class="dimension-tag">{{ currentQuestion.dimension }} {{ currentQuestion.dimensionName }}</div>
      <h2 class="question-content">{{ currentQuestion.content }}</h2>
    </div>

    <!-- 选项按钮组 -->
    <div class="options-section">
      <button v-for="option in options" :key="option.value" class="option-button"
        :class="{ 'selected': isOptionSelected(option.value) }" @click="handleOptionClick(option.value)">
        {{ option.label }}
      </button>
    </div>

    <!-- 底部操作区 -->
    <div class="bottom-section">
      <button class="nav-button prev-button" @click="prevQuestion" :disabled="currentQuestionIndex === 0">
        上一题
      </button>
      <button class="nav-button next-button" @click="nextQuestion"
        :disabled="currentQuestionIndex === questions.length - 1">
        下一题
      </button>
    </div>
  </div>
</template>

<style scoped>
.answer-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 30px;
  background-color: #f9fafb;
}

/* 顶部进度条 */
.progress-section {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f9fafb;
  padding-bottom: 10px;
}

.progress-bar {
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background-color: #6366F1;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #6b7280;
  text-align: right;
}

/* 题目卡片 */
.question-card {
  background-color: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.dimension-tag {
  font-size: 0.9rem;
  color: #6366F1;
  font-weight: 500;
  background-color: #f3f4ff;
  padding: 6px 12px;
  border-radius: 16px;
  align-self: center;
}

.question-content {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #333;
  text-align: center;
  margin: 0;
  max-width: 80%;
}

/* 选项按钮组 */
.options-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
}

.option-button {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 15px 20px;
  font-size: 1rem;
  color: #333;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-button:hover {
  border-color: #6366F1;
  background-color: #f3f4ff;
}

.option-button.selected {
  background-color: #6366F1;
  color: white;
  border-color: #6366F1;
}

.option-button:active {
  transform: translateY(1px);
}

/* 底部操作区 */
.bottom-section {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.nav-button {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.9rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button:hover:not(:disabled) {
  border-color: #6366F1;
  color: #6366F1;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .answer-page {
    padding: 15px;
  }

  .question-card {
    padding: 20px;
  }

  .question-content {
    font-size: 1.1rem;
  }

  .option-button {
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .question-card {
    padding: 16px;
  }

  .question-content {
    font-size: 1rem;
  }

  .option-button {
    padding: 10px 14px;
    font-size: 0.9rem;
  }

  .nav-button {
    padding: 8px 16px;
    font-size: 0.8rem;
  }
}
</style>