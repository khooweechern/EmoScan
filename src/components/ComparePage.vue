<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { chat } from '../utils/bailian';

const route = useRoute();
const router = useRouter();

// 加载状态
const isLoading = ref(true);
const errorMessage = ref('');

// 结果数据
const myResults = ref({
  dimensions: {
    A: { name: '情绪稳定性', score: 0, percentage: 0, level: '', description: '' },
    B: { name: '压力知觉水平', score: 0, percentage: 0, level: '', description: '' },
    C: { name: '精神内耗', score: 0, percentage: 0, level: '', description: '' },
    D: { name: '社交回避倾向', score: 0, percentage: 0, level: '', description: '' }
  },
  overallType: {
    name: '',
    title: '',
    coreFeatures: [],
    interpretation: '',
    prescription: ''
  }
});

const partnerResults = ref({
  dimensions: {
    A: { name: '情绪稳定性', score: 0, percentage: 0, level: '', description: '' },
    B: { name: '压力知觉水平', score: 0, percentage: 0, level: '', description: '' },
    C: { name: '精神内耗', score: 0, percentage: 0, level: '', description: '' },
    D: { name: '社交回避倾向', score: 0, percentage: 0, level: '', description: '' }
  },
  overallType: {
    name: '',
    title: '',
    coreFeatures: [],
    interpretation: '',
    prescription: ''
  }
});

// 合拍度
const compatibilityScore = computed(() => {
  let totalDiff = 0;
  const dimensions = ['A', 'B', 'C', 'D'];

  dimensions.forEach(dim => {
    const diff = Math.abs(myResults.value.dimensions[dim].percentage - partnerResults.value.dimensions[dim].percentage);
    totalDiff += diff;
  });

  const avgDiff = totalDiff / 4;
  const compatibility = Math.max(0, Math.round(100 - avgDiff));
  return compatibility;
});

// 合拍等级
const compatibilityLevel = computed(() => {
  const score = compatibilityScore.value;
  if (score >= 80) return { text: '天作之合', color: '#10b981', description: '你们简直是天生一对！情绪节奏高度一致，相处起来轻松自然。' };
  if (score >= 60) return { text: '相当合拍', color: '#6366F1', description: '你们的情绪模式很相似，相处起来很舒服。' };
  if (score >= 40) return { text: '需要磨合', color: '#f59e0b', description: '你们有差异，但可以通过沟通和理解来增进感情。' };
  return { text: '差异较大', color: '#ef4444', description: '你们的情绪模式差异较大，需要更多耐心和包容。' };
});

