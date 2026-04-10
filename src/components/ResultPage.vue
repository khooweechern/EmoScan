<script setup>
import { ref, computed, onMounted, onActivated } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { chat } from '../utils/bailian';
import { generateShareUrl } from '../utils/scoreEncoder';

defineOptions({
  name: 'ResultPage'
});

const route = useRoute();
const router = useRouter();

// 加载状态
const isLoading = ref(true);
const errorMessage = ref('');

// 结果数据
const results = ref({
  dimensions: {
    A: {
      name: '情绪稳定性',
      score: 0,
      percentage: 0,
      level: '',
      description: ''
    },
    B: {
      name: '压力知觉水平',
      score: 0,
      percentage: 0,
      level: '',
      description: ''
    },
    C: {
      name: '精神内耗',
      score: 0,
      percentage: 0,
      level: '',
      description: ''
    },
    D: {
      name: '社交回避倾向',
      score: 0,
      percentage: 0,
      level: '',
      description: ''
    }
  },
  overallType: {
    name: '',
    description: ''
  }
});

// 计算总得分
const totalScore = computed(() => {
  return Object.values(results.value.dimensions).reduce((sum, dim) => sum + dim.score, 0);
});

// 解析结果
const parseResults = () => {
  // 从路由参数中获取答案
  let userAnswers = {};
  if (route.query.answers) {
    try {
      userAnswers = JSON.parse(route.query.answers);
    } catch (e) {
      console.error('解析答案失败:', e);
      // 如果解析失败，使用模拟数据
      userAnswers = {
        1: 3, 2: 4, 3: 3, 4: 4, 5: 3,
        6: 4, 7: 3, 8: 4, 9: 3, 10: 4,
        11: 4, 12: 3, 13: 4, 14: 3, 15: 4,
        16: 3, 17: 4, 18: 3, 19: 2, 20: 3
      };
    }
  } else {
    // 如果没有传递答案，使用模拟数据
    userAnswers = {
      1: 3, 2: 4, 3: 3, 4: 4, 5: 3,
      6: 4, 7: 3, 8: 4, 9: 3, 10: 4,
      11: 4, 12: 3, 13: 4, 14: 3, 15: 4,
      16: 3, 17: 4, 18: 3, 19: 2, 20: 3
    };
  }

  // 计算各维度得分
  let scores = { A: 0, B: 0, C: 0, D: 0 };

  for (let i = 1; i <= 20; i++) {
    const dimension = String.fromCharCode(65 + Math.floor((i - 1) / 5)); // A, B, C, D
    scores[dimension] += userAnswers[i] || 3; // 如果没有答案，默认值为3
  }

  // 计算百分比和等级
  for (const dim in scores) {
    const totalScore = scores[dim];
    results.value.dimensions[dim].score = totalScore;
    // 计算百分比：(总分 - 5) / 20 × 100%
    results.value.dimensions[dim].percentage = Math.round(((totalScore - 5) / 20) * 100);

    // 确定等级
    const percentage = results.value.dimensions[dim].percentage;
    if (percentage < 30) {
      results.value.dimensions[dim].level = '低';
    } else if (percentage < 70) {
      results.value.dimensions[dim].level = '中';
    } else {
      results.value.dimensions[dim].level = '高';
    }

    // 添加描述
    switch (dim) {
      case 'A':
        if (percentage < 30) {
          results.value.dimensions[dim].description = '你情绪稳定，能够很好地应对生活中的变化和挑战。';
        } else if (percentage < 70) {
          results.value.dimensions[dim].description = '你情绪基本稳定，但在压力下可能会有波动。';
        } else {
          results.value.dimensions[dim].description = '你情绪波动较大，容易受到外界影响，需要注意情绪管理。';
        }
        break;
      case 'B':
        if (percentage < 30) {
          results.value.dimensions[dim].description = '你压力知觉水平低，能够轻松应对生活中的各种任务。';
        } else if (percentage < 70) {
          results.value.dimensions[dim].description = '你有一定的压力感，但仍在可承受范围内。';
        } else {
          results.value.dimensions[dim].description = '你压力知觉水平较高，可能需要采取措施缓解压力。';
        }
        break;
      case 'C':
        if (percentage < 30) {
          results.value.dimensions[dim].description = '你精神内耗较少，能够较快地从负面情绪中走出来。';
        } else if (percentage < 70) {
          results.value.dimensions[dim].description = '你有一定的反刍思维，但不会过度影响日常生活。';
        } else {
          results.value.dimensions[dim].description = '你精神内耗较多，容易陷入负面思维循环，需要注意调整。';
        }
        break;
      case 'D':
        if (percentage < 30) {
          results.value.dimensions[dim].description = '你社交倾向较高，喜欢与人交往，社交对你来说是一种能量来源。';
        } else if (percentage < 70) {
          results.value.dimensions[dim].description = '你对社交有一定的选择性，既享受社交也需要独处。';
        } else {
          results.value.dimensions[dim].description = '你社交回避倾向较高，更倾向于独处，社交对你来说可能是一种负担。';
        }
        break;
    }
  }

  // 生成综合类型
  generateOverallType(scores);

  // 调用阿里百炼API生成AI解读
  generateAIInterpretation(scores);
};

