/**
 * 腾讯云混元 API 封装
 * 文档：https://cloud.tencent.com/document/product/1729/111007
 */

// API 配置
const CONFIG = {
  // API Key (从腾讯云控制台获取)
  apiKey: 'sk-ZmOLzo9CI4ysNmmYmMCXTuxrwaBzcJnZYVpzx2iFTwgGBpmA',
  // 模型名称
  model: 'hunyuan-lite',
  // API 端点（开发环境使用代理，生产环境使用实际地址）
  baseURL: process.env.NODE_ENV === 'development' 
    ? '/tencent-api/v1' 
    : 'https://api.hunyuan.cloud.tencent.com/v1'
};

/**
 * 处理 SSE 事件
 */
function processSSEEvent(event, onChunk, onComplete) {
  const lines = event.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine || !trimmedLine.startsWith('data:')) {
      continue;
    }

    const data = trimmedLine.slice(5).trim();
    
    if (data === '[DONE]') {
      if (onComplete) onComplete();
      return;
    }

    try {
      const parsed = JSON.parse(data);
      
      if (parsed.choices && parsed.choices[0]?.delta?.content) {
        const content = parsed.choices[0].delta.content;
        if (onChunk) onChunk(content);
      }
    } catch (e) {
      console.warn('腾讯云 SSE 解析失败:', data);
    }
  }
}

/**
 * 流式调用腾讯云混元 API
 * @param {string} message - 用户消息
 * @param {Array} history - 历史对话记录
 * @param {Function} onChunk - 收到数据块的回调
 * @param {Function} onComplete - 完成的回调
 * @param {Function} onError - 错误的回调
 */
export async function streamChat(message, history = [], onChunk, onComplete, onError) {
  try {
    const messages = [
      {
        role: 'system',
        content: '你是一名专业的AI导游，具备丰富的旅游行业知识和人文地理素养。回答用户问题时需满足以下要求：1. 信息准确：所有景点、路线、民俗、历史等信息需真实可靠；2. 实用性强：优先提供行程规划、交通方式、饮食推荐、注意事项等实用内容；3. 语言友好：用通俗易懂、亲切自然的中文沟通，避免生硬的专业术语；4. 灵活适配：可根据用户需求调整回答深度，既能解答基础攻略问题，也能深入分析目的地的历史文化、地缘特色。'
      },
      ...history.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const url = `${CONFIG.baseURL}/chat/completions`;
    const requestBody = {
      model: CONFIG.model,
      messages: messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000
    };

    console.log('腾讯云请求:', { url, model: CONFIG.model, apiKey: CONFIG.apiKey ? '已设置' : '未设置' });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('腾讯云响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('腾讯云错误响应:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || errorData.error?.message || `HTTP ${response.status}`);
    }

    await processStreamResponse(response, processSSEEvent, onChunk, onComplete);

  } catch (error) {
    console.error('腾讯云 API 调用错误:', error);
    if (onError) onError(error.message || '网络请求失败');
  }
}

/**
 * 处理流式响应
 */
async function processStreamResponse(response, processor, onChunk, onComplete) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      if (buffer.trim()) {
        processor(buffer, onChunk, onComplete);
      }
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';

    for (const event of events) {
      processor(event, onChunk, onComplete);
    }
  }

  if (onComplete) onComplete();
}

/**
 * 非流式调用
 */
export async function chat(message, history = []) {
  try {
    const messages = [
      {
        role: 'system',
        content: '你是一名专业的AI导游，具备丰富的旅游行业知识和人文地理素养。'
      },
      ...history.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch(`${CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: CONFIG.model,
        messages: messages,
        stream: false,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';

  } catch (error) {
    console.error('腾讯云 API 调用错误:', error);
    throw error;
  }
}

/**
 * 设置 API Key
 */
export function setApiKey(key) {
  CONFIG.apiKey = key;
}

/**
 * 设置模型
 */
export function setModel(model) {
  CONFIG.model = model;
}

/**
 * 获取当前配置
 */
export function getConfig() {
  return { ...CONFIG };
}

export default {
  streamChat,
  chat,
  setApiKey,
  setModel,
  getConfig
};