// 体质类型数据
const 体质Types = [
  {
    id: 1,
    name: '稳定松弛型',
    title: '人间清醒松弛家',
    coreFeatures: [
      '情绪稳，不容易被小事带偏',
      '压力感知低，心态比较平和',
      '内耗少，想得开、放得下'
    ],
    interpretation: '你属于难得的情绪稳定体质，不会被琐事牵着走，也很少深夜反复内耗。面对麻烦你更倾向 "解决就好"，而不是自我攻击。生活再忙，你也能找到属于自己的节奏。',
    prescription: '每天留 10 分钟纯放空，不刷手机、不胡思乱想，继续保持这份松弛。'
  },
  {
    id: 2,
    name: '温和敏感型',
    title: '细腻温柔敏感家',
    coreFeatures: [
      '情绪细腻，容易感知他人情绪',
      '轻度内耗，心软但不钻牛角尖',
      '有压力，但能自我调节'
    ],
    interpretation: '你很容易察觉到别人的情绪变化，也习惯照顾别人感受，偶尔会因此累到自己。你不是不够强大，只是太温柔。你会纠结，但不会一直陷在里面，自愈能力其实很强。',
    prescription: '允许自己 "不那么懂事"，不想回应的消息可以晚一点回。'
  },
  {
    id: 3,
    name: '高压紧绷型',
    title: '负重前行紧绷家',
    coreFeatures: [
      '压力感强，总觉得事情太多',
      '容易焦虑，习惯未雨绸缪',
      '对自己要求高，很难放松'
    ],
    interpretation: '你习惯把所有事情扛在身上，总担心不够好、来不及。你看似坚强，其实一直在紧绷状态。不是你不够厉害，是你对自己太苛刻。',
    prescription: '允许事情 "不够完美"，今天先放过自己一次。'
  },
  {
    id: 4,
    name: '深度内耗型',
    title: '深夜自动复盘家',
    coreFeatures: [
      '想得多、反复琢磨、容易自责',
      '一件小事能在心里演完一整部剧',
      '表面平静，内心戏超多'
    ],
    interpretation: '你最累的不是做事，而是 "心里打架"。别人早忘了的话，你还在反复回想；明明没做错什么，却总在自我怀疑。你不是脆弱，只是太在意、太认真。',
    prescription: '睡前对自己说："今天到此为止，剩下的明天再说。"'
  },
  {
    id: 5,
    name: '社交隐身体质',
    title: '社恐节能隐身家',
    coreFeatures: [
      '社交耗能极高，独处才能回血',
      '不爱热闹，喜欢安静、简单的关系',
      '能不社交就不社交，不是高冷是累'
    ],
    interpretation: '你不是不合群，只是更擅长和自己相处。社交对你来说更像工作，而独处才是休息。你朋友不多，但个个都很重要，你讨厌虚伪客套，只喜欢真诚舒服的关系。',
    prescription: '不想去的局可以直接拒绝，你的舒服比社交更重要。'
  },
  {
    id: 6,
    name: '快乐钝感体质',
    title: '快乐信号失联家',
    coreFeatures: [
      '很难真正开心，快乐阈值偏高',
      '对很多事提不起兴趣，容易麻木',
      '表面正常，内心常常没什么波澜'
    ],
    interpretation: '你不是不快乐，是太久没有好好被治愈了。生活的忙碌让你慢慢关闭了感受美好的开关，不是生活没意思，是你太累了。',
    prescription: '今天刻意找一件小事开心一下：吃点喜欢的、看一段搞笑视频、晒晒太阳。'
  }
];

// 生成体质类型
const generateOverallType = (scores) => {
  // 计算各维度的百分比
  const percentages = {};
  for (const dim in scores) {
    percentages[dim] = Math.round(((scores[dim] - 5) / 20) * 100);
  }

  // 体质类型判定逻辑
  let selectedType = 1; // 默认稳定松弛型

  // 深度内耗型 (C维度很高)
  if (percentages.C >= 70) {
    selectedType = 4;
  }
  // 高压紧绷型 (B维度很高)
  else if (percentages.B >= 70) {
    selectedType = 3;
  }
  // 社交隐身体质 (D维度很高)
  else if (percentages.D >= 70) {
    selectedType = 5;
  }
  // 温和敏感型 (A维度中等，其他维度也中等)
  else if (percentages.A >= 40 && percentages.A < 70 &&
    percentages.B < 70 && percentages.C < 70 && percentages.D < 70) {
    selectedType = 2;
  }
  // 快乐钝感体质 (各维度都偏低，特别是A维度)
  else if (percentages.A < 30 && percentages.B < 30 &&
    percentages.C < 30 && percentages.D < 50) {
    selectedType = 6;
  }

  // 设置结果
  return 体质Types[selectedType - 1];
};