// 生成AI解读
const generateAIInterpretation = async (scores) => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    // 准备提示信息
    const prompt = `你是一名专业且懂年轻人的心理科普师，基于以下5个维度的百分比结果，生成一份《当代青年情绪体质报告单》。

维度：
1. 情绪稳定性指数：${results.value.dimensions.A.percentage}%
2. 压力知觉指数：${results.value.dimensions.B.percentage}%
3. 精神内耗指数：${results.value.dimensions.C.percentage}%
4. 社交回避指数：${results.value.dimensions.D.percentage}%
5. 快乐感知指数：${100 - Math.round((results.value.dimensions.A.percentage + results.value.dimensions.B.percentage + results.value.dimensions.C.percentage) / 3)}%（根据其他维度计算得出）

请从以下6大情绪体质类型中选择最符合的一种：
1. 稳定松弛型（人间清醒松弛家）
2. 温和敏感型（细腻温柔敏感家）
3. 高压紧绷型（负重前行紧绷家）
4. 深度内耗型（深夜自动复盘家）
5. 社交隐身体质（社恐节能隐身家）
6. 快乐钝感体质（快乐信号失联家）

输出要求：
1. 体质名称：直接使用上面6种类型中的一个，格式为"体质名称：XX型（XX家）"
2. 列出3条简短扎心的核心特点
3. 一段100字左右幽默又温柔的解读，不鸡汤、不玄学、不贩卖焦虑
4. 一句可执行、治愈的"情绪处方"
5. 整体风格：网感、简洁、自嘲但温暖，无专业术语

禁止出现：心理疾病、诊断、治疗、病症等词汇，只做情绪状态描述。`;

    // 调用阿里百炼API
    const aiResponse = await chat(prompt);

    // 解析AI返回的内容并更新结果
    if (aiResponse) {
      try {
        // 解析体质名称
        const nameMatch = aiResponse.match(/体质名称：(.*?)(?=\n|$)/);
        if (nameMatch && nameMatch[1]) {
          results.value.overallType.title = nameMatch[1].trim();
        }

        // 解析核心特点
        const featuresMatch = aiResponse.match(/核心特点：[\s\S]*?(?=解读：|情绪处方：|$)/);
        if (featuresMatch) {
          const featuresText = featuresMatch[0];
          const features = featuresText
            .split('\n')
            .filter(line => line.trim() && !line.includes('核心特点：'))
            .map(line => line.trim().replace(/^[\d.、-]+/, '').trim())
            .slice(0, 3);
          if (features.length > 0) {
            results.value.overallType.coreFeatures = features;
          }
        }

        // 解析解读
        const interpretationMatch = aiResponse.match(/解读：[\s\S]*?(?=情绪处方：|$)/);
        if (interpretationMatch) {
          const interpretation = interpretationMatch[0]
            .replace('解读：', '')
            .trim();
          results.value.overallType.interpretation = interpretation;
        }

        // 解析情绪处方
        const prescriptionMatch = aiResponse.match(/情绪处方：[\s\S]*/);
        if (prescriptionMatch) {
          const prescription = prescriptionMatch[0]
            .replace('情绪处方：', '')
            .trim();
          results.value.overallType.prescription = prescription;
        }
      } catch (parseError) {
        console.error('解析AI响应失败:', parseError);
        // 解析失败时，将整个响应作为解读
        results.value.overallType.interpretation = aiResponse;
      }
    }
  } catch (error) {
    console.error('AI解读生成失败:', error);
    errorMessage.value = 'AI解读生成失败，使用默认解读';
    // 保留默认解读，不做修改
  } finally {
    isLoading.value = false;
  }
};

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

// 生成综合类型
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
  const type = 体质Types[selectedType - 1];
  results.value.overallType = {
    name: type.name,
    title: type.title,
    coreFeatures: type.coreFeatures,
    interpretation: type.interpretation,
    prescription: type.prescription
  };
};

// 返回首页
const goToHome = () => {
  router.push('/');
};

// 重新测试
const retakeTest = () => {
  router.push('/answer');
};

// 保存海报
const savePoster = () => {
  router.push({
    path: '/share',
    query: { results: JSON.stringify(results.value) }
  });
};

// 邀请好友测试
const inviteFriend = () => {
  const scores = {
    A: results.value.dimensions.A.score,
    B: results.value.dimensions.B.score,
    C: results.value.dimensions.C.score,
    D: results.value.dimensions.D.score
  };
  const shareUrl = generateShareUrl(scores);

  // 手机端兼容性处理
  if (navigator.share) {
    // 现代浏览器原生分享
    navigator.share({
      title: '测测你们合拍吗',
      text: '我已经完成了情绪体质测试，快来测测我们合拍吗！',
      url: shareUrl
    }).catch((error) => {
      console.log('分享失败:', error);
      // 分享失败时回退到复制链接
      copyShareUrl(shareUrl);
    });
  } else {
    // 不支持原生分享的浏览器，使用复制链接
    copyShareUrl(shareUrl);
  }
};

// 复制分享链接
const copyShareUrl = (url) => {
  // 尝试使用 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(() => {
      alert('链接已复制到剪贴板，快发给好友吧！');
    }).catch(() => {
      // 降级方案：使用 prompt
      fallbackCopyTextToClipboard(url);
    });
  } else {
    // 不支持 Clipboard API 的情况
    fallbackCopyTextToClipboard(url);
  }
};

// 复制链接的降级方案
const fallbackCopyTextToClipboard = (text) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      alert('链接已复制到剪贴板，快发给好友吧！');
    } else {
      // 再次降级到 prompt
      prompt('复制失败，请手动复制以下链接：', text);
    }
  } catch (err) {
    console.error('复制失败:', err);
    prompt('复制失败，请手动复制以下链接：', text);
  } finally {
    document.body.removeChild(textArea);
  }
};

// 组件激活时检查是否有新的测试结果
const handleActivated = () => {
  // 检查路由参数是否有变化
  if (route.query.answers) {
    // 如果有新的答案参数，重新解析结果
    parseResults();
  }
};

onMounted(() => {
  parseResults();
});

// 监听组件激活生命周期
onActivated(handleActivated);
</script>