// 解析结果
const parseResults = () => {
  try {
    const myAnswers = JSON.parse(route.query.answers);
    const partnerScores = JSON.parse(route.query.partner);

    // 计算我的结果
    let myScores = { A: 0, B: 0, C: 0, D: 0 };
    for (let i = 1; i <= 20; i++) {
      const dimension = String.fromCharCode(65 + Math.floor((i - 1) / 5));
      myScores[dimension] += myAnswers[i] || 3;
    }

    // 计算我的百分比和等级
    for (const dim in myScores) {
      const totalScore = myScores[dim];
      myResults.value.dimensions[dim].score = totalScore;
      myResults.value.dimensions[dim].percentage = Math.round(((totalScore - 5) / 20) * 100);

      // 确定等级
      const percentage = myResults.value.dimensions[dim].percentage;
      if (percentage < 30) {
        myResults.value.dimensions[dim].level = '低';
      } else if (percentage < 70) {
        myResults.value.dimensions[dim].level = '中';
      } else {
        myResults.value.dimensions[dim].level = '高';
      }
    }

    // 生成我的体质类型
    const myType = generateOverallType(myScores);
    myResults.value.overallType = {
      name: myType.name,
      title: myType.title,
      coreFeatures: myType.coreFeatures,
      interpretation: myType.interpretation,
      prescription: myType.prescription
    };

    // 计算伙伴的结果
    let partnerScoresCalc = { A: 0, B: 0, C: 0, D: 0 };
    for (const dim in partnerScores) {
      partnerScoresCalc[dim] = partnerScores[dim];
    }

    for (const dim in partnerScoresCalc) {
      const totalScore = partnerScoresCalc[dim];
      partnerResults.value.dimensions[dim].score = totalScore;
      partnerResults.value.dimensions[dim].percentage = Math.round(((totalScore - 5) / 20) * 100);

      // 确定等级
      const percentage = partnerResults.value.dimensions[dim].percentage;
      if (percentage < 30) {
        partnerResults.value.dimensions[dim].level = '低';
      } else if (percentage < 70) {
        partnerResults.value.dimensions[dim].level = '中';
      } else {
        partnerResults.value.dimensions[dim].level = '高';
      }
    }

    // 生成伙伴的体质类型
    const partnerType = generateOverallType(partnerScoresCalc);
    partnerResults.value.overallType = {
      name: partnerType.name,
      title: partnerType.title,
      coreFeatures: partnerType.coreFeatures,
      interpretation: partnerType.interpretation,
      prescription: partnerType.prescription
    };

    // 调用阿里百炼API生成AI解读
    generateAIInterpretation();
  } catch (error) {
    console.error('解析结果失败:', error);
    router.push('/');
  }
};

// 生成AI解读
const generateAIInterpretation = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    // 准备提示信息
    const prompt = `你是一名专业且懂年轻人的心理科普师，基于以下两个人的情绪体质测试结果，生成一份《双人情绪合拍报告》。

我的结果：
体质类型：${myResults.value.overallType.title}
情绪稳定性指数：${myResults.value.dimensions.A.percentage}%
压力知觉指数：${myResults.value.dimensions.B.percentage}%
精神内耗指数：${myResults.value.dimensions.C.percentage}%
社交回避指数：${myResults.value.dimensions.D.percentage}%

TA的结果：
体质类型：${partnerResults.value.overallType.title}
情绪稳定性指数：${partnerResults.value.dimensions.A.percentage}%
压力知觉指数：${partnerResults.value.dimensions.B.percentage}%
精神内耗指数：${partnerResults.value.dimensions.C.percentage}%
社交回避指数：${partnerResults.value.dimensions.D.percentage}%

合拍度：${compatibilityScore.value}%

输出要求：
1. 一段150字左右幽默又温柔的双人关系解读，不鸡汤、不玄学、不贩卖焦虑
2. 3条简短的相处建议，针对两人的情绪模式差异
3. 一句可执行、治愈的"双人情绪处方"
4. 整体风格：网感、简洁、自嘲但温暖，无专业术语

禁止出现：心理疾病、诊断、治疗、病症等词汇，只做情绪状态描述。

重要：请严格按照以下JSON格式返回，不要添加任何其他内容：
{
  "interpretation": "双人关系解读内容",
  "suggestions": [
    "建议1",
    "建议2",
    "建议3"
  ],
  "prescription": "双人情绪处方内容"
}`;

    // 调用阿里百炼API
    const aiResponse = await chat(prompt);

    // 解析AI返回的内容
    if (aiResponse) {
      try {
        // 尝试解析JSON格式
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const parsedData = JSON.parse(jsonStr);

          // 验证并设置解读
          if (parsedData.interpretation && parsedData.interpretation.length > 10) {
            compatibilityInterpretation.value = parsedData.interpretation;
          } else {
            const randomIndex = Math.floor(Math.random() * defaultInterpretations.length);
            compatibilityInterpretation.value = defaultInterpretations[randomIndex];
          }

          // 验证并设置建议
          if (parsedData.suggestions && Array.isArray(parsedData.suggestions) && parsedData.suggestions.length >= 2) {
            compatibilitySuggestions.value = parsedData.suggestions.slice(0, 3);
          } else {
            compatibilitySuggestions.value = defaultSuggestions;
          }

          // 验证并设置处方
          if (parsedData.prescription && parsedData.prescription.length > 5) {
            compatibilityPrescription.value = parsedData.prescription;
          } else {
            compatibilityPrescription.value = defaultPrescription;
          }
        } else {
          // 没有匹配到JSON，使用默认内容
          const randomIndex = Math.floor(Math.random() * defaultInterpretations.length);
          compatibilityInterpretation.value = defaultInterpretations[randomIndex];
          compatibilitySuggestions.value = defaultSuggestions;
          compatibilityPrescription.value = defaultPrescription;
        }
      } catch (parseError) {
        console.error('解析AI响应失败:', parseError);
        // 解析失败时，使用默认内容
        const randomIndex = Math.floor(Math.random() * defaultInterpretations.length);
        compatibilityInterpretation.value = defaultInterpretations[randomIndex];
        compatibilitySuggestions.value = defaultSuggestions;
        compatibilityPrescription.value = defaultPrescription;
      }
    } else {
      // AI 没有返回内容，使用默认内容
      const randomIndex = Math.floor(Math.random() * defaultInterpretations.length);
      compatibilityInterpretation.value = defaultInterpretations[randomIndex];
      compatibilitySuggestions.value = defaultSuggestions;
      compatibilityPrescription.value = defaultPrescription;
    }
  } catch (error) {
    console.error('AI解读生成失败:', error);
    errorMessage.value = 'AI解读生成失败，使用默认解读';
    // 使用默认内容
    const randomIndex = Math.floor(Math.random() * defaultInterpretations.length);
    compatibilityInterpretation.value = defaultInterpretations[randomIndex];
    compatibilitySuggestions.value = defaultSuggestions;
    compatibilityPrescription.value = defaultPrescription;
  } finally {
    isLoading.value = false;
  }
};

// 双人关系AI解读
const compatibilityInterpretation = ref('');
const compatibilitySuggestions = ref([]);
const compatibilityPrescription = ref('');

// 默认解读内容
const defaultInterpretations = [
  '你们两个简直是情绪界的"互补型CP"！一个像稳重的山，一个像灵动的水，看似不同，却能相互滋养。你们的差异不是阻碍，而是让关系更有趣的调味剂。',
  '你们的情绪模式像是"镜像组合"，你有的特点TA刚好也有，你们很容易理解对方的感受。这种默契是很多人羡慕不来的。',
  '你们一个偏理性，一个偏感性，这种搭配其实挺妙的。理性的一方可以给感性的一方安全感，感性的一方可以让理性的一方更柔软。'
];

const defaultSuggestions = [
  '当对方情绪低落时，不要急着给建议，先给一个拥抱或者安静的陪伴',
  '每周安排一次"情绪交流时间"，分享这周的心情起伏',
  '尊重彼此不同的情绪处理方式，没有对错，只有不同'
];

const defaultPrescription = '今天一起做个小事：分享一件这周让你开心的小事，也听听对方的。';

// 分享报告（生成图片）
const shareReport = () => {
  // 跳转到双人海报生成页面
  router.push({
    path: '/compare-poster',
    query: {
      myResults: JSON.stringify(myResults.value),
      partnerResults: JSON.stringify(partnerResults.value),
      compatibilityScore: compatibilityScore.value,
      compatibilityInterpretation: compatibilityInterpretation.value,
      compatibilitySuggestions: JSON.stringify(compatibilitySuggestions.value),
      compatibilityPrescription: compatibilityPrescription.value
    }
  });
};

// 返回首页
const goToHome = () => {
  router.push('/');
};

// 重新测试
const retakeTest = () => {
  router.push('/answer');
};

onMounted(() => {
  parseResults();
});
</script>