<template>
  <div class="result-page">
    <!-- 整体加载状态 -->
    <div v-if="isLoading" class="full-loading-state">
      <div class="loading-animation">
        <div class="loader"></div>
      </div>
      <div class="loading-text">
        AI 正在生成你的专属报告
      </div>
    </div>

    <!-- 报告内容 -->
    <template v-else>
      <!-- 模块 1：报告头部 -->
      <div class="report-header">
        <h1 class="report-title">你的情绪体质报告</h1>
        <div class="constitution-name">{{ results.overallType.title }}</div>
      </div>

      <!-- 模块 2：五项指数条形图 -->
      <div class="indices-section">
        <h2 class="section-title">情绪指数</h2>
        <div class="indices-list">
          <div v-for="(dim, key) in results.dimensions" :key="key" class="index-item">
            <div class="index-label">{{ dim.name }}指数</div>
            <div class="index-value">{{ dim.percentage }}%</div>
            <div class="index-bar">
              <div class="index-bar-fill" :style="{ width: dim.percentage + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模块 3：核心特点卡片 -->
      <div class="core-features-card">
        <h2 class="section-title">核心特点</h2>
        <div class="features-list">
          <div v-for="(feature, index) in results.overallType.coreFeatures" :key="index" class="feature-item">
            <div class="feature-icon">•</div>
            <div class="feature-text">{{ feature }}</div>
          </div>
        </div>
      </div>

      <!-- 模块 4：AI 解读文案区 -->
      <div class="interpretation-card">
        <h2 class="section-title">AI 解读</h2>
        <div v-if="errorMessage" class="error-state">
          <p class="error-text">{{ errorMessage }}</p>
          <p class="interpretation-text">{{ results.overallType.interpretation }}</p>
        </div>
        <div v-else>
          <p class="interpretation-text">{{ results.overallType.interpretation }}</p>
        </div>
      </div>

      <!-- 模块 5：情绪处方模块 -->
      <div class="prescription-card">
        <h2 class="section-title">你的专属情绪处方</h2>
        <div class="prescription-content">{{ results.overallType.prescription }}</div>
      </div>

      <!-- 模块 6：操作按钮区 -->
      <div class="action-buttons">
        <button class="action-button save-button" @click="savePoster">保存海报</button>
        <button class="action-button share-button" @click="inviteFriend">测测你们合拍吗</button>
        <button class="action-button retake-button" @click="retakeTest">再测一次</button>
      </div>

      <!-- 模块 7：底部引流文案 -->
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
  color: #6366F1;
  margin: 0;
  text-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

/* 模块 2：五项指数条形图 */
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
  gap: 16px;
}

.index-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.index-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #6b7280;
  display: flex;
  justify-content: space-between;
}

.index-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.index-bar {
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.index-bar-fill {
  height: 100%;
  background-color: #6366F1;
  transition: width 0.3s ease;
}

/* 模块 3：核心特点卡片 */
.core-features-card {
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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

/* 模块 4：AI 解读文案区 */
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

/* 模块 5：情绪处方模块 */
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

/* 模块 6：操作按钮区 */
.action-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 800px;
  justify-content: center;
}

.action-button {
  flex: 1;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  background-color: white;
  color: #333;
  text-align: center;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.save-button {
  color: #6366F1;
  border-color: #6366F1;
}

.share-button {
  color: #10b981;
  border-color: #10b981;
}

.retake-button {
  color: #f59e0b;
  border-color: #f59e0b;
}

/* 模块 7：底部引流文案 */
.bottom-copy {
  margin-top: 20px;
  margin-bottom: 40px;
}

.copy-text {
  font-size: 0.9rem;
  color: #9ca3af;
  text-align: center;
  margin: 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.copy-text:hover {
  color: #6366F1;
}

/* 通用样式 */
.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .result-page {
    padding: 15px;
    gap: 20px;
  }

  .report-title {
    font-size: 1.8rem;
  }

  .constitution-name {
    font-size: 2rem;
  }

  .indices-section,
  .core-features-card,
  .interpretation-card,
  .prescription-card {
    padding: 20px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .action-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .constitution-name {
    font-size: 1.8rem;
  }

  .report-title {
    font-size: 1.6rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .prescription-content {
    font-size: 1rem;
  }
}
</style>