<template>
  <div class="result-page">
    <!-- 整体加载状态 -->
    <div v-if="isLoading" class="full-loading-state">
      <div class="loading-animation">
        <div class="loader"></div>
      </div>
      <div class="loading-text">
        AI 正在生成你们的专属报告
      </div>
    </div>

    <!-- 报告内容 -->
    <template v-else>
      <!-- 模块 1：报告头部 -->
      <div class="report-header">
        <h1 class="report-title">双人情绪合拍报告</h1>
        <div class="constitution-name" :style="{ color: compatibilityLevel.color }">
          {{ compatibilityLevel.text }} | {{ compatibilityScore }}%
        </div>
      </div>

      <!-- 模块 2：合拍度信息 -->
      <div class="compatibility-info-card">
        <p class="compatibility-description">{{ compatibilityLevel.description }}</p>
      </div>

      <!-- 模块 3：个人体质信息 -->
      <div class="personal-info">
        <div class="info-card my-info">
          <h2 class="section-title">我的体质</h2>
          <div class="constitution-title">{{ myResults.overallType.title }}</div>
          <div class="features-list">
            <div v-for="(feature, index) in myResults.overallType.coreFeatures" :key="index" class="feature-item">
              <div class="feature-icon">•</div>
              <div class="feature-text">{{ feature }}</div>
            </div>
          </div>
        </div>
        <div class="info-card partner-info">
          <h2 class="section-title">TA的体质</h2>
          <div class="constitution-title">{{ partnerResults.overallType.title }}</div>
          <div class="features-list">
            <div v-for="(feature, index) in partnerResults.overallType.coreFeatures" :key="index" class="feature-item">
              <div class="feature-icon">•</div>
              <div class="feature-text">{{ feature }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模块 4：五项指数条形图 -->
      <div class="indices-section">
        <h2 class="section-title">情绪指数对比</h2>
        <div class="indices-list">
          <div v-for="(dim, key) in myResults.dimensions" :key="key" class="index-item">
            <div class="index-label">{{ dim.name }}指数</div>
            <div class="comparison-bars">
              <div class="bar-group">
                <div class="bar-label">我</div>
                <div class="bar-container">
                  <div class="bar-fill my-bar" :style="{ width: dim.percentage + '%' }"></div>
                </div>
                <div class="bar-value">{{ dim.percentage }}%</div>
              </div>
              <div class="bar-group">
                <div class="bar-label">TA</div>
                <div class="bar-container">
                  <div class="bar-fill partner-bar" :style="{ width: partnerResults.dimensions[key].percentage + '%' }">
                  </div>
                </div>
                <div class="bar-value">{{ partnerResults.dimensions[key].percentage }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模块 5：AI 解读文案区 -->
      <div class="interpretation-card">
        <h2 class="section-title">AI 解读</h2>
        <div v-if="errorMessage" class="error-state">
          <p class="error-text">{{ errorMessage }}</p>
          <p class="interpretation-text">{{ compatibilityInterpretation }}</p>
        </div>
        <div v-else>
          <p class="interpretation-text">{{ compatibilityInterpretation }}</p>
        </div>
      </div>

      <!-- 模块 6：相处建议 -->
      <div class="suggestions-card">
        <h2 class="section-title">相处建议</h2>
        <div class="suggestions-list">
          <div v-for="(suggestion, index) in compatibilitySuggestions" :key="index" class="suggestion-item">
            <div class="suggestion-icon">{{ index + 1 }}</div>
            <div class="suggestion-text">{{ suggestion }}</div>
          </div>
        </div>
      </div>

      <!-- 模块 7：情绪处方模块 -->
      <div class="prescription-card">
        <h2 class="section-title">双人情绪处方</h2>
        <div class="prescription-content">{{ compatibilityPrescription }}</div>
      </div>

      <!-- 模块 8：操作按钮区 -->
      <div class="action-buttons">
        <button class="action-button share-button" @click="shareReport">分享报告</button>
        <button class="action-button retake-button" @click="retakeTest">我也测一测</button>
        <button class="action-button home-button" @click="goToHome">返回首页</button>
      </div>

      <!-- 模块 9：底部引流文案 -->
      <div class="bottom-copy">
        <p class="copy-text">测测你们合拍吗 →</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.result-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 30px;
  background-color: #f9fafb;
}

/* 模块 1：报告头部 */
.report-header {
  text-align: center;
  width: 100%;
  max-width: 800px;
}

.report-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px 0;
}

.constitution-name {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

/* 模块 2：合拍度信息 */
.compatibility-info-card {
  width: 100%;
  max-width: 800px;
  background-color: #f3f4ff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.compatibility-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
  margin: 0;
}

/* 模块 3：个人体质信息 */
.personal-info {
  width: 100%;
  max-width: 800px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-card {
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.constitution-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366F1;
  margin: 12px 0 20px 0;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.feature-icon {
  font-size: 1.2rem;
  font-weight: bold;
  color: #6366F1;
  margin-top: 2px;
}

.feature-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #6b7280;
}

/* 模块 4：五项指数条形图 */
.indices-section {
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.indices-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.index-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.index-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #6b7280;
}

.comparison-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 40px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
}

.bar-container {
  flex: 1;
  height: 24px;
  background-color: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s ease;
}

.my-bar {
  background-color: #6366F1;
}

.partner-bar {
  background-color: #10b981;
}

.bar-value {
  width: 60px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  text-align: right;
}

/* 模块 5：AI 解读文案区 */
.interpretation-card {
  width: 100%;
  max-width: 800px;
  background-color: #f3f4ff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.interpretation-text {
  font-size: 1rem;
  line-height: 1.7;
  color: #333;
  margin: 0;
}

/* 模块 6：相处建议 */
.suggestions-card {
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.suggestion-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #6366F1;
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.suggestion-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #6b7280;
  flex: 1;
}

/* 模块 7：情绪处方模块 */
.prescription-card {
  width: 100%;
  max-width: 800px;
  background-color: #6366F1;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
  text-align: center;
}

.prescription-card .section-title {
  color: white;
  margin-bottom: 16px;
}

.prescription-content {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  line-height: 1.5;
}

/* 模块 8：操作按钮区 */
.action-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 800px;
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

.retake-button {
  background-color: #6366F1;
  color: white;
}

.retake-button:hover {
  background-color: #4f46e5;
  transform: translateY(-2px);
}

.share-button {
  background-color: #10B981;
  color: white;
}

.share-button:hover {
  background-color: #059669;
  transform: translateY(-2px);
}

.retake-button {
  background-color: #6366F1;
  color: white;
}

.retake-button:hover {
  background-color: #4f46e5;
  transform: translateY(-2px);
}

.home-button {
  background-color: white;
  color: #6366F1;
  border: 2px solid #6366F1;
}

.home-button:hover {
  background-color: #f3f4f6;
  transform: translateY(-2px);
}

/* 模块 9：底部引流文案 */
.bottom-copy {
  margin-top: 20px;
  margin-bottom: 40px;
}

.copy-text {
  font-size: 1rem;
  color: #6b7280;
  text-align: center;
  margin: 0;
  cursor: pointer;
  transition: color 0.2s;
}

.copy-text:hover {
  color: #6366F1;
}

/* 整体加载状态 */
.full-loading-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  gap: 24px;
  padding: 20px;
  width: 100%;
}

.loading-animation {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader {
  width: 60px;
  height: 60px;
  border: 6px solid #f3f4ff;
  border-top: 6px solid #6366F1;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1rem;
  color: #6b7280;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

/* 局部加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4ff;
  border-top: 4px solid #6366F1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-state p {
  color: #6b7280;
  margin: 0;
}

/* 错误状态 */
.error-state {
  gap: 12px;
}

.error-text {
  font-size: 0.9rem;
  color: #ef4444;
  margin: 0 0 12px 0;
}

/* 通用样式 */
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .personal-info {
    grid-template-columns: 1fr;
  }

  .report-title {
    font-size: 1.8rem;
  }

  .constitution-name {
    font-size: 2rem;
  }

  .compatibility-description {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .result-page {
    padding: 15px;
    gap: 20px;
  }

  .report-title {
    font-size: 1.4rem;
  }

  .constitution-name {
    font-size: 1.6rem;
  }

  .info-card {
    padding: 20px;
  }

  .indices-section {
    padding: 20px;
  }

  .bar-label {
    width: 35px;
    font-size: 0.8rem;
  }

  .bar-value {
    width: 50px;
    font-size: 0.8rem;
  }

  .action-button {
    padding: 14px;
    font-size: 0.9rem;
  }
}
</style